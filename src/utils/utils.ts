import { execa } from 'execa';

import { WheelPosition } from '../types/settings';

export function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

/**
 * HSLカラーをRGBに変換する。
 * @param h 色相 (0 - 360)
 * @param s 彩度 (0 - 100)
 * @param l 輝度 (0 - 100)
 */
export function hslToRGB(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sPct = s / 100;
  const lPct = l / 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = sPct * Math.min(lPct, 1 - lPct);
  const f = (n: number) => lPct - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));

  return { r, g, b };
}

/**
 * 現在の車輪表示位置とダイヤルの回転方向（ticks）から、次の車輪表示位置を算出します。
 */
export function getNextWheelPosition(currentPos: WheelPosition | undefined, ticks: number): WheelPosition {
  const positions: WheelPosition[] = ['all', 'fl', 'fr', 'rl', 'rr'];
  let index = positions.indexOf(currentPos ?? 'all');
  if (index === -1) index = 0;

  const step = Math.sign(ticks);
  index = (index + step + positions.length) % positions.length;
  return positions[index];
}

export type FontItem = {
  name: string;
};

export async function getWindowsFonts(): Promise<FontItem[]> {
  const { stdout } = await execa({ lines: true })(
    'powershell', [
      '-ExecutionPolicy', 'Bypass',
      '-NoProfile',
      '-Command',
      "[System.Console]::OutputEncoding = [System.Text.Encoding]::UTF8; [void][System.Reflection.Assembly]::LoadWithPartialName('System.Drawing'); (New-Object System.Drawing.Text.InstalledFontCollection).Families.Name",
    ]);
  return stdout.map((name) => name.trim()).filter(Boolean).map((name) => ({ name } satisfies FontItem));
}
