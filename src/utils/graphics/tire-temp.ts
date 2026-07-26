import { SingleWheelPosition, TempUnit } from '../../shared';
import { ForzaTelemetryData } from '../../telemetry/parser';
import { formatTemp, formatTireColor } from '../format';
import { TitleInfo } from './common';
import { generateAllWheelsImage, generateSingleWheelImage } from './wheels';

export type TireTempDrawData = Pick<
  Readonly<ForzaTelemetryData>,
  'tireTempFrontLeft' | 'tireTempFrontRight' | 'tireTempRearLeft' | 'tireTempRearRight'
>;

export function generateTireTempAllWheelsImage(
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
  return generateAllWheelsImage(isDial, values, texts, colors, 0.4, titleInfo);
}

export function generateTireTempSingleWheelImage(
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

  return generateSingleWheelImage(
    isDial,
    position,
    1,
    formatTemp(temp, unit),
    formatTireColor(temp),
    0.4,
    titleInfo,
  );
}
