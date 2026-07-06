import streamDeck, {
  action,
  DialAction,
  DidReceiveSettingsEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';

import { telemetryManager } from '../telemetry/manager';
import { ForzaTelemetryData } from '../telemetry/parser';

type SpeedMeterDialSettings = {
  unit?: 'kmh' | 'mph';
};

const MS_TO_KMH = 3.6;
const MS_TO_MPH = 2.23694;

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.speed-meter',
})
export class SpeedMeterAction extends SingletonAction<SpeedMeterDialSettings> {
  private readonly logger = streamDeck.logger.createScope(SpeedMeterAction.name);

  private readonly handlers = new Map<string, (data: ForzaTelemetryData) => void>();

  private readonly settings = new Map<string, SpeedMeterDialSettings>();

  private getUnit(actionId: string): 'KM/H' | 'MPH' {
    const unit = this.settings.get(actionId)?.unit;
    return unit === 'mph' ? 'MPH' : 'KM/H';
  }

  private setSettings(actionId: string, settings: SpeedMeterDialSettings) {
    this.settings.set(actionId, settings);
  }

  private computeSpeed(actionId: string, data: Pick<ForzaTelemetryData, 'speed'>): string {
    const unit = this.getUnit(actionId);
    const speed = data.speed * (unit === 'KM/H' ? MS_TO_KMH : MS_TO_MPH);
    return Math.floor(speed).toString();
  }

  private decodeGear(gear: number): string {
    if (gear === 0) return 'R';
    if (gear === 1) return 'N';
    if (gear >= 2) return (gear - 1).toString();
    return '?';
  }

  private computeRpmBar(
    data: Pick<ForzaTelemetryData, 'engineMaxRpm' | 'currentEngineRpm'>,
  ): { value: number; bar_fill_c: string } {
    const rpmPercent = data.engineMaxRpm > 0
      ? Math.min(
          100,
          Math.max(0, (data.currentEngineRpm / data.engineMaxRpm) * 100),
        )
      : 0;

    let barColor = '#ffffff';
    if (rpmPercent >= 85) {
      barColor = '#ff3b30'; // 赤 (レッドゾーン)
    } else if (rpmPercent >= 70) {
      barColor = '#ffcc00'; // 黄
    }

    return { value: rpmPercent, bar_fill_c: barColor };
  }

  private updateFeedback(action: DialAction, data?: ForzaTelemetryData) {
    const unit = this.getUnit(action.id);
    if (data) {
      action.setFeedback({
        speed: this.computeSpeed(action.id, data),
        gear: this.decodeGear(data.gear),
        rpmBar: this.computeRpmBar(data),
        unit,
      });
    } else {
      action.setFeedback({
        speed: '0',
        gear: 'N',
        rpmBar: { value: 0, bar_fill_c: '#ffffff' },
        unit,
      });
    }
  }

  override onWillAppear(ev: WillAppearEvent<SpeedMeterDialSettings>): Promise<void> | void {
    if (!ev.action.isDial()) return;
    const action = ev.action;

    this.setSettings(action.id, ev.payload.settings);
    this.updateFeedback(action);

    // 既にハンドラが存在する場合は一旦解除して重複登録を防ぐ
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

  override onDidReceiveSettings(ev: DidReceiveSettingsEvent<SpeedMeterDialSettings>): Promise<void> | void {
    if (!ev.action.isDial()) return;
    const action = ev.action;

    this.logger.debug(
      'Received Settings: %s',
      JSON.stringify(ev.payload.settings),
    );

    this.setSettings(action.id, ev.payload.settings);
    this.updateFeedback(action);
  }

  override onWillDisappear(ev: WillDisappearEvent<SpeedMeterDialSettings>): Promise<void> | void {
    const handler = this.handlers.get(ev.action.id);
    if (handler) {
      telemetryManager.off('data', handler);
      this.handlers.delete(ev.action.id);
    }
  }
}
