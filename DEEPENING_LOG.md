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
| **prep1/timeseries** | o | o | o | o | o | 0 | ✅Iter.13 |
| **prep1/three-tests** | o | o | o | o | o | 0 | ✅Iter.14 |
| **prep1/testing** | o | o | o | o | o | 0 | ✅Iter.2で深掘り済 |
| prep1/svm | o | d | d | o | x | 2 | |
| prep1/survival | o | d | d | d | x | 2.5 | |
| **prep1/sufficiency** | o | o | o | o | o | 0 | ✅Iter.16 |
| prep1/stochastic-process | o | x | x | o | x | 3 | |
| prep1/sampling-survey | o | d | d | o | - | 1 | |
| prep1/sample-size | o | d | x | o | o | 1.5 | |
| prep1/roc-auc | o | x | x | o | - | 2 | |
| prep1/regularization | o | d | x | d | x | 3 | |
| prep1/regression-diagnostics | o | x | o | o | x | 2 | |
| prep1/random-variables | o | x | x | o | - | 2 | |
| prep1/principles | d | x | x | o | o | 2.5 | |
| **prep1/pca** | o | o | o | o | - | 0 | ✅Iter.6 |
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
| **prep1/multiple-regression** | o | o | o | o | o | 0 | ✅Iter.10 |
| prep1/multiple-comparison | o | d | x | o | o | 1.5 | |
| prep1/multicollinearity | o | d | d | d | x | 2.5 | |
| prep1/monte-carlo | o | d | x | o | x | 2.5 | |
| prep1/moments-shape | o | x | x | d | - | 2.5 | |
| prep1/moment-method | o | d | x | x | x | 3.5 | |
| prep1/model-selection | o | d | x | o | x | 2.5 | |
| **prep1/mle** | o | o | o | o | o | 0 | ✅Iter.5 |
| prep1/missing-data | o | x | d | o | x | 2.5 | |
| prep1/mgf | o | o | x | o | - | 1 | |
| **prep1/mds-ca** | o | o | o | o | o | 0 | ✅Iter.15 |
| prep1/mcmc | d | x | x | d | - | 3 | |
| prep1/markov-chain | o | d | x | d | - | 2 | |
| **prep1/logistic** | o | o | o | o | o | 0 | ✅Iter.9 |
| prep1/log-linear | o | d | d | x | x | 3 | |
| prep1/lln | o | d | x | d | - | 2 | |
| **prep1/lda** | o | o | o | o | o | 0 | ✅Iter.7 |
| prep1/kmeans | o | d | x | o | - | 1.5 | |
| prep1/joint-distribution | o | x | x | d | - | 2.5 | |
| prep1/interaction | o | d | x | o | - | 1.5 | |
| prep1/goodness-of-fit | o | d | x | o | x | 2.5 | |
| **prep1/glm** | o | o | o | o | o | 0 | ✅Iter.12 |
| prep1/gauss-markov | o | d | o | x | x | 2.5 | |
| prep1/fisher-cramer-rao | o | d | x | d | x | 3 | |
| prep1/factor | o | d | d | d | x | 2.5 | |
| prep1/events-probability | o | d | x | o | - | 1.5 | |
| prep1/estimator-properties | o | d | x | o | x | 2.5 | |
| **prep1/distributions** | o | o | o | o | o | 0 | ✅Iter.8 |
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
| **prep1/bayes** | o | o | o | o | o | 0 | ✅Iter.11 |
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

## 2026-07-05 — Iter.5-7（推定と多変量の土台）

**Iter.5 `prep1/mle`（最尤推定）** — 初期 `ooxox`
- L3新規: 正則条件下の性質（一致性・漸近正規性・漸近有効性=CRLB達成・不変性）。破綻例=台がθに依存する $U(0,\theta)$ は標本最大値で下ぶれ。小標本の偏り（正規分散のMLEは $1/n$ で下ぶれ）。モデル誤特定に弱い→頑健/準最尤。
- L5新規（点推定だけで終わらせない）: $\mathrm{SE}(\hat\theta)\approx1/\sqrt{nI(\hat\theta)}$、信頼区間・尤度比検定と併読。モデル誤りなら「狭い区間で自信満々に間違える」。
- 検算: $E[X_{(n)}]=n\theta/(n+1)<\theta$（U(0,θ)のMLEは下ぶれ）✅／正規分散MLE $E=\frac{n-1}{n}\sigma^2$ 下ぶれ✅。

