import { Buffer } from 'node:buffer';
import { isNativeError } from 'node:util/types';

export type BaseForzaTelemetryData = {
  /** レース中か否か（1＝レース中、0＝メニュー画面やレース停止中） */
  isRaceOn: number;
  /** タイムスタンプ（ミリ秒、時間経過により0にオーバーフローする可能性あり） */
  timestampMs: number;

  /** エンジンの最大RPM */
  engineMaxRpm: number;
  /** エンジンのアイドリングRPM */
  engineIdleRpm: number;
  /** 現在のエンジンRPM */
  currentEngineRpm: number;

  /** ローカル空間でのX軸（右方向）の加速度 */
  accelerationX: number;
  /** ローカル空間でのY軸（上方向）の加速度 */
  accelerationY: number;
  /** ローカル空間でのZ軸（前方向）の加速度 */
  accelerationZ: number;

  /** ローカル空間でのX軸（右方向）の速度 */
  velocityX: number;
  /** ローカル空間でのY軸（上方向）の速度 */
  velocityY: number;
  /** ローカル空間でのZ軸（前方向）の速度 */
  velocityZ: number;

  /** ローカル空間でのピッチ方向（X軸）の角速度（rad/s） */
  angularVelocityX: number;
  /** ローカル空間でのヨー方向（Y軸）の角速度（rad/s） */
  angularVelocityY: number;
  /** ローカル空間でのロール方向（Z軸）の角速度（rad/s） */
  angularVelocityZ: number;

  /** 車両の向き: ヨー（ラジアン） */
  yaw: number;
  /** 車両の向き: ピッチ（ラジアン） */
  pitch: number;
  /** 車両の向き: ロール（ラジアン） */
  roll: number;

  /** 正規化されたサスペンションの移動量（0.0＝最大伸長、1.0＝最大圧縮）: 左前輪 */
  normalizedSuspensionTravelFrontLeft: number;
  /** 正規化されたサスペンションの移動量（0.0＝最大伸長、1.0＝最大圧縮）: 右前輪 */
  normalizedSuspensionTravelFrontRight: number;
  /** 正規化されたサスペンションの移動量（0.0＝最大伸長、1.0＝最大圧縮）: 左後輪 */
  normalizedSuspensionTravelRearLeft: number;
  /** 正規化されたサスペンションの移動量（0.0＝最大伸長、1.0＝最大圧縮）: 右後輪 */
  normalizedSuspensionTravelRearRight: number;

  /** 正規化されたタイヤのスリップ率（0＝100%グリップ、|比率|>1.0＝グリップ喪失）: 左前輪 */
  tireSlipRatioFrontLeft: number;
  /** 正規化されたタイヤのスリップ率（0＝100%グリップ、|比率|>1.0＝グリップ喪失）: 右前輪 */
  tireSlipRatioFrontRight: number;
  /** 正規化されたタイヤのスリップ率（0＝100%グリップ、|比率|>1.0＝グリップ喪失）: 左後輪 */
  tireSlipRatioRearLeft: number;
  /** 正規化されたタイヤのスリップ率（0＝100%グリップ、|比率|>1.0＝グリップ喪失）: 右後輪 */
  tireSlipRatioRearRight: number;

  /** ホイールの回転速度（rad/s）: 左前輪 */
  wheelRotationSpeedFrontLeft: number;
  /** ホイールの回転速度（rad/s）: 右前輪 */
  wheelRotationSpeedFrontRight: number;
  /** ホイールの回転速度（rad/s）: 左後輪 */
  wheelRotationSpeedRearLeft: number;
  /** ホイールの回転速度（rad/s）: 右後輪 */
  wheelRotationSpeedRearRight: number;

  /** ホイールが縁石に乗っているか（1＝乗っている、0＝乗っていない）: 左前輪 */
  wheelOnRumbleStripFrontLeft: number;
  /** ホイールが縁石に乗っているか（1＝乗っている、0＝乗っていない）: 右前輪 */
  wheelOnRumbleStripFrontRight: number;
  /** ホイールが縁石に乗っているか（1＝乗っている、0＝乗っていない）: 左後輪 */
  wheelOnRumbleStripRearLeft: number;
  /** ホイールが縁石に乗っているか（1＝乗っている、0＝乗っていない）: 右後輪 */
  wheelOnRumbleStripRearRight: number;

  /** ホイールが水たまりに入っているか（1＝入っている、0＝入っていない）: 左前輪 */
  wheelInPuddleFrontLeft: number;
  /** ホイールが水たまりに入っているか（1＝入っている、0＝入っていない）: 右前輪 */
  wheelInPuddleFrontRight: number;
  /** ホイールが水たまりに入っているか（1＝入っている、0＝入っていない）: 左後輪 */
  wheelInPuddleRearLeft: number;
  /** ホイールが水たまりに入っているか（1＝入っている、0＝入っていない）: 右後輪 */
  wheelInPuddleRearRight: number;

  /** コントローラーのフォースフィードバックに渡される無次元の路面振動値: 左前輪 */
  surfaceRumbleFrontLeft: number;
  /** コントローラーのフォースフィードバックに渡される無次元の路面振動値: 右前輪 */
  surfaceRumbleFrontRight: number;
  /** コントローラーのフォースフィードバックに渡される無次元の路面振動値: 左後輪 */
  surfaceRumbleRearLeft: number;
  /** コントローラーのフォースフィードバックに渡される無次元の路面振動値: 右後輪 */
  surfaceRumbleRearRight: number;

  /** 正規化されたタイヤのスリップ角（0＝100%グリップ、|角度|>1.0＝グリップ喪失）: 左前輪 */
  tireSlipAngleFrontLeft: number;
  /** 正規化されたタイヤのスリップ角（0＝100%グリップ、|角度|>1.0＝グリップ喪失）: 右前輪 */
  tireSlipAngleFrontRight: number;
  /** 正規化されたタイヤのスリップ角（0＝100%グリップ、|角度|>1.0＝グリップ喪失）: 左後輪 */
  tireSlipAngleRearLeft: number;
  /** 正規化されたタイヤのスリップ角（0＝100%グリップ、|角度|>1.0＝グリップ喪失）: 右後輪 */
  tireSlipAngleRearRight: number;

  /** 正規化されたタイヤの複合スリップ（0＝100%グリップ、|スリップ|>1.0＝グリップ喪失）: 左前輪 */
  tireCombinedSlipFrontLeft: number;
  /** 正規化されたタイヤの複合スリップ（0＝100%グリップ、|スリップ|>1.0＝グリップ喪失）: 右前輪 */
  tireCombinedSlipFrontRight: number;
  /** 正規化されたタイヤの複合スリップ（0＝100%グリップ、|スリップ|>1.0＝グリップ喪失）: 左後輪 */
  tireCombinedSlipRearLeft: number;
  /** 正規化されたタイヤの複合スリップ（0＝100%グリップ、|スリップ|>1.0＝グリップ喪失）: 右後輪 */
  tireCombinedSlipRearRight: number;

  /** 実際のサスペンション移動量（メートル）: 左前輪 */
  suspensionTravelMetersFrontLeft: number;
  /** 実際のサスペンション移動量（メートル）: 右前輪 */
  suspensionTravelMetersFrontRight: number;
  /** 実際のサスペンション移動量（メートル）: 左後輪 */
  suspensionTravelMetersRearLeft: number;
  /** 実際のサスペンション移動量（メートル）: 右後輪 */
  suspensionTravelMetersRearRight: number;

  /** 車両メーカー/モデルのユニークID */
  carOrdinal: number;
  /** 車両クラス（0: Dクラス［最低］～7: Xクラス［最高］） */
  carClass: number;
  /** 車両のパフォーマンスインデックス（100［最低］～999［最高］） */
  carPerformanceIndex: number;
  /** 駆動方式（0＝FWD、1＝RWD、2＝AWD） */
  drivetrainType: number;
  /** エンジンのシリンダー数 */
  numCylinders: number;
};

