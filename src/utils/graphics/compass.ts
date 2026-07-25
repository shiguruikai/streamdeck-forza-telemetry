import { CompassDisplayMode } from '../../shared';
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
    const isMajor = a % 30 === 0;
    const innerR = r * (isMajor ? 0.8 : 0.88);
    const strokeWidth = isMajor ? 3 : 2;
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
  const labels = [
    [0, 'N'],
    [90, 'E'],
    [180, 'S'],
    [270, 'W'],
  ] as const;
  return labels.map(([a, label]) => {
    const rad = (a * Math.PI) / 180;
    const textR = r * 0.62;
    const x = (cx + Math.sin(rad) * textR).toFixed(3);
    const y = (cy - Math.cos(rad) * textR).toFixed(3);
    const color = a === 0 ? Color.RED : Color.WHITE;
    return `<text x="${x}" y="${y}" font-size="${fontSize.toFixed(3)}" text-anchor="middle" transform="rotate(${a}, ${x}, ${y})" fill="${color}">${label}</text>`;
  }).join('');
}

const KEY_TICKS = getCompassTicks(KEY_WIDTH, KEY_HEIGHT);
const DIAL_TICKS = getCompassTicks(DIAL_WIDTH, DIAL_HEIGHT);
const KEY_LABELS = getCompassLabels(KEY_WIDTH, KEY_HEIGHT);
const DIAL_LABELS = getCompassLabels(DIAL_WIDTH, DIAL_HEIGHT);

const ARCH_CX = DIAL_WIDTH / 2;
const ARCH_CY = DIAL_HEIGHT;
const ARCH_R = DIAL_HEIGHT - PADDING;

function getCompassArchTicks(cx: number, cy: number, r: number): string {
  const ticks: string[] = [];
  for (let a = 0; a < 360; a += 15) {
    const rad = (a * Math.PI) / 180;
    const isMajor = a % 45 === 0;
    const innerR = r * 0.85;
    const strokeWidth = isMajor ? 4 : 2;
    const x1 = (cx + Math.sin(rad) * innerR).toFixed(3);
    const y1 = (cy - Math.cos(rad) * innerR).toFixed(3);
    const x2 = (cx + Math.sin(rad) * r).toFixed(3);
    const y2 = (cy - Math.cos(rad) * r).toFixed(3);
    ticks.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${Color.WHITE}" stroke-width="${strokeWidth}"/>`);
  }
  return ticks.join('');
}

function getCompassArchLabels(cx: number, cy: number, r: number): string {
  const textR = r * 0.6;
  const fontSize = r * 0.25;
  const labels = [
    [0, 'N'],
    [45, 'NE'],
    [90, 'E'],
    [135, 'SE'],
    [180, 'S'],
    [225, 'SW'],
    [270, 'W'],
    [315, 'NW'],
  ] as const;
  return labels.map(([a, label]) => {
    const rad = (a * Math.PI) / 180;
    const x = (cx + Math.sin(rad) * textR).toFixed(3);
    const y = (cy - Math.cos(rad) * textR).toFixed(3);
    const color = a === 0 ? Color.RED : a % 90 === 0 ? Color.WHITE : Color.GREY;
    return `<text x="${x}" y="${y}" font-size="${fontSize.toFixed(3)}" text-anchor="middle" transform="rotate(${a}, ${x}, ${y})" fill="${color}">${label}</text>`;
  }).join('');
}

const DIAL_ARCH_TICKS = getCompassArchTicks(ARCH_CX, ARCH_CY, ARCH_R);
const DIAL_ARCH_LABELS = getCompassArchLabels(ARCH_CX, ARCH_CY, ARCH_R);

function generateCompassArchSvg(
  data: Pick<Readonly<ForzaTelemetryData>, 'yaw'> | undefined,
): string {
  const width = DIAL_WIDTH;
  const height = DIAL_HEIGHT;
  const cx = ARCH_CX;
  const cy = ARCH_CY;
  const r = ARCH_R;

  const { heading, headingStr } = formatHeading(data?.yaw);

  const triangleP1 = `${cx},10`;
  const triangleP2 = `${cx - 6},0`;
  const triangleP3 = `${cx + 6},0`;

  return toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  ${getCommonStyle()}

  <path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" stroke="${Color.WHITE}" stroke-width="2"/>

  <g transform="rotate(${-heading},${cx},${cy})">
    ${DIAL_ARCH_TICKS}
    ${DIAL_ARCH_LABELS}
  </g>

  <text x="${cx + 14}" y="${height - 10}" font-size="30" text-anchor="middle" fill="${Color.WHITE}">${headingStr}</text>

  <polygon points="${triangleP1} ${triangleP2} ${triangleP3}" fill="${Color.YELLOW}"/>
</svg>
`);
}

export function generateCompassSvg(
  isDial: boolean,
  data: Pick<Readonly<ForzaTelemetryData>, 'yaw'> | undefined,
  dialDisplayMode: CompassDisplayMode = 'arch',
): string {
  if (isDial && dialDisplayMode === 'arch') {
    return generateCompassArchSvg(data);
  }

  const width = isDial ? DIAL_WIDTH : KEY_WIDTH;
  const height = isDial ? DIAL_HEIGHT : KEY_HEIGHT;

  const cx = width / 2;
  const cy = height / 2;

  const r = Math.min(cx, cy) - PADDING;

  const fontSize = r * 0.5;
  const textX = cx + fontSize * 0.45;
  const textY = cy + fontSize * 0.38;

  const lubberLineX = cx;
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

    <text x="${textX.toFixed(3)}" y="${textY.toFixed(3)}" font-size="${fontSize.toFixed(3)}" text-anchor="middle" fill="${Color.WHITE}">${headingStr}</text>

    <polygon points="${lubberLineTriangleP1} ${lubberLineTriangleP2} ${lubberLineTriangleP3}" fill="${Color.YELLOW}"/>
</svg>
`);
}
