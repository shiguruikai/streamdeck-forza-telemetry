import { ForzaTelemetryData } from '../../telemetry/parser';
import { formatLap, formatPosition, formatTime } from '../format';
import { Color, DIAL_HEIGHT, DIAL_WIDTH, generateSingleTimeImage, generateSingleValueImage, getCommonStyle, getLayoutAdjustments, KEY_HEIGHT, KEY_WIDTH, PADDING, TitleInfo, toSvgDataUri } from './common';

export type RaceInfoDrawData = Pick<
  Readonly<ForzaTelemetryData>,
  'racePosition' | 'currentRaceTime' | 'lapNumber' | 'currentLap' | 'bestLap'
>;

export function generateRaceInfoImage(
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

export function generateRacePosAndTimeImage(
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

export function generateRaceTimeImage(
  isDial: boolean,
  data: Pick<RaceInfoDrawData, 'currentRaceTime'> | undefined,
  titleInfo?: TitleInfo,
): string {
  return generateSingleTimeImage(isDial, data?.currentRaceTime, titleInfo);
}

export function generateLapTimeImage(
  isDial: boolean,
  data: Pick<RaceInfoDrawData, 'currentLap'> | undefined,
  titleInfo?: TitleInfo,
): string {
  return generateSingleTimeImage(isDial, data?.currentLap, titleInfo);
}

export function generateBestLapTimeImage(
  isDial: boolean,
  data: Pick<RaceInfoDrawData, 'bestLap'> | undefined,
  titleInfo?: TitleInfo,
): string {
  return generateSingleTimeImage(isDial, data?.bestLap, titleInfo);
}

export function generateLapNumberImage(
  isDial: boolean,
  data: Pick<RaceInfoDrawData, 'lapNumber'> | undefined,
  titleInfo?: TitleInfo,
): string {
  const value = data?.lapNumber !== undefined ? (data.lapNumber + 1).toString() : '--';
  return generateSingleValueImage(isDial, value, null, titleInfo);
}

export function generatePositionImage(
  isDial: boolean,
  data: Pick<RaceInfoDrawData, 'racePosition'> | undefined,
  titleInfo?: TitleInfo,
): string {
  const value = data?.racePosition !== undefined ? data.racePosition.toString() : '--';
  return generateSingleValueImage(isDial, value, null, titleInfo);
}
