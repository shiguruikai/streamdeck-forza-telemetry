import { EventEmitter } from 'node:events';

import streamDeck from '@elgato/streamdeck';

import { ForzaTelemetryData, parseToForzaTelemetryData } from './parser';
import { TelemetryServer } from './server';

type TelemetryManagerEvents = {
  data: [data: ForzaTelemetryData];
  error: [err: Error];
  newListener: [eventName: string | symbol, listener: () => any];
  removeListener: [eventName: string | symbol, listener: () => any];
};

class TelemetryManager extends EventEmitter<TelemetryManagerEvents> {
  private readonly logger = streamDeck.logger.createScope(TelemetryManager.name);

  private readonly server: TelemetryServer;
  private lastUpdate: number = 0;
  // 更新頻度を20FPS(50ms)に制限し、Stream Deck側の描画負荷を抑える
  private readonly updateIntervalMs: number = 50;

  private startParams?: { port?: number; address?: string };

  constructor() {
    super();
    this.server = new TelemetryServer();

    this.server.on('message', (msg) => {
      const now = Date.now();
      if (now - this.lastUpdate < this.updateIntervalMs) {
        return; // スロットリング
      }

      try {
        const data = parseToForzaTelemetryData(msg);
        if (data) {
          this.lastUpdate = now;
          this.emit('data', data);
        }
      } catch (err) {
        this.logger.error(`Failed to parse telemetry data: ${err}`);
      }
    });

    this.server.on('error', (err) => {
      this.emit('error', err);
    });

    // dataイベントのリスナー追加・削除を監視してサーバーを自動制御
    this.on('newListener', (eventName) => {
      if (eventName === 'data') {
        const count = this.listenerCount('data');
        if (count === 0) {
          this.logger.info('First telemetry listener added. Starting UDP server...');
          this.server.start(this.startParams);
        }
      }
    });

    this.on('removeListener', (eventName) => {
      if (eventName === 'data') {
        process.nextTick(() => {
          const count = this.listenerCount('data');
          if (count === 0) {
            this.logger.info('Last telemetry listener removed. Stopping UDP server...');
            this.server.stop();
          }
        });
      }
    });
  }

  public configure(params?: { port?: number; address?: string }) {
    this.startParams = params;

    // リスナーが既に存在する場合は、新しいパラメータでサーバーを起動/更新する
    if (this.listenerCount('data') > 0) {
      this.server.start(this.startParams);
    }
  }

  public clearConfig() {
    this.startParams = undefined;
    this.server.stop();
  }
}

export const telemetryManager = new TelemetryManager();
