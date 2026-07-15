import { SpeedUnit, SuspensionMode, TempUnit } from '../settings/settings';
import { Color } from './image';
import { clamp, hslToRgb } from './utils';

// =============================================================================
// 汎用・レース情報フォーマット
// =============================================================================

export function formatTime(seconds?: number): string {
  if (seconds === undefined || !Number.isFinite(seconds) || seconds <= 0) {
    return '--:--.---';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor(Math.round(seconds * 1000) % 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

export function formatLap(lap?: number): string {
  return lap === undefined ? 'LAP --' : `LAP ${(lap + 1).toString().padStart(2, ' ')}`;
}

export function formatPosition(pos?: number): string {
  return pos === undefined ? 'POS --' : `POS ${pos.toString().padStart(2, ' ')}`;
}

// =============================================================================
// 速度計（Speed Meter）用フォーマット
// =============================================================================

export function formatUnit(unit?: SpeedUnit): string {
  return unit === 'mph' ? 'MPH' : 'KM/H';
}

export function formatSpeed(speed: number, unit?: SpeedUnit): string {
  return Math.floor(speed * (unit === 'kmh' ? 3.6 : 2.23694)).toString();
}

export function formatGear(gear: number): string | null {
  // ギアが有効範囲外の場合、null を返す。
  // NOTE: 実機において、シフトチェンジの瞬間に11の値となることがあるので、11以上は無効値として扱う。
  if (gear < 0 || gear > 10) return null;
  return gear === 0 ? 'R' : gear.toString();
}

export function formatRpmBar(
  currentEngineRpm: number | null | undefined, engineMaxRpm: number | null | undefined,
): { rpm: number; rpmPct: number; rpmColor: string } {
  currentEngineRpm ??= 0;
  engineMaxRpm ??= 0;
  const rpmPct = engineMaxRpm > 0 ? clamp(currentEngineRpm / engineMaxRpm, 0, 1) : 0;
  let rpmColor;
  if (rpmPct >= 0.85) {
    rpmColor = Color.RED;
  } else if (rpmPct >= 0.7) {
    rpmColor = Color.YELLOW;
  } else {
    rpmColor = Color.WHITE;
  }
  return { rpm: currentEngineRpm, rpmPct, rpmColor };
}

// =============================================================================
// タイヤ温度（Tire Temperature）用フォーマット
// =============================================================================

/**
 * 華氏を摂氏に変換します。
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) / 1.8;
}

export function formatTemp(tempF: number, unit?: TempUnit): string {
  const value = unit === 'fahrenheit' ? tempF : fahrenheitToCelsius(tempF);
  const u = unit === 'fahrenheit' ? '℉' : '℃';
  return `${Math.round(value)}${u}`;
}

/**
 * タイヤ温度に応じてメーターの表示色を決定します。
 * - 80℃未満：冷えている（水色～緑のグラデーション）
 * - 80℃～100℃：適正動作温度（緑色固定）
 * - 100℃～120℃：警告・過熱状態（緑～黄～赤のグラデーション、120℃で完全に赤色）
 */

const MIN_TIRE_COLORS_TEMP_C = 40;
const MAX_TIRE_COLORS_TEMP_C = 120;

// 40℃から120℃までのRGBカラー文字列を保持するキャッシュ配列
const TIRE_COLORS: string[] = (function () {
  const result = [];

  for (let t = MIN_TIRE_COLORS_TEMP_C; t <= MAX_TIRE_COLORS_TEMP_C; t++) {
    // デフォルト：緑（80℃〜100℃）
    let hue = 120;

    if (t < 80) {
      // 40℃（青:240°）から 80℃（緑:120°）へ変化
      const ratio = (t - 40) / (80 - 40);
      hue = 240 - (240 - 120) * ratio;
    } else if (t > 100) {
      // 100℃（緑:120°）から 120℃（赤:0°）へ変化
      const ratio = (t - 100) / (120 - 100);
      hue = 120 - 120 * ratio;
    }

    const { r, g, b } = hslToRgb(hue, 100, 60);
    result.push(`rgb(${r},${g},${b})`);
  }

  return result;
})();

export function formatTireColor(tempF: number): string {
  const tempC = Math.round(fahrenheitToCelsius(tempF)) - MIN_TIRE_COLORS_TEMP_C;
  const index = clamp(tempC, 0, MAX_TIRE_COLORS_TEMP_C - MIN_TIRE_COLORS_TEMP_C);
  return TIRE_COLORS[index];
}

// =============================================================================
// サスペンション移動量（Suspension Travel）用フォーマット
// =============================================================================

export function formatTravel(travel: number, mode?: SuspensionMode): string {
  return mode === 'value' ? travel.toFixed(2) : `${Math.round(travel * 100)}%`;
}

// 0%から100%まで1%刻みのRGBカラー文字列を保持するキャッシュ配列
const SUSPENSION_TRAVEL_COLORS: string[] = (function () {
  const result = [];

  for (let t = 0; t <= 100; t++) {
    // デフォルト：緑（40%〜60%）
    let hue = 120;

    if (t < 40) {
      // 0%（青:240°）から 40%（緑:120°）へ変化
      const ratio = t / 40;
      hue = 240 - (240 - 120) * ratio;
    } else if (t > 60) {
      // 60%（緑:120°）から 100%（赤:0°）へ変化
      const ratio = (t - 60) / (100 - 60);
      hue = 120 - 120 * ratio;
    }

    const { r, g, b } = hslToRgb(hue, 100, 60);
    result.push(`rgb(${r},${g},${b})`);
  }

  return result;
})();

export function formatTravelColor(travel: number): string {
  const index = clamp(Math.round(travel * 100), 0, 100);
  return SUSPENSION_TRAVEL_COLORS[index];
}
