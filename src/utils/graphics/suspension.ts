import { SingleWheelPosition, SuspensionMode } from '../../shared';
import { ForzaTelemetryData } from '../../telemetry/parser';
import { formatTravel, formatTravelColor } from '../format';
import { TitleInfo } from './common';
import { generateAllWheelsImage, generateSingleWheelImage } from './wheels';

export type SuspensionDrawData = Pick<
  Readonly<ForzaTelemetryData>,
  | 'normalizedSuspensionTravelFrontLeft'
  | 'normalizedSuspensionTravelFrontRight'
  | 'normalizedSuspensionTravelRearLeft'
  | 'normalizedSuspensionTravelRearRight'
>;

export function generateSuspensionTravelAllWheelsImage(
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
  return generateAllWheelsImage(isDial, values, texts, colors, 0, titleInfo);
}

export function generateSuspensionTravelSingleWheelImage(
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

  return generateSingleWheelImage(
    isDial,
    position,
    travel ?? 0,
    formatTravel(travel, mode),
    formatTravelColor(travel),
    0,
    titleInfo,
  );
}
