import {
  POWER_UNIT_PRESETS,
  PowerLayout,
  PowerUnitPreset,
  UNIT_PRESET_DETAILS,
} from '../../shared';
import { ForzaTelemetryData } from '../../telemetry/parser';
import { formatPower, formatPowerUnit, formatTorque, formatTorqueUnit } from '../format';
import {
  generateDoubleValueImage,
  generateSingleValueImage,
  TitleInfo,
} from './common';

export function generatePowerImage(
  isDial: boolean,
  data?: ForzaTelemetryData,
  layout: PowerLayout = 'both',
  preset: PowerUnitPreset = POWER_UNIT_PRESETS[0],
  titleInfo?: TitleInfo,
): string {
  const detail = UNIT_PRESET_DETAILS[preset];

  if (layout === 'both') {
    return generateDoubleValueImage(
      isDial,
      formatPower(data?.power, detail.powerUnit),
      formatPowerUnit(detail.powerUnit),
      formatTorque(data?.torque, detail.torqueUnit),
      formatTorqueUnit(detail.torqueUnit),
      titleInfo);
  } else if (layout === 'power') {
    return generateSingleValueImage(
      isDial,
      formatPower(data?.power, detail.powerUnit),
      formatPowerUnit(detail.powerUnit),
      titleInfo,
    );
  } else {
    return generateSingleValueImage(
      isDial,
      formatTorque(data?.torque, detail.torqueUnit),
      formatTorqueUnit(detail.torqueUnit),
      titleInfo,
    );
  }
}
