import {
  action,
  DialAction,
  KeyAction,
} from '@elgato/streamdeck';

import { ForzaTelemetryData } from '../telemetry/parser';
import { generateCompassSvg } from '../utils/graphics';
import { TelemetryAction } from './telemetry-action';

type CompassSettings = Record<string, never>;

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.compass',
})
export class CompassAction extends TelemetryAction<CompassSettings> {
  private async updateImage(
    action: DialAction<CompassSettings> | KeyAction<CompassSettings>,
    data?: ForzaTelemetryData,
  ): Promise<void> {
    const isDial = action.isDial();
    const dataUri = generateCompassSvg(isDial, data);

    if (isDial) {
      await action.setFeedback({ canvas: dataUri });
    } else {
      await action.setImage(dataUri);
    }
  }

  protected override async onTelemetryData(
    action: DialAction<CompassSettings> | KeyAction<CompassSettings>,
    data?: ForzaTelemetryData,
  ): Promise<void> {
    await this.updateImage(action, data);
  }
}
