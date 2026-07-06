import { Buffer } from 'node:buffer';
import * as dgram from 'node:dgram';

const PORT: number = 5300;
const HOST: string = '127.0.0.1';
const INTERVAL_MS: number = 20;

// 車両のスペック定義
const IDLE_RPM: number = 800;
const MAX_RPM: number = 8000;
const SHIFT_UP_RPM: number = 7500;
const TIRE_RADIUS_M: number = 0.33; // タイヤ半径（メートル）
const FINAL_DRIVE: number = 3.5;

// 各ギアのギア比（インデックス0はリバース［R］、1以上が前進ギア）
const GEAR_RATIOS: number[] = [3.0, 3.0, 2.0, 1.5, 1.1, 0.85, 0.65];
const MAX_GEAR: number = GEAR_RATIOS.length - 1;

/**
 * 車両のシミュレーション状態を保持するインターフェース
 */
interface CarState {
  gear: number;
  rpm: number;
  speed: number;
  timestampMs: number;
  lapNumber: number;
  currentLap: number;
  lastLap: number;
  bestLap: number;
  racePosition: number;
  accelerationX: number;
  accelerationY: number;
  accelerationZ: number;
}

/**
 * 現在のエンジン回転数とギア比から車両速度を算出します。
 *
 * Args:
 * rpm (number): 現在のエンジン回転数
 * gear (number): 現在のギア段数
 *
 * Returns:
 * number: 車両速度（m/s）
 */
function calculateSpeed(rpm: number, gear: number): number {
  if (gear < 1 || gear > MAX_GEAR) return 0;

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

  buf.writeInt32LE(1, 0); // isRaceOn: 1（レース中）
  buf.writeUInt32LE(state.timestampMs, 4); // timestampMs
  buf.writeFloatLE(MAX_RPM, 8); // engineMaxRpm
  buf.writeFloatLE(IDLE_RPM, 12); // engineIdleRpm
  buf.writeFloatLE(state.rpm, 16); // currentEngineRpm

  // 加速度データの書き込み（Offset: 20, 24, 28）
  buf.writeFloatLE(state.accelerationX, 20); // accelerationX
  buf.writeFloatLE(state.accelerationY, 24); // accelerationY
  buf.writeFloatLE(state.accelerationZ, 28); // accelerationZ

  buf.writeFloatLE(state.speed, 256); // speed（m/s）

  // Lap times
  buf.writeFloatLE(state.bestLap, 296); // bestLap
  buf.writeFloatLE(state.lastLap, 300); // lastLap
  buf.writeFloatLE(state.currentLap, 304); // currentLap
  buf.writeUInt16LE(state.lapNumber, 312); // lapNumber
  buf.writeUInt8(state.racePosition, 314); // racePosition

  buf.writeUInt8(255, 315); // accel: 255（全開）
  buf.writeUInt8(0, 316); // brake: 0

  buf.writeUInt8(state.gear, 319); // gear: 現在のギア

  return buf;
}

// 初期状態のセットアップ
const state: CarState = {
  gear: 0,
  rpm: IDLE_RPM,
  speed: 0,
  timestampMs: 0,
  lapNumber: 0,
  currentLap: 0,
  lastLap: 0,
  bestLap: 0,
  racePosition: 4,
  accelerationX: 0,
  accelerationY: 0,
  accelerationZ: 0,
};

const socket: dgram.Socket = dgram.createSocket('udp4');

console.log(`[Simulation Started] Target: ${HOST}:${PORT}`);
console.log(
  `Interval: ${INTERVAL_MS}ms, Max RPM: ${MAX_RPM}, Max Gear: ${MAX_GEAR}\n`,
);

// メインループ
setInterval(() => {
  const dt = INTERVAL_MS / 1000; // 経過時間（秒）

  // 1. 車両状態の更新
  // 低いギアほどRPMの上がり方を早くする簡易ロジック（1秒あたりのRPM上昇量）
  const rpmRiseRatePerSec = 6000 / state.gear;
  const rpmGain = rpmRiseRatePerSec * dt;
  state.rpm += rpmGain;

  // 加速度のシミュレーション
  // 左右の旋回G（1.5秒周期で滑らかに左右に振る。最大約0.4G）
  state.accelerationX = Math.sin(state.timestampMs / 1500) * 4.0;

  // 垂直方向の細かな路面ノイズ
  state.accelerationY = (Math.random() - 0.5) * 1.5;

  // 前後G（加速時はギアに応じた加速度、シフトアップの瞬間はマイナスに落ちる）
  let currentAccelZ = 6.0 / state.gear;

  // シフトアップ判定
  if (state.rpm > SHIFT_UP_RPM) {
    if (state.gear < MAX_GEAR) {
      state.gear++;
      // シフトアップ後のRPMドロップをギア比から逆算してシミュレート
      const dropRatio: number
        = GEAR_RATIOS[state.gear] / GEAR_RATIOS[state.gear - 1];
      state.rpm = state.rpm * dropRatio;

      // シフトアップの瞬間（クラッチ接続中など）は一瞬駆動力が抜ける（マイルドな減速G）
      currentAccelZ = -0.5;
    } else {
      // 最高速到達（レブリミッター）
      state.rpm = MAX_RPM;
      currentAccelZ = 0;
    }
  }

  state.accelerationZ = currentAccelZ;

  // 速度の再計算とタイムスタンプ更新
  state.speed = calculateSpeed(state.rpm, state.gear);
  state.timestampMs += INTERVAL_MS;

  // ラップタイムの更新（60秒で1周と仮定）
  state.currentLap += INTERVAL_MS / 1000;
  if (state.currentLap >= 60) {
    const finalLapTime = state.currentLap;
    state.lastLap = finalLapTime;
    if (state.bestLap === 0 || finalLapTime < state.bestLap) {
      state.bestLap = finalLapTime;
    }
    state.lapNumber++;
    state.currentLap = 0;
    // 順位もたまに変化させる（1〜12位の間）
    state.racePosition = Math.max(1, Math.min(12, state.racePosition + (Math.random() > 0.5 ? 1 : -1)));
  }

  // 2. パケット生成と送信
  const packet: Buffer = buildTelemetryPacket(state);

  socket.send(packet, 0, packet.length, PORT, HOST, (err: Error | null) => {
    if (err) {
      console.error(`[UDP Send Error] ${err.message}`);
      process.exit(1);
    }
  });

  // 3. コンソール出力（m/s を km/h に変換して表示）
  const speedKmh: string = (state.speed * 3.6).toFixed(0);
  const currentRpm: string = state.rpm.toFixed(0);
  const gearChar: string = state.gear === 0 ? 'R' : state.gear.toString();
  const currentLapStr: string = state.currentLap.toFixed(1);
  const gXStr: string = (state.accelerationX / 9.80665).toFixed(2);
  const gZStr: string = (state.accelerationZ / 9.80665).toFixed(2);

  process.stdout.write(
    `\rGear: ${gearChar} | RPM: ${currentRpm.padStart(4, ' ')} | Speed: ${speedKmh.padStart(4, ' ')} km/h | G-Force: X:${gXStr.padStart(5, ' ')} Z:${gZStr.padStart(5, ' ')} | Lap: ${state.lapNumber} (${currentLapStr}s) | Pos: ${state.racePosition}`,
  );

  // 最高ギアで最高回転数に到達した場合、初期状態（ギア1＝1速）にリセットしてループを継続する
  if (state.gear === MAX_GEAR && state.rpm >= MAX_RPM) {
    state.gear = 1;
    state.rpm = IDLE_RPM;
    state.speed = 0;
  }
}, INTERVAL_MS);
