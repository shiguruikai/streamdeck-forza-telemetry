# AGENTS.md

## プロジェクト概要

Forza HorizonからUDPテレメトリデータ（"Data Out"）を受信し、Elgato Stream Deck +に表示するためのStream Deckプラグイン。

## 技術スタック

- **言語**: TypeScript
- **ランタイム**: Node.js v24
- **パッケージマネージャー**: pnpm
- **ビルドツール**: Rollup
- **リント・フォーマット**: ESLint
- **Stream Deck SDK**: @elgato/streamdeck, @elgato/cli

## コマンド

- `pnpm build`: プラグインをビルドし、成果物を出力する
- `pnpm watch`: コードの変更を監視して自動ビルドし、Stream Deckプラグインを再起動する
- `pnpm lint:fix`: ESLintによるコード自動修正 **※対象ファイルは、JavaScript、TypeScript、JSONのみ**
- `pnpm sim`: テレメトリ送信をシミュレートする（`tests/simulate-telemetry.ts`の実行）
- `pnpm validate`: `streamdeck validate`コマンドにより、`com.github.shiguruikai.streamdeck-forza-telemetry.sdPlugin`フォルダ内のファイルを検証する。
- `pnpm exec streamdeck restart com.github.shiguruikai.streamdeck-forza-telemetry`: Stream Deck上でプラグインを強制的に再起動し、レイアウトや設定の変更を即座に反映する。

## 設計／開発ルール

- **仕様の参照ルール**:
  - テレメトリのデータ構造やパケット定義の変更を行う際は、`docs/forza-telemetry/`内のファイルを参照すること。
  - Stream DeckのAPI仕様、CLI、デザインガイドラインについては、`docs/stream-deck-docs/index.md`を参照すること。
- **レイアウトのデザインルール**:
  - Dialの液晶ディスプレイ（キャンバスサイズは 200×100px）に情報を表示する際は、左右に 10px、上下 5px のパディングを確保すること。
  - すべての要素の描画領域（`rect`）は、以下の範囲内に収めること。
    - X座標（左右）: `10` ～ `190`
    - Y座標（上下）: `5` ～ `95`
- **パフォーマンスと更新頻度の仕様**:
  - 描画負荷を抑えるため [TelemetryManager](src/telemetry/manager.ts) において、テレメトリデータの配信頻度を **最大20FPS（50ms間隔）** に制限（スロットリング）している。
- **TelemetryManagerの利用ルール**:
  - `TelemetryManager` を使用する場合は、モジュールからエクスポートされているシングルトンインスタンスを直接インポートすること。例：`import { telemetryManager } from '../telemetry/manager';`（外部からの直接 `new` によるインスタンス化は禁止されている）。
- **画像・SVGアセットの設計ルール**:
  - キーボタン（液晶キー）のアセットや動的SVGを設計・作成する際は、高DPIディスプレイ（高解像度）の表示に対応するため、**`144 × 144 px`（アスペクト比 1:1）** を基準解像度として設計すること。
  - SVGを動的生成する場合も、将来的な画像アセットとの組み合わせ時における座標系の一貫性や、デザインデータの流用性を考慮し、基準となる`viewBox`は`0 0 144 144`（幅/高さを `144`）とすること。
- **ドキュメント内リンクの相対パス化**:
  - ドキュメント内のファイルやソースコードへのリンクには、ローカル絶対パス（`file:///`）を使用せず、常にドキュメント基準の相対パスを使用すること。
- **ボタン・ダイヤル操作の一貫性ルール**:
  - 短押し操作（キー短押し / ダイヤルプッシュ / 液晶タップ）は、表示単位や表示モードなどの「主要設定値」の切り替え（トグルまたは順次ループ）に割り当てること。
  - ダイヤル回転（Dial Rotate）操作は、表示対象（車輪位置のループ切り替え）や設定値（スケール上限の増減など）の「順次切り替え」に割り当てること。
  - ピークGのリセットなど、状態変更を伴う操作は長押し（500ms判定）に割り当てること。

## テストルール

- 動作確認の手段として`tests/simulate-telemetry.ts`を使用すること。
- 機能の追加・修正を行った際は、`pnpm sim`を実行して擬似的なテレメトリデータを送信し、Stream Deck上での表示や挙動が正しいか実機またはシミュレータで確認すること。
- Stream Deckプラグインの定義ファイルや設定ファイルを変更した際は、`pnpm validate`を実行し、ファイルが正しいか検証すること。

## Gitルール

- コミットメッセージ: `Conventional Commits`の仕様に従った簡潔な文章（原則、日本語）
  - type: build, ci, docs, feat, fix, perf, refactor, style, test
- コミットする前に、`pnpm lint:fix`を実行すること（Markdown等のドキュメントファイルのみを修正した場合は不要）。