**Iter.6 `prep1/pca`（主成分分析）** — 初期 `odxd-`（L5は非該当）
- L2強化: 「なぜ固有ベクトル」= $\max \boldsymbol w^\top\Sigma\boldsymbol w$ s.t. $\|\boldsymbol w\|=1$ → ラグランジュ → $\Sigma\boldsymbol w=\lambda\boldsymbol w$。math/eigen へリンク。
- L3新規: スケール依存（標準化/相関行列）、線形性のみ（カーネルPCA）、外れ値敏感（頑健PCA）、「分散大≠有用」（LDA/PLSと対照）。探索的手法で検定ではない旨。
- 検算: ラグランジュ条件 $\Sigma\boldsymbol w=\lambda\boldsymbol w$、分散=λ ✅。

**Iter.7 `prep1/lda`（線形判別）** — 初期 `odxdx`
- L2強化: $J(\boldsymbol w)$ 最大化 → 一般化固有値問題 $S_B\boldsymbol w=\lambda S_W\boldsymbol w$、2群解 $\boldsymbol w\propto S_W^{-1}(\bar{\boldsymbol x}_1-\bar{\boldsymbol x}_2)$。
- L3新規: 等共分散・多変量正規の前提（成立時はベイズ最適線形分類器）、共分散が違えばQDA、非正規ならロジスティック/SVMが頑健（頑健性↔効率）。
- L5新規: 正解率だけで測らない（不均衡）、ROC/AUC・混同行列・コスト/プライアでしきい値。
- 検算: 2群フィッシャー解 $\boldsymbol w\propto S_W^{-1}(\bar{\boldsymbol x}_1-\bar{\boldsymbol x}_2)$ ✅。

いずれも node --check OK / KaTeXエラー0 / 内部リンク実在（デッドリンク0）。

**次に深掘りすべきトピック**: `prep1/distributions`（標本分布 t/χ²/F の成立条件・自由度→∞でのt→正規）、`prep1/logistic`（前提=線形性オンロジット・独立、分離時の発散、L5）、`prep1/multiple-regression`（既存L2厚い→L3/L5補強）。

## 2026-07-05 — Iter.8（ここでループを一区切り）

**対象**: `prep1/distributions`（確率分布ギャラリー）
- L3新規: t/χ²/F は「元データが正規」から導かれる（$(n-1)s^2/\sigma^2\sim\chi^2_{n-1}$ 等）。正規性が崩れると平均系はCLTで緩和されるが分散系（χ²/F）は敏感。独立性＝自由度の意味。
- L2/L4強化: 極限 $t_k\to N(0,1)$, $\chi^2_k/k\to1$, $F\to1$ を明記し、デモで「自由度↑でtが正規に重なる」確認を明示。
- 検算: $t$ の分散 $k/(k-2)\to1$ (k→∞)、$E[\chi^2_k/k]=1$。✅

**ループ停止（ユーザー指示）**: 8トピック（regression, testing, confidence, anova1, mle, pca, lda, distributions）を5層化した時点で停止。残る候補と優先順は本ログのマトリクス参照（次点: logistic, multiple-regression, bayes, glm, timeseries）。

## 2026-07-06 — 再開: Iter.9-13（回帰の応用と推論の広がり）

前回申し送りの次点5トピックを一括で5層化。いずれも node --check OK / KaTeXエラー0 / 内部リンク実在（デッドリンク0、サンドボックス描画検証済）。

