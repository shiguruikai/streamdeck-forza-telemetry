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

import { ForzaTelemetryData } from '../telemetry/parser';
import { generateGForceImage } from '../utils/graphics';
import { clamp } from '../utils/utils';
import { TelemetryAction } from './telemetry-action';

const STANDARD_GRAVITY = 9.80665;
const DEFAULT_SCALE = 2;

type GForceSettings = {
  scale?: number;
  showPeakG?: boolean;
};

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.g-force',
})
export class GForceAction extends TelemetryAction<GForceSettings> {
  // リセット時のテキスト一時表示制御
  private readonly resetFeedbackTimers = new Map<string, NodeJS.Timeout>();
  private readonly showResetTexts = new Map<string, boolean>();

  // 画面切り替えを跨いでも値を保持しておく
  private readonly peakGs = new Map<string, { x: number; z: number; total: number }>();

  private async updateImage(
    action: DialAction<GForceSettings> | KeyAction<GForceSettings>,
    data?: ForzaTelemetryData,
  ): Promise<void> {
    const { showPeakG = true, scale = DEFAULT_SCALE } = this.getSettings(action.id) ?? {};

    const showResetText = this.showResetTexts.get(action.id) ?? false;

    const current = { x: 0, z: 0, total: 0 };
    let peak = this.peakGs.get(action.id) ?? { x: 0, z: 0, total: 0 };

    if (showResetText) {
      // リセット表示中はピーク値を強制的にゼロにしておく
      peak = { x: 0, z: 0, total: 0 };
    } else if (data) {
      // テレメトリの加速度は m/s² なので、標準重力加速度で除算してG値（重力加速度）を算出
      // 左右慣性G（左カーブ・右方向加速度のときに慣性力は左に働くため、符号をマイナスに反転）
      current.x = -data.accelerationX / STANDARD_GRAVITY;
      // 前後慣性G（加速・前方加速度のときに慣性力は後ろに働くため、符号は順方向。加速度正＝Gボールが後ろ／下へ）
      current.z = data.accelerationZ / STANDARD_GRAVITY;

      current.total = Math.hypot(current.x, current.z);

      // ピークGを超えたら更新
      if (current.total > peak.total) {
        peak = current;
        this.peakGs.set(action.id, peak);
      }
    }

    const isDial = action.isDial();
    const dataUri = generateGForceImage(
      isDial,
      scale,
      current,
      showPeakG ? peak : null,
      showResetText,
      this.getTitleInfo(action.id),
    );

    if (isDial) {
      await action.setFeedback({ canvas: dataUri });
    } else {
      await action.setImage(dataUri);
    }
  }

  protected override async onTelemetryData(
    action: DialAction<GForceSettings> | KeyAction<GForceSettings>,
    data?: ForzaTelemetryData,
  ): Promise<void> {
    await this.updateImage(action, data);
  }

  protected override onDisappear(ev: WillDisappearEvent<GForceSettings>): Promise<void> | void {
    const existingFeedbackTimer = this.resetFeedbackTimers.get(ev.action.id);
    if (existingFeedbackTimer) {
      clearTimeout(existingFeedbackTimer);
    }

    this.resetFeedbackTimers.delete(ev.action.id);
    this.showResetTexts.delete(ev.action.id);
  }

  /**
   * キーまたはダイヤル短押し時でスケールを切り替える。
   */
  protected override async onShortPress(ev: KeyUpEvent<GForceSettings> | DialUpEvent<GForceSettings>): Promise<void> {
    const currentSettings = ev.payload.settings;
    const currentScale = currentSettings.scale ?? DEFAULT_SCALE;
    const nextScale = currentScale === 1 ? 2 : currentScale === 2 ? 3 : 1;
    const newSettings = { ...currentSettings, scale: nextScale };
    await this.setSettings(ev.action.id, newSettings);
    await this.updateImage(ev.action, this.getLastTelemetryData(ev.action.id));
  }

  /**
   * キーまたはダイヤル長押し時でピークGをリセットする。
   */
  protected override async onLongPress(ev: KeyDownEvent<GForceSettings> | DialDownEvent<GForceSettings>): Promise<void> {
    const { action } = ev;

    this.peakGs.set(action.id, { x: 0, z: 0, total: 0 });

    this.showResetTexts.set(action.id, true);

    const lastData = this.getLastTelemetryData(action.id);
    await this.updateImage(action, lastData);

    const existingFeedbackTimer = this.resetFeedbackTimers.get(action.id);
    if (existingFeedbackTimer) {
      clearTimeout(existingFeedbackTimer);
    }

    const feedbackTimer = setTimeout(() => {
      this.showResetTexts.set(action.id, false);
      this.resetFeedbackTimers.delete(action.id);
      const lastData = this.getLastTelemetryData(action.id);
      void this.updateImage(action, lastData);
    }, 1000);

    this.resetFeedbackTimers.set(action.id, feedbackTimer);
  }

  /**
   * ダイヤル回転でレイアウトを切り替える。
   */
  override async onDialRotate(ev: DialRotateEvent<GForceSettings>): Promise<void> {
    const currentSettings = ev.payload.settings;
    const currentScale = ev.payload.settings.scale ?? DEFAULT_SCALE;
    const nextScale = clamp(currentScale + ev.payload.ticks, 1, 3);

    if (currentScale !== nextScale) {
      const newSettings = { ...currentSettings, scale: nextScale };
      await this.setSettings(ev.action.id, newSettings);
      await this.updateImage(ev.action, this.getLastTelemetryData(ev.action.id));
    }
  }
}