export type ForzaHorizonTelemetryData = BaseForzaTelemetryData & {
  /** ゲーム識別子: horizon */
  game: 'horizon';

  /** 車両グループ識別子 */
  carGroup: number;
  /** 破壊可能なオブジェクトとの衝突による速度損失（m/s） */
  smashableVelDiff: number;
  /** 最近衝突した破壊可能なオブジェクトの質量（kg） */
  smashableMass: number;

  /** ワールド空間でのX座標（メートル） */
  positionX: number;
  /** ワールド空間でのY座標（メートル） */
  positionY: number;
  /** ワールド空間でのZ座標（メートル） */
  positionZ: number;
  /** 速度（m/s） */
  speed: number;
  /** 出力（ワット） */
  power: number;
  /** トルク（ニュートンメートル） */
  torque: number;
  /** タイヤ温度: 左前輪 */
  tireTempFrontLeft: number;
  /** タイヤ温度: 右前輪 */
  tireTempFrontRight: number;
  /** タイヤ温度: 左後輪 */
  tireTempRearLeft: number;
  /** タイヤ温度: 右後輪 */
  tireTempRearRight: number;
  /** ターボ/スーパーチャージャーのブースト圧（大気圧からの超過PSI） */
  boost: number;
  /** 燃料レベル（0.0＝空、1.0＝満タン） */
  fuel: number;
  /** 総走行距離（メートル） */
  distanceTraveled: number;
  /** ベストラップタイム（秒）。該当しない場合は 0.0 */
  bestLap: number;
  /** 前回のラップタイム（秒）。該当しない場合は 0.0 */
  lastLap: number;
  /** 現在のラップタイム（秒）。該当しない場合は 0.0 */
  currentLap: number;
  /** 総レース時間（運転開始からの秒数） */
  currentRaceTime: number;
  /** 完了したラップ数 */
  lapNumber: number;
  /** 現在のレース順位 */
  racePosition: number;
  /** アクセル入力値（0～255） */
  accel: number;
  /** ブレーキ入力値（0～255） */
  brake: number;
  /** クラッチ入力値（0～255） */
  clutch: number;
  /** ハンドブレーキ入力値（0～255） */
  handBrake: number;
  /** 現在のギア */
  gear: number;
  /** ステアリング入力値（-127＝フルレフト、0＝センター、127＝フルライト） */
  steer: number;
  /** 正規化されたドライビングラインの位置（-127～127） */
  normalizedDrivingLine: number;
  /** 正規化されたAIブレーキの差分（-127～127） */
  normalizedAIBrakeDifference: number;
};

