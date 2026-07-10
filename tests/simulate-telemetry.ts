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

// 物理定数
const G_ACCELERATION: number = 9.80665;

/**
 * FH6 Data Out パケットのバイトオフセット定義
 */
const PACKET_OFFSET = {
  IS_RACE_ON: 0,
  TIMESTAMP_MS: 4,
  ENGINE_MAX_RPM: 8,
  ENGINE_IDLE_RPM: 12,
  CURRENT_ENGINE_RPM: 16,
  ACCELERATION_X: 20,
  ACCELERATION_Y: 24,
  ACCELERATION_Z: 28,
  SUSPENSION_TRAVEL_FL: 68,
  SUSPENSION_TRAVEL_FR: 72,
  SUSPENSION_TRAVEL_RL: 76,
  SUSPENSION_TRAVEL_RR: 80,
  SPEED: 256,
  TIRE_TEMP_FL: 268,
  TIRE_TEMP_FR: 272,
  TIRE_TEMP_RL: 276,
  TIRE_TEMP_RR: 280,
  BEST_LAP: 296,
  LAST_LAP: 300,
  CURRENT_LAP: 304,
  LAP_NUMBER: 312,
  RACE_POSITION: 314,
  ACCEL: 315,
  BRAKE: 316,
  GEAR: 319,
} as const;

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
  tireTempFL: number;
  tireTempFR: number;
  tireTempRL: number;
  tireTempRR: number;
  suspensionFL: number;
  suspensionFR: number;
  suspensionRL: number;
  suspensionRR: number;
}

/**
 * 摂氏（℃）を華氏（℉）に変換します。
 *
 * @param celsius 摂氏温度
 * @returns 華氏温度
 */
function celsiusToFahrenheit(celsius: number): number {
  return celsius * 1.8 + 32;
}

/**
 * シンプルなパラメータによるシミュレーション値の計算
 *
 * @param timestampMs 経過時間（ミリ秒）
 * @param base 基準値（例：70、0.5）
 * @param amplitude 正弦波の振幅（0指定で波なし）
 * @param periodMs 正弦波の周期（ミリ秒。0指定で波なし）
 * @param noiseAmp ランダムノイズの振幅（値は -noiseAmp/2 ～ +noiseAmp/2 の範囲で変動）
 * @param load 外部から加える荷重やGフォースの影響量
 * @param min 最小クランプ値（オプション）
 * @param max 最大クランプ値（オプション）
 * @param useCosine trueの場合、正弦波の代わりに余弦波を使用（オプション）
 * @returns 計算されたシミュレーション値
 */
function simulateValue(
  timestampMs: number,
  base: number,
  amplitude: number,
  periodMs: number,
  noiseAmp: number,
  load: number = 0,
  min?: number,
  max?: number,
  useCosine: boolean = false,
): number {
  const angle = periodMs > 0 ? (timestampMs / periodMs) * 2 * Math.PI : 0;
  const wave = periodMs > 0 ? (useCosine ? Math.cos(angle) : Math.sin(angle)) : 0;
  const noise = (Math.random() - 0.5) * noiseAmp;

  let val = base + wave * amplitude + load + noise;

  if (min !== undefined) val = Math.max(min, val);
  if (max !== undefined) val = Math.min(max, val);

  return val;
}

/**
 * 現在のエンジン回転数とギア比から車両速度を算出します。
 *
 * @param rpm 現在のエンジン回転数
 * @param gear 現在のギア段数
 * @returns 車両速度（m/s）
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
 * @param state 現在の車両シミュレーション状態
 * @returns 生成されたテレメトリパケットのバイナリデータ
 */
function buildTelemetryPacket(state: CarState): Buffer {
  const buf: Buffer = Buffer.alloc(324, 0); // 未使用領域は0で初期化

  buf.writeInt32LE(1, PACKET_OFFSET.IS_RACE_ON);
  buf.writeUInt32LE(state.timestampMs, PACKET_OFFSET.TIMESTAMP_MS);
  buf.writeFloatLE(MAX_RPM, PACKET_OFFSET.ENGINE_MAX_RPM);
  buf.writeFloatLE(IDLE_RPM, PACKET_OFFSET.ENGINE_IDLE_RPM);
  buf.writeFloatLE(state.rpm, PACKET_OFFSET.CURRENT_ENGINE_RPM);

  buf.writeFloatLE(state.accelerationX, PACKET_OFFSET.ACCELERATION_X);
  buf.writeFloatLE(state.accelerationY, PACKET_OFFSET.ACCELERATION_Y);
  buf.writeFloatLE(state.accelerationZ, PACKET_OFFSET.ACCELERATION_Z);

  buf.writeFloatLE(state.suspensionFL, PACKET_OFFSET.SUSPENSION_TRAVEL_FL);
  buf.writeFloatLE(state.suspensionFR, PACKET_OFFSET.SUSPENSION_TRAVEL_FR);
  buf.writeFloatLE(state.suspensionRL, PACKET_OFFSET.SUSPENSION_TRAVEL_RL);
  buf.writeFloatLE(state.suspensionRR, PACKET_OFFSET.SUSPENSION_TRAVEL_RR);

  buf.writeFloatLE(state.speed, PACKET_OFFSET.SPEED);

  buf.writeFloatLE(state.tireTempFL, PACKET_OFFSET.TIRE_TEMP_FL);
  buf.writeFloatLE(state.tireTempFR, PACKET_OFFSET.TIRE_TEMP_FR);
  buf.writeFloatLE(state.tireTempRL, PACKET_OFFSET.TIRE_TEMP_RL);
  buf.writeFloatLE(state.tireTempRR, PACKET_OFFSET.TIRE_TEMP_RR);

  buf.writeFloatLE(state.bestLap, PACKET_OFFSET.BEST_LAP);
  buf.writeFloatLE(state.lastLap, PACKET_OFFSET.LAST_LAP);
  buf.writeFloatLE(state.currentLap, PACKET_OFFSET.CURRENT_LAP);
  buf.writeUInt16LE(state.lapNumber, PACKET_OFFSET.LAP_NUMBER);
  buf.writeUInt8(state.racePosition, PACKET_OFFSET.RACE_POSITION);

  buf.writeUInt8(255, PACKET_OFFSET.ACCEL);
  buf.writeUInt8(0, PACKET_OFFSET.BRAKE);
  buf.writeUInt8(state.gear, PACKET_OFFSET.GEAR);

  return buf;
}

