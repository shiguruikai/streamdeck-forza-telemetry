import {
  action,
  DialAction,
  DialRotateEvent,
  DialUpEvent,
  KeyAction,
  KeyUpEvent,
} from '@elgato/streamdeck';

import {
  POWER_LAYOUTS,
  POWER_UNIT_PRESETS,
  PowerSettings,
} from '../settings/settings';
import { ForzaTelemetryData } from '../telemetry/parser';
import { generatePowerImage } from '../utils/graphics';
import { clamp } from '../utils/utils';
import { TelemetryAction } from './telemetry-action';

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.power',
})
export class PowerAction extends TelemetryAction<PowerSettings> {
  private async updateImage(
    action: DialAction<PowerSettings> | KeyAction<PowerSettings>,
    data?: ForzaTelemetryData,
  ): Promise<void> {
    const { layout = 'both', preset = POWER_UNIT_PRESETS[0] } = this.getSettings(action.id) ?? {};
    const isDial = action.isDial();
    const titleInfo = this.getTitleInfo(action.id);

    const image = generatePowerImage(isDial, data, layout, preset, titleInfo);

    if (isDial) {
      await action.setFeedback({ canvas: image });
    } else {
      await action.setImage(image);
    }
  }

  protected override async onTelemetryData(
    action: DialAction<PowerSettings> | KeyAction<PowerSettings>,
    data?: ForzaTelemetryData,
  ): Promise<void> {
    await this.updateImage(action, data);
  }

  /**
   * キーまたはダイヤル短押しで単位プリセットを切り替える。
   */
  protected override async onShortPress(ev: KeyUpEvent<PowerSettings> | DialUpEvent<PowerSettings>): Promise<void> {
    await this.cyclePreset(ev.action);
  }

  private async cyclePreset(action: KeyAction<PowerSettings> | DialAction<PowerSettings>): Promise<void> {
    const current = this.getSettings(action.id) ?? {};
    const currentPreset = current.preset ?? POWER_UNIT_PRESETS[0];
    const currentIndex = POWER_UNIT_PRESETS.indexOf(currentPreset);
    const nextIndex = (currentIndex + 1) % POWER_UNIT_PRESETS.length;
    const nextPreset = POWER_UNIT_PRESETS[nextIndex];

    const newSettings: PowerSettings = { ...current, preset: nextPreset };
    await this.setSettings(action.id, newSettings);
    await this.updateImage(action, this.getLastTelemetryData(action.id));
  }

  override async onDialRotate(ev: DialRotateEvent<PowerSettings>): Promise<void> {
    const currentSettings = ev.payload.settings;
    const currentLayout = currentSettings.layout ?? POWER_LAYOUTS[0];
    const currentIndex = POWER_LAYOUTS.indexOf(currentLayout);
    const nextIndex = clamp(currentIndex + ev.payload.ticks, 0, POWER_LAYOUTS.length - 1);
    const nextLayout = POWER_LAYOUTS[nextIndex];

    if (currentLayout !== nextLayout) {
      const newSettings = { ...currentSettings, layout: nextLayout };
      await this.setSettings(ev.action.id, newSettings);
      await this.updateImage(ev.action, this.getLastTelemetryData(ev.action.id));
    }
  }
}
