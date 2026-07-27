import { ForzaTelemetryData } from '../../telemetry/parser';
import { formatCarSpec } from '../format';
import { Color, DIAL_HEIGHT, DIAL_WIDTH, getCommonStyle, getLayoutAdjustments, KEY_HEIGHT, KEY_WIDTH, TitleInfo, toSvgDataUri } from './common';

export type CarSpecDrawData = Pick<
  Readonly<ForzaTelemetryData>,
  'game' | 'carClass' | 'carPerformanceIndex' | 'drivetrainType' | 'numCylinders'
>;

export function generateCarSpecImage(
  isDial: boolean,
  data: CarSpecDrawData | undefined,
  showCylinders: boolean,
  titleInfo: TitleInfo | undefined,
): string {
  const { classLabel, classColor, piStr, drivetrainStr, cylindersStr } = formatCarSpec(data);

  const activeCylindersStr = showCylinders ? cylindersStr : '';
  const subTextStr = [drivetrainStr, activeCylindersStr].filter(Boolean).join(' ');

  const adj = getLayoutAdjustments(isDial, titleInfo);

  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const cx = width / 2;

  const badgeW = isDial ? (titleInfo ? 110 : 155) : 130;
  const badgeH = badgeW / 3;
  const badgeX = cx - badgeW / 2;
  const badgeY = (isDial ? (titleInfo ? 26 : 10) : 35) + adj.offsetY;
  const badgeCY = badgeY + badgeH / 2;

  const classFontSize = badgeW * 0.25;
  const classX = badgeX + badgeW * 0.2;
  const classY = badgeCY + classFontSize * 0.38;

  const piMargin = badgeH * 0.05;
  const piBoxX = badgeX + badgeW * 0.4;
  const piBoxY = badgeY + piMargin;
  const piBoxW = badgeW * 0.6 - piMargin;
  const piBoxH = badgeH - piMargin * 2;
  const piBoxCX = piBoxX + piBoxW / 2;

  const piFontSize = classFontSize * 0.9;
  const piX = piBoxCX;
  const piY = badgeCY + piFontSize * 0.38;

  const subFontSize = 20;
  const subW = badgeW;
  const subH = subFontSize * 1.3;
  const subX = badgeX;
  const subY = badgeY + badgeH + 6;
  const subCX = cx;
  const subCY = subY + subH / 2;
  const subTextY = subCY + subFontSize * 0.38;

  return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}
  ${adj.titleElement}

  <rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="4" fill="${classColor}"/>
  <text x="${classX}" y="${classY}" font-size="${classFontSize}" text-anchor="middle" fill="${Color.WHITE}" stroke="${Color.WHITE}" stroke-width="1">${classLabel}</text>
  <rect x="${piBoxX}" y="${piBoxY}" width="${piBoxW}" height="${piBoxH}" rx="4" fill="${Color.BLACK}"/>
  <text x="${piX}" y="${piY}" font-size="${piFontSize}" text-anchor="middle" fill="${Color.WHITE}">${piStr}</text>

  <rect x="${subX}" y="${subY}" width="${subW}" height="${subH}" rx="4" fill="${Color.DARK_GREY}"/>
  <text x="${subCX}" y="${subTextY}" font-size="${subFontSize}" text-anchor="middle" fill="${Color.WHITE}">${subTextStr}</text>
</svg>
`);
}
