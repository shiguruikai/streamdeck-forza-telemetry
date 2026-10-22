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
function racePacket(): Buffer {
  const buf = Buffer.alloc(324);
  buf.writeInt32LE(1, 0);
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

describe('TelemetryManager', () => {
  let manager: Manager;
  let server: FakeServer;

  beforeEach(async () => {
    // シングルトンの状態をテストごとに初期化するため、モジュールを読み込み直す
    vi.resetModules();
    manager = (await import('../src/telemetry/manager')).telemetryManager;
    server = servers[servers.length - 1];
    manager.configure({ port: 24000, address: '127.0.0.1', updateIntervalMs: 100 });
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
});
