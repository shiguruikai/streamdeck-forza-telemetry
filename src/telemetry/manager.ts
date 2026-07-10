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

/**
 * テレメトリデータの受信制御、パース、および各アクションへのイベント配信を統括するマネージャー。
 * 重複起動の防止とリソースの一元化のため、シングルトンとして設計されています。
 *
 * 画面上のアクションのアクティブ状態（表示・非表示）と連動して、UDP受信サーバーの
 * 起動および停止を自動的に制御（省電力設計）し、不要なポート占有とCPU消費を解放します。
 * また、描画・通信負荷を抑制するために、配信頻度を最大20FPS（50ms間隔）にスロットリングします。
 */
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
    // アクションが画面に表示された（リスナーが登録された）ときにUDP受信サーバーを起動
    this.on('newListener', (eventName) => {
      if (eventName === 'data') {
        const count = this.listenerCount('data');
        if (count === 0) {
          this.logger.info('First telemetry listener added. Starting UDP server...');
          this.server.start(this.startParams);
        }
      }
    });

    // すべてのアクションが非表示になった（リスナーが解除された）ときにUDP受信サーバーを停止
    this.on('removeListener', (eventName) => {
      if (eventName === 'data') {
        // removeListener イベントが発生した直後の時点では、まだリスナーオブジェクトが
        // 登録リストから完全に削除されていない。そのため、process.nextTick を用いて
        // 現在のコールスタックの処理（イベントループ）が完了した直後にリスナー数を評価し、
        // 最終的に登録数が 0 になったことを担保した上で、安全にサーバーを停止する。
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

  /**
   * テレメトリサーバーの接続ポート・IPアドレスを設定します。
   * すでにリスナーが存在する（アクティブなアクションがある）場合は、即時適用してサーバーを起動します。
   *
   * @param params - 接続先の設定（ポート、IPアドレス）
   */
  public configure(params?: { port?: number; address?: string }) {
    this.startParams = params;

    // リスナーが既に存在する場合は、新しいパラメータでサーバーを起動/更新する
    if (this.listenerCount('data') > 0) {
      this.server.start(this.startParams);
    }
  }

  /**
   * 設定パラメータを初期化し、実行中のサーバーを停止します。
   */
  public clearConfig() {
    this.startParams = undefined;
    this.server.stop();
  }
}

export const telemetryManager = new TelemetryManager();
