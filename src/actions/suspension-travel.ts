import {
  action,
  DialAction,
  DialRotateEvent,
  DialUpEvent,
  KeyAction,
  KeyUpEvent,
} from '@elgato/streamdeck';

import { SuspensionMode, WHEEL_POSITIONS, WheelPosition } from '../settings/settings';
import { ForzaTelemetryData } from '../telemetry/parser';
import { generateSuspensionTravelAllWheelsImage, generateSuspensionTravelSingleWheelImage } from '../utils/graphics';
import { getNextWheelPosition } from '../utils/utils';
import { TelemetryAction } from './telemetry-action';

type SuspensionTravelSettings = {
  position?: WheelPosition;
  mode?: SuspensionMode;
};

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.suspension-travel',
})
export class SuspensionTravelAction extends TelemetryAction<SuspensionTravelSettings> {
  private async updateImage(
    action: DialAction<SuspensionTravelSettings> | KeyAction<SuspensionTravelSettings>,
    data?: ForzaTelemetryData,
  ): Promise<void> {
    const { position = WHEEL_POSITIONS[0], mode = 'percentage' } = this.getSettings(action.id) ?? {};

    const isDial = action.isDial();
    const titleInfo = this.getTitleInfo(action.id);

    const image = position === 'all'
      ? generateSuspensionTravelAllWheelsImage(isDial, data, mode, titleInfo)
      : generateSuspensionTravelSingleWheelImage(isDial, position, data, mode, titleInfo);

    if (isDial) {
      await action.setFeedback({ canvas: image });
    } else {
      await action.setImage(image);
    }
  }

  protected override onTelemetryData(
    action: DialAction<SuspensionTravelSettings> | KeyAction<SuspensionTravelSettings>,
    data?: ForzaTelemetryData,
  ): Promise<void> {
    return this.updateImage(action, data);
  }

  /**
   * キーまたはダイヤル短押しで表示モードを切り替える。
   */
  protected override async onShortPress(ev: KeyUpEvent<SuspensionTravelSettings> | DialUpEvent<SuspensionTravelSettings>): Promise<void> {
    const currentSettings = this.getSettings(ev.action.id) ?? {};
    const nextMode: SuspensionMode = currentSettings.mode === 'value' ? 'percentage' : 'value';
    const newSettings = { ...currentSettings, mode: nextMode };
    await this.setSettings(ev.action.id, newSettings);
    await this.updateImage(ev.action, this.getLastTelemetryData(ev.action.id));
  }

  /**
   * ダイヤル回転で表示対象のサスペンションを切り替える。
   */
  override async onDialRotate(ev: DialRotateEvent<SuspensionTravelSettings>): Promise<void> {
    const currentSettings = ev.payload.settings;
    const currentPos = currentSettings.position ?? WHEEL_POSITIONS[0];
    const nextPos = getNextWheelPosition(currentPos, ev.payload.ticks);

    if (currentPos !== nextPos) {
      const newSettings = { ...currentSettings, position: nextPos };
      await this.setSettings(ev.action.id, newSettings);
      await this.updateImage(ev.action, this.getLastTelemetryData(ev.action.id));
    }
  }
}
