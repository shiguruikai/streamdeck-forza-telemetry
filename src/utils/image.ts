import { clamp } from './utils';

const DEFAULT_FONT = '';

let globalFont = DEFAULT_FONT;

export function getGlobalFont(): string {
  return globalFont;
}

export function setGlobalFont(font: string): void {
  globalFont = font;
}

export const DIAL_WIDTH = 200;
export const DIAL_HEIGHT = 100;
export const KEY_WIDTH = 144;
export const KEY_HEIGHT = 144;

const DIAL_PADDING = 8;
const KEY_PADDING = 10;

const CENTER_OFFSET_Y = 10;

export const enum Color {
  WHITE = '#dedede',
  GREY = '#8f8f8f',
  DARK_GREY = '#2e2e2e',
  BLACK = '#111111',
  RED = '#ff5846',
  YELLOW = '#c7c600',
  GREEN = '#00e567',
}

export function toSvgDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg.replace(/>\s+</g, '><').trim())}`;
}

function getCommonStyle(): string {
  const fontFamily = globalFont ? `font-family:"${globalFont}";` : '';
  return `<style>text{${fontFamily}font-weight:bold;}</style>`;
}

function getTitleText(title: string, x: number, anchor: 'start' | 'end' | 'middle' = 'middle'): string {
  return `<text x="${x}" y="16" font-size="14" text-anchor="${anchor}" fill="${Color.GREY}">${title}</text>`;
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

  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const cx = width / 2;
  const cy = height / 2;

  const offsetBodY = title ? CENTER_OFFSET_Y : 0;

  const bodyW = 24;
  const bodyH = bodyW * (title ? 2.5 : 3);
  const bodyX = cx - bodyW / 2;
  const bodyY = cy - bodyH / 2 + offsetBodY;

  const barOffsetX = bodyW;
  const barOffsetY = bodyH * 0.32;
  const barH = bodyH * 0.5;
  const barW = barH * 0.5;
  const barX_Left = cx - barW - barOffsetX;
  const barX_Right = cx + barOffsetX;
  const barY_Front = cy - barH / 2 - barOffsetY + offsetBodY;
  const barY_Rear = cy - barH / 2 + barOffsetY + offsetBodY;

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
    // ダイヤルの場合、バーの左または右に値のテキストを表示する。
    const fontSize = 20;
    const textOffsetX = 5;
    const textOffsetY = -6;
    const textX_Left = barX_Left - textOffsetX;
    const textX_Right = barX_Right + barW + textOffsetX;
    const textY_Front = barY_Front + barH + textOffsetY;
    const textY_Rear = barY_Rear + barH + textOffsetY;

    return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${getCommonStyle()}

  ${title ? getTitleText(title, cx) : ''}

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
    // キーパッドの場合、バーの上または下に値のテキストを表示する。
    const fontSize = 20;
    const textX_Left = barX_Left + 34;
    const textX_Right = barX_Right + barW + 20;
    const textY_Front = barY_Front - 6;
    const textY_Rear = barY_Rear + barH + 22;

    return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${getCommonStyle()}

  ${title ? getTitleText(title, cx) : ''}

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

export function createWheelImage(
  title: string | null | undefined,
  isDial: boolean,
  position: 'fl' | 'fr' | 'rl' | 'rr',
  value: number,
  text: string,
  color: string,
  radius: number = 0,
): string {
  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const cx = width / 2;
  const cy = height / 2;

  const offsetBarX = width * 0.05;
  const offsetBarY = title ? CENTER_OFFSET_Y : 0;
  const barH = height * (title ? 0.65 : 0.75);
  const barW = barH / 2;
  const barX = cx + offsetBarX;
  const barY = cy - barH / 2 + offsetBarY;

  const barH_Value = clamp(barH * value, 0, barH);
  const barY_Value = barY + barH - barH_Value;

  const fontSize = title ? 25 : 30;
  const textOffsetX = 6;
  const textOffsetY = 3;
  const textX = barX - textOffsetX;
  const textY = barY + barH - textOffsetY;

  const rx = barW * radius;

  return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${getCommonStyle()}

  ${title ? getTitleText(title, cx) : ''}

  <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" fill="${Color.DARK_GREY}" rx="${rx}"/>
  <rect x="${barX}" y="${barY_Value}" width="${barW}" height="${barH_Value}" fill="${color}" rx="${rx}"/>

  <text x="${cx / 2}" y="${barY + 24}" font-size="${fontSize}" text-anchor="middle" fill="${Color.GREY}">${position.toUpperCase()}</text>
  <text x="${textX}" y="${textY}" font-size="${fontSize}" text-anchor="end" fill="${Color.WHITE}">${text}</text>
</svg>
`);
}

