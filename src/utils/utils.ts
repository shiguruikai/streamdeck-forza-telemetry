import { execa } from 'execa';

import { WheelPosition } from '../types/settings';

export function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
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
