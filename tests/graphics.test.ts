import { describe, expect, it, vi } from 'vitest';

import { generateGearImage, generateSpeedMeterImage } from '../src/utils/graphics';

vi.mock('@elgato/streamdeck', () => {
  const logger = { trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  return { default: { logger: { createScope: () => logger } } };
});

function decodeSvg(dataUri: string): string {
  expect(dataUri.startsWith('data:image/svg+xml,')).toBe(true);
  return decodeURIComponent(dataUri.slice('data:image/svg+xml,'.length));
}

/**
 * SVG 内の `<text>` 要素のテキストをすべて取り出します。
 */
function extractTexts(dataUri: string): string[] {
  return [...decodeSvg(dataUri).matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
}

const SPEED_DATA = { speed: 30, currentEngineRpm: 5000, engineMaxRpm: 8000 };

describe('速度計のギア表示', () => {
  it('generateGearImage は渡されたギア文字列を描画する', () => {
    expect(extractTexts(generateGearImage(false, 'N'))).toEqual(['N']);
    expect(extractTexts(generateGearImage(true, 'R'))).toEqual(['R']);
  });

  it('generateSpeedMeterImage は渡されたギア文字列を描画する', () => {
    expect(extractTexts(generateSpeedMeterImage(false, SPEED_DATA, 'kmh', '3'))).toContain('3');
    expect(extractTexts(generateSpeedMeterImage(true, undefined, 'mph', 'N'))).toContain('N');
  });
});
