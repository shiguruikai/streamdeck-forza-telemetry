import {
  action,
  DialAction,
  DialRotateEvent,
  KeyAction,
  KeyDownEvent,
} from '@elgato/streamdeck';

import { ForzaTelemetryData } from '../telemetry/parser';
import { LapTimeMode } from '../types/settings';
import { formatLap, formatPosition, formatTime } from '../utils/format';
import { createLapTimeImage } from '../utils/image';
import { TelemetryAction } from './telemetry-action';

type LapTimeSettings = {
  mode?: LapTimeMode;
};

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.lap-time',
})
export class LapTimeAction extends TelemetryAction<LapTimeSettings> {
  private getDisplayMode(actionId: string): LapTimeMode {
    return this.getSettings(actionId)?.mode ?? 'best';
  }

  private async toggleDisplayMode(action: DialAction<LapTimeSettings> | KeyAction<LapTimeSettings>) {
    const currentMode = this.getDisplayMode(action.id);
    const newMode: LapTimeMode = currentMode === 'best' ? 'last' : 'best';

    const newSettings: LapTimeSettings = { mode: newMode };
    this.setSettings(action.id, newSettings);

    // 設定を永続化
    await action.setSettings(newSettings);

    // モード切り替え時に表示を即座に更新する
    const lastData = this.getLastTelemetryData(action.id);
    this.updateImage(action, lastData);
  }

  private updateImage(action: DialAction<LapTimeSettings> | KeyAction<LapTimeSettings>, data?: ForzaTelemetryData) {
    const mode = this.getDisplayMode(action.id);
    let lap = 'LAP --';
    let pos = 'POS --';
    let current = '--:--.---';
    const subLabel = mode.toUpperCase();
    let subValue = '--:--.---';

    if (data) {
      lap = formatLap(data.lapNumber + 1);
      pos = formatPosition(data.racePosition);
      current = formatTime(data.currentLap);
      subValue = formatTime(mode === 'best' ? data.bestLap : data.lastLap);
    }

    const isDial = action.isDial();
    const image = createLapTimeImage(isDial, lap, pos, current, subLabel, subValue);

    if (isDial) {
      action.setFeedback({ canvas: image });
    } else {
      action.setImage(image);
    }
  }

  protected override onTelemetryData(
    action: DialAction<LapTimeSettings> | KeyAction<LapTimeSettings>,
    data?: ForzaTelemetryData,
  ): void {
    this.updateImage(action, data);
  }

  override onKeyDown(ev: KeyDownEvent<LapTimeSettings>): Promise<void> | void {
    this.toggleDisplayMode(ev.action);
  }

  override onDialRotate(ev: DialRotateEvent<LapTimeSettings>): Promise<void> | void {
    if (!ev.action.isDial()) return;
    this.toggleDisplayMode(ev.action);
  }
}