**Iter.9 `prep1/logistic`（ロジスティック回帰）** — 初期 `odxdx`
- L2強化: ロジット $\ln\frac{p}{1-p}=a+bx$（オッズの対数が線形）→係数の意味は $e^b$＝オッズ比。ベルヌーイ尤度→対数尤度 $\ell=\sum[y\ln p+(1-y)\ln(1-p)]$ の最尤推定、閉形式なし→IRLS。GLMの代表例としてリンク。
- L3新規: 前提表（ロジット線形性／独立性／完全分離なし／イベント数EPV≥10）。完全分離でMLE発散（$|\hat b|\to\infty$）→正則化・Firth。デモの「分離度↑で傾きがいくらでも急にできる」との接続を明記。
- L5新規: Wald検定の有意とオッズ比の効果量は別。ROC/AUC・不均衡時の適合率再現率・キャリブレーション。
- 検算: ロジット逆変換・オッズ比 $e^b$／完全分離の尤度単調増加。✅

**Iter.10 `prep1/multiple-regression`（重回帰と計画行列）** — 初期 `odxdx`
- L2強化: 正規方程式 $X^\top X\boldsymbol\beta=X^\top\boldsymbol y$ と「$\hat{\boldsymbol y}$ は列空間への直交射影（残差が全説明変数と直交）」の幾何。単回帰の「重心を通る」の一般化。
- L3新規: 重回帰固有の前提表（フルランク／強い共線性なし／$n\gg p$（$p{+}1{=}n$で完全適合）／欠落変数バイアス）。
- L5新規: 全体F vs 個々のt（「他の変数を入れたうえで」の意味）、共線性で両方非有意になる症状、標準化偏回帰係数、調整済み$R^2$/AIC。
- 検算: 残差直交性 $X^\top(\boldsymbol y-X\hat{\boldsymbol\beta})=0$／$R^2$の単調非減少。✅

**Iter.11 `prep1/bayes`（ベイズ推定）** — 初期 `odxox`
- L2強化: 共役性の「なぜ」（$\theta^{k}(1-\theta)^{n-k}\times\theta^{a-1}(1-\theta)^{b-1}$ が同形）と、事後平均＝事前平均と標本比率の重み付き平均 $\frac{a+k}{a+b+n}=\frac{a+b}{a+b+n}\frac{a}{a+b}+\frac{n}{a+b+n}\frac{k}{n}$。
- L3新規: 事前の感度（小標本）／モデル誤特定は頻度論と同じ弱点（事後予測チェック）／共役は便宜→MCMCへ。
- L5新規: 信用区間 vs 信頼区間の解釈差、$P(\theta>0.5\mid D)$ 型の直接回答、分布の幅ごと報告。
- 検算: 事後 $\mathrm{Beta}(a+k,b+n-k)$・重み付き平均分解の恒等式。✅

**Iter.12 `prep1/glm`（一般化線形モデル）** — 初期 `oxxox`
- L2新規: リンク関数の必然性（$\mu$ の範囲制約と $\eta\in\mathbb R$ の橋渡し）、分散が分布から決まる（二項 $\mu(1-\mu)$・ポアソン $\mu$）＝等分散を仮定しない、逸脱度と尤度比検定。
- L3新規: 前提表（分布指定=過分散→負の二項/準ポアソン／リンク上の線形性／独立性→GLMM/GEE／ゼロ過剰→ZIP）。
- L5新規: 係数はリンク逆変換で読む（対数リンク→率比 $e^\beta$）、過分散無視の「有意」は見かけ。
- 検算: ポアソン $\mathrm{Var}=\mu$・二項分散・入れ子モデルの逸脱度差$\sim\chi^2$。✅

**Iter.13 `prep1/timeseries`（時系列の基礎）** — 初期 `dddox`
- L1/L2強化: 弱定常の3条件を明示。定常条件の導出 $v=\phi^2v+\sigma^2\Rightarrow v=\sigma^2/(1-\phi^2)$（$|\phi|\ge1$で正の解なし＝非定常の正体）、$\rho_k=\phi^k$。
- L3強化: 前提表（定常性→見せかけの回帰・ADF・階差／構造変化／残差の無相関→ACF/PACF診断）。
- L5新規: 実効標本サイズ $n_{\mathrm{eff}}\approx n\frac{1-\phi}{1+\phi}$（$\phi=0.7$で約18%）→独立標本用SEは過小評価。「時系列の有意はまず定常性と残差診断から」。
- 検算: $v=1/(1-0.49)=1.96$（$\phi=0.7,\sigma=1$）・$n_{\mathrm{eff}}/n=0.176$。✅

