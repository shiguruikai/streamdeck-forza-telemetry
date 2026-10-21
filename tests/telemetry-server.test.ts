import * as dgram from 'node:dgram';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { TelemetryServer } from '../src/telemetry/server';

vi.mock('@elgato/streamdeck', () => {
  const logger = { trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  return { default: { logger: { createScope: () => logger } } };
});

const ADDRESS = '127.0.0.1';

/**
 * ループバック上の空きポートを2つ取得します（同じ番号を返さないよう、両方を開いてから閉じる）。
 */
async function getFreePorts(): Promise<[number, number]> {
  const sockets = [dgram.createSocket('udp4'), dgram.createSocket('udp4')];
  await Promise.all(sockets.map((s) => new Promise<void>((resolve) => s.bind(0, ADDRESS, resolve))));
  const ports = sockets.map((s) => s.address().port);
  await Promise.all(sockets.map((s) => new Promise<void>((resolve) => s.close(resolve))));
  return [ports[0], ports[1]];
}

function waitForListening(server: TelemetryServer): Promise<void> {
  return new Promise((resolve) => server.once('listening', resolve));
}

function waitForMessage(server: TelemetryServer, timeoutMs = 1000): Promise<boolean> {
  return new Promise((resolve) => {
    const onMessage = () => {
      clearTimeout(timer);
      resolve(true);
    };
    const timer = setTimeout(() => {
      server.off('message', onMessage);
      resolve(false);
    }, timeoutMs);
    server.once('message', onMessage);
  });
}

async function sendPacket(port: number): Promise<void> {
  const sender = dgram.createSocket('udp4');
  await new Promise<void>((resolve, reject) => {
    sender.send(Buffer.alloc(324), port, ADDRESS, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
  await new Promise<void>((resolve) => sender.close(resolve));
}

describe('TelemetryServer', () => {
  let server: TelemetryServer | undefined;

  afterEach(() => {
    server?.stop();
    server = undefined;
  });

  it('起動したポートでパケットを受信できる', async () => {
    const [port] = await getFreePorts();
    server = new TelemetryServer();
    const listening = waitForListening(server);
    server.start({ port, address: ADDRESS });
    await listening;

    const received = waitForMessage(server);
    await sendPacket(port);
    expect(await received).toBe(true);
  });

  it('受信中にポートを変更しても、新しいポートで受信できる', async () => {
    const [port1, port2] = await getFreePorts();
    server = new TelemetryServer();

    const listening1 = waitForListening(server);
    server.start({ port: port1, address: ADDRESS });
    await listening1;

    const listening2 = waitForListening(server);
    server.start({ port: port2, address: ADDRESS });
    await listening2;

    // 旧ソケットの close イベントが処理されるのを待つ
    await new Promise((resolve) => setTimeout(resolve, 50));

    const received = waitForMessage(server);
    await sendPacket(port2);
    expect(await received).toBe(true);
  });
});
