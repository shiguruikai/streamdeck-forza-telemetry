import {
  action,
  DialAction,
  DialDownEvent,
  DialUpEvent,
  DidReceiveSettingsEvent,
  KeyAction,
  KeyDownEvent,
  KeyUpEvent,
  WillAppearEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';

import { STANDARD_GRAVITY } from '../constants/constants';
import { telemetryManager } from '../telemetry/manager';
import { ForzaTelemetryData } from '../telemetry/parser';
import { toSvgDataUri } from '../utils/utils';
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
  private readonly settings = new Map<string, GForceSettings>();
  private readonly handlers = new Map<string, (data: ForzaTelemetryData) => void>();

  // リセット時のテキスト一時表示制御
  private readonly resetFeedbackTimers = new Map<string, NodeJS.Timeout>();
  private readonly showResetTexts = new Map<string, boolean>();

  // 画面切り替えを跨いでも値を保持しておく
  private readonly lastTelemetryData = new Map<string, ForzaTelemetryData>();
  private readonly peakGs = new Map<string, { x: number; z: number; total: number }>();

  // 長押し判定しきい値を 500ms に設定
  protected override longPressDurationMs = 500;

  private async toggleScale(action: EventAction) {
    const currentScale = this.settings.get(action.id)?.scale;
    let nextScale: number;
    if (currentScale === 1) {
      nextScale = 2;
    } else if (currentScale === 2) {
      nextScale = 3;
    } else {
      nextScale = 1;
    }

    const newSettings = { scale: nextScale };
    this.settings.set(action.id, newSettings);

    // 設定を永続化
    await action.setSettings(newSettings);

    // 即座に再描画する
    const lastData = this.lastTelemetryData.get(action.id);
    this.updateImage(action, lastData);
  }

  private resetPeakG(action: EventAction) {
    this.peakGs.set(action.id, { x: 0, z: 0, total: 0 });

    this.showResetTexts.set(action.id, true);

    const lastData = this.lastTelemetryData.get(action.id);
    this.updateImage(action, lastData);

    const existingFeedbackTimer = this.resetFeedbackTimers.get(action.id);
    if (existingFeedbackTimer) {
      clearTimeout(existingFeedbackTimer);
    }

    const feedbackTimer = setTimeout(() => {
      this.showResetTexts.set(action.id, false);
      this.resetFeedbackTimers.delete(action.id);
      const lastData = this.lastTelemetryData.get(action.id);
      this.updateImage(action, lastData);
    }, 1000);

    this.resetFeedbackTimers.set(action.id, feedbackTimer);
  }

  private updateImage(action: EventAction, data?: ForzaTelemetryData) {
    let peak = this.peakGs.get(action.id) ?? { x: 0, z: 0, total: 0 };
    const scale = this.settings.get(action.id)?.scale ?? DEFAULT_SCALE;
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

    // ダイヤル（200x100）、キー（144x144）
    const width = isDial ? 200 : 144;
    const height = isDial ? 100 : 144;

    // 中心座標
    const cx = width / 2;
    const cy = height / 2;

    // 半径
    const maxRadius = isDial ? 42 : 56;
    const rOuter = maxRadius;
    const rInner = maxRadius / 2;
    const rBall = maxRadius / 7;

    // 現在位置のプロット座標（スケール制限を超える場合、境界円上にクランプ）
    let currentPlotX: number;
    let currentPlotY: number;
    if (curTotal > scale) {
      currentPlotX = cx + (curX / curTotal) * maxRadius;
      currentPlotY = cy + (curZ / curTotal) * maxRadius;
    } else {
      currentPlotX = cx + (curX / scale) * maxRadius;
      currentPlotY = cy + (curZ / scale) * maxRadius;
    }

    // ピーク位置のプロット座標（スケール制限を超える場合、境界円上にクランプ）
    let peakPlotX: number;
    let peakPlotY: number;
    if (peak.total > scale) {
      peakPlotX = cx + (peak.x / peak.total) * maxRadius;
      peakPlotY = cy + (peak.z / peak.total) * maxRadius;
    } else {
      peakPlotX = cx + (peak.x / scale) * maxRadius;
      peakPlotY = cy + (peak.z / scale) * maxRadius;
    }

    // 表示用テキストのフォーマット
    const scaleText = `${scale.toFixed(1)}G`;
    const peakText = peak.total.toFixed(2);
    const currentGText = curTotal.toFixed(2);

    // リセット時のインジケーターテキスト
    const centerDisplay = showResetText
      ? `<text x="${cx}" y="${cy + 7}" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#00ff7f">RESET</text>`
      : '';

    // テキスト描画座標
    const padding = 10; // 上下の余白
    const leftTextX = padding;
    const rightTextX = width - padding;
    const bottomTextY = height - padding;

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#000000"/>
  <line x1="${cx - maxRadius}" y1="${cy}" x2="${cx + maxRadius}" y2="${cy}" stroke="#333333" stroke-width="2" stroke-dasharray="2,4"/>
  <line x1="${cx}" y1="${cy - maxRadius}" x2="${cx}" y2="${cy + maxRadius}" stroke="#333333" stroke-width="2" stroke-dasharray="2,4"/>
  <circle cx="${cx}" cy="${cy}" r="${rInner}" fill="none" stroke="#333333" stroke-width="2" stroke-dasharray="4,4"/>
  <circle cx="${cx}" cy="${cy}" r="${rOuter}" fill="none" stroke="#444444" stroke-width="2"/>
  <circle cx="${peakPlotX}" cy="${peakPlotY}" r="${rBall}" fill="#ffcc00" opacity="0.5"/>
  <circle cx="${currentPlotX}" cy="${currentPlotY}" r="${rBall}" fill="#ff3b30"/>
  <line x1="${cx}" y1="${cy}" x2="${currentPlotX}" y2="${currentPlotY}" stroke="#ff3b30" stroke-width="6" opacity="0.5"/>
  <text x="${leftTextX}" y="${bottomTextY}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#7f7f7f">${scaleText}</text>
  <text x="${rightTextX}" y="22" text-anchor="end" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffcc00">${peakText}</text>
  <text x="${rightTextX}" y="${bottomTextY}" text-anchor="end" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff">${currentGText}</text>
  ${centerDisplay}
</svg>
`;

    const dataUri = toSvgDataUri(svg);

    if (isDial) {
      action.setFeedback({ canvas: dataUri });
    } else {
      action.setImage(dataUri);
    }
  }

  override onWillAppear(ev: WillAppearEvent<GForceSettings>): Promise<void> | void {
    this.settings.set(ev.action.id, ev.payload.settings);

    const lastData = this.lastTelemetryData.get(ev.action.id);
    this.updateImage(ev.action, lastData);

    const existingHandler = this.handlers.get(ev.action.id);
    if (existingHandler) {
      telemetryManager.off('data', existingHandler);
    }

    const dataHandler = (data: ForzaTelemetryData) => {
      this.lastTelemetryData.set(ev.action.id, data);
      this.updateImage(ev.action, data);
    };

    this.handlers.set(ev.action.id, dataHandler);
    telemetryManager.on('data', dataHandler);
  }

  override onDidReceiveSettings(ev: DidReceiveSettingsEvent<GForceSettings>): Promise<void> | void {
    this.settings.set(ev.action.id, ev.payload.settings);
    const lastData = this.lastTelemetryData.get(ev.action.id);
    this.updateImage(ev.action, lastData);
  }

  protected override onDisappear(ev: WillDisappearEvent<GForceSettings>): Promise<void> | void {
    const existingHandler = this.handlers.get(ev.action.id);
    if (existingHandler) {
      telemetryManager.off('data', existingHandler);
    }

    const existingFeedbackTimer = this.resetFeedbackTimers.get(ev.action.id);
    if (existingFeedbackTimer) {
      clearTimeout(existingFeedbackTimer);
    }

    this.handlers.delete(ev.action.id);
    this.settings.delete(ev.action.id);
    this.resetFeedbackTimers.delete(ev.action.id);
    this.showResetTexts.delete(ev.action.id);
  }

  protected override onShortPress(ev: KeyUpEvent<GForceSettings> | DialUpEvent<GForceSettings>): void | Promise<void> {
    this.toggleScale(ev.action);
  }

  protected override onLongPress(ev: KeyDownEvent<GForceSettings> | DialDownEvent<GForceSettings>): void | Promise<void> {
    this.resetPeakG(ev.action);
  }
}
