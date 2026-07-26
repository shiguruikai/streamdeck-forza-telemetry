import { describe, expect, it } from 'vitest';

import {
  fahrenheitToCelsius,
  formatCarClass,
  formatCarPI,
  formatCylinders,
  formatDrivetrain,
  formatGear,
  formatHeading,
  formatLap,
  formatPosition,
  formatPower,
  formatPowerUnit,
  formatRpmBar,
  formatSpeed,
  formatSpeedUnit,
  formatTemp,
  formatTime,
  formatTireColor,
  formatTorque,
  formatTorqueUnit,
  formatTravel,
  formatTravelColor,
} from '../src/utils/format';

// =============================================================================
// レース情報・共通（Race Info & Common）
// =============================================================================

describe('formatTime', () => {
  it('正しく分・秒・ミリ秒をフォーマットすること', () => {
    expect(formatTime(125.456)).toBe('2:05.456');
    expect(formatTime(60)).toBe('1:00.000');
  });

  it('ミリ秒の四捨五入で分・秒が正しく繰り上がること', () => {
    expect(formatTime(59.9996)).toBe('1:00.000');
    expect(formatTime(119.9999)).toBe('2:00.000');
  });

  it('無効値や0以下の数値に対してプレースホルダーを返すこと', () => {
    expect(formatTime(undefined)).toBe('--:--.---');
    expect(formatTime(0)).toBe('--:--.---');
    expect(formatTime(-5)).toBe('--:--.---');
    expect(formatTime(NaN)).toBe('--:--.---');
    expect(formatTime(Infinity)).toBe('--:--.---');
  });
});

describe('formatLap & formatPosition', () => {
  it('ラップおよび順位をフォーマットすること', () => {
    expect(formatLap(0)).toBe('LAP  1');
    expect(formatLap(undefined)).toBe('LAP --');
    expect(formatPosition(1)).toBe('POS  1');
    expect(formatPosition(undefined)).toBe('POS --');
  });

  it('NaN や Infinity に対してプレースホルダーを返すこと', () => {
    expect(formatLap(NaN)).toBe('LAP --');
    expect(formatLap(Infinity)).toBe('LAP --');
    expect(formatPosition(NaN)).toBe('POS --');
    expect(formatPosition(Infinity)).toBe('POS --');
  });
});

describe('formatGear', () => {
  it('ギア数値を文字列表現に正しく変換すること', () => {
    expect(formatGear(0, 'N')).toBe('R');
    expect(formatGear(1, 'N')).toBe('1');
    expect(formatGear(10, 'N')).toBe('10');
  });

  it('範囲外の値で直前のギア文字列を返すこと', () => {
    expect(formatGear(11, '4')).toBe('4');
    expect(formatGear(-1, '2')).toBe('2');
    expect(formatGear(null, 'N')).toBe('N');
    expect(formatGear(NaN, '3')).toBe('3');
    expect(formatGear(Infinity, '5')).toBe('5');
  });
});

// =============================================================================
// 速度・エンジン回転数（Speed & Engine RPM）
// =============================================================================

describe('formatSpeed & formatSpeedUnit', () => {
  it('単位文字列を正しく返すこと', () => {
    expect(formatSpeedUnit('kmh')).toBe('KM/H');
    expect(formatSpeedUnit('mph')).toBe('MPH');
    expect(formatSpeedUnit(undefined)).toBe('KM/H');
  });

  it('m/s から km/h および mph へ正確に変換・四捨五入されること', () => {
    // 10 m/s = 36 km/h = 22.36936... mph -> 22 mph
    expect(formatSpeed(10, 'kmh')).toBe('36');
    expect(formatSpeed(10, 'mph')).toBe('22');

    // 27.77777777777778 m/s = 100 km/h = 62.1371... mph -> 62 mph
    const mps100kmh = 100 / 3.6;
    expect(formatSpeed(mps100kmh, 'kmh')).toBe('100');
    expect(formatSpeed(mps100kmh, 'mph')).toBe('62');
  });

  it('null/undefined/NaN/Infinity 時は 0 を返すこと', () => {
    expect(formatSpeed(null, 'kmh')).toBe('0');
    expect(formatSpeed(undefined, 'mph')).toBe('0');
    expect(formatSpeed(NaN, 'kmh')).toBe('0');
    expect(formatSpeed(Infinity, 'kmh')).toBe('0');
  });
});

