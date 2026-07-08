import {
  action,
  DialAction,
  DialDownEvent,
  DialRotateEvent,
  KeyAction,
  KeyDownEvent,
} from '@elgato/streamdeck';

import { ForzaTelemetryData } from '../telemetry/parser';
import { TempUnit, WheelPosition } from '../types/settings';
import { formatTemp, formatTireColor } from '../utils/format';
import { createAllWheelsImage, createWheelImage } from '../utils/image';
import { getNextWheelPosition } from '../utils/utils';
import { TelemetryAction } from './telemetry-action';

type TireTempSettings = {
  position?: WheelPosition;
  unit?: TempUnit;
  showTitle?: boolean;
};

type EventAction = DialAction<TireTempSettings> | KeyAction<TireTempSettings>;

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.tire-temp',
})
export class TireTempAction extends TelemetryAction<TireTempSettings> {
  // 表示単位の切り替え
  private async toggleUnit(action: EventAction) {
    const currentSettings = this.getSettings(action.id) ?? {};
    const nextUnit: TempUnit = currentSettings.unit === 'fahrenheit' ? 'celsius' : 'fahrenheit';
    const newSettings = { ...currentSettings, unit: nextUnit };

    this.setSettings(action.id, newSettings);
    await action.setSettings(newSettings);

    const lastData = this.getLastTelemetryData(action.id);
    this.updateImage(action, lastData);
  }

  private updateImage(action: EventAction, data?: ForzaTelemetryData) {
    const currentSettings = this.getSettings(action.id);
    const position = currentSettings?.position ?? 'all';
    const unit = currentSettings?.unit ?? 'celsius';
    const showTitle = currentSettings?.showTitle ?? true;

    const tempFL = data ? data.tireTempFrontLeft : 0;
    const tempFR = data ? data.tireTempFrontRight : 0;
    const tempRL = data ? data.tireTempRearLeft : 0;
    const tempRR = data ? data.tireTempRearRight : 0;

    const isDial = action.isDial();

    const colorFL = formatTireColor(tempFL);
    const colorFR = formatTireColor(tempFR);
    const colorRL = formatTireColor(tempRL);
    const colorRR = formatTireColor(tempRR);

    let image: string;

    if (position === 'all') {
      const values = [1, 1, 1, 1]; // タイヤは常にフルサイズ（比率1）で表示するため
      const texts = [
        formatTemp(tempFL, unit),
        formatTemp(tempFR, unit),
        formatTemp(tempRL, unit),
        formatTemp(tempRR, unit),
      ];
      const colors = [colorFL, colorFR, colorRL, colorRR];
      image = createAllWheelsImage(showTitle ? 'TIRES' : null, isDial, values, texts, colors, 0.4);
    } else {
      let value: number;
      if (position === 'fl') {
        value = tempFL;
      } else if (position === 'fr') {
        value = tempFR;
      } else if (position === 'rl') {
        value = tempRL;
      } else {
        value = tempRR;
      }
      image = createWheelImage(
        showTitle ? 'TIRES' : null,
        isDial,
        position,
        1,
        formatTemp(value, unit),
        formatTireColor(value),
        0.4,
      );
    }

    if (isDial) {
      action.setFeedback({ canvas: image });
    } else {
      action.setImage(image);
    }
  }

  protected override onTelemetryData(
    action: DialAction<TireTempSettings> | KeyAction<TireTempSettings>,
    data?: ForzaTelemetryData,
  ): void {
    this.updateImage(action, data);
  }

  override onKeyDown(ev: KeyDownEvent<TireTempSettings>): Promise<void> | void {
    this.toggleUnit(ev.action);
  }

  override onDialDown(ev: DialDownEvent<TireTempSettings>): Promise<void> | void {
    this.toggleUnit(ev.action);
  }

  override async onDialRotate(ev: DialRotateEvent<TireTempSettings>): Promise<void> {
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
