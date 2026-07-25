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

  const rawPort = parseInteger(jsonSettings.port);
  const port = (rawPort !== undefined && rawPort > 0 && rawPort < 65536) ? rawPort : undefined;

  const address = (typeof jsonSettings.address === 'string' && net.isIPv4(jsonSettings.address))
    ? jsonSettings.address
    : undefined;

  const font = (typeof jsonSettings.font === 'string') ? jsonSettings.font : DEFAULT_GLOBAL_SETTINGS.font;

  const rawFps = parseInteger(jsonSettings.fps);
  const fps = (rawFps !== undefined && rawFps >= 10 && rawFps <= 30) ? rawFps : DEFAULT_GLOBAL_SETTINGS.fps;

  return { address, port, font, fps, ...rpmSettings };
}

export function applyGlobalSettings(rawSettings: JsonObject | GlobalSettings, actions: TelemetryAction[]): void {
  currentSettings = parseSettings(rawSettings);

  // 1. 接続設定・FPS設定の適用
  if (currentSettings.port && currentSettings.address) {
    telemetryManager.configure({
      port: currentSettings.port,
      address: currentSettings.address,
      updateIntervalMs: Math.round(1000 / currentSettings.fps),
    });
  } else {
    telemetryManager.clearConfig();
  }

  // 2. すべてのアクティブなアクションを再描画
  actions.forEach((action) => {
    action.refreshActiveActions();
  });
}
