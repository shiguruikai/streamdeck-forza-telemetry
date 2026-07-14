import {
  action,
  DialAction,
  DialRotateEvent,
  KeyAction,
} from '@elgato/streamdeck';

import { RACE_INFO_LAYOUTS, RaceInfoLayout } from '../settings/settings';
import { ForzaTelemetryData } from '../telemetry/parser';
import { createLapTimeImage, createRaceTimeImage, createSingleValueImage, createTimeImage } from '../utils/image';
import { clamp } from '../utils/utils';
import { TelemetryAction } from './telemetry-action';

type RaceInfoSettings = {
  layout?: RaceInfoLayout;
};

type EventAction = DialAction<RaceInfoSettings> | KeyAction<RaceInfoSettings>;

@action({
  UUID: 'com.github.shiguruikai.streamdeck-forza-telemetry.race-info',
})
export class RaceInfoAction extends TelemetryAction<RaceInfoSettings> {
  private async updateImage(action: EventAction, data?: ForzaTelemetryData): Promise<void> {
    const { layout = RACE_INFO_LAYOUTS[0] } = this.getSettings(action.id) ?? {};

    const isDial = action.isDial();
    const titleInfo = this.getTitleInfo(action.id);
    let image: string;
    if (layout === 'race-time') {
      image = createRaceTimeImage(isDial, data?.racePosition, data?.currentRaceTime, titleInfo);
    } else if (layout == 'lap-time') {
      image = createLapTimeImage(isDial, data?.lapNumber, data?.racePosition, data?.currentLap, data?.bestLap, titleInfo);
    } else if (layout == 'race-time-only') {
      image = createTimeImage(isDial, data?.currentRaceTime, titleInfo);
    } else if (layout == 'current-time-only') {
      image = createTimeImage(isDial, data?.currentLap, titleInfo);
    } else if (layout == 'best-time-only') {
      image = createTimeImage(isDial, data?.bestLap, titleInfo);
    } else if (layout == 'lap-only') {
      image = createSingleValueImage(isDial, ((data?.lapNumber ?? 0) + 1).toString(), null, titleInfo);
    } else {
      image = createSingleValueImage(isDial, (data?.racePosition ?? '--').toString(), null, titleInfo);
    }

    if (isDial) {
      await action.setFeedback({ canvas: image });
    } else {
      await action.setImage(image);
    }
  }

  protected override async onTelemetryData(action: EventAction, data?: ForzaTelemetryData): Promise<void> {
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
