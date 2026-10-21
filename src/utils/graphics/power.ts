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
  // 保存済み設定に未知のプリセットが含まれる場合は、既定のプリセットで描画する
  const detail = UNIT_PRESET_DETAILS[POWER_UNIT_PRESETS.includes(preset) ? preset : POWER_UNIT_PRESETS[0]];

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
