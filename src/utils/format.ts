import { getGlobalSettings } from '../settings/settings';
import { PowerUnit, SpeedUnit, SuspensionMode, TempUnit, TorqueUnit } from '../shared';
import { ForzaTelemetryData } from '../telemetry/parser';
import { clamp, hslToRgb, hslToRgbHex } from './utils';

/**
 * 数値が有限の数値（number）であるか判定し、非有限値（NaN, Infinity, null, undefined）の場合はデフォルト値を返します。
 */
export function toFiniteNumber(val: number | null | undefined, fallback = 0): number {
  return val !== undefined && val !== null && Number.isFinite(val) ? val : fallback;
}

/**
 * 値が有限の数値（number）であるか判定します。非有限値（NaN, Infinity, null, undefined）の場合は false を返します。
 * 数値のテキストは、値がない（false の）場合に '--' を表示します。
 */
function isFiniteNumber(val: number | null | undefined): val is number {
  return val !== undefined && val !== null && Number.isFinite(val);
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

/**
 * 順位からレース中であるか判定します。
 * フリーロームなど、レース中でない場合の順位は0になるため、0以下（および値がない場合）はレース中ではないとみなします。
 */
function isRacing(racePosition: number | null | undefined): racePosition is number {
  return isFiniteNumber(racePosition) && racePosition > 0;
}

/**
 * 周回数（現在の周回）を数字のみの文字列にフォーマットします。
 * 完了したラップ数に1を加えた値を返し、レース中でない場合や値がない場合は '--' を返します。
 */
export function formatLapNumber(lap: number | null | undefined, racePosition: number | null | undefined): string {
  if (!isRacing(racePosition) || !isFiniteNumber(lap)) return '--';
  return (lap + 1).toString();
}

/**
 * 順位を数字のみの文字列にフォーマットします。レース中でない場合（順位が0以下）や値がない場合は '--' を返します。
 */
export function formatPositionNumber(pos: number | null | undefined): string {
  if (!isRacing(pos)) return '--';
  return pos.toString();
}

export function formatLap(lap: number | null | undefined, racePosition: number | null | undefined): string {
  return `LAP ${formatLapNumber(lap, racePosition).padStart(2, ' ')}`;
}

export function formatPosition(pos: number | null | undefined): string {
  return `POS ${formatPositionNumber(pos).padStart(2, ' ')}`;
}

export function formatGear(gear: number | null | undefined, previous?: string | null): string {
  // データがない（値がない）場合は '--' を返す。
  if (!isFiniteNumber(gear)) return '--';
  // ギアが有効範囲外の場合、previous を返す。
  // NOTE: 実機において、シフトチェンジの瞬間に11の値となることがあるので、11以上は無効値として扱う。
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
  if (!isFiniteNumber(speed)) return '--';
  // 単位未指定時は formatSpeedUnit と同じく km/h とする
  return Math.round(speed * (unit === 'mph' ? 3.6 / 1.609344 : 3.6)).toString();
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
  if (!isFiniteNumber(powerW)) return '--';
  const v = Math.max(0, powerW);
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
  if (!isFiniteNumber(torqueNm)) return '--';
  const v = Math.max(0, torqueNm);
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
  const u = unit === 'fahrenheit' ? '℉' : '℃';
  if (!isFiniteNumber(tempF)) return `--${u}`;
  const value = unit === 'fahrenheit' ? tempF : fahrenheitToCelsius(tempF);
  return `${Math.round(value)}${u}`;
}

/**
 * タイヤ温度に応じてメーターの表示色を決定します（彩度100%、輝度55%）。
 * - 40℃未満：青（240°）固定
 * - 40℃～80℃：冷えている（青から緑へのグラデーション）
 * - 80℃～100℃：適正動作温度（緑固定）
 * - 100℃～120℃：過熱警告（緑から赤へのグラデーション）
 * - 120℃超：赤（0°）固定
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
  if (!isFiniteNumber(travel)) return mode === 'value' ? '--' : '--%';
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
  // 値がない場合、方位盤は 0°（北）の位置のまま、テキストのみ '--°' とする
  if (!isFiniteNumber(yaw)) return { heading: 0, headingStr: '--°' };
  const deg = yaw * (180 / Math.PI);
  const heading = (Math.round(deg) % 360 + 360) % 360;
  const headingStr = `${heading}°`;
  return { heading, headingStr };
}

// =============================================================================
// 車両スペック（Car Spec）
// =============================================================================

export type CarClassResult = { label: string; color: string };

const FH_CLASS_COLORS = {
  D: hslToRgbHex(198, 100, 45),
  C: hslToRgbHex(43, 100, 45),
  B: hslToRgbHex(16, 100, 45),
  A: hslToRgbHex(349, 100, 45),
  S1: hslToRgbHex(279, 100, 45),
  S2: hslToRgbHex(220, 100, 45),
  R: hslToRgbHex(317, 100, 45),
  X: hslToRgbHex(140, 100, 45),
  NONE: hslToRgbHex(0, 0, 45),
} as const;

const FM_CLASS_COLORS = {
  D: FH_CLASS_COLORS.D,
  C: FH_CLASS_COLORS.C,
  B: FH_CLASS_COLORS.B,
  A: FH_CLASS_COLORS.A,
  S: FH_CLASS_COLORS.S1,
  R: FH_CLASS_COLORS.S2,
  P: FH_CLASS_COLORS.X,
  X: hslToRgbHex(140, 50, 45),
  NONE: FH_CLASS_COLORS.NONE,
} as const;

/**
 * クラス番号と PI 値の組み合わせから Forza Horizon 6（FH6）データであるか判定します。
 */
function isFH6(carClass: number, pi: number): boolean {
  // FH6 特有の条件: carClass = 7（Xクラス）または carClass = 6 で PI < 999（Rクラス）
  if (carClass === 7 || (carClass === 6 && pi < 999)) {
    return true;
  }

  // 各クラスの PI 範囲から FH6 を判定
  // FH6: D(<=400), C(<=500), B(<=600), A(<=700), S1(<=800), S2(<=900)
  if (carClass >= 0 && carClass <= 5) {
    return pi <= (carClass + 4) * 100;
  }

  return false;
}

export function formatCarClass(
  data: Readonly<Pick<ForzaTelemetryData, 'game' | 'carClass' | 'carPerformanceIndex'>> | null | undefined,
): CarClassResult {
  if (!data || !Number.isFinite(data.carPerformanceIndex) || data.carPerformanceIndex <= 0) {
    return { label: '-', color: FH_CLASS_COLORS.NONE };
  }

  if (data.game === 'motorsport') {
    switch (data.carClass) {
      case 0: return { label: 'D', color: FM_CLASS_COLORS.D };
      case 1: return { label: 'C', color: FM_CLASS_COLORS.C };
      case 2: return { label: 'B', color: FM_CLASS_COLORS.B };
      case 3: return { label: 'A', color: FM_CLASS_COLORS.A };
      case 4: return { label: 'S', color: FM_CLASS_COLORS.S };
      case 5: return { label: 'R', color: FM_CLASS_COLORS.R };
      case 6: return { label: 'P', color: FM_CLASS_COLORS.P };
      case 7: return { label: 'X', color: FM_CLASS_COLORS.X };
      default: return { label: '-', color: FM_CLASS_COLORS.NONE };
    }
  } else if (isFH6(data.carClass, data.carPerformanceIndex)) {
    switch (data.carClass) {
      case 0: return { label: 'D', color: FH_CLASS_COLORS.D };
      case 1: return { label: 'C', color: FH_CLASS_COLORS.C };
      case 2: return { label: 'B', color: FH_CLASS_COLORS.B };
      case 3: return { label: 'A', color: FH_CLASS_COLORS.A };
      case 4: return { label: 'S1', color: FH_CLASS_COLORS.S1 };
      case 5: return { label: 'S2', color: FH_CLASS_COLORS.S2 };
      case 6: return { label: 'R', color: FH_CLASS_COLORS.R };
      case 7: return { label: 'X', color: FH_CLASS_COLORS.X };
      default: return { label: '-', color: FH_CLASS_COLORS.NONE };
    }
  } else {
  // FH5
    switch (data.carClass) {
      case 0: return { label: 'D', color: FH_CLASS_COLORS.D };
      case 1: return { label: 'C', color: FH_CLASS_COLORS.C };
      case 2: return { label: 'B', color: FH_CLASS_COLORS.B };
      case 3: return { label: 'A', color: FH_CLASS_COLORS.A };
      case 4: return { label: 'S1', color: FH_CLASS_COLORS.S1 };
      case 5: return { label: 'S2', color: FH_CLASS_COLORS.S2 };
      case 6: return { label: 'X', color: FH_CLASS_COLORS.X };
      default: return { label: '-', color: FH_CLASS_COLORS.NONE };
    }
  }
}

export function formatCarPI(pi: number | null | undefined): string {
  if (pi === undefined || pi === null || !Number.isFinite(pi) || pi <= 0) {
    return '---';
  }
  return pi.toString();
}

export function formatDrivetrain(drivetrain: number | null | undefined): string {
  const d = toFiniteNumber(drivetrain, -1);
  switch (d) {
    case 0:
      return 'FWD';
    case 1:
      return 'RWD';
    case 2:
      return 'AWD';
    default:
      return '---';
  }
}

export function formatCylinders(cylinders: number | null | undefined): string {
  const c = toFiniteNumber(cylinders, -1);
  if (c < 0) {
    return '---';
  }
  if (c === 0) {
    return 'EV';
  }
  return `${c}Cyl`;
}

export type CarSpecFormatted = {
  classLabel: string;
  classColor: string;
  piStr: string;
  drivetrainStr: string;
  cylindersStr: string;
};

export function formatCarSpec(
  data: Readonly<Pick<ForzaTelemetryData, 'game' | 'carClass' | 'carPerformanceIndex' | 'drivetrainType' | 'numCylinders'>> | null | undefined,
): CarSpecFormatted {
  const isInvalidPI = !data || !Number.isFinite(data.carPerformanceIndex) || data.carPerformanceIndex <= 0;

  const targetData = isInvalidPI ? undefined : data;
  const { label: classLabel, color: classColor } = formatCarClass(targetData);

  return {
    classLabel,
    classColor,
    piStr: formatCarPI(targetData?.carPerformanceIndex),
    drivetrainStr: formatDrivetrain(targetData?.drivetrainType),
    cylindersStr: formatCylinders(targetData?.numCylinders),
  };
}