describe('formatRpmBar', () => {
  it('RPMの割合およびステータスカラーを計算すること', () => {
    const res = formatRpmBar(7000, 8000);
    expect(res.rpm).toBe(7000);
    expect(res.rpmPct).toBe(0.875);
    expect(typeof res.rpmColor).toBe('string');
  });

  it('RPMまたはMaxRPMがnull/undefined/NaN時のフォールバック処理を行うこと', () => {
    expect(formatRpmBar(null, null)).toEqual({ rpm: 0, rpmPct: 0, rpmColor: '#FFFFFF' });
    expect(formatRpmBar(NaN, NaN)).toEqual({ rpm: 0, rpmPct: 0, rpmColor: '#FFFFFF' });
    expect(formatRpmBar(Infinity, Infinity)).toEqual({ rpm: 0, rpmPct: 0, rpmColor: '#FFFFFF' });
  });
});

// =============================================================================
// エンジン出力・トルク（Power & Torque）
// =============================================================================

describe('formatPower & formatPowerUnit', () => {
  it('単位表示を正しく返すこと', () => {
    expect(formatPowerUnit('ps')).toBe('PS');
    expect(formatPowerUnit('hp')).toBe('HP');
    expect(formatPowerUnit('kw')).toBe('kW');
  });

  it('W から各馬力・出力単位へ正確に変換・四捨五入されること', () => {
    // 735,498.75 W = 1000 PS
    const w1000ps = 735498.75;
    expect(formatPower(w1000ps, 'ps')).toBe('1000');
    expect(formatPower(w1000ps, 'hp')).toBe('986');
    expect(formatPower(w1000ps, 'kw')).toBe('735');
  });

  it('NaN や Infinity 時に 0 を返すこと', () => {
    expect(formatPower(NaN, 'ps')).toBe('0');
    expect(formatPower(Infinity, 'ps')).toBe('0');
  });
});

describe('formatTorque & formatTorqueUnit', () => {
  it('単位表示を正しく返すこと', () => {
    expect(formatTorqueUnit('nm')).toBe('N·m');
    expect(formatTorqueUnit('kgfm')).toBe('kgf·m');
    expect(formatTorqueUnit('ftlb')).toBe('ft·lb');
  });

  it('N·m から各トルク単位へ正確に変換・四捨五入されること', () => {
    // 98.0665 N·m = 10 kgf·m
    const nm10kgfm = 98.0665;
    expect(formatTorque(nm10kgfm, 'nm')).toBe('98');
    expect(formatTorque(nm10kgfm, 'kgfm')).toBe('10');
    expect(formatTorque(nm10kgfm, 'ftlb')).toBe('72');
  });

  it('NaN や Infinity 時に 0 を返すこと', () => {
    expect(formatTorque(NaN, 'nm')).toBe('0');
    expect(formatTorque(Infinity, 'nm')).toBe('0');
  });
});

// =============================================================================
// タイヤ温度（Tire Temperature）
// =============================================================================

describe('fahrenheitToCelsius & formatTemp', () => {
  it('華氏から摂氏への変換が正確であること', () => {
    expect(fahrenheitToCelsius(32)).toBe(0);
    expect(fahrenheitToCelsius(212)).toBe(100);
    expect(fahrenheitToCelsius(95)).toBe(35);
  });

  it('指定された単位の温度文字列を生成すること', () => {
    expect(formatTemp(212, 'celsius')).toBe('100℃');
    expect(formatTemp(212, 'fahrenheit')).toBe('212℉');
    expect(formatTemp(NaN, 'celsius')).toBe('-18℃'); // 0℉ 相当 -> -18℃
  });
});

