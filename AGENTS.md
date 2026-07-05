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
- `pnpm lint:fix`: ESLintによるコードの自動修正を実行する
- `pnpm sim`: テレメトリ送信をシミュレートする（`tests/simulate-telemetry.ts`の実行）

## 設計／開発ルール

- **仕様の参照ルール**:
  - テレメトリのデータ構造やパケット定義の変更を行う際は、`docs/forza-telemetry/`内のファイルを参照すること。
  - Stream DeckのAPI仕様、CLI、デザインガイドラインについては、`docs/stream-deck-docs/index.md`を参照すること。

## テストルール

- 動作確認の手段として`tests/simulate-telemetry.ts`を使用すること。
- 機能の追加・修正を行った際は、`pnpm sim`を実行して擬似的なテレメトリデータを送信し、Stream Deck上での表示や挙動が正しいか実機またはシミュレータで確認すること。

## Gitルール

- コミットメッセージ: `Conventional Commits` の仕様に従った簡潔な文章（原則、日本語）
  - type: build, ci, docs, feat, fix, perf, refactor, style, test
- コミットする前に、リント＆フォーマットを実行すること。

## ディレクトリ構造

```
.
├── com.github.shiguruikai.streamdeck-forza-telemetry.sdPlugin/ # Stream Deckプラグインの配布パッケージ
│   ├── bin/                        # ビルド成果物の出力先
│   ├── imgs/                       # プラグイン用画像リソース
│   │   ├── actions/                # アクション用の各種アイコン画像
│   │   └── plugin/                 # プラグイン共通のアイコン画像
│   ├── layouts/                    # Stream Deckのレイアウト定義
│   │   └── speed-meter-layout.json # 速度計アクションのレイアウト定義ファイル
│   ├── logs/                       # ログ出力先
│   ├── ui/                         # プロパティインスペクタ用のUI定義
│   │   ├── sdpi-components.js      # Stream Deckの共通UIコンポーネントライブラリ
│   │   └── speed-meter.html        # 速度計設定画面のHTML
│   └── manifest.json               # プラグインの構成定義
├── docs/                           # 設計・開発用ドキュメント
│   ├── stream-deck-docs/           # Stream Deck SDKのドキュメント（OKF形式）
│   └── fh6_data_out.md             # Forza Horizon 6 "Data Out"の仕様書
├── src/                            # ソースコードディレクトリ
│   ├── actions/                    # Stream Deckのアクション定義
│   │   └── speed-meter.ts          # 速度計のアクション実装
│   ├── settings/                   # アクションの設定関連
│   │   └── settings.ts             # アクション設定の定義
│   ├── telemetry/                  # UDPテレメトリ受信・解析処理
│   │   ├── manager.ts              # テレメトリの管理・配信処理
│   │   ├── parser.ts               # テレメトリデータパケットの解析処理
│   │   └── server.ts               # UDP受信サーバー
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
