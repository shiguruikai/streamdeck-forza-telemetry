import { SingleWheelPosition, SpeedMeterLayout, SpeedUnit, SuspensionMode, TempUnit } from '../settings/settings';
import { ForzaTelemetryData } from '../telemetry/parser';
import {
  formatGear,
  formatLap,
  formatPosition,
  formatRpmBar,
  formatSpeed,
  formatTemp,
  formatTime,
  formatTireColor,
  formatTravel,
  formatTravelColor,
  formatUnit,
} from './format';
import { clamp } from './utils';

type TelemetrySubset = Readonly<ForzaTelemetryData>;

export type SpeedMeterDrawData = Pick<
  TelemetrySubset,
  'speed' | 'gear' | 'currentEngineRpm' | 'engineMaxRpm'
>;

export type TireTempDrawData = Pick<
  TelemetrySubset,
  'tireTempFrontLeft' | 'tireTempFrontRight' | 'tireTempRearLeft' | 'tireTempRearRight'
>;

export type SuspensionDrawData = Pick<
  TelemetrySubset,
  | 'normalizedSuspensionTravelFrontLeft'
  | 'normalizedSuspensionTravelFrontRight'
  | 'normalizedSuspensionTravelRearLeft'
  | 'normalizedSuspensionTravelRearRight'
>;

export type RaceInfoDrawData = Pick<
  TelemetrySubset,
  'racePosition' | 'currentRaceTime' | 'lapNumber' | 'currentLap' | 'bestLap'
>;

const DEFAULT_GLOBAL_FONT = '';

let globalFont = DEFAULT_GLOBAL_FONT;

export function getGlobalFont(): string {
  return globalFont;
}

export function setGlobalFont(font: string | null | undefined): void {
  globalFont = font ?? DEFAULT_GLOBAL_FONT;
}

export const DIAL_WIDTH = 200;
export const DIAL_HEIGHT = 100;
export const KEY_WIDTH = 144;
export const KEY_HEIGHT = 144;
const PADDING = 8;

export const enum Color {
  WHITE = '#dedede',
  GREY = '#8f8f8f',
  DARK_GREY = '#2e2e2e',
  BLACK = '#111111',
  RED = '#ff5846',
  YELLOW = '#c7c600',
  GREEN = '#00e567',
}

/**
 * SVG文字列をURLエンコードされたデータURI（data:image/svg+xml,...）形式にシリアライズします。
 *
 * @note データ削減のため、SVG内のタグ間の改行および不要な空白文字を正規表現で除去する最適化を行います。
 */
