import { afterEach, describe, expect, it, vi } from 'vitest';

import { applyGlobalSettings } from '../src/settings';
import { DEFAULT_GLOBAL_SETTINGS, PowerUnitPreset } from '../src/shared';
import { formatGear } from '../src/utils/format';
import {
  generateCompassImage,
  generateGearImage,
  generateGForceImage,
  generateLapNumberImage,
  generatePositionImage,
  generatePowerImage,
  generateRaceInfoImage,
  generateRacePosAndTimeImage,
  generateSingleValueImage,
  generateSpeedImage,
  generateSpeedMeterImage,
  generateSuspensionTravelAllWheelsImage,
  generateSuspensionTravelSingleWheelImage,
  generateTireTempAllWheelsImage,
  generateTireTempSingleWheelImage,
  getCommonStyle,
} from '../src/utils/graphics';

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

describe('外部由来の文字列のエスケープ', () => {
  afterEach(() => {
    applyGlobalSettings(DEFAULT_GLOBAL_SETTINGS, []);
  });

  it('ダイヤルのタイトルを XML エスケープして描画する', () => {
    const titleInfo = { text: 'R&D <Power> "Torque" \'s', titleAlignment: 'top' as const, titleColor: '#ffffff' };
    const svg = decodeSvg(generateSingleValueImage(true, '100', 'PS', titleInfo));
    expect(svg).toContain('>R&amp;D &lt;Power&gt; &quot;Torque&quot; &apos;s</text>');
    expect(svg).not.toContain('R&D');
  });

  it('フォント名を CSS 文字列および XML としてエスケープして埋め込む', () => {
    applyGlobalSettings({ ...DEFAULT_GLOBAL_SETTINGS, font: 'A&B <C> "D"' }, []);
    expect(getCommonStyle()).toBe('<style>text{font-family:"A&amp;B &lt;C&gt; \\22 D\\22 ";font-weight:bold;}</style>');
  });

  it('フォント未指定の場合は font-family を出力しない', () => {
    expect(getCommonStyle()).toBe('<style>text{font-weight:bold;}</style>');
  });
});

describe('エンジン出力・トルクの単位プリセット', () => {
  const data = { power: 100_000, torque: 200 };

  it('未知のプリセットが保存されている場合は、既定のプリセット（PS / N·m）で描画する', () => {
    const image = generatePowerImage(false, data as never, 'both', 'unknown' as PowerUnitPreset);
    expect(extractTexts(image)).toEqual(extractTexts(generatePowerImage(false, data as never, 'both', 'ps-nm')));
  });
});

describe('サスペンション移動量の非有限値', () => {
  const data = {
    normalizedSuspensionTravelFrontLeft: NaN,
    normalizedSuspensionTravelFrontRight: Infinity,
    normalizedSuspensionTravelRearLeft: -Infinity,
    normalizedSuspensionTravelRearRight: 0.5,
  };

  it.each([false, true])('全輪表示で NaN / Infinity を SVG に出力しない（isDial: %s）', (isDial) => {
    const svg = decodeSvg(generateSuspensionTravelAllWheelsImage(isDial, data, 'percentage'));
    expect(svg).not.toMatch(/NaN|Infinity/);
  });

  it.each([false, true])('単輪表示で NaN を SVG に出力しない（isDial: %s）', (isDial) => {
    const svg = decodeSvg(generateSuspensionTravelSingleWheelImage(isDial, 'fl', data, 'value'));
    expect(svg).not.toMatch(/NaN|Infinity/);
  });
});

describe('Gフォースのピーク表示', () => {
  const current = { x: 0.3, z: 0.4, total: 0.5 };
  const peak = { x: 0.6, z: 0.8, total: 1 };

  it.each([false, true])('ピークGを表示する場合は値を描画する（isDial: %s）', (isDial) => {
    const texts = extractTexts(generateGForceImage(isDial, 2, current, peak, false));
    expect(texts).toContain(isDial ? '1.00' : '1.0');
  });

  it.each([false, true])('ピークGを非表示にした場合は "undefined" を描画しない（isDial: %s）', (isDial) => {
    const texts = extractTexts(generateGForceImage(isDial, 2, current, null, false));
    expect(texts).not.toContain('undefined');
    expect(texts).toEqual(['2.0G', isDial ? '0.50' : '0.5']);
  });
});

describe('データがないときの表示', () => {
  it.each([false, true])('数値のテキストに "--" を描画する（isDial: %s）', (isDial) => {
    expect(extractTexts(generateSpeedImage(isDial, undefined, 'kmh'))).toEqual(['--', 'KM/H']);
    expect(extractTexts(generateSpeedMeterImage(isDial, undefined, 'kmh', formatGear(undefined)))).toEqual(['--', 'KM/H', '--']);
    expect(extractTexts(generateGearImage(isDial, formatGear(undefined)))).toEqual(['--']);
    expect(extractTexts(generatePowerImage(isDial, undefined, 'both', 'ps-nm'))).toEqual(['--', 'PS', '--', 'N·m']);
    expect(extractTexts(generateTireTempAllWheelsImage(isDial, undefined, 'celsius'))).toEqual(['--℃', '--℃', '--℃', '--℃']);
    expect(extractTexts(generateTireTempSingleWheelImage(isDial, 'fl', undefined, 'fahrenheit'))).toEqual(['FL', '--℉']);
    expect(extractTexts(generateSuspensionTravelAllWheelsImage(isDial, undefined, 'percentage'))).toEqual(['--%', '--%', '--%', '--%']);
    expect(extractTexts(generateSuspensionTravelSingleWheelImage(isDial, 'rr', undefined, 'value'))).toEqual(['RR', '--']);
    expect(extractTexts(generateCompassImage(isDial, undefined, 'circle'))).toContain('--°');
  });

  it('ダイヤルのアーチ表示のコンパスに "--°" を描画する', () => {
    expect(extractTexts(generateCompassImage(true, undefined, 'arch'))).toContain('--°');
  });
});

describe('レース中でないときのレース情報', () => {
  // フリーロームなどでは、順位が0になる
  const freeRoam = { racePosition: 0, lapNumber: 0, currentRaceTime: 12.3, currentLap: 0, bestLap: 0 };
  const racing = { ...freeRoam, racePosition: 3, lapNumber: 1 };

  it.each([false, true])('順位が0の場合は、順位と周回を "--" で描画する（isDial: %s）', (isDial) => {
    expect(extractTexts(generateRaceInfoImage(isDial, freeRoam))).toEqual(expect.arrayContaining(['LAP --', 'POS --']));
    expect(extractTexts(generateRacePosAndTimeImage(isDial, freeRoam))).toContain('POS --');
    expect(extractTexts(generateLapNumberImage(isDial, freeRoam))).toEqual(['--']);
    expect(extractTexts(generatePositionImage(isDial, freeRoam))).toEqual(['--']);
  });

  it.each([false, true])('レース中は、順位と周回を描画する（isDial: %s）', (isDial) => {
    expect(extractTexts(generateRaceInfoImage(isDial, racing))).toEqual(expect.arrayContaining(['LAP  2', 'POS  3']));
    expect(extractTexts(generateLapNumberImage(isDial, racing))).toEqual(['2']);
    expect(extractTexts(generatePositionImage(isDial, racing))).toEqual(['3']);
  });
});
