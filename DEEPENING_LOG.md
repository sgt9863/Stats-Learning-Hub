# DEEPENING_LOG — トピック深掘りログ

各トピックを「5層構成」に引き上げる差分作業の記録。
**5層**: L1 直感 / L2 数式(導出の要点つき) / L3 前提条件と崩れた時の影響・代替 / L4 グラフ接続 / L5 有意性と実質的意味(検定・推定・モデル系のみ)。
記号: `o`=充足 / `d`=部分的 / `x`=欠落 / `-`=非該当。

> 下表は初回の一次スキャン（ヒューリスティック判定）に基づくベースライン。深掘りするたびに該当行を更新する。
> 「gap」= 欠落度スコア（x=1, d=0.5 で合計）。大きいほど欠けた層が多い。

## 充足マトリクス（85トピック）

| section/id | L1 | L2 | L3 | L4 | L5 | gap | 状態 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|---|
| prep1/transformations | o | d | d | o | - | 1 | |
| prep1/timeseries | d | d | d | o | x | 2.5 | |
| prep1/three-tests | o | x | x | d | x | 3.5 | |
| **prep1/testing** | o | o | o | o | o | 0 | ✅Iter.2で深掘り済 |
| prep1/svm | o | d | d | o | x | 2 | |
| prep1/survival | o | d | d | d | x | 2.5 | |
| prep1/sufficiency | o | d | x | x | x | 3.5 | |
| prep1/stochastic-process | o | x | x | o | x | 3 | |
| prep1/sampling-survey | o | d | d | o | - | 1 | |
| prep1/sample-size | o | d | x | o | o | 1.5 | |
| prep1/roc-auc | o | x | x | o | - | 2 | |
| prep1/regularization | o | d | x | d | x | 3 | |
| prep1/regression-diagnostics | o | x | o | o | x | 2 | |
| prep1/random-variables | o | x | x | o | - | 2 | |
| prep1/principles | d | x | x | o | o | 2.5 | |
| prep1/pca | o | d | x | d | - | 2 | |
| prep1/path-analysis | o | d | d | d | x | 2.5 | |
| prep1/overfitting | o | d | x | o | x | 2.5 | |
| prep1/orthogonal | o | x | x | d | x | 3.5 | |
| prep1/order-statistics | o | o | x | d | - | 1.5 | |
| prep1/odds-ratio | o | x | d | o | x | 2.5 | |
| prep1/normal-tests | o | x | o | d | x | 2.5 | |
| prep1/normal-approx | o | d | x | o | - | 1.5 | |
| prep1/nonparametric | o | d | o | o | x | 1.5 | |
| prep1/neyman-pearson | o | d | x | o | o | 1.5 | |
| prep1/multivariate-normal | o | d | x | o | - | 1.5 | |
| prep1/multiple-regression | o | d | x | d | x | 3 | |
| prep1/multiple-comparison | o | d | x | o | o | 1.5 | |
| prep1/multicollinearity | o | d | d | d | x | 2.5 | |
| prep1/monte-carlo | o | d | x | o | x | 2.5 | |
| prep1/moments-shape | o | x | x | d | - | 2.5 | |
| prep1/moment-method | o | d | x | x | x | 3.5 | |
| prep1/model-selection | o | d | x | o | x | 2.5 | |
| prep1/mle | o | o | x | o | x | 2 | |
| prep1/missing-data | o | x | d | o | x | 2.5 | |
| prep1/mgf | o | o | x | o | - | 1 | |
| prep1/mds-ca | x | x | x | d | x | 4.5 | |
| prep1/mcmc | d | x | x | d | - | 3 | |
| prep1/markov-chain | o | d | x | d | - | 2 | |
| prep1/logistic | o | d | x | d | x | 3 | |
| prep1/log-linear | o | d | d | x | x | 3 | |
| prep1/lln | o | d | x | d | - | 2 | |
| prep1/lda | o | d | x | d | x | 3 | |
| prep1/kmeans | o | d | x | o | - | 1.5 | |
| prep1/joint-distribution | o | x | x | d | - | 2.5 | |
| prep1/interaction | o | d | x | o | - | 1.5 | |
| prep1/goodness-of-fit | o | d | x | o | x | 2.5 | |
| prep1/glm | o | x | x | o | x | 3 | |
| prep1/gauss-markov | o | d | o | x | x | 2.5 | |
| prep1/fisher-cramer-rao | o | d | x | d | x | 3 | |
| prep1/factor | o | d | d | d | x | 2.5 | |
| prep1/events-probability | o | d | x | o | - | 1.5 | |
| prep1/estimator-properties | o | d | x | o | x | 2.5 | |
| prep1/distributions | o | d | x | o | x | 2.5 | |
| prep1/discrete-distributions | o | x | x | o | - | 2 | |
| prep1/delta-method | o | d | x | o | x | 2.5 | |
| prep1/crossval | o | x | x | o | x | 3 | |
| prep1/correlation | o | d | d | o | - | 1 | |
| prep1/continuous-distributions | o | x | d | o | - | 1.5 | |
| prep1/contingency | d | d | d | d | x | 3 | |
| **prep1/confidence** | o | o | o | o | o | 0 | ✅Iter.3で深掘り済 |
| prep1/conditional-bayes | o | d | x | o | - | 1.5 | |
| prep1/clustering | o | x | x | d | - | 2.5 | |
| prep1/clt | o | d | x | o | x | 2.5 | |
| prep1/bootstrap | o | x | x | d | x | 3.5 | |
| prep1/blocking-designs | x | d | d | d | o | 2.5 | |
| prep1/bayes | o | d | x | o | x | 2.5 | |
| prep1/arima | o | x | d | o | x | 2.5 | |
| **prep1/anova1** | o | o | o | o | o | 0 | ✅Iter.4で深掘り済 |
| prep1/acf-pacf | o | d | x | d | x | 3 | |
| math/vectors-matrices | d | d | x | o | - | 2 | |
| math/matrix-ops | o | d | x | o | x | 2.5 | |
| math/linearization | d | d | x | d | x | 3.5 | |
| math/gradient | o | d | x | d | x | 3 | |
| math/eigen | o | o | x | o | - | 1 | |
| math/covariance-matrix | o | d | x | d | - | 2 | |
| doe/rsm-error | o | d | d | d | x | 2.5 | |
| doe/rsm | o | o | x | d | x | 2.5 | |
| doe/robust | o | x | o | d | - | 1.5 | |
| doe/d-optimal | o | d | d | o | x | 2 | |
| doe/ccd | o | x | x | o | x | 3 | |
| chemo/pls-da | o | x | x | d | x | 3.5 | |
| chemo/pls | o | d | x | d | x | 3 | |
| chemo/opls-da | o | x | x | d | - | 2.5 | |
| **prep1/regression** | o | o | o | o | o | 0 | ✅Iter.1で深掘り済 |

