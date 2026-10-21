import { Buffer } from 'node:buffer';

import { describe, expect, it } from 'vitest';

import { parseToForzaTelemetryData } from '../src/telemetry/parser';

const WHEEL_IN_PUDDLE_OFFSET = 132;

describe('parseToForzaTelemetryData の水たまり項目', () => {
  it('Forza Horizon（324バイト）では S32（0 / 1）として読み取る', () => {
    const buffer = Buffer.alloc(324);
    buffer.writeInt32LE(1, WHEEL_IN_PUDDLE_OFFSET);
    buffer.writeInt32LE(0, WHEEL_IN_PUDDLE_OFFSET + 4);
    buffer.writeInt32LE(1, WHEEL_IN_PUDDLE_OFFSET + 8);
    buffer.writeInt32LE(0, WHEEL_IN_PUDDLE_OFFSET + 12);

    const data = parseToForzaTelemetryData(buffer);
    expect(data.game).toBe('horizon');
    expect([data.wheelInPuddleFrontLeft, data.wheelInPuddleFrontRight, data.wheelInPuddleRearLeft, data.wheelInPuddleRearRight])
      .toEqual([1, 0, 1, 0]);
  });

  it.each([311, 331])('Forza Motorsport（%iバイト）では F32（深さ 0〜1）として読み取る', (size) => {
    const buffer = Buffer.alloc(size);
    buffer.writeFloatLE(0.5, WHEEL_IN_PUDDLE_OFFSET);
    buffer.writeFloatLE(1, WHEEL_IN_PUDDLE_OFFSET + 4);
    buffer.writeFloatLE(0.25, WHEEL_IN_PUDDLE_OFFSET + 8);
    buffer.writeFloatLE(0, WHEEL_IN_PUDDLE_OFFSET + 12);

    const data = parseToForzaTelemetryData(buffer);
    expect(data.game).toBe('motorsport');
    expect([data.wheelInPuddleFrontLeft, data.wheelInPuddleFrontRight, data.wheelInPuddleRearLeft, data.wheelInPuddleRearRight])
      .toEqual([0.5, 1, 0.25, 0]);
  });
});
