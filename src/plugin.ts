import streamDeck from '@elgato/streamdeck';

import { GForceAction } from './actions/g-force';
import { LapTimeAction } from './actions/lap-time';
import { SpeedMeterAction } from './actions/speed-meter';
import { SuspensionTravelAction } from './actions/suspension-travel';
import { TireTempAction } from './actions/tire-temp';
import { parseSettings } from './settings/settings';
import { telemetryManager } from './telemetry/manager';

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel('trace');

// Register the action.
streamDeck.actions.registerAction(new SpeedMeterAction());
streamDeck.actions.registerAction(new LapTimeAction());
streamDeck.actions.registerAction(new GForceAction());
streamDeck.actions.registerAction(new TireTempAction());
streamDeck.actions.registerAction(new SuspensionTravelAction());

// グローバル設定の適用処理
function handleGlobalSettings(settingsObj: object) {
  const settings = parseSettings(settingsObj);

  if (settings.port && settings.address) {
    telemetryManager.configure({
      port: settings.port,
      address: settings.address,
    });
  } else {
    telemetryManager.clearConfig();
  }
}

// グローバル設定の変更を監視
streamDeck.settings.onDidReceiveGlobalSettings((ev) => {
  streamDeck.logger.info(
    `Received GlobalSettings: ${JSON.stringify(ev.settings)}`,
  );
  handleGlobalSettings(ev.settings);
});

// Finally, connect to the Stream Deck.
await streamDeck.connect();

// 起動時に現在の設定を適用
const initialSettings = await streamDeck.settings.getGlobalSettings();
streamDeck.logger.info(
  `Loaded Initial GlobalSettings: ${JSON.stringify(initialSettings)}`,
);
handleGlobalSettings(initialSettings);
