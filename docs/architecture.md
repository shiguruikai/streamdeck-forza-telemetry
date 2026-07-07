---
type: Reference
title: プラグインの機能とアーキテクチャ
description: Forza Horizonのテレメトリデータを表示するStream Deckプラグインの機能仕様およびシステム設計解説書
tags: [architecture, design, streamdeck]
timestamp: 2026-07-07T23:45:00+09:00
---

# Forza Telemetry Stream Deck プラグイン 機能・アーキテクチャ設計書

本ドキュメントは、Forza Horizonのテレメトリデータ（"Data Out"）を受信し、Elgato Stream Deck +に表示するプラグインの機能仕様およびシステム設計（アーキテクチャ）について解説します。

---

## 1. アクション機能仕様（ユーザーインターフェースレイヤー）

本プラグインでは、液晶キー用の Keypad デバイスと、ダイヤルおよびタッチスクリーン用の Encoder デバイスの特性を活かした5つのアクションを提供します。

### 1.1 速度計（Speed Meter）

* **ファイル**: [speed-meter.ts](../src/actions/speed-meter.ts)
* **デバイス割り当て**: Encoder（ダイヤル）専用アクション
* **表示項目・描画ロジック**：
  * **デジタル速度表示**：液晶ディスプレイの右側に 55pt の巨大デジタルフォントで表示。プロパティインスペクタの設定で「KM/H」と「MPH」の切り替えが可能。
  * **現在のギア表示**：画面左側に緑色の円枠とギア文字（R、1、2...）で大きく描画。Forza Horizon 6の実車仕様（0 = Reverse、1 = 1速、2 = 2速...）に適合。
  * **RPMレベルバー**：ディスプレイ下部（Y: 80〜95）に配置。現在のRPM割合（0〜100%）を表示し、70%以上で黄、85%以上で赤（レブリミット）に自動変化。
* **UI安定化設計（チャタリング防止）**：
  * シフトチェンジ時の瞬間的なギア抜け値（値 11）を無効値（null）として検知し、直前の有効なギア表示を維持することで、画面の不快なチラつきを防止。

### 1.2 ラップタイム（Lap Time）

* **ファイル**: [lap-time.ts](../src/actions/lap-time.ts)
* **デバイス割り当て**: Encoder（ダイヤル）専用アクション
* **表示項目・描画ロジック**：
  * **LAP情報・順位**：画面上部に現在のラップ（値 `lapNumber + 1`）と順位（`racePosition`）を表示。
  * **現在ラップタイム**：中央に現在のラップタイムを「分:秒.ミリ秒」形式で大きく描画。
  * **比較用ラップタイム**：下部に比較対象（自己ベストまたは前周ラップタイム）を表示。
* **インタラクション**：
  * ダイヤルプッシュまたは液晶ディスプレイタップにより、比較対象を「BEST（自己ベストラップ）」と「LAST（前周のラップタイム）」で交互に切り替え。
* **ステート（キャッシュ）維持設計**：
  * 画面切り替え（WillAppear / WillDisappear）時も直前のデータを破棄せず、ベースクラス内でキャッシュとして保持し、画面復帰時に即座に再現。

### 1.3 Gフォースメーター（G-Force Meter）

* **ファイル**: [g-force.ts](../src/actions/g-force.ts)
* **デバイス割り当て**: Keypad（液晶キー）および Encoder（ダイヤル）の両方にハイブリッド対応
* **表示項目・描画ロジック**：
  * **Gボールプロット**：中央のガイドライン（十字破線と円）に対し、前後左右の慣性Gフォースを赤いドット（Gボール）でプロット。最大スケール超過時は境界線上に自動クランプ。
  * **ピークGドット**：発生した最大合成Gの位置を半透明の黄色いドットとして維持。
  * **G値の数値表示**：液晶ディスプレイ（Encoder）のみ、最大合成G（黄）と現在合成G（白）をリアルタイムに描画。
  * **スケール表示**：液晶ディスプレイのみ、左下に現在の表示スケール上限（例：「2.0G」）を表示。
