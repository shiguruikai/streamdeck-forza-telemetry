import {
  action,
  DialAction,
  DidReceiveSettingsEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';

import { telemetryManager } from '../telemetry/manager';
import { ForzaTelemetryData } from '../telemetry/parser';

type SpeedMeterSettings = {
  unit?: 'kmh' | 'mph';
};

function formatUnit(unit?: 'kmh' | 'mph'): string {
  return unit === 'mph' ? 'MPH' : 'KM/H';
}

function formatSpeed(speed: number, unit?: 'kmh' | 'mph'): string {
  return Math.floor(speed * (unit === 'kmh' ? 3.6 : 2.23694)).toString();
}

function formatGear(gear: number): string | null {
  // ギアが有効範囲外の場合、null を返す。
  // NOTE: 実機において、シフトチェンジの瞬間に11の値となることがあるので、11以上は無効値として扱う。
  if (gear < 0 || gear > 10) return null;
  return gear === 0 ? 'R' : gear.toString();
}

function formatRpmBar(engineMaxRpm: number, currentEngineRpm: number): { value: number; bar_fill_c: string } {
  const rpmPercent = engineMaxRpm > 0 ? Math.min(100, Math.max(0, (currentEngineRpm / engineMaxRpm) * 100)) : 0;

  let barColor = '#ffffff';
  if (rpmPercent >= 85) {
    barColor = '#ff3b30'; // 赤（レッドゾーン）
  } else if (rpmPercent >= 70) {
    barColor = '#ffcc00'; // 黄
  }

  return { value: rpmPercent, bar_fill_c: barColor };
}

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.speed-meter',
})
export class SpeedMeterAction extends SingletonAction<SpeedMeterSettings> {
  private readonly settings = new Map<string, SpeedMeterSettings>();
  private readonly handlers = new Map<string, (data: ForzaTelemetryData) => void>();
  private readonly previousGears = new Map<string, string>();

  private setSettings(actionId: string, settings: SpeedMeterSettings) {
    this.settings.set(actionId, settings);
  }

  private updateFeedback(action: DialAction, data?: ForzaTelemetryData) {
    const unit = this.settings.get(action.id)?.unit;

    if (data) {
      // ギアが有効範囲外の値の場合、前回のギアを表示する。
      // 初期状態の場合、N を表示する。
      const gear = formatGear(data.gear) ?? this.previousGears.get(action.id) ?? 'N';

      // 表示するギアを保存
      this.previousGears.set(action.id, gear);

      action.setFeedback({
        speed: formatSpeed(data.speed, unit),
        gear,
        rpmBar: formatRpmBar(data.engineMaxRpm, data.currentEngineRpm),
        unit: formatUnit(unit),
      });
    } else {
      action.setFeedback({
        speed: '0',
        gear: 'N',
        rpmBar: formatRpmBar(0, 0),
        unit: formatUnit(unit),
      });
    }
  }

  override onWillAppear(ev: WillAppearEvent<SpeedMeterSettings>): Promise<void> | void {
    if (!ev.action.isDial()) return;
    const action = ev.action;

    this.setSettings(action.id, ev.payload.settings);
    this.updateFeedback(action);

    const existingHandler = this.handlers.get(action.id);
    if (existingHandler) {
      telemetryManager.off('data', existingHandler);
    }

    const dataHandler = (data: ForzaTelemetryData) => {
      this.updateFeedback(action, data);
    };

    this.handlers.set(action.id, dataHandler);
    telemetryManager.on('data', dataHandler);
  }

  override onDidReceiveSettings(ev: DidReceiveSettingsEvent<SpeedMeterSettings>): Promise<void> | void {
    if (!ev.action.isDial()) return;
    const action = ev.action;

    this.setSettings(action.id, ev.payload.settings);
    this.updateFeedback(action);
  }

  override onWillDisappear(ev: WillDisappearEvent<SpeedMeterSettings>): Promise<void> | void {
    const existingHandler = this.handlers.get(ev.action.id);
    if (existingHandler) {
      telemetryManager.off('data', existingHandler);
    }

    this.settings.delete(ev.action.id);
    this.handlers.delete(ev.action.id);
    this.previousGears.delete(ev.action.id);
  }
}
