import {
  action,
  DialAction,
  DialDownEvent,
  KeyAction,
  KeyDownEvent,
} from '@elgato/streamdeck';

import { ForzaTelemetryData } from '../telemetry/parser';
import { SuspensionMode, WheelPosition } from '../types/settings';
import { formatTravel } from '../utils/format';
import { createAllWheelsImage, createWheelImage } from '../utils/image';
import { TelemetryAction } from './telemetry-action';

type SuspensionTravelSettings = {
  position?: WheelPosition;
  mode?: SuspensionMode;
};

type EventAction = DialAction<SuspensionTravelSettings> | KeyAction<SuspensionTravelSettings>;

// サスペンション移動量の状態に応じた色の取得（高圧縮＝赤、高伸長＝青、通常＝緑）
function getTravelColor(travel: number): string {
  if (travel > 0.8) return '#ff3b30';
  if (travel < 0.2) return '#007aff';
  return '#34c759';
}

const DEFAULT_TRAVEL_VALUE = 0.5;

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.suspension-travel',
})
export class SuspensionTravelAction extends TelemetryAction<SuspensionTravelSettings> {
  // 表示モードの切り替え
  private async toggleMode(action: EventAction) {
    const currentSettings = this.getSettings(action.id) ?? {};
    const nextMode: SuspensionMode = currentSettings.mode === 'value' ? 'percentage' : 'value';
    const newSettings = { ...currentSettings, mode: nextMode };

    this.setSettings(action.id, newSettings);
    await action.setSettings(newSettings);

    const lastData = this.getLastTelemetryData(action.id);
    this.updateImage(action, lastData);
  }

  private updateImage(action: EventAction, data?: ForzaTelemetryData) {
    const isDial = action.isDial();
    const currentSettings = this.getSettings(action.id) ?? {};
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

  protected override onTelemetryData(
    action: DialAction<SuspensionTravelSettings> | KeyAction<SuspensionTravelSettings>,
    data?: ForzaTelemetryData,
  ): void {
    this.updateImage(action, data);
  }

  override onKeyDown(ev: KeyDownEvent<SuspensionTravelSettings>): Promise<void> | void {
    this.toggleMode(ev.action);
  }

  override onDialDown(ev: DialDownEvent<SuspensionTravelSettings>): Promise<void> | void {
    this.toggleMode(ev.action);
  }
}
