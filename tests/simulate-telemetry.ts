import { Buffer } from 'node:buffer';
import * as dgram from 'node:dgram';
import * as readline from 'node:readline';

const PORT = 24000;
const HOST = '127.0.0.1';
const TELEMETRY_INTERVAL_MS = 16; // データ送信間隔（約60FPS）
const CONSOLE_RENDER_INTERVAL_MS = 50; // コンソール描画間隔（20FPSで負荷を軽減）

// 車両のスペック定義
const IDLE_RPM = 800;
const MAX_RPM = 8000;
const SHIFT_UP_RPM = 7500;
const TIRE_RADIUS_M = 0.33; // タイヤ半径（メートル）
const FINAL_DRIVE = 3.5;

const GEAR_RATIOS: number[] = [3.0, 3.0, 2.0, 1.5, 1.1, 0.85, 0.65];
const MAX_GEAR: number = GEAR_RATIOS.length - 1;

// 物理定数
const G_ACCELERATION = 9.80665;

let format: 'fh6' | 'fh5' | 'fm8-dash' | 'fm7-dash' | 'fm-sled' = 'fh6';

// 引数のパース
const args = process.argv.slice(2);
const formatIndex = args.indexOf('--format');
if (formatIndex !== -1) {
  const formatVal = args[formatIndex + 1];
  if (!formatVal) {
    console.error('Error: --format option requires a value. Allowed values: fh6, fh5, fm8-dash, fm7-dash, fm-sled');
    process.exit(1);
  }
  const f = formatVal.toLowerCase();
  if (f === 'fh6' || f === 'fh5' || f === 'fm8-dash' || f === 'fm7-dash' || f === 'fm-sled') {
    format = f;
  } else {
    console.error(`Invalid format: ${f}. Allowed values: fh6, fh5, fm8-dash, fm7-dash, fm-sled`);
    process.exit(1);
  }
}

/**
 * 車両のシミュレーション状態を保持するインターフェース
 */
type CarState = {
  gear: number;
  rpm: number;
  speed: number;
  timestampMs: number;
  lapNumber: number;
  currentLap: number;
  lastLap: number;
  bestLap: number;
  currentRaceTime: number;
  racePosition: number;
  accelerationX: number;
  accelerationY: number;
  accelerationZ: number;
  yaw: number;
  tireTempFL: number;
  tireTempFR: number;
  tireTempRL: number;
  tireTempRR: number;
  suspensionFL: number;
  suspensionFR: number;
  suspensionRL: number;
  suspensionRR: number;
  power: number;
  torque: number;
  carOrdinal: number;
  carClass: number;
  carPerformanceIndex: number;
  drivetrainType: number;
  numCylinders: number;
};

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
  load = 0,
  min?: number,
  max?: number,
  useCosine = false,
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
 * RPMに応じたエンジントルク（N·m）を計算します。
 * スポーツカー（最高回転数8000rpm、最大トルク520 N·m/5200rpm、最高出力約470 PS/7500rpm）の実車特性をシミュレートします。
 *
 * @param rpm 現在のエンジン回転数
 * @returns トルク（N·m）
 */
function calculateTorque(rpm: number): number {
  const idleRpm = IDLE_RPM;
  const peakTorqueRpm = 5200;
  const maxRpm = MAX_RPM;

  let baseTorque: number;
  if (rpm <= peakTorqueRpm) {
    // 低～中回転域: 800rpm（約200 N·m）から 5200rpm（520 N·m）へスムーズに上昇
    const progress = Math.max(0, (rpm - idleRpm) / (peakTorqueRpm - idleRpm));
    baseTorque = 200 + 320 * Math.sin(progress * (Math.PI / 2));
  } else {
    // 高回転域: 5200rpm（520 N·m）から 8000rpm（約410 N·m）へ緩やかに低下
    // 馬力（Power）はトルク×RPMに比例するため、7500rpm付近で最高出力（約470 PS）を発揮
    const progress = Math.min(1, (rpm - peakTorqueRpm) / (maxRpm - peakTorqueRpm));
    baseTorque = 520 - 110 * (1 - Math.cos(progress * (Math.PI / 2)));
  }

  // わずかな燃焼・負荷のノイズを加重
  const noise = (Math.random() - 0.5) * 15;
  return Math.max(100, baseTorque + noise);
}

