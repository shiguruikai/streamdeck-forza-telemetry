import net from 'node:net';

import { JsonObject } from '@elgato/utils';

import { TelemetryAction } from '../actions/telemetry-action';
import { DEFAULT_GLOBAL_SETTINGS, GlobalSettings, RpmColorSettings } from '../shared/settings';
import { telemetryManager } from '../telemetry/manager';

let currentSettings: GlobalSettings = DEFAULT_GLOBAL_SETTINGS;

/**
 * 現在、保持されているグローバル設定を取得します。
 */
export function getGlobalSettings(): GlobalSettings {
  return currentSettings;
}

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

function parseHexColor(value: unknown): string | undefined {
  if (typeof value === 'string' && HEX_COLOR_REGEX.test(value)) {
    return value;
  }
  return undefined;
}

function parseInteger(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value : undefined;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : undefined;
  }
  return undefined;
}

// Property Inspector の入力欄の pattern と同じく、先頭に0を付けない10進数のみを受け付ける
// （Number() では " 24000"、"0x5DC0"、"1e2" なども数値に変換されるため）
const PORT_REGEX = /^[1-9]\d*$/;

function parsePort(value: unknown): number | undefined {
  let port: number | undefined;
  if (typeof value === 'number') {
    port = Number.isInteger(value) ? value : undefined;
  } else if (typeof value === 'string' && PORT_REGEX.test(value)) {
    port = Number(value);
  }
  return (port !== undefined && port >= 1 && port <= 65535) ? port : undefined;
}

function parsePct(value: unknown): number | undefined {
  const num = parseInteger(value);
  if (num !== undefined && num >= 0 && num <= 100) {
    return num;
  }
  return undefined;
}

function parseRpmColorSettings(jsonSettings: JsonObject): RpmColorSettings {
  return {
    rpmNormalColor: parseHexColor(jsonSettings.rpmNormalColor) ?? DEFAULT_GLOBAL_SETTINGS.rpmNormalColor,
    rpmWarnPct: parsePct(jsonSettings.rpmWarnPct) ?? DEFAULT_GLOBAL_SETTINGS.rpmWarnPct,
    rpmWarnColor: parseHexColor(jsonSettings.rpmWarnColor) ?? DEFAULT_GLOBAL_SETTINGS.rpmWarnColor,
    rpmRevPct: parsePct(jsonSettings.rpmRevPct) ?? DEFAULT_GLOBAL_SETTINGS.rpmRevPct,
    rpmRevColor: parseHexColor(jsonSettings.rpmRevColor) ?? DEFAULT_GLOBAL_SETTINGS.rpmRevColor,
  };
}

function parseSettings(jsonSettings: JsonObject): GlobalSettings {
  const rpmSettings = parseRpmColorSettings(jsonSettings);

  const port = parsePort(jsonSettings.port);

  const address = (typeof jsonSettings.address === 'string' && net.isIPv4(jsonSettings.address))
    ? jsonSettings.address
    : undefined;

  const font = (typeof jsonSettings.font === 'string') ? jsonSettings.font : DEFAULT_GLOBAL_SETTINGS.font;

  const rawFps = parseInteger(jsonSettings.fps);
  const fps = (rawFps !== undefined && rawFps >= 10 && rawFps <= 30) ? rawFps : DEFAULT_GLOBAL_SETTINGS.fps;

  return { address, port, font, fps, ...rpmSettings };
}

// 接続設定（IPアドレス、ポート）の適用を待つ時間（ミリ秒）。
// Property Inspector では入力のたびに設定が保存されるため、入力途中の値で再バインドしないよう、
// 最後の変更から一定時間が経ってから適用する。
const CONNECTION_APPLY_DELAY_MS = 1000;

type ConnectionSettings = Pick<GlobalSettings, 'port' | 'address'>;

// 適用済みの接続設定（まだ一度も適用していない場合は undefined）
let appliedConnection: ConnectionSettings | undefined;
let connectionTimer: NodeJS.Timeout | undefined;

function applyConnectionSettings(connection: ConnectionSettings): void {
  appliedConnection = connection;
  if (connection.port !== undefined && connection.address !== undefined) {
    telemetryManager.configure({ port: connection.port, address: connection.address });
  } else {
    // 不正な値の場合は受信を止める（直前の接続設定では受信を続けない）
    telemetryManager.clearConfig();
  }
}

function scheduleConnectionSettings(connection: ConnectionSettings): void {
  clearTimeout(connectionTimer);
  connectionTimer = undefined;

  // 起動時の最初の1回は、すぐに適用する
  if (!appliedConnection) {
    applyConnectionSettings(connection);
    return;
  }

  // 適用済みの接続設定と同じ場合は、何もしない（待機中の変更は取り消す）
  if (connection.port === appliedConnection.port && connection.address === appliedConnection.address) {
    return;
  }

  connectionTimer = setTimeout(() => {
    connectionTimer = undefined;
    applyConnectionSettings(connection);
  }, CONNECTION_APPLY_DELAY_MS);
}

export function applyGlobalSettings(rawSettings: JsonObject | GlobalSettings, actions: TelemetryAction[]): void {
  currentSettings = parseSettings(rawSettings);

  // 1. FPS設定の適用（接続設定とは関係なく、すぐに反映する）
  telemetryManager.setUpdateInterval(Math.round(1000 / currentSettings.fps));

  // 2. 接続設定の適用（最後の変更から1秒後。起動時の最初の1回はすぐに適用する）
  scheduleConnectionSettings({ port: currentSettings.port, address: currentSettings.address });

  // 3. すべてのアクティブなアクションを再描画
  actions.forEach((action) => {
    action.refreshActiveActions();
  });
}
