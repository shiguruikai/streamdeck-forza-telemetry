import * as dgram from 'node:dgram';
import { EventEmitter } from 'node:events';
import { isNativeError } from 'node:util/types';

import streamDeck from '@elgato/streamdeck';

type TelemetryServerEvents = {
  listening: [];
  message: [msg: Buffer<ArrayBufferLike>, rinfo: dgram.RemoteInfo];
  error: [err: Error];
};

export class TelemetryServer extends EventEmitter<TelemetryServerEvents> {
  private readonly logger = streamDeck.logger.createScope(TelemetryServer.name);

  private server?: dgram.Socket;
  private port = 5300;
  private address = '127.0.0.1';

  public start(params?: { port?: number; address?: string }): void {
    // 接続済みかつ接続パラメーターが変更されない場合、スキップ
    if (this.server) {
      if (!params) return;
      if (params.port === this.port && params.address === this.address) return;
    }

    if (params?.port !== undefined) {
      this.port = params.port;
    }
    if (params?.address !== undefined) {
      this.address = params.address;
    }

    this.logger.info(`Initializing UDP socket ${this.address}:${this.port}`);

    try {
      this.stop();
      this.server = dgram.createSocket('udp4');

      this.server.on('listening', () => {
        if (!this.server) return;
        const address = this.server.address();
        this.logger.info(`Listening on ${address.address}:${address.port}`);
        this.emit('listening');
      });

      this.server.on('message', (msg, rinfo) => {
        this.emit('message', msg, rinfo);
      });

      this.server.on('close', () => {
        this.stop();
      });

      this.server.on('error', (err) => {
        this.logger.error(`Server error:\n${err.stack}`);
        this.emit('error', err);
        this.stop();
      });

      this.server.bind(this.port, this.address);
    } catch (e) {
      this.server = undefined;

      const err = isNativeError(e) ? e : new Error(String(e));
      this.logger.error(`Failed to bind server: ${err.message}\n${err.stack}`);
      this.emit('error', err);
    }
  }

  public stop(): void {
    if (this.server) {
      try {
        this.server.close();
      } catch {
        // 既に閉じているなどのエラーは無視
      }
      this.server = undefined;
    }
  }
}
