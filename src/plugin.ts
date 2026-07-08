import streamDeck from '@elgato/streamdeck';

import { GForceAction } from './actions/g-force';
import { LapTimeAction } from './actions/lap-time';
import { SpeedMeterAction } from './actions/speed-meter';
import { SuspensionTravelAction } from './actions/suspension-travel';
import { TireTempAction } from './actions/tire-temp';
import { parseSettings } from './settings/settings';
import { telemetryManager } from './telemetry/manager';
import { setGlobalFont } from './utils/image';

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel('trace');

const actions = [
  new SpeedMeterAction(),
  new LapTimeAction(),
  new GForceAction(),
  new TireTempAction(),
  new SuspensionTravelAction(),
];

// Register the action.
actions.forEach((action) => {
  streamDeck.actions.registerAction(action);
});

// グローバル設定の適用処理
function handleGlobalSettings(settingsObj: object) {
  const settings = parseSettings(settingsObj);

  if (settings.font) {
    setGlobalFont(settings.font);
  }

  if (settings.port && settings.address) {
    telemetryManager.configure({
      port: settings.port,
      address: settings.address,
    });
  } else {
    telemetryManager.clearConfig();
  }

  // すべてのアクションを再描画
  actions.forEach((action) => {
    action.refreshActiveActions();
  });
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
