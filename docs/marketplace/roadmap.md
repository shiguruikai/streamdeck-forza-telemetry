# リリースロードマップ

## 概要

本プラグインを公開・配布するためのロードマップです。

当初 Elgato Marketplace での無料公開を目指していましたが、[Elgato 公式ガイドライン（Stripe Connect）](https://docs.elgato.com/monetization/stripe/) 上で「Stripe Connect 未対応国であっても無料プラグインの公開は可能」と案内されているにもかかわらず、Maker Console のアカウント作成画面において「Location/Region」の選択肢に日本等が含まれず登録を完了できないシステム上の不備がありました。

そのため、**GitHub Releases でのパッケージ（`.streamDeckPlugin`）直接配布を第一目標（最優先）**としてリリースを行います。

Elgato Marketplace への掲載は、Elgato サポートによるフォーム不備の修正および地域制限の対応状況に応じて、マイルストーン2として順次進めます。

---

## マイルストーン

1. **マイルストーン 1：GitHub Releases での正式リリース（最優先目標）**
2. **マイルストーン 2：Elgato Marketplace への掲載・公開（準備＆地域制限対応待ち）**

---

## 詳細タスク

### マイルストーン 1：GitHub Releases での正式リリース（最優先目標）

#### 1. 品質検証とビルド
- [x] **ソースコード・構成ファイルの検証**
  - `manifest.json` の UUID、アセット画像規格、タッチストリップレイアウト境界などを検証済み。
- [ ] **実機およびシミュレータでの動作確認**
  - 短押し、長押し、ダイヤル回転、エラーフィードバック（`showAlert`）の動作確認。
- [ ] **リリースビルドと検証**
  - `pnpm lint` / `pnpm lint:fix` による書式・エラー修正。
  - `pnpm test` による単体テストの全ケース成功確認。
  - `pnpm build` によるプロダクションビルドの完了。
  - `pnpm sd:validate` による構成バリデーションの完了。
  - `package.json`（3桁 `X.Y.Z`）、`manifest.json`（4桁 `X.Y.Z.0`）、`CHANGELOG.md` のバージョン更新。

#### 2. 配布用パッケージ生成と GitHub Releases 公開
- [ ] **配布用パッケージの生成**
  - `pnpm sd:pack` を実行し、配布パッケージ（`.streamDeckPlugin`）をエクスポートする。
- [ ] **実機インストール確認**
  - 生成された `.streamDeckPlugin` をダブルクリックでインストールし、実機環境で正常動作を確認する。
- [ ] **GitHub リリースと公開**
  - リリースタグ（`v1.0.0`）を作成し、GitHub Releases に `.streamDeckPlugin` ファイルを添付して一般公開する。

---

### マイルストーン 2：Elgato Marketplace への掲載・公開（準備＆フォーム不備対応待ち）

#### 1. フォーム不備・地域制限の解決と登録準備
- [ ] **Elgato サポートへの問い合わせと回答確認**
  - `maker@elgato.com` へ Stripe 未対応国（日本）からの無料プラグイン公開における登録フォームの不備（`Location/Region` に日本がない問題）を問い合わせ、対応を確認する。
- [ ] **Maker アカウント（Organization）の作成完了**
  - アカウント登録フォームの不備解消後、Maker Console にて組織アカウントの登録を完了させる。

#### 2. 掲載用メディア・ドキュメント作成
- [ ] **掲載用アセットの用意**
  - サムネイル画像（1920×960 px PNG）、ギャラリー画像/動画（1920×960 px PNG / 1920×1080 px MP4 計3点以上）、ストアアイコン（256×256 px, 512×512 px PNG）。
- [ ] **掲載文言の作成・確認**
  - [listing.md](listing.md) の英文説明文およびリリースノートを最終確認する。

#### 3. Maker Console での申請と審査対応
- [ ] **新規製品の登録とファイル・情報のアップロード**
  - 配布用パッケージ、英文説明文、アセット、追加リンクを登録。
- [ ] **レビュー申請とフィードバック対応**
  - 審査通過後、Marketplace 上で無料公開される。

---

## 関連ドキュメント

- [リリース手順書](../release-guide.md)
- [Marketplace掲載用説明文](listing.md)
- [UIデザインルール](../design-rules.md)
- [アーキテクチャ概要](../architecture.md)
- [公式ガイドライン](../stream-deck/distribution/index.md)
