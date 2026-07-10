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

import { DataSourcePayload } from '../spdi';
import { telemetryManager } from '../telemetry/manager';
import { ForzaTelemetryData } from '../telemetry/parser';
import { getSystemFonts } from '../utils/utils';

export abstract class TelemetryAction<TSettings extends JsonObject = JsonObject> extends SingletonAction<TSettings> {
  private readonly settingsMap = new Map<string, TSettings>();
  private readonly lastTelemetryDataMap = new Map<string, ForzaTelemetryData>();
  private readonly handlers = new Map<string, (data: ForzaTelemetryData) => void>();
  private readonly activeActions = new Map<string, DialAction<TSettings> | KeyAction<TSettings>>();

  /**
   * アクティブなすべてのアクションの {@link onTelemetryData} を呼び出します。
   */
  public refreshActiveActions(): void {
    for (const action of this.activeActions.values()) {
      const lastData = this.lastTelemetryDataMap.get(action.id);
      this.onTelemetryData(action, lastData);
    }
  }

  /**
   * アクションインスタンスに対応する設定を取得します。
   */
  protected getSettings(actionId: string): TSettings | undefined {
    return this.settingsMap.get(actionId);
  }

  /**
   * アクションインスタンスの設定を更新し、キャッシュに同期します。
   */
  protected setSettings(actionId: string, settings: TSettings): void {
    this.settingsMap.set(actionId, settings);
  }

  /**
   * アクションインスタンスの最新のテレメトリデータを取得します。
   */
  protected getLastTelemetryData(actionId: string): ForzaTelemetryData | undefined {
    return this.lastTelemetryDataMap.get(actionId);
  }

  /**
   * テレメトリデータを受信した際、または初回表示・設定変更時に呼び出されます。
   * このメソッドの中で表示を更新する必要性があります。
   */
  protected abstract onTelemetryData(
    action: DialAction<TSettings> | KeyAction<TSettings>,
    data?: ForzaTelemetryData,
  ): Promise<void> | void;

  /**
   * 設定が変更された際に呼び出されます。
   */
  protected onSettingsUpdated(
    action: DialAction<TSettings> | KeyAction<TSettings>,
    settings: TSettings,
  ): Promise<void> | void {}

  /**
   * アクションが消える際（onWillAppear）に呼び出されます。
   */
  protected onDisappear(ev: WillDisappearEvent<TSettings>): Promise<void> | void {}

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

  override onWillAppear(ev: WillAppearEvent<TSettings>): Promise<void> | void {
    const action = ev.action;
    this.settingsMap.set(action.id, ev.payload.settings);
    this.activeActions.set(action.id, action);

    // 初回描画
    const lastData = this.lastTelemetryDataMap.get(action.id);
    this.onTelemetryData(action, lastData);

    // 既存のハンドラがあれば解除
    this.unsubscribeTelemetry(action.id);

    // 新しいハンドラを登録
    const dataHandler = (data: ForzaTelemetryData) => {
      this.lastTelemetryDataMap.set(action.id, data);
      this.onTelemetryData(action, data);
    };

    this.handlers.set(action.id, dataHandler);
    telemetryManager.on('data', dataHandler);
  }

  override onDidReceiveSettings(ev: DidReceiveSettingsEvent<TSettings>): Promise<void> | void {
    const action = ev.action;
    this.settingsMap.set(action.id, ev.payload.settings);

    this.onSettingsUpdated(action, ev.payload.settings);

    const lastData = this.lastTelemetryDataMap.get(action.id);
    this.onTelemetryData(action, lastData);
  }

  override onWillDisappear(ev: WillDisappearEvent<TSettings>): Promise<void> | void {
    const action = ev.action;
    this.unsubscribeTelemetry(action.id);

    this.settingsMap.delete(action.id);
    this.lastTelemetryDataMap.delete(action.id);
    this.activeActions.delete(action.id);

    return this.onDisappear(ev);
  }

  private unsubscribeTelemetry(actionId: string): void {
    const existingHandler = this.handlers.get(actionId);
    if (existingHandler) {
      telemetryManager.off('data', existingHandler);
      this.handlers.delete(actionId);
    }
  }
}