* **インタラクション**：
  * [PressDurationAction](../src/actions/press-duration.ts#L16)基底クラスを活用し、キーとダイヤルの押し下げイベントを共通ハンドリング。
  * **短押し（キー押下 / ダイヤルプッシュ）**：表示スケールを切り替え（1.0G / 2.0G / 3.0G）。
  * **長押し（キー押下 / ダイヤルプッシュ、500ms判定）**：ピークG値をリセット。リセット成功時は、画面中央に「RESET」（緑）を一時表示。
* **ステート（キャッシュ）維持設計**：
  * 画面切り替え時もピークGデータを破棄せず維持。

### 1.4 タイヤ温度（Tire Temperature）

* **ファイル**: [tire-temp.ts](../src/actions/tire-temp.ts)
* **デバイス割り当て**: Keypad（液晶キー）および Encoder（ダイヤル）の両方にハイブリッド対応
* **表示項目・描画ロジック**：
  * **全輪表示（All）**：中央に簡易的な車両シルエットを配置し、四隅のタイヤの隣にリアルタイム温度を表示。温度に応じてタイヤ色を変化（青：60°C未満、緑：60〜90°C、赤：90°C超）。タイヤは物理的な幅に対して `radius = 0.4` を指定し、角を丸めて描画。
  * **単一表示（FL/FR/RL/RR）**：液晶キーなどの狭い画面向けに、選択した特定のタイヤ位置と温度のみを表示。
* **インタラクションと設定**：
  * **短押し（キー押下 / ダイヤルプッシュ）**：表示単位を摂氏（°C）と華氏（°F）で切り替え（長押し機能は使用しないため、[TelemetryAction](../src/actions/telemetry-action.ts#L15)を直接継承）。
  * **プロパティインスペクタ（設定画面）**：[ui/tire-temp.html](../com.github.shiguruikai.streamdeck-forza-telemetry.sdPlugin/ui/tire-temp.html)を通じて、表示位置（All / FL / FR / RL / RR）および表示単位を保存。

### 1.5 サスペンション移動量（Suspension Travel）

* **ファイル**: [suspension-travel.ts](../src/actions/suspension-travel.ts)
* **デバイス割り当て**: Keypad（液晶キー）および Encoder（ダイヤル）の両方にハイブリッド対応
* **表示項目・描画ロジック**：
  * **全輪表示（All）**：車両シルエットの四隅に、正規化された伸縮値（0.0〜1.0）をバーメーターおよびパーセンテージで表示。値に応じてバー色を変化（赤：最大圧縮付近、青：最大伸長付近、緑：通常）。
  * **単一表示（FL/FR/RL/RR）**：選択したサスペンション位置の圧縮状態を、数値と横向きインジケーターで大きく表示。
* **インタラクションと設定**：
  * **短押し（キー押下 / ダイヤルプッシュ）**：表示モードをパーセンテージ表示（%）と実数表示（0.0〜1.0）で切り替え（[TelemetryAction](../src/actions/telemetry-action.ts#L15)を直接継承）。
  * **プロパティインスペクタ（設定画面）**：[ui/suspension-travel.html](../com.github.shiguruikai.streamdeck-forza-telemetry.sdPlugin/ui/suspension-travel.html)を通じて、表示位置および表示モードを保存。

---

## 2. システムアーキテクチャ（インフラレイヤー）

### 2.1 共通ベースクラス [TelemetryAction](../src/actions/telemetry-action.ts#L15)

各アクションから重複するボイラープレートを排除するため、ライフサイクル管理と状態キャッシュを統括する共通ベースクラスを導入しています。
* **ライフサイクル自動制御**：`onWillAppear` による自動イベント登録（[telemetryManager](../src/telemetry/manager.ts#L89)の購読）、および `onWillDisappear` による自動クリーンアップ。
* **状態のカプセル化**：[settingsMap](../src/actions/telemetry-action.ts#L16)および[lastTelemetryDataMap](../src/actions/telemetry-action.ts#L17)を `private` フィールドとして管理。サブクラスからは [getSettings](../src/actions/telemetry-action.ts#L23)、[setSettings](../src/actions/telemetry-action.ts#L30)、[getLastTelemetryData](../src/actions/telemetry-action.ts#L37)などのメソッド経由でのみ安全にアクセス可能。

### 2.2 プラグイン初期化とライフサイクル（[plugin.ts](../src/plugin.ts)）

* **起動シーケンス**：Stream Deckとの接続完了後、グローバル設定（IPアドレス、ポート）を非同期にロードし、UDP受信サーバーの初期バインドを実行。
* **設定同期**：設定変更イベント（`onDidReceiveGlobalSettings`）をフックし、ポートやアドレスの変更を動的にサーバー設定へ反映。
* **ログ管理**：開発用のログレベル `trace` を有効化。

### 2.3 設定バリデーション（[settings.ts](../src/settings/settings.ts)）

* **クラッシュ防止設計**：`net.isIPv4` と数値範囲チェックを用い、IPアドレスとポート（0〜65535）を検証。不正な設定値によるサーバー起動失敗やプラグインのクラッシュを防止。

### 2.4 UDP テレメトリサーバー（[server.ts](../src/telemetry/server.ts)）

* **ソケット通信**：`node:dgram` の `udp4` を用いてテレメトリデータを受信。
* **エラーハンドリング**：二重バインド防止機能、およびエラー検知時のソケットの自動クローズ・再試行などのリカバリ処理を搭載。

### 2.5 テレメトリ配信マネージャー（[manager.ts](../src/telemetry/manager.ts)）

* **シングルトン構成**：重複起動を防ぎデータソースを一元化するため、[telemetryManager](../src/telemetry/manager.ts#L89)のシングルトンインスタンスを提供。
* **スロットリング（最大20FPS / 50ms間隔）**：描画と通信の負荷を抑制するため、配信頻度を最大20FPSに制限。
* **自動省電力設計（ライフサイクル連動）**：`data` イベントのリスナー数を監視。
  * リスナーが0から1になったとき（アクションが画面に表示されたとき）：自動的にUDPサーバーを起動。
  * リスナーが1から0になったとき（すべてのアクションが消えたとき）：`process.nextTick` を利用して非同期にサーバーを自動停止し、ポート占有とCPU消費を解放。

### 2.6 共通画像描画ユーティリティ（[image.ts](../src/utils/image.ts)）

* **SVG動的生成**：[createAllWheelsImage](../src/utils/image.ts#L13)、[createWheelImage](../src/utils/image.ts#L104)、[createGForceImage](../src/utils/image.ts#L152)などの共通関数を集約。
* **相対的な角丸設計**：オブジェクトの角丸を物理ピクセルや固定値ではなく、描画するバーやタイヤの太さに対する比率（タイヤは `radius = 0.4`）で計算し、一貫した描画を実現。
* **SVGデータの最適化**：[toSvgDataUri](../src/utils/image.ts#L9)内で改行や空白を除去（`replace(/>\s+</g, '><').trim()`）し、URLエンコードすることで、データ転送効率とメモリ効率を向上。
* **ヘルパー関数**：[utils.ts](../src/utils/utils.ts)に数値を範囲内に収める [clamp](../src/utils/utils.ts#L1) を定義。

### 2.7 共通フォーマットユーティリティ（[format.ts](../src/utils/format.ts)）

* 文字列や数値の成形処理（`formatTime`、`formatLap`、`formatSpeed`、`formatGear` など）を一元化し、UIの表示形式統一とテスト容易性を確保。

### 2.8 共通型定義（[settings.ts](../src/types/settings.ts)）

* 設定値や物理単位（`SpeedUnit`、`TempUnit` など）の文字列リテラル型を定義し、プラグイン全体の型安全性を保証。
