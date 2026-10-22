import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_GLOBAL_SETTINGS } from '../src/shared';

const { manager } = vi.hoisted(() => ({
  manager: { configure: vi.fn(), clearConfig: vi.fn(), setUpdateInterval: vi.fn() },
}));

vi.mock('@elgato/streamdeck', () => {
  const logger = { trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  return { default: { logger: { createScope: () => logger } } };
});

// 接続設定の適用（サーバーの起動・停止）は、呼び出しだけを確かめる
vi.mock('../src/telemetry/manager', () => ({ telemetryManager: manager }));

type SettingsModule = typeof import('../src/settings/settings');

describe('グローバル設定', () => {
  let settings: SettingsModule;

  function apply(raw: Record<string, unknown>): void {
    settings.applyGlobalSettings(raw as never, []);
  }

  beforeEach(async () => {
    vi.useFakeTimers();
    // 適用済みの接続設定（モジュールの状態）をテストごとに初期化するため、モジュールを読み込み直す
    vi.resetModules();
    settings = await import('../src/settings/settings');
    manager.configure.mockClear();
    manager.clearConfig.mockClear();
    manager.setUpdateInterval.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('ポートの判定', () => {
    it.each([
      ['24000', 24000],
      ['1', 1],
      ['65535', 65535],
      [24000, 24000],
      [65535, 65535],
    ])('%j を受け付ける', (port, expected) => {
      apply({ ...DEFAULT_GLOBAL_SETTINGS, port });
      expect(settings.getGlobalSettings().port).toBe(expected);
    });

    it.each([
      ' 24000', '24000 ', '0x5DC0', '1e2', '024000', '0', '65536', '24000.0', '', 'abc',
      0, 65536, 24000.5, -1, null, true,
    ])('%j を受け付けない', (port) => {
      apply({ ...DEFAULT_GLOBAL_SETTINGS, port });
      expect(settings.getGlobalSettings().port).toBeUndefined();
    });
  });

  describe('接続設定の適用', () => {
    it('起動時の最初の1回はすぐに適用し、続けて同じ値が適用されても何もしない', () => {
      // plugin.ts の起動処理では、保存済みの設定と、初期値で補完した設定が続けて適用される
      apply({ address: '127.0.0.1', port: 24000 });
      expect(manager.configure).toHaveBeenCalledWith({ port: 24000, address: '127.0.0.1' });

      apply({ ...DEFAULT_GLOBAL_SETTINGS });
      vi.advanceTimersByTime(1000);
      expect(manager.configure).toHaveBeenCalledTimes(1);
      expect(manager.clearConfig).not.toHaveBeenCalled();
    });

    it('変更は、最後の変更から1秒後に適用する（入力途中の値は適用しない）', () => {
      apply({ ...DEFAULT_GLOBAL_SETTINGS });
      manager.configure.mockClear();

      apply({ ...DEFAULT_GLOBAL_SETTINGS, port: '2' });
      vi.advanceTimersByTime(500);
      apply({ ...DEFAULT_GLOBAL_SETTINGS, port: '24' });
      vi.advanceTimersByTime(500);
      apply({ ...DEFAULT_GLOBAL_SETTINGS, port: '24001' });
      vi.advanceTimersByTime(999);
      expect(manager.configure).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(manager.configure).toHaveBeenCalledTimes(1);
      expect(manager.configure).toHaveBeenCalledWith({ port: 24001, address: '127.0.0.1' });
    });

    it('1秒以内に適用済みの値へ戻した場合は、何もしない', () => {
      apply({ ...DEFAULT_GLOBAL_SETTINGS });
      manager.configure.mockClear();

      apply({ ...DEFAULT_GLOBAL_SETTINGS, port: '2400' });
      vi.advanceTimersByTime(500);
      apply({ ...DEFAULT_GLOBAL_SETTINGS });
      vi.advanceTimersByTime(2000);
      expect(manager.configure).not.toHaveBeenCalled();
      expect(manager.clearConfig).not.toHaveBeenCalled();
    });

    it('不正な値は1秒後に受信を止め、不正な間も FPS はすぐに反映する', () => {
      apply({ ...DEFAULT_GLOBAL_SETTINGS });
      manager.configure.mockClear();

      apply({ ...DEFAULT_GLOBAL_SETTINGS, address: '127.0.0.', fps: 30 });
      // 配信間隔は丸めずに渡す
      expect(manager.setUpdateInterval).toHaveBeenLastCalledWith(1000 / 30);
      expect(manager.clearConfig).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1000);
      expect(manager.clearConfig).toHaveBeenCalledTimes(1);
      expect(manager.configure).not.toHaveBeenCalled();

      // 不正なままで FPS だけを変更した場合も、すぐに反映する
      apply({ ...DEFAULT_GLOBAL_SETTINGS, address: '127.0.0.', fps: 10 });
      expect(manager.setUpdateInterval).toHaveBeenLastCalledWith(100);
      vi.advanceTimersByTime(1000);
      expect(manager.clearConfig).toHaveBeenCalledTimes(1);
    });
  });
});