**次に深掘りすべきトピック**（gap大・依存関係順）: `prep1/mds-ca`(4.5, L1から欠落), `prep1/three-tests`(3.5), `prep1/sufficiency`(3.5), `prep1/bootstrap`(3.5), `prep1/orthogonal`(3.5), `prep1/moment-method`(3.5), `chemo/pls-da`(3.5)。検定論の土台として three-tests（尤度比/ワルド/スコア）を優先推奨。

## 2026-07-06 — Iter.14

**対象トピック**: `prep1/three-tests`（尤度比・ワルド・スコア検定）

**選定理由**: 前回申し送りの優先推奨。gap 3.5（L2=式のみで導出理由なし、L3欠落、L5欠落）。GLM・ロジスティック・比率検定など下流の「係数のz検定はワルド」という文脈の土台になる。

**埋めた層**
- **L2（新規）**: 「なぜどれも $\chi^2_1$ か」＝スコア $U(\theta_0)$ が $H_0$ 下で平均0・分散 $I(\theta_0)$、CLTで正規→標準化2乗が $\chi^2_1$。対数尤度を頂点まわりの放物線で近似すればLR・Waldも同じ量に一致（漸近同値の理由は「曲線が放物線に近づく」の一言）。
- **L3（新規）**: 正則条件（内点・情報量正・モデル正）、境界上の検定は混合分布、小標本は正確検定。3検定のトレードオフ表（必要な当てはめ／長所／弱点）：LR=不変で信頼・計算重、Wald=楽だが再パラメータ化非不変＋ハウク・ドナー現象、Score=帰無のみで計算・検出力やや弱。「迷ったら尤度比」。
- **L5（新規）**: デモ初期値（p₀=0.5, p̂=0.65, n=40）で Wald=3.96 のみ棄却・LR=3.66/Score=3.60 は非棄却——検定選択で結論が割れる実例。効果量と信頼区間で報告。Wald区間は端で壊れる→Wilson区間。
- **L4（強化）**: note に「n小・p̂端で3つの差が開く＝検定選択が結論を変える領域」を追記。

**検算結果**
- p₀=0.5, p̂=0.65, n=40: LR=3.656, Wald=3.956, Score=3.600（χ²(1)5%=3.841）。Waldのみ棄却。デモ実装の式（W=(p̂-p₀)²n/(p̂(1-p̂))、U²/I(p₀)）と一致。✅
- スコアの性質: E[U]=0, Var(U)=I(θ₀)——ベルヌーイで U=k/p₀-(n-k)/(1-p₀), I=n/(p₀(1-p₀))。✅
- レンダリング: h3×2、KaTeXエラー0、内部リンク（fisher-cramer-rao, logistic）実在。デッドリンク0。

**次に深掘りすべきトピック**: `prep1/mds-ca`（最大gap 4.5、L1直感から欠落）、`prep1/sufficiency`（推定論の土台）、`prep1/bootstrap`（計算統計の入口・L5含む）。

## 2026-07-06 — Iter.15

**対象トピック**: `prep1/mds-ca`（多次元尺度法・対応分析・正準相関）

**選定理由**: マトリクス最大gap（4.5）。L1直感（3手法の使い分け）から欠けており、多変量セクションの「PCA以外」の見取り図として先に固める価値が高い。

