/**
 * SVG文字列をStream DeckのsetImage等で使用可能なData URI形式に変換します。
 *
 * @param svg SVGソース文字列
 * @returns Data URI形式の文字列
 */
export function toSvgDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