describe('formatTireColor', () => {
  it('タイヤ温度（華氏）に応じて正確なRGBカラー文字列を返すこと', () => {
    // 40℃以下（104℉）: 青色
    expect(formatTireColor(104)).toBe('rgb(26,26,255)');
    expect(formatTireColor(32)).toBe('rgb(26,26,255)'); // 0℃相当（下限クランプ）

    // 60℃（140℉）: 冷え状態・中間色（水色）
    expect(formatTireColor(140)).toBe('rgb(26,255,255)');

    // 80℃〜100℃（176℉〜212℉）: 適正動作温度（緑色）
    expect(formatTireColor(176)).toBe('rgb(26,255,26)');
    expect(formatTireColor(194)).toBe('rgb(26,255,26)');
    expect(formatTireColor(212)).toBe('rgb(26,255,26)');

    // 110℃（230℉）: 過熱警告・中間色（黄色）
    expect(formatTireColor(230)).toBe('rgb(255,255,26)');

    // 120℃以上（248℉）: 過熱状態（赤色）
    expect(formatTireColor(248)).toBe('rgb(255,26,26)');
    expect(formatTireColor(300)).toBe('rgb(255,26,26)'); // 149℃相当（上限クランプ）
  });

  it('null/undefined/NaN/Infinity 時は 0℃（40℃クランプ）の青色を返すこと（undefined を返さないこと）', () => {
    expect(formatTireColor(null)).toBe('rgb(26,26,255)');
    expect(formatTireColor(undefined)).toBe('rgb(26,26,255)');
    expect(formatTireColor(NaN)).toBe('rgb(26,26,255)');
    expect(formatTireColor(Infinity)).toBe('rgb(26,26,255)');
  });
});

// =============================================================================
// サスペンション移動量（Suspension Travel）
// =============================================================================

describe('formatTravel & formatTravelColor', () => {
  it('サスペンション移動量を%表示および数値固定少数表示にフォーマットすること', () => {
    expect(formatTravel(0.5, 'percentage')).toBe('50%');
    expect(formatTravel(0.254, 'value')).toBe('0.25');
    expect(formatTravel(NaN, 'percentage')).toBe('0%');
  });

  it('サスペンション移動量に応じた正確なRGBカラー文字列を返すこと', () => {
    // 0%: 最大伸び（青色）
    expect(formatTravelColor(0)).toBe('rgb(26,26,255)');
    // 20%: 中間伸び（水色）
    expect(formatTravelColor(0.2)).toBe('rgb(26,255,255)');
    // 50%: 適正範囲（緑色）
    expect(formatTravelColor(0.5)).toBe('rgb(26,255,26)');
    // 80%: 中間縮み（黄色）
    expect(formatTravelColor(0.8)).toBe('rgb(255,255,26)');
    // 100%: 最大縮み（赤色）
    expect(formatTravelColor(1.0)).toBe('rgb(255,26,26)');
  });

  it('NaN や Infinity 時は 0%（青色）のカラー文字列を返すこと（undefined を返さないこと）', () => {
    expect(formatTravelColor(NaN)).toBe('rgb(26,26,255)');
    expect(formatTravelColor(Infinity)).toBe('rgb(26,26,255)');
  });
});

// =============================================================================
// コンパス・方位（Heading）
// =============================================================================

