import {
  KeyDownEvent,
  KeyUpEvent,
  SingletonAction,
  WillDisappearEvent,
} from '@elgato/streamdeck';
import { JsonObject } from '@elgato/utils';

/**
 * 長押し（Long Press）と短押し（Short Press）のハンドリング機能を提供するアクション基底クラス。
 */
export abstract class PressDurationAction<TSettings extends JsonObject = JsonObject> extends SingletonAction<TSettings> {
  private readonly pressTimers = new Map<string, NodeJS.Timeout>();
  private readonly longPressedFlags = new Set<string>();

  /**
   * 長押しと判定するしきい値（ミリ秒）。
   * 必要に応じて子クラスでオーバーライド可能です。
   */
  protected longPressDurationMs = 500;

  /**
   * 短押し（キーが離された際に、長押しが発生していなかった場合）のコールバック。
   * 子クラスで実装します。
   */
  protected abstract onShortPress(ev: KeyUpEvent<TSettings>): Promise<void> | void;

  /**
   * 長押し（キーが押されてから規定時間が経過した瞬間）のコールバック。
   * 子クラスで実装します。
   */
  protected abstract onLongPress(ev: KeyDownEvent<TSettings>): Promise<void> | void;

  /**
   * アクションが非表示になった（WillDisappear）際のコールバック。
   * 子クラスで独自のクリーンアップ処理を行う場合に実装します。
   */
  protected abstract onDisappear(ev: WillDisappearEvent<TSettings>): Promise<void> | void;

  override onKeyDown(ev: KeyDownEvent<TSettings>): Promise<void> | void {
    const actionId = ev.action.id;

    this.cancelTimer(actionId);

    const timer = setTimeout(async () => {
      this.longPressedFlags.add(actionId);
      await this.onLongPress(ev);
    }, this.longPressDurationMs);

    this.pressTimers.set(actionId, timer);
  }

  override onKeyUp(ev: KeyUpEvent<TSettings>): Promise<void> | void {
    const actionId = ev.action.id;

    const timer = this.pressTimers.get(actionId);
    if (timer) {
      clearTimeout(timer);
      this.pressTimers.delete(actionId);
    }

    const wasLongPressed = this.longPressedFlags.has(actionId);
    this.longPressedFlags.delete(actionId);

    if (!wasLongPressed) {
      return this.onShortPress(ev);
    }
  }

  override onWillDisappear(ev: WillDisappearEvent<TSettings>): Promise<void> | void {
    this.cancelTimer(ev.action.id);
    return this.onDisappear(ev);
  }

  private cancelTimer(actionId: string): void {
    const timer = this.pressTimers.get(actionId);
    if (timer) {
      clearTimeout(timer);
      this.pressTimers.delete(actionId);
    }
    this.longPressedFlags.delete(actionId);
  }
}
