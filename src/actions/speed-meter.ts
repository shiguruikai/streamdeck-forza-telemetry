import streamDeck, {
  action,
  DidReceiveSettingsEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";

import { TelemetryManager } from "../telemetry/manager";
import { ForzaTelemetryData } from "../telemetry/parser";

type SpeedMeterDialSettings = {
  unit?: "kmh" | "mph";
};

const MS_TO_KMH = 3.6;
const MS_TO_MPH = 2.23694;

const telemetryManager = TelemetryManager.getInstance();

@action({
  UUID: "com.github.shiguruikai.streamdeck-forza-telemetry.speed-mater",
})
export class SpeedMeterAction extends SingletonAction<SpeedMeterDialSettings> {
  private readonly logger = streamDeck.logger.createScope(
    SpeedMeterAction.name,
  );
  private readonly handlers = new Map<
    string,
    (data: ForzaTelemetryData) => void
  >();

  private unit: "KM/H" | "MPH" = "KM/H";

  private setSettings(settings: SpeedMeterDialSettings) {
    const { unit } = settings;
    this.unit = unit === "mph" ? "MPH" : "KM/H";
  }

  private computeSpeed(
    data: Pick<ForzaTelemetryData, "speed">,
  ): string {
    const speed = data.speed * (this.unit === "KM/H" ? MS_TO_KMH : MS_TO_MPH);
    return Math.floor(speed).toString();
  }

  private computeRpmBar(
    data: Pick<ForzaTelemetryData, "engineMaxRpm" | "currentEngineRpm">,
  ): { value: number, bar_fill_c: string } {
    const rpmPercent = data.engineMaxRpm > 0
      ? Math.min(
        100,
        Math.max(0, (data.currentEngineRpm / data.engineMaxRpm) * 100),
      )
      : 0;

    return { value: rpmPercent, bar_fill_c: '#ffffff' }
  }

  override onWillAppear(
    ev: WillAppearEvent<SpeedMeterDialSettings>,
  ): Promise<void> | void {
    if (!ev.action.isDial()) return;

    this.setSettings(ev.payload.settings);

    ev.action.setFeedback({
      unit: this.unit,
    });


    const dataHandler = (data: ForzaTelemetryData) => {
      if (!ev.action.isDial()) return;

      ev.action.setFeedback({
        speed: this.computeSpeed(data),
        gear: data.gear.toString(),
        rpmBar: this.computeRpmBar(data),
      });
    };

    this.handlers.set(ev.action.id, dataHandler);

    telemetryManager.start();
    telemetryManager.on("data", dataHandler);
  }

  override onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<SpeedMeterDialSettings>,
  ): Promise<void> | void {
    if (!ev.action.isDial()) return;

    this.logger.debug(
      "Received Settings: %s",
      JSON.stringify(ev.payload.settings),
    );

    this.setSettings(ev.payload.settings);

    ev.action.setFeedback({
      unit: this.unit,
    });
  }

  override onWillDisappear(
    ev: WillDisappearEvent<SpeedMeterDialSettings>,
  ): Promise<void> | void {
    const handler = this.handlers.get(ev.action.id);
    if (handler) {
      telemetryManager.off("data", handler);
      this.handlers.delete(ev.action.id);
    }
  }
}