describe('formatHeading', () => {
  it('ラジアンから角度（0°〜359°）へ正確に変換・正規化されること', () => {
    expect(formatHeading(0)).toEqual({ heading: 0, headingStr: '0°' });
    expect(formatHeading(Math.PI / 2)).toEqual({ heading: 90, headingStr: '90°' });
    expect(formatHeading(Math.PI)).toEqual({ heading: 180, headingStr: '180°' });
    expect(formatHeading((3 * Math.PI) / 2)).toEqual({ heading: 270, headingStr: '270°' });
  });

  it('負のラジアンが 0°〜359° の正の角度に正規化されること', () => {
    expect(formatHeading(-Math.PI / 2)).toEqual({ heading: 270, headingStr: '270°' });
  });

  it('360° 付近の四捨五入で 360° でなく 0° に丸められること', () => {
    // 359.6° に相当するラジアン
    const rad359_6 = (359.6 * Math.PI) / 180;
    expect(formatHeading(rad359_6)).toEqual({ heading: 0, headingStr: '0°' });
  });

  it('NaN や Infinity 時に 0° を返すこと', () => {
    expect(formatHeading(NaN)).toEqual({ heading: 0, headingStr: '0°' });
    expect(formatHeading(Infinity)).toEqual({ heading: 0, headingStr: '0°' });
  });
});

// =============================================================================
// 車両スペック（Car Spec）
// =============================================================================

describe('formatCarClass', () => {
  it('Horizon パケットで PI 値と carClass に応じて FH6 クラスとカラーを自動判定すること', () => {
    expect(formatCarClass({ carClass: 0, carPerformanceIndex: 350, game: 'horizon' })).toEqual({ label: 'D', color: '#00a1e6' });
    expect(formatCarClass({ carClass: 1, carPerformanceIndex: 450, game: 'horizon' })).toEqual({ label: 'C', color: '#e6a400' });
    expect(formatCarClass({ carClass: 2, carPerformanceIndex: 550, game: 'horizon' })).toEqual({ label: 'B', color: '#e63d00' });
    expect(formatCarClass({ carClass: 3, carPerformanceIndex: 650, game: 'horizon' })).toEqual({ label: 'A', color: '#e6002a' });
    expect(formatCarClass({ carClass: 4, carPerformanceIndex: 750, game: 'horizon' })).toEqual({ label: 'S1', color: '#9500e6' });
    expect(formatCarClass({ carClass: 5, carPerformanceIndex: 850, game: 'horizon' })).toEqual({ label: 'S2', color: '#004de6' });
    expect(formatCarClass({ carClass: 6, carPerformanceIndex: 950, game: 'horizon' })).toEqual({ label: 'R', color: '#e600a4' });
    expect(formatCarClass({ carClass: 7, carPerformanceIndex: 999, game: 'horizon' })).toEqual({ label: 'X', color: '#00e64d' });
  });

  it('FH5 特有の PI と carClass の組み合わせ（D=450, C=550, B=650, A=750, S1=850, S2=950, X=999）で FH5 クラスを自動判定すること', () => {
    expect(formatCarClass({ carClass: 0, carPerformanceIndex: 450, game: 'horizon' })).toEqual({ label: 'D', color: '#00a1e6' });
    expect(formatCarClass({ carClass: 1, carPerformanceIndex: 550, game: 'horizon' })).toEqual({ label: 'C', color: '#e6a400' });
    expect(formatCarClass({ carClass: 2, carPerformanceIndex: 650, game: 'horizon' })).toEqual({ label: 'B', color: '#e63d00' });
    expect(formatCarClass({ carClass: 3, carPerformanceIndex: 750, game: 'horizon' })).toEqual({ label: 'A', color: '#e6002a' });
    expect(formatCarClass({ carClass: 4, carPerformanceIndex: 850, game: 'horizon' })).toEqual({ label: 'S1', color: '#9500e6' });
    expect(formatCarClass({ carClass: 5, carPerformanceIndex: 950, game: 'horizon' })).toEqual({ label: 'S2', color: '#004de6' });
    expect(formatCarClass({ carClass: 6, carPerformanceIndex: 999, game: 'horizon' })).toEqual({ label: 'X', color: '#00e64d' });
  });

  it('Motorsport パケットで正確なクラス（S, R, P, X）を判定すること', () => {
    expect(formatCarClass({ carClass: 0, carPerformanceIndex: 350, game: 'motorsport' })).toEqual({ label: 'D', color: '#00a1e6' });
    expect(formatCarClass({ carClass: 1, carPerformanceIndex: 450, game: 'motorsport' })).toEqual({ label: 'C', color: '#e6a400' });
    expect(formatCarClass({ carClass: 2, carPerformanceIndex: 550, game: 'motorsport' })).toEqual({ label: 'B', color: '#e63d00' });
    expect(formatCarClass({ carClass: 3, carPerformanceIndex: 650, game: 'motorsport' })).toEqual({ label: 'A', color: '#e6002a' });
    expect(formatCarClass({ carClass: 4, carPerformanceIndex: 750, game: 'motorsport' })).toEqual({ label: 'S', color: '#9500e6' });
    expect(formatCarClass({ carClass: 5, carPerformanceIndex: 850, game: 'motorsport' })).toEqual({ label: 'R', color: '#004de6' });
    expect(formatCarClass({ carClass: 6, carPerformanceIndex: 950, game: 'motorsport' })).toEqual({ label: 'P', color: '#00e64d' });
    expect(formatCarClass({ carClass: 7, carPerformanceIndex: 999, game: 'motorsport' })).toEqual({ label: 'X', color: '#39ac60' });
  });

  it('無効値や範囲外数値の場合はデフォルト値（-）を返すこと', () => {
    expect(formatCarClass(null)).toEqual({ label: '-', color: '#737373' });
    expect(formatCarClass(undefined)).toEqual({ label: '-', color: '#737373' });
    expect(formatCarClass({ carClass: -1, carPerformanceIndex: 0, game: 'horizon' })).toEqual({ label: '-', color: '#737373' });
    expect(formatCarClass({ carClass: 99, carPerformanceIndex: 999, game: 'horizon' })).toEqual({ label: '-', color: '#737373' });
  });
});

