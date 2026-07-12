import { EventEmitter } from 'node:events';

import streamDeck from '@elgato/streamdeck';

import { ForzaTelemetryData, parseToForzaTelemetryData } from './parser';
import { TelemetryServer } from './server';

type TelemetryManagerEvents = {
  data: [data: ForzaTelemetryData];
  error: [err: Error];
  timeout: [];
  newListener: [eventName: string | symbol, listener: () => any];
  removeListener: [eventName: string | symbol, listener: () => any];
};

/**
 * テレメトリデータの受信、パース、およびイベント配信を管理するシングルトンクラス。
 *
 * - **サーバー制御**: 表示中のアクション数（dataリスナー数）に応じてUDPサーバーの起動と停止を自動制御。
 * - **スロットリング**: 描画負荷を抑えるため、データ配信頻度を最大20FPS（50ms間隔）に制限。
 * - **タイムアウト監視**: データ受信が3秒間途絶えた場合にタイムアウトイベントを通知。
 */
class TelemetryManager extends EventEmitter<TelemetryManagerEvents> {
  private readonly logger = streamDeck.logger.createScope(TelemetryManager.name);

  private readonly server: TelemetryServer;
  private lastUpdate: number = 0;
  private readonly updateIntervalMs: number = 50;

  private startParams?: { port?: number; address?: string };

  // タイムアウト監視用。
  // ゲーム未起動状態やポート設定の誤りを検知するため、UDPサーバー起動後は
  // 実際のデータ受信有無に関わらず、3秒間データが届かない場合にタイムアウト警告を出します。
  private timeoutTimer?: NodeJS.Timeout;
  private readonly timeoutDelayMs = 3000;
  private isTimeout = false;

  constructor() {
    super();
    this.server = new TelemetryServer();

    this.server.on('message', (msg) => {
      if (this.isTimeout) {
        this.logger.info('Telemetry data reception resumed.');
      }

      // 次のタイムアウト判定タイマーを開始
      this.resetTimeoutTimer();

      const now = Date.now();

      // スロットリング
      if (now - this.lastUpdate < this.updateIntervalMs) {
        return;
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
      this.clearTimeoutTimer();
      this.emit('error', err);
    });

    // dataイベントのリスナー追加・削除を監視してサーバーを自動制御
    // アクションが画面に表示された（リスナーが登録された）ときにUDP受信サーバーを起動
    this.on('newListener', (eventName) => {
      if (eventName !== 'data') return;
      if (this.listenerCount('data') > 0) return;

      this.logger.info('First telemetry listener added. Starting UDP server...');
      this.server.start(this.startParams);
      this.resetTimeoutTimer();
    });

    // すべてのアクションが非表示になった（リスナーが解除された）ときにUDP受信サーバーを停止
    this.on('removeListener', (eventName) => {
      if (eventName !== 'data') return;

      // removeListener イベントが発生した直後の時点では、まだリスナーオブジェクトが
      // 登録リストから完全に削除されていない。そのため、process.nextTick を用いて
      // 現在のコールスタックの処理（イベントループ）が完了した直後にリスナー数を評価し、
      // 最終的に登録数が 0 になったことを担保した上で、安全にサーバーを停止する。
      process.nextTick(() => {
        if (this.listenerCount('data') > 0) return;

        this.logger.info('Last telemetry listener removed. Stopping UDP server...');
        this.server.stop();

        this.isTimeout = false;
        this.clearTimeoutTimer();
      });
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
      this.resetTimeoutTimer();
    }
  }

  /**
   * 設定パラメータを初期化し、実行中のサーバーを停止します。
   */
  public clearConfig() {
    this.startParams = undefined;
    this.clearTimeoutTimer();
    this.isTimeout = false;
    this.server.stop();
  }

  /**
   * タイムアウト監視タイマーをリセットし、再起動します。
   */
  private resetTimeoutTimer() {
    this.clearTimeoutTimer();
    this.isTimeout = false;

    this.timeoutTimer = setTimeout(() => {
      if (this.isTimeout) return;

      this.isTimeout = true;
      this.logger.warn(`No telemetry data received for ${this.timeoutDelayMs / 1000}s. Timing out.`);
      this.emit('timeout');
    }, this.timeoutDelayMs);
  }

  /**
   * タイムアウト監視タイマーを停止します。
   */
  private clearTimeoutTimer() {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = undefined;
    }
  }
}

export const telemetryManager = new TelemetryManager();