---

## 2026-07-05 — Iter.1

**対象トピック**: `prep1/regression`（線形回帰と最小二乗法）

**選定理由（依存関係優先）**: 回帰は multiple-regression / multicollinearity / regularization / gauss-markov / overfitting / regression-diagnostics / logistic / glm など約10の下流トピックが前提とする土台。ここを固めると波及効果が最大。初期状態は `odxox`（L3・L5欠落、L2は式のみで導出理由が薄い）。

**埋めた層**
- **L2（強化）**: 「なぜこの式になるか」を追記。二乗和の偏微分→正規方程式 $\sum(y_i-a-bx_i)=0,\ \sum x_i(y_i-a-bx_i)=0$ → 第1式で $a=\bar y-b\bar x$（直線は重心を通る）→ 第2式へ代入で $b=\mathrm{Cov}(x,y)/\mathrm{Var}(x)$。重回帰の $\hat{\boldsymbol\beta}=(X^\top X)^{-1}X^\top\boldsymbol y$ へのリンクも追加。
- **L3（新規）**: 前提条件の表を追加。線形性／誤差の独立性／等分散性／残差の正規性／外れ値・高てこ比 の5前提について「崩れると起きること」「対処・代替」を対にした。要点＝「点推定の不偏性は正規性不要（ガウス・マルコフ）、壊れやすいのは標準誤差＝推論」。
- **L5（新規）**: 有意性 vs 実質的意味を追記。$H_0:b=0$ の有意は「傾き≠0」を言うだけ。標準誤差 $\propto 1/\sqrt n$ ゆえ $n$ 大で無視できる傾きも有意化。$R^2$ 高≠因果。「有意か」でなく「$b$ の大きさ・信頼区間で読む」。
- **L4（微調整）**: 既存 note に、ノイズ（誤差分散 $\sigma^2$）を上げると $\hat b$ の標準誤差が増え有意性が落ちる＝「効果量が同じでも $n\cdot\sigma$ で結論が変わる」視覚化である旨を追記。

