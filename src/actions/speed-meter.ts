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
import { generateGearImage, generateRpmImage, generateSpeedImage, generateSpeedMeterImage } from '../utils/graphics';
import { clamp } from '../utils/utils';
import { TelemetryAction } from './telemetry-action';

type SpeedMeterSettings = {
  layout?: SpeedMeterLayout;
  unit?: SpeedUnit;
};

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.speed-meter',
})
export class SpeedMeterAction extends TelemetryAction<SpeedMeterSettings> {
  private readonly previousGears = new Map<string, string>();

  private async updateImage(
    action: DialAction<SpeedMeterSettings> | KeyAction<SpeedMeterSettings>,
    data?: ForzaTelemetryData,
  ): Promise<void> {
    const { layout = 'full', unit = 'kmh' } = this.getSettings(action.id) ?? {};

    const isDial = action.isDial();
    const titleInfo = this.getTitleInfo(action.id);

    let image;
    if (layout === 'full') {
      image = generateSpeedMeterImage(isDial, data, unit, this.previousGears.get(action.id), titleInfo);
    } else if (layout === 'speed') {
      image = generateSpeedImage(isDial, data, unit, titleInfo);
    } else if (layout === 'gear') {
      const gearImage = generateGearImage(isDial, data, unit, titleInfo);
      image = gearImage.image;
      this.previousGears.set(action.id, gearImage.gearText);
    } else {
      image = generateRpmImage(isDial, data, titleInfo);
    }

    if (isDial) {
      await action.setFeedback({ canvas: image });
    } else {
      await action.setImage(image);
    }
  }

  protected override async onTelemetryData(
    action: DialAction<SpeedMeterSettings> | KeyAction<SpeedMeterSettings>,
    data?: ForzaTelemetryData,
  ): Promise<void> {
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
