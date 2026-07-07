import {
  action,
  DialAction,
  DialDownEvent,
  KeyAction,
  KeyDownEvent,
} from '@elgato/streamdeck';

import { ForzaTelemetryData } from '../telemetry/parser';
import { TempUnit, WheelPosition } from '../types/settings';
import { formatTemp } from '../utils/format';
import { createAllWheelsImage, createWheelImage } from '../utils/image';
import { TelemetryAction } from './telemetry-action';

type TireTempSettings = {
  position?: WheelPosition;
  unit?: TempUnit;
};

type EventAction = DialAction<TireTempSettings> | KeyAction<TireTempSettings>;

// 温度に応じた色の取得（青＝冷、緑＝適温、赤＝過熱）
// 引数はゲーム内テレメトリの華氏（Fahrenheit）
function getTireColor(tempF: number): string {
  // 判定基準（摂氏）に変換
  const temp = (tempF - 32) / 1.8;

  if (temp < 60) {
    // 40度以下は完全な青、60度で完全な緑になるように補間
    const ratio = Math.max(0, Math.min(1, (temp - 40) / 20));
    const r = Math.round(0x00 * (1 - ratio) + 0x34 * ratio);
    const g = Math.round(0x7a * (1 - ratio) + 0xc7 * ratio);
    const b = Math.round(0xff * (1 - ratio) + 0x59 * ratio);
    return `rgb(${r},${g},${b})`;
  } else if (temp <= 90) {
    return '#34c759'; // 緑
  } else {
    // 90度で完全な緑、110度以上で完全な赤になるように補間
    const ratio = Math.max(0, Math.min(1, (temp - 90) / 20));
    const r = Math.round(0x34 * (1 - ratio) + 0xff * ratio);
    const g = Math.round(0xc7 * (1 - ratio) + 0x3b * ratio);
    const b = Math.round(0x59 * (1 - ratio) + 0x30 * ratio);
    return `rgb(${r},${g},${b})`;
  }
}

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

    const tempFL = data ? data.tireTempFrontLeft : 0;
    const tempFR = data ? data.tireTempFrontRight : 0;
    const tempRL = data ? data.tireTempRearLeft : 0;
    const tempRR = data ? data.tireTempRearRight : 0;

    const isDial = action.isDial();

    const colorFL = getTireColor(tempFL);
    const colorFR = getTireColor(tempFR);
    const colorRL = getTireColor(tempRL);
    const colorRR = getTireColor(tempRR);

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
      image = createAllWheelsImage('TIRES', isDial, values, texts, colors, 0.4);
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
        'TIRES',
        isDial,
        position,
        1,
        formatTemp(value, unit),
        getTireColor(value),
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
}