/**
 * 共通のSledデータ書き込み処理（0〜231バイト）
 */
function writeSledData(buf: Buffer, state: CarState): void {
  buf.writeInt32LE(1, 0); // IS_RACE_ON
  buf.writeUInt32LE(state.timestampMs, 4); // TIMESTAMP_MS
  buf.writeFloatLE(MAX_RPM, 8); // ENGINE_MAX_RPM
  buf.writeFloatLE(IDLE_RPM, 12); // ENGINE_IDLE_RPM
  buf.writeFloatLE(state.rpm, 16); // CURRENT_ENGINE_RPM
  buf.writeFloatLE(state.accelerationX, 20); // ACCELERATION_X
  buf.writeFloatLE(state.accelerationY, 24); // ACCELERATION_Y
  buf.writeFloatLE(state.accelerationZ, 28); // ACCELERATION_Z
  buf.writeFloatLE(state.yaw, 56); // YAW

  // 必要なSledデータを埋める
  buf.writeFloatLE(state.suspensionFL, 68);
  buf.writeFloatLE(state.suspensionFR, 72);
  buf.writeFloatLE(state.suspensionRL, 76);
  buf.writeFloatLE(state.suspensionRR, 80);

  buf.writeInt32LE(state.carOrdinal, 212);
  buf.writeInt32LE(state.carClass, 216);
  buf.writeInt32LE(state.carPerformanceIndex, 220);
  buf.writeInt32LE(state.drivetrainType, 224);
  buf.writeInt32LE(state.numCylinders, 228);
}

/**
 * 共通のDashデータ書き込み処理
 */
function writeDashData(buf: Buffer, state: CarState, offsetDiff: number): void {
  buf.writeFloatLE(0, 232 + offsetDiff); // positionX
  buf.writeFloatLE(0, 236 + offsetDiff); // positionY
  buf.writeFloatLE(0, 240 + offsetDiff); // positionZ
  buf.writeFloatLE(state.speed, 244 + offsetDiff);
  buf.writeFloatLE(state.power, 248 + offsetDiff); // power in Watts
  buf.writeFloatLE(state.torque, 252 + offsetDiff); // torque in N·m
  buf.writeFloatLE(state.tireTempFL, 256 + offsetDiff);
  buf.writeFloatLE(state.tireTempFR, 260 + offsetDiff);
  buf.writeFloatLE(state.tireTempRL, 264 + offsetDiff);
  buf.writeFloatLE(state.tireTempRR, 268 + offsetDiff);
  buf.writeFloatLE(0, 272 + offsetDiff); // boost
  buf.writeFloatLE(0, 276 + offsetDiff); // fuel
  buf.writeFloatLE(0, 280 + offsetDiff); // distanceTraveled
  buf.writeFloatLE(state.bestLap, 284 + offsetDiff);
  buf.writeFloatLE(state.lastLap, 288 + offsetDiff);
  buf.writeFloatLE(state.currentLap, 292 + offsetDiff);
  buf.writeFloatLE(state.currentRaceTime, 296 + offsetDiff);
  buf.writeUInt16LE(state.lapNumber, 300 + offsetDiff);
  buf.writeUInt8(state.racePosition, 302 + offsetDiff);
  buf.writeUInt8(255, 303 + offsetDiff); // accel
  buf.writeUInt8(0, 304 + offsetDiff); // brake
  buf.writeUInt8(0, 305 + offsetDiff); // clutch
  buf.writeUInt8(0, 306 + offsetDiff); // handBrake
  buf.writeUInt8(state.gear, 307 + offsetDiff);
  buf.writeInt8(0, 308 + offsetDiff); // steer
  buf.writeInt8(0, 309 + offsetDiff); // normalizedDrivingLine
  buf.writeInt8(0, 310 + offsetDiff); // normalizedAIBrakeDifference
}

