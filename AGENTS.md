# AGENTS.md

## プロジェクト概要

Forza HorizonからUDPテレメトリデータを受信し、Elgato Stream Deck +に表示するプラグイン。

## 技術スタック

- TypeScript / Node.js v24 / pnpm / Rollup / ESLint
- Stream Deck SDK: `@elgato/streamdeck`, `@elgato/cli`

## コマンド

- `pnpm build`: プラグインのビルド
- `pnpm watch`: 変更監視ビルドおよび自動再起動
- `pnpm lint:fix`: ESLintによるコード修正（JavaScript、TypeScript、JSONのみ対象）
- `pnpm sim`: 擬似テレメトリ送信（`tests/simulate-telemetry.ts` の実行）
- `pnpm streamdeck:validate`: プラグイン構成の検証
- `pnpm streamdeck:restart`: プラグインの強制再起動

## 設計・開発ルール

### ドキュメント参照

- テレメトリ定義: `docs/forza-telemetry/` 配下を参照。
- Stream Deck API仕様: `docs/stream-deck-docs/index.md` を参照。
- UI設計・カラー・グラデーション: [docs/design-rules.md](docs/design-rules.md) を参照。

### テレメトリ配信・管理

- **配信頻度の制限**: [TelemetryManager](src/telemetry/manager.ts) による配信は最大20FPS（50ms間隔）に制限（スロットリング）されている。
- **インポートの統一**: シングルトンインスタンスを直接インポートすること。
  例: `import { telemetryManager } from '../telemetry/manager';`

### ドキュメント記述

- ドキュメント内リンクは常に相対パスを使用し、絶対パス（`file:///`）を使用しないこと。
- 日本語の文章においては、半角括弧 `()` ではなく、全角括弧 `（）` を使用し、前後に半角スペースを含めないこと。

### テストルール

- 機能追加・修正時は、開発者自ら `pnpm sim` を実行し、実機または Stream Deck アプリ上で挙動を確認すること。
- プラグインの設定変更時は、`pnpm streamdeck:validate` で検証すること。**プラグインと無関係の場合は実行不要**

### Gitルール

- コミットメッセージ: `Conventional Commits` に準拠した簡潔な日本語。
- コミット前に `pnpm lint:fix` を実行すること（ドキュメント修正のみの場合は不要）。
- ユーザーの明示的な指示がない限り、自動で `git commit` や `git push` を行ってはならない。必ず事前にユーザーの確認と許可を得ること。

## ディレクトリ構造

```
.
├── com.github.shiguruikai.streamdeck-forza-telemetry.sdPlugin/ # プラグインの配布パッケージ
│   ├── bin/                              # ビルド成果物の出力先
│   ├── imgs/                             # 画像リソース
│   │   ├── actions/                      # 各アクション用のアイコン画像
│   │   └── plugin/                       # プラグインのアイコン画像
│   ├── layouts/                          # 各アクションのレイアウト定義
│   │   ├── g-force-layout.json
│   │   ├── lap-time-layout.json
│   │   ├── speed-meter-layout.json
│   │   ├── suspension-travel-layout.json
│   │   └── tire-temp-layout.json
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
│   ├── constants/                        # 定数関連
│   │   └── constants.ts                  # アプリ共通の定数定義
│   ├── settings/                         # 設定関連
│   │   └── settings.ts                   # グローバル設定の型定義やパース処理
│   ├── telemetry/                        # Forzaテレメトリ関連
│   │   ├── manager.ts                    # テレメトリデータの管理
│   │   ├── parser.ts                     # UDPパケットのパーサー
│   │   └── server.ts                     # UDP受信サーバー
│   ├── types/                            # 型定義
│   │   ├── settings.ts                   # 設定関連の型定義
│   │   └── spdi.ts                       # SPDIの関連の型定義
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
