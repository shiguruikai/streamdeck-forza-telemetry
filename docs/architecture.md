# アーキテクチャ概要

## ディレクトリ構造

```
.
├── com.github.shiguruikai.streamdeck-forza-telemetry.sdPlugin/ # プラグインの配布パッケージ
│   ├── bin/                              # ビルド成果物の出力先
│   ├── imgs/                             # 画像リソース
│   │   ├── actions/                      # 各アクション用のアイコン画像
│   │   └── plugin/                       # プラグインのアイコン画像
│   ├── layouts/                          # アクションのレイアウト定義
│   │   └── canvas-layout.json            # 全アクション共通のキャンバスレイアウト
│   ├── logs/                             # ログ出力先
│   ├── ui/                               # 各アクションのProperty Inspector（設定画面）のUI定義
│   │   ├── common.css                    # 共通スタイルシート
│   │   ├── g-force.html
│   │   ├── lap-time.html
│   │   ├── sdpi-components.js            # 公式のUIライブラリ
│   │   ├── speed-meter.html
│   │   ├── suspension-travel.html
│   │   └── tire-temp.html
│   └── manifest.json                     # プラグインの構成定義
├── docs/                                 # 設計・開発ドキュメント
│   ├── forza-telemetry/                  # Forzaテレメトリデータ仕様
│   │   └── fh6.md
│   ├── stream-deck-docs/                 # Stream Deck SDKのドキュメント群（OKF形式）
│   ├── architecture.md                   # アーキテクチャ仕様書
│   ├── design-rules.md                   # UIデザインルール
│   └── release-roadmap.md                # リリースロードマップおよび進捗管理
├── src/                                  # ソースコード
│   ├── actions/                          # 各アクションの実装
│   │   ├── g-force.ts                    # Gフォースメーター
│   │   ├── lap-time.ts                   # ラップタイム
│   │   ├── press-duration.ts             # 長押し判定付きベースクラス
│   │   ├── speed-meter.ts                # 速度計
│   │   ├── suspension-travel.ts          # サスペンション
│   │   ├── telemetry-action.ts           # 共通ベースクラス
│   │   └── tire-temp.ts                  # タイヤ温度
│   ├── settings/                         # 設定関連
│   │   └── settings.ts                   # グローバル・ローカル設定の型定義やパース処理
│   ├── telemetry/                        # Forzaテレメトリ関連
│   │   ├── manager.ts                    # テレメトリデータの管理
│   │   ├── parser.ts                     # UDPパケットのパーサー＆データ型定義
│   │   └── server.ts                     # UDP受信サーバー
│   ├── types/                            # 型定義
│   │   └── sdpi.ts                       # SDPI（Stream Deck Property Inspector）関連の型定義
│   ├── utils/                            # 共通ユーティリティ
│   │   ├── format.ts                     # 変換系の処理
│   │   ├── image.ts                      # 動的SVG画像生成処理
│   │   └── utils.ts                      # 汎用関数
│   └── plugin.ts                         # プラグインのエントリポイント
├── tests/                                # テストコード
│   ├── simulate-telemetry.ts             # 擬似テレメトリ送信シミュレータ
│   └── tsconfig.json                     # テスト用TypeScript設定
├── .editorconfig                         # EditorConfig設定ファイル
├── .gitignore                            # Gitの除外設定
├── AGENTS.md                             # AIエージェント向けのガイド
├── eslint.config.ts                      # ESLint設定設定ファイル
├── package.json                          # プロジェクトの設定と依存関係
├── pnpm-lock.yaml                        # pnpmロックファイル
├── rollup.config.mjs                     # Rollupビルド設定
└── tsconfig.json                         # TypeScript設定
```

## データフロー

```mermaid
flowchart LR
    FH[Forza Horizon]
    Server[TelemetryServer]
    Manager[TelemetryManager]
    Actions[TelemetryAction\nサブクラス]
    SD[Stream Deck]

    FH -->|UDPパケット| Server
    subgraph 本プラグイン
        Server --> Manager
        Manager --> Actions
    end
    Actions -->|SVG画像| SD
```

## 主要クラス

### [TelemetryServer](../src/telemetry/server.ts)

- **役割**: `node:dgram` の `udp4` を用いてテレメトリデータを受信するUDPサーバー。受信した生パケットは、イベントとして上位（`TelemetryManager`）へ通知する。
- **エラー制御**: エラー検知時（ポート競合等）は自動でソケットをクローズし、エラーイベントを上位へ通知する。

### [TelemetryManager](../src/telemetry/manager.ts)

- **役割**: 受信データのパースおよびアクションへの配信管理を行うシングルトンインスタンス。
  - 使用する際はインスタンスを直接インポートする。例：`import { telemetryManager } from '../telemetry/manager';`
- **データ解析とスロットリング**: `TelemetryServer` から生パケットを受信後、配信頻度を最大20FPS（50ms間隔）に制限しつつ、パース処理（[parser.ts](../src/telemetry/parser.ts)）でオブジェクト構造に変換してからイベントとして各アクションへブロードキャストする。
- **リソースの自動管理**: `data` イベントの購読数でアクティブなアクションの増減を監視し、ソケットの開閉を自動制御する。
  - アクションが画面に表示されたとき、`TelemetryServer` を自動起動。
  - すべてのアクションが画面から消えたとき、`TelemetryServer` を自動停止。

### [TelemetryAction](../src/actions/telemetry-action.ts)（アクションの共通ベースクラス）

- **ライフサイクル自動制御**: アクションの表示／非表示と連動して、テレメトリ受信の購読・購読解除を自動制御。
- **データキャッシュ**: 直近のテレメトリデータを保持し、画面の切り替わりや設定変更時、直近のデータで画面を再表示可能。
- **一斉再描画**: グローバル設定（フォント等）の変更時、登録済みのアクティブアクションに対して `refreshActiveActions()` を呼び出し、即時再描画を実行。
- **動的データソース**: `onSendToPlugin` で、Property Inspectorからのデータソース要求（`getFonts` イベント）をフックし、OSのローカルフォント一覧を動的に取得してUIへ配信する。

## Property Inspector（設定画面）

Stream Deck公式のUIライブラリ [sdpi-components.js](../com.github.shiguruikai.streamdeck-forza-telemetry.sdPlugin/ui/sdpi-components.js) を使用し、設定の自動同期や動的なデータソースの取得に対応する。

- **グローバル設定（[settings.ts](../src/settings/settings.ts)）**: プラグイン全体で同期される共通設定（接続ポート、IPアドレス、フォント）
  - **監視と適用**: [plugin.ts](../src/plugin.ts) にて、設定変更を一元監視し、プラグイン起動時にも設定の適用を行う。
  - **適用時のフロー**:
    1. グローバルフォント名の保存
    1. 接続ポート・IPアドレスの適用
    1. アクティブアクションの一斉再描画
- **ローカル設定**: SDKを介してアクション別に保存される設定。表示単位（KM/H <-> MPH、°C <-> °F）、表示モード（車輪位置、タイトル表示の有無）など。
