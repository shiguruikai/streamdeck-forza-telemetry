import { SpeedUnit } from '../../shared';
import { ForzaTelemetryData } from '../../telemetry/parser';
import { formatGear, formatRpmBar, formatSpeed, formatSpeedUnit } from '../format';
import { clamp } from '../utils';
import { Color, DIAL_HEIGHT, DIAL_WIDTH, generateGearSvgComponent, generateSingleValueImage, getCommonStyle, getLayoutAdjustments, KEY_HEIGHT, KEY_WIDTH, PADDING, TitleInfo, toSvgDataUri } from './common';

export type SpeedMeterDrawData = Pick<
  Readonly<ForzaTelemetryData>,
  'speed' | 'gear' | 'currentEngineRpm' | 'engineMaxRpm'
>;

export function generateSpeedMeterImage(
  isDial: boolean,
  data: SpeedMeterDrawData | undefined,
  unit: SpeedUnit,
  previousGear?: string,
  titleInfo?: TitleInfo,
): string {
  const unitText = formatSpeedUnit(unit);
  const speedText = formatSpeed(data?.speed, unit);
  const gearText = formatGear(data?.gear, previousGear);
  const { rpmPct, rpmColor } = formatRpmBar(data?.currentEngineRpm, data?.engineMaxRpm);

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

  <text x="152" y="${speedY}" font-size="54" text-anchor="end" fill="${Color.WHITE}">${speedText}</text>
  <text x="${width - PADDING}" y="${speedY}" font-size="14" fill="${Color.GREY}" text-anchor="end">${unitText}</text>

  ${generateGearSvgComponent(34, gearCircleY, 32, gearText)}

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

  <text x="${speedX}" y="${speedY}" font-size="48" fill="${Color.WHITE}" text-anchor="end">${speedText}</text>
  <text x="${speedUnitX}" y="${speedY}" font-size="18" fill="${Color.GREY}" text-anchor="end">${unitText}</text>

  ${generateGearSvgComponent(gearCircleX, gearCircleY, gearFontSize, gearText)}

  <rect x="${rpmBarX}" y="${rpmBarY}" width="${rpmBarW}" height="${rpmBarH}" fill="${Color.DARK_GREY}"/>
  <rect x="${rpmBarX}" y="${rpmBarY}" width="${rpmFillW}" height="${rpmBarH}" fill="${rpmColor}"/>
</svg>
`);
  }
}

export function generateSpeedImage(
  isDial: boolean,
  data: Pick<SpeedMeterDrawData, 'speed'> | undefined,
  unit: SpeedUnit,
  titleInfo?: TitleInfo,
): string {
  return generateSingleValueImage(isDial, formatSpeed(data?.speed, unit), formatSpeedUnit(unit), titleInfo);
}

export function generateGearImage(
  isDial: boolean,
  data: Pick<SpeedMeterDrawData, 'gear'> | undefined,
  previousGear?: string,
  titleInfo?: TitleInfo,
): { image: string; gearText: string } {
  const gearText = formatGear(data?.gear, previousGear);

  const adj = getLayoutAdjustments(isDial, titleInfo);

  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const cx = width / 2;
  const cy = height / 2 + adj.offsetY;

  const fontSize = isDial ? 50 : 60;

  const image = toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}
  ${adj.titleElement}

  ${generateGearSvgComponent(cx, cy, fontSize, gearText)}
</svg>
`);

  return { image, gearText };
}

export function generateRpmImage(
  isDial: boolean,
  data: Pick<SpeedMeterDrawData, 'currentEngineRpm' | 'engineMaxRpm'> | undefined,
  titleInfo?: TitleInfo,
): string {
  const adj = getLayoutAdjustments(isDial, titleInfo);

  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const cx = width / 2;
  const cy = height / 2 + adj.offsetY;

  const unitX = width - PADDING;
  const unitY = titleInfo?.titleAlignment === 'bottom' ? PADDING + 12 : height - PADDING;

  const { rpm, rpmColor } = formatRpmBar(data?.currentEngineRpm, data?.engineMaxRpm);

  return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}
  ${adj.titleElement}

  <text x="${cx}" y="${cy + 19}" font-size="50" text-anchor="middle" fill="${rpmColor}">${rpm.toFixed(0)}</text>
  <text x="${unitX}" y="${unitY}" font-size="24" text-anchor="end" fill="${Color.GREY}">RPM</text>
</svg>
`);
}
