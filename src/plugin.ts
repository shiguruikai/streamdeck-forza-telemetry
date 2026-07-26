import streamDeck from '@elgato/streamdeck';

import { CarSpecAction } from './actions/car-spec';
import { CompassAction } from './actions/compass';
import { GForceAction } from './actions/g-force';
import { PowerAction } from './actions/power';
import { RaceInfoAction } from './actions/race-info';
import { SpeedMeterAction } from './actions/speed-meter';
import { SuspensionTravelAction } from './actions/suspension-travel';
import { TireTempAction } from './actions/tire-temp';
import { applyGlobalSettings } from './settings';
import { DEFAULT_GLOBAL_SETTINGS } from './shared';

streamDeck.logger.setLevel('debug');

const actions = [
  new SpeedMeterAction(),
  new RaceInfoAction(),
  new TireTempAction(),
  new SuspensionTravelAction(),
  new GForceAction(),
  new CompassAction(),
  new PowerAction(),
  new CarSpecAction(),
];

actions.forEach((action) => {
  streamDeck.actions.registerAction(action);
});

// ユーザーが Property Inspector で設定を変更した際に送信されるイベントを監視し、設定を動的に再適用する。
// NOTE: setGlobalSettings() で onDidReceiveGlobalSettings() は実行されない。
streamDeck.settings.onDidReceiveGlobalSettings((ev) => {
  streamDeck.logger.debug(
    `Received GlobalSettings: ${JSON.stringify(ev.settings)}`,
  );
  applyGlobalSettings(ev.settings, actions);
});

// プラグインを Stream Deck に接続する。
await streamDeck.connect();

// 接続確立後、永続化されている前回のグローバル設定を取得する。
const currentGlobalSettings = await streamDeck.settings.getGlobalSettings();
streamDeck.logger.debug(
  `Loaded Initial GlobalSettings: ${JSON.stringify(currentGlobalSettings)}`,
);

// 前回のグローバル設定を初期値で補完し、適用する。
const newGlobalSettings = { ...DEFAULT_GLOBAL_SETTINGS, ...currentGlobalSettings };
await streamDeck.settings.setGlobalSettings(newGlobalSettings);
applyGlobalSettings(newGlobalSettings, actions);
