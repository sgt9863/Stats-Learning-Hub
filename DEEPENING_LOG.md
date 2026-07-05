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
| prep1/testing | o | x | x | o | o | 2 | |
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
| prep1/confidence | o | d | x | o | x | 2.5 | |
| prep1/conditional-bayes | o | d | x | o | - | 1.5 | |
| prep1/clustering | o | x | x | d | - | 2.5 | |
| prep1/clt | o | d | x | o | x | 2.5 | |
| prep1/bootstrap | o | x | x | d | x | 3.5 | |
| prep1/blocking-designs | x | d | d | d | o | 2.5 | |
| prep1/bayes | o | d | x | o | x | 2.5 | |
| prep1/arima | o | x | d | o | x | 2.5 | |
| prep1/anova1 | o | d | x | o | x | 2.5 | |
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
