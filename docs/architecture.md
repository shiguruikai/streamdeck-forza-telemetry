# アーキテクチャ概要

## ディレクトリ構造

```
.
├── .github/
│   └── workflows/
│       ├── ci.yml                        # CI（ビルド＆検証）
│       └── release.yml                   # GitHub Release の自動化
├── com.github.shiguruikai.streamdeck-forza-telemetry.sdPlugin/
│   ├── bin/                              # ビルド成果物の出力先
│   ├── imgs/                             # 画像リソース
│   │   ├── actions/                      # 各アクション用のアイコン画像（icon.svg と key.svg は同一データで配置）
│   │   └── plugin/                       # プラグインのアイコン画像
│   ├── layouts/                          # アクションのレイアウト定義
│   │   └── canvas-layout.json            # 全アクション共通のキャンバスレイアウト
│   ├── logs/                             # ログ出力先
│   ├── ui/                               # 各アクションのProperty Inspector（設定画面）のUI定義
│   │   ├── common.css                    # 共通スタイルシート
│   │   ├── compass.html                  # コンパス
│   │   ├── components/                   # Web Component 群
│   │   ├── g-force.html
│   │   ├── power.html
│   │   ├── race-info.html
│   │   ├── sdpi-components.js            # 公式のUIライブラリ
│   │   ├── speed-meter.html
│   │   ├── suspension-travel.html
│   │   ├── tire-temp.html
│   │   └── car-spec.html
│   └── manifest.json                     # プラグインの構成定義
├── docs/                                 # 設計・開発ドキュメント
│   ├── forza-telemetry/                  # Forza テレメトリデータ仕様書
│   │   ├── fh6.md
│   │   └── fm8.md
│   ├── marketplace/                      # Marketplace 掲載・申請用ドキュメント
│   │   ├── listing.md                    # Marketplace 掲載用説明文
│   │   └── roadmap.md                    # Marketplace リリースロードマップ
│   ├── stream-deck/                      # Stream Deck プラグイン開発ナレッジベース
│   ├── architecture.md                   # アーキテクチャ概要
│   ├── design-rules.md                   # UIデザインルール
│   └── release-guide.md                  # リリース手順書
├── src/                                  # ソースコード
│   ├── actions/                          # 各アクションの処理
│   │   ├── car-spec.ts                   # カースペック
│   │   ├── compass.ts                    # コンパス
│   │   ├── g-force.ts                    # Gフォースメーター
│   │   ├── power.ts                      # エンジン出力
│   │   ├── race-info.ts                  # レース情報
│   │   ├── speed-meter.ts                # 速度計
│   │   ├── suspension-travel.ts          # サスペンション
│   │   ├── telemetry-action.ts           # 共通ベースクラス
│   │   └── tire-temp.ts                  # タイヤ温度
│   ├── settings/                         # プラグイン設定関連
│   │   ├── index.ts
│   │   └── settings.ts                   # 設定のパース処理と適用処理
│   ├── shared/                           # UI・プラグイン共有モジュール（ブラウザや Node.js に依存しない純粋なTS）
│   │   ├── index.ts
│   │   └── settings.ts                   # 設定の型定義、デフォルト設定値
│   ├── telemetry/                        # Forzaテレメトリ関連
│   │   ├── manager.ts                    # テレメトリデータの管理
│   │   ├── parser.ts                     # UDPパケットのパーサー＆データ型定義
│   │   └── server.ts                     # UDP受信サーバー
│   ├── types/                            # 型定義
│   │   └── sdpi.ts                       # SDPI（Stream Deck Property Inspector）関連の型定義
│   ├── ui/                               # Property Inspector UI
│   │   └── components/                   # Web Component群
│   │       └── global-settings.ts        # グローバル設定（<global-settings>）
│   ├── utils/                            # 共通ユーティリティ
│   │   ├── format.ts                     # 変換系の処理
│   │   ├── graphics/                     # SVG描画モジュール群
│   │   │   ├── car-spec.ts
│   │   │   ├── common.ts                 # 共通描画処理
│   │   │   ├── compass.ts
│   │   │   ├── g-force.ts
│   │   │   ├── power.ts
│   │   │   ├── race-info.ts
│   │   │   ├── speed-meter.ts
│   │   │   ├── suspension.ts
│   │   │   ├── tire-temp.ts
│   │   │   ├── wheels.ts                 # タイヤ・サスペンション用共通描画処理
│   │   │   └── index.ts
│   │   └── utils.ts                      # 汎用関数
│   └── plugin.ts                         # プラグインのエントリポイント
├── tests/                                # テストコード
│   ├── format.test.ts                    # フォーマット処理の単体テスト
│   ├── simulate-telemetry.ts             # 擬似テレメトリ送信シミュレータ
│   └── tsconfig.json                     # テスト用TypeScript設定
├── tools/                                # 開発支援ツール
│   └── gen-marketplace-icon.ps1          # プラグインのアイコン（marketplace.svg）をPNG形式に変換するスクリプト
├── .editorconfig                         # EditorConfig設定ファイル
├── .gitattributes                        # Gitのファイル属性設定
├── .gitignore                            # Gitの除外設定
├── AGENTS.md                             # AIエージェント向けのガイド
├── CHANGELOG.md                          # 変更履歴
├── eslint.config.ts                      # ESLint設定ファイル
├── LICENSE                               # ライセンスファイル
├── package.json                          # プロジェクトの設定と依存関係
├── pnpm-lock.yaml                        # pnpmロックファイル
├── README.md                             # README.md
├── rollup.config.mjs                     # Rollupビルド設定
└── tsconfig.json                         # TypeScript設定
```

