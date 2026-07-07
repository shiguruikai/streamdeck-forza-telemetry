/* eslint-disable unused-imports/no-unused-vars */
import {
  DialAction,
  DidReceiveSettingsEvent,
  KeyAction,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';
import { JsonObject } from '@elgato/utils';

import { telemetryManager } from '../telemetry/manager';
import { ForzaTelemetryData } from '../telemetry/parser';

export abstract class TelemetryAction<TSettings extends JsonObject = JsonObject> extends SingletonAction<TSettings> {
  private readonly settingsMap = new Map<string, TSettings>();
  private readonly lastTelemetryDataMap = new Map<string, ForzaTelemetryData>();
  private readonly handlers = new Map<string, (data: ForzaTelemetryData) => void>();

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
   */
  protected abstract onTelemetryData(
    action: DialAction<TSettings> | KeyAction<TSettings>,
    data?: ForzaTelemetryData,
  ): void | Promise<void>;

  /**
   * 設定が変更された際に呼び出されます。
   */
  protected onSettingsUpdated(
    action: DialAction<TSettings> | KeyAction<TSettings>,
    settings: TSettings,
  ): void | Promise<void> {}

  /**
   * アクションが消える際（onWillAppear）に呼び出されます。
   */
  protected onDisappear(ev: WillDisappearEvent<TSettings>): void | Promise<void> {}

  override onWillAppear(ev: WillAppearEvent<TSettings>): Promise<void> | void {
    const action = ev.action;
    this.settingsMap.set(action.id, ev.payload.settings);

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
