import { ForzaTelemetryData } from '../../telemetry/parser';
import { formatHeading } from '../format';
import { Color, DIAL_HEIGHT, DIAL_WIDTH, getCommonStyle, KEY_HEIGHT, KEY_WIDTH, PADDING, toSvgDataUri } from './common';

function getCompassTicks(width: number, height: number): string {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(cx, cy) - PADDING;

  const ticks: string[] = [];
  for (let a = 0; a < 360; a += 15) {
    if (a % 90 === 0) continue;
    const rad = (a * Math.PI) / 180;
    const innerR = r * (a % 30 === 0 ? 0.8 : 0.88);
    const strokeWidth = a % 30 === 0 ? 3 : 2;
    const x1 = (cx + Math.sin(rad) * innerR).toFixed(3);
    const y1 = (cy - Math.cos(rad) * innerR).toFixed(3);
    const x2 = (cx + Math.sin(rad) * r).toFixed(3);
    const y2 = (cy - Math.cos(rad) * r).toFixed(3);
    ticks.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${Color.WHITE}" stroke-width="${strokeWidth}"/>`);
  }
  return ticks.join('');
}

function getCompassLabels(width: number, height: number): string {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(cx, cy) - PADDING;
  const fontSize = r * 0.5;

  return ([[0, 'N'], [90, 'E'], [180, 'S'], [270, 'W']] as const).map(([a, label]) => {
    const rad = (a * Math.PI) / 180;
    const textR = r * 0.62;
    const x = (cx + Math.sin(rad) * textR).toFixed(3);
    const y = (cy - Math.cos(rad) * textR).toFixed(3);
    const color = a === 0 ? Color.RED : Color.WHITE;
    return `<text x="${x}" y="${y}" font-size="${fontSize.toFixed(3)}" font-weight="bold" text-anchor="middle" transform="rotate(${a}, ${x}, ${y})" fill="${color}">${label}</text>`;
  }).join('');
}

const KEY_TICKS = getCompassTicks(KEY_WIDTH, KEY_HEIGHT);
const DIAL_TICKS = getCompassTicks(DIAL_WIDTH, DIAL_HEIGHT);
const KEY_LABELS = getCompassLabels(KEY_WIDTH, KEY_HEIGHT);
const DIAL_LABELS = getCompassLabels(DIAL_WIDTH, DIAL_HEIGHT);

export function generateCompassSvg(
  isDial: boolean,
  data: Pick<Readonly<ForzaTelemetryData>, 'yaw'> | undefined,
): string {
  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const cx = width / 2;
  const cy = height / 2;

  const r = Math.min(cx, cy) - PADDING;

  const fontSize = r * 0.5;
  const textX = cx + fontSize * 0.45;
  const textY = cy + fontSize * 0.38;

  const lubberLineX = cx;
  const lubberLineY = cy - r - 3;
  const lubberLineY2 = cy * 0.5;
  const lubberLineTriangleP1 = `${lubberLineX},${cy - r}`;
  const lubberLineTriangleP2 = `${lubberLineX - 6},${cy - r - 8}`;
  const lubberLineTriangleP3 = `${cx + 6},${cy - r - 8}`;

  const { heading, headingStr } = formatHeading(data?.yaw);

  return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}

    <g transform="rotate(${-heading},${cx},${cy})">
      ${isDial ? DIAL_TICKS : KEY_TICKS}
      ${isDial ? DIAL_LABELS : KEY_LABELS}
    </g>

    <text x="${textX.toFixed(3)}" y="${textY.toFixed(3)}" font-size="${fontSize.toFixed(3)}" font-weight="bold" text-anchor="middle" fill="${Color.WHITE}">${headingStr}</text>

    <line x1="${lubberLineX}" y1="${lubberLineY}" x2="${lubberLineX}" y2="${lubberLineY2}" stroke="${Color.YELLOW}" stroke-width="2"/>
    <polygon points="${lubberLineTriangleP1} ${lubberLineTriangleP2} ${lubberLineTriangleP3}" fill="${Color.YELLOW}"/>
</svg>
`);
}
