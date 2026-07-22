import { Color, DIAL_HEIGHT, DIAL_WIDTH, getCommonStyle, getLayoutAdjustments, KEY_HEIGHT, KEY_WIDTH, PADDING, TitleInfo, toSvgDataUri } from './common';

export function generateGForceImage(
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
    const scaleDivisor = Math.max(peak.total, scale);
    const peakPlotX = cx + (peak.x / scaleDivisor) * maxRadius;
    const peakPlotY = cy + (peak.z / scaleDivisor) * maxRadius;
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
