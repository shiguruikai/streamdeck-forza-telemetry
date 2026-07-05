import { Buffer } from "node:buffer";

export type ForzaTelemetryData = {
  /** レース中か否か (1 = レース中、0 = メニュー画面やレース停止中) */
  isRaceOn: number;
  /** タイムスタンプ (ミリ秒、時間経過により0にオーバーフローする可能性あり) */
  timestampMs: number;

  /** エンジンの最大RPM */
  engineMaxRpm: number;
  /** エンジンのアイドリングRPM */
  engineIdleRpm: number;
  /** 現在のエンジンRPM */
  currentEngineRpm: number;

  /** ローカル空間でのX軸(右方向)の加速度 */
  accelerationX: number;
  /** ローカル空間でのY軸(上方向)の加速度 */
  accelerationY: number;
  /** ローカル空間でのZ軸(前方向)の加速度 */
  accelerationZ: number;

  /** ローカル空間でのX軸(右方向)の速度 */
  velocityX: number;
  /** ローカル空間でのY軸(上方向)の速度 */
  velocityY: number;
  /** ローカル空間でのZ軸(前方向)の速度 */
  velocityZ: number;

  /** ローカル空間でのピッチ方向(X軸)の角速度 (rad/s) */
  angularVelocityX: number;
  /** ローカル空間でのヨー方向(Y軸)の角速度 (rad/s) */
  angularVelocityY: number;
  /** ローカル空間でのロール方向(Z軸)の角速度 (rad/s) */
  angularVelocityZ: number;

  /** 車両の向き: ヨー (ラジアン) */
  yaw: number;
  /** 車両の向き: ピッチ (ラジアン) */
  pitch: number;
  /** 車両の向き: ロール (ラジアン) */
  roll: number;

  /** 正規化されたサスペンションの移動量 (0.0 = 最大伸長、1.0 = 最大圧縮): 左前輪 */
  normalizedSuspensionTravelFrontLeft: number;
  /** 正規化されたサスペンションの移動量 (0.0 = 最大伸長、1.0 = 最大圧縮): 右前輪 */
  normalizedSuspensionTravelFrontRight: number;
  /** 正規化されたサスペンションの移動量 (0.0 = 最大伸長、1.0 = 最大圧縮): 左後輪 */
  normalizedSuspensionTravelRearLeft: number;
  /** 正規化されたサスペンションの移動量 (0.0 = 最大伸長、1.0 = 最大圧縮): 右後輪 */
  normalizedSuspensionTravelRearRight: number;

  /** 正規化されたタイヤのスリップ率 (0 = 100%グリップ、|比率| > 1.0 = グリップ喪失): 左前輪 */
  tireSlipRatioFrontLeft: number;
  /** 正規化されたタイヤのスリップ率 (0 = 100%グリップ、|比率| > 1.0 = グリップ喪失): 右前輪 */
  tireSlipRatioFrontRight: number;
  /** 正規化されたタイヤのスリップ率 (0 = 100%グリップ、|比率| > 1.0 = グリップ喪失): 左後輪 */
  tireSlipRatioRearLeft: number;
  /** 正規化されたタイヤのスリップ率 (0 = 100%グリップ、|比率| > 1.0 = グリップ喪失): 右後輪 */
  tireSlipRatioRearRight: number;

  /** ホイールの回転速度 (rad/s): 左前輪 */
  wheelRotationSpeedFrontLeft: number;
  /** ホイールの回転速度 (rad/s): 右前輪 */
  wheelRotationSpeedFrontRight: number;
  /** ホイールの回転速度 (rad/s): 左後輪 */
  wheelRotationSpeedRearLeft: number;
  /** ホイールの回転速度 (rad/s): 右後輪 */
  wheelRotationSpeedRearRight: number;

  /** ホイールが縁石に乗っているか (1 = 乗っている、0 = 乗っていない): 左前輪 */
  wheelOnRumbleStripFrontLeft: number;
  /** ホイールが縁石に乗っているか (1 = 乗っている、0 = 乗っていない): 右前輪 */
  wheelOnRumbleStripFrontRight: number;
  /** ホイールが縁石に乗っているか (1 = 乗っている、0 = 乗っていない): 左後輪 */
  wheelOnRumbleStripRearLeft: number;
  /** ホイールが縁石に乗っているか (1 = 乗っている、0 = 乗っていない): 右後輪 */
  wheelOnRumbleStripRearRight: number;

  /** ホイールが水たまりに入っているか (1 = 入っている、0 = 入っていない): 左前輪 */
  wheelInPuddleFrontLeft: number;
  /** ホイールが水たまりに入っているか (1 = 入っている、0 = 入っていない): 右前輪 */
  wheelInPuddleFrontRight: number;
  /** ホイールが水たまりに入っているか (1 = 入っている、0 = 入っていない): 左後輪 */
  wheelInPuddleRearLeft: number;
  /** ホイールが水たまりに入っているか (1 = 入っている、0 = 入っていない): 右後輪 */
  wheelInPuddleRearRight: number;

  /** コントローラーのフォースフィードバックに渡される無次元の路面振動値: 左前輪 */
  surfaceRumbleFrontLeft: number;
  /** コントローラーのフォースフィードバックに渡される無次元の路面振動値: 右前輪 */
  surfaceRumbleFrontRight: number;
  /** コントローラーのフォースフィードバックに渡される無次元の路面振動値: 左後輪 */
  surfaceRumbleRearLeft: number;
  /** コントローラーのフォースフィードバックに渡される無次元の路面振動値: 右後輪 */
  surfaceRumbleRearRight: number;

  /** 正規化されたタイヤのスリップ角 (0 = 100%グリップ、|角度| > 1.0 = グリップ喪失): 左前輪 */
  tireSlipAngleFrontLeft: number;
  /** 正規化されたタイヤのスリップ角 (0 = 100%グリップ、|角度| > 1.0 = グリップ喪失): 右前輪 */
  tireSlipAngleFrontRight: number;
  /** 正規化されたタイヤのスリップ角 (0 = 100%グリップ、|角度| > 1.0 = グリップ喪失): 左後輪 */
  tireSlipAngleRearLeft: number;
  /** 正規化されたタイヤのスリップ角 (0 = 100%グリップ、|角度| > 1.0 = グリップ喪失): 右後輪 */
  tireSlipAngleRearRight: number;

  /** 正規化されたタイヤの複合スリップ (0 = 100%グリップ、|スリップ| > 1.0 = グリップ喪失): 左前輪 */
  tireCombinedSlipFrontLeft: number;
  /** 正規化されたタイヤの複合スリップ (0 = 100%グリップ、|スリップ| > 1.0 = グリップ喪失): 右前輪 */
  tireCombinedSlipFrontRight: number;
  /** 正規化されたタイヤの複合スリップ (0 = 100%グリップ、|スリップ| > 1.0 = グリップ喪失): 左後輪 */
  tireCombinedSlipRearLeft: number;
  /** 正規化されたタイヤの複合スリップ (0 = 100%グリップ、|スリップ| > 1.0 = グリップ喪失): 右後輪 */
  tireCombinedSlipRearRight: number;

  /** 実際のサスペンション移動量 (メートル): 左前輪 */
  suspensionTravelMetersFrontLeft: number;
  /** 実際のサスペンション移動量 (メートル): 右前輪 */
  suspensionTravelMetersFrontRight: number;
  /** 実際のサスペンション移動量 (メートル): 左後輪 */
  suspensionTravelMetersRearLeft: number;
  /** 実際のサスペンション移動量 (メートル): 右後輪 */
  suspensionTravelMetersRearRight: number;

  /** 車両メーカー/モデルのユニークID */
  carOrdinal: number;
  /** 車両クラス (0: Dクラス[最低] ～ 7: Xクラス[最高]) */
  carClass: number;
  /** 車両のパフォーマンスインデックス (100[最低] ～ 999[最高]) */
  carPerformanceIndex: number;
  /** 駆動方式 (0 = FWD, 1 = RWD, 2 = AWD) */
  drivetrainType: number;
  /** エンジンのシリンダー数 */
  numCylinders: number;
  /** 車両グループ識別子 (FH6追加項目) */
  carGroup: number;

  /** 破壊可能なオブジェクトとの衝突による速度損失 (m/s) (FH6追加項目) */
  smashableVelDiff: number;
  /** 最近衝突した破壊可能なオブジェクトの質量 (kg) (FH6追加項目) */
  smashableMass: number;

  /** ワールド空間でのX座標 (メートル) */
  positionX: number;
  /** ワールド空間でのY座標 (メートル) */
  positionY: number;
  /** ワールド空間でのZ座標 (メートル) */
  positionZ: number;

  /** 速度 (m/s) */
  speed: number;
  /** 出力 (ワット) */
  power: number;
  /** トルク (ニュートンメートル) */
  torque: number;

  /** タイヤ温度: 左前輪 */
  tireTempFrontLeft: number;
  /** タイヤ温度: 右前輪 */
  tireTempFrontRight: number;
  /** タイヤ温度: 左後輪 */
  tireTempRearLeft: number;
  /** タイヤ温度: 右後輪 */
  tireTempRearRight: number;

  /** ターボ/スーパーチャージャーのブースト圧 (大気圧からの超過PSI) */
  boost: number;
  /** 燃料レベル (0.0 = 空、1.0 = 満タン) */
  fuel: number;
  /** 総走行距離 (メートル) */
  distanceTraveled: number;

  /** ベストラップタイム (秒)。該当しない場合は 0.0 */
  bestLap: number;
  /** 前回のラップタイム (秒)。該当しない場合は 0.0 */
  lastLap: number;
  /** 現在のラップタイム (秒)。該当しない場合は 0.0 */
  currentLap: number;
  /** 総レース時間 (運転開始からの秒数) */
  currentRaceTime: number;

  /** 完了したラップ数 */
  lapNumber: number;
  /** 現在のレース順位 */
  racePosition: number;

  /** アクセル入力値 (0 ～ 255) */
  accel: number;
  /** ブレーキ入力値 (0 ～ 255) */
  brake: number;
  /** クラッチ入力値 (0 ～ 255) */
  clutch: number;
  /** ハンドブレーキ入力値 (0 ～ 255) */
  handBrake: number;

  /** 現在のギア */
  gear: number;
  /** ステアリング入力値 (-127 = フルレフト、0 = センター、127 = フルライト) */
  steer: number;

  /** 正規化されたドライビングラインの位置 (-127 ～ 127) */
  normalizedDrivingLine: number;
  /** 正規化されたAIブレーキの差分 (-127 ～ 127) */
  normalizedAIBrakeDifference: number;
};

