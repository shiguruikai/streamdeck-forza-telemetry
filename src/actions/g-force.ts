import {
  action,
  DialAction,
  DialDownEvent,
  DialRotateEvent,
  DialUpEvent,
  KeyAction,
  KeyDownEvent,
  KeyUpEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';

import { STANDARD_GRAVITY } from '../constants/constants';
import { ForzaTelemetryData } from '../telemetry/parser';
import { createGForceImage } from '../utils/image';
import { clamp } from '../utils/utils';
import { PressDurationAction } from './press-duration';

const DEFAULT_SCALE = 2;

type GForceSettings = {
  scale?: number;
};

type EventAction = DialAction<GForceSettings> | KeyAction<GForceSettings>;

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.g-force',
})
export class GForceAction extends PressDurationAction<GForceSettings> {
  // リセット時のテキスト一時表示制御
  private readonly resetFeedbackTimers = new Map<string, NodeJS.Timeout>();
  private readonly showResetTexts = new Map<string, boolean>();

  // 画面切り替えを跨いでも値を保持しておく
  private readonly peakGs = new Map<string, { x: number; z: number; total: number }>();

  // 長押し判定しきい値を 500ms に設定
  protected override longPressDurationMs = 500;

  private async updateScale(action: EventAction, nextScale: number) {
    const newSettings = { scale: nextScale };
    this.setSettings(action.id, newSettings);
    await action.setSettings(newSettings);

    const lastData = this.getLastTelemetryData(action.id);
    this.updateImage(action, lastData);
  }

  private async toggleScale(action: EventAction) {
    const currentScale = this.getSettings(action.id)?.scale ?? DEFAULT_SCALE;
    const nextScale = currentScale === 1 ? 2 : currentScale === 2 ? 3 : 1;
    await this.updateScale(action, nextScale);
  }

  private resetPeakG(action: EventAction) {
    this.peakGs.set(action.id, { x: 0, z: 0, total: 0 });

    this.showResetTexts.set(action.id, true);

    const lastData = this.getLastTelemetryData(action.id);
    this.updateImage(action, lastData);

    const existingFeedbackTimer = this.resetFeedbackTimers.get(action.id);
    if (existingFeedbackTimer) {
      clearTimeout(existingFeedbackTimer);
    }

    const feedbackTimer = setTimeout(() => {
      this.showResetTexts.set(action.id, false);
      this.resetFeedbackTimers.delete(action.id);
      const lastData = this.getLastTelemetryData(action.id);
      this.updateImage(action, lastData);
    }, 1000);

    this.resetFeedbackTimers.set(action.id, feedbackTimer);
  }

  private updateImage(action: EventAction, data?: ForzaTelemetryData) {
    let peak = this.peakGs.get(action.id) ?? { x: 0, z: 0, total: 0 };
    const scale = this.getSettings(action.id)?.scale ?? DEFAULT_SCALE;
    const showResetText = this.showResetTexts.get(action.id) ?? false;

    let curX = 0;
    let curZ = 0;
    let curTotal = 0;

    if (showResetText) {
      // リセット表示中はピーク値を強制的にゼロにしておく
      peak = { x: 0, z: 0, total: 0 };
    } else if (data) {
      // テレメトリの加速度は m/s² なので、標準重力加速度で除算してG値（重力加速度）を算出
      // 左右慣性G（左カーブ・右方向加速度のときに慣性力は左に働くため、符号をマイナスに反転）
      curX = -data.accelerationX / STANDARD_GRAVITY;
      // 前後慣性G（加速・前方加速度のときに慣性力は後ろに働くため、符号は順方向。加速度正＝Gボールが後ろ／下へ）
      curZ = data.accelerationZ / STANDARD_GRAVITY;

      curTotal = Math.hypot(curX, curZ);

      // ピークGを超えたら更新
      if (curTotal > peak.total) {
        peak = { x: curX, z: curZ, total: curTotal };
        this.peakGs.set(action.id, peak);
      }
    }

    const isDial = action.isDial();
    const dataUri = createGForceImage(
      isDial,
      scale,
      curX,
      curZ,
      curTotal,
      peak,
      showResetText,
    );

    if (isDial) {
      action.setFeedback({ canvas: dataUri });
    } else {
      action.setImage(dataUri);
    }
  }

  protected override onTelemetryData(
    action: DialAction<GForceSettings> | KeyAction<GForceSettings>,
    data?: ForzaTelemetryData,
  ): void {
    this.updateImage(action, data);
  }

  override async onDialRotate(ev: DialRotateEvent<GForceSettings>): Promise<void> {
    if (!ev.action.isDial()) return;
    const currentScale = this.getSettings(ev.action.id)?.scale ?? DEFAULT_SCALE;
    const nextScale = clamp(currentScale + Math.sign(ev.payload.ticks), 1, 3);

    if (nextScale !== currentScale) {
      await this.updateScale(ev.action, nextScale);
    }
  }

  protected override onDisappear(ev: WillDisappearEvent<GForceSettings>): Promise<void> | void {
    const existingFeedbackTimer = this.resetFeedbackTimers.get(ev.action.id);
    if (existingFeedbackTimer) {
      clearTimeout(existingFeedbackTimer);
    }

    this.resetFeedbackTimers.delete(ev.action.id);
    this.showResetTexts.delete(ev.action.id);
    this.peakGs.delete(ev.action.id);
  }

  protected override onShortPress(ev: KeyUpEvent<GForceSettings> | DialUpEvent<GForceSettings>): void | Promise<void> {
    this.toggleScale(ev.action);
  }

  protected override onLongPress(ev: KeyDownEvent<GForceSettings> | DialDownEvent<GForceSettings>): void | Promise<void> {
    this.resetPeakG(ev.action);
  }
}
