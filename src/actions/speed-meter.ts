import {
  action,
  DialAction,
  DialDownEvent,
  KeyAction,
  KeyDownEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';

import { ForzaTelemetryData } from '../telemetry/parser';
import { SpeedUnit } from '../types/settings';
import {
  formatGear,
  formatRpmBar,
  formatSpeed,
  formatUnit,
} from '../utils/format';
import { createSpeedMeterImage } from '../utils/image';
import { TelemetryAction } from './telemetry-action';

type SpeedMeterSettings = {
  unit?: SpeedUnit;
};

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.speed-meter',
})
export class SpeedMeterAction extends TelemetryAction<SpeedMeterSettings> {
  private readonly previousGears = new Map<string, string>();

  private async toggleUnit(action: DialAction<SpeedMeterSettings> | KeyAction<SpeedMeterSettings>) {
    const currentSettings = this.getSettings(action.id) ?? {};
    const nextUnit: SpeedUnit = currentSettings.unit === 'mph' ? 'kmh' : 'mph';
    const newSettings = { ...currentSettings, unit: nextUnit };

    this.setSettings(action.id, newSettings);
    await action.setSettings(newSettings);

    const lastData = this.getLastTelemetryData(action.id);
    this.updateImage(action, lastData);
  }

  private updateImage(action: DialAction<SpeedMeterSettings> | KeyAction<SpeedMeterSettings>, data?: ForzaTelemetryData) {
    const unit = this.getSettings(action.id)?.unit;
    let speedText = '0';
    let gearText = 'N';
    let rpmVal = 0;
    let rpmColor = '#ffffff';
    const unitText = formatUnit(unit);

    if (data) {
      speedText = formatSpeed(data.speed, unit);
      const gear = formatGear(data.gear) ?? this.previousGears.get(action.id) ?? 'N';
      this.previousGears.set(action.id, gear);
      gearText = gear;

      const rpmInfo = formatRpmBar(data.engineMaxRpm, data.currentEngineRpm);
      rpmVal = rpmInfo.value;
      rpmColor = rpmInfo.bar_fill_c;
    }

    const isDial = action.isDial();
    const image = createSpeedMeterImage(isDial, speedText, gearText, rpmVal, rpmColor, unitText);

    if (isDial) {
      action.setFeedback({ canvas: image });
    } else {
      action.setImage(image);
    }
  }

  protected override onTelemetryData(
    action: DialAction<SpeedMeterSettings> | KeyAction<SpeedMeterSettings>,
    data?: ForzaTelemetryData,
  ): void {
    this.updateImage(action, data);
  }

  override onKeyDown(ev: KeyDownEvent<SpeedMeterSettings>): Promise<void> | void {
    this.toggleUnit(ev.action);
  }

  override onDialDown(ev: DialDownEvent<SpeedMeterSettings>): Promise<void> | void {
    this.toggleUnit(ev.action);
  }

  protected override onDisappear(ev: WillDisappearEvent<SpeedMeterSettings>): void {
    this.previousGears.delete(ev.action.id);
  }
}
