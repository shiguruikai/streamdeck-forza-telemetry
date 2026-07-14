import {
  DialDownEvent,
  DialUpEvent,
  KeyDownEvent,
  KeyUpEvent,
  WillDisappearEvent,
} from '@elgato/streamdeck';
import { JsonObject } from '@elgato/utils';

import { TelemetryAction } from './telemetry-action';

/**
 * 長押し（Long Press）と短押し（Short Press）のハンドリング機能を提供するアクション基底クラス。
 * キーボタン（Keypad）およびダイヤルプッシュ（Encoder）の両方のイベントに対応しています。
 */
export abstract class PressDurationAction<TSettings extends JsonObject = JsonObject> extends TelemetryAction<TSettings> {
  /* eslint-disable unused-imports/no-unused-vars */

  private readonly pressTimers = new Map<string, NodeJS.Timeout>();
  private readonly longPressedFlags = new Set<string>();

  /**
   * 長押しと判定するしきい値（ミリ秒）。
   * 必要に応じて子クラスでオーバーライド可能です。
   */
  protected longPressDurationMs = 500;

  /**
   * 短押し（キーまたはダイヤルが離された際に、長押しが発生していなかった場合）のコールバック。
   */
  protected onShortPress(ev: KeyUpEvent<TSettings> | DialUpEvent<TSettings>): Promise<void> | void { /* pass */ }

  /**
   * 長押し（キーまたはダイヤルが押されてから規定時間が経過した瞬間）のコールバック。
   */
  protected onLongPress(ev: KeyDownEvent<TSettings> | DialDownEvent<TSettings>): Promise<void> | void { /* pass */ }

  override onKeyDown(ev: KeyDownEvent<TSettings>): Promise<void> | void {
    this.handleDown(ev);
  }

  override async onKeyUp(ev: KeyUpEvent<TSettings>): Promise<void> {
    await this.handleUp(ev);
  }

  override onDialDown(ev: DialDownEvent<TSettings>): Promise<void> | void {
    this.handleDown(ev);
  }

  override async onDialUp(ev: DialUpEvent<TSettings>): Promise<void> {
    await this.handleUp(ev);
  }

  override async onWillDisappear(ev: WillDisappearEvent<TSettings>): Promise<void> {
    this.cancelTimer(ev.action.id);
    await super.onWillDisappear(ev);
  }

  private handleDown(ev: KeyDownEvent<TSettings> | DialDownEvent<TSettings>): void {
    // すでにタイマーが存在する場合は登録をスキップする（チャタリング・キーリピート対策）
    if (this.pressTimers.has(ev.action.id)) {
      return;
    }

    const timer = setTimeout(() => {
      this.longPressedFlags.add(ev.action.id);
      void this.onLongPress(ev);
    }, this.longPressDurationMs);

    this.pressTimers.set(ev.action.id, timer);
  }

  private handleUp(ev: KeyUpEvent<TSettings> | DialUpEvent<TSettings>): Promise<void> | void {
    const existingTimer = this.pressTimers.get(ev.action.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.pressTimers.delete(ev.action.id);
    }

    const wasLongPressed = this.longPressedFlags.has(ev.action.id);
    this.longPressedFlags.delete(ev.action.id);

    if (!wasLongPressed) {
      return this.onShortPress(ev);
    }
  }

  private cancelTimer(actionId: string): void {
    const existingTimer = this.pressTimers.get(actionId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.pressTimers.delete(actionId);
    }

    this.longPressedFlags.delete(actionId);
  }
}
