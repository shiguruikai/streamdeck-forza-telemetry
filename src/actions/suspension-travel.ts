import {
  action,
  DialAction,
  DialDownEvent,
  DialUpEvent,
  DidReceiveSettingsEvent,
  KeyAction,
  KeyDownEvent,
  KeyUpEvent,
  WillAppearEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';

import { telemetryManager } from '../telemetry/manager';
import { ForzaTelemetryData } from '../telemetry/parser';
import { createAllWheelsImage, createWheelImage } from '../utils/utils';
import { PressDurationAction } from './press-duration';

type SuspensionTravelSettings = {
  position?: 'all' | 'fl' | 'fr' | 'rl' | 'rr';
  mode?: 'percentage' | 'value';
};

type EventAction = DialAction<SuspensionTravelSettings> | KeyAction<SuspensionTravelSettings>;

// サスペンション移動量の状態に応じた色の取得（高圧縮＝赤、高伸長＝青、通常＝緑）
function getTravelColor(travel: number): string {
  if (travel > 0.8) return '#ff3b30';
  if (travel < 0.2) return '#007aff';
  return '#34c759';
}

function formatTravel(travel: number, mode?: SuspensionTravelSettings['mode']): string {
  return mode === 'value' ? travel.toFixed(2) : `${Math.round(travel * 100)}%`;
}

const DEFAULT_TRAVEL_VALUE = 0.5;

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.suspension-travel',
})
export class SuspensionTravelAction extends PressDurationAction<SuspensionTravelSettings> {
  private readonly settings = new Map<string, SuspensionTravelSettings>();
  private readonly handlers = new Map<string, (data: ForzaTelemetryData) => void>();
  private readonly lastTelemetryData = new Map<string, ForzaTelemetryData>();

  // 長押し判定しきい値を 500ms に設定
  protected override longPressDurationMs = 500;

  // 短押しによる表示モードの切り替え
  private async toggleMode(action: EventAction) {
    const currentSettings = this.settings.get(action.id) ?? {};
    const nextMode: 'percentage' | 'value' = currentSettings.mode === 'value' ? 'percentage' : 'value';
    const newSettings = { ...currentSettings, mode: nextMode };

    this.settings.set(action.id, newSettings);
    await action.setSettings(newSettings);

    const lastData = this.lastTelemetryData.get(action.id);
    this.updateImage(action, lastData);
  }

  // 長押しによる表示位置のリセット（Allへ）
  private async resetPosition(action: EventAction) {
    const currentSettings = this.settings.get(action.id) ?? {};
    const newSettings = { ...currentSettings, position: 'all' as const };

    this.settings.set(action.id, newSettings);
    await action.setSettings(newSettings);

    const lastData = this.lastTelemetryData.get(action.id);
    this.updateImage(action, lastData);
  }

  private updateImage(action: EventAction, data?: ForzaTelemetryData) {
    const isDial = action.isDial();
    const currentSettings = this.settings.get(action.id) ?? {};
    const position = currentSettings.position ?? 'all';
    const mode = currentSettings.mode ?? 'percentage';

    const travelFL = data ? data.normalizedSuspensionTravelFrontLeft : DEFAULT_TRAVEL_VALUE;
    const travelFR = data ? data.normalizedSuspensionTravelFrontRight : DEFAULT_TRAVEL_VALUE;
    const travelRL = data ? data.normalizedSuspensionTravelRearLeft : DEFAULT_TRAVEL_VALUE;
    const travelRR = data ? data.normalizedSuspensionTravelRearRight : DEFAULT_TRAVEL_VALUE;

    let image;
    if (position === 'all') {
      // 全輪表示モード
      const values = [travelFL, travelFR, travelRL, travelRR];
      const texts = values.map((v) => formatTravel(v, mode));
      const colors = values.map((v) => getTravelColor(v));
      image = createAllWheelsImage('SUSPENSION', isDial, values, texts, colors);
    } else {
      // 単一表示モード
      let value;
      if (position === 'fl') {
        value = travelFL;
      } else if (position === 'fr') {
        value = travelFR;
      } else if (position === 'rl') {
        value = travelRL;
      } else {
        value = travelRR;
      }
      image = createWheelImage(
        'SUSPENSION',
        isDial,
        position,
        value,
        formatTravel(value, mode),
        getTravelColor(value),
      );
    }

    if (isDial) {
      action.setFeedback({ canvas: image });
    } else {
      action.setImage(image);
    }
  }

  override onWillAppear(ev: WillAppearEvent<SuspensionTravelSettings>): Promise<void> | void {
    this.settings.set(ev.action.id, ev.payload.settings);

    const lastData = this.lastTelemetryData.get(ev.action.id);
    this.updateImage(ev.action, lastData);

    const existingHandler = this.handlers.get(ev.action.id);
    if (existingHandler) {
      telemetryManager.off('data', existingHandler);
    }

    const dataHandler = (data: ForzaTelemetryData) => {
      this.lastTelemetryData.set(ev.action.id, data);
      this.updateImage(ev.action, data);
    };

    this.handlers.set(ev.action.id, dataHandler);
    telemetryManager.on('data', dataHandler);
  }

  override onDidReceiveSettings(ev: DidReceiveSettingsEvent<SuspensionTravelSettings>): Promise<void> | void {
    this.settings.set(ev.action.id, ev.payload.settings);
    const lastData = this.lastTelemetryData.get(ev.action.id);
    this.updateImage(ev.action, lastData);
  }

  protected override onDisappear(ev: WillDisappearEvent<SuspensionTravelSettings>): Promise<void> | void {
    const existingHandler = this.handlers.get(ev.action.id);
    if (existingHandler) {
      telemetryManager.off('data', existingHandler);
    }

    this.handlers.delete(ev.action.id);
    this.settings.delete(ev.action.id);
    this.lastTelemetryData.delete(ev.action.id);
  }

  protected override onShortPress(ev: KeyUpEvent<SuspensionTravelSettings> | DialUpEvent<SuspensionTravelSettings>): void | Promise<void> {
    this.toggleMode(ev.action);
  }

  protected override onLongPress(ev: KeyDownEvent<SuspensionTravelSettings> | DialDownEvent<SuspensionTravelSettings>): void | Promise<void> {
    this.resetPosition(ev.action);
  }
}