export function parseToForzaTelemetryData(buffer: Buffer): ForzaTelemetryData {
  if (buffer.length < 324) {
    throw new Error(
      `Invalid telemetry packet size. Expected at least 324 bytes, received ${buffer.length} bytes.`,
    );
  }

  let offset = 0;

  const readS32 = (): number => { const v = buffer.readInt32LE(offset); offset += 4; return v; };
  const readU32 = (): number => { const v = buffer.readUInt32LE(offset); offset += 4; return v; };
  const readF32 = (): number => { const v = buffer.readFloatLE(offset); offset += 4; return v; };
  const readU16 = (): number => { const v = buffer.readUInt16LE(offset); offset += 2; return v; };
  const readU8 = (): number => { const v = buffer.readUInt8(offset); offset += 1; return v; };
  const readS8 = (): number => { const v = buffer.readInt8(offset); offset += 1; return v; };

  return {
    isRaceOn: readS32(),                            // Offset: 0
    timestampMs: readU32(),                         // Offset: 4
    engineMaxRpm: readF32(),                        // Offset: 8
    engineIdleRpm: readF32(),                       // Offset: 12
    currentEngineRpm: readF32(),                    // Offset: 16
    accelerationX: readF32(),                       // Offset: 20
    accelerationY: readF32(),                       // Offset: 24
    accelerationZ: readF32(),                       // Offset: 28
    velocityX: readF32(),                           // Offset: 32
    velocityY: readF32(),                           // Offset: 36
    velocityZ: readF32(),                           // Offset: 40
    angularVelocityX: readF32(),                    // Offset: 44
    angularVelocityY: readF32(),                    // Offset: 48
    angularVelocityZ: readF32(),                    // Offset: 52
    yaw: readF32(),                                 // Offset: 56
    pitch: readF32(),                               // Offset: 60
    roll: readF32(),                                // Offset: 64
    normalizedSuspensionTravelFrontLeft: readF32(), // Offset: 68
    normalizedSuspensionTravelFrontRight: readF32(),// Offset: 72
    normalizedSuspensionTravelRearLeft: readF32(),  // Offset: 76
    normalizedSuspensionTravelRearRight: readF32(), // Offset: 80
    tireSlipRatioFrontLeft: readF32(),              // Offset: 84
    tireSlipRatioFrontRight: readF32(),             // Offset: 88
    tireSlipRatioRearLeft: readF32(),               // Offset: 92
    tireSlipRatioRearRight: readF32(),              // Offset: 96
    wheelRotationSpeedFrontLeft: readF32(),         // Offset: 100
    wheelRotationSpeedFrontRight: readF32(),        // Offset: 104
    wheelRotationSpeedRearLeft: readF32(),          // Offset: 108
    wheelRotationSpeedRearRight: readF32(),         // Offset: 112
    wheelOnRumbleStripFrontLeft: readS32(),         // Offset: 116
    wheelOnRumbleStripFrontRight: readS32(),        // Offset: 120
    wheelOnRumbleStripRearLeft: readS32(),          // Offset: 124
    wheelOnRumbleStripRearRight: readS32(),         // Offset: 128
    wheelInPuddleFrontLeft: readS32(),              // Offset: 132
    wheelInPuddleFrontRight: readS32(),             // Offset: 136
    wheelInPuddleRearLeft: readS32(),               // Offset: 140
    wheelInPuddleRearRight: readS32(),              // Offset: 144
    surfaceRumbleFrontLeft: readF32(),              // Offset: 148
    surfaceRumbleFrontRight: readF32(),             // Offset: 152
    surfaceRumbleRearLeft: readF32(),               // Offset: 156
    surfaceRumbleRearRight: readF32(),              // Offset: 160
    tireSlipAngleFrontLeft: readF32(),              // Offset: 164
    tireSlipAngleFrontRight: readF32(),             // Offset: 168
    tireSlipAngleRearLeft: readF32(),               // Offset: 172
    tireSlipAngleRearRight: readF32(),              // Offset: 176
    tireCombinedSlipFrontLeft: readF32(),           // Offset: 180
    tireCombinedSlipFrontRight: readF32(),          // Offset: 184
    tireCombinedSlipRearLeft: readF32(),            // Offset: 188
    tireCombinedSlipRearRight: readF32(),           // Offset: 192
    suspensionTravelMetersFrontLeft: readF32(),     // Offset: 196
    suspensionTravelMetersFrontRight: readF32(),    // Offset: 200
    suspensionTravelMetersRearLeft: readF32(),      // Offset: 204
    suspensionTravelMetersRearRight: readF32(),     // Offset: 208
    carOrdinal: readS32(),                          // Offset: 212
    carClass: readS32(),                            // Offset: 216
    carPerformanceIndex: readS32(),                 // Offset: 220
    drivetrainType: readS32(),                      // Offset: 224
    numCylinders: readS32(),                        // Offset: 228
    carGroup: readU32(),                            // Offset: 232
    smashableVelDiff: readF32(),                    // Offset: 236
    smashableMass: readF32(),                       // Offset: 240
    positionX: readF32(),                           // Offset: 244
    positionY: readF32(),                           // Offset: 248
    positionZ: readF32(),                           // Offset: 252
    speed: readF32(),                               // Offset: 256
    power: readF32(),                               // Offset: 260
    torque: readF32(),                              // Offset: 264
    tireTempFrontLeft: readF32(),                   // Offset: 268
    tireTempFrontRight: readF32(),                  // Offset: 272
    tireTempRearLeft: readF32(),                    // Offset: 276
    tireTempRearRight: readF32(),                   // Offset: 280
    boost: readF32(),                               // Offset: 284
    fuel: readF32(),                                // Offset: 288
    distanceTraveled: readF32(),                    // Offset: 292
    bestLap: readF32(),                             // Offset: 296
    lastLap: readF32(),                             // Offset: 300
    currentLap: readF32(),                          // Offset: 304
    currentRaceTime: readF32(),                     // Offset: 308
    lapNumber: readU16(),                           // Offset: 312
    racePosition: readU8(),                         // Offset: 314
    accel: readU8(),                                // Offset: 315
    brake: readU8(),                                // Offset: 316
    clutch: readU8(),                               // Offset: 317
    handBrake: readU8(),                            // Offset: 318
    gear: readU8(),                                 // Offset: 319
    steer: readS8(),                                // Offset: 320
    normalizedDrivingLine: readS8(),                // Offset: 321
    normalizedAIBrakeDifference: readS8(),          // Offset: 322
  };
}
