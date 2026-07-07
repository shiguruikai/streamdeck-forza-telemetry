import {
  action,
  DialAction,
  DialRotateEvent,
  KeyAction,
} from '@elgato/streamdeck';

import { ForzaTelemetryData } from '../telemetry/parser';
import { LapTimeMode } from '../types/settings';
import { formatLap, formatPosition, formatTime } from '../utils/format';
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

  private async toggleDisplayMode(action: DialAction) {
    const currentMode = this.getDisplayMode(action.id);
    const newMode: LapTimeMode = currentMode === 'best' ? 'last' : 'best';

    const newSettings: LapTimeSettings = { mode: newMode };
    this.setSettings(action.id, newSettings);

    // 設定を永続化
    await action.setSettings(newSettings);

    // モード切り替え時に表示を即座に更新する
    const lastData = this.getLastTelemetryData(action.id);
    if (lastData) {
      this.updateFeedback(action, lastData);
    } else {
      // キャッシュデータがない場合はラベルのみ更新する
      action.setFeedback({
        subLabel: newMode.toUpperCase(),
      });
    }
  }

  private updateFeedback(action: DialAction, data?: ForzaTelemetryData) {
    const mode = this.getDisplayMode(action.id);

    if (data) {
      action.setFeedback({
        // Forza telemetryのlapNumberは完了した周回数（0から開始）なので、現在ラップ数は +1 する
        lap: formatLap(data.lapNumber + 1),
        pos: formatPosition(data.racePosition),
        current: formatTime(data.currentLap),
        subLabel: mode.toUpperCase(),
        subValue: formatTime(mode === 'best' ? data.bestLap : data.lastLap),
      });
    } else {
      action.setFeedback({
        lap: 'LAP --',
        pos: 'POS --',
        current: '--:--.---',
        subLabel: mode.toUpperCase(),
        subValue: '--:--.---',
      });
    }
  }

  protected override onTelemetryData(
    action: DialAction<LapTimeSettings> | KeyAction<LapTimeSettings>,
    data?: ForzaTelemetryData,
  ): void {
    if (!action.isDial()) return;
    this.updateFeedback(action, data);
  }

  override onDialRotate(ev: DialRotateEvent<LapTimeSettings>): Promise<void> | void {
    if (!ev.action.isDial()) return;
    this.toggleDisplayMode(ev.action);
  }
}