export function toSvgDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg.replace(/>\s+</g, '><').trim())}`;
}

export type TitleInfo = {
  text: string;
  titleAlignment: 'top' | 'middle' | 'bottom';
  titleColor: string;
};

type LayoutAdjustments = {
  offsetY: number;
  titleElement: string;
};

function getLayoutAdjustments(
  isDial: boolean,
  titleInfo?: TitleInfo,
): LayoutAdjustments {
  if (!titleInfo) {
    return {
      offsetY: 0,
      titleElement: '',
    };
  }

  if (isDial) {
    // ダイヤルは高さが100pxと狭いため、常に上寄せ（top）で描画します。
    return {
      offsetY: 0,
      titleElement: `<text x="${PADDING}" y="20" font-size="16" fill="${titleInfo.titleColor}" text-anchor="start">${titleInfo.text}</text>`,
    };
  }

  return {
    offsetY: titleInfo.titleAlignment === 'bottom' ? -12 : 12,
    titleElement: '',
  };
}

/**
 * すべてのSVGに共通して適用するCSSスタイルシートを取得します。
 *
 * @note Stream Deck の制約により、`font-family` でのカンマ区切りの複数指定（フォールバック指定）は、正しく解釈されず、描画されない現象が発生します。
 */
function getCommonStyle(): string {
  const fontFamily = globalFont ? `font-family:"${globalFont}";` : '';
  return `<style>text{${fontFamily}font-weight:bold;}</style>`;
}

// --- タイヤ温度（Tire Temperature） ---

export function createTireTempAllWheelsImage(
  isDial: boolean,
  data: TireTempDrawData | undefined,
  unit: TempUnit,
  titleInfo?: TitleInfo,
): string {
  const colorFL = formatTireColor(data?.tireTempFrontLeft);
  const colorFR = formatTireColor(data?.tireTempFrontRight);
  const colorRL = formatTireColor(data?.tireTempRearLeft);
  const colorRR = formatTireColor(data?.tireTempRearRight);

  const values = [1, 1, 1, 1];
  const texts = [
    formatTemp(data?.tireTempFrontLeft, unit),
    formatTemp(data?.tireTempFrontRight, unit),
    formatTemp(data?.tireTempRearLeft, unit),
    formatTemp(data?.tireTempRearRight, unit),
  ];
  const colors = [colorFL, colorFR, colorRL, colorRR];
  return drawAllWheels(isDial, values, texts, colors, 0.4, titleInfo);
}

export function createTireTempSingleWheelImage(
  isDial: boolean,
  position: SingleWheelPosition,
  data: TireTempDrawData | undefined,
  unit: TempUnit,
  titleInfo?: TitleInfo,
): string {
  const temp = position === 'fl'
    ? data?.tireTempFrontLeft
    : position === 'fr'
      ? data?.tireTempFrontRight
      : position === 'rl'
        ? data?.tireTempRearLeft
        : data?.tireTempRearRight;

  return drawSingleWheel(
    isDial,
    position,
    1,
    formatTemp(temp, unit),
    formatTireColor(temp),
    0.4,
    titleInfo,
  );
}

// --- サスペンション（Suspension Travel） ---

export function createSuspensionTravelAllWheelsImage(
  isDial: boolean,
  data: SuspensionDrawData | undefined,
  mode: SuspensionMode,
  titleInfo?: TitleInfo,
): string {
  const travels = [
    data?.normalizedSuspensionTravelFrontLeft,
    data?.normalizedSuspensionTravelFrontRight,
    data?.normalizedSuspensionTravelRearLeft,
    data?.normalizedSuspensionTravelRearRight,
  ];
  const values = travels.map((v) => v ?? 0);
  const texts = travels.map((v) => formatTravel(v, mode));
  const colors = travels.map((v) => formatTravelColor(v));
  return drawAllWheels(isDial, values, texts, colors, 0, titleInfo);
}

export function createSuspensionTravelSingleWheelImage(
  isDial: boolean,
  position: SingleWheelPosition,
  data: SuspensionDrawData | undefined,
  mode: SuspensionMode,
  titleInfo?: TitleInfo,
): string {
  const travel
    = position === 'fl'
      ? data?.normalizedSuspensionTravelFrontLeft
      : position === 'fr'
        ? data?.normalizedSuspensionTravelFrontRight
        : position === 'rl'
          ? data?.normalizedSuspensionTravelRearLeft
          : data?.normalizedSuspensionTravelRearRight;

  return drawSingleWheel(
    isDial,
    position,
    travel ?? 0,
    formatTravel(travel, mode),
    formatTravelColor(travel),
    0,
    titleInfo,
  );
}

// --- Gフォース（G-Force） ---

export function createGForceImage(
  isDial: boolean,
  scale: number,
  current: { x: number; z: number; total: number },
  peak: { x: number; z: number; total: number } | null | undefined,
  showResetText: boolean,
  titleInfo?: TitleInfo,
): string {
  const adj = getLayoutAdjustments(isDial, titleInfo);

  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const cx = width / 2;
  const cy = height / 2 + adj.offsetY;

  const maxRadius = isDial ? 44 : 52;
  const rOuter = maxRadius;
  const rInner = maxRadius / 2;
  const rBall = maxRadius / 7;

  let currentPlotX: number;
  let currentPlotY: number;
  if (current.total > scale) {
    currentPlotX = cx + (current.x / current.total) * maxRadius;
    currentPlotY = cy + (current.z / current.total) * maxRadius;
  } else {
    currentPlotX = cx + (current.x / scale) * maxRadius;
    currentPlotY = cy + (current.z / scale) * maxRadius;
  }

  let peakCircle = '';
  if (peak && peak.total > 0) {
    const peakPlotX = cx + peak.x / Math.min(peak.total, scale) * maxRadius;
    const peakPlotY = cy + peak.z / Math.min(peak.total, scale) * maxRadius;
    peakCircle = `<circle cx="${peakPlotX}" cy="${peakPlotY}" r="${rBall}" fill="${Color.YELLOW}" opacity="0.5"/>`;
  }

  const scaleText = `${scale.toFixed(1)}G`;
  const peakText = peak?.total.toFixed(isDial ? 2 : 1);
  const currentGText = current.total.toFixed(isDial ? 2 : 1);

  const resetText = showResetText
    ? `<text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="24" fill="${Color.GREEN}">RESET</text>`
    : '';

  const fontSize = isDial ? 20 : 18;

  const leftTextX = PADDING;
  const rightTextX = width - PADDING;
  const bottomTextY = height - PADDING + (titleInfo?.titleAlignment === 'bottom' ? adj.offsetY * 2 : 0);
  const peakTextY = 22 + (titleInfo?.titleAlignment === 'bottom' ? 0 : adj.offsetY * 2);

  return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}
  ${adj.titleElement}

  <line x1="${cx - maxRadius}" y1="${cy}" x2="${cx + maxRadius}" y2="${cy}" stroke="${Color.DARK_GREY}" stroke-width="2" stroke-dasharray="2 4"/>
  <line x1="${cx}" y1="${cy - maxRadius}" x2="${cx}" y2="${cy + maxRadius}" stroke="${Color.DARK_GREY}" stroke-width="2" stroke-dasharray="2 4"/>

  <circle cx="${cx}" cy="${cy}" r="${rInner}" stroke="${Color.DARK_GREY}" stroke-width="2" stroke-dasharray="4"/>
  <circle cx="${cx}" cy="${cy}" r="${rOuter}" stroke="${Color.DARK_GREY}" stroke-width="3"/>

  ${peakCircle}

  <line x1="${cx}" y1="${cy}" x2="${currentPlotX}" y2="${currentPlotY}" stroke="${Color.RED}" stroke-width="4" opacity="0.6"/>
  <circle cx="${currentPlotX}" cy="${currentPlotY}" r="${rBall}" fill="${Color.RED}"/>

  <text x="${rightTextX}" y="${peakTextY}" text-anchor="end" font-size="${fontSize}" fill="${Color.YELLOW}">${peakText}</text>
  <text x="${leftTextX}" y="${bottomTextY}" font-size="${fontSize}" fill="${Color.GREY}">${scaleText}</text>
  <text x="${rightTextX}" y="${bottomTextY}" text-anchor="end" font-size="${fontSize}" fill="${Color.WHITE}">${currentGText}</text>

  ${resetText}
</svg>
`);
}

