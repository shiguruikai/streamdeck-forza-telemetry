import streamDeck from '@elgato/streamdeck';

import { GForceAction } from './actions/g-force';
import { LapTimeAction } from './actions/lap-time';
import { SpeedMeterAction } from './actions/speed-meter';
import { SuspensionTravelAction } from './actions/suspension-travel';
import { TireTempAction } from './actions/tire-temp';
import { parseSettings } from './settings/settings';
import { telemetryManager } from './telemetry/manager';
import { setGlobalFont } from './utils/image';

// デバッグ効率向上のため、Stream Deckとプラグイン間のすべての通信メッセージを記録するよう「trace」ログレベルを設定
streamDeck.logger.setLevel('trace');

const actions = [
  new SpeedMeterAction(),
  new LapTimeAction(),
  new GForceAction(),
  new TireTempAction(),
  new SuspensionTravelAction(),
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

  // 2. 接続設定の適用
  if (settings.port && settings.address) {
    telemetryManager.configure({
      port: settings.port,
      address: settings.address,
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
