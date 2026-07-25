import { SingleWheelPosition } from '../../shared';
import { clamp } from '../utils';
import { Color, DIAL_HEIGHT, DIAL_WIDTH, getCommonStyle, getLayoutAdjustments, KEY_HEIGHT, KEY_WIDTH, PADDING, TitleInfo, toSvgDataUri } from './common';

export function drawAllWheels(
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

export function drawSingleWheel(
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

  const fontSize = 28;
  const textOffsetX = -6;
  const textOffsetY = titleInfo?.titleAlignment === 'bottom' ? -10 : -5;
  const textX = barX + textOffsetX;
  const textY = barY + barH + textOffsetY;

  const posX = cx - 30;
  const poxY = barY + 34;

  const rx = barW * radius;

  return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}
  ${adj.titleElement}

  <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" fill="${Color.DARK_GREY}" rx="${rx}"/>
  <rect x="${barX}" y="${barY_Value}" width="${barW}" height="${barH_Value}" fill="${color}" rx="${rx}"/>

  <text x="${posX}" y="${poxY}" font-size="${fontSize}" text-anchor="middle" fill="${Color.GREY}">${position.toUpperCase()}</text>
  <text x="${textX}" y="${textY}" font-size="${fontSize}" text-anchor="end" fill="${Color.WHITE}">${text}</text>
</svg>
`);
}