**検算結果**
- 正規方程式の導出: $\partial/\partial b:\ \Sigma xy-\bar y\Sigma x=b(\Sigma x^2-\bar x\Sigma x) \Rightarrow b=\Sigma(x-\bar x)(y-\bar y)/\Sigma(x-\bar x)^2=\mathrm{Cov}/\mathrm{Var}$。整合。✅
- $\mathrm{Var}(\hat b)=\sigma^2/\Sigma(x-\bar x)^2$、$\Sigma(x-\bar x)^2\propto n$ ゆえ $\mathrm{SE}(\hat b)\propto 1/\sqrt n$。整合。✅
- レンダリング検証: 追加した2つの h3・前提条件テーブルが表示、KaTeX エラー0、内部リンク5本（multiple-regression, gauss-markov, glm, regression-diagnostics, correlation）すべて実在トピックに解決（デッドリンク0）。

**次に深掘りすべきトピック**
- 連続回避のため次は regression 以外。候補: (1) `prep1/testing`（検定の土台、L3=前提の明示が薄い／`oxxoo`）を先に固めると検定系トピック群に波及。(2) `prep1/confidence`（CI、L3・L5）。(3) 最大gapの `prep1/mds-ca`(4.5) は+α・周辺なので優先度は中。依存関係を踏まえ **testing → confidence → mle** の順を検討。

## 2026-07-05 — Iter.2

**対象トピック**: `prep1/testing`（仮説検定・第1種/第2種の誤りと検出力）

**選定理由（依存関係優先・連続回避）**: 前回の regression と別トピック。testing は neyman-pearson / three-tests / normal-tests / goodness-of-fit / nonparametric / multiple-comparison など検定系トピック群の土台。初期状態 `oxxoo`（L2の形式化とL3が欠落）。

**埋めた層**
- **L2（新規）**: p値の定義 $p=P(T\ge t_{\mathrm{obs}}\mid H_0)$ と棄却域を追記。「棄却域を裾に置く理由＝ $H_0$ のもとで最も起こりにくい領域だから」を明示。両側／片側の割り当ても言及。
- **L3（新規）**: 「帰無分布が正しく求まっていること」が $\alpha$ を保つ前提だと明示。独立性（崩れると $\alpha$ 膨張→混合効果/クラスター頑健）、分布の仮定（正規性・等分散→ノンパラ/並べ替え/ウェルチ、大標本はCLTで緩和）、多重比較（→ボンフェローニ補正）を、崩れた時の影響と代替とセットで記述。頑健性と検出力のトレードオフも追記。
- **L5（強化）**: 「p値は $H_0$ が正しい確率ではない」「有意でない≠差がない（検出力不足）」「$n$ 大で無意味な差も有意化」→効果量と信頼区間で読む、サンプルサイズ設計へ誘導。

**検算結果**
- 右片側 p値の定義 $p=P(T\ge t_{\mathrm{obs}}\mid H_0)$、$p<\alpha$ で棄却——標準的定義と整合。✅
- 前提が崩れると名目 $\alpha$ と実 $\alpha$ が乖離する点、独立性違反で分散過小評価→偽陽性増、多重比較でFWER $=1-(1-\alpha)^m$ 膨張——いずれも整合（<a>multiple-comparison</a>デモと一致）。✅
- レンダリング: 追加h3×2表示、KaTeXエラー0、内部リンク3本（nonparametric, multiple-comparison, sample-size）すべて実在。デッドリンク0。

