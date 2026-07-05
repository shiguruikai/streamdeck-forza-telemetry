import streamDeck from "@elgato/streamdeck";

import { SpeedMeterAction } from "./actions/speed-meter";
import { parseSettings } from "./settings/settings";
import { TelemetryManager } from "./telemetry/manager";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel("trace");

// Register the action.
streamDeck.actions.registerAction(new SpeedMeterAction());

// グローバル設定の変更を監視
streamDeck.settings.onDidReceiveGlobalSettings((ev) => {
  streamDeck.logger.info(
    `Received GlobalSettings: ${JSON.stringify(ev.settings)}`,
  );

  const settings = parseSettings(ev.settings);

  if (settings.port && settings.address) {
    TelemetryManager.getInstance().start({
      port: settings.port,
      address: settings.address,
    });
  } else {
    TelemetryManager.getInstance().stop();
  }
});

// Finally, connect to the Stream Deck.
streamDeck.connect();