## ディレクトリ構造

```
.
├── com.github.shiguruikai.streamdeck-forza-telemetry.sdPlugin/ # Stream Deckプラグインの配布パッケージ
│   ├── bin/                        # ビルド成果物の出力先
│   ├── imgs/                       # プラグイン用画像リソース
│   │   ├── actions/                # アクション用の各種アイコン画像
│   │   │   ├── g-force/            # Gフォースメーター用のアイコン画像
│   │   │   ├── lap-time/           # ラップタイム用のアイコン画像
│   │   │   ├── speed-meter/        # 速度計用のアイコン画像
│   │   │   ├── suspension-travel/  # サスペンション移動量用のアイコン画像
│   │   │   └── tire-temp/          # タイヤ温度用のアイコン画像
│   │   └── plugin/                 # プラグイン共通のアイコン画像
│   ├── layouts/                    # Stream Deckのレイアウト定義
│   │   ├── g-force-layout.json     # Gフォースメーターアクションのレイアウト定義ファイル
│   │   ├── lap-time-layout.json    # ラップタイムアクションのレイアウト定義ファイル
│   │   ├── speed-meter-layout.json # 速度計アクションのレイアウト定義ファイル
│   │   ├── suspension-travel-layout.json # サスペンション移動量アクションのレイアウト定義ファイル
│   │   └── tire-temp-layout.json   # タイヤ温度アクションのレイアウト定義ファイル
│   ├── logs/                       # ログ出力先
│   ├── ui/                         # プロパティインスペクタ用のUI定義
│   │   ├── sdpi-components.js      # Stream Deckの共通UIコンポーネントライブラリ
│   │   ├── speed-meter.html        # 速度計設定画面のHTML
│   │   ├── suspension-travel.html  # サスペンション移動量設定画面のHTML
│   │   └── tire-temp.html          # タイヤ温度設定画面のHTML
│   └── manifest.json               # プラグインの構成定義
├── docs/                           # 設計・開発用ドキュメント
│   ├── forza-telemetry/            # Forzaテレメトリデータ定義
│   │   └── fh6.md                  # Forza Horizon 6 "Data Out"の仕様書
│   ├── stream-deck-docs/           # Stream Deck SDKのドキュメント（OKF形式）
│   ├── architecture.md             # 機能・アーキテクチャ設計書
│   └── release-roadmap.md          # リリースロードマップおよび進捗管理シート
├── src/                            # ソースコードディレクトリ
│   ├── actions/                    # Stream Deckのアクション定義
│   │   ├── g-force.ts              # Gフォースメーターのアクション実装
│   │   ├── lap-time.ts             # ラップタイムのアクション実装
│   │   ├── press-duration.ts       # 長押し・短押し判定付きアクションの基底クラス
│   │   ├── speed-meter.ts          # 速度計のアクション実装
│   │   ├── suspension-travel.ts    # サスペンション移動量のアクション実装
│   │   ├── telemetry-action.ts     # 共通ベースクラス（テレメトリ受信/状態キャッシュ）
│   │   └── tire-temp.ts            # タイヤ温度のアクション実装
│   ├── constants/                  # 定数定義
│   │   └── constants.ts            # アプリケーション共通の定数定義
│   ├── settings/                   # アクションの設定関連
│   │   └── settings.ts             # アクション設定の定義
│   ├── telemetry/                  # UDPテレメトリ受信・解析処理
│   │   ├── manager.ts              # テレメトリの管理・配信処理
│   │   ├── parser.ts               # テレメトリデータパケットの解析処理
│   │   └── server.ts               # UDP受信サーバー
│   ├── types/                      # 型定義ディレクトリ
│   │   └── settings.ts             # 共通設定用・物理単位用型定義
│   ├── utils/                      # ユーティリティ関数
│   │   ├── format.ts               # 共通フォーマットユーティリティ
│   │   ├── image.ts                # 画像・SVG描画ユーティリティ
│   │   └── utils.ts                # 汎用演算ヘルパー（clamp）
│   └── plugin.ts                   # プラグインのエントリポイント
├── tests/                          # テスト・シミュレーションスクリプト
│   ├── simulate-telemetry.ts       # テレメトリ送信シミュレータ
│   └── tsconfig.json               # テストディレクトリ用のTypeScript設定
├── .editorconfig                   # エディタ設定ファイル
├── .gitignore                      # Gitの除外設定
├── AGENTS.md                       # 開発者・エージェント向けのドキュメント
├── eslint.config.ts                # ESLint設定ファイル
├── package.json                    # プロジェクトの設定と依存関係
├── pnpm-lock.yaml                  # pnpmのロックファイル
├── rollup.config.mjs               # Rollupのビルド設定
└── tsconfig.json                   # TypeScriptの設定ファイル
```
