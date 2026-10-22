import { isNativeError } from 'node:util/types';

import streamDeck, {
  DialAction,
  DialDownEvent,
  DialUpEvent,
  DidReceiveSettingsEvent,
  KeyAction,
  KeyDownEvent,
  KeyUpEvent,
  SendToPluginEvent,
  SingletonAction,
  TitleParametersDidChangeEvent,
  WillAppearEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';
import { JsonObject, JsonValue } from '@elgato/utils';

import { telemetryManager } from '../telemetry/manager';
import { ForzaTelemetryData } from '../telemetry/parser';
import { DataSourcePayload } from '../types/sdpi';
import { TitleInfo } from '../utils/graphics';
import { getSystemFonts } from '../utils/utils';

/**
 * 各アクションの基底クラス。ライフサイクル制御やイベント購読などの共通処理を隠蔽します。
 *
 * - **ライフサイクル管理**: 表示・非表示（onWillAppear / onWillDisappear）に応じたデータ受信ハンドラの自動登録と解除。
 * - **キャッシュ**: ローカル設定、タイトル情報、アクティブアクションの参照を保持（最新のテレメトリデータは `telemetryManager` が保持）。
 * - **Property Inspector連携**: システムフォント一覧の取得要求など、設定画面との双方向通信の仲介。
 * - **エラー・タイムアウト監視**: サーバーエラーや受信タイムアウト（3秒）発生時に、アクティブアクションへ一斉に警告（showAlert）を表示。
 *   タイムアウト時は、あわせて未受信の表示で再描画。
 * - **短押し・長押しのハンドリング**: キーおよびダイヤル操作の短押し（離した瞬間）と長押し（500ms経過時）のライフサイクルイベントを提供。
 *
 * @template TSettings - アクションが使用するローカル設定の型
 */
export abstract class TelemetryAction<TSettings extends JsonObject = JsonObject> extends SingletonAction<TSettings> {
  /* eslint-disable unused-imports/no-unused-vars */

  private readonly logger = streamDeck.logger.createScope('TelemetryAction');

  private readonly settingsMap = new Map<string, TSettings>();
  private readonly handlers = new Map<string, (data: ForzaTelemetryData) => void>();
  private readonly activeActions = new Map<string, DialAction<TSettings> | KeyAction<TSettings>>();
  private readonly titleInfoMap = new Map<string, TitleInfo>();

  private readonly pressTimers = new Map<string, NodeJS.Timeout>();
  private readonly longPressedFlags = new Set<string>();

  /**
   * 長押しと判定するしきい値（ミリ秒）。
   * 必要に応じて子クラスでオーバーライド可能です。
   */
  protected longPressDurationMs = 500;

  private isListeningErrors = false;

  private lastRedrawErrorTime = 0;
  private readonly redrawErrorLogIntervalMs = 5000;

  private readonly errorHandler = (error: Error) => {
    this.logger.error(error.message);
    this.triggerAlertForActiveActions();
  };

  private readonly timeoutHandler = () => {
    // 受信が途絶えたため、最新データが破棄された状態（未受信の表示）で再描画してから警告を表示する
    this.refreshActiveActions();
    this.triggerAlertForActiveActions();
  };

  /**
   * 現在表示されているすべてのアクションに対して警告（showAlert）を表示します。
   */
  private triggerAlertForActiveActions(): void {
    for (const action of this.activeActions.values()) {
      void action.showAlert();
    }
  }

  /**
   * 現在画面に表示されているすべてのアクティブなアクションの再描画を実行します。
   *
   * @note このメソッドは、フォント変更などのグローバル設定が更新された際や受信タイムアウト時に、
   *       各アクションに対して `telemetryManager` が持つ最新のデータを用いて即時に描画を同期・再生成させるために呼び出されます。
   */
  public refreshActiveActions(): void {
    for (const action of this.activeActions.values()) {
      void this.redraw(action, this.getLatestData());
    }
  }

  /**
   * 指定されたアクションの画面を描画します（`onTelemetryData` を呼び出します）。
   * 描画を行う場合は `onTelemetryData` を直接呼び出さず、このメソッドを使用してください。
   *
   * @note 描画処理の例外を呼び出し元へ伝播させると、未処理の Promise 拒否としてプラグインプロセスが終了するため、
   *       ここで捕捉してログに記録します。毎フレーム同じ例外が発生し得るため、ログ出力は5秒に1回までに制限します。
   *
   * @param action - 対象の Key / Dial アクションインスタンス
   * @param data - パースされたテレメトリデータ（未受信時は undefined）
   */
  protected async redraw(
    action: DialAction<TSettings> | KeyAction<TSettings>,
    data?: ForzaTelemetryData,
  ): Promise<void> {
    try {
      await this.onTelemetryData(action, data);
    } catch (error) {
      const now = Date.now();
      if (now - this.lastRedrawErrorTime > this.redrawErrorLogIntervalMs) {
        this.lastRedrawErrorTime = now;
        const err = isNativeError(error) ? error : new Error(String(error));
        this.logger.error(`Failed to redraw action ${action.id}: ${err.message}\n${err.stack}`);
      }
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
  protected async setSettings(actionId: string, settings: TSettings): Promise<void> {
    this.settingsMap.set(actionId, settings);
    await this.activeActions.get(actionId)?.setSettings(settings);
  }

  /**
   * 指定されたアクションIDに対応するタイトル情報を取得します。
   * タイトルが空文字、または非表示設定の場合は `undefined` を返します。
   *
   * @param actionId - アクションID
   * @returns タイトル情報、または `undefined`
   */
  protected getTitleInfo(actionId: string): TitleInfo | undefined {
    return this.titleInfoMap.get(actionId);
  }

  /**
   * `telemetryManager` が最後に配信したテレメトリデータを取得します（全アクションで共有）。
   * 表示開始、設定変更、操作時などの再描画に使用します。
   *
   * @returns 最新のテレメトリデータ（未受信、またはサーバーの停止やタイムアウトで破棄された場合は undefined）
   */
  protected getLatestData(): ForzaTelemetryData | undefined {
    return telemetryManager.getLatestData();
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
  ): Promise<void> | void { /* pass */ }

  /**
   * アクションが画面から消える直前に呼び出されます（必要に応じてサブクラスでオーバーライドします）。
   *
   * @param ev - WillDisappearEvent オブジェクト
   */
  protected onDisappear(ev: WillDisappearEvent<TSettings>): Promise<void> | void { /* pass */ }

  /**
   * 短押し（キーまたはダイヤルが離された際に、長押しが発生していなかった場合）のコールバック。
   */
  protected onShortPress(
    _ev: KeyUpEvent<TSettings> | DialUpEvent<TSettings>,
  ): Promise<void> | void { /* pass */ }

  /**
   * 長押し（キーまたはダイヤルが押されてから規定時間が経過した瞬間）のコールバック。
   */
  protected onLongPress(
    _ev: KeyDownEvent<TSettings> | DialDownEvent<TSettings>,
  ): Promise<void> | void { /* pass */ }

  override onKeyDown(ev: KeyDownEvent<TSettings>): Promise<void> | void {
    this.handlePressDown(ev);
  }

  override onDialDown(ev: DialDownEvent<TSettings>): Promise<void> | void {
    this.handlePressDown(ev);
  }

  override async onKeyUp(ev: KeyUpEvent<TSettings>): Promise<void> {
    await this.handlePressUp(ev);
  }

  override async onDialUp(ev: DialUpEvent<TSettings>): Promise<void> {
    await this.handlePressUp(ev);
  }

  private handlePressDown(ev: KeyDownEvent<TSettings> | DialDownEvent<TSettings>): void {
    if (this.pressTimers.has(ev.action.id)) return;

    const timer = setTimeout(() => {
      this.longPressedFlags.add(ev.action.id);
      void this.onLongPress(ev);
    }, this.longPressDurationMs);

    this.pressTimers.set(ev.action.id, timer);
  }

  private async handlePressUp(ev: KeyUpEvent<TSettings> | DialUpEvent<TSettings>): Promise<void> {
    this.cancelPressTimer(ev.action.id);

    const wasLongPressed = this.longPressedFlags.has(ev.action.id);
    this.longPressedFlags.delete(ev.action.id);

    if (!wasLongPressed && this.activeActions.has(ev.action.id)) {
      await this.onShortPress(ev);
    }
  }

  private cancelPressTimer(actionId: string): void {
    const existingTimer = this.pressTimers.get(actionId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.pressTimers.delete(actionId);
    }
  }

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

      await streamDeck.ui.sendToPropertyInspector({
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
  override async onWillAppear(ev: WillAppearEvent<TSettings>): Promise<void> {
    const { action, payload } = ev;

    this.settingsMap.set(action.id, payload.settings);
    this.activeActions.set(action.id, action);

    // 同一IDのアクションで既存のイベント購読が残っている場合は二重購読を防ぐため解除します。
    this.unsubscribeTelemetry(action.id);

    // データ受信時に、アクション固有の描画処理をトリガーするハンドラを登録します。
    // NOTE: ページ切り替えで同じ tick 内に別のアクションが消えた場合に、リスナー数が0と判定されて
    //       サーバーの停止と最新データの破棄が起きないよう、await より前に購読します。
    const dataHandler = (data: ForzaTelemetryData) => {
      void this.redraw(action, data);
    };

    this.subscribeErrors();

    this.handlers.set(action.id, dataHandler);
    telemetryManager.on('data', dataHandler);

    // 次のデータの受信を待たずに、`telemetryManager` が持つ最新のデータで即時に初回描画を行います。
    // 最新のデータは全アクションで共有しているため、ページを切り替えても未受信の表示を挟まずに直前の値を表示できます。
    await this.redraw(action, this.getLatestData());
  }

  /**
   * アクションのローカル設定が変更された際に呼び出されます。
   * 新しい設定でキャッシュを更新し、直近のデータを用いて画面を即時再描画します。
   */
  override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<TSettings>): Promise<void> {
    const { action, payload } = ev;

    this.settingsMap.set(action.id, payload.settings);

    await this.onSettingsUpdated(action, payload.settings);
    await this.redraw(action, this.getLatestData());
  }

  /**
   * アクションが画面から非表示になった際（別ページへの切り替えやプラグイン終了時）に呼び出されます。
   * イベント購読の解除と、そのアクションインスタンスに関わるメモリキャッシュを解放します。
   */
  override async onWillDisappear(ev: WillDisappearEvent<TSettings>): Promise<void> {
    const { action } = ev;

    this.cancelPressTimer(action.id);
    this.longPressedFlags.delete(action.id);

    this.unsubscribeTelemetry(action.id);

    this.settingsMap.delete(action.id);
    this.activeActions.delete(action.id);

    // アクティブなアクションがなくなった場合、エラーイベントの購読を解除
    if (this.activeActions.size === 0) {
      this.unsubscribeErrors();
    }

    await this.onDisappear(ev);
  }

  /**
   * アクションのタイトルまたはタイトルパラメータが変更された際に呼び出されます。
   * 新しいタイトル情報をキャッシュに保存（非表示または空文字時はキャッシュから削除）し、直近のデータを用いて画面を即時再描画します。
   *
   * @param ev - TitleParametersDidChangeEvent オブジェクト
   */
  override async onTitleParametersDidChange(ev: TitleParametersDidChangeEvent<TSettings>): Promise<void> {
    const { action, payload } = ev;

    if (payload.title && payload.titleParameters.showTitle) {
      this.titleInfoMap.set(action.id, {
        text: payload.title,
        titleAlignment: payload.titleParameters.titleAlignment,
        titleColor: payload.titleParameters.titleColor,
      });
    } else {
      this.titleInfoMap.delete(action.id);
    }

    await this.redraw(action, this.getLatestData());
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
