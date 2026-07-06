import {
  action,
  DialAction,
  KeyAction,
  KeyDownEvent,
  KeyUpEvent,
  WillAppearEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';

import { STANDARD_GRAVITY } from '../constants/constants';
import { telemetryManager } from '../telemetry/manager';
import { ForzaTelemetryData } from '../telemetry/parser';
import { toSvgDataUri } from '../utils/image';
import { PressDurationAction } from './press-duration';

const WIDTH = 144;
const HEIGHT = 144;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;
const MAX_RADIUS = 60;
const R_OUTER = MAX_RADIUS;
const R_INNER = MAX_RADIUS / 2;

function generateGForceSvg(
  curX: number,
  curZ: number,
  curTotal: number,
  peakX: number,
  peakZ: number,
  peakTotal: number,
  scale: number,
  showResetText: boolean = false,
): string {
  // 現在位置のプロット座標（スケール制限を超える場合は境界円上にクランプ）
  let currentPlotX: number;
  let currentPlotY: number;

  if (curTotal > scale) {
    currentPlotX = CX + (curX / curTotal) * MAX_RADIUS;
    currentPlotY = CY + (curZ / curTotal) * MAX_RADIUS;
  } else {
    currentPlotX = CX + (curX / scale) * MAX_RADIUS;
    currentPlotY = CY + (curZ / scale) * MAX_RADIUS;
  }

  // ピーク位置のプロット座標（スケール制限を超える場合は境界円上にクランプ）
  let peakPlotX: number;
  let peakPlotY: number;

  if (peakTotal > scale) {
    peakPlotX = CX + (peakX / peakTotal) * MAX_RADIUS;
    peakPlotY = CY + (peakZ / peakTotal) * MAX_RADIUS;
  } else {
    peakPlotX = CX + (peakX / scale) * MAX_RADIUS;
    peakPlotY = CY + (peakZ / scale) * MAX_RADIUS;
  }

  // 表示用テキストのフォーマット
  const scaleText = `${scale}G`;
  const peakText = peakTotal.toFixed(2);
  const currentGText = curTotal.toFixed(2);

  // リセット時のインジケーターテキスト
  const centerDisplay = showResetText
    ? `<text x="${CX}" y="${CY + 6}" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#00ff7f">RESET</text>`
    : '';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      ${/* 背景 */ ''}
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#000000"/>

      ${/* 十字ニュートラル軸 */ ''}
      <line x1="${CX - MAX_RADIUS}" y1="${CY}" x2="${CX + MAX_RADIUS}" y2="${CY}" stroke="#333333" stroke-width="2" stroke-dasharray="2,4"/>
      <line x1="${CX}" y1="${CY - MAX_RADIUS}" x2="${CX}" y2="${CY + MAX_RADIUS}" stroke="#333333" stroke-width="2" stroke-dasharray="2,4"/>

      ${/* ガイド円 */ ''}
      <circle cx="${CX}" cy="${CY}" r="${R_INNER}" fill="none" stroke="#333333" stroke-width="2" stroke-dasharray="4,4"/>
      <circle cx="${CX}" cy="${CY}" r="${R_OUTER}" fill="none" stroke="#444444" stroke-width="2"/>

      ${/* ピークGドット */ ''}
      <circle cx="${peakPlotX}" cy="${peakPlotY}" r="8" fill="#ffcc00" opacity="0.5"/>

      ${/* 現在のGボール */ ''}
      <circle cx="${currentPlotX}" cy="${currentPlotY}" r="8" fill="#ff3b30"/>
      ${/* ボールから中心へのガイドライン（進行方向を示す） */ ''}
      <line x1="${CX}" y1="${CY}" x2="${currentPlotX}" y2="${currentPlotY}" stroke="#ff3b30" stroke-width="6" opacity="0.5"/>

      ${/* 現在のスケール */ ''}
      <text x="10" y="134" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#999999">${scaleText}</text>
      ${/* ピークG */ ''}
      <text x="134" y="20" text-anchor="end" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffcc00">${peakText}</text>
      ${/* 現在のG */ ''}
      <text x="134" y="134" text-anchor="end" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff">${currentGText}</text>

      ${/* リセット表示 */ ''}
      ${centerDisplay}
    </svg>
  `.replace(/>\s+</g, '><').trim();
}

type GForceSettings = {
  scale?: number;
};

type EventAction = DialAction<GForceSettings> | KeyAction<GForceSettings>;

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.g-force',
})
export class GForceAction extends PressDurationAction<GForceSettings> {
  private readonly handlers = new Map<string, (data: ForzaTelemetryData) => void>();
  private readonly settings = new Map<string, GForceSettings>();
  private readonly peakGs = new Map<string, { x: number; z: number; total: number }>();
  private readonly lastTelemetryData = new Map<string, ForzaTelemetryData>();

  // リセット時のテキスト一時表示制御
  private readonly resetFeedbackTimers = new Map<string, NodeJS.Timeout>();
  private readonly showResetTexts = new Map<string, boolean>();

  // 長押し判定しきい値を 500ms に設定
  protected override longPressDurationMs = 500;

  private getScale(actionId: string): number {
    return this.settings.get(actionId)?.scale ?? 2;
  }

  private getPeakG(actionId: string): { x: number; z: number; total: number } {
    return this.peakGs.get(actionId) ?? { x: 0, z: 0, total: 0 };
  }

  private async toggleScale(action: EventAction) {
    const currentScale = this.getScale(action.id);
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

    const lastData = this.lastTelemetryData.get(action.id);
    this.updateImage(action, lastData);
  }

  /**
   * 1000ms ピークGをリセットし、「RESET」テキストを表示する。
   */
  private resetPeakG(action: EventAction) {
    this.peakGs.set(action.id, { x: 0, z: 0, total: 0 });

    this.showResetTexts.set(action.id, true);

    const lastData = this.lastTelemetryData.get(action.id);
    this.updateImage(action, lastData);

    // 既存のフィードバックタイマーがあればクリア
    const existingFeedbackTimer = this.resetFeedbackTimers.get(action.id);
    if (existingFeedbackTimer) {
      clearTimeout(existingFeedbackTimer);
    }

    const feedbackTimer = setTimeout(() => {
      this.showResetTexts.set(action.id, false);
      this.resetFeedbackTimers.delete(action.id);
      const currentData = this.lastTelemetryData.get(action.id);
      this.updateImage(action, currentData);
    }, 1000);

    this.resetFeedbackTimers.set(action.id, feedbackTimer);
  }

  private updateImage(action: EventAction, data?: ForzaTelemetryData) {
    let peak = this.getPeakG(action.id);
    const scale = this.getScale(action.id);
    const showResetText = this.showResetTexts.get(action.id) ?? false;

    let curX = 0;
    let curZ = 0;
    let curTotal = 0;

    if (data) {
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

    const svg = generateGForceSvg(
      curX,
      curZ,
      curTotal,
      peak.x,
      peak.z,
      peak.total,
      scale,
      showResetText,
    );

    action.setImage(toSvgDataUri(svg));
  }

  override onWillAppear(ev: WillAppearEvent<GForceSettings>): Promise<void> | void {
    this.settings.set(ev.action.id, ev.payload.settings);

    if (!this.peakGs.has(ev.action.id)) {
      this.peakGs.set(ev.action.id, { x: 0, z: 0, total: 0 });
    }

    // キャッシュされた最新データがある場合はそれを使って描画、なければ初期表示
    const cachedData = this.lastTelemetryData.get(ev.action.id);
    this.updateImage(ev.action, cachedData);

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

  protected override onDisappear(ev: WillDisappearEvent<GForceSettings>): Promise<void> | void {
    const existingHandler = this.handlers.get(ev.action.id);
    if (existingHandler) {
      telemetryManager.off('data', existingHandler);
      this.handlers.delete(ev.action.id);
    }

    // フィードバックタイマーのクリア
    const feedbackTimer = this.resetFeedbackTimers.get(ev.action.id);
    if (feedbackTimer) {
      clearTimeout(feedbackTimer);
      this.resetFeedbackTimers.delete(ev.action.id);
    }

    this.showResetTexts.delete(ev.action.id);
  }

  protected override onShortPress(ev: KeyUpEvent<GForceSettings>): void | Promise<void> {
    this.toggleScale(ev.action);
  }

  protected override onLongPress(ev: KeyDownEvent<GForceSettings>): void | Promise<void> {
    this.resetPeakG(ev.action);
  }
}
