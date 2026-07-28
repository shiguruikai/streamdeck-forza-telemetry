import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import streamDeck from '@elgato/streamdeck';

import { WHEEL_POSITIONS, WheelPosition } from '../shared';

const execFileAsync = promisify(execFile);

const logger = streamDeck.logger.createScope('utils');

export function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

/**
 * HSLカラー値をRGBカラーオブジェクトに変換する。
 *
 * @param h 色相（0 - 360）
 * @param s 彩度（0 - 100）
 * @param l 明度（0 - 100）
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
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

export function hslToRgbHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  const toHex = (v: number) => v.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getNextWheelPosition(currentPos: WheelPosition | undefined, ticks: number): WheelPosition {
  const currentIndex = WHEEL_POSITIONS.indexOf(currentPos ?? WHEEL_POSITIONS[0]);
  const nextIndex = clamp(currentIndex + ticks, 0, WHEEL_POSITIONS.length - 1);
  return WHEEL_POSITIONS[nextIndex];
}

export type FontItem = {
  name: string;
};

export async function getSystemFonts(): Promise<FontItem[]> {
  const platform = process.platform;
  const fontNames = new Set<string>();
  const options = { encoding: 'utf8', timeout: 5000 } as const;

  try {
    if (platform === 'win32') {
      const { stdout } = await execFileAsync(
        'powershell', [
          '-ExecutionPolicy', 'Bypass',
          '-NoProfile',
          '-Command',
          '[System.Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Add-Type -AssemblyName PresentationCore; ([Windows.Media.Fonts]::SystemFontFamilies).Source',
        ], options);
      stdout.split(/\r?\n/).forEach((name) => fontNames.add(name.trim()));
    } else if (platform === 'darwin') {
      const { stdout } = await execFileAsync(
        'osascript', [
          '-e', 'use framework "Cocoa"',
          '-e', 'set AppleScript\'s text item delimiters to linefeed',
          '-e', 'return (current application\'s NSFontManager\'s sharedFontManager\'s availableFontFamilies) as list as string',
        ], options);
      stdout.split(/\r?\n/).forEach((name) => fontNames.add(name.trim()));
    } else if (platform === 'linux') {
      const { stdout } = await execFileAsync(
        'fc-list', [
          ':', 'family',
        ], options);
      stdout.split(/\r?\n/).flatMap((line) => line.split(',')).forEach((name) => fontNames.add(name.trim()));
    }

    return [
      '',
      ...Array.from(fontNames).sort((a, b) => a.localeCompare(b)).filter(Boolean),
    ].map((name) => ({ name } satisfies FontItem));
  } catch (error) {
    logger.error(`Failed to retrieve system fonts for platform: ${platform}`, error);
    return [];
  }
}
