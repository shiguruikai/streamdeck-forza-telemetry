import {
  action,
  DialAction,
  DialRotateEvent,
  DialUpEvent,
  KeyAction,
  KeyUpEvent,
} from '@elgato/streamdeck';

import { TempUnit, WHEEL_POSITIONS, WheelPosition } from '../settings/settings';
import { ForzaTelemetryData } from '../telemetry/parser';
import { createTireTempAllWheelsImage, createTireTempSingleWheelImage } from '../utils/image';
import { getNextWheelPosition } from '../utils/utils';
import { PressDurationAction } from './press-duration';

type TireTempSettings = {
  position?: WheelPosition;
  unit?: TempUnit;
};

type EventAction = DialAction<TireTempSettings> | KeyAction<TireTempSettings>;

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.tire-temp',
})
export class TireTempAction extends PressDurationAction<TireTempSettings> {
  private async updateImage(action: EventAction, data?: ForzaTelemetryData): Promise<void> {
    const { position = WHEEL_POSITIONS[0], unit = 'celsius' } = this.getSettings(action.id) ?? {};

    const isDial = action.isDial();
    const titleInfo = this.getTitleInfo(action.id);

    const image = position === 'all'
      ? createTireTempAllWheelsImage(isDial, data, unit, titleInfo)
      : createTireTempSingleWheelImage(isDial, position, data, unit, titleInfo);

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
  protected override async onShortPress(ev: KeyUpEvent<TireTempSettings> | DialUpEvent<TireTempSettings>): Promise<void> {
    const currentSettings = this.getSettings(ev.action.id) ?? {};
    const nextUnit: TempUnit = currentSettings.unit === 'fahrenheit' ? 'celsius' : 'fahrenheit';
    const newSettings = { ...currentSettings, unit: nextUnit };

    await this.setSettings(ev.action.id, newSettings);
    await this.updateImage(ev.action, this.getLastTelemetryData(ev.action.id));
  }

  /**
   * ダイヤル回転で表示対象のタイヤを切り替える。
   */
  override async onDialRotate(ev: DialRotateEvent<TireTempSettings>): Promise<void> {
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
