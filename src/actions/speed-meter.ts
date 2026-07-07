import {
  action,
  DialAction,
  KeyAction,
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
import { TelemetryAction } from './telemetry-action';

type SpeedMeterSettings = {
  unit?: SpeedUnit;
};

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.speed-meter',
})
export class SpeedMeterAction extends TelemetryAction<SpeedMeterSettings> {
  private readonly previousGears = new Map<string, string>();

  private updateFeedback(action: DialAction, data?: ForzaTelemetryData) {
    const unit = this.getSettings(action.id)?.unit;

    if (data) {
      // ギアが有効範囲外の値の場合、前回のギアを表示する。
      // 初期状態の場合、N を表示する。
      const gear = formatGear(data.gear) ?? this.previousGears.get(action.id) ?? 'N';

      // 表示するギアを保存
      this.previousGears.set(action.id, gear);

      action.setFeedback({
        speed: formatSpeed(data.speed, unit),
        gear,
        rpmBar: formatRpmBar(data.engineMaxRpm, data.currentEngineRpm),
        unit: formatUnit(unit),
      });
    } else {
      action.setFeedback({
        speed: '0',
        gear: 'N',
        rpmBar: formatRpmBar(0, 0),
        unit: formatUnit(unit),
      });
    }
  }

  protected override onTelemetryData(
    action: DialAction<SpeedMeterSettings> | KeyAction<SpeedMeterSettings>,
    data?: ForzaTelemetryData,
  ): void {
    if (!action.isDial()) return;
    this.updateFeedback(action, data);
  }

  protected override onDisappear(ev: WillDisappearEvent<SpeedMeterSettings>): void {
    this.previousGears.delete(ev.action.id);
  }
}