## データフロー

```mermaid
flowchart LR
    Forza["Forza シリーズ\n（Horizon / Motorsport）"]
    Server[TelemetryServer]
    Manager[TelemetryManager]
    Actions[TelemetryAction\nサブクラス]
    SD[Stream Deck]

    Forza -->|UDPパケット| Server
    subgraph 本プラグイン
        Server --> Manager
        Manager --> Actions
    end
    Actions -->|SVG画像| SD
```

## 主要クラス・モジュール

### [TelemetryServer](../src/telemetry/server.ts)

- **役割**: `node:dgram` の `udp4` を用いてテレメトリデータを受信するUDPサーバー。受信した生パケットは、イベントとして上位（`TelemetryManager`）へ通知する。
- **エラー制御**: ソケットのバインドエラー（ポート競合など）や受信時エラーが発生した場合、自動でソケットをクローズし、エラーイベントを上位（TelemetryManager）へ通知する。

### [TelemetryManager](../src/telemetry/manager.ts)

- **役割**: 受信データのパースおよびアクションへの配信管理を行うシングルトンインスタンス。
  - 使用する際はインスタンスを直接インポートする。例：`import { telemetryManager } from '../telemetry/manager';`
- **データ解析とスロットリング**: `TelemetryServer` から生パケットを受信後、グローバル設定のFPS（10〜30 FPS、デフォルト15 FPS）に基づいた配信間隔に動的制限（スロットリング）しつつ、パース処理（[parser.ts](../src/telemetry/parser.ts)）でオブジェクト構造に変換してからイベントとして各アクションへブロードキャストする。
  - **対応フォーマット**:
    - Forza Horizon（324バイト）
    - Forza Motorsport 7 Dash形式（311バイト）
    - Forza Motorsport 8 Dash形式（331バイト） ※Sled形式（232バイト）は未サポート。
- **リソースの自動管理**: `data` イベントの購読数でアクティブなアクションの増減を監視し、ソケットの開閉を自動制御する。
  - アクションが画面に表示されたとき、`TelemetryServer` を自動起動。
  - すべてのアクションが画面から消えたとき、`TelemetryServer` を自動停止。
- **タイムアウト監視**: UDPサーバー起動後、テレメトリデータが3秒間受信されなかった場合にタイムアウトイベントを発生させ、接続障害やゲーム未起動状態を上位（TelemetryAction）へ通知する。

### [TelemetryAction](../src/actions/telemetry-action.ts)（アクションの共通ベースクラス）

- **ライフサイクル自動制御**: アクションの表示／非表示と連動して、テレメトリ受信の購読・購読解除を自動制御。
- **短押し・長押しのハンドリング**: キーおよびダイヤル操作の短押し（離した瞬間）と長押し（500ms経過時）のメソッド（`onShortPress`、`onLongPress`）を提供。サブクラスは、`onKeyDown` や `onKeyUp` を直接オーバーライドしてはいけない。
- **データキャッシュ**: 直近のテレメトリデータを保持し、画面の切り替わりや設定変更時、直近のデータで画面を再表示可能。
- **一斉再描画**: グローバル設定（フォント等）の変更時、登録済みのアクティブアクションに対して `refreshActiveActions()` を呼び出し、即時再描画を実行。
- **動的データソース**: `onSendToPlugin` で、Property Inspectorからのデータソース要求（`getFonts` イベント）をフックし、OSのローカルフォント一覧を動的に取得してUIへ配信する。
- **エラー・タイムアウトハンドリング**: TelemetryManagerからのエラーイベント（ポート競合など）やタイムアウトイベント（3秒間データ未受信）を受信した際、現在アクティブなすべてのアクションに対してSDKの `showAlert()` を呼び出して警告を表示する。

## Property Inspector（設定画面）

Stream Deck公式のUIライブラリ [sdpi-components.js](../com.github.shiguruikai.streamdeck-forza-telemetry.sdPlugin/ui/sdpi-components.js) を使用し、設定の自動同期や動的なデータソースの取得に対応する。

- **グローバル設定（[shared/settings.ts](../src/shared/settings.ts), [settings/settings.ts](../src/settings/settings.ts)）**: プラグイン全体で共有される設定（接続ポート、IPアドレス、フォント、FPS、RPMカラー）。
  - デフォルト値と型定義は、UI・バックエンド共有モジュール（[shared/index.ts](../src/shared/index.ts)）で一元管理し、[plugin.ts](../src/plugin.ts) から `applyGlobalSettings()` を通じて一括適用される。
- **ローカル設定**: SDKを介してアクション別に保存される設定（表示単位、レイアウト、車輪位置など）。
