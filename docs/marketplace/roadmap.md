# リリースロードマップ

## 概要

本プラグインを公開・配布するためのロードマップです。

当初 Elgato Marketplace での無料公開を目指していましたが、[Elgato 公式ガイドライン（Stripe Connect）](https://docs.elgato.com/monetization/stripe/) 上で「Stripe Connect 未対応国であっても無料プラグインの公開は可能」と案内されているにもかかわらず、Maker Console のアカウント作成画面において「Location/Region」の選択肢に日本等が含まれず登録を完了できないシステム上の不備がありました。

そのため、**GitHub Releases でのパッケージ（`.streamDeckPlugin`）直接配布を第一目標（最優先）**としてリリースを行います。

Elgato Marketplace への掲載は、Elgato サポートによるフォーム不備の修正および地域制限の対応状況に応じて、マイルストーン2として順次進めます。

---

## マイルストーン

1. **マイルストーン 1：GitHub Releases での正式リリース（最優先目標）**
2. **マイルストーン 2：Elgato Marketplace への掲載・公開（準備＆フォーム不備・地域制限対応待ち）**

---

## 詳細タスク

### マイルストーン 1：GitHub Releases での正式リリース（最優先目標）

#### 1. 品質検証とビルド

- [x] **ソースコード・構成ファイルの検証**
  - `manifest.json` の UUID、アセット画像規格、タッチストリップレイアウト境界などを検証済み。
- [x] **実機およびシミュレータでの動作確認**
  - 短押し、長押し、ダイヤル回転、エラーフィードバック（`showAlert`）の動作確認。
- [x] **リリースビルドと検証**
  - `pnpm lint` / `pnpm lint:fix` による書式・エラー修正。
  - `pnpm test` による単体テストの全ケース成功確認。
  - `pnpm build` によるプロダクションビルドの完了。
  - `pnpm sd:validate` による構成バリデーションの完了。
  - `package.json`（3桁 `X.Y.Z`）、`manifest.json`（4桁 `X.Y.Z.0`）、`CHANGELOG.md` のバージョン更新。

#### 2. 配布用パッケージ生成と GitHub Releases 公開

- [x] **配布用パッケージの生成**
  - `pnpm sd:pack` を実行し、配布パッケージ（`.streamDeckPlugin`）をエクスポートする。
- [x] **実機インストール確認**
  - 生成された `.streamDeckPlugin` をダブルクリックでインストールし、実機環境で正常動作を確認する。
- [x] **GitHub リリースと公開**
  - リリースタグ（`v1.0.0`）を作成し、GitHub Releases に `.streamDeckPlugin` ファイルを添付して一般公開する。

---

### マイルストーン 2：Elgato Marketplace への掲載・公開（準備＆フォーム不備・地域制限対応待ち）

#### 1. フォーム不備・地域制限の解決と登録準備

- [ ] **Elgato サポートへの問い合わせと回答確認**
  - `maker@elgato.com` へ Stripe 未対応国（日本）からの無料プラグイン公開における登録フォームの不備（`Location/Region` に日本がない問題）を問い合わせ、対応を確認する。
- [ ] **Maker アカウント（Organization）の作成完了**
  - アカウント登録フォームの不備解消後、Maker Console にて組織アカウントの登録を完了させる。

#### 2. 掲載用メディア・ドキュメント作成

- [ ] **掲載用アセットの用意**
  - サムネイル画像（1920×960 px PNG）、ギャラリー画像/動画（1920×960 px PNG / 1920×1080 px MP4 計3点以上）、ストアアイコン（256×256 px, 512×512 px PNG）。
- [ ] **英文の掲載説明文の作成**
  - [listing.md](listing.md) は未作成。英文説明文およびリリースノートを作成し、内容を確認する。
- [ ] **デモ動画の用意**
  - ハードウェアまたは有料サービスとの連携を要する製品では、完全に動作することを示す動画の提出が求められる（[審査プロセス](../stream-deck/distribution/review-process.md)）。本プラグインも、有料ゲームの Forza が前提のため、求められる可能性がある。

#### 3. 申請前の確認・対応事項

- [ ] **描画更新レートの再検討**
  - ガイドライン（[plugin-guidelines.md](../stream-deck/distribution/plugin-guidelines.md)）は、プログラムからの更新を「最大10回/秒」に抑えるよう示している。原文では Recommendations の Don't で、必須ではないが、審査で変更を求められうる。
  - 現在は既定 15、上限 30（Global 設定の Frame Rate）。
- [ ] **AI 使用の申告**
  - [製品ガイドライン](https://docs.elgato.com/guidelines/products) の Requirements に、AI を使った場合は申告する（製品、説明文、メディアが対象）とある。また、すべて AI で作ったと判断された製品は掲載できない。申請時の記載内容を決める。
- [ ] **`SupportURL` の設定**
  - マニフェストに未設定。次回のリリースで対応予定。
- [ ] **サードパーティのライセンス表記**
  - 次回のリリースで対応予定。
- [ ] **審査期間の見込み**
  - 審査には 4〜10 営業日かかる。新規製品も新バージョンも審査対象のため、公開予定日に余裕をもって申請する。

#### 4. Maker Console での申請と審査対応

- [ ] **新規製品の登録とファイル・情報のアップロード**
  - 配布用パッケージ、英文説明文、アセット、追加リンクを登録。
- [ ] **レビュー申請とフィードバック対応**
  - 審査通過後、Marketplace 上で無料公開される。

---

## 関連ドキュメント

- [リリース用スキル](../../.claude/skills/release/SKILL.md)
- [Marketplace掲載用説明文](listing.md)
- [UIデザインルール](../design-rules.md)
- [アーキテクチャ概要](../architecture.md)
- [公式ガイドライン](../stream-deck/distribution/index.md)
