import { SpeedUnit, SuspensionMode, TempUnit } from '../types/settings';
import { clamp } from './utils';

// =============================================================================
// 汎用・レース情報フォーマット
// =============================================================================

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '--:--.---';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor(Math.round(seconds * 1000) % 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

export function formatLap(lap: number): string {
  return lap > 0 ? `LAP ${lap}` : 'LAP --';
}

export function formatPosition(pos: number): string {
  return pos > 0 ? `POS ${pos}` : 'POS --';
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

export function formatRpmBar(engineMaxRpm: number, currentEngineRpm: number): { value: number; bar_fill_c: string } {
  const rpmPercent = engineMaxRpm > 0 ? clamp((currentEngineRpm / engineMaxRpm) * 100, 0, 100) : 0;

  let barColor = '#ffffff';
  if (rpmPercent >= 85) {
    barColor = '#ff3b30'; // 赤（レッドゾーン）
  } else if (rpmPercent >= 70) {
    barColor = '#ffcc00'; // 黄
  }

  return { value: rpmPercent, bar_fill_c: barColor };
}

// =============================================================================
// タイヤ温度（Tire Temperature）用フォーマット
// =============================================================================

export function formatTemp(tempF: number, unit?: TempUnit): string {
  const value = unit === 'fahrenheit' ? tempF : (tempF - 32) / 1.8;
  const u = unit === 'fahrenheit' ? '°F' : '°C';
  return `${Math.round(value)}${u}`;
}

export function formatTireColor(tempF: number): string {
  const temp = (tempF - 32) / 1.8;

  if (temp < 60) {
    const ratio = clamp((temp - 40) / 20, 0, 1);
    const r = Math.round(0x00 * (1 - ratio) + 0x34 * ratio);
    const g = Math.round(0x7a * (1 - ratio) + 0xc7 * ratio);
    const b = Math.round(0xff * (1 - ratio) + 0x59 * ratio);
    return `rgb(${r},${g},${b})`;
  } else if (temp <= 90) {
    return '#34c759'; // 緑
  } else {
    const ratio = clamp((temp - 90) / 20, 0, 1);
    const r = Math.round(0x34 * (1 - ratio) + 0xff * ratio);
    const g = Math.round(0xc7 * (1 - ratio) + 0x3b * ratio);
    const b = Math.round(0x59 * (1 - ratio) + 0x30 * ratio);
    return `rgb(${r},${g},${b})`;
  }
}

// =============================================================================
// サスペンション移動量（Suspension Travel）用フォーマット
// =============================================================================

export function formatTravel(travel: number, mode?: SuspensionMode): string {
  return mode === 'value' ? travel.toFixed(2) : `${Math.round(travel * 100)}%`;
}

export function formatTravelColor(travel: number): string {
  if (travel > 0.8) return '#ff3b30';
  if (travel < 0.2) return '#007aff';
  return '#34c759';
}