// --- 速度計（Speed Meter） ---

export function createSpeedMeterImage(
  isDial: boolean,
  layout: SpeedMeterLayout,
  data: SpeedMeterDrawData | undefined,
  unit: SpeedUnit,
  previousGear?: string,
  titleInfo?: TitleInfo,
): { image: string; currentGearText: string } {
  const unitText = formatUnit(unit);
  const speedText = formatSpeed(data?.speed, unit);
  const gearText = formatGear(data?.gear) ?? previousGear ?? 'N';
  const { rpmPct, rpmColor } = formatRpmBar(data?.currentEngineRpm, data?.engineMaxRpm);

  let image: string;
  if (layout === 'full') {
    image = drawSpeedMeterFull(isDial, speedText, gearText, rpmPct, rpmColor, unitText, titleInfo);
  } else if (layout === 'speed') {
    image = drawSingleValue(isDial, speedText, unitText, titleInfo);
  } else if (layout === 'gear') {
    image = drawGearCircle(isDial, gearText, titleInfo);
  } else {
    image = drawRpmValue(isDial, data?.currentEngineRpm, data?.engineMaxRpm, titleInfo);
  }

  return { image, currentGearText: gearText };
}

export function createSpeedOnlyImage(
  isDial: boolean,
  data: Pick<SpeedMeterDrawData, 'speed'> | undefined,
  unit: SpeedUnit,
  titleInfo?: TitleInfo,
): string {
  return drawSingleValue(isDial, formatSpeed(data?.speed, unit), formatUnit(unit), titleInfo);
}