describe('formatCarPI', () => {
  it('PI値を文字列で返すこと', () => {
    expect(formatCarPI(998)).toBe('998');
    expect(formatCarPI(500)).toBe('500');
  });

  it('無効値や 0 以下の数値の場合は "---" を返すこと', () => {
    expect(formatCarPI(null)).toBe('---');
    expect(formatCarPI(undefined)).toBe('---');
    expect(formatCarPI(0)).toBe('---');
    expect(formatCarPI(-10)).toBe('---');
  });
});

describe('formatDrivetrain', () => {
  it('数値（0, 1, 2）に対応する駆動方式文字列を返すこと', () => {
    expect(formatDrivetrain(0)).toBe('FWD');
    expect(formatDrivetrain(1)).toBe('RWD');
    expect(formatDrivetrain(2)).toBe('AWD');
  });

  it('無効値や範囲外数値の場合は "---" を返すこと', () => {
    expect(formatDrivetrain(null)).toBe('---');
    expect(formatDrivetrain(undefined)).toBe('---');
    expect(formatDrivetrain(3)).toBe('---');
  });
});

describe('formatCylinders', () => {
  it('気筒数に応じた正確な表記を返すこと', () => {
    expect(formatCylinders(0)).toBe('EV');
    expect(formatCylinders(2)).toBe('2Cyl');
    expect(formatCylinders(4)).toBe('4Cyl');
    expect(formatCylinders(6)).toBe('6Cyl');
    expect(formatCylinders(8)).toBe('8Cyl');
    expect(formatCylinders(10)).toBe('10Cyl');
    expect(formatCylinders(12)).toBe('12Cyl');
    expect(formatCylinders(16)).toBe('16Cyl');
  });

  it('無効値や負の数値の場合は "---" を返すこと', () => {
    expect(formatCylinders(null)).toBe('---');
    expect(formatCylinders(undefined)).toBe('---');
    expect(formatCylinders(-1)).toBe('---');
  });
});
