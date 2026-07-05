import { Buffer } from 'node:buffer';
import * as dgram from 'node:dgram';

const PORT: number = 5300;
const HOST: string = '127.0.0.1';
const INTERVAL_MS: number = 100;

// 車両のスペック定義
const IDLE_RPM: number = 800;
const MAX_RPM: number = 8000;
const SHIFT_UP_RPM: number = 7500;
const TIRE_RADIUS_M: number = 0.33; // タイヤ半径(メートル)
const FINAL_DRIVE: number = 3.5;

// 各ギアのギア比 (インデックス0はリバース[R]、1はニュートラル[N]、2以上が前進ギア)
const GEAR_RATIOS: number[] = [3.0, 0, 3.0, 2.0, 1.5, 1.1, 0.85, 0.65];
const MAX_GEAR: number = GEAR_RATIOS.length - 1;

/**
 * 車両のシミュレーション状態を保持するインターフェース
 */
interface CarState {
  gear: number;
  rpm: number;
  speed: number;
  timestampMs: number;
}

/**
 * 現在のエンジン回転数とギア比から車両速度を算出します。
 *
 * Args:
 * rpm (number): 現在のエンジン回転数
 * gear (number): 現在のギア段数
 *
 * Returns:
 * number: 車両速度 (m/s)
 */
function calculateSpeed(rpm: number, gear: number): number {
  if (gear <= 1 || gear > MAX_GEAR) return 0;

  const tireCircumference: number = 2 * Math.PI * TIRE_RADIUS_M;
  const wheelRpm: number = rpm / (GEAR_RATIOS[gear] * FINAL_DRIVE);

  // m/min を m/s に変換
  return (wheelRpm * tireCircumference) / 60;
}

/**
 * FH6のData Out仕様に準拠した324バイトのUDPペイロードを生成します。
 *
 * Args:
 * state (CarState): 現在の車両シミュレーション状態
 *
 * Returns:
 * Buffer: 生成されたテレメトリパケットのバイナリデータ
 */
function buildTelemetryPacket(state: CarState): Buffer {
  const buf: Buffer = Buffer.alloc(324, 0); // 未使用領域は0で初期化

  buf.writeInt32LE(1, 0); // isRaceOn: 1 (レース中)
  buf.writeUInt32LE(state.timestampMs, 4); // timestampMs
  buf.writeFloatLE(MAX_RPM, 8); // engineMaxRpm
  buf.writeFloatLE(IDLE_RPM, 12); // engineIdleRpm
  buf.writeFloatLE(state.rpm, 16); // currentEngineRpm

  buf.writeFloatLE(state.speed, 256); // speed (m/s)

  buf.writeUInt8(255, 315); // accel: 255 (全開)
  buf.writeUInt8(0, 316); // brake: 0
  buf.writeUInt8(state.gear, 319); // gear: 現在のギア

  return buf;
}

// 初期状態のセットアップ (ギア2＝1速)
const state: CarState = {
  gear: 2,
  rpm: IDLE_RPM,
  speed: 0,
  timestampMs: 0,
};

const socket: dgram.Socket = dgram.createSocket('udp4');

console.log(`[Simulation Started] Target: ${HOST}:${PORT}`);
console.log(
  `Interval: ${INTERVAL_MS}ms, Max RPM: ${MAX_RPM}, Max Gear: ${MAX_GEAR}\n`,
);

// メインループ
setInterval(() => {
  // 1. 車両状態の更新
  // 低いギアほどRPMの上がり方を早くする簡易ロジック
  const rpmGain: number = 600 / (state.gear - 1);
  state.rpm += rpmGain;

  // シフトアップ判定
  if (state.rpm > SHIFT_UP_RPM) {
    if (state.gear < MAX_GEAR) {
      state.gear++;
      // シフトアップ後のRPMドロップをギア比から逆算してシミュレート
      const dropRatio: number =
        GEAR_RATIOS[state.gear] / GEAR_RATIOS[state.gear - 1];
      state.rpm = state.rpm * dropRatio;
    } else {
      // 最高速到達（レブリミッター）
      state.rpm = MAX_RPM;
    }
  }

  // 速度の再計算とタイムスタンプ更新
  state.speed = calculateSpeed(state.rpm, state.gear);
  state.timestampMs += INTERVAL_MS;

  // 2. パケット生成と送信
  const packet: Buffer = buildTelemetryPacket(state);

  socket.send(packet, 0, packet.length, PORT, HOST, (err: Error | null) => {
    if (err) {
      console.error(`[UDP Send Error] ${err.message}`);
      process.exit(1);
    }
  });

  // 3. コンソール出力 (m/s を km/h に変換して表示)
  const speedKmh: string = (state.speed * 3.6).toFixed(0);
  const currentRpm: string = state.rpm.toFixed(0);
  const gearChar: string = state.gear === 0 ? 'R' : state.gear === 1 ? 'N' : (state.gear - 1).toString();
  process.stdout.write(
    `\rGear: ${gearChar} | RPM: ${currentRpm.padStart(4, ' ')} | Speed: ${speedKmh.padStart(4, ' ')} km/h`,
  );

  // 最高ギアで最高回転数に到達した場合、初期状態（ギア2＝1速）にリセットしてループを継続する
  if (state.gear === MAX_GEAR && state.rpm >= MAX_RPM) {
    state.gear = 2;
    state.rpm = IDLE_RPM;
    state.speed = 0;
  }
}, INTERVAL_MS);
