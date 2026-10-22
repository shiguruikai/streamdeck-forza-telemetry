import { EventEmitter } from 'node:events';

import streamDeck from '@elgato/streamdeck';

import { ForzaTelemetryData, parseToForzaTelemetryData, SledFormatNotSupportedError, UnsupportedPacketSizeError } from './parser';
import { TelemetryServer } from './server';
import { Throttle } from './throttle';

type TelemetryManagerEvents = {
  data: [data: ForzaTelemetryData];
  error: [error: Error];
  timeout: [];
  newListener: [eventName: string | symbol, listener: () => any];
  removeListener: [eventName: string | symbol, listener: () => any];
};

/**
 * テレメトリデータの受信、パース、およびイベント配信を管理するシングルトンクラス。
 *
 * - **サーバー制御**: 表示中のアクション数（dataリスナー数）に応じてUDPサーバーの起動と停止を自動制御。
 * - **スロットリング**: 描画負荷を抑えるため、外部から設定された配信間隔（updateIntervalMs）に基づいてデータ配信を制限。
 * - **最新データの保持**: 最後に配信したデータを1件保持し、アクションの表示開始や設定変更時の再描画に提供。
 * - **タイムアウト監視**: データ受信が3秒間途絶えた場合に、保持している最新データを破棄してタイムアウトイベントを通知。
 */
class TelemetryManager extends EventEmitter<TelemetryManagerEvents> {
  private readonly logger = streamDeck.logger.createScope('TelemetryManager');

  private readonly server: TelemetryServer;

  // Elgato Marketplace の Plugin Guidelines（Programmatic Floodingの回避）に従い、
  // 描画更新頻度は秒間最大10回（10Hz）以下が推奨されます。
  // 本プラグインでは、設定画面から 10〜30 FPS（100ms〜33.3ms）に変更できるようにしています。
  private updateIntervalMs = 100;

  private readonly throttle = new Throttle();

  // 最後に配信したデータ。サーバーの停止、接続先の変更、タイムアウトで破棄する。
  private latestData?: ForzaTelemetryData;

  private startParams?: { port?: number; address?: string };

  private lastWarningTime = 0;
  private readonly warningIntervalMs = 5000;

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
      // 通信自体は届いているため、タイムアウト状態であれば解除し、タイマーをリセット
      if (this.isTimeout) {
        this.logger.info('Telemetry data reception resumed.');
        this.isTimeout = false;
      }
      this.resetTimeoutTimer();

      // メニュー画面やポーズ中（IsRaceOn = 0）のパケットは、TimestampMS 以外がすべて0で走行データではないため、
      // 配信せずに直前の表示を保つ。パケット自体は届いているため、タイムアウトのタイマーはリセット済み。
      if (msg.length >= 4 && msg.readInt32LE(0) === 0) {
        return;
      }

      // スロットリング
      if (!this.throttle.accept(performance.now(), this.updateIntervalMs)) {
        return;
      }

      try {
        const data = parseToForzaTelemetryData(msg);
        this.latestData = data;
        this.emit('data', data);
      } catch (error) {
        if (error instanceof SledFormatNotSupportedError || error instanceof UnsupportedPacketSizeError) {
          const now = Date.now();
          if (now - this.lastWarningTime > this.warningIntervalMs) {
            this.logger.warn(error.message);
            this.lastWarningTime = now;
            // 5秒に1回のみ error イベントを emit し、即時警告とパフォーマンス維持を両立
            this.emit('error', error);
          }
          return;
        }
        this.emit('error', error as Error);
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
        this.throttle.reset();
        this.latestData = undefined;
        this.clearTimeoutTimer();
      });
    });
  }

  /**
   * 最後に配信したテレメトリデータを取得します。
   * アクションの表示開始や設定の変更時に、次のデータの受信を待たずに再描画するために使用します。
   *
   * @returns 最新のテレメトリデータ（未受信、またはサーバーの停止やタイムアウトで破棄された場合は undefined）
   */
  public getLatestData(): ForzaTelemetryData | undefined {
    return this.latestData;
  }

  /**
   * テレメトリサーバーの接続ポート・IPアドレスを設定します。
   * すでにリスナーが存在する（アクティブなアクションがある）場合は、即時適用してサーバーを起動します。
   *
   * @param params - 接続先の設定（ポート、IPアドレス）
   */
  public configure(params?: { port?: number; address?: string; updateIntervalMs?: number }) {
    // 接続先が変わる場合は、変更前の接続先から受信したデータを破棄する
    if (params?.port !== this.startParams?.port || params?.address !== this.startParams?.address) {
      this.latestData = undefined;
    }
    this.startParams = params;
    if (params?.updateIntervalMs !== undefined) {
      this.updateIntervalMs = params.updateIntervalMs;
    }
    this.throttle.reset();

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
    this.throttle.reset();
    this.latestData = undefined;
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
      // 受信が途絶えたため、古いデータで再描画しないよう破棄してから通知する
      this.latestData = undefined;
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