export type ForzaMotorsportTelemetryData = BaseForzaTelemetryData & {
  /** ゲーム識別子: motorsport */
  game: 'motorsport';

  /** ワールド空間でのX座標（メートル） */
  positionX: number;
  /** ワールド空間でのY座標（メートル） */
  positionY: number;
  /** ワールド空間でのZ座標（メートル） */
  positionZ: number;
  /** 速度（m/s） */
  speed: number;
  /** 出力（ワット） */
  power: number;
  /** トルク（ニュートンメートル） */
  torque: number;
  /** タイヤ温度: 左前輪 */
  tireTempFrontLeft: number;
  /** タイヤ温度: 右前輪 */
  tireTempFrontRight: number;
  /** タイヤ温度: 左後輪 */
  tireTempRearLeft: number;
  /** タイヤ温度: 右後輪 */
  tireTempRearRight: number;
  /** ターボ/スーパーチャージャーのブースト圧（大気圧からの超過PSI） */
  boost: number;
  /** 燃料レベル（0.0＝空、1.0＝満タン） */
  fuel: number;
  /** 総走行距離（メートル） */
  distanceTraveled: number;
  /** ベストラップタイム（秒）。該当しない場合は 0.0 */
  bestLap: number;
  /** 前回のラップタイム（秒）。該当しない場合は 0.0 */
  lastLap: number;
  /** 現在のラップタイム（秒）。該当しない場合は 0.0 */
  currentLap: number;
  /** 総レース時間（運転開始からの秒数） */
  currentRaceTime: number;
  /** 完了したラップ数 */
  lapNumber: number;
  /** 現在のレース順位 */
  racePosition: number;
  /** アクセル入力値（0～255） */
  accel: number;
  /** ブレーキ入力値（0～255） */
  brake: number;
  /** クラッチ入力値（0～255） */
  clutch: number;
  /** ハンドブレーキ入力値（0～255） */
  handBrake: number;
  /** 現在のギア */
  gear: number;
  /** ステアリング入力値（-127＝フルレフト、0＝センター、127＝フルライト） */
  steer: number;
  /** 正規化されたドライビングラインの位置（-127～127） */
  normalizedDrivingLine: number;
  /** 正規化されたAIブレーキの差分（-127～127） */
  normalizedAIBrakeDifference: number;

  /** タイヤ摩耗度: 左前輪 */
  tireWearFrontLeft: number;
  /** タイヤ摩耗度: 右前輪 */
  tireWearFrontRight: number;
  /** タイヤ摩耗度: 左後輪 */
  tireWearRearLeft: number;
  /** タイヤ摩耗度: 右後輪 */
  tireWearRearRight: number;
  /** トラックID */
  trackOrdinal: number;
};