**埋めた層**
- **L1（新規）**: 「データの形で手法を選ぶ」導入——生の変数行列→PCA／距離だけ→MDS／分割表→CA／変数2群→CCA。目的は同じで入力が違うだけ、という整理。
- **L2（新規）**: MDSの核心恒等式 $d_{ij}^2=\|\boldsymbol x_i\|^2+\|\boldsymbol x_j\|^2-2\boldsymbol x_i^\top\boldsymbol x_j$ →二重中心化で $B=-\frac12JD^2J=XX^\top$（グラム行列）→固有分解×$\sqrt\lambda$ で座標。回転・鏡像不定の原理（内積の回転不変性）。CA＝独立期待値からの乖離 $(p_{ij}-r_ic_j)/\sqrt{r_ic_j}$ のSVD（総慣性$=\chi^2/n$）、CCA＝相関最大 vs PLS＝共分散最大 vs 回帰＝予測、の三つ巴対比。
- **L3（新規）**: 前提表——計量MDSはユークリッド距離（破れると負固有値→非計量MDS）、CAは疎セル・希少カテゴリで不安定、CCAは $n>$ 変数総数（小標本で正準相関→1の過学習、正則化CCA）。3手法とも探索的で検定の枠組みではない。
- **L5（新規）**: 寄与率を見ずに布置図の近さを読まない。CAの行点×列点間距離は直接解釈不可（有名な注意点）。CCAの高相関は過学習の可能性→交差検証。
- **L4（強化）**: note に「真の配置が2次元だから固有値上位2つで完全復元（回転・鏡像を除く）。3次元以上なら歪み＝残りの固有値」を明記し、デモと式 $B=-\frac12JD^2J$ を直結。

**検算結果**
- 二重中心化恒等式: 3点 (0,0),(3,0),(0,4) で $B$ と中心化座標のグラム行列を数値比較、max誤差 1.8e-15。✅
- レンダリング: h3×5、KaTeXエラー0、内部リンク（pca, eigen, contingency, pls, multicollinearity）実在。デモ draw() 実行で例外なし。✅

**次に深掘りすべきトピック**: `prep1/sufficiency`（十分統計量、gap 3.5・推定論の土台）、`prep1/bootstrap`（gap 3.5）、`prep1/moment-method`（gap 3.5）。

## 2026-07-06 — Iter.16

**対象トピック**: `prep1/sufficiency`（十分統計量とネイマンの分解定理）

**選定理由**: gap 3.5・推定論の土台。かつ85トピック中の数少ない「デモなし」トピックで、L4の実体が存在しなかった。

**埋めた層**
- **L2（強化）**: 正規（分散既知）の分解を実演——平方和の分解 $\sum(x_i-\mu)^2=\sum(x_i-\bar x)^2+n(\bar x-\mu)^2$（クロス項消滅）を尤度に代入して $g(\bar x,\mu)\cdot h(\boldsymbol x)$ を明示。「尤度が θ とデータを T を通してしか結びつけない」という分解定理の読み方。ベルヌーイ・ポアソンも $g\cdot h$ の形で提示。
- **L3（新規）**: 十分性はモデル相対的（正規前提が崩れれば保証ごと消える）。モデル内効率 vs モデル外頑健性（中央値・トリム平均）のトレードオフ。十分統計量の非一意性と最小十分統計量。
- **L5（新規・実務での意味）**: 報告書が $(n,\bar x,s^2)$ で済む理由＝結合十分統計量。ただし外れ値・二峰性等「モデル外の情報」は要約で消える——「推論は要約から、診断は生データから」。
- **L4（新規デモ追加）**: 学習目標「十分な要約は尤度曲線を変えない」を直接可視化。要約の仕方（x̄／最初の半分／最初の5個）を切り替えると、全データの尤度曲線（青）と要約からの尤度曲線（橙破線）が x̄ では完全一致、不十分な要約では平らに広がる。仕様: 操作パラメータ=要約方法・n／確認させたい挙動=曲線の一致/拡幅／対応する数式=$L(\mu)\propto e^{-k(\bar x_k-\mu)^2/2}$。

**検算結果**
- 平方和の分解恒等式: n=20 の乱数データ・μ=0.37 で両辺一致（差 0.0）。✅
- デモ実行: summary 3種×境界（n=10, n=100）で例外なし。視覚確認——x̄ で2曲線一致、5個で拡幅を確認（スクリーンショット検証）。✅
- レンダリング: h3×3、KaTeXエラー0、内部リンク（fisher-cramer-rao, mle）実在。✅

**次に深掘りすべきトピック**: `prep1/bootstrap`（gap 3.5・計算統計の入口）、`prep1/moment-method`（gap 3.5）、`prep1/orthogonal`（gap 3.5・DoEの土台）。
