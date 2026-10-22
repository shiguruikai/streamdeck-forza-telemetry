import { Buffer } from 'node:buffer';
import type { EventEmitter } from 'node:events';

import type { DialAction, KeyAction } from '@elgato/streamdeck';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { TelemetryAction } from '../src/actions/telemetry-action';
import { telemetryManager } from '../src/telemetry/manager';
import type { ForzaTelemetryData } from '../src/telemetry/parser';

type FakeServer = EventEmitter & { start: Mock; stop: Mock };

const { logger, servers } = vi.hoisted(() => ({
  logger: { trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  servers: [] as FakeServer[],
}));

vi.mock('@elgato/streamdeck', () => ({
  default: { logger: { createScope: () => logger } },
  // TelemetryAction の基底クラス。テストでは SDK の機能を使わないため、何もしないクラスで代用する。
  SingletonAction: Object,
}));

// UDP ソケットを開かないよう、TelemetryServer を差し替える。受信は `message` イベントを手で発火させて再現する。
vi.mock('../src/telemetry/server', async () => {
  const { EventEmitter } = await import('node:events');
  class TelemetryServer extends EventEmitter {
    public start = vi.fn();
    public stop = vi.fn();

    constructor() {
      super();
      servers.push(this);
    }
  }
  return { TelemetryServer };
});

/**
 * 描画処理で常に例外を発生させるテスト用アクション。
 */
class ThrowingAction extends TelemetryAction {
  public renderCount = 0;

  protected override onTelemetryData(): void {
    this.renderCount++;
    throw new Error('render failed');
  }
}

const fakeAction = { id: 'action-1', isDial: () => false };

/**
 * process.nextTick で予約された処理（リスナーの解除後のサーバー停止の判定）が終わるのを待ちます。
 */
function waitNextTick(): Promise<void> {
  return new Promise((resolve) => {
    process.nextTick(resolve);
  });
}

describe('TelemetryAction の描画処理の例外', () => {
  let instance: ThrowingAction;

  beforeEach(() => {
    logger.error.mockClear();
    instance = new ThrowingAction();
  });

  it('設定変更時に描画処理が例外を投げても、呼び出し元へ伝播させない', async () => {
    await expect(instance.onDidReceiveSettings({ action: fakeAction, payload: { settings: {} } } as never)).resolves.toBeUndefined();
    expect(instance.renderCount).toBe(1);
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  it('タイトル変更時に描画処理が例外を投げても、呼び出し元へ伝播させない', async () => {
    const ev = { action: fakeAction, payload: { title: '', titleParameters: { showTitle: false } } };
    await expect(instance.onTitleParametersDidChange(ev as never)).resolves.toBeUndefined();
    expect(instance.renderCount).toBe(1);
  });

  it('連続して例外が発生した場合、ログ出力を間引く', async () => {
    for (let i = 0; i < 5; i++) {
      await instance.onDidReceiveSettings({ action: fakeAction, payload: { settings: {} } } as never);
    }
    expect(instance.renderCount).toBe(5);
    expect(logger.error).toHaveBeenCalledTimes(1);
  });
});

describe('TelemetryAction の最新データとタイムアウト', () => {
  // 描画と警告の呼び出し順を記録する
  const log: string[] = [];

  /**
   * 描画したデータ（速度、未受信なら "--"）を記録するテスト用アクション。
   */
  class RecordingAction extends TelemetryAction {
    protected override onTelemetryData(action: DialAction | KeyAction, data?: ForzaTelemetryData): void {
      log.push(`draw ${action.id} ${data ? data.speed.toString() : '--'}`);
    }
  }

  function createFakeAction(id: string) {
    return {
      id,
      isDial: () => false,
      showAlert: () => {
        log.push(`alert ${id}`);
        return Promise.resolve();
      },
    };
  }

  function appear(instance: TelemetryAction, action: ReturnType<typeof createFakeAction>): Promise<void> {
    return instance.onWillAppear({ action, payload: { settings: {} } } as never);
  }

  function disappear(instance: TelemetryAction, action: ReturnType<typeof createFakeAction>): Promise<void> {
    return instance.onWillDisappear({ action, payload: { settings: {} } } as never);
  }

  function receive(speed: number): void {
    const buf = Buffer.alloc(324);
    buf.writeInt32LE(1, 0); // IsRaceOn
    buf.writeFloatLE(speed, 256); // Speed（m/s）
    servers[0].emit('message', buf, { address: '127.0.0.1', family: 'IPv4', port: 50000, size: buf.length });
  }

  const shown: [TelemetryAction, ReturnType<typeof createFakeAction>][] = [];

  beforeEach(() => {
    vi.useFakeTimers();
    log.length = 0;
    servers[0].stop.mockClear();
    telemetryManager.setUpdateInterval(100);
    telemetryManager.configure({ port: 24000, address: '127.0.0.1' });
  });

  afterEach(async () => {
    for (const [instance, action] of shown.splice(0)) {
      await disappear(instance, action);
    }
    await waitNextTick();
    vi.useRealTimers();
  });

  it('タイムアウトしたら、表示中のアクションを未受信の表示で再描画してから警告を表示する', async () => {
    const instance = new RecordingAction();
    const a = createFakeAction('a');
    shown.push([instance, a]);
    await appear(instance, a);

    vi.advanceTimersByTime(100);
    receive(10);
    expect(log).toEqual(['draw a --', 'draw a 10']);

    log.length = 0;
    vi.advanceTimersByTime(3000);
    expect(log).toEqual(['draw a --', 'alert a']);
  });

  it('同じ tick 内でページが切り替わった場合、サーバーを止めず、別のアクションが受信した最新のデータで描画を続ける', async () => {
    // Stream Deck からのイベントと同じくマクロタスク（setImmediate）から呼び出すため、実際のタイマーを使う
    vi.useRealTimers();
    const instance1 = new RecordingAction();
    const instance2 = new RecordingAction();
    const a = createFakeAction('a');
    const b = createFakeAction('b');
    await appear(instance1, a);
    receive(10);

    // a が消え、別の種類のアクション b が表示される
    shown.push([instance2, b]);
    await new Promise<void>((resolve) => {
      setImmediate(() => {
        void disappear(instance1, a);
        void appear(instance2, b);
        resolve();
      });
    });
    await new Promise(setImmediate);

    // 続けて届くイベント（タイトルの変更など）の再描画でも、最新のデータを使う
    await instance2.onTitleParametersDidChange({ action: b, payload: { title: '', titleParameters: { showTitle: false } } } as never);

    expect(log.filter((entry) => entry.startsWith('draw b'))).toEqual(['draw b 10', 'draw b 10']);
    expect(servers[0].stop).not.toHaveBeenCalled();
  });
});