export function createGForceImage(
  title: string | null | undefined,
  isDial: boolean,
  scale: number,
  current: { x: number; z: number; total: number },
  peak: { x: number; z: number; total: number } | null | undefined,
  showResetText: boolean,
): string {
  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const cx = width / 2;
  const cy = height / 2;

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

  let peakPlotX: number | undefined = undefined;
  let peakPlotY: number | undefined = undefined;
  if (peak) {
    if (peak.total > scale) {
      peakPlotX = cx + (peak.x / peak.total) * maxRadius;
      peakPlotY = cy + (peak.z / peak.total) * maxRadius;
    } else {
      peakPlotX = cx + (peak.x / scale) * maxRadius;
      peakPlotY = cy + (peak.z / scale) * maxRadius;
    }
  }

  const scaleText = `${scale.toFixed(1)}G`;
  const peakText = peak?.total.toFixed(2);
  const currentGText = current.total.toFixed(2);

  const resetText = showResetText
    ? `<text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="24" fill="${Color.GREEN}">RESET</text>`
    : '';

  const fontSize = isDial ? 20 : 18;

  const padding = isDial ? DIAL_PADDING : KEY_PADDING;
  const leftTextX = padding;
  const rightTextX = width - padding;
  const bottomTextY = height - padding;

  return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${getCommonStyle()}

  ${title ? getTitleText(title, padding, 'start') : ''}

  <line x1="${cx - maxRadius}" y1="${cy}" x2="${cx + maxRadius}" y2="${cy}" stroke="${Color.DARK_GREY}" stroke-width="2" stroke-dasharray="2 4"/>
  <line x1="${cx}" y1="${cy - maxRadius}" x2="${cx}" y2="${cy + maxRadius}" stroke="${Color.DARK_GREY}" stroke-width="2" stroke-dasharray="2 4"/>

  <circle cx="${cx}" cy="${cy}" r="${rInner}" fill="none" stroke="${Color.DARK_GREY}" stroke-width="2" stroke-dasharray="4"/>
  <circle cx="${cx}" cy="${cy}" r="${rOuter}" fill="none" stroke="${Color.DARK_GREY}" stroke-width="3"/>

  ${peak ? `<circle cx="${peakPlotX}" cy="${peakPlotY}" r="${rBall}" fill="${Color.YELLOW}" opacity="0.5"/>` : ''}
  <circle cx="${currentPlotX}" cy="${currentPlotY}" r="${rBall}" fill="${Color.RED}"/>

  <line x1="${cx}" y1="${cy}" x2="${currentPlotX}" y2="${currentPlotY}" stroke="${Color.RED}" stroke-width="6" opacity="0.5"/>

  <text x="${leftTextX}" y="${bottomTextY}" font-size="${fontSize}" fill="${Color.GREY}">${scaleText}</text>
  ${peak ? `<text x="${rightTextX}" y="22" text-anchor="end" font-size="${fontSize}" fill="${Color.YELLOW}">${peakText}</text>` : ''}
  <text x="${rightTextX}" y="${bottomTextY}" text-anchor="end" font-size="${fontSize}" fill="${Color.WHITE}">${currentGText}</text>

  ${resetText}
</svg>
`);
}

export function createSpeedMeterImage(
  isDial: boolean,
  speed: string,
  gear: string,
  rpmPct: number,
  rpmColor: string,
  unit: string,
): string {
  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const rpmBarPaddingX = (isDial ? DIAL_PADDING : KEY_PADDING) * 2;
  const rpmBarW = width - rpmBarPaddingX;
  const rpmFillW = clamp(rpmBarW * rpmPct, 0, rpmBarW);
  const rpmBarH = 20;

  if (isDial) {
    const rpmBarX = DIAL_PADDING;
    const rpmBarY = DIAL_HEIGHT - rpmBarH - DIAL_PADDING;
    const speedY = 60;

    return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${getCommonStyle()}
  <text x="152" y="${speedY}" font-size="54" text-anchor="end" fill="${Color.WHITE}">${speed}</text>
  <text x="${DIAL_WIDTH - DIAL_PADDING}" y="${speedY}" font-size="14" fill="${Color.GREY}" text-anchor="end">${unit}</text>

  <circle cx="32" cy="40" r="20" stroke="${Color.GREEN}" stroke-width="3"/>
  <text x="32" y="54" font-size="36" text-anchor="middle" fill="${Color.GREEN}">${gear}</text>

  <rect x="${rpmBarX}" y="${rpmBarY}" width="${rpmBarW}" height="${rpmBarH}" fill="${Color.DARK_GREY}"/>
  <rect x="${rpmBarX}" y="${rpmBarY}" width="${rpmFillW}" height="${rpmBarH}" fill="${rpmColor}"/>
</svg>
`);
  } else {
    const cx = KEY_WIDTH / 2;
    const cy = KEY_HEIGHT / 2;

    const speedY = 44;
    const rpmBarX = KEY_PADDING;
    const rpmBarY = KEY_HEIGHT - rpmBarH - KEY_PADDING;

    return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${getCommonStyle()}
  <text x="${cx + 12}" y="${speedY}" font-size="44" fill="${Color.WHITE}" text-anchor="end">${speed}</text>
  <text x="${cx + 64}" y="${speedY}" font-size="18" fill="${Color.GREY}" text-anchor="end">${unit}</text>

  <circle cx="${cx}" cy="${cy + 8}" r="24" stroke="${Color.GREEN}" stroke-width="3"/>
  <text x="${cx}" y="${cy + 24}" font-size="42" fill="${Color.GREEN}" text-anchor="middle">${gear}</text>

  <rect x="${rpmBarX}" y="${rpmBarY}" width="${rpmBarW}" height="${rpmBarH}" fill="${Color.DARK_GREY}"/>
  <rect x="${rpmBarX}" y="${rpmBarY}" width="${rpmFillW}" height="${rpmBarH}" fill="${rpmColor}"/>
</svg>
`);
  }
}

export function createLapTimeImage(
  isDial: boolean,
  lap: string,
  pos: string,
  current: string,
  subLabel: string,
  subValue: string,
): string {
  if (isDial) {
    const x1 = DIAL_PADDING;
    const x2 = DIAL_WIDTH - DIAL_PADDING;
    const y1 = DIAL_HEIGHT / 3 - DIAL_PADDING;
    const y2 = DIAL_HEIGHT / 3 * 2 - DIAL_PADDING;
    const y3 = DIAL_HEIGHT - DIAL_PADDING;

    return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${DIAL_WIDTH}" height="${DIAL_HEIGHT}" viewBox="0 0 ${DIAL_WIDTH} ${DIAL_HEIGHT}">
  ${getCommonStyle()}
  <text x="${x1}" y="${y1}" font-size="18" text-anchor="start" fill="${Color.WHITE}">${lap}</text>
  <text x="${x1}" y="${y2 - 3}" font-size="18" text-anchor="start" fill="${Color.GREEN}">CUR</text>
  <text x="${x1}" y="${y3 - 3}" font-size="18" text-anchor="start" fill="${Color.YELLOW}">${subLabel}</text>
  <text x="${x2}" y="${y1}" font-size="18" text-anchor="end" fill="${Color.WHITE}">${pos}</text>
  <text x="${x2}" y="${y2}" font-size="28" text-anchor="end" fill="${Color.WHITE}">${current}</text>
  <text x="${x2}" y="${y3}" font-size="28" text-anchor="end" fill="${Color.YELLOW}">${subValue}</text>
</svg>
`);
  } else {
    const x1 = KEY_PADDING;
    const x2 = KEY_WIDTH - KEY_PADDING;
    const y1 = KEY_HEIGHT / 5 - KEY_PADDING;
    const y2 = KEY_HEIGHT / 5 * 2 - KEY_PADDING;
    const y3 = KEY_HEIGHT / 5 * 3 - KEY_PADDING;
    const y4 = KEY_HEIGHT / 5 * 4 - KEY_PADDING;
    const y5 = KEY_HEIGHT - KEY_PADDING;

    return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${KEY_WIDTH}" height="${KEY_HEIGHT}" viewBox="0 0 ${KEY_WIDTH} ${KEY_HEIGHT}">
  ${getCommonStyle()}
  <text x="${x1}" y="${y1}" font-size="18" text-anchor="start" fill="${Color.WHITE}">${lap}</text>
  <text x="${x2}" y="${y1}" font-size="18" text-anchor="end" fill="${Color.WHITE}">${pos}</text>
  <text x="${x1}" y="${y2}" font-size="18" text-anchor="start" fill="${Color.GREEN}">CUR</text>
  <text x="${x2}" y="${y3}" font-size="24" text-anchor="end" fill="${Color.WHITE}">${current}</text>
  <text x="${x1}" y="${y4}" font-size="18" text-anchor="start" fill="${Color.YELLOW}">${subLabel}</text>
  <text x="${x2}" y="${y5}" font-size="24" text-anchor="end" fill="${Color.YELLOW}">${subValue}</text>
</svg>
`);
  }
}