/**
 * 送信フォーマットに応じたパケットバッファを生成します。
 */
function buildTelemetryPacket(state: CarState): Buffer {
  if (format === 'fm-sled') {
    // Sled 形式 (232バイト)
    const buf = Buffer.alloc(232, 0);
    writeSledData(buf, state);
    return buf;
  }

  if (format === 'fm7-dash') {
    // FM7 Dash 形式 (311バイト)
    const buf = Buffer.alloc(311, 0);
    writeSledData(buf, state);
    writeDashData(buf, state, 0); // オフセットシフトなし
    return buf;
  }

  if (format === 'fm8-dash') {
    // FM8 Dash 形式 (331バイト)
    const buf = Buffer.alloc(331, 0);
    writeSledData(buf, state);
    writeDashData(buf, state, 0); // オフセットシフトなし

    // FM8固有の末尾データ (Offset 311〜330)
    buf.writeFloatLE(0.01, 311); // tireWearFrontLeft
    buf.writeFloatLE(0.02, 315); // tireWearFrontRight
    buf.writeFloatLE(0.03, 319); // tireWearRearLeft
    buf.writeFloatLE(0.04, 323); // tireWearRearRight
    buf.writeInt32LE(42, 327); // trackOrdinal
    return buf;
  }

  // デフォルト: FH6/FH5 形式 (324バイト)
  const buf = Buffer.alloc(324, 0);
  writeSledData(buf, state);

  // FH6/5 の追加データ (Offset 232〜243)
  buf.writeUInt32LE(99, 232); // carGroup
  buf.writeFloatLE(0.5, 236); // smashableVelDiff
  buf.writeFloatLE(100.0, 240); // smashableMass

  // 12バイトずらしてDashデータを書き込む
  writeDashData(buf, state, 12);
  return buf;
}

let positionTimer = 0;
let totalElapsedTime = 0;

/**
 * 車両シミュレーション状態を更新します。
 *
 * @param state 現在の車両シミュレーション状態
 * @param dt 経過時間（秒）
 */
