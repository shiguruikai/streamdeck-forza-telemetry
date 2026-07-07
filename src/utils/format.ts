import { SpeedUnit, SuspensionMode, TempUnit } from '../types/settings';

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
  const rpmPercent = engineMaxRpm > 0 ? Math.min(100, Math.max(0, (currentEngineRpm / engineMaxRpm) * 100)) : 0;

  let barColor = '#ffffff';
  if (rpmPercent >= 85) {
    barColor = '#ff3b30'; // 赤（レッドゾーン）
  } else if (rpmPercent >= 70) {
    barColor = '#ffcc00'; // 黄
  }

  return { value: rpmPercent, bar_fill_c: barColor };
}

export function formatTravel(travel: number, mode?: SuspensionMode): string {
  return mode === 'value' ? travel.toFixed(2) : `${Math.round(travel * 100)}%`;
}

export function formatTemp(tempF: number, unit?: TempUnit): string {
  const value = unit === 'fahrenheit' ? tempF : (tempF - 32) / 1.8;
  const u = unit === 'fahrenheit' ? '°F' : '°C';
  return `${Math.round(value)}${u}`;
}
