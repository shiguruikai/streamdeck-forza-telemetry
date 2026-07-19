# リリース手順書

## 1. バージョン規約

- **プロジェクトバージョン（Gitタグ、`package.json`、`CHANGELOG.md`）**: 3桁のセマンティックバージョニング（`X.Y.Z`）を使用する。
- **マニフェストバージョン（`manifest.json`）**: `manifest.json`の仕様に基づき、4桁（`X.Y.Z.0`）を使用する。末尾の第4桁は原則として `0` 固定とする。

## 2. リリース前検証

リリース前にリポジトリのルートディレクトリで以下を実行し、エラーが発生しないことを確認する。

1. `pnpm lint`
2. `pnpm build`
3. `pnpm sd:validate`
4. `pnpm sd:pack` を実行し、パッケージファイル（`.streamDeckPlugin`）が正常に生成されることを確認する。
5. 必ずユーザーの承認を得てからリリース手順に進む。

## 3. リリース手順

**コミットおよびプッシュの前に必ずユーザーの承認を得ること。**

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
      - `git log <現行バージョンのタグ>..HEAD --oneline` で変更履歴を取得し、新規リリースバージョンをユーザーに提案する。
3. **バージョンの更新とドキュメント修正**
   1. `package.json` の `"version"` フィールドを決定したバージョンに更新する。
   2. `com.github.shiguruikai.streamdeck-forza-telemetry.sdPlugin/manifest.json` の `"Version"` フィールドを4桁の形式に更新する。
   3. `CHANGELOG.md` の `## [Unreleased]` セクションの下の変更点を、新規バージョンのセクションに移動する。
      ```markdown
      ## [1.0.0] - YYYY-MM-DD
      ```
   4. `CHANGELOG.md` の末尾のリンクを更新する。
      ```markdown
      [Unreleased]: https://github.com/shiguruikai/streamdeck-forza-telemetry/compare/v1.0.0...HEAD
      [1.0.0]: https://github.com/shiguruikai/streamdeck-forza-telemetry/compare/v0.1.0...v1.0.0
      [0.1.0]: https://github.com/shiguruikai/streamdeck-forza-telemetry/releases/tag/v0.1.0
      ```
4. **バージョン更新後の最終検証**
   1. `pnpm build`
   2. `pnpm sd:validate`
   3. `pnpm sd:pack`
5. **コミット＆プッシュ**
   1. ステージング: `git add package.json CHANGELOG.md com.github.shiguruikai.streamdeck-forza-telemetry.sdPlugin/manifest.json`
   2. 差分確認: `git diff --cached`
   3. コミット: `git commit -m "release: v1.0.0"`
   4. タグ追加: `git tag v1.0.0`
   5. プッシュ: `git push origin main`
   6. GitHub Actions `.github/workflows/release.yml` により、自動で GitHub Releases に公開される。
