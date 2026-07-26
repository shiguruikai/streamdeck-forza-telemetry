# AGENTS.md

## プロジェクト概要

レースシミュレーションゲーム Forza Horizon および Forza Motorsport からテレメトリデータを受信し、Stream Deck + の液晶キーおよびタッチディスプレイの両方に対応した8つのアクション（速度計、レース情報、タイヤ温度、サスペンション移動量、Gフォース、コンパス、エンジン出力・トルク、カースペック）を提供する Stream Deck プラグイン。

## 技術スタック

- TypeScript, Node.js v24, pnpm, Rollup, ESLint, Vitest
- Stream Deck SDK: `@elgato/streamdeck`, `@elgato/cli`

## コマンド

- `pnpm build`: プラグインのビルド
- `pnpm watch`: 変更監視ビルドおよび自動再起動
- `pnpm lint:fix`: ESLintによるコード修正（JavaScript、TypeScript、JSONのみ対象）
- `pnpm test`: Vitestによる単体テストの実行
- `pnpm sim`: 擬似テレメトリ送信（`tests/simulate-telemetry.ts`のデフォルト実行）
  - `pnpm sim:fh5`: FH5形式
  - `pnpm sim:fh6`: FH6形式
  - `pnpm sim:fm7`: FM7 Dash形式
  - `pnpm sim:fm8`: FM8 Dash形式
  - `pnpm sim:sled`: FM Sled形式（非対応）
- `pnpm sd:validate`: プラグイン構成の検証
- `pnpm sd:restart`: プラグインの強制再起動
- `pnpm sd:pack`: 配布ファイルの作成

## 設計・開発ルール

作業中のタスクに関係するドキュメントを必ず参照すること。

### ドキュメント

- [アーキテクチャ概要＆ディレクトリ構造](docs/architecture.md)
- [UIデザインルール](docs/design-rules.md)
- [Stream Deck プラグイン開発ナレッジベース（API仕様、ガイドライン）](docs/stream-deck/index.md)
- [Forza Horizon テレメトリデータ仕様](docs/forza-telemetry/fh6.md)
- [Forza Motorsport テレメトリデータ仕様](docs/forza-telemetry/fm8.md)
- [リリース手順書](docs/release-guide.md)
- [Marketplace リリースロードマップ](docs/marketplace/roadmap.md)
- [Marketplace 掲載用説明文](docs/marketplace/listing.md)

### ドキュメント記述ルール

- ドキュメント内リンクは常に相対パスを使用し、絶対パス（`file:///`）を使用しないこと。
- 日本語の文章においては、半角括弧 `()` ではなく、全角括弧 `（）` を使用し、前後に半角スペースを含めないこと。

### チェンジログルール

- 機能追加や仕様変更を行った際は、`CHANGELOG.md` の `[Unreleased]` セクションを最新化すること。

### テストルール

- 機能追加・修正時は、開発者自ら `pnpm sim` を実行し、実機または Stream Deck アプリ上で挙動を確認すること。
- プラグインの設定変更時は、`pnpm sd:validate` で検証すること。

### Gitルール

- コミットメッセージ: `Conventional Commits` に準拠した簡潔な日本語。
- コミット前に `pnpm lint:fix` を実行すること（ドキュメント修正のみの場合は不要）。
- ユーザーの明示的な指示がない限り、自動で `git commit` や `git push` を行ってはならない。必ず事前にユーザーの確認と許可を得ること。

## 禁止事項

- **不要なコマンド実行の禁止**: 変更ファイルが `*.md` のみの場合、`pnpm lint:fix`、`pnpm sd:validate`、`pnpm build` を実行しないでください。