export function createGearOnlyImage(
  isDial: boolean,
  data: Pick<SpeedMeterDrawData, 'gear'> | undefined,
  previousGear?: string,
  titleInfo?: TitleInfo,
): { image: string; currentGearText: string } {
  const gearText = formatGear(data?.gear) ?? previousGear ?? 'N';
  return {
    image: drawGearCircle(isDial, gearText, titleInfo),
    currentGearText: gearText,
  };
}

export function createRpmOnlyImage(
  isDial: boolean,
  data: Pick<SpeedMeterDrawData, 'currentEngineRpm' | 'engineMaxRpm'> | undefined,
  titleInfo?: TitleInfo,
): string {
  return drawRpmValue(isDial, data?.currentEngineRpm, data?.engineMaxRpm, titleInfo);
}

// --- レース情報（Race Info） ---

export function createRaceTimeImage(
  isDial: boolean,
  data: Pick<RaceInfoDrawData, 'racePosition' | 'currentRaceTime'> | undefined,
  titleInfo?: TitleInfo,
): string {
  const adj = getLayoutAdjustments(isDial, titleInfo);

  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const x = width - PADDING;
  const cy = height / 2 + adj.offsetY;
  const fontSize = isDial ? 34 : 26;

  return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}
  ${adj.titleElement}

  <text x="${x}" y="${cy - 20}" font-size="20" text-anchor="end" fill="${Color.WHITE}">${formatPosition(data?.racePosition)}</text>
  <text x="${x}" y="${cy + 25}" font-size="${fontSize}" text-anchor="end" fill="${Color.WHITE}">${formatTime(data?.currentRaceTime)}</text>
</svg>
`);
}

export function createLapTimeImage(
  isDial: boolean,
  data: RaceInfoDrawData | undefined,
  titleInfo?: TitleInfo,
): string {
  const adj = getLayoutAdjustments(isDial, titleInfo);

  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const cy = height / 2 + adj.offsetY;

  const x1 = isDial ? 65 : PADDING;
  const x2 = width - PADDING;

  const fontSize = isDial ? 34 : 26;
  const y1 = cy - 26;
  const y2 = cy + 10;
  const y3 = cy + 43;

  return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}
  ${adj.titleElement}

  <text x="${x1}" y="${y1}" font-size="18" text-anchor="start" fill="${Color.WHITE}">${formatLap(data?.lapNumber)}</text>
  <text x="${x2}" y="${y1}" font-size="18" text-anchor="end" fill="${Color.WHITE}">${formatPosition(data?.racePosition)}</text>
  <text x="${x2}" y="${y2}" font-size="${fontSize}" text-anchor="end" fill="${Color.WHITE}">${formatTime(data?.currentLap)}</text>
  <text x="${x2}" y="${y3}" font-size="${fontSize}" text-anchor="end" fill="${Color.YELLOW}">${formatTime(data?.bestLap)}</text>
</svg>
`);
}

export function createRaceTimeOnlyImage(
  isDial: boolean,
  data: Pick<RaceInfoDrawData, 'currentRaceTime'> | undefined,
  titleInfo?: TitleInfo,
): string {
  return drawTimeValue(isDial, data?.currentRaceTime, titleInfo);
}

export function createLapTimeOnlyImage(
  isDial: boolean,
  data: Pick<RaceInfoDrawData, 'currentLap'> | undefined,
  titleInfo?: TitleInfo,
): string {
  return drawTimeValue(isDial, data?.currentLap, titleInfo);
}

export function createBestLapTimeOnlyImage(
  isDial: boolean,
  data: Pick<RaceInfoDrawData, 'bestLap'> | undefined,
  titleInfo?: TitleInfo,
): string {
  return drawTimeValue(isDial, data?.bestLap, titleInfo);
}

export function createLapNumberOnlyImage(
  isDial: boolean,
  data: Pick<RaceInfoDrawData, 'lapNumber'> | undefined,
  titleInfo?: TitleInfo,
): string {
  const value = data?.lapNumber !== undefined ? (data.lapNumber + 1).toString() : '--';
  return drawSingleValue(isDial, value, null, titleInfo);
}

