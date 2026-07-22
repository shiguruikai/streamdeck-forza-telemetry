import net from 'node:net';

export type SpeedUnit = 'kmh' | 'mph';

export type TempUnit = 'celsius' | 'fahrenheit';

export type SuspensionMode = 'percentage' | 'value';

export const WHEEL_POSITIONS = ['all', 'fl', 'fr', 'rl', 'rr'] as const;
export type WheelPosition = typeof WHEEL_POSITIONS[number];
export type SingleWheelPosition = Exclude<WheelPosition, 'all'>;

export const RACE_INFO_LAYOUTS = ['lap-time', 'race-time', 'race-time-only', 'current-time-only', 'best-time-only', 'lap-only', 'position-only'] as const;
export type RaceInfoLayout = typeof RACE_INFO_LAYOUTS[number];

export const SPEED_METER_LAYOUTS = ['full', 'speed', 'gear', 'rpm'] as const;
export type SpeedMeterLayout = typeof SPEED_METER_LAYOUTS[number];

export const COMPASS_DISPLAY_MODES = ['arch', 'circle'] as const;
export type CompassDisplayMode = typeof COMPASS_DISPLAY_MODES[number];

export const DEFAULT_FPS = 10;

export type GlobalSettings = {
  port?: number;
  address?: string;
  font?: string;
  fps?: number;
};

export function parseSettings(jsonSettings: object): GlobalSettings {
  const result: GlobalSettings = {};

  if ('port' in jsonSettings) {
    const portValue = jsonSettings.port;
    const port = typeof portValue === 'number' ? portValue : Number.parseInt(String(portValue), 10);
    if (Number.isInteger(port) && port > 0 && port < 65536) {
      result.port = port;
    }
  }

  if ('address' in jsonSettings) {
    const address = jsonSettings.address;
    if (typeof address === 'string' && net.isIPv4(address)) {
      result.address = address;
    }
  }

  if ('font' in jsonSettings) {
    const font = jsonSettings.font;
    if (typeof font === 'string') {
      result.font = font;
    }
  }

  if ('fps' in jsonSettings) {
    const fpsValue = jsonSettings.fps;
    const fps = typeof fpsValue === 'number' ? fpsValue : Number.parseInt(String(fpsValue), 10);
    if (Number.isInteger(fps) && fps >= 10 && fps <= 30) {
      result.fps = fps;
    }
  }

  return result;
}