export type ForzaTelemetryData = ForzaHorizonTelemetryData | ForzaMotorsportTelemetryData;

export class UnsupportedPacketSizeError extends Error {
  constructor(public readonly size: number) {
    super(`Unsupported telemetry packet size: ${size} bytes.`);
    this.name = 'UnsupportedPacketSizeError';
  }
}

export class SledFormatNotSupportedError extends Error {
  constructor() {
    super("Sled format is not supported. Please change the UDP Packet Format to 'Dash' in game settings.");
    this.name = 'SledFormatNotSupportedError';
  }
}

export class TelemetryParseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'TelemetryParseError';
    Error.captureStackTrace(this, this.constructor);
  }
}

type ParseContext = { offset: number };

/* eslint @stylistic/max-statements-per-line: "off" */
const readS32 = (buffer: Buffer, ctx: ParseContext): number => { const v = buffer.readInt32LE(ctx.offset); ctx.offset += 4; return v; };
const readU32 = (buffer: Buffer, ctx: ParseContext): number => { const v = buffer.readUInt32LE(ctx.offset); ctx.offset += 4; return v; };
const readF32 = (buffer: Buffer, ctx: ParseContext): number => { const v = buffer.readFloatLE(ctx.offset); ctx.offset += 4; return v; };
const readU16 = (buffer: Buffer, ctx: ParseContext): number => { const v = buffer.readUInt16LE(ctx.offset); ctx.offset += 2; return v; };
const readU8 = (buffer: Buffer, ctx: ParseContext): number => { const v = buffer.readUInt8(ctx.offset); ctx.offset += 1; return v; };
const readS8 = (buffer: Buffer, ctx: ParseContext): number => { const v = buffer.readInt8(ctx.offset); ctx.offset += 1; return v; };

