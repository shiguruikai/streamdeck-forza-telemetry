import * as dgram from 'node:dgram';
import { EventEmitter } from 'node:events';
import { isNativeError } from 'node:util/types';

import streamDeck from '@elgato/streamdeck';

type TelemetryServerEvents = {
  listening: [];
  message: [msg: Buffer, rinfo: dgram.RemoteInfo];
  error: [err: Error];
};

export class TelemetryServer extends EventEmitter<TelemetryServerEvents> {
  private readonly logger = streamDeck.logger.createScope('TelemetryServer');

  private server?: dgram.Socket;
  private port = 24000;
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
      const socket = dgram.createSocket('udp4');
      this.server = socket;

      // 再起動時は、閉じた旧ソケットのイベントが新ソケットの生成後に遅れて届くため、
      // 現在のソケット以外からのイベントは無視する。
      socket.on('listening', () => {
        if (this.server !== socket) return;
        const address = socket.address();
        this.logger.info(`Listening on ${address.address}:${address.port}`);
        this.emit('listening');
      });

      socket.on('message', (msg, rinfo) => {
        if (this.server !== socket) return;
        this.emit('message', msg, rinfo);
      });

      socket.on('close', () => {
        if (this.server === socket) {
          this.server = undefined;
        }
      });

      socket.on('error', (err) => {
        if (this.server !== socket) return;
        this.logger.error(`Server error:\n${err.stack}`);
        this.emit('error', err);
        this.stop();
      });

      socket.bind(this.port, this.address);
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
