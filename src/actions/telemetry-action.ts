/* eslint-disable unused-imports/no-unused-vars */
import streamDeck, {
  DialAction,
  DidReceiveSettingsEvent,
  KeyAction,
  SendToPluginEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';
import { JsonObject, JsonValue } from '@elgato/utils';

import { telemetryManager } from '../telemetry/manager';
import { ForzaTelemetryData } from '../telemetry/parser';
import { DataSourcePayload } from '../types/sdpi';
import { getSystemFonts } from '../utils/utils';

/**
 * 各アクションの基底クラス。ライフサイクル制御やイベント購読などの共通処理を隠蔽します。
 *
 * - **ライフサイクル管理**: 表示・非表示（onWillAppear / onWillDisappear）に応じたデータ受信ハンドラの自動登録と解除。
 * - **キャッシュ**: ローカル設定、最終受信データ、アクティブアクションの参照を保持。
 * - **Property Inspector連携**: システムフォント一覧の取得要求など、設定画面との双方向通信の仲介。
 * - **エラー・タイムアウト監視**: サーバーエラーや受信タイムアウト（3秒）発生時に、アクティブアクションへ一斉に警告（showAlert）を表示。
 *
 * @template TSettings - アクションが使用するローカル設定の型
 */
export abstract class TelemetryAction<TSettings extends JsonObject = JsonObject> extends SingletonAction<TSettings> {
  private readonly settingsMap = new Map<string, TSettings>();
  private readonly lastTelemetryDataMap = new Map<string, ForzaTelemetryData>();
  private readonly handlers = new Map<string, (data: ForzaTelemetryData) => void>();
  private readonly activeActions = new Map<string, DialAction<TSettings> | KeyAction<TSettings>>();

  private isListeningErrors = false;
  private readonly errorHandler = (err: Error) => this.triggerAlertForActiveActions();
  private readonly timeoutHandler = () => this.triggerAlertForActiveActions();

  /**
   * 現在表示されているすべてのアクションに対して警告（showAlert）を表示します。
   */
  private triggerAlertForActiveActions() {
    for (const action of this.activeActions.values()) {
      action.showAlert();
    }
  }

  /**
   * 現在画面に表示されているすべてのアクティブなアクションの再描画を実行します。
   *
   * @note このメソッドは、フォント変更などのグローバル設定が更新された際、
   *       各アクションに対して最後のテレメトリデータキャッシュを用いて即時に描画を同期・再生成させるために呼び出されます。
   */
  public refreshActiveActions(): void {
    for (const action of this.activeActions.values()) {
      const lastData = this.lastTelemetryDataMap.get(action.id);
      this.onTelemetryData(action, lastData);
    }
  }

  /**
   * 指定されたアクションインスタンスのローカル設定をキャッシュから取得します。
   *
   * @param actionId - アクションID
   * @returns キャッシュされているアクションの設定
   */
  protected getSettings(actionId: string): TSettings | undefined {
    return this.settingsMap.get(actionId);
  }

  /**
   * 指定されたアクションインスタンスのローカル設定を更新し、キャッシュに保存します。
   *
   * @param actionId - アクションID
   * @param settings - 更新する設定オブジェクト
   */
  protected setSettings(actionId: string, settings: TSettings): void {
    this.settingsMap.set(actionId, settings);
  }

  /**
   * 指定されたアクションインスタンスが最後に受信したテレメトリデータのキャッシュを取得します。
   *
   * @param actionId - アクションID
   * @returns 最後にキャッシュされたテレメトリデータ
   */
  protected getLastTelemetryData(actionId: string): ForzaTelemetryData | undefined {
    return this.lastTelemetryDataMap.get(actionId);
  }

  /**
   * テレメトリデータを受信した際、または初回表示・設定変更時に呼び出されるメソッド。
   * サブクラスはこのメソッドを実装し、受信データに基づいたSVGの生成と画面描画（setImage / setFeedback）を行います。
   *
   * @param action - 対象の Key / Dial アクションインスタンス
   * @param data - パースされたテレメトリデータ（未受信時は undefined）
   */
  protected abstract onTelemetryData(
    action: DialAction<TSettings> | KeyAction<TSettings>,
    data?: ForzaTelemetryData,
  ): Promise<void> | void;

  /**
   * アクションのローカル設定が変更された際に呼び出されます（必要に応じてサブクラスでオーバーライドします）。
   *
   * @param action - 対象のアクションインスタンス
   * @param settings - 更新後の設定オブジェクト
   */
  protected onSettingsUpdated(
    action: DialAction<TSettings> | KeyAction<TSettings>,
    settings: TSettings,
  ): Promise<void> | void { }

  /**
   * アクションが画面から消える直前に呼び出されます（必要に応じてサブクラスでオーバーライドします）。
   *
   * @param ev - WillDisappearEvent オブジェクト
   */
  protected onDisappear(ev: WillDisappearEvent<TSettings>): Promise<void> | void { }

  /**
   * Property Inspector（設定画面）から送信されたイベントを処理します。
   *
   * @note UI側の `sdpi-select`（データソース指定：datasource="getFonts"）からのフォント一覧要求をフックし、
   *       システムにインストールされているフォントを非同期に取得して、UIが必要とする `DataSourcePayload` 構造
   *       （label / value のリスト）に成形した上で、`sendToPropertyInspector` を介してUI側へ配信します。
   */
  override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, TSettings>): Promise<void> {
    if (!(ev.payload instanceof Object && 'event' in ev.payload)) return;

    if (ev.payload.event === 'getFonts') {
      const fonts = await getSystemFonts();

      const items = fonts.map((font) => ({
        label: font.name,
        value: font.name,
      }));

      streamDeck.ui.sendToPropertyInspector({
        event: 'getFonts',
        items: items,
      } satisfies DataSourcePayload);
    }
  }

  /**
   * アクションが画面に表示された際に呼び出されます。
   * 設定とアクティブアクションのキャッシュへの保存、初回描画の実行、および
   * `telemetryManager` からのテレメトリデータ配信イベントの自動購読を開始します。
   */
  override onWillAppear(ev: WillAppearEvent<TSettings>): Promise<void> | void {
    const action = ev.action;
    this.settingsMap.set(action.id, ev.payload.settings);
    this.activeActions.set(action.id, action);

    // 画面切り替え時の表示遅延（黒画面の発生）を防ぐため、
    // キャッシュされている最後のデータを使って即時初回描画を行います。
    const lastData = this.lastTelemetryDataMap.get(action.id);
    this.onTelemetryData(action, lastData);

    // 同一IDのアクションで既存のイベント購読が残っている場合は二重購読を防ぐため解除します。
    this.unsubscribeTelemetry(action.id);

    // データ受信時に、最新データのキャッシュ更新とアクション固有の描画処理をトリガーするハンドラを登録します。
    const dataHandler = (data: ForzaTelemetryData) => {
      this.lastTelemetryDataMap.set(action.id, data);
      this.onTelemetryData(action, data);
    };

    this.subscribeErrors();

    this.handlers.set(action.id, dataHandler);
    telemetryManager.on('data', dataHandler);
  }

  /**
   * アクションのローカル設定が変更された際に呼び出されます。
   * 新しい設定でキャッシュを更新し、直近のデータを用いて画面を即時再描画します。
   */
  override onDidReceiveSettings(ev: DidReceiveSettingsEvent<TSettings>): Promise<void> | void {
    const action = ev.action;
    this.settingsMap.set(action.id, ev.payload.settings);

    this.onSettingsUpdated(action, ev.payload.settings);

    const lastData = this.lastTelemetryDataMap.get(action.id);
    this.onTelemetryData(action, lastData);
  }

  /**
   * アクションが画面から非表示になった際（別ページへの切り替えやプラグイン終了時）に呼び出されます。
   * イベント購読の解除と、そのアクションインスタンスに関わるメモリキャッシュを解放します。
   */
  override onWillDisappear(ev: WillDisappearEvent<TSettings>): Promise<void> | void {
    const action = ev.action;
    this.unsubscribeTelemetry(action.id);

    this.settingsMap.delete(action.id);
    this.lastTelemetryDataMap.delete(action.id);
    this.activeActions.delete(action.id);

    // アクティブなアクションがなくなった場合、エラーイベントの購読を解除
    if (this.activeActions.size === 0) {
      this.unsubscribeErrors();
    }

    return this.onDisappear(ev);
  }

  private subscribeErrors() {
    if (!this.isListeningErrors) {
      telemetryManager.on('error', this.errorHandler);
      telemetryManager.on('timeout', this.timeoutHandler);
      this.isListeningErrors = true;
    }
  }

  private unsubscribeErrors() {
    if (this.isListeningErrors) {
      telemetryManager.off('error', this.errorHandler);
      telemetryManager.off('timeout', this.timeoutHandler);
      this.isListeningErrors = false;
    }
  }

  private unsubscribeTelemetry(actionId: string): void {
    const existingHandler = this.handlers.get(actionId);
    if (existingHandler) {
      telemetryManager.off('data', existingHandler);
      this.handlers.delete(actionId);
    }
  }
}