function updateCarState(state: CarState, dt: number): void {
  // 低いギアほどRPMの上がり方を早くする簡易ロジック（1秒あたりのRPM上昇量）
  const rpmRiseRatePerSec = 3500 / state.gear;
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

  // トルク・出力のシミュレーション（実車特性に応じたトルク曲線＋物理変換）
  state.torque = calculateTorque(state.rpm);
  // Power（W）= Torque（N·m）* RPM * (2 * PI / 60)
  state.power = state.torque * state.rpm * (Math.PI / 30);

  // 速度の再計算とタイムスタンプ更新
  state.speed = calculateSpeed(state.rpm, state.gear);
  state.timestampMs += dt * 1000;
  state.currentRaceTime = state.timestampMs / 1000;

  // 方角（yaw）のシミュレーション（ラジアン: -π ～ +π）
  state.yaw = ((state.timestampMs / 15000) * 2 * Math.PI) % (2 * Math.PI) - Math.PI;

  // 順位の変動シミュレーション（約4秒ごとにオーバーテイクが発生）
  positionTimer += dt;
  if (positionTimer >= 4) {
    positionTimer = 0;
    const delta = Math.random() > 0.5 ? 1 : -1;
    state.racePosition = Math.max(1, Math.min(12, state.racePosition + delta));
  }

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
  }

  // フォーマットに応じた Car Spec プリセットの動的切り替え（3秒間隔でクラスを順番に一周）
  let specPresets = [
    { ordinal: 1, class: 0, pi: 400, drivetrain: 0, cylinders: 4 },
    { ordinal: 2, class: 1, pi: 500, drivetrain: 1, cylinders: 6 },
    { ordinal: 3, class: 2, pi: 600, drivetrain: 1, cylinders: 8 },
    { ordinal: 4, class: 3, pi: 700, drivetrain: 2, cylinders: 6 },
    { ordinal: 5, class: 4, pi: 800, drivetrain: 2, cylinders: 8 },
    { ordinal: 6, class: 5, pi: 900, drivetrain: 2, cylinders: 10 },
    { ordinal: 7, class: 6, pi: 998, drivetrain: 2, cylinders: 10 },
    { ordinal: 8, class: 7, pi: 999, drivetrain: 2, cylinders: 12 },
  ];

  if (format === 'fh5') {
    specPresets = [
      { ordinal: 1, class: 0, pi: 500, drivetrain: 0, cylinders: 4 },
      { ordinal: 2, class: 1, pi: 600, drivetrain: 1, cylinders: 6 },
      { ordinal: 3, class: 2, pi: 700, drivetrain: 1, cylinders: 8 },
      { ordinal: 4, class: 3, pi: 800, drivetrain: 2, cylinders: 6 },
      { ordinal: 5, class: 4, pi: 900, drivetrain: 2, cylinders: 8 },
      { ordinal: 6, class: 5, pi: 998, drivetrain: 2, cylinders: 10 },
      { ordinal: 7, class: 6, pi: 999, drivetrain: 2, cylinders: 12 },
    ];
  } else if (format === 'fm7-dash' || format === 'fm8-dash' || format === 'fm-sled') {
    specPresets = [
      { ordinal: 1, class: 0, pi: 400, drivetrain: 0, cylinders: 4 },
      { ordinal: 2, class: 1, pi: 500, drivetrain: 1, cylinders: 6 },
      { ordinal: 3, class: 2, pi: 600, drivetrain: 1, cylinders: 8 },
      { ordinal: 4, class: 3, pi: 700, drivetrain: 2, cylinders: 6 },
      { ordinal: 5, class: 4, pi: 800, drivetrain: 2, cylinders: 8 },
      { ordinal: 6, class: 5, pi: 900, drivetrain: 2, cylinders: 10 },
      { ordinal: 7, class: 6, pi: 998, drivetrain: 2, cylinders: 10 },
      { ordinal: 8, class: 7, pi: 999, drivetrain: 2, cylinders: 12 },
    ];
  }
  totalElapsedTime += dt;
  const specIndex = Math.floor(totalElapsedTime / 3) % specPresets.length;
  const currentSpec = specPresets[specIndex];
  state.carOrdinal = currentSpec.ordinal;
  state.carClass = currentSpec.class;
  state.carPerformanceIndex = currentSpec.pi;
  state.drivetrainType = currentSpec.drivetrain;
  state.numCylinders = currentSpec.cylinders;

  // 最高ギアで最高回転数に到達した場合、初期状態（ギア1＝1速）にリセットしてループを継続する
  if (state.gear === MAX_GEAR && state.rpm >= MAX_RPM) {
    state.gear = 1;
    state.rpm = IDLE_RPM;
    state.speed = 0;
    state.timestampMs = 0; // 経過時間をリセットし、波形シミュレーションを再同期する
    state.currentRaceTime = 0;
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
  currentRaceTime: 0,
  racePosition: 4,
  accelerationX: 0,
  accelerationY: 0,
  accelerationZ: 0,
  yaw: 0,
  tireTempFL: 80,
  tireTempFR: 80,
  tireTempRL: 75,
  tireTempRR: 75,
  suspensionFL: 0.5,
  suspensionFR: 0.5,
  suspensionRL: 0.5,
  suspensionRR: 0.5,
  power: 0,
  torque: 0,
  carOrdinal: 1,
  carClass: 0,
  carPerformanceIndex: 500,
  drivetrainType: 0,
  numCylinders: 4,
};

let isPaused = false;
let lastUpdateTime = performance.now();
let lastConsoleRenderTime = 0;

const socket: dgram.Socket = dgram.createSocket('udp4');

const header = `
=== Simulation Started ===
Target: ${HOST}:${PORT}
Format: ${format.toUpperCase()}
Send Rate: ~${Math.round(1000 / TELEMETRY_INTERVAL_MS)} FPS (${TELEMETRY_INTERVAL_MS}ms)
Render Rate: ~${Math.round(1000 / CONSOLE_RENDER_INTERVAL_MS)} FPS (${CONSOLE_RENDER_INTERVAL_MS}ms)
Max RPM: ${MAX_RPM}, Max Gear: ${MAX_GEAR}
Press 'P' to pause/resume simulation, Ctrl+C to exit.

`.trimStart();

