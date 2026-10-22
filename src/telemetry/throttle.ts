/**
 * 受信したパケットを、設定された配信間隔に合わせて間引くかどうかを判定するクラス。
 *
 * パケットは離散的に届く（FM は60Hz、FH6 は画面のフレームレートに連動して128〜168Hz）ため、
 * 「前回の配信から配信間隔が経過したか」だけで判定すると、配信が毎回最大で受信間隔ぶん遅れ、実効 FPS が設定値を下回る
 * （例: 60Hz の受信で 15 FPS の設定は約13.2 FPS になる）。
 * そこで、受信間隔の平滑値の半分（ただし配信間隔の半分を上限とする）を許容幅とし、
 * 「前回の基準時刻からの経過時間 ≥ 配信間隔 − 許容幅」でパケットを受け付ける。
 * また、基準時刻は受け付けた時刻ではなく配信間隔ぶん進めることで、早めに受け付けた分と遅れた分を相殺し、
 * 平均の配信間隔を設定値に合わせる。
 *
 * @note 時刻は引数で受け取り、タイマーなどの副作用を持たない。
 */
export class Throttle {
  /** 受信間隔の平滑化（指数移動平均）の係数 */
  private readonly smoothingFactor = 0.1;

  private lastArrivalMs?: number;
  private smoothedArrivalIntervalMs?: number;
  private baseTimeMs?: number;

  /**
   * パケットを受け付ける（配信する）かどうかを判定し、内部の状態を更新します。
   *
   * @param nowMs - パケットの受信時刻（ミリ秒。`performance.now()` などの単調増加する時刻）
   * @param intervalMs - 配信間隔（ミリ秒）
   * @returns 受け付ける場合は true、間引く場合は false
   */
  public accept(nowMs: number, intervalMs: number): boolean {
    if (this.lastArrivalMs !== undefined) {
      // 受信が途絶えた後の大きな受信間隔で平滑値が乱れないよう、配信間隔で頭打ちにする
      // （許容幅は配信間隔の半分が上限のため、それ以上の値は判定に影響しない）
      const arrivalIntervalMs = Math.min(nowMs - this.lastArrivalMs, intervalMs);
      this.smoothedArrivalIntervalMs = this.smoothedArrivalIntervalMs === undefined
        ? arrivalIntervalMs
        : this.smoothedArrivalIntervalMs + (arrivalIntervalMs - this.smoothedArrivalIntervalMs) * this.smoothingFactor;
    }
    this.lastArrivalMs = nowMs;

    if (this.baseTimeMs === undefined) {
      this.baseTimeMs = nowMs;
      return true;
    }

    const toleranceMs = Math.min((this.smoothedArrivalIntervalMs ?? 0) / 2, intervalMs / 2);
    if (nowMs - this.baseTimeMs < intervalMs - toleranceMs) {
      return false;
    }

    // 基準時刻を配信間隔ぶん進める。ただし、受信が途絶えるなどして大きく遅れた場合は、
    // 遅れを取り戻すために続けて配信しないよう、許容幅の範囲まで基準時刻を現在に寄せる。
    this.baseTimeMs = Math.max(this.baseTimeMs + intervalMs, nowMs - toleranceMs);
    return true;
  }

  /**
   * 判定の状態を初期化します。
   */
  public reset(): void {
    this.lastArrivalMs = undefined;
    this.smoothedArrivalIntervalMs = undefined;
    this.baseTimeMs = undefined;
  }
}