export function createPositionOnlyImage(
  isDial: boolean,
  data: Pick<RaceInfoDrawData, 'racePosition'> | undefined,
  titleInfo?: TitleInfo,
): string {
  const value = data?.racePosition !== undefined ? data.racePosition.toString() : '--';
  return drawSingleValue(isDial, value, null, titleInfo);
}

// --- 非公開描画ヘルパー ---

function drawAllWheels(
  isDial: boolean,
  values: readonly number[],
  texts: readonly string[],
  colors: readonly string[],
  radius = 0,
  titleInfo?: TitleInfo,
): string {
  if (values.length !== 4 || texts.length !== 4 || colors.length !== 4) {
    throw new Error('values, texts and colors length must be 4');
  }

  const adj = getLayoutAdjustments(isDial, titleInfo);

  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const cx = width / 2;
  const cy = height / 2;

  let offsetY = adj.offsetY;
  if (titleInfo && isDial) {
    offsetY = 12;
  }

  const bodyW = 22;
  const bodyH = bodyW * (titleInfo && isDial ? 2.5 : titleInfo ? 2 : 3.25);
  const bodyX = cx - bodyW / 2;
  const bodyY = cy - bodyH / 2 + offsetY;

  const barOffsetX = bodyW;
  const barOffsetY = bodyH * 0.32;
  const barH = bodyH * 0.5;
  const barW = barH * 0.5;
  const barX_Left = cx - barW - barOffsetX;
  const barX_Right = cx + barOffsetX;
  const barY_Front = cy - barH / 2 - barOffsetY + offsetY;
  const barY_Rear = cy - barH / 2 + barOffsetY + offsetY;

  const axelX_Left = cx - barOffsetX;
  const axelX_Right = cx + barOffsetX;
  const axelY_Front = barY_Front + barH / 2;
  const axelY_Rear = barY_Rear + barH / 2;

  const barH_FL = clamp(barH * values[0], 0, barH);
  const barH_FR = clamp(barH * values[1], 0, barH);
  const barH_RL = clamp(barH * values[2], 0, barH);
  const barH_RR = clamp(barH * values[3], 0, barH);

  const barY_FL = barY_Front + barH - barH_FL;
  const barY_FR = barY_Front + barH - barH_FR;
  const barY_RL = barY_Rear + barH - barH_RL;
  const barY_RR = barY_Rear + barH - barH_RR;

  const rx = barW * radius;

  if (isDial) {
    const fontSize = 20;
    const textOffsetX = 5;
    const textOffsetY = -6;
    const textX_Left = barX_Left - textOffsetX;
    const textX_Right = barX_Right + barW + textOffsetX;
    const textY_Front = barY_Front + barH + textOffsetY;
    const textY_Rear = barY_Rear + barH + textOffsetY;

    return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}
  ${adj.titleElement}

  <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" fill="${Color.BLACK}" stroke="${Color.DARK_GREY}" rx="4" stroke-width="2"/>
  <line x1="${axelX_Left}" y1="${axelY_Front}" x2="${axelX_Right}" y2="${axelY_Front}" stroke="${Color.DARK_GREY}" stroke-width="2"/>
  <line x1="${axelX_Left}" y1="${axelY_Rear}" x2="${axelX_Right}" y2="${axelY_Rear}" stroke="${Color.DARK_GREY}" stroke-width="2"/>

  <rect x="${barX_Left}" y="${barY_Front}" width="${barW}" height="${barH}" fill="${Color.DARK_GREY}" rx="${rx}"/>
  <rect x="${barX_Left}" y="${barY_FL}" width="${barW}" height="${barH_FL}" fill="${colors[0]}" rx="${rx}"/>

  <rect x="${barX_Right}" y="${barY_Front}" width="${barW}" height="${barH}" fill="${Color.DARK_GREY}" rx="${rx}"/>
  <rect x="${barX_Right}" y="${barY_FR}" width="${barW}" height="${barH_FR}" fill="${colors[1]}" rx="${rx}"/>

  <rect x="${barX_Left}" y="${barY_Rear}" width="${barW}" height="${barH}" fill="${Color.DARK_GREY}" rx="${rx}"/>
  <rect x="${barX_Left}" y="${barY_RL}" width="${barW}" height="${barH_RL}" fill="${colors[2]}" rx="${rx}"/>

  <rect x="${barX_Right}" y="${barY_Rear}" width="${barW}" height="${barH}" fill="${Color.DARK_GREY}" rx="${rx}"/>
  <rect x="${barX_Right}" y="${barY_RR}" width="${barW}" height="${barH_RR}" fill="${colors[3]}" rx="${rx}"/>

  <text x="${textX_Left}" y="${textY_Front}" font-size="${fontSize}" fill="${Color.WHITE}" text-anchor="end">${texts[0]}</text>
  <text x="${textX_Right}" y="${textY_Front}" font-size="${fontSize}" fill="${Color.WHITE}" text-anchor="start">${texts[1]}</text>
  <text x="${textX_Left}" y="${textY_Rear}" font-size="${fontSize}" fill="${Color.WHITE}" text-anchor="end">${texts[2]}</text>
  <text x="${textX_Right}" y="${textY_Rear}" font-size="${fontSize}" fill="${Color.WHITE}" text-anchor="start">${texts[3]}</text>
</svg>
`);
  } else {
    const fontSize = 20;
    const textX_Left = 64;
    const textX_Right = width - PADDING;
    const textY_Front = barY_Front - 6;
    const textY_Rear = barY_Rear + barH + 22;

    return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}

  <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" fill="${Color.BLACK}" stroke="${Color.DARK_GREY}" rx="4" stroke-width="2"/>
  <line x1="${axelX_Left}" y1="${axelY_Front}" x2="${axelX_Right}" y2="${axelY_Front}" stroke="${Color.DARK_GREY}" stroke-width="2"/>
  <line x1="${axelX_Left}" y1="${axelY_Rear}" x2="${axelX_Right}" y2="${axelY_Rear}" stroke="${Color.DARK_GREY}" stroke-width="2"/>

  <rect x="${barX_Left}" y="${barY_Front}" width="${barW}" height="${barH}" fill="${Color.DARK_GREY}" rx="${rx}"/>
  <rect x="${barX_Left}" y="${barY_FL}" width="${barW}" height="${barH_FL}" fill="${colors[0]}" rx="${rx}"/>

  <rect x="${barX_Right}" y="${barY_Front}" width="${barW}" height="${barH}" fill="${Color.DARK_GREY}" rx="${rx}"/>
  <rect x="${barX_Right}" y="${barY_FR}" width="${barW}" height="${barH_FR}" fill="${colors[1]}" rx="${rx}"/>

  <rect x="${barX_Left}" y="${barY_Rear}" width="${barW}" height="${barH}" fill="${Color.DARK_GREY}" rx="${rx}"/>
  <rect x="${barX_Left}" y="${barY_RL}" width="${barW}" height="${barH_RL}" fill="${colors[2]}" rx="${rx}"/>

  <rect x="${barX_Right}" y="${barY_Rear}" width="${barW}" height="${barH}" fill="${Color.DARK_GREY}" rx="${rx}"/>
  <rect x="${barX_Right}" y="${barY_RR}" width="${barW}" height="${barH_RR}" fill="${colors[3]}" rx="${rx}"/>

  <text x="${textX_Left}" y="${textY_Front}" font-size="${fontSize}" fill="${Color.WHITE}" text-anchor="end">${texts[0]}</text>
  <text x="${textX_Right}" y="${textY_Front}" font-size="${fontSize}" fill="${Color.WHITE}" text-anchor="end">${texts[1]}</text>
  <text x="${textX_Left}" y="${textY_Rear}" font-size="${fontSize}" fill="${Color.WHITE}" text-anchor="end">${texts[2]}</text>
  <text x="${textX_Right}" y="${textY_Rear}" font-size="${fontSize}" fill="${Color.WHITE}" text-anchor="end">${texts[3]}</text>
</svg>
`);
  }
}