/**
 * 車両シミュレーション状態を更新します。
 *
 * @param state 現在の車両シミュレーション状態
 * @param dt 経過時間（秒）
 */
function updateCarState(state: CarState, dt: number): void {
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

  // タイヤ温度のシミュレーション
  // 走行荷重（Gフォース）による一時的な影響を算出
  const loadFL = state.accelerationX > 0 ? state.accelerationX * 1.0 : 0;
  const loadFR = state.accelerationX < 0 ? -state.accelerationX * 1.0 : 0;
  const loadRL = (state.accelerationX > 0 ? state.accelerationX * 0.6 : 0) + (state.accelerationZ > 0 ? state.accelerationZ * 0.4 : 0);
  const loadRR = (state.accelerationX < 0 ? -state.accelerationX * 0.6 : 0) + (state.accelerationZ > 0 ? state.accelerationZ * 0.4 : 0);

  // 摂氏でシミュレートしてから華氏に変換（テレメトリデータはネイティブで華氏のため）
  // 加速リセット周期（約8秒）に合わせて周期を短縮し、40℃～130℃付近までダイナミックに全色域を変化させる
  const tempFL_C = simulateValue(state.timestampMs, 80, 45, 8000, 4, loadFL, 20, 150);
  const tempFR_C = simulateValue(state.timestampMs, 80, 45, 8000, 4, loadFR, 20, 150, true);
  const tempRL_C = simulateValue(state.timestampMs, 80, 40, 10000, 4, loadRL, 20, 150);
  const tempRR_C = simulateValue(state.timestampMs, 80, 40, 10000, 4, loadRR, 20, 150, true);

  state.tireTempFL = celsiusToFahrenheit(tempFL_C);
  state.tireTempFR = celsiusToFahrenheit(tempFR_C);
  state.tireTempRL = celsiusToFahrenheit(tempRL_C);
  state.tireTempRR = celsiusToFahrenheit(tempRR_C);

  // サスペンション移動量のシミュレーション
  // ロール（左右Gによる傾き）、ピッチ（前後Gによる傾き）を反映
  const rollEffect = state.accelerationX * 0.05; // 左右Gで沈み込む
  const pitchEffect = state.accelerationZ * 0.03; // 前後Gでリア沈み・フロント浮き

  // 汎用シミュレーション関数を用いて、路面ノイズ（±0.07）とクランプ（0.0〜1.0）を適用
  state.suspensionFL = simulateValue(0, 0.7, 0, 0, 0.1, -rollEffect + pitchEffect, 0.0, 1.0);
  state.suspensionFR = simulateValue(0, 0.7, 0, 0, 0.1, rollEffect + pitchEffect, 0.0, 1.0);
  state.suspensionRL = simulateValue(0, 0.7, 0, 0, 0.1, -rollEffect - pitchEffect, 0.0, 1.0);
  state.suspensionRR = simulateValue(0, 0.7, 0, 0, 0.1, rollEffect - pitchEffect, 0.0, 1.0);

  // 速度の再計算とタイムスタンプ更新
  state.speed = calculateSpeed(state.rpm, state.gear);
  state.timestampMs += INTERVAL_MS;

  // ラップタイムの更新（60秒で1周と仮定）
  state.currentLap += dt;
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

  // 最高ギアで最高回転数に到達した場合、初期状態（ギア1＝1速）にリセットしてループを継続する
  if (state.gear === MAX_GEAR && state.rpm >= MAX_RPM) {
    state.gear = 1;
    state.rpm = IDLE_RPM;
    state.speed = 0;
    state.timestampMs = 0; // 経過時間をリセットし、波形シミュレーションを再同期する
  }
}

// 初期状態のセットアップ
const state: CarState = {
  gear: 1,
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
  tireTempFL: 80,
  tireTempFR: 80,
  tireTempRL: 75,
  tireTempRR: 75,
  suspensionFL: 0.5,
  suspensionFR: 0.5,
  suspensionRL: 0.5,
  suspensionRR: 0.5,
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
  updateCarState(state, dt);

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
  const gXStr: string = (state.accelerationX / G_ACCELERATION).toFixed(2);
  const gZStr: string = (state.accelerationZ / G_ACCELERATION).toFixed(2);

  process.stdout.write(
    `\rGear: ${gearChar} | RPM: ${currentRpm.padStart(4, ' ')} | Speed: ${speedKmh.padStart(4, ' ')} km/h | G-Force: X:${gXStr.padStart(5, ' ')} Z:${gZStr.padStart(5, ' ')} | Lap: ${state.lapNumber} (${currentLapStr}s) | Pos: ${state.racePosition}`,
  );
}, INTERVAL_MS);
