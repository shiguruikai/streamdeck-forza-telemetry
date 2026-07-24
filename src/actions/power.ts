import {
  action,
  DialAction,
  DialRotateEvent,
  DialUpEvent,
  KeyAction,
  KeyDownEvent,
} from '@elgato/streamdeck';

import {
  POWER_DISPLAY_MODES,
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
    const { mode = 'both', preset = POWER_UNIT_PRESETS[0] } = this.getSettings(action.id) ?? {};
    const isDial = action.isDial();
    const titleInfo = this.getTitleInfo(action.id);

    const image = generatePowerImage(isDial, data, mode, preset, titleInfo);

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

  override async onKeyDown(ev: KeyDownEvent<PowerSettings>): Promise<void> {
    await this.cyclePreset(ev.action);
  }

  override async onDialUp(ev: DialUpEvent<PowerSettings>): Promise<void> {
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
    const currentMode = currentSettings.mode ?? POWER_DISPLAY_MODES[0];
    const currentIndex = POWER_DISPLAY_MODES.indexOf(currentMode);
    const nextIndex = clamp(currentIndex + ev.payload.ticks, 0, POWER_DISPLAY_MODES.length - 1);
    const nextMode = POWER_DISPLAY_MODES[nextIndex];

    if (currentMode !== nextMode) {
      const newSettings = { ...currentSettings, mode: nextMode };
      await this.setSettings(ev.action.id, newSettings);
      await this.updateImage(ev.action, this.getLastTelemetryData(ev.action.id));
    }
  }
}
