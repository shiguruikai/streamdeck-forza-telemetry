import { describe, expect, it } from 'vitest';

import { Throttle } from '../src/telemetry/throttle';

/**
 * 再現性のある揺らぎを作るための、シード付きの疑似乱数（mulberry32）を生成します。
 */
function createRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 指定した周波数で、±2ms の揺らぎを持つパケットの到着時刻を生成します。
 */
function createArrivals(hz: number, durationMs: number, seed: number): number[] {
  const random = createRandom(seed);
  const periodMs = 1000 / hz;
  const arrivals: number[] = [];
  for (let i = 0; i * periodMs < durationMs; i++) {
    // 揺らぎで負の時刻にならないよう、開始を少しずらす
    arrivals.push(1000 + i * periodMs + (random() * 4 - 2));
  }
  return arrivals;
}

/**
 * 到着順で隣接するパケットを、続けて受け付けた回数を数えます。
 */
function countAdjacentAccepts(results: readonly boolean[]): number {
  return results.filter((accepted, i) => accepted && results[i + 1]).length;
}

describe('Throttle', () => {
  const DURATION_MS = 60_000;
  const WINDOW_MS = 10_000;
  const FPS_LIST = [10, 15, 20, 25, 30];

  describe.each([60, 144])('%iHz で到着するパケット', (hz) => {
    it.each(FPS_LIST)('%i FPS の設定で、実効 FPS が設定値の±3%に入り、隣接するパケットを続けて受け付けない', (fps) => {
      // 設定の適用（applyGlobalSettings）と同じく、配信間隔は丸めない
      const intervalMs = 1000 / fps;
      const arrivals = createArrivals(hz, DURATION_MS, hz * 100 + fps);

      const throttle = new Throttle();
      const results = arrivals.map((t) => throttle.accept(t, intervalMs));
      const accepted = arrivals.filter((_, i) => results[i]);

      const effectiveFps = accepted.length / (DURATION_MS / 1000);
      expect(effectiveFps).toBeGreaterThanOrEqual(fps * 0.97);
      expect(effectiveFps).toBeLessThanOrEqual(fps * 1.03);

      // どの10秒間でも、平均が設定値を3%以上超えない
      for (let start = arrivals[0]; start + WINDOW_MS <= arrivals[0] + DURATION_MS; start += WINDOW_MS) {
        const count = accepted.filter((t) => t >= start && t < start + WINDOW_MS).length;
        expect(count / (WINDOW_MS / 1000)).toBeLessThan(fps * 1.03);
      }

      expect(countAdjacentAccepts(results)).toBe(0);
    });

    it.each(FPS_LIST)('%i FPS の設定で、受信が途絶えた後は、遅れを取り戻すために続けて受け付けない', (fps) => {
      const intervalMs = 1000 / fps;
      const periodMs = 1000 / hz;
      const throttle = new Throttle();
      for (let t = 0; t < 2000; t += periodMs) {
        throttle.accept(t, intervalMs);
      }

      // メニュー中などで3秒間途絶えた後に、1秒間再開する
      const resumed: boolean[] = [];
      for (let t = 5000; t < 6000; t += periodMs) {
        resumed.push(throttle.accept(t, intervalMs));
      }
      expect(resumed[0]).toBe(true);
      expect(countAdjacentAccepts(resumed)).toBe(0);
      expect(resumed.filter(Boolean).length).toBeLessThanOrEqual(fps + 1);
    });
  });

  it('reset() の後は、最初のパケットを受け付ける', () => {
    const throttle = new Throttle();
    expect(throttle.accept(0, 100)).toBe(true);
    expect(throttle.accept(10, 100)).toBe(false);

    throttle.reset();
    expect(throttle.accept(20, 100)).toBe(true);
  });
});