function drawSingleWheel(
  isDial: boolean,
  position: SingleWheelPosition,
  value: number,
  text: string,
  color: string,
  radius = 0,
  titleInfo?: TitleInfo,
): string {
  const adj = getLayoutAdjustments(isDial, titleInfo);

  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const cx = width / 2;
  const cy = height / 2;

  const offsetBarX = width * 0.05;
  const barH = height * 0.75;
  const barW = barH / 2;
  const barX = cx + offsetBarX;
  const barY = cy - barH / 2 + adj.offsetY;

  const barH_Value = clamp(barH * value, 0, barH);
  const barY_Value = barY + barH - barH_Value;

  const fontSize = 30;
  const textOffsetX = 6;
  const textOffsetY = 3;
  const textX = barX - textOffsetX;
  const textY = barY + barH - textOffsetY;

  const rx = barW * radius;

  return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}
  ${adj.titleElement}

  <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" fill="${Color.DARK_GREY}" rx="${rx}"/>
  <rect x="${barX}" y="${barY_Value}" width="${barW}" height="${barH_Value}" fill="${color}" rx="${rx}"/>

  <text x="${cx / 2}" y="${barY + 24}" font-size="${fontSize}" text-anchor="middle" fill="${Color.GREY}">${position.toUpperCase()}</text>
  <text x="${textX}" y="${textY}" font-size="${fontSize}" text-anchor="end" fill="${Color.WHITE}">${text}</text>
