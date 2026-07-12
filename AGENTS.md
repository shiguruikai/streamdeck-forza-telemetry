# AGENTS.md

## プロジェクト概要

レースシミュレーションゲーム Forza Horizon からテレメトリデータを受信し、Stream Deck + の液晶キーおよびタッチディスプレイの両方に対応した5つのアクション（速度計、ラップタイム、Gフォース、タイヤ温度、サスペンション移動量）を提供する Stream Deck プラグイン。

## 技術スタック

- TypeScript, Node.js v24, pnpm, Rollup, ESLint
- Stream Deck SDK: `@elgato/streamdeck`, `@elgato/cli`

## コマンド

- `pnpm build`: プラグインのビルド
- `pnpm watch`: 変更監視ビルドおよび自動再起動
- `pnpm lint:fix`: ESLintによるコード修正（JavaScript、TypeScript、JSONのみ対象）
- `pnpm sim`: 擬似テレメトリ送信（`tests/simulate-telemetry.ts` の実行）
- `pnpm streamdeck:validate`: プラグイン構成の検証
- `pnpm streamdeck:restart`: プラグインの強制再起動
- `pnpm streamdeck:pack`: 配布ファイルの作成

## 設計・開発ルール

作業中のタスクに関係するドキュメントを必ず参照すること。

### ドキュメント

- テレメトリ定義: `docs/forza-telemetry/` 配下を参照
- Stream Deck API仕様: `docs/stream-deck-docs/index.md` を参照
- アーキテクチャ概要＆ディレクトリ構造: `docs/architecture.md` を参照
- UIデザインルール: `docs/design-rules.md` を参照
- Marketplace掲載用説明文: `docs/marketplace-listing.md` を参照
- リリースロードマップ・進捗管理: `docs/release-roadmap.md` を参照

### ドキュメント記述ルール

- ドキュメント内リンクは常に相対パスを使用し、絶対パス（`file:///`）を使用しないこと。
- 日本語の文章においては、半角括弧 `()` ではなく、全角括弧 `（）` を使用し、前後に半角スペースを含めないこと。

### テストルール

- 機能追加・修正時は、開発者自ら `pnpm sim` を実行し、実機または Stream Deck アプリ上で挙動を確認すること。
- プラグインの設定変更時は、`pnpm streamdeck:validate` で検証すること。

### Gitルール

- コミットメッセージ: `Conventional Commits` に準拠した簡潔な日本語。
- コミット前に `pnpm lint:fix` を実行すること（ドキュメント修正のみの場合は不要）。
- ユーザーの明示的な指示がない限り、自動で `git commit` や `git push` を行ってはならない。必ず事前にユーザーの確認と許可を得ること。

## 禁止事項

- **不要なコマンド実行の禁止**: 変更ファイルが `*.md` のみの場合、`pnpm lint:fix`、`pnpm streamdeck:validate`、`pnpm build` を実行しないでください。
