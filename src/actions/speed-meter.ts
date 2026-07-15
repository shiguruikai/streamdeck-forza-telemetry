import {
  action,
  DialAction,
  DialRotateEvent,
  DialUpEvent,
  KeyAction,
  KeyUpEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';

import { SPEED_METER_LAYOUTS, SpeedMeterLayout, SpeedUnit } from '../settings/settings';
import { ForzaTelemetryData } from '../telemetry/parser';
import {
  formatGear,
  formatRpmBar,
  formatSpeed,
  formatUnit,
} from '../utils/format';
import { Color, createGearImage, createRpmImage, createSingleValueImage, createSpeedMeterImage } from '../utils/image';
import { clamp } from '../utils/utils';
import { PressDurationAction } from './press-duration';

type SpeedMeterSettings = {
  layout?: SpeedMeterLayout;
  unit?: SpeedUnit;
};

type EventAction = DialAction<SpeedMeterSettings> | KeyAction<SpeedMeterSettings>;

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.speed-meter',
})
export class SpeedMeterAction extends PressDurationAction<SpeedMeterSettings> {
  private readonly previousGears = new Map<string, string>();

  private async updateImage(action: EventAction, data?: ForzaTelemetryData): Promise<void> {
    const { layout = 'full', unit = 'kmh' } = this.getSettings(action.id) ?? {};

    const unitText = formatUnit(unit);

    let speedText = '0';
    let gearText = 'N';
    let rpmPct = 0;
    let rpmColor: string = Color.WHITE;

    if (data) {
      speedText = formatSpeed(data.speed, unit);
      const gear = formatGear(data.gear) ?? this.previousGears.get(action.id) ?? 'N';
      this.previousGears.set(action.id, gear);
      gearText = gear;

      const rpmInfo = formatRpmBar(data.currentEngineRpm, data.engineMaxRpm);
      rpmPct = rpmInfo.rpmPct;
      rpmColor = rpmInfo.rpmColor;
    }

    const isDial = action.isDial();
    const titleInfo = this.getTitleInfo(action.id);
    let image: string;
    if (layout === 'full') {
      image = createSpeedMeterImage(isDial, speedText, gearText, rpmPct, rpmColor, unitText, titleInfo);
    } else if (layout === 'speed') {
      image = createSingleValueImage(isDial, speedText, unitText, titleInfo);
    } else if (layout === 'gear') {
      image = createGearImage(isDial, gearText, titleInfo);
    } else {
      image = createRpmImage(isDial, data?.currentEngineRpm, data?.engineMaxRpm, titleInfo);
    }

    if (isDial) {
      await action.setFeedback({ canvas: image });
    } else {
      await action.setImage(image);
    }
  }

  protected override async onTelemetryData(action: EventAction, data?: ForzaTelemetryData): Promise<void> {
    await this.updateImage(action, data);
  }

  protected override onDisappear(ev: WillDisappearEvent<SpeedMeterSettings>): void {
    this.previousGears.delete(ev.action.id);
  }

  /**
   * キーまたはダイヤル短押しで単位を切り替える。
   */
  protected override async onShortPress(ev: KeyUpEvent<SpeedMeterSettings> | DialUpEvent<SpeedMeterSettings>): Promise<void> {
    const currentSettings = ev.payload.settings;
    const nextUnit: SpeedUnit = currentSettings.unit === 'mph' ? 'kmh' : 'mph';
    const newSettings = { ...currentSettings, unit: nextUnit };
    await this.setSettings(ev.action.id, newSettings);
    await this.updateImage(ev.action, this.getLastTelemetryData(ev.action.id));
  }

  /**
   * ダイヤル回転でレイアウトを切り替える。
   */
  override async onDialRotate(ev: DialRotateEvent<SpeedMeterSettings>): Promise<void> {
    const currentSettings = ev.payload.settings;
    const currentLayout = currentSettings.layout ?? SPEED_METER_LAYOUTS[0];
    const currentIndex = SPEED_METER_LAYOUTS.indexOf(currentLayout);
    const nextIndex = clamp(currentIndex + ev.payload.ticks, 0, SPEED_METER_LAYOUTS.length - 1);
    const nextLayout = SPEED_METER_LAYOUTS[nextIndex];

    if (currentLayout !== nextLayout) {
      const newSettings = { ...currentSettings, layout: nextLayout };
      await this.setSettings(ev.action.id, newSettings);
      await this.updateImage(ev.action, this.getLastTelemetryData(ev.action.id));
    }
  }
}
