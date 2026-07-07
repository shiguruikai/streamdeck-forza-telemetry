import { clamp } from './utils';

/**
 * SVG文字列をStream DeckのsetImage等で使用可能なData URI形式に変換します。
 *
 * @param svg SVGソース文字列
 * @returns Data URI形式の文字列
 */
export function toSvgDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg.replace(/>\s+</g, '><').trim())}`;
}

export function createAllWheelsImage(
  title: string | null | undefined,
  isDial: boolean,
  values: readonly number[],
  texts: readonly string[],
  colors: readonly string[],
  radius: number = 0,
): string {
  if (values.length !== 4 || texts.length !== 4 || colors.length !== 4) {
    throw new Error('values, texts and colors length must be 4');
  }

  const width = (isDial ? 200 : 144);
  const height = (isDial ? 100 : 144);

  const offsetY = title ? 10 : 0;

  const cx = width / 2;
  const cy = height / 2 + offsetY;

  const bodyW = isDial ? 20 : 18;
  const bodyH = isDial ? 54 : 48;
  const bodyX = cx - bodyW / 2;
  const bodyY = cy - bodyH / 2;

  const barOffsetX = bodyW;
  const barOffsetY = bodyH * 0.35;
  const barH = bodyH * 0.5;
  const barW = bodyH * 0.25;
  const barX_Left = cx - barW - barOffsetX;
  const barX_Right = cx + barOffsetX;
  const barY_Front = cy - barH / 2 - barOffsetY;
  const barY_Rear = cy - barH / 2 + barOffsetY;

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

  const fontSize = 20;
  const textPaddingX = isDial ? 5 : -20;
  const textOffsetY = -6;
  const textX_Left = barX_Left - textPaddingX;
  const textX_Right = barX_Right + barW + textPaddingX;
  const textY_Front = isDial ? barY_Front + barH + textOffsetY : barY_Front - 5;
  const textY_Rear = isDial ? barY_Rear + barH + textOffsetY : barY_Rear + barH + 20;

  const rx = barW * radius;

  const titleText = title ? `<text x="${cx}" y="19" font-size="14" text-anchor="middle" font-weight="bold" fill="#7f7f7f">${title}</text>` : '';

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="4" fill="#111111" stroke="#333333" stroke-width="2"/>
  <line x1="${axelX_Left}" y1="${axelY_Front}" x2="${axelX_Right}" y2="${axelY_Front}" stroke="#333333" stroke-width="2"/>
  <line x1="${axelX_Left}" y1="${axelY_Rear}" x2="${axelX_Right}" y2="${axelY_Rear}" stroke="#333333" stroke-width="2"/>

  <rect x="${barX_Left}" y="${barY_Front}" width="${barW}" height="${barH}" fill="#333333" rx="${rx}"/>
  <rect x="${barX_Left}" y="${barY_FL}" width="${barW}" height="${barH_FL}" fill="${colors[0]}" rx="${rx}"/>

  <rect x="${barX_Right}" y="${barY_Front}" width="${barW}" height="${barH}" fill="#333333" rx="${rx}"/>
  <rect x="${barX_Right}" y="${barY_FR}" width="${barW}" height="${barH_FR}" fill="${colors[1]}" rx="${rx}"/>

  <rect x="${barX_Left}" y="${barY_Rear}" width="${barW}" height="${barH}" fill="#333333" rx="${rx}"/>
  <rect x="${barX_Left}" y="${barY_RL}" width="${barW}" height="${barH_RL}" fill="${colors[2]}" rx="${rx}"/>

  <rect x="${barX_Right}" y="${barY_Rear}" width="${barW}" height="${barH}" fill="#333333" rx="${rx}"/>
  <rect x="${barX_Right}" y="${barY_RR}" width="${barW}" height="${barH_RR}" fill="${colors[3]}" rx="${rx}"/>

  <text x="${textX_Left}" y="${textY_Front}" font-size="${fontSize}" font-weight="bold" fill="#ffffff" text-anchor="end">${texts[0]}</text>
  <text x="${textX_Right}" y="${textY_Front}" font-size="${fontSize}" font-weight="bold" fill="#ffffff" text-anchor="start">${texts[1]}</text>
  <text x="${textX_Left}" y="${textY_Rear}" font-size="${fontSize}" font-weight="bold" fill="#ffffff" text-anchor="end">${texts[2]}</text>
  <text x="${textX_Right}" y="${textY_Rear}" font-size="${fontSize}" font-weight="bold" fill="#ffffff" text-anchor="start">${texts[3]}</text>

  ${titleText}
</svg>
`;

  return toSvgDataUri(svg);
}

