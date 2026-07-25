import {
  action,
  DialAction,
  DialRotateEvent,
  KeyAction,
} from '@elgato/streamdeck';

import { COMPASS_DISPLAY_MODES, CompassDisplayMode } from '../shared';
import { ForzaTelemetryData } from '../telemetry/parser';
import { generateCompassSvg } from '../utils/graphics';
import { clamp } from '../utils/utils';
import { TelemetryAction } from './telemetry-action';

type CompassSettings = {
  dialDisplayMode?: CompassDisplayMode;
};

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.compass',
})
export class CompassAction extends TelemetryAction<CompassSettings> {
  private async updateImage(
    action: DialAction<CompassSettings> | KeyAction<CompassSettings>,
    data?: ForzaTelemetryData,
  ): Promise<void> {
    const { dialDisplayMode = 'arch' } = this.getSettings(action.id) ?? {};
    const isDial = action.isDial();
    const dataUri = generateCompassSvg(isDial, data, dialDisplayMode);

    if (isDial) {
      await action.setFeedback({ canvas: dataUri });
    } else {
      await action.setImage(dataUri);
    }
  }

  protected override async onTelemetryData(
    action: DialAction<CompassSettings> | KeyAction<CompassSettings>,
    data?: ForzaTelemetryData,
  ): Promise<void> {
    await this.updateImage(action, data);
  }

  /**
   * ダイヤル回転で表示モード（arch ⇔ circle）を切り替える。
   */
  override async onDialRotate(ev: DialRotateEvent<CompassSettings>): Promise<void> {
    const currentSettings = ev.payload.settings;
    const currentMode = currentSettings.dialDisplayMode ?? COMPASS_DISPLAY_MODES[0];
    const currentIndex = COMPASS_DISPLAY_MODES.indexOf(currentMode);
    const nextIndex = clamp(currentIndex + ev.payload.ticks, 0, COMPASS_DISPLAY_MODES.length - 1);
    const nextMode = COMPASS_DISPLAY_MODES[nextIndex];

    if (currentMode !== nextMode) {
      const newSettings = { ...currentSettings, dialDisplayMode: nextMode };
      await this.setSettings(ev.action.id, newSettings);
      await this.updateImage(ev.action, this.getLastTelemetryData(ev.action.id));
    }
  }
}
