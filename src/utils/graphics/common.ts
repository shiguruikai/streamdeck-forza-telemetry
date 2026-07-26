import { getGlobalSettings } from '../../settings/settings';
import { formatTime } from '../format';

/**
 * すべてのSVGに共通して適用するCSSスタイルシートを取得します。
 *
 * @note Stream Deck の制約により、`font-family` でのカンマ区切りの複数指定（フォールバック指定）は、正しく解釈されず、描画されない現象が発生します。
 */
export function getCommonStyle(): string {
  const font = getGlobalSettings().font;
  const fontFamily = font ? `font-family:"${font}";` : '';
  return `<style>text{${fontFamily}font-weight:bold;}</style>`;
}

export const DIAL_WIDTH = 200;
export const DIAL_HEIGHT = 100;
export const KEY_WIDTH = 144;
export const KEY_HEIGHT = 144;
export const PADDING = 8;

export const enum Color {
  WHITE = '#dedede',
  GREY = '#8f8f8f',
  DARK_GREY = '#2e2e2e',
  BLACK = '#111111',
  RED = '#ff1a1a',
  YELLOW = '#ffff1a',
  GREEN = '#1aff66',
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

export type LayoutAdjustments = {
  offsetY: number;
  titleElement: string;
};

export function getLayoutAdjustments(
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
    // ダイヤルは高さが100pxと狭いため、常に左上に描画します。
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

export function generateSingleValueImage(
  isDial: boolean,
  value: string | null | undefined,
  unit: string | null | undefined,
  titleInfo?: TitleInfo,
): string {
  const adj = getLayoutAdjustments(isDial, titleInfo);

  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const cx = width / 2;
  const cy = height / 2;

  const unitX = width - PADDING;
  const unitY = titleInfo?.titleAlignment === 'bottom' ? PADDING + 24 : height - PADDING;

  const valueFontSize = isDial ? 46 : 54;
  const unitFontSize = isDial ? 20 : 27;

  const valueY = cy + valueFontSize * 0.38;

  return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}
  ${adj.titleElement}

  <text x="${cx}" y="${valueY.toFixed(3)}" font-size="${valueFontSize}" text-anchor="middle" fill="${Color.WHITE}">${value ?? ''}</text>
  ${unit ? `<text x="${unitX}" y="${unitY}" font-size="${unitFontSize}" text-anchor="end" fill="${Color.GREY}">${unit}</text>` : ''}
</svg>
`);
}

export function generateDoubleValueImage(
  isDial: boolean,
  topValue: string | null | undefined,
  topUnit: string | null | undefined,
  bottomValue: string | null | undefined,
  bottomUnit: string | null | undefined,
  titleInfo?: TitleInfo,
): string {
  const adj = getLayoutAdjustments(isDial, titleInfo);

  if (isDial) {
    const width = DIAL_WIDTH;
    const height = DIAL_HEIGHT;
    const valueX = width - PADDING - (titleInfo ? 50 : 60);
    const unitX = width - PADDING;
    const topY = titleInfo ? 56 : 42;
    const bottomY = height - PADDING;
    const valueFontSize = titleInfo ? 30 : 40;
    const labelFontSize = titleInfo ? 15 : 20;
    return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}
  ${adj.titleElement}

  <text x="${valueX}" y="${topY}" font-size="${valueFontSize}" text-anchor="end" fill="${Color.WHITE}">${topValue ?? ''}</text>
  ${topUnit ? `<text x="${unitX}" y="${topY}" font-size="${labelFontSize}" text-anchor="end" fill="${Color.GREY}">${topUnit}</text>` : ''}
  <text x="${valueX}" y="${bottomY}" font-size="${valueFontSize}" text-anchor="end" fill="${Color.WHITE}">${bottomValue ?? ''}</text>
  ${bottomUnit ? `<text x="${unitX}" y="${bottomY}" font-size="${labelFontSize}" text-anchor="end" fill="${Color.GREY}">${bottomUnit}</text>` : ''}
</svg>
`);
  } else {
    const width = KEY_WIDTH;
    const height = KEY_HEIGHT;
    const cy = height / 2 + adj.offsetY;
    const valueX = width - PADDING - 40;
    const unitX = width - PADDING;
    const topY = cy - 22;
    const topUnitY = topY + 20;
    const bottomY = cy + 32;
    const bottomUnitY = bottomY + 20;
    const valueFontSize = 35;
    const labelFontSize = 17;
    return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}
  ${adj.titleElement}

  <text x="${valueX}" y="${topY}" font-size="${valueFontSize}" text-anchor="end" fill="${Color.WHITE}">${topValue ?? ''}</text>
  ${topUnit ? `<text x="${unitX}" y="${topUnitY}" font-size="${labelFontSize}" text-anchor="end" fill="${Color.GREY}">${topUnit}</text>` : ''}
  <text x="${valueX}" y="${bottomY}" font-size="${valueFontSize}" text-anchor="end" fill="${Color.WHITE}">${bottomValue ?? ''}</text>
  ${bottomUnit ? `<text x="${unitX}" y="${bottomUnitY}" font-size="${labelFontSize}" text-anchor="end" fill="${Color.GREY}">${bottomUnit}</text>` : ''}
</svg>
`);
  }
}

export function generateSingleTimeImage(
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
export function createGearSvgComponent(
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