export function createWheelImage(
  title: string | null | undefined,
  isDial: boolean,
  position: 'fl' | 'fr' | 'rl' | 'rr',
  value: number,
  text: string,
  color: string,
  radius: number = 0,
): string {
  const width = (isDial ? 200 : 144);
  const height = (isDial ? 100 : 144);

  const offsetY = title ? 10 : 0;

  const cx = width / 2;
  const cy = height / 2 + offsetY;

  const barH = height * 0.6;
  const barW = barH / 2;

  const barX = cx;
  const barY = cy - barH / 2;

  const barH_Value = clamp(barH * value, 0, barH);
  const barY_Value = barY + barH - barH_Value;

  const textX = barX - barW * 0.2;
  const textY = barY + barH;

  const rx = barW * clamp(radius, 0, 0.5);

  const titleText = title ? `<text x="${cx}" y="19" text-anchor="middle" font-size="14" font-weight="bold" fill="#7f7f7f">${title}</text>` : '';

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" fill="#333333" rx="${rx}"/>
  <rect x="${barX}" y="${barY_Value}" width="${barW}" height="${barH_Value}" fill="${color}" rx="${rx}"/>

  <text x="${cx / 2}" y="${barY + 24}" text-anchor="middle" font-size="24" font-weight="bold" fill="#7f7f7f">${position.toUpperCase()}</text>
  <text x="${textX}" y="${textY}" text-anchor="end" font-size="24" font-weight="bold" fill="#ffffff">${text}</text>

  ${titleText}
</svg>
`;

  return toSvgDataUri(svg);
}

export function createGForceImage(
  isDial: boolean,
  scale: number,
  curX: number,
  curZ: number,
  curTotal: number,
  peak: { x: number; z: number; total: number },
  showResetText: boolean,
): string {
  const width = isDial ? 200 : 144;
  const height = isDial ? 100 : 144;

  const cx = width / 2;
  const cy = height / 2;

  const maxRadius = isDial ? 42 : 56;
  const rOuter = maxRadius;
  const rInner = maxRadius / 2;
  const rBall = maxRadius / 7;

  let currentPlotX: number;
  let currentPlotY: number;
  if (curTotal > scale) {
    currentPlotX = cx + (curX / curTotal) * maxRadius;
    currentPlotY = cy + (curZ / curTotal) * maxRadius;
  } else {
    currentPlotX = cx + (curX / scale) * maxRadius;
    currentPlotY = cy + (curZ / scale) * maxRadius;
  }

  let peakPlotX: number;
  let peakPlotY: number;
  if (peak.total > scale) {
    peakPlotX = cx + (peak.x / peak.total) * maxRadius;
    peakPlotY = cy + (peak.z / peak.total) * maxRadius;
  } else {
    peakPlotX = cx + (peak.x / scale) * maxRadius;
    peakPlotY = cy + (peak.z / scale) * maxRadius;
  }

  const scaleText = `${scale.toFixed(1)}G`;
  const peakText = peak.total.toFixed(2);
  const currentGText = curTotal.toFixed(2);

  const centerDisplay = showResetText
    ? `<text x="${cx}" y="${cy + 7}" text-anchor="middle" font-size="20" font-weight="bold" fill="#00ff7f">RESET</text>`
    : '';

  const padding = 10;
  const leftTextX = padding;
  const rightTextX = width - padding;
  const bottomTextY = height - padding;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#000000"/>
  <line x1="${cx - maxRadius}" y1="${cy}" x2="${cx + maxRadius}" y2="${cy}" stroke="#333333" stroke-width="2" stroke-dasharray="2,4"/>
  <line x1="${cx}" y1="${cy - maxRadius}" x2="${cx}" y2="${cy + maxRadius}" stroke="#333333" stroke-width="2" stroke-dasharray="2,4"/>

  <circle cx="${cx}" cy="${cy}" r="${rInner}" fill="none" stroke="#333333" stroke-width="2" stroke-dasharray="4,4"/>
  <circle cx="${cx}" cy="${cy}" r="${rOuter}" fill="none" stroke="#444444" stroke-width="2"/>

  <circle cx="${peakPlotX}" cy="${peakPlotY}" r="${rBall}" fill="#ffcc00" opacity="0.5"/>
  <circle cx="${currentPlotX}" cy="${currentPlotY}" r="${rBall}" fill="#ff3b30"/>

  <line x1="${cx}" y1="${cy}" x2="${currentPlotX}" y2="${currentPlotY}" stroke="#ff3b30" stroke-width="6" opacity="0.5"/>

  <text x="${leftTextX}" y="${bottomTextY}" font-size="16" font-weight="bold" fill="#7f7f7f">${scaleText}</text>
  <text x="${rightTextX}" y="22" text-anchor="end" font-size="18" font-weight="bold" fill="#ffcc00">${peakText}</text>
  <text x="${rightTextX}" y="${bottomTextY}" text-anchor="end" font-size="18" font-weight="bold" fill="#ffffff">${currentGText}</text>
  ${centerDisplay}
</svg>
`;

  return toSvgDataUri(svg);
}
