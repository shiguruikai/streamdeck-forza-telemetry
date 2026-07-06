import {
  action,
  DialAction,
  DialDownEvent,
  SingletonAction,
  TouchTapEvent,
  WillAppearEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';

import { telemetryManager } from '../telemetry/manager';
import { ForzaTelemetryData } from '../telemetry/parser';

function formatTime(seconds: number): string {
  if (seconds <= 0) {
    return '--:--.---';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

function formatLap(lap: number): string {
  return lap > 0 ? `LAP ${lap}` : 'LAP --';
}

function formatPosition(pos: number): string {
  return pos > 0 ? `POS ${pos}` : 'POS --';
}

type LapTimeSettings = {
  displayMode?: 'best' | 'last';
};

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.lap-time',
})
export class LapTimeAction extends SingletonAction<LapTimeSettings> {
  private readonly settings = new Map<string, LapTimeSettings>();
  private readonly handlers = new Map<string, (data: ForzaTelemetryData) => void>();
  private readonly lastTelemetryData = new Map<string, ForzaTelemetryData>();

  private getDisplayMode(actionId: string): 'best' | 'last' {
    return this.settings.get(actionId)?.displayMode ?? 'best';
  }

  private async toggleDisplayMode(action: DialAction) {
    const currentMode = this.getDisplayMode(action.id);
    const newMode = currentMode === 'best' ? 'last' : 'best';

    const newSettings: LapTimeSettings = { displayMode: newMode };
    this.settings.set(action.id, newSettings);

    // 設定を永続化
    await action.setSettings(newSettings);

    // モード切り替え時に表示を即座に更新する
    const lastData = this.lastTelemetryData.get(action.id);
    if (lastData) {
      this.updateFeedback(action, lastData);
    } else {
      // キャッシュデータがない場合はラベルのみ更新する
      action.setFeedback({
        subLabel: newMode === 'best' ? 'BEST' : 'LAST',
      });
    }
  }

  private updateFeedback(action: DialAction, data?: ForzaTelemetryData) {
    const mode = this.getDisplayMode(action.id);

    if (data) {
      action.setFeedback({
        lap: formatLap(data.lapNumber),
        pos: formatPosition(data.racePosition),
        current: formatTime(data.currentLap),
        subLabel: mode === 'best' ? 'BEST' : 'LAST',
        subValue: formatTime(mode === 'best' ? data.bestLap : data.lastLap),
      });
    } else {
      action.setFeedback({
        lap: 'LAP --',
        pos: 'POS --',
        current: '--:--.---',
        subLabel: mode === 'best' ? 'BEST' : 'LAST',
        subValue: '--:--.---',
      });
    }
  }

  override onWillAppear(ev: WillAppearEvent<LapTimeSettings>): Promise<void> | void {
    if (!ev.action.isDial()) return;
    const action = ev.action;

    this.settings.set(action.id, ev.payload.settings);

    const lastData = this.lastTelemetryData.get(action.id);
    this.updateFeedback(action, lastData);

    const existingHandler = this.handlers.get(action.id);
    if (existingHandler) {
      telemetryManager.off('data', existingHandler);
    }

    const dataHandler = (data: ForzaTelemetryData) => {
      this.lastTelemetryData.set(action.id, data);
      this.updateFeedback(action, data);
    };

    this.handlers.set(action.id, dataHandler);
    telemetryManager.on('data', dataHandler);
  }

  override onWillDisappear(ev: WillDisappearEvent<LapTimeSettings>): Promise<void> | void {
    const handler = this.handlers.get(ev.action.id);
    if (handler) {
      telemetryManager.off('data', handler);
      this.handlers.delete(ev.action.id);
    }
  }

  override onDialDown(ev: DialDownEvent<LapTimeSettings>): Promise<void> | void {
    if (!ev.action.isDial()) return;
    this.toggleDisplayMode(ev.action);
  }

  override onTouchTap(ev: TouchTapEvent<LapTimeSettings>): Promise<void> | void {
    if (!ev.action.isDial()) return;
    this.toggleDisplayMode(ev.action);
  }
}