**次に深掘りすべきトピック**: 連続回避で testing 以外。`prep1/confidence`（信頼区間、L3・L5が薄い `odxox`）→ 検定と対の推論概念で土台。その後 `prep1/mle`・`prep1/distributions` の L3。

## 2026-07-05 — Iter.3

**対象トピック**: `prep1/confidence`（信頼区間の意味）

**選定理由**: 検定(testing)と対になる推論の土台。初期 `odxox`（L3・L5欠落、L2は式のみ）。

**埋めた層**
- **L2（強化）**: ピボット量 $T=(\bar x-\mu)/(s/\sqrt n)\sim t_{n-1}$ から $P(-t_{\alpha/2}\le T\le t_{\alpha/2})=1-\alpha$ を $\mu$ について解いて区間を導出、という「なぜ」を追記。分散既知なら $z$。
- **L3（新規）**: 正規性（崩れると被覆ずれ／大標本はCLTで緩和／小標本+歪みはブートストラップ）、独立性（崩れると SE 過小評価で区間が狭すぎ被覆不足）、外れ値（頑健区間）。区間幅 $\propto s/\sqrt n$、$n$4倍で幅半分・信頼水準↑で幅↑。
- **L5（新規）**: 信頼区間は検定より情報が多く効果量+不確かさを同時に示す。0を含む/含まないは検定と一致するが、実質判断の鍵は「幅」。$p$ の有無でなく区間の位置と幅で読む。

**検算結果**
- 区間導出: $-t\le(\bar x-\mu)/(s/\sqrt n)\le t \Rightarrow \bar x-t\,s/\sqrt n\le\mu\le\bar x+t\,s/\sqrt n$。整合。✅
- 幅 $\propto s/\sqrt n$、$n\times4\Rightarrow$ 幅 $\times1/2$。整合。✅
- レンダリング: h3×2表示、KaTeXエラー0、リンク（bootstrap）実在。デッドリンク0。

**次に深掘りすべきトピック**: `prep1/mle`（最尤推定、L3=正則条件・L5）、`prep1/distributions`（標本分布の前提）、`prep1/anova1`（ANOVAの前提=正規性・等分散・独立、崩れた時とKruskalWallis代替）。ANOVA系は前提の記述価値が高い。

## 2026-07-05 — Iter.4

**対象トピック**: `prep1/anova1`（一元配置分散分析）

**選定理由**: 検定・推定の土台を固めた次に、応用（実験計画法/DoE）の入り口である分散分析の前提を明示。ANOVA前提は準1級頻出かつ DoE 各トピックの前提。初期 `odxox`。

**埋めた層**
- **L2（強化）**: 「なぜ比で検定できるか」＝ $H_0$ 下では $MS_B,MS_W$ とも $\sigma^2$ の不偏推定で $F\approx1$、$H_1$ で $MS_B$ が膨らみ $F>1$。2群では $F=t^2$（$t$検定の一般化）。
- **L3（新規）**: 独立性（無作為化で担保／反復測定は混合効果）、正規性（$F$はやや頑健、小標本+歪みはクラスカル・ウォリス）、等分散性（不釣り合い時に第一種の誤り膨張→ウェルチ、レヴィン検定で事前確認）。有意な $F$ の後は事後検定（テューキー/多重比較）へ、も明示。
- **L5（新規）**: 効果量 $\eta^2=SS_B/SS_T$・$\omega^2$。$n$大で微小差も有意化するため $\eta^2$ と群平均CIを併読。

**検算結果**
- 2群で $F=t^2$：一元配置($k=2$)の $F$ は自由度$(1,N-2)$で $t_{N-2}^2$ に一致。整合。✅
- $\eta^2=SS_B/SS_T$（説明分散割合、0〜1）。整合。✅
- レンダリング: h3×2、KaTeXエラー0、リンク（principles, nonparametric, multiple-comparison）実在。デッドリンク0。

**次に深掘りすべきトピック**: `prep1/mle`（正則条件・不変性・L5）、`prep1/distributions`（標本分布の成立条件）、`prep1/pca`（前提=スケール依存/線形性、標準化の要否、L4接続）。多変量系(pca/lda)はL3・L5が薄く価値高。
