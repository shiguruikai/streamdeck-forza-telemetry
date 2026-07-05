import streamDeck, {
  action,
  DialDownEvent,
  SingletonAction,
  TouchTapEvent,
  WillAppearEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';

import { TelemetryManager } from '../telemetry/manager';
import { ForzaTelemetryData } from '../telemetry/parser';

const telemetryManager = TelemetryManager.getInstance();

function formatTime(seconds: number): string {
  if (seconds === undefined || seconds === null || seconds <= 0) {
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

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.lap-time',
})
export class LapTimeAction extends SingletonAction {
  private readonly logger = streamDeck.logger.createScope(LapTimeAction.name);
  private readonly handlers = new Map<string, (data: ForzaTelemetryData) => void>();

  // 各アクションインスタンスの表示モードを管理（'best' または 'last'）
  private readonly displayModes = new Map<string, 'best' | 'last'>();

  // 各アクションインスタンスの最新テレメトリキャッシュ
  private readonly lastTelemetryData = new Map<string, ForzaTelemetryData>();

  private getDisplayMode(actionId: string): 'best' | 'last' {
    return this.displayModes.get(actionId) ?? 'best';
  }

  private toggleDisplayMode(actionId: string) {
    const currentMode = this.getDisplayMode(actionId);
    const newMode = currentMode === 'best' ? 'last' : 'best';
    this.displayModes.set(actionId, newMode);
    this.logger.debug(`Toggled display mode for action ${actionId} to ${newMode}`);

    // モード切り替え時に表示を即座に更新する
    const lastData = this.lastTelemetryData.get(actionId);
    if (lastData) {
      this.updateFeedback(actionId, lastData);
    } else {
      // キャッシュデータがない場合はラベルのみ更新する
      const action = this.actions.find(a => a.id === actionId);
      if (action?.isDial()) {
        action.setFeedback({
          subLabel: newMode === 'best' ? 'BEST' : 'LAST',
        });
      }
    }
  }

  private updateFeedback(actionId: string, data: ForzaTelemetryData) {
    const action = this.actions.find(a => a.id === actionId);
    if (!action?.isDial()) return;

    const mode = this.getDisplayMode(actionId);
    const subTime = mode === 'best' ? data.bestLap : data.lastLap;

    action.setFeedback({
      lap: formatLap(data.lapNumber),
      pos: formatPosition(data.racePosition),
      current: formatTime(data.currentLap),
      subLabel: mode === 'best' ? 'BEST' : 'LAST',
      subValue: formatTime(subTime),
    });
  }

  override onWillAppear(ev: WillAppearEvent): Promise<void> | void {
    if (!ev.action.isDial()) return;

    const actionId = ev.action.id;

    // 初期状態の設定
    if (!this.displayModes.has(actionId)) {
      this.displayModes.set(actionId, 'best');
    }

    // 初期状態のUIを反映
    ev.action.setFeedback({
      lap: 'LAP --',
      pos: 'POS --',
      current: '--:--.---',
      subLabel: this.getDisplayMode(actionId) === 'best' ? 'BEST' : 'LAST',
      subValue: '--:--.---',
    });

    const existingHandler = this.handlers.get(actionId);
    if (existingHandler) {
      telemetryManager.off('data', existingHandler);
    }

    const dataHandler = (data: ForzaTelemetryData) => {
      this.lastTelemetryData.set(actionId, data);
      this.updateFeedback(actionId, data);
    };

    this.handlers.set(actionId, dataHandler);
    telemetryManager.on('data', dataHandler);
  }

  override onWillDisappear(ev: WillDisappearEvent): Promise<void> | void {
    const actionId = ev.action.id;
    const handler = this.handlers.get(actionId);
    if (handler) {
      telemetryManager.off('data', handler);
      this.handlers.delete(actionId);
    }
    this.displayModes.delete(actionId);
    this.lastTelemetryData.delete(actionId);
  }

  override onDialDown(ev: DialDownEvent): Promise<void> | void {
    if (!ev.action.isDial()) return;
    this.toggleDisplayMode(ev.action.id);
  }

  override onTouchTap(ev: TouchTapEvent): Promise<void> | void {
    if (!ev.action.isDial()) return;
    this.toggleDisplayMode(ev.action.id);
  }
}
