# リリース手順書

以降の `X.Y.Z` は、今回リリースするバージョン（例: `1.2.3`）を表す。

## 1. バージョン規約

- **プロジェクトバージョン（Gitタグ、`package.json`、`CHANGELOG.md`）**: 3桁のセマンティックバージョニング（`X.Y.Z`）を使用する。Gitタグは `vX.Y.Z` とする。
- **マニフェストバージョン（`manifest.json`）**: `manifest.json`の仕様に基づき、4桁（`X.Y.Z.0`）を使用する。末尾の第4桁は原則として `0` 固定とする。

## 2. リリース前検証

リリース前にリポジトリのルートディレクトリで以下を実行し、エラーが発生しないことを確認する。

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`
4. `pnpm build`
5. `pnpm sd:validate`
6. `pnpm sd:pack` を実行し、パッケージファイル（`.streamDeckPlugin`）が正常に生成されることを確認する。

## 3. リリース手順

1. **リリース作業の開始（クリーン確認と同期）**
   1. **作業コピーの確認**:
      - `git status` を実行し、未コミットの変更がないことを確認する（クリーンな状態から開始する）。
   2. **`main`ブランチの同期**:
      - `git checkout main`
      - `git pull origin main`
2. **新規リリースバージョンの決定**
   1. **現行バージョンの確認**:
      - `git describe --tags --abbrev=0` で現在のコミットから到達可能な最新のタグを取得。
      - `git tag --sort=-v:refname` で既存のタグ一覧を取得。
      - `rg '^  "version":' package.json` で `"version"` フィールドを取得。
   2. **新規バージョンの決定**:
      - `git log <現行バージョンのタグ>..HEAD --oneline` で変更履歴を取得し、変更内容に応じて新規リリースバージョン `X.Y.Z` を決定する。
3. **バージョンの更新とドキュメント修正**
   1. `package.json` の `"version"` フィールドを `X.Y.Z` に更新する。
   2. `com.github.shiguruikai.streamdeck-forza-telemetry.sdPlugin/manifest.json` の `"Version"` フィールドを `X.Y.Z.0` に更新する。
   3. `CHANGELOG.md` の `## [Unreleased]` セクションの下の変更点を、新規バージョンのセクションに移動する。見出しは `## [X.Y.Z] - YYYY-MM-DD` の形式とする。セクションの内容は、そのまま GitHub Release の本文になる。
      ```markdown
      ## [X.Y.Z] - YYYY-MM-DD
      ```
   4. `CHANGELOG.md` の末尾のリンクを更新する（過去バージョン分のリンク定義はそのまま残す）。
      ```markdown
      [Unreleased]: https://github.com/shiguruikai/streamdeck-forza-telemetry/compare/vX.Y.Z...HEAD
      [X.Y.Z]: https://github.com/shiguruikai/streamdeck-forza-telemetry/compare/v<前バージョン>...vX.Y.Z
      ```
4. **バージョン更新後の最終検証**
   1. `pnpm lint`
   2. `pnpm typecheck`
   3. `pnpm test`
   4. `pnpm build`
   5. `pnpm sd:validate`
   6. `pnpm sd:pack`
5. **コミットと `main` のプッシュ**
   1. ステージング: `git add package.json CHANGELOG.md com.github.shiguruikai.streamdeck-forza-telemetry.sdPlugin/manifest.json`
   2. 差分確認: `git diff --cached`
   3. コミット: `git commit -m "release: vX.Y.Z"`
   4. プッシュ: `git push origin main`
6. **`main` の CI の成功確認**
   1. `gh run list --branch main --limit 1` で、プッシュしたコミットの CI が完了し、成功していることを確認する。
   2. 失敗または実行中の場合は、タグをプッシュせず、原因の修正または完了を待つ。
7. **タグの作成とプッシュ**
   1. タグ追加: `git tag -a vX.Y.Z -m "release: vX.Y.Z"`
   2. プッシュ: `git push origin vX.Y.Z`
      - `v*` のタグをプッシュすると GitHub Actions（`.github/workflows/release.yml`）が起動する。

## 4. リリースワークフロー

タグのプッシュにより起動する `.github/workflows/release.yml` は、次の順に実行される。いずれかが失敗した場合、GitHub Release は作成されない。

1. **`verify` ジョブ**: `.github/workflows/ci.yml` を呼び出し、lint（警告0件）、型チェック、単体テスト、ビルド、マニフェスト検証を実行する。
2. **`release` ジョブ**（`verify` の成功後に実行）
   1. **バージョン照合**: タグから `v` を除いた `X.Y.Z` が、`package.json` の `version`、`manifest.json` の `Version`（`X.Y.Z.0`）、`CHANGELOG.md` の `## [X.Y.Z] - YYYY-MM-DD` 形式の見出しのすべてと一致することを確認する。
   2. **リリースノートの抽出**: `CHANGELOG.md` の `## [X.Y.Z] - YYYY-MM-DD` 見出しの次の行から、次の `##` 見出しまたはリンク定義の手前までを `RELEASE_NOTES.md` に書き出す。内容が空の場合は失敗する。
   3. **パッケージの作成**: `pnpm build` と `pnpm sd:pack` で `.streamDeckPlugin` を作成する。
   4. **GitHub Release の作成**: `gh release create` で、`.streamDeckPlugin` を添付し、`RELEASE_NOTES.md` を本文とする GitHub Release を作成する。

## 5. リリース後の確認

1. `gh run list --workflow release.yml --limit 1` で、Release ワークフローが成功していることを確認する。
2. `gh release view vX.Y.Z` で、次の内容を確認する。
   - 添付ファイルに `.streamDeckPlugin` が含まれている。
   - 本文が `CHANGELOG.md` の `## [X.Y.Z] - YYYY-MM-DD` セクションの内容と一致している。