</svg>
`);
}

function drawSpeedMeterFull(
  isDial: boolean,
  speed: string,
  gear: string,
  rpmPct: number,
  rpmColor: string,
  unit: string,
  titleInfo?: TitleInfo,
): string {
  const adj = getLayoutAdjustments(isDial, titleInfo);

  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const rpmBarPaddingX = PADDING * 2;
  const rpmBarW = width - rpmBarPaddingX;
  const rpmFillW = clamp(rpmBarW * rpmPct, 0, rpmBarW);

  if (isDial) {
    const rpmBarH = 20;
    const rpmBarX = PADDING;
    const rpmBarY = height - rpmBarH - PADDING;
    const speedY = 64;
    const gearCircleY = 47;

    return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}
  ${adj.titleElement}

  <text x="152" y="${speedY}" font-size="54" text-anchor="end" fill="${Color.WHITE}">${speed}</text>
  <text x="${width - PADDING}" y="${speedY}" font-size="14" fill="${Color.GREY}" text-anchor="end">${unit}</text>

  ${drawGearComponent(34, gearCircleY, 32, gear)}

  <rect x="${rpmBarX}" y="${rpmBarY}" width="${rpmBarW}" height="${rpmBarH}" fill="${Color.DARK_GREY}"/>
  <rect x="${rpmBarX}" y="${rpmBarY}" width="${rpmFillW}" height="${rpmBarH}" fill="${rpmColor}"/>
</svg>
`);
  } else {
    const speedX = width - 55;
    const speedY = 66 + adj.offsetY;

    const speedUnitX = width - PADDING;

    const gearFontSize = 34;
    const gearCircleX = 34;
    const gearCircleY = speedY + 35;

    const rpmBarH = 30;
    const rpmBarX = 65;
    const rpmBarY = speedY + 20;
    const rpmBarW = width - rpmBarX - PADDING;
    const rpmFillW = clamp(rpmBarW * rpmPct, 0, rpmBarW);

    return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}

  <text x="${speedX}" y="${speedY}" font-size="48" fill="${Color.WHITE}" text-anchor="end">${speed}</text>
  <text x="${speedUnitX}" y="${speedY}" font-size="18" fill="${Color.GREY}" text-anchor="end">${unit}</text>

  ${drawGearComponent(gearCircleX, gearCircleY, gearFontSize, gear)}

  <rect x="${rpmBarX}" y="${rpmBarY}" width="${rpmBarW}" height="${rpmBarH}" fill="${Color.DARK_GREY}"/>
  <rect x="${rpmBarX}" y="${rpmBarY}" width="${rpmFillW}" height="${rpmBarH}" fill="${rpmColor}"/>