export function parseToForzaTelemetryData(buffer: Buffer): ForzaTelemetryData {
  const size = buffer.length;

  if (size === 232) {
    throw new SledFormatNotSupportedError();
  }

  if (size !== 324 && size !== 331 && size !== 311) {
    throw new UnsupportedPacketSizeError(size);
  }

  try {
    const ctx: ParseContext = { offset: 0 };

    // Sledデータ領域（0〜228バイト）は共通
    const baseData = {
      isRaceOn: readS32(buffer, ctx), // Offset: 0
      timestampMs: readU32(buffer, ctx), // Offset: 4
      engineMaxRpm: readF32(buffer, ctx), // Offset: 8
      engineIdleRpm: readF32(buffer, ctx), // Offset: 12
      currentEngineRpm: readF32(buffer, ctx), // Offset: 16
      accelerationX: readF32(buffer, ctx), // Offset: 20
      accelerationY: readF32(buffer, ctx), // Offset: 24
      accelerationZ: readF32(buffer, ctx), // Offset: 28
      velocityX: readF32(buffer, ctx), // Offset: 32
      velocityY: readF32(buffer, ctx), // Offset: 36
      velocityZ: readF32(buffer, ctx), // Offset: 40
      angularVelocityX: readF32(buffer, ctx), // Offset: 44
      angularVelocityY: readF32(buffer, ctx), // Offset: 48
      angularVelocityZ: readF32(buffer, ctx), // Offset: 52
      yaw: readF32(buffer, ctx), // Offset: 56
      pitch: readF32(buffer, ctx), // Offset: 60
      roll: readF32(buffer, ctx), // Offset: 64
      normalizedSuspensionTravelFrontLeft: readF32(buffer, ctx), // Offset: 68
      normalizedSuspensionTravelFrontRight: readF32(buffer, ctx), // Offset: 72
      normalizedSuspensionTravelRearLeft: readF32(buffer, ctx), // Offset: 76
      normalizedSuspensionTravelRearRight: readF32(buffer, ctx), // Offset: 80
      tireSlipRatioFrontLeft: readF32(buffer, ctx), // Offset: 84
      tireSlipRatioFrontRight: readF32(buffer, ctx), // Offset: 88
      tireSlipRatioRearLeft: readF32(buffer, ctx), // Offset: 92
      tireSlipRatioRearRight: readF32(buffer, ctx), // Offset: 96
      wheelRotationSpeedFrontLeft: readF32(buffer, ctx), // Offset: 100
      wheelRotationSpeedFrontRight: readF32(buffer, ctx), // Offset: 104
      wheelRotationSpeedRearLeft: readF32(buffer, ctx), // Offset: 108
      wheelRotationSpeedRearRight: readF32(buffer, ctx), // Offset: 112
      wheelOnRumbleStripFrontLeft: readS32(buffer, ctx), // Offset: 116
      wheelOnRumbleStripFrontRight: readS32(buffer, ctx), // Offset: 120
      wheelOnRumbleStripRearLeft: readS32(buffer, ctx), // Offset: 124
      wheelOnRumbleStripRearRight: readS32(buffer, ctx), // Offset: 128
      wheelInPuddleFrontLeft: readS32(buffer, ctx), // Offset: 132
      wheelInPuddleFrontRight: readS32(buffer, ctx), // Offset: 136
      wheelInPuddleRearLeft: readS32(buffer, ctx), // Offset: 140
      wheelInPuddleRearRight: readS32(buffer, ctx), // Offset: 144
      surfaceRumbleFrontLeft: readF32(buffer, ctx), // Offset: 148
      surfaceRumbleFrontRight: readF32(buffer, ctx), // Offset: 152
      surfaceRumbleRearLeft: readF32(buffer, ctx), // Offset: 156
      surfaceRumbleRearRight: readF32(buffer, ctx), // Offset: 160
      tireSlipAngleFrontLeft: readF32(buffer, ctx), // Offset: 164
      tireSlipAngleFrontRight: readF32(buffer, ctx), // Offset: 168
      tireSlipAngleRearLeft: readF32(buffer, ctx), // Offset: 172
      tireSlipAngleRearRight: readF32(buffer, ctx), // Offset: 176
      tireCombinedSlipFrontLeft: readF32(buffer, ctx), // Offset: 180
      tireCombinedSlipFrontRight: readF32(buffer, ctx), // Offset: 184
      tireCombinedSlipRearLeft: readF32(buffer, ctx), // Offset: 188
      tireCombinedSlipRearRight: readF32(buffer, ctx), // Offset: 192
      suspensionTravelMetersFrontLeft: readF32(buffer, ctx), // Offset: 196
      suspensionTravelMetersFrontRight: readF32(buffer, ctx), // Offset: 200
      suspensionTravelMetersRearLeft: readF32(buffer, ctx), // Offset: 204
      suspensionTravelMetersRearRight: readF32(buffer, ctx), // Offset: 208
      carOrdinal: readS32(buffer, ctx), // Offset: 212
      carClass: readS32(buffer, ctx), // Offset: 216
      carPerformanceIndex: readS32(buffer, ctx), // Offset: 220
      drivetrainType: readS32(buffer, ctx), // Offset: 224
      numCylinders: readS32(buffer, ctx), // Offset: 228
    };

    if (size === 324) {
      // Horizon 形式（FH4 / FH5 / FH6）
      const carGroup = readU32(buffer, ctx); // Offset: 232
      const smashableVelDiff = readF32(buffer, ctx); // Offset: 236
      const smashableMass = readF32(buffer, ctx); // Offset: 240

      return {
        ...baseData,
        game: 'horizon',
        carGroup,
        smashableVelDiff,
        smashableMass,
        positionX: readF32(buffer, ctx), // Offset: 244
        positionY: readF32(buffer, ctx), // Offset: 248
        positionZ: readF32(buffer, ctx), // Offset: 252
        speed: readF32(buffer, ctx), // Offset: 256
        power: readF32(buffer, ctx), // Offset: 260
        torque: readF32(buffer, ctx), // Offset: 264
        tireTempFrontLeft: readF32(buffer, ctx), // Offset: 268
        tireTempFrontRight: readF32(buffer, ctx), // Offset: 272
        tireTempRearLeft: readF32(buffer, ctx), // Offset: 276
        tireTempRearRight: readF32(buffer, ctx), // Offset: 280
        boost: readF32(buffer, ctx), // Offset: 284
        fuel: readF32(buffer, ctx), // Offset: 288
        distanceTraveled: readF32(buffer, ctx), // Offset: 292
        bestLap: readF32(buffer, ctx), // Offset: 296
        lastLap: readF32(buffer, ctx), // Offset: 300
        currentLap: readF32(buffer, ctx), // Offset: 304
        currentRaceTime: readF32(buffer, ctx), // Offset: 308
        lapNumber: readU16(buffer, ctx), // Offset: 312
        racePosition: readU8(buffer, ctx), // Offset: 314
        accel: readU8(buffer, ctx), // Offset: 315
        brake: readU8(buffer, ctx), // Offset: 316
        clutch: readU8(buffer, ctx), // Offset: 317
        handBrake: readU8(buffer, ctx), // Offset: 318
        gear: readU8(buffer, ctx), // Offset: 319
        steer: readS8(buffer, ctx), // Offset: 320
        normalizedDrivingLine: readS8(buffer, ctx), // Offset: 321
        normalizedAIBrakeDifference: readS8(buffer, ctx), // Offset: 322
      };
    } else {
      // Motorsport 形式（FM7: 311バイト / FM8: 331バイト）
      // Motorsport形式ではHorizon形式の12バイトの追加項目（carGroup, smashableVelDiff, smashableMass）が存在しないため、PositionXはOffset 232から開始する
      const positionX = readF32(buffer, ctx); // Offset: 232
      const positionY = readF32(buffer, ctx); // Offset: 236
      const positionZ = readF32(buffer, ctx); // Offset: 240
      const speed = readF32(buffer, ctx); // Offset: 244
      const power = readF32(buffer, ctx); // Offset: 248
      const torque = readF32(buffer, ctx); // Offset: 252
      const tireTempFrontLeft = readF32(buffer, ctx); // Offset: 256
      const tireTempFrontRight = readF32(buffer, ctx); // Offset: 260
      const tireTempRearLeft = readF32(buffer, ctx); // Offset: 264
      const tireTempRearRight = readF32(buffer, ctx); // Offset: 268
      const boost = readF32(buffer, ctx); // Offset: 272
      const fuel = readF32(buffer, ctx); // Offset: 276
      const distanceTraveled = readF32(buffer, ctx); // Offset: 280
      const bestLap = readF32(buffer, ctx); // Offset: 284
      const lastLap = readF32(buffer, ctx); // Offset: 288
      const currentLap = readF32(buffer, ctx); // Offset: 292
      const currentRaceTime = readF32(buffer, ctx); // Offset: 296
      const lapNumber = readU16(buffer, ctx); // Offset: 300
      const racePosition = readU8(buffer, ctx); // Offset: 302
      const accel = readU8(buffer, ctx); // Offset: 303
      const brake = readU8(buffer, ctx); // Offset: 304
      const clutch = readU8(buffer, ctx); // Offset: 305
      const handBrake = readU8(buffer, ctx); // Offset: 306
      const gear = readU8(buffer, ctx); // Offset: 307
      const steer = readS8(buffer, ctx); // Offset: 308
      const normalizedDrivingLine = readS8(buffer, ctx); // Offset: 309
      const normalizedAIBrakeDifference = readS8(buffer, ctx); // Offset: 310

      // FM8固有の末尾追加項目（311バイトのFM7形式の場合はデフォルト値 0）
      let tireWearFrontLeft = 0;
      let tireWearFrontRight = 0;
      let tireWearRearLeft = 0;
      let tireWearRearRight = 0;
      let trackOrdinal = 0;

      if (size === 331) {
        tireWearFrontLeft = readF32(buffer, ctx); // Offset: 311
        tireWearFrontRight = readF32(buffer, ctx); // Offset: 315
        tireWearRearLeft = readF32(buffer, ctx); // Offset: 319
        tireWearRearRight = readF32(buffer, ctx); // Offset: 323
        trackOrdinal = readS32(buffer, ctx); // Offset: 327
      }

      return {
        ...baseData,
        game: 'motorsport',
        positionX,
        positionY,
        positionZ,
        speed,
        power,
        torque,
        tireTempFrontLeft,
        tireTempFrontRight,
        tireTempRearLeft,
        tireTempRearRight,
        boost,
        fuel,
        distanceTraveled,
        bestLap,
        lastLap,
        currentLap,
        currentRaceTime,
        lapNumber,
        racePosition,
        accel,
        brake,
        clutch,
        handBrake,
        gear,
        steer,
        normalizedDrivingLine,
        normalizedAIBrakeDifference,
        tireWearFrontLeft,
        tireWearFrontRight,
        tireWearRearLeft,
        tireWearRearRight,
        trackOrdinal,
      };
    }
  } catch (error) {
    const errMsg = isNativeError(error) ? error.message : String(error);
    throw new TelemetryParseError(`Failed to parse telemetry data: ${errMsg}`, { cause: error });
  }
}
