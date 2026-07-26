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

export const POWER_LAYOUTS = ['both', 'power', 'torque'] as const;
export type PowerLayout = typeof POWER_LAYOUTS[number];

export type PowerUnit = 'ps' | 'hp' | 'kw';
export type TorqueUnit = 'nm' | 'kgfm' | 'ftlb';

export const POWER_UNIT_PRESETS = ['ps-nm', 'ps-kgfm', 'hp-ftlb', 'kw-nm'] as const;
export type PowerUnitPreset = typeof POWER_UNIT_PRESETS[number];

export type UnitPresetDetail = {
  powerUnit: PowerUnit;
  torqueUnit: TorqueUnit;
  label: string;
};

export const UNIT_PRESET_DETAILS: Record<PowerUnitPreset, UnitPresetDetail> = {
  'ps-nm': { powerUnit: 'ps', torqueUnit: 'nm', label: 'PS & N·m (Metric / Modern)' },
  'ps-kgfm': { powerUnit: 'ps', torqueUnit: 'kgfm', label: 'PS & kgf·m (Metric / Japanese Traditional)' },
  'hp-ftlb': { powerUnit: 'hp', torqueUnit: 'ftlb', label: 'HP & ft·lb (Imperial / US)' },
  'kw-nm': { powerUnit: 'kw', torqueUnit: 'nm', label: 'kW & N·m (SI / EV)' },
};

export type PowerSettings = {
  layout?: PowerLayout;
  preset?: PowerUnitPreset;
};

export type RpmColorSettings = {
  rpmNormalColor: string;
  rpmWarnPct: number;
  rpmWarnColor: string;
  rpmRevPct: number;
  rpmRevColor: string;
};

export type CarSpecSettings = {
  showCylinders: boolean;
};

export type GlobalSettings = {
  port?: number;
  address?: string;
  font: string;
  fps: number;
} & RpmColorSettings;

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  address: '127.0.0.1',
  port: 24000,
  font: '',
  fps: 15,
  rpmNormalColor: '#FFFFFF',
  rpmWarnPct: 70,
  rpmWarnColor: '#FFCC00',
  rpmRevPct: 85,
  rpmRevColor: '#FF3B30',
};