</svg>
`);
  }
}

function drawTimeValue(
  isDial: boolean,
  time?: number,
  titleInfo?: TitleInfo,
): string {
  const adj = getLayoutAdjustments(isDial, titleInfo);

  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const cy = height / 2 + adj.offsetY;

  const fontSize = isDial ? 34 : 26;
  const textX = width - PADDING;
  const textY = cy + fontSize * 0.38;

  return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}
  ${adj.titleElement}

  <text x="${textX}" y="${textY}" font-size="${fontSize}" text-anchor="end" fill="${Color.WHITE}">${formatTime(time)}</text>
</svg>
`);
}

function drawSingleValue(
  isDial: boolean,
  value: string | null | undefined,
  unit: string | null | undefined,
  titleInfo?: TitleInfo,
): string {
  const adj = getLayoutAdjustments(isDial, titleInfo);

  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const cx = width / 2;
  const cy = height / 2 + adj.offsetY;

  const unitX = width - PADDING;
  const unitY = titleInfo?.titleAlignment === 'bottom' ? PADDING + 12 : height - PADDING;

  return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}
  ${adj.titleElement}

  <text x="${cx}" y="${cy + 21}" font-size="56" text-anchor="middle" fill="${Color.WHITE}">${value ?? ''}</text>
  ${unit ? `<text x="${unitX}" y="${unitY}" font-size="24" text-anchor="end" fill="${Color.GREY}">${unit}</text>` : ''}
</svg>
`);
}

function drawRpmValue(
  isDial: boolean,
  currentEngineRpm: number | null | undefined,
  engineMaxRpm: number | null | undefined,
  titleInfo?: TitleInfo,
): string {
  const adj = getLayoutAdjustments(isDial, titleInfo);

  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const cx = width / 2;
  const cy = height / 2 + adj.offsetY;

  const unitX = width - PADDING;
  const unitY = titleInfo?.titleAlignment === 'bottom' ? PADDING + 12 : height - PADDING;

  const { rpm, rpmColor } = formatRpmBar(currentEngineRpm, engineMaxRpm);

  return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}
  ${adj.titleElement}

  <text x="${cx}" y="${cy + 19}" font-size="50" text-anchor="middle" fill="${rpmColor}">${rpm.toFixed(0)}</text>
  <text x="${unitX}" y="${unitY}" font-size="24" text-anchor="end" fill="${Color.GREY}">RPM</text>
</svg>
`);
}

function drawGearCircle(
  isDial: boolean,
  gear: string,
  titleInfo?: TitleInfo,
): string {
  const adj = getLayoutAdjustments(isDial, titleInfo);

  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const cx = width / 2;
  const cy = height / 2 + adj.offsetY;

  const fontSize = isDial ? 50 : 60;

  return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}
  ${adj.titleElement}

  ${drawGearComponent(cx, cy, fontSize, gear)}
</svg>
`);
}

/**
 * ギアチェンジ表示等で使用する、共通のギア円コンポーネント（外円とギア文字）を描画します。
 *
 * @note 文字サイズと外円の美しいプロポーションを一定に保つため、
 *       フォントサイズ（fontSize）に基づいて外円の半径（r = fontSize * 0.6）および
 *       線の太さ（stroke-width = r * 0.15）を動的に算出します。
 *       また、文字の重心を円の中心に合わせるため、垂直ベースラインを cy + fontSize * 0.37 に補正します。
 *
 * @param cx - 円の中心X座標
 * @param cy - 円の中心Y座標
 * @param fontSize - ギア文字のフォントサイズ
 * @param gear - 描画するギアの文字
 * @returns ギア円のSVG要素文字列
 */
function drawGearComponent(
  cx: number,
  cy: number,
  fontSize: number,
  gear: string,
): string {
  const r = fontSize * 0.6;
  const sw = r * 0.15;
  const textY = cy + fontSize * 0.37;
  return `
  <circle cx="${cx}" cy="${cy}" r="${r}" stroke="${Color.GREEN}" stroke-width="${sw}"/>
  <text x="${cx}" y="${textY}" font-size="${fontSize}" text-anchor="middle" fill="${Color.GREEN}">${gear}</text>
  `;
}
