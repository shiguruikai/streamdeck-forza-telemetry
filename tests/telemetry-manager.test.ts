import { Buffer } from 'node:buffer';
import type { EventEmitter } from 'node:events';

import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

type FakeServer = EventEmitter & { start: Mock; stop: Mock };

const { servers } = vi.hoisted(() => ({ servers: [] as FakeServer[] }));

vi.mock('@elgato/streamdeck', () => {
  const logger = { trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  return { default: { logger: { createScope: () => logger } } };
});

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

type Manager = typeof import('../src/telemetry/manager').telemetryManager;

/**
 * 走行中（IsRaceOn = 1）の Forza Horizon 形式のパケットを生成します。
 */
function racePacket(speed = 0): Buffer {
  const buf = Buffer.alloc(324);
  buf.writeInt32LE(1, 0);
  buf.writeFloatLE(speed, 256); // Speed（m/s）
  return buf;
}

/**
 * メニュー画面やポーズ中（IsRaceOn = 0）のパケットを生成します。TimestampMS 以外はすべて0です。
 */
function menuPacket(timestampMs: number): Buffer {
  const buf = Buffer.alloc(324);
  buf.writeUInt32LE(timestampMs, 4);
  return buf;
}

/**
 * process.nextTick で予約された処理（リスナーの解除後のサーバー停止の判定）が終わるのを待ちます。
 */
function waitNextTick(): Promise<void> {
  return new Promise((resolve) => {
    process.nextTick(resolve);
  });
}

describe('TelemetryManager', () => {
  let manager: Manager;
  let server: FakeServer;

  beforeEach(async () => {
    // シングルトンの状態をテストごとに初期化するため、モジュールを読み込み直す
    vi.resetModules();
    manager = (await import('../src/telemetry/manager')).telemetryManager;
    server = servers[servers.length - 1];
    manager.setUpdateInterval(100);
    manager.configure({ port: 24000, address: '127.0.0.1' });
  });

  afterEach(() => {
    manager.removeAllListeners();
    vi.useRealTimers();
  });

  function receive(msg: Buffer): void {
    server.emit('message', msg, { address: '127.0.0.1', family: 'IPv4', port: 50000, size: msg.length });
  }

  describe('IsRaceOn = 0 のパケット', () => {
    it('メニュー中のパケットは配信せず、走行中のパケットは配信する', () => {
      const onData = vi.fn();
      manager.on('data', onData);

      receive(menuPacket(1000));
      expect(onData).not.toHaveBeenCalled();

      // メニュー中のパケットで間引きの状態が更新されないため、直後の走行中のパケットは配信される
      receive(racePacket());
      expect(onData).toHaveBeenCalledTimes(1);
      expect(onData.mock.calls[0][0]).toMatchObject({ isRaceOn: 1 });
    });

    it('メニュー中のパケットだけが届き続けても、タイムアウトしない', () => {
      vi.useFakeTimers();
      const onTimeout = vi.fn();
      manager.on('timeout', onTimeout);
      manager.on('data', vi.fn());

      for (let i = 1; i <= 100; i++) {
        vi.advanceTimersByTime(100);
        receive(menuPacket(i * 100));
      }
      expect(onTimeout).not.toHaveBeenCalled();

      // パケットが途絶えたら、3秒後にタイムアウトする
      vi.advanceTimersByTime(3000);
      expect(onTimeout).toHaveBeenCalledTimes(1);
    });
  });

  describe('最新データ', () => {
    it('最後に配信したデータを保持し、メニュー中のパケットでは更新しない', () => {
      manager.on('data', vi.fn());
      expect(manager.getLatestData()).toBeUndefined();

      receive(racePacket(10));
      expect(manager.getLatestData()?.speed).toBe(10);

      receive(menuPacket(1000));
      expect(manager.getLatestData()?.speed).toBe(10);
    });

    it('タイムアウトしたら、通知の前に最新データを破棄する', () => {
      vi.useFakeTimers();
      let latestOnTimeout: unknown = 'not called';
      manager.on('timeout', () => {
        latestOnTimeout = manager.getLatestData();
      });
      manager.on('data', vi.fn());

      receive(racePacket(10));
      vi.advanceTimersByTime(3000);
      expect(latestOnTimeout).toBeUndefined();
      expect(manager.getLatestData()).toBeUndefined();
    });

    it('最後のアクションが消えてサーバーが止まったら、最新データを破棄する', async () => {
      const onData = vi.fn();
      manager.on('data', onData);
      receive(racePacket(10));

      manager.off('data', onData);
      await waitNextTick();
      expect(server.stop).toHaveBeenCalled();
      expect(manager.getLatestData()).toBeUndefined();
    });

    it('同じ tick 内でアクションが入れ替わった（ページの切り替え）場合は、サーバーを止めず最新データを保つ', async () => {
      const onData1 = vi.fn();
      manager.on('data', onData1);
      receive(racePacket(10));

      manager.off('data', onData1);
      manager.on('data', vi.fn());
      await waitNextTick();
      expect(server.stop).not.toHaveBeenCalled();
      expect(manager.getLatestData()?.speed).toBe(10);
    });

    it('接続先が変わらない設定の変更では最新データを保ち、接続先が変わったら破棄する', () => {
      manager.on('data', vi.fn());
      receive(racePacket(10));

      manager.configure({ port: 24000, address: '127.0.0.1' });
      expect(manager.getLatestData()?.speed).toBe(10);

      manager.configure({ port: 24001, address: '127.0.0.1' });
      expect(manager.getLatestData()).toBeUndefined();
    });
  });

  describe('接続設定', () => {
    it('接続設定を受け取るまでは、アクションが表示されてもサーバーを起動せず、タイムアウトの監視は行う', async () => {
      vi.useFakeTimers();
      vi.resetModules();
      const fresh = (await import('../src/telemetry/manager')).telemetryManager;
      const freshServer = servers[servers.length - 1];
      try {
        const onTimeout = vi.fn();
        fresh.on('timeout', onTimeout);
        fresh.on('data', vi.fn());
        expect(freshServer.start).not.toHaveBeenCalled();

        vi.advanceTimersByTime(3000);
        expect(onTimeout).toHaveBeenCalledTimes(1);

        // 接続設定を受け取ったら、表示中のアクションのためにサーバーを起動する
        fresh.configure({ port: 24000, address: '127.0.0.1' });
        expect(freshServer.start).toHaveBeenCalledWith({ port: 24000, address: '127.0.0.1' });
      } finally {
        fresh.removeAllListeners();
      }
    });

    it('不正な値で受信を止めた後は、アクションが表示されても以前の接続先で再開しない', async () => {
      const onData = vi.fn();
      manager.on('data', onData);
      expect(server.start).toHaveBeenCalledTimes(1);
      receive(racePacket(10));

      manager.clearConfig();
      expect(server.stop).toHaveBeenCalled();
      expect(manager.getLatestData()).toBeUndefined();

      // ページの切り替えなどで、すべてのアクションが消えてから再び表示される
      manager.off('data', onData);
      await waitNextTick();
      manager.on('data', vi.fn());
      expect(server.start).toHaveBeenCalledTimes(1);
    });

    it('不正な値で受信を止めても、表示中のアクションがあれば3秒後にタイムアウトする', () => {
      vi.useFakeTimers();
      const onTimeout = vi.fn();
      manager.on('timeout', onTimeout);
      manager.on('data', vi.fn());
      receive(racePacket(10));

      manager.clearConfig();
      vi.advanceTimersByTime(2999);
      expect(onTimeout).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(onTimeout).toHaveBeenCalledTimes(1);
    });
  });
});