// 終了時のクリーンアップ処理
function cleanup(): void {
  if (process.stdout.isTTY) {
    process.stdout.write('\x1b[?25h'); // カーソルを表示に戻す
    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 0);
  }
  try {
    socket.close();
  } catch {
    // すでに閉じている場合は無視
  }
  process.exit(0);
}

// シグナル受信時の終了クリーンアップ
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// キーボード入力（Pキーでパケット送信の一時停止/再開）の設定
if (process.stdin.isTTY) {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on('keypress', (_str, key: readline.Key) => {
    if (key.ctrl && key.name === 'c') {
      cleanup();
    }
    if (key.name === 'p' || key.sequence === 'p' || key.sequence === 'P') {
      isPaused = !isPaused;
      if (process.stdout.isTTY) {
        readline.cursorTo(process.stdout, 0);
        readline.clearLine(process.stdout, 0);
        if (isPaused) {
          process.stdout.write(
            "[PAUSED] Simulation is paused. Press 'P' to resume...",
          );
        }
      }
    }
  });
}

process.stdout.write(header);

if (process.stdout.isTTY) {
  process.stdout.write('\x1b[?25l'); // カーソルを非表示化（高速更新時のチラツキ防止）
}

// メインループ
setInterval(() => {
  const now = performance.now();
  if (isPaused) {
    lastUpdateTime = now; // 一時停止解除後のdt飛びを防止
    return;
  }

  // 1. 実経過時間（秒）を計算してシミュレーション状態を更新
  const dt = (now - lastUpdateTime) / 1000;
  lastUpdateTime = now;
  updateCarState(state, dt);

  // 2. パケット生成と送信（30FPS超の高レートで送信）
  const packet: Buffer = buildTelemetryPacket(state);

  socket.send(packet, 0, packet.length, PORT, HOST, (err: Error | null) => {
    if (err) {
      console.error(`[UDP Send Error] ${err.message}`);
      process.exit(1);
    }
  });

  // 3. コンソール出力（間引いて描画負荷を低減）
  if (process.stdout.isTTY && now - lastConsoleRenderTime >= CONSOLE_RENDER_INTERVAL_MS) {
    lastConsoleRenderTime = now;

    const speedKmh: string = (state.speed * 3.6).toFixed(0);
    const currentRpm: string = state.rpm.toFixed(0);
    const gearChar: string = state.gear === 0 ? 'R' : state.gear.toString();
    const currentLapStr: string = state.currentLap.toFixed(1);

    const gXStr: string = (state.accelerationX / G_ACCELERATION).toFixed(2);
    const gZStr: string = (state.accelerationZ / G_ACCELERATION).toFixed(2);
    const headingDeg: string = (((state.yaw * 180) / Math.PI + 360) % 360).toFixed(0);
    const powerPsStr: string = (state.power / 735.49875).toFixed(0);
    const torqueNmStr: string = state.torque.toFixed(0);
    const classes = ['D', 'C', 'B', 'A', 'S1', 'S2', 'X'];
    const classLabel = classes[state.carClass] ?? '--';

    process.stdout.write(
      `\rSpec: ${classLabel.padStart(2, ' ')} ${state.carPerformanceIndex.toString().padStart(3, ' ')} | Gear: ${gearChar} | RPM: ${currentRpm.padStart(4, ' ')} | Speed: ${speedKmh.padStart(4, ' ')} km/h | Power: ${powerPsStr.padStart(4, ' ')} PS | Torque: ${torqueNmStr.padStart(4, ' ')} N·m | Yaw: ${headingDeg.padStart(3, ' ')}° | G: X:${gXStr.padStart(5, ' ')} Z:${gZStr.padStart(5, ' ')} | Lap: ${state.lapNumber} (${currentLapStr}s)`,
    );
  }
}, TELEMETRY_INTERVAL_MS);
