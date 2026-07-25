import { getGlobalSettings } from '../settings/settings';
import { PowerUnit, SpeedUnit, SuspensionMode, TempUnit, TorqueUnit } from '../shared';
import { clamp, hslToRgb } from './utils';

/**
 * 数値が有限の数値（number）であるか判定し、非有限値（NaN, Infinity, null, undefined）の場合はデフォルト値を返します。
 */
function toFiniteNumber(val: number | null | undefined, fallback = 0): number {
  return val !== undefined && val !== null && Number.isFinite(val) ? val : fallback;
}

// =============================================================================
// レース情報・共通（Race Info & Common）
// =============================================================================

/**
 * 秒数を「分:秒.ミリ秒」（M:SS.mmm）形式の文字列にフォーマットします。
 * 0 以下の数値や非有限値（NaN / Infinity）は未計測扱いとして '--:--.---' を返します。
 */
export function formatTime(seconds: number | null | undefined): string {
  if (seconds === undefined || seconds === null || !Number.isFinite(seconds) || seconds <= 0) {
    return '--:--.---';
  }
  const totalMs = Math.round(seconds * 1000);
  const mins = Math.floor(totalMs / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

export function formatLap(lap: number | null | undefined): string {
  if (lap === undefined || lap === null || !Number.isFinite(lap)) return 'LAP --';
  return `LAP ${(lap + 1).toString().padStart(2, ' ')}`;
}

export function formatPosition(pos: number | null | undefined): string {
  if (pos === undefined || pos === null || !Number.isFinite(pos)) return 'POS --';
  return `POS ${pos.toString().padStart(2, ' ')}`;
}

export function formatGear(gear: number | null | undefined, previous?: string | null): string {
  // ギアが有効範囲外または NaN の場合、previous を返す。
  // NOTE: 実機において、シフトチェンジの瞬間に11の値となることがあるので、11以上は無効値として扱う。
  if (gear === undefined || gear === null || !Number.isFinite(gear)) return previous ?? 'N';
  if (gear < 0 || gear > 10) return previous ?? 'N';
  return gear === 0 ? 'R' : gear.toString();
}

// =============================================================================
// 速度・エンジン回転数（Speed & Engine RPM）
// =============================================================================

export function formatSpeedUnit(unit?: SpeedUnit): string {
  return unit === 'mph' ? 'MPH' : 'KM/H';
}

export function formatSpeed(speed: number | null | undefined, unit?: SpeedUnit): string {
  const s = toFiniteNumber(speed);
  return Math.round(s * (unit === 'kmh' ? 3.6 : 3.6 / 1.609344)).toString();
}

export function formatRpmBar(
  currentEngineRpm: number | null | undefined, engineMaxRpm: number | null | undefined,
): { rpm: number; rpmPct: number; rpmColor: string } {
  const currentRpm = toFiniteNumber(currentEngineRpm);
  const maxRpm = toFiniteNumber(engineMaxRpm);
  const rpmPct = maxRpm > 0 ? clamp(currentRpm / maxRpm, 0, 1) : 0;

  const { rpmRevPct, rpmWarnPct, rpmRevColor, rpmWarnColor, rpmNormalColor } = getGlobalSettings();
  const revPct = clamp(rpmRevPct / 100, 0, 1);
  const warnPct = clamp(Math.min(rpmWarnPct / 100, revPct), 0, 1);

  let rpmColor: string;
  if (rpmPct >= revPct) {
    rpmColor = rpmRevColor;
  } else if (rpmPct >= warnPct) {
    rpmColor = rpmWarnColor;
  } else {
    rpmColor = rpmNormalColor;
  }
  return { rpm: currentRpm, rpmPct, rpmColor };
}

// =============================================================================
// エンジン出力・トルク（Power & Torque）
// =============================================================================

export function formatPowerUnit(unit: PowerUnit = 'ps'): string {
  switch (unit) {
    case 'kw':
      return 'kW';
    case 'hp':
      return 'HP';
    case 'ps':
    default:
      return 'PS';
  }
}

export function formatPower(powerW: number | null | undefined, unit: PowerUnit = 'ps'): string {
  const v = toFiniteNumber(powerW);
  let result = 0;
  switch (unit) {
    case 'ps':
      result = v / 735.49875;
      break;
    case 'hp':
      result = v / 745.699872;
      break;
    case 'kw':
      result = v / 1000.0;
      break;
  }
  return Math.round(result).toString();
}

export function formatTorqueUnit(unit: TorqueUnit = 'nm'): string {
  switch (unit) {
    case 'kgfm':
      return 'kgf·m';
    case 'ftlb':
      return 'ft·lb';
    case 'nm':
    default:
      return 'N·m';
  }
}

export function formatTorque(torqueNm: number | null | undefined, unit: TorqueUnit = 'nm'): string {
  const v = toFiniteNumber(torqueNm);
  let result = 0;
  switch (unit) {
    case 'nm':
      result = v;
      break;
    case 'kgfm':
      result = v / 9.80665;
      break;
    case 'ftlb':
      result = v * 0.737562149;
      break;
  }
  return Math.round(result).toString();
}

// =============================================================================
// タイヤ温度（Tire Temperature）
// =============================================================================

/**
 * 華氏を摂氏に変換します。
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) / 1.8;
}

export function formatTemp(tempF: number | null | undefined, unit?: TempUnit): string {
  const t = toFiniteNumber(tempF);
  const value = unit === 'fahrenheit' ? t : fahrenheitToCelsius(t);
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

    const { r, g, b } = hslToRgb(hue, 100, 55);
    result.push(`rgb(${r},${g},${b})`);
  }

  return result;
})();

export function formatTireColor(tempF: number | null | undefined): string {
  const t = toFiniteNumber(tempF);
  const tempC = Math.round(fahrenheitToCelsius(t)) - MIN_TIRE_COLORS_TEMP_C;
  const index = clamp(tempC, 0, MAX_TIRE_COLORS_TEMP_C - MIN_TIRE_COLORS_TEMP_C);
  return TIRE_COLORS[index] ?? TIRE_COLORS[0];
}

// =============================================================================
// サスペンション移動量（Suspension Travel）
// =============================================================================

export function formatTravel(travel: number | null | undefined, mode?: SuspensionMode): string {
  const t = toFiniteNumber(travel);
  return mode === 'value' ? t.toFixed(2) : `${Math.round(t * 100)}%`;
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

    const { r, g, b } = hslToRgb(hue, 100, 55);
    result.push(`rgb(${r},${g},${b})`);
  }

  return result;
})();

export function formatTravelColor(travel: number | null | undefined): string {
  const t = toFiniteNumber(travel);
  const index = clamp(Math.round(t * 100), 0, 100);
  return SUSPENSION_TRAVEL_COLORS[index] ?? SUSPENSION_TRAVEL_COLORS[0];
}

// =============================================================================
// コンパス・方位（Heading）
// =============================================================================

export function formatHeading(yaw: number | null | undefined): { heading: number; headingStr: string } {
  const y = toFiniteNumber(yaw);
  const deg = y * (180 / Math.PI);
  const heading = (Math.round(deg) % 360 + 360) % 360;
  const headingStr = `${heading}°`;
  return { heading, headingStr };
}
