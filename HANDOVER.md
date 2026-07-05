# HANDOVER — トピック深掘り作業の引き継ぎ（クラウドセッション用）

ローカルセッションで進めてきた「全85トピックの5層化」を、クラウドセッションで継続するための文書。
**進捗の唯一の情報源は [DEEPENING_LOG.md](DEEPENING_LOG.md)**（冒頭のマトリクスと各イテレーションの記録）。本書は「やり方」を引き継ぐ。

## 現状（2026-07-06 時点）

- **19/85 トピックが5層完備**（マトリクスの ✅ 行）。Iter.1〜19 の内容・検算・申し送りは DEEPENING_LOG.md 参照
- 次の優先候補（gap 大・依存順）: `chemo/pls-da`(3.5) → `prep1/regularization`(3) → `prep1/stochastic-process`(3) → `prep1/log-linear`(3) → `prep1/fisher-cramer-rao`(3) → `prep1/acf-pacf`(3) → `prep1/crossval`(3) → `prep1/mcmc`(3) → `math/linearization`(3.5)
- サイトは GitHub Pages で公開中（`main` ブランチ**ルート**配信・`.nojekyll` あり）。**Pages の配信元設定を `/docs` に変えないこと**（過去にこれで全デプロイが失敗した）

## 5層の定義（完成条件）

1. **直感** — 何のための手法か・どんな場面で使うか。2級用語は再定義しない
2. **数式** — 導出を省略しない。**「なぜその式になるか」を必ず添える**（天下り禁止）
3. **前提条件と崩れたときの影響** — `<table class="simple">` で「前提／崩れると起きること／対処・代替」の3列表が定番
4. **グラフとの接続** — デモのどのパラメータを動かすと何が確認できるかを本文・note で言語化。**デモがないトピックは小さな Canvas デモを新設してよい**（Iter.16 sufficiency・Iter.18 moment-method が前例）
5. **有意性と実質的意味**（検定・推定・モデル系のみ）— 有意≠重要、効果量と n の影響

見出しは既存に合わせる: `<h3>前提条件と、崩れたときの影響</h3>` / `<h3>有意性と実質的な意味</h3>`。
**文体・密度の参照実装**: `prep1/regression`（topics/ml.js）、`prep1/three-tests`（topics/testing2.js）、`prep1/bootstrap`（topics/prep1b.js）。

## 1イテレーションの手順（1トピックずつ）

1. **選定**: DEEPENING_LOG.md 末尾の「次に深掘りすべきトピック」→ マトリクスの gap 大を優先。同じトピックを2回連続で選ばない
2. **現状読解**: `grep -n "id: 'xxx'" topics/*.js` で場所を特定し、既存の body・demo を読む。**妥当な記述は書き換えず、欠けている層だけ足す**
3. **検算**: 追加する数式・数値例は必ず python3 等で独立に再計算してから本文に書く（例: Iter.14 は LR/Wald/Score をデモ初期値で計算し「Waldだけ棄却」を発見して L5 の教材にした）
4. **編集**: 該当 topics/*.js の body（テンプレートリテラル）に追記
5. **検証**（すべて必須）:
   - `node --check topics/対象.js` — 構文
   - `node tools/verify-topics.js` — 全85トピックの構造・内部リンク実在・`$$`フェンス偶数性・quiz対応（依存なし・ブラウザ不要）
   - デモを追加・変更した場合: draw() をスタブ canvas で直接呼んで例外がないか（境界値含む）を確認するか、少なくとも全 controls の min/max で式が破綻しないことを机上確認
6. **記録**: DEEPENING_LOG.md の該当マトリクス行を `| **section/id** | o | o | o | o | o | 0 | ✅Iter.N |` に更新し、末尾にイテレーション記録（対象／選定理由／埋めた層／検算結果／次の候補）を追記
7. **コミット&プッシュ**: `深掘り Iter.N: <トピック名>を5層化` の形式で、本文とログを同一コミットに。`git push origin main` で Pages に自動デプロイされる

## 実装上の注意（壊れやすい箇所）

- **テンプレートリテラル内の KaTeX**: バックスラッシュは `\\`（例 `\\sum`、`\\dfrac`）。body の閉じは **バッククォート**（`` </div>`, `` の形）。過去に `'` で閉じて次のトピックを丸ごと飲み込むバグがあった
- **インライン数式内の `{}`**: `$e^{\\hat b}$` のように普通に書けるが、`$` の対応と `$$` の偶数性に注意（verify-topics.js が検出する）
- **内部リンクの形式**: `<a href="#/section/id">表示名</a>`。**section はファイル名でなくトピック定義の `section:` 値**（例: orthogonal は doe.js にあるが `#/prep1/orthogonal`）。verify-topics.js がデッドリンクを検出する
- **topics/*.js の冒頭**は `const T = (window.STATS_TOPICS = window.STATS_TOPICS || []);` の自己初期化。崩さない
- **デモの参照**: `const st = S(), Pl = P();`（`window.Stats`/`window.Plot` の遅延参照）。draw(canvas, p) は Canvas、plot(div, p, Plotly) は Plotly（3D）
- **新デモの乱数**: `st.rng(シード + (p.reseed|0)*素数)` パターンで再現可能に。ガンマ等の特殊乱数は指数和（アーラン）などで自作（Iter.18 参照）
- **DOM 書き込みは render() 集約**の規律（CLAUDE.md）。トピック本文の追記だけなら触れない

## クラウドセッションに渡すプロンプト（コピペ用）

```
リポジトリ sgt9863/Stats-Learning-Hub のトピック深掘り作業を継続してください。

まず HANDOVER.md と DEEPENING_LOG.md（冒頭のマトリクスと最後のイテレーション記録）を読むこと。
やることは「1トピックずつ5層化」: HANDOVER.md の〈5層の定義〉と〈1イテレーションの手順〉に厳密に従う。

このセッションでは5トピックを目安に、DEEPENING_LOG.md 末尾の「次に深掘りすべきトピック」
から順に処理する（gap の大きいものを優先、同一トピックの連続選定は禁止）。

必須ルール:
- 既存の妥当な記述は書き換えない。欠けている層だけ差分で足す
- 追加する数式・数値は必ず python3 で独立に検算してから本文に書き、結果をログに残す
- 各トピック完了ごとに: node --check と node tools/verify-topics.js を通す →
  DEEPENING_LOG.md のマトリクス更新＋イテレーション記録追記 →
  「深掘り Iter.N: <トピック名>を5層化」でコミット
- デモがないトピックは HANDOVER.md の前例（Iter.16/18）に倣い小さな Canvas デモを新設してよい
- 全トピック完了後に main へプッシュ（GitHub Pages に自動デプロイされる）

最後に、処理したトピック一覧・検算結果の要約・次セッションへの申し送り
（次の優先候補3つ）を報告すること。
```

## 補足

- 検証スクリプト `tools/verify-topics.js` は本引き継ぎ時に新設（依存なし）。導入時に実デッドリンク1件（blocking-designs → doe/orthogonal）を検出・修正済み
- クイズ（content/quiz-*.js）はこの作業のスコープ外（すでに全85トピック分あり）。ただし本文と矛盾する記述を見つけたら直してよい
- デザインは「モダン・ソリッド」路線で確定済み（style.css）。深掘り作業では触らない
