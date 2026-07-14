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
import { formatTravel, formatTravelColor } from '../utils/format';
import { createAllWheelsImage, createWheelImage } from '../utils/image';
import { getNextWheelPosition } from '../utils/utils';
import { PressDurationAction } from './press-duration';

type SuspensionTravelSettings = {
  position?: WheelPosition;
  mode?: SuspensionMode;
};

type EventAction = DialAction<SuspensionTravelSettings> | KeyAction<SuspensionTravelSettings>;

const DEFAULT_TRAVEL_VALUE = 0.5;

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.suspension-travel',
})
export class SuspensionTravelAction extends PressDurationAction<SuspensionTravelSettings> {
  private async updateImage(action: EventAction, data?: ForzaTelemetryData): Promise<void> {
    const { position = WHEEL_POSITIONS[0], mode = 'percentage' } = this.getSettings(action.id) ?? {};

    const travelFL = data ? data.normalizedSuspensionTravelFrontLeft : DEFAULT_TRAVEL_VALUE;
    const travelFR = data ? data.normalizedSuspensionTravelFrontRight : DEFAULT_TRAVEL_VALUE;
    const travelRL = data ? data.normalizedSuspensionTravelRearLeft : DEFAULT_TRAVEL_VALUE;
    const travelRR = data ? data.normalizedSuspensionTravelRearRight : DEFAULT_TRAVEL_VALUE;

    const isDial = action.isDial();
    const titleInfo = this.getTitleInfo(action.id);
    let image;
    if (position === 'all') {
      // 全輪表示モード
      const values = [travelFL, travelFR, travelRL, travelRR];
      const texts = values.map((v) => formatTravel(v, mode));
      const colors = values.map((v) => formatTravelColor(v));
      image = createAllWheelsImage(isDial, values, texts, colors, 0, titleInfo);
    } else {
      // 単一表示モード
      let value;
      if (position === 'fl') {
        value = travelFL;
      } else if (position === 'fr') {
        value = travelFR;
      } else if (position === 'rl') {
        value = travelRL;
      } else {
        value = travelRR;
      }
      image = createWheelImage(
        isDial,
        position,
        value,
        formatTravel(value, mode),
        formatTravelColor(value),
        0,
        titleInfo,
      );
    }

    if (isDial) {
      await action.setFeedback({ canvas: image });
    } else {
      await action.setImage(image);
    }
  }

  protected override onTelemetryData(action: EventAction, data?: ForzaTelemetryData): Promise<void> {
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
