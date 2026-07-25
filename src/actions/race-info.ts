import {
  action,
  DialAction,
  DialRotateEvent,
  KeyAction,
} from '@elgato/streamdeck';

import { RACE_INFO_LAYOUTS, RaceInfoLayout } from '../shared';
import { ForzaTelemetryData } from '../telemetry/parser';
import {
  generateBestLapTimeImage,
  generateLapNumberImage,
  generateLapTimeImage,
  generatePositionImage,
  generateRaceInfoImage,
  generateRacePosAndTimeImage,
  generateRaceTimeImage,
} from '../utils/graphics';
import { clamp } from '../utils/utils';
import { TelemetryAction } from './telemetry-action';

type RaceInfoSettings = {
  layout?: RaceInfoLayout;
};

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.race-info',
})
export class RaceInfoAction extends TelemetryAction<RaceInfoSettings> {
  private async updateImage(
    action: DialAction<RaceInfoSettings> | KeyAction<RaceInfoSettings>,
    data?: ForzaTelemetryData,
  ): Promise<void> {
    const { layout = RACE_INFO_LAYOUTS[0] } = this.getSettings(action.id) ?? {};

    const isDial = action.isDial();
    const titleInfo = this.getTitleInfo(action.id);

    let image: string;
    if (layout === 'race-time') {
      image = generateRacePosAndTimeImage(isDial, data, titleInfo);
    } else if (layout === 'lap-time') {
      image = generateRaceInfoImage(isDial, data, titleInfo);
    } else if (layout === 'race-time-only') {
      image = generateRaceTimeImage(isDial, data, titleInfo);
    } else if (layout === 'current-time-only') {
      image = generateLapTimeImage(isDial, data, titleInfo);
    } else if (layout === 'best-time-only') {
      image = generateBestLapTimeImage(isDial, data, titleInfo);
    } else if (layout === 'lap-only') {
      image = generateLapNumberImage(isDial, data, titleInfo);
    } else {
      image = generatePositionImage(isDial, data, titleInfo);
    }

    if (isDial) {
      await action.setFeedback({ canvas: image });
    } else {
      await action.setImage(image);
    }
  }

  protected override async onTelemetryData(
    action: DialAction<RaceInfoSettings> | KeyAction<RaceInfoSettings>,
    data?: ForzaTelemetryData,
  ): Promise<void> {
    await this.updateImage(action, data);
  }

  /**
   * ダイヤル回転でレイアウトを切り替える。
   */
  override async onDialRotate(ev: DialRotateEvent<RaceInfoSettings>): Promise<void> {
    const currentSettings = ev.payload.settings;
    const currentLayout = currentSettings.layout ?? RACE_INFO_LAYOUTS[0];
    const currentIndex = RACE_INFO_LAYOUTS.indexOf(currentLayout);
    const nextIndex = clamp((currentIndex + ev.payload.ticks), 0, RACE_INFO_LAYOUTS.length - 1);
    const nextLayout = RACE_INFO_LAYOUTS[nextIndex];

    if (currentLayout !== nextLayout) {
      const newSettings = { ...currentSettings, layout: nextLayout };
      await this.setSettings(ev.action.id, newSettings);
      await this.updateImage(ev.action, this.getLastTelemetryData(ev.action.id));
    }
  }
}
