import streamDeck from '@elgato/streamdeck';

import { CompassAction } from './actions/compass';
import { GForceAction } from './actions/g-force';
import { RaceInfoAction } from './actions/race-info';
import { SpeedMeterAction } from './actions/speed-meter';
import { SuspensionTravelAction } from './actions/suspension-travel';
import { TireTempAction } from './actions/tire-temp';
import { DEFAULT_FPS, parseSettings } from './settings/settings';
import { telemetryManager } from './telemetry/manager';
import { setGlobalFont } from './utils/graphics';

streamDeck.logger.setLevel('debug');

const actions = [
  new SpeedMeterAction(),
  new RaceInfoAction(),
  new TireTempAction(),
  new SuspensionTravelAction(),
  new GForceAction(),
  new CompassAction(),
];

// 各種アクションのインスタンスをSDKに登録
actions.forEach((action) => {
  streamDeck.actions.registerAction(action);
});

function handleGlobalSettings(settingsObj: object) {
  // JSONオブジェクトのパース
  const settings = parseSettings(settingsObj);

  // 1. グローバルフォントのセット（最初に実行しないと再描画時に古いフォントで描画されてしまう）
  setGlobalFont(settings.font);

  // 2. 接続設定・FPS設定の適用
  const fps = settings.fps ?? DEFAULT_FPS;

  if (settings.port && settings.address) {
    telemetryManager.configure({
      port: settings.port,
      address: settings.address,
      updateIntervalMs: Math.round(1000 / fps),
    });
  } else {
    telemetryManager.clearConfig();
  }

  // 3. すべてのアクティブなアクションを再描画
  actions.forEach((action) => {
    action.refreshActiveActions();
  });
}

// ユーザーがProperty Inspectorで設定を変更した際に送信されるイベントを監視し、設定を動的に再適用します。
streamDeck.settings.onDidReceiveGlobalSettings((ev) => {
  streamDeck.logger.info(
    `Received GlobalSettings: ${JSON.stringify(ev.settings)}`,
  );
  handleGlobalSettings(ev.settings);
});

// Stream Deck アプリケーションとの双方向通信の接続を開始します（最優先起動プロセス）。
await streamDeck.connect();

// 接続確立後、永続化されている前回のグローバル設定を取得し、初期起動時のパラメータ（フォント・接続先）を適用します。
const initialSettings = await streamDeck.settings.getGlobalSettings();
streamDeck.logger.info(
  `Loaded Initial GlobalSettings: ${JSON.stringify(initialSettings)}`,
);
handleGlobalSettings(initialSettings);
