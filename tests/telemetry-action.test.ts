import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelemetryAction } from '../src/actions/telemetry-action';

const { logger } = vi.hoisted(() => ({
  logger: { trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('@elgato/streamdeck', () => ({
  default: { logger: { createScope: () => logger } },
  SingletonAction: class {},
}));

/**
 * 描画処理で常に例外を発生させるテスト用アクション。
 */
class ThrowingAction extends TelemetryAction {
  public renderCount = 0;

  protected override onTelemetryData(): void {
    this.renderCount++;
    throw new Error('render failed');
  }
}

const fakeAction = { id: 'action-1', isDial: () => false };

describe('TelemetryAction の描画処理の例外', () => {
  let instance: ThrowingAction;

  beforeEach(() => {
    logger.error.mockClear();
    instance = new ThrowingAction();
  });

  it('設定変更時に描画処理が例外を投げても、呼び出し元へ伝播させない', async () => {
    await expect(instance.onDidReceiveSettings({ action: fakeAction, payload: { settings: {} } } as never)).resolves.toBeUndefined();
    expect(instance.renderCount).toBe(1);
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  it('タイトル変更時に描画処理が例外を投げても、呼び出し元へ伝播させない', async () => {
    const ev = { action: fakeAction, payload: { title: '', titleParameters: { showTitle: false } } };
    await expect(instance.onTitleParametersDidChange(ev as never)).resolves.toBeUndefined();
    expect(instance.renderCount).toBe(1);
  });

  it('連続して例外が発生した場合、ログ出力を間引く', async () => {
    for (let i = 0; i < 5; i++) {
      await instance.onDidReceiveSettings({ action: fakeAction, payload: { settings: {} } } as never);
    }
    expect(instance.renderCount).toBe(5);
    expect(logger.error).toHaveBeenCalledTimes(1);
  });
});
