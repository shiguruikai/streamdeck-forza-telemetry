import { action, DialAction, KeyAction } from '@elgato/streamdeck';

import { CarSpecSettings } from '../shared';
import { ForzaTelemetryData } from '../telemetry/parser';
import { generateCarSpecImage } from '../utils/graphics';
import { TelemetryAction } from './telemetry-action';

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.car-spec',
})
export class CarSpecAction extends TelemetryAction<CarSpecSettings> {
  private async updateImage(
    action: DialAction<CarSpecSettings> | KeyAction<CarSpecSettings>,
    data?: ForzaTelemetryData,
  ): Promise<void> {
    const { showCylinders = true } = this.getSettings(action.id) ?? {};
    const isDial = action.isDial();
    const titleInfo = this.getTitleInfo(action.id);

    const image = generateCarSpecImage(isDial, data, showCylinders, titleInfo);

    if (isDial) {
      await action.setFeedback({ canvas: image });
    } else {
      await action.setImage(image);
    }
  }

  protected override async onTelemetryData(
    action: DialAction<CarSpecSettings> | KeyAction<CarSpecSettings>,
    data?: ForzaTelemetryData,
  ): Promise<void> {
    await this.updateImage(action, data);
  }
}
