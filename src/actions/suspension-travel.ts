import {
  action,
  DialAction,
  DialDownEvent,
  DialRotateEvent,
  KeyAction,
  KeyDownEvent,
} from '@elgato/streamdeck';

import { SuspensionMode, WheelPosition } from '../settings/settings';
import { ForzaTelemetryData } from '../telemetry/parser';
import { formatTravel, formatTravelColor } from '../utils/format';
import { createAllWheelsImage, createWheelImage } from '../utils/image';
import { getNextWheelPosition } from '../utils/utils';
import { TelemetryAction } from './telemetry-action';

type SuspensionTravelSettings = {
  position?: WheelPosition;
  mode?: SuspensionMode;
  showTitle?: boolean;
};

type EventAction = DialAction<SuspensionTravelSettings> | KeyAction<SuspensionTravelSettings>;

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
    const showTitle = currentSettings.showTitle ?? true;

    const travelFL = data ? data.normalizedSuspensionTravelFrontLeft : DEFAULT_TRAVEL_VALUE;
    const travelFR = data ? data.normalizedSuspensionTravelFrontRight : DEFAULT_TRAVEL_VALUE;
    const travelRL = data ? data.normalizedSuspensionTravelRearLeft : DEFAULT_TRAVEL_VALUE;
    const travelRR = data ? data.normalizedSuspensionTravelRearRight : DEFAULT_TRAVEL_VALUE;

    let image;
    if (position === 'all') {
      // 全輪表示モード
      const values = [travelFL, travelFR, travelRL, travelRR];
      const texts = values.map((v) => formatTravel(v, mode));
      const colors = values.map((v) => formatTravelColor(v));
      image = createAllWheelsImage(showTitle ? 'SUSPENSION' : null, isDial, values, texts, colors);
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
        showTitle ? 'SUSPENSION' : null,
        isDial,
        position,
        value,
        formatTravel(value, mode),
        formatTravelColor(value),
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

  override async onDialRotate(ev: DialRotateEvent<SuspensionTravelSettings>): Promise<void> {
    if (!ev.action.isDial()) return;

    const currentSettings = this.getSettings(ev.action.id) ?? {};
    const nextPos = getNextWheelPosition(currentSettings.position, ev.payload.ticks);
    const newSettings = { ...currentSettings, position: nextPos };

    this.setSettings(ev.action.id, newSettings);
    await ev.action.setSettings(newSettings);

    const lastData = this.getLastTelemetryData(ev.action.id);
    this.updateImage(ev.action, lastData);
  }
}
