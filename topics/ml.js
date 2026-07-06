'use strict';
/* 機械学習 */
(function () {
  const T = (window.STATS_TOPICS = window.STATS_TOPICS || []);
  const S = () => window.Stats;
  const P = () => window.Plot;

  /* --- 1. 単回帰と最小二乗法 --- */
  T.push({
    section: 'prep1', group: '回帰分析', id: 'regression', title: '線形回帰と最小二乗法',
    summary: '「残差の二乗和を最小にする直線」を引く最小二乗法を、点を動かしながら回帰直線と決定係数の変化で体感します。',
    body: `
<p>線形回帰は、説明変数 $x$ から目的変数 $y$ を直線 $\\hat{y}=a+bx$ で予測するモデルです。<strong>最小二乗法</strong>は、実測値と予測値のズレ（残差）の二乗和を最小にする $a,b$ を選びます。</p>
<p>$$ \\min_{a,b}\\sum_{i=1}^{n}\\bigl(y_i - (a+bx_i)\\bigr)^2 \\;\\Rightarrow\\; b=\\frac{\\mathrm{Cov}(x,y)}{\\mathrm{Var}(x)},\\; a=\\bar{y}-b\\bar{x} $$</p>
<p><strong>なぜこの式になるか</strong>：二乗和を $a,b$ で偏微分して0とおくと<strong>正規方程式</strong> $\\sum(y_i-a-bx_i)=0$ と $\\sum x_i(y_i-a-bx_i)=0$ が得られます。第1式から $a=\\bar y-b\\bar x$（＝回帰直線は必ず重心 $(\\bar x,\\bar y)$ を通る）。これを第2式に代入して整理すると $b=\\mathrm{Cov}(x,y)/\\mathrm{Var}(x)$。傾きは「$x$ と $y$ の連動（共分散）を $x$ の広がり（分散）で割った量」だと読めます。複数の説明変数へ一般化すると計画行列で $\\hat{\\boldsymbol\\beta}=(X^\\top X)^{-1}X^\\top\\boldsymbol y$（<a href="#/prep1/multiple-regression">重回帰</a>）。</p>
<p>あてはまりの良さは<strong>決定係数 $R^2$</strong> で測ります。$R^2=1$ なら完全に直線上、$R^2=0$ なら $x$ は $y$ の予測に役立ちません。</p>
<p>$$ R^2 = 1 - \\frac{\\sum (y_i-\\hat{y}_i)^2}{\\sum (y_i-\\bar{y})^2} $$</p>
<h3>前提条件と、崩れたときの影響</h3>
<p>係数の点推定 $\\hat b$ が「最良（分散最小）の線形不偏推定量」になる前提が<a href="#/prep1/gauss-markov">ガウス・マルコフの定理</a>で、区間推定・検定にはさらに残差の正規性を加えます。</p>
<table class="simple">
<tr><th>前提</th><th>崩れると起きること</th><th>対処・代替</th></tr>
<tr><td>線形性</td><td>残差に系統的な曲がりが残り、予測が偏る</td><td>変数変換・多項式回帰・<a href="#/prep1/glm">GLM</a></td></tr>
<tr><td>誤差の独立性</td><td>系列相関で標準誤差を過小評価 → 見かけ上有意になりやすい</td><td>一般化最小二乗(GLS)・DW比で診断</td></tr>
<tr><td>等分散性</td><td>係数は不偏だが標準誤差が誤り、$t$・$F$ 検定が歪む</td><td>加重最小二乗・頑健(ロバスト)標準誤差</td></tr>
<tr><td>残差の正規性</td><td>小標本で $t$・$F$ 検定・信頼区間が不正確</td><td>大標本なら中心極限定理で緩和／ブートストラップ</td></tr>
<tr><td>外れ値・高てこ比</td><td>少数の点が直線を大きく歪める</td><td>頑健回帰(Huber)・<a href="#/prep1/regression-diagnostics">回帰診断</a></td></tr>
</table>
<p>要点は「<strong>点推定の不偏性は正規性を要さない</strong>（ガウス・マルコフ）。壊れやすいのは主に標準誤差＝<em>推論</em>のほう」という区別です。</p>
<h3>有意性と実質的な意味</h3>
<p>傾きの検定 $H_0:b=0$ が有意でも、それは「傾きが0ではない」を示すだけで、<strong>効果量（傾きの大きさ）と実務的な重要性は別問題</strong>です。標準誤差は $\\propto 1/\\sqrt n$ なので、サンプルサイズ $n$ が大きいほど<strong>実質的に無視できる小さな傾きでも有意</strong>になります。逆に $R^2$ が高くても因果とは限りません（<a href="#/prep1/correlation">相関≠因果</a>）。「有意か」ではなく「どれだけ効くか（$b$ の大きさと信頼区間）」で読むのが実務的な姿勢です。</p>
<div class="note">下で「真の傾き」と「ノイズ」を変えると、散布図・回帰直線・R²が更新されます。灰色の縦線が残差。ノイズ（誤差分散 $\\sigma^2$）を増やすと点が散らばり $R^2$ が下がります。傾きが同じでもノイズが大きいと $\\hat b$ の不確かさ（標準誤差）が増え、有意性が落ちる——これが「効果量が同じでも $n$・$\\sigma$ で結論が変わる」ことの視覚化です。</div>`,
    demo: {
      note: '赤い直線が最小二乗回帰直線、灰色の縦線が各点の残差。ノイズが大きいほど残差が伸び、R²（あてはまりの良さ）が下がります。',
      controls: [
        { type: 'range', id: 'slope', label: '真の傾き', min: -2, max: 2, step: 0.2, value: 1 },
        { type: 'range', id: 'noise', label: 'ノイズの大きさ', min: 0, max: 5, step: 0.25, value: 1.5 },
        { type: 'range', id: 'n', label: 'データ数', min: 5, max: 80, step: 5, value: 30 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(11 + (p.reseed | 0) * 47);
        const n = Math.round(p.n);
        const xs = [], ys = [];
        for (let i = 0; i < n; i++) {
          const x = -5 + 10 * rand();
          xs.push(x);
          ys.push(2 + p.slope * x + p.noise * st.randn(rand));
        }
        const b = st.cov(xs, ys) / (st.sd(xs) ** 2 || 1e-9);
        const a = st.mean(ys) - b * st.mean(xs);
        const yhat = xs.map(x => a + b * x);
        const ybar = st.mean(ys);
        let ssr = 0, sst = 0;
        for (let i = 0; i < n; i++) { ssr += (ys[i] - yhat[i]) ** 2; sst += (ys[i] - ybar) ** 2; }
        const r2 = 1 - ssr / (sst || 1e-9);
        const ymin = Math.min.apply(null, ys) - 1, ymax = Math.max.apply(null, ys) + 1;
        const pl = Pl.make(canvas, { xmin: -6, xmax: 6, ymin, ymax });
        pl.clear(); pl.axes({ xLabel: 'x', yLabel: 'y' });
        // 残差
        for (let i = 0; i < n; i++) pl.line([[xs[i], ys[i]], [xs[i], yhat[i]]], { color: Pl.gray, width: 1, alpha: 0.5 });
        pl.scatter(xs.map((x, i) => [x, ys[i]]), { color: Pl.colors[0], r: 3.5, alpha: 0.75 });
        pl.line([[-6, a + b * -6], [6, a + b * 6]], { color: Pl.colors[1], width: 2.5 });
        pl.text(-6, ymax, 'ŷ = ' + a.toFixed(2) + ' + ' + b.toFixed(2) + 'x', { align: 'left', baseline: 'top', dx: 60, dy: 4, color: Pl.colors[1], size: 13 });
        pl.text(-6, ymax, 'R² = ' + r2.toFixed(3), { align: 'left', baseline: 'top', dx: 60, dy: 24, color: Pl.ink, size: 13 });
      },
    },
  });

  /* --- 2. 過学習と正則化 --- */
  T.push({
    section: 'prep1', group: '回帰分析', id: 'overfitting', title: '過学習・バイアスとバリアンス',
    summary: 'モデルを複雑にしすぎると訓練データに過剰適合する——多項式の次数を上げながら、あてはめ曲線が暴れる様子を観察します。',
    body: `
<p>モデルの複雑さを上げると訓練データへのあてはまりは良くなりますが、あるところから<strong>未知データへの予測が悪化</strong>します。これが<strong>過学習（オーバーフィッティング）</strong>です。</p>
<p>予測誤差は次のように分解できます（バイアス・バリアンス分解）。</p>
<p>$$ \\text{期待誤差} = \\underbrace{\\text{バイアス}^2}_{\\text{単純すぎる歪み}} + \\underbrace{\\text{バリアンス}}_{\\text{複雑すぎる不安定さ}} + \\text{ノイズ} $$</p>
<ul>
<li><strong>単純すぎるモデル</strong>（低次）：バイアス大・バリアンス小 → 訓練でも当たらない（過少適合）</li>
<li><strong>複雑すぎるモデル</strong>（高次）：バイアス小・バリアンス大 → 訓練は完璧だが新データで外す（過学習）</li>
</ul>
<h3>なぜこの3成分に分かれるか</h3>
<p>ある点 $x_0$ での予測 $\\hat f(x_0)$ の期待二乗誤差を、真値 $f(x_0)$ とノイズ $\\varepsilon$（分散 $\\sigma^2$）について展開します。$\\hat f$ の平均予測 $E[\\hat f]$ を挟んで整理すると、交差項が期待値0で消え、</p>
<p>$$ E\\big[(y-\\hat f)^2\\big]=\\underbrace{(f-E[\\hat f])^2}_{\\text{バイアス}^2}+\\underbrace{E[(\\hat f-E[\\hat f])^2]}_{\\text{バリアンス}}+\\underbrace{\\sigma^2}_{\\text{ノイズ}} $$</p>
<p>という<a href="#/prep1/estimator-properties">MSE分解</a>の予測版が出ます。<strong>バイアスは「モデルの平均が真値からどれだけずれるか（表現力不足）」、バリアンスは「データを引き直すと予測がどれだけ暴れるか（過敏さ）」、ノイズは減らせない下限</strong>。モデルを複雑にするとバイアスは減るがバリアンスが増える——両者の和が最小になる複雑さが最適で、<strong>バイアスとバリアンスはトレードオフ</strong>です。<a href="#/prep1/regularization">正則化</a>は「少しバイアスを足してバリアンスを大きく削る」操作だと読めます。</p>
<h3>前提と、実質的な注意</h3>
<p>「訓練誤差が小さい＝良いモデル」は誤りで、複雑にすれば訓練誤差はいくらでも下げられます（訓練データを丸暗記）。評価すべきは<strong>汎化誤差</strong>で、そのために<a href="#/prep1/crossval">交差検証</a>やホールドアウトで「学習に使っていないデータ」の誤差を測ります。過学習の大きさは、訓練当てはめの $R^2$ と交差検証の予測力 $Q^2$ の<strong>ギャップ $R^2-Q^2$</strong> として一目で測れます（<a href="#/prep1/crossval">Q²</a>）。前提として、訓練データとテストデータが<strong>同じ分布から来ている</strong>ことが要ります——これが崩れる（分布シフト・時間的ドリフト・標本の偏り）と、交差検証で良くても本番で外します。またデータ数 $n$ が増えるとバリアンスは下がるので、<strong>「複雑なモデルが過学習するか」はモデルの複雑さと $n$ の比で決まる</strong>点も重要です（$n$ が十分なら高次でも過学習しにくい）。近年の「二重降下」など、古典的なU字が単純に当てはまらない現象もありますが、まずはこのトレードオフを基準に考えます。</p>
<div class="note">下で多項式の次数を上げると、曲線が全ての訓練点（青）を通ろうとしてグニャグニャに暴れ、点のない場所で大きく外れます。真の関数（灰の点線）から離れていく様子が過学習です。データ数を増やすと同じ次数でも暴れが収まる（バリアンス減）ことも確かめ、ちょうど良い次数を探してください。</div>`,
    demo: {
      note: '次数を上げると訓練点にはよく合いますが、点の間で激しく振動し真の曲線（点線）から乖離します。「訓練誤差は下がるが汎化は悪化」を体感できます。',
      controls: [
        { type: 'range', id: 'degree', label: '多項式の次数', min: 1, max: 12, step: 1, value: 3 },
        { type: 'range', id: 'noise', label: 'ノイズ', min: 0, max: 1.2, step: 0.1, value: 0.4 },
        { type: 'range', id: 'n', label: '訓練データ数', min: 6, max: 25, step: 1, value: 12 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(3 + (p.reseed | 0) * 61);
        const n = Math.round(p.n);
        const trueF = x => Math.sin(x * 1.4) + 0.3 * x;
        const xs = [], ys = [];
        for (let i = 0; i < n; i++) {
          const x = -3 + 6 * (i / (n - 1)) + (rand() - 0.5) * 0.3;
          xs.push(x); ys.push(trueF(x) + p.noise * st.randn(rand));
        }
        const deg = Math.round(p.degree);
        const coef = polyfit(xs, ys, deg);
        const grid = st.linspace(-3.2, 3.2, 200);
        const pl = Pl.make(canvas, { xmin: -3.3, xmax: 3.3, ymin: -3, ymax: 3.5 });
        pl.clear(); pl.axes({ xLabel: 'x', yLabel: 'y' });
        pl.line(grid.map(x => [x, trueF(x)]), { color: Pl.gray, dash: [5, 4], width: 2 });
        pl.line(grid.map(x => [x, polyval(coef, x)]), { color: Pl.colors[1], width: 2.5 });
        pl.scatter(xs.map((x, i) => [x, ys[i]]), { color: Pl.colors[0], r: 4 });
        let trainErr = 0;
        for (let i = 0; i < n; i++) trainErr += (ys[i] - polyval(coef, xs[i])) ** 2;
        pl.legend([{ label: '真の関数', color: Pl.gray }, { label: deg + '次あてはめ', color: Pl.colors[1] }]);
        pl.text(-3.3, -3, '訓練誤差(MSE) = ' + (trainErr / n).toFixed(3), { align: 'left', baseline: 'bottom', dx: 60, dy: -6, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- 3. ロジスティック回帰 --- */
  T.push({
    section: 'prep1', group: '回帰分析', id: 'logistic', title: 'ロジスティック回帰（分類）',
    summary: '確率を0〜1に収める「シグモイド関数」で2クラス分類を行う仕組みと、決定境界の考え方を見ます。',
    body: `
<p>分類問題では、出力を確率（0〜1）にしたい。線形回帰の出力を<strong>シグモイド関数</strong>に通すのがロジスティック回帰です。</p>
<p>$$ P(y=1\\mid x) = \\sigma(a+bx) = \\frac{1}{1+e^{-(a+bx)}} $$</p>
<p>$\\sigma(z)$ は $z$ が大きいほど1、小さいほど0に近づくS字曲線。$P=0.5$ となる境界（$a+bx=0$）が<strong>決定境界</strong>です。傾き $b$ の大きさは境界の「切れ味」（確率が0→1へ変わる急さ）を決めます。</p>
<p>式を裏返すと $\\ln\\dfrac{p}{1-p}=a+bx$——<strong>オッズの対数（ロジット）が $x$ の1次式</strong>という仮定です。だから係数の意味は明快で、$x$ が1増えるとオッズが $e^{b}$ 倍（オッズ比）。ロジスティック回帰は、リンク関数にロジットを使う<a href="#/prep1/glm">一般化線形モデル</a>の代表例です。</p>
<p>学習では<strong>対数尤度</strong>（＝交差エントロピー誤差の符号反転）を最大化します。回帰の最小二乗ではなく、確率モデルとしての当てはめです。</p>
<p><strong>なぜ対数尤度か</strong>：各観測 $y_i\\in\\{0,1\\}$ を成功確率 $p_i=\\sigma(a+bx_i)$ のベルヌーイ試行とみなすと、尤度は $\\prod_i p_i^{y_i}(1-p_i)^{1-y_i}$。対数を取った</p>
<p>$$ \\ell(a,b)=\\sum_{i=1}^{n}\\bigl[y_i\\ln p_i+(1-y_i)\\ln(1-p_i)\\bigr] $$</p>
<p>を最大化する<a href="#/prep1/mle">最尤推定</a>です。最小二乗のような閉じた解はなく、ニュートン法（IRLS：反復重み付き最小二乗）で数値的に解きます。</p>
<h3>前提条件と、崩れたときの影響</h3>
<table class="simple">
<tr><th>前提</th><th>崩れると起きること</th><th>対処・代替</th></tr>
<tr><td>ロジットの線形性</td><td>決定境界の形が合わず、確率推定が系統的に歪む</td><td>多項式項・交互作用・スプライン、非線形分類器（<a href="#/prep1/svm">SVM</a>・決定木）</td></tr>
<tr><td>観測の独立性</td><td>クラスター構造で標準誤差を過小評価 → 見かけ上有意になりやすい</td><td>混合効果ロジスティック・GEE・クラスター頑健標準誤差</td></tr>
<tr><td>完全分離がない</td><td>2クラスが完全に分かれると最尤推定が発散（$|\\hat b|\\to\\infty$、SEも爆発）</td><td><a href="#/prep1/regularization">正則化</a>・Firth補正</td></tr>
<tr><td>イベント数が十分</td><td>少イベント（まれな $y=1$）で係数が過大方向に偏る</td><td>目安 EPV（1係数あたりイベント数）≥10、Firth補正</td></tr>
</table>
<p>「完全分離」はデモで体感できます。<strong>分離度を上げるほど、傾き $b$ を大きくすればするほど尤度が上がる状態になり、最尤解が存在しなくなる</strong>——きれいに分かれるデータほど推定が壊れる、というロジスティック回帰特有の落とし穴です。</p>
<h3>有意性と実質的な意味</h3>
<p>係数の検定（Wald検定 $z=\\hat b/\\mathrm{SE}$）が有意でも、効果の大きさは<strong>オッズ比 $e^{\\hat b}$ とその信頼区間</strong>で読みます（<a href="#/prep1/odds-ratio">オッズ比</a>）。$n$ が大きければ $e^{\\hat b}=1.02$ のような無視できる効果も有意になります。分類器としての性能も正答率だけでなく、しきい値に依存しない <a href="#/prep1/roc-auc">ROC・AUC</a> や、不均衡データでは適合率・再現率で評価します。予測確率そのものを使うなら、予測確率が実際の頻度と合っているか（キャリブレーション）も別に確認します。</p>
<div class="note">下は1次元の2クラスデータ。青（クラス0）とオレンジ（クラス1）を分けるシグモイド曲線を、傾きと境界位置で調整します。境界をデータの重なり位置に合わせ、傾きで確信度の変化を鋭く／緩やかにできます。分離度を最大にしてから傾きを上げていくと「いくらでも急にできてしまう」＝完全分離の発散を疑似体験できます。</div>`,
    demo: {
      note: 'S字曲線が「クラス1である確率」。曲線が0.5を横切るx（縦線）が決定境界。傾きを大きくすると境界付近で確率が急に切り替わります。',
      controls: [
        { type: 'range', id: 'boundary', label: '決定境界の位置', min: -4, max: 4, step: 0.2, value: 0 },
        { type: 'range', id: 'slope', label: '境界の切れ味（傾き）', min: 0.3, max: 5, step: 0.1, value: 1.5 },
        { type: 'range', id: 'sep', label: 'クラスの分離度', min: 0.5, max: 5, step: 0.5, value: 3 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(21 + (p.reseed | 0) * 37);
        const n = 40;
        const pts = [];
        for (let i = 0; i < n; i++) {
          const cls = i < n / 2 ? 0 : 1;
          const center = cls === 0 ? -p.sep / 2 : p.sep / 2;
          pts.push({ x: center + st.randn(rand) * 1.1, y: cls });
        }
        const pl = Pl.make(canvas, { xmin: -6, xmax: 6, ymin: -0.15, ymax: 1.15 });
        pl.clear(); pl.axes({ xLabel: 'x（特徴量）', yLabel: 'P(クラス1)', yTicks: [0, 0.25, 0.5, 0.75, 1] });
        const grid = st.linspace(-6, 6, 200);
        const sig = x => 1 / (1 + Math.exp(-p.slope * (x - p.boundary)));
        pl.line(grid.map(x => [x, sig(x)]), { color: Pl.colors[2], width: 2.5 });
        pl.hline(0.5, { color: Pl.gray, dash: [4, 4] });
        pl.vline(p.boundary, { color: Pl.ink, label: '境界 x=' + p.boundary.toFixed(1) });
        for (const pt of pts) pl.scatter([[pt.x, pt.y + (rand() - 0.5) * 0.06]], { color: pt.y === 0 ? Pl.colors[0] : Pl.colors[1], r: 4, alpha: 0.7 });
        // 精度
        let correct = 0;
        for (const pt of pts) { const pred = sig(pt.x) >= 0.5 ? 1 : 0; if (pred === pt.y) correct++; }
        pl.legend([{ label: 'クラス0', color: Pl.colors[0] }, { label: 'クラス1', color: Pl.colors[1] }]);
        pl.text(-6, 1.15, '正答率 = ' + (correct / n * 100).toFixed(0) + '%', { align: 'left', baseline: 'top', dx: 60, dy: 4, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- 4. k-means クラスタリング --- */
  T.push({
    section: 'prep1', group: '多変量解析', id: 'kmeans', title: 'k-means クラスタリング',
    summary: '「教師なし」で似た点をグループにまとめる k-means を、反復のたびに中心が動いて収束する様子で理解します。',
    body: `
<p>ラベルなしデータを似た者どうしに分けるのが<strong>クラスタリング</strong>。代表格の $k$-means は次を繰り返します。</p>
<ol>
<li><strong>割り当て</strong>：各点を、最も近いクラスタ中心に割り当てる</li>
<li><strong>更新</strong>：各クラスタの中心を、所属する点の平均に移動する</li>
</ol>
<p>これは、各点と自分のクラスタ中心との距離の二乗和（クラスタ内平方和 WCSS）を最小化する操作です。</p>
<p>$$ \\min \\sum_{j=1}^{k}\\sum_{x\\in C_j}\\|x-\\mu_j\\|^2 $$</p>
<h3>なぜ収束するか（交互最小化）</h3>
<p>2ステップはどちらも同じ目的関数 WCSS を<strong>増やしません</strong>。割り当てステップは「各点を最も近い中心へ」＝点ごとに距離²を最小化。更新ステップは「中心を所属点の平均へ」＝固定された所属のもとで $\\sum\\|x-\\mu\\|^2$ を $\\mu$ で微分して0にする解がまさに平均だから最小化。<strong>目的関数が単調に減り、下に有界なので必ず収束します</strong>（座標降下＝交互最小化の一種）。ただし収束先は<strong>局所最適</strong>で、初期中心しだいで別の解に落ちます。</p>
<h3>前提と、崩れたときの注意</h3>
<p>k-meansは強い前提を暗黙に置いています。<strong>(1) クラスタが等方的（球状）で同程度の大きさ</strong>：距離²で測るので、細長い・密度の違う・三日月形のクラスタは正しく分けられません（そういう形にはガウス混合モデルやDBSCAN、スペクトラルクラスタリング）。<strong>(2) $k$ を事前に与える</strong>：$k$ は未知なのが普通で、エルボー法（WCSSの折れ曲がり）やシルエット係数で選びます——ただし決定打はなく、$k$ を上げれば WCSS は必ず下がる（$k=n$ で0）ので WCSS 単独では選べません。<strong>(3) スケール依存</strong>：距離ベースなので単位の大きい変数が支配→標準化が必須。<strong>(4) 局所最適</strong>：初期値を賢く散らす k-means++ や複数回試行で最良を選ぶのが定石。<strong>(5) 平均を使うので外れ値に弱い</strong>→中央値ベースの k-medoids。教師なしなので「正解」がなく、得られたクラスタが意味を持つかはドメイン知識で検証します。</p>
<div class="note">下のデモは「反復を進める」ボタンを押すたびに1ステップ進みます。×印が中心。最初はランダムな中心が、反復するうちに自然な塊の中心へ移動して落ち着きます。クラスタ数 k を変えるとグループ分けも変わります。$k$ を実際の塊数（3）からずらすと無理な分割になる＝$k$ 選択の重要性、初期値を変える（再サンプル）と別の収束先になりうる＝局所最適、を確かめてください。</div>`,
    demo: {
      note: '「反復を進める」を数回押すと中心（×）が塊の中心へ移動し収束します。k を実際の塊の数（3）に合わせると綺麗に分かれます。',
      controls: [
        { type: 'range', id: 'k', label: 'クラスタ数 k', min: 2, max: 5, step: 1, value: 3 },
        { type: 'button', id: 'step', label: '反復を進める' },
        { type: 'button', id: 'reseed', label: 'データ再生成' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(101 + (p.reseed | 0) * 211);
        // 3つの真の塊からデータ生成
        const trueCenters = [[-2.5, 2], [2.5, 2.5], [0, -2.5]];
        const data = [];
        for (const c of trueCenters) for (let i = 0; i < 30; i++) data.push([c[0] + st.randn(rand) * 0.9, c[1] + st.randn(rand) * 0.9]);
        const k = Math.round(p.k);
        // 中心の初期化（reseed に依存、固定シード）
        const initRand = st.rng(555 + (p.reseed | 0) * 13 + k * 7);
        let centers = [];
        for (let j = 0; j < k; j++) centers.push([-3 + 6 * initRand(), -3 + 6 * initRand()]);
        // step 回だけ反復
        const steps = Math.min(12, p.step | 0);
        let assign = data.map(() => 0);
        for (let s = 0; s < steps; s++) {
          assign = data.map(pt => {
            let best = 0, bd = Infinity;
            centers.forEach((c, j) => { const d = (pt[0] - c[0]) ** 2 + (pt[1] - c[1]) ** 2; if (d < bd) { bd = d; best = j; } });
            return best;
          });
          const sums = centers.map(() => [0, 0, 0]);
          data.forEach((pt, i) => { const a = assign[i]; sums[a][0] += pt[0]; sums[a][1] += pt[1]; sums[a][2]++; });
          centers = centers.map((c, j) => sums[j][2] > 0 ? [sums[j][0] / sums[j][2], sums[j][1] / sums[j][2]] : c);
        }
        if (steps === 0) {
          assign = data.map(pt => {
            let best = 0, bd = Infinity;
            centers.forEach((c, j) => { const d = (pt[0] - c[0]) ** 2 + (pt[1] - c[1]) ** 2; if (d < bd) { bd = d; best = j; } });
            return best;
          });
        }
        const pl = Pl.make(canvas, { xmin: -5, xmax: 5, ymin: -5, ymax: 5 });
        pl.clear(); pl.axes({ xLabel: '特徴量1', yLabel: '特徴量2' });
        data.forEach((pt, i) => pl.scatter([pt], { color: Pl.colors[assign[i] % Pl.colors.length], r: 4, alpha: 0.6 }));
        const ctx = pl.ctx;
        centers.forEach((c, j) => {
          ctx.strokeStyle = Pl.colors[j % Pl.colors.length]; ctx.lineWidth = 3;
          const X = pl.X(c[0]), Y = pl.Y(c[1]), s = 8;
          ctx.beginPath(); ctx.moveTo(X - s, Y - s); ctx.lineTo(X + s, Y + s); ctx.moveTo(X + s, Y - s); ctx.lineTo(X - s, Y + s); ctx.stroke();
        });
        pl.text(-5, 5, '反復回数: ' + steps + '（★=中心）', { align: 'left', baseline: 'top', dx: 60, dy: 4, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- 5. 交差検証 --- */
  T.push({
    section: 'prep1', group: '回帰分析', id: 'crossval', title: '交差検証とモデル選択',
    summary: 'データを訓練用と検証用に分けて「未知データでの性能」を見積もる交差検証で、最適なモデルの複雑さを選ぶ手順を可視化します。',
    body: `
<p>過学習を避けてモデルを選ぶには、<strong>訓練に使っていないデータ</strong>で性能を測る必要があります。<strong>$k$-分割交差検証</strong>は、データを $k$ 個に分け、1つを検証用・残りを訓練用として $k$ 回評価し、平均をとります。</p>
<p>モデルの複雑さ（例：多項式の次数）を横軸に、訓練誤差と検証誤差を描くと、典型的には次の形になります。</p>
<ul>
<li><strong>訓練誤差</strong>：複雑にするほど下がり続ける</li>
<li><strong>検証誤差</strong>：いったん下がり、ある点から再び上がる（U字）</li>
</ul>
<p>この検証誤差が最小になる複雑さが、汎化性能の観点でのベストです。訓練誤差だけを見ると必ず「一番複雑なモデル」を選んでしまい、過学習します。</p>

<h3>交差検証は何を推定しているか</h3>
<p>本当に知りたいのは<strong>汎化誤差</strong>——未知の新データ $(x,y)$ に対する期待損失 $\\mathrm{Err}=E[L(y,\\hat f(x))]$ です。交差検証はこれを次で推定します。</p>
<p>$$ \\mathrm{CV}=\\frac1n\\sum_{i=1}^{n} L\\big(y_i,\\ \\hat f_{-\\kappa(i)}(x_i)\\big) $$</p>
<p>ここで $\\hat f_{-\\kappa(i)}$ は<strong>$i$ を含む分割を除いて学習したモデル</strong>。各点を「その点を見ていないモデル」で予測するので、訓練誤差のような楽観バイアスがなく、テスト誤差のほぼ不偏な見積もりになります（数値実験でも 5 分割CVは真のテスト誤差をよく追い、両者とも真の次数で最小になりました）。$k=n$ とすると<strong>一つ抜き交差検証（LOOCV）</strong>です。</p>
<p><strong>$k$ の選び方はバイアスと分散・計算量のトレードオフ</strong>です。$k$ が小さい（例：2分割）と各モデルが半分のデータしか使えず、性能を<strong>悲観的に過小評価</strong>します（実験で $k{=}2$ の誤差 0.42 vs LOOCV 0.38）。$k=n$ のLOOCVはほぼ不偏ですが $n$ 回学習して重く、分割ごとの推定が強く相関します。実務では<strong>$k=5$ か $10$</strong> が妥協点の定番です。データ分割を要さない解析的な近似として<a href="#/prep1/model-selection">AIC・BIC</a>もあります。</p>

<h3>Q²（予測的決定係数）とR²ギャップ</h3>
<p>交差検証の誤差を、なじみのある<strong>決定係数の形</strong>に直したのが $Q^2$ です。各点を「その点を除いて学習したモデル」で予測した残差の二乗和を<strong>PRESS</strong>（予測残差平方和）とし、全変動 $\\mathrm{TSS}=\\sum_i(y_i-\\bar y)^2$ で割ります。</p>
<p>$$ \\mathrm{PRESS}=\\sum_{i=1}^{n}\\bigl(y_i-\\hat y_{-i}\\bigr)^2,\\qquad Q^2=1-\\frac{\\mathrm{PRESS}}{\\mathrm{TSS}} $$</p>
<p>$R^2=1-\\mathrm{RSS}/\\mathrm{TSS}$ が<strong>訓練データへの当てはめ</strong>（$\\hat y_i$ は自分自身も使って学習）なのに対し、$Q^2$ は<strong>未知データの予測力</strong>（$\\hat y_{-i}$ は自分を見ていない）。だから性格が正反対です——$R^2$ は変数や次数を増やすほど<strong>必ず単調に上がる</strong>のに、$Q^2$ は複雑にしすぎると<strong>下がり、負にもなり得ます</strong>（$Q^2<0$ は「平均 $\\bar y$ で予測するより悪い」）。定義上つねに $Q^2\\le R^2$ で、<strong>この $R^2-Q^2$ のギャップが過学習の大きさ</strong>を測ります。</p>
<p>数値実験（$n{=}40$、真は3次多項式、$\\sigma{=}2$）で多項式次数を上げると、$R^2$ は $0.64\\,(1次)\\to0.80\\,(3次)\\to0.87\\,(10次)$ と単調に増え続けますが、$Q^2$ は真の次数付近（2〜4次）の $0.75$ 前後でピークを打ち、$10$ 次では $0.22$ まで崩落——ギャップは $0.04\\to0.65$ に開きます。「$R^2$ が高い＝良いモデル」ではなく「$Q^2$ で汎化を確かめ、$R^2-Q^2$ で過学習を疑う」が鉄則です。<a href="#/prep1/overfitting">過学習</a>のバイアス・バリアンス分解を、1つの指標に凝縮したのが $Q^2$ だと言えます。</p>
<p>この $Q^2$ は<a href="#/chemo/pls">PLS回帰</a>や<a href="#/chemo/pls-da">PLS-DA</a>など、変数がサンプルより多いケモメトリクスで成分数を選ぶ中心指標です（$\\sqrt{\\mathrm{PRESS}/n}$ が RMSECV、独立試料での同種指標が RMSEP）。分類では $Q^2$ の代わりに交差検証の正解率・AUC を使い、判別性能で最終判断します。反復測定があってモデルの「形」を検定したいなら、姉妹の道具が<a href="#/prep1/lack-of-fit">適合度の欠如（lack-of-fit）</a>です。</p>

<h3>前提条件と、崩れたときの影響</h3>
<table class="simple">
<tr><th>前提</th><th>崩れると起きること</th><th>対処・代替</th></tr>
<tr><td>前処理を分割の内側で行う</td><td>標準化・特徴選択を<strong>全データで先に</strong>やると検証情報が漏れ（リーク）、誤差を楽観評価</td><td>前処理を含めた学習をfold内で完結（パイプライン化）</td></tr>
<tr><td>観測が独立（iid）</td><td>時系列でランダム分割すると未来が過去の訓練に混入し過大評価</td><td>時系列CV（前向き検証）・ブロックCV／群データはGroupKFold</td></tr>
<tr><td>各分割にクラスが揃う</td><td>不均衡データで稀なクラスが検証foldに入らず評価が不安定</td><td>層化 $k$ 分割（stratified）</td></tr>
<tr><td>選択と評価でデータを二度使わない</td><td>同じCVで「モデル選択」も「性能報告」もすると楽観バイアス</td><td>入れ子交差検証（nested CV）・独立なテストデータ</td></tr>
</table>

<h3>有意性と実質的な意味</h3>
<p>交差検証誤差<strong>それ自体が推定値でばらつき</strong>ます。U字の谷は分割の切り方や乱数で揺れるので、最小点を1点だけ信じるのは危険です（デモの「再サンプル」で最適次数が動くのを確かめてください）。実務では<strong>1標準誤差ルール（1-SE rule）</strong>——最良のCV値から1標準誤差以内で<strong>最も単純なモデル</strong>を選ぶ——を使い、頑健で説明しやすいモデルに寄せます。また、選んだモデルのCV値をそのまま「期待性能」として報告すると楽観的なので、選択に使っていない<strong>入れ子CVや別のテストデータ</strong>で最終評価します。CVは「どの複雑さか」を選ぶ道具で、選んだ結果の性能は別枠で測る、が鉄則です。</p>
<div class="note">下で「真の複雑さ」とノイズを変えると、訓練誤差（青・単調減少）と検証誤差（オレンジ・U字）の谷が動きます。谷の位置＝選ぶべき次数。ノイズが多いほど、単純なモデルが選ばれやすくなります。「再サンプル」で谷が揺れる＝CV誤差自体のばらつき（L5の1-SEルールの動機）も確認できます。</div>`,
    demo: {
      note: '青は訓練誤差、オレンジは交差検証誤差。オレンジの谷（★）が選ぶべきモデルの複雑さ。訓練誤差は下がり続けるので、それだけで選ぶと過学習します。',
      controls: [
        { type: 'range', id: 'trueDeg', label: '真の複雑さ', min: 1, max: 8, step: 1, value: 3 },
        { type: 'range', id: 'noise', label: 'ノイズの大きさ', min: 0.1, max: 2, step: 0.1, value: 0.6 },
        { type: 'range', id: 'n', label: 'データ数', min: 15, max: 80, step: 5, value: 30 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(88 + (p.reseed | 0) * 17);
        const n = Math.round(p.n);
        const trueDeg = Math.round(p.trueDeg);
        // 真の係数を固定生成
        const tRand = st.rng(1000 + trueDeg);
        const trueCoef = [];
        for (let d = 0; d <= trueDeg; d++) trueCoef.push((tRand() - 0.5) * 1.5 / (d + 1));
        const xs = [], ys = [];
        for (let i = 0; i < n; i++) {
          const x = -2 + 4 * rand();
          xs.push(x); ys.push(polyval(trueCoef, x) + p.noise * st.randn(rand));
        }
        // k分割交差検証で各次数の誤差
        const maxDeg = 10;
        const K = 5;
        const idx = xs.map((_, i) => i);
        for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
        const trainErrs = [], cvErrs = [];
        for (let deg = 1; deg <= maxDeg; deg++) {
          // 訓練誤差（全データ）
          const coefAll = polyfit(xs, ys, deg);
          let te = 0;
          for (let i = 0; i < n; i++) te += (ys[i] - polyval(coefAll, xs[i])) ** 2;
          trainErrs.push(te / n);
          // CV誤差
          let cv = 0, cnt = 0;
          for (let f = 0; f < K; f++) {
            const trX = [], trY = [], vaX = [], vaY = [];
            idx.forEach((id, pos) => {
              if (pos % K === f) { vaX.push(xs[id]); vaY.push(ys[id]); }
              else { trX.push(xs[id]); trY.push(ys[id]); }
            });
            if (trX.length <= deg) continue;
            const coef = polyfit(trX, trY, deg);
            for (let i = 0; i < vaX.length; i++) { cv += (vaY[i] - polyval(coef, vaX[i])) ** 2; cnt++; }
          }
          cvErrs.push(cnt > 0 ? cv / cnt : NaN);
        }
        const validCv = cvErrs.filter(e => isFinite(e));
        const ymax = Math.min(Math.max.apply(null, validCv) * 1.2, Math.max.apply(null, trainErrs) * 3 + p.noise);
        const pl = Pl.make(canvas, { xmin: 0.5, xmax: maxDeg + 0.5, ymin: 0, ymax: ymax || 1 });
        pl.clear(); pl.axes({ xLabel: 'モデルの複雑さ（多項式次数）', yLabel: '誤差 (MSE)', xTicks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] });
        pl.line(trainErrs.map((e, i) => [i + 1, e]), { color: Pl.colors[0], width: 2.5 });
        pl.scatter(trainErrs.map((e, i) => [i + 1, e]), { color: Pl.colors[0], r: 3 });
        pl.line(cvErrs.map((e, i) => [i + 1, e]), { color: Pl.colors[1], width: 2.5 });
        pl.scatter(cvErrs.map((e, i) => [i + 1, e]), { color: Pl.colors[1], r: 3 });
        // 谷
        let bestDeg = 1, bestErr = Infinity;
        cvErrs.forEach((e, i) => { if (isFinite(e) && e < bestErr) { bestErr = e; bestDeg = i + 1; } });
        pl.vline(bestDeg, { color: Pl.colors[2], label: '最適次数 ' + bestDeg });
        pl.legend([{ label: '訓練誤差', color: Pl.colors[0] }, { label: '交差検証誤差', color: Pl.colors[1] }]);
        // R²（訓練）と Q²（交差検証）を最適次数と最大次数で対比：ギャップ＝過学習
        const ybar = st.mean(ys); let tss = 0; for (let i = 0; i < n; i++) tss += (ys[i] - ybar) ** 2;
        const r2 = d => 1 - trainErrs[d - 1] * n / (tss || 1e-9);
        const q2 = d => 1 - cvErrs[d - 1] * n / (tss || 1e-9);
        const dHi = maxDeg;
        pl.text(0.5, ymax, 'R²・Q²（最適' + bestDeg + '次 / 最大' + dHi + '次）', { align: 'left', baseline: 'top', dx: 54, dy: 2, color: '#475467', size: 11.5 });
        pl.text(0.5, ymax, 'R²(訓練)=' + r2(bestDeg).toFixed(2) + ' / ' + r2(dHi).toFixed(2) + '（単調増）', { align: 'left', baseline: 'top', dx: 54, dy: 20, color: Pl.colors[0], size: 11.5 });
        pl.text(0.5, ymax, 'Q²(CV)=' + q2(bestDeg).toFixed(2) + ' / ' + q2(dHi).toFixed(2) + '（過学習で低下）', { align: 'left', baseline: 'top', dx: 54, dy: 38, color: Pl.colors[1], size: 11.5 });
      },
    },
  });

  /* --- 因果推論（潜在結果・交絡・調整） --- */
  T.push({
    section: 'prep1', group: '因果推論', id: 'causal-inference', title: '因果推論（潜在結果・交絡・調整）',
    summary: '「相関」から「因果」へ踏み込むための枠組み。潜在結果で処置効果を定義し、交絡による見かけの効果を調整で取り除く考え方を、散布図で体感します。',
    body: `
<p>「広告を見た人は購入率が高い」——では広告に<strong>効果があった</strong>のでしょうか。もともと買う気の人ほど広告も見た、だけかもしれません。<a href="#/prep1/correlation">相関</a>は「一緒に動く」ことしか言わず、<strong>因果</strong>（介入したら結果が変わるか）は別問題です。これを扱う枠組みが<strong>因果推論</strong>で、準1級でも扱われます。</p>
<h3>潜在結果と処置効果</h3>
<p>各個体 $i$ に、処置を受けたときの結果 $Y_i(1)$ と受けなかったときの結果 $Y_i(0)$ の<strong>2つの潜在結果</strong>を考えます。個体の因果効果は $Y_i(1)-Y_i(0)$。ところが現実には<strong>どちらか一方しか観測できない</strong>（買った人の「買わなかった世界」は見えない）——これが<strong>因果推論の根本問題</strong>です。そこで集団平均の<strong>平均処置効果 (ATE)</strong> を狙います。</p>
<p>$$ \\mathrm{ATE}=E[Y(1)-Y(0)] $$</p>
<h3>なぜ単純比較は偏るのか</h3>
<p>観測データで処置群と対照群の平均を引き算すると、</p>
<p>$$ \\underbrace{E[Y\\mid T{=}1]-E[Y\\mid T{=}0]}_{\\text{見かけの差}}=\\underbrace{\\mathrm{ATE}}_{\\text{真の効果}}+\\underbrace{\\big(E[Y(0)\\mid T{=}1]-E[Y(0)\\mid T{=}0]\\big)}_{\\text{交絡（選択）バイアス}} $$</p>
<p>第2項は「処置を受けた人ともともと違う人たちだった」ズレ＝<strong>交絡</strong>です。$X$（例：重症度）が処置 $T$ と結果 $Y$ の<strong>両方</strong>に効くと、$T$ の見かけの効果に $X$ の影響が混入します。<strong>ランダム化比較試験（RCT）</strong>は処置をコインで割り付けて $T\\perp(Y(0),Y(1))$ を保証し、この第2項をゼロにする——だから「因果の王道」なのです。</p>
<h3>観測データでの調整</h3>
<p>ランダム化できないときは、交絡変数 $X$ をそろえて比較します。<strong>バックドア基準</strong>で「$T$ と $Y$ の裏口経路」を塞ぐ $X$ を選び、</p>
<p>$$ E[Y(1)]=E_X\\big[E[Y\\mid T{=}1,X]\\big] $$</p>
<p>のように $X$ で条件づけて平均します。実装は、$X$ を入れた<a href="#/prep1/multiple-regression">回帰</a>で調整する／$X$ の層ごとに比較する（層別）／傾向スコア $e(x)=P(T{=}1\\mid X{=}x)$（<a href="#/prep1/logistic">ロジスティック回帰</a>で推定）でマッチングや<strong>逆確率重みづけ (IPW)</strong> を行う、などです。数値実験では、交絡で単純差が $2.0\\to5.6$ に膨らむデータでも、$X$ を入れた回帰調整は真の効果 $2.0$ を回復しました。</p>
<h3>前提条件と、崩れたときの影響</h3>
<table class="simple">
<tr><th>前提</th><th>崩れると起きること</th><th>対処・代替</th></tr>
<tr><td>条件つき交換可能性（未測定交絡なし）</td><td>測っていない交絡があると調整しても効果が偏る。<strong>この仮定はデータで検証できない</strong></td><td>感度分析・操作変数法・自然実験・差分の差分</td></tr>
<tr><td>正値性（重なり）$0<e(x)<1$</td><td>ある $X$ で片群しかいないと比較対象が無く、IPWの重みが爆発</td><td>共通サポートに限定・重みの打ち切り・トリミング</td></tr>
<tr><td>SUTVA（干渉なし・一貫性）</td><td>他者の処置が自分の結果に影響（波及）すると効果が定義できない</td><td>クラスター設計・干渉を含むモデル</td></tr>
<tr><td>合流点・中間変数で条件づけない</td><td>合流点（コライダー）や処置後変数で層別すると<strong>逆に</strong>偽の関連を生む</td><td>調整集合をDAGで吟味・処置後変数は入れない</td></tr>
</table>
<h3>有意性と実質的な意味</h3>
<p>回帰係数が有意でも、それが<strong>因果効果とは限りません</strong>。推定が因果として読めるのは「未測定交絡なし」という<strong>検証不能な仮定</strong>が成り立つ時だけで、$p$ 値はその仮定を保証しません。交絡は効果の大きさを変えるだけでなく<strong>符号すら反転</strong>させます（<a href="#/prep1/contingency">シンプソンのパラドックス</a>）。だから「調整前後で効果がどれだけ動くか」「未測定交絡がどれほど強ければ結論が覆るか（感度分析）」を必ず添えます。また ATE（集団全体）と ATT（処置を受けた人での効果）は別物で、政策の問いに合う推定量を選ぶことも実質的意味では重要です。</p>
<div class="note">下は交絡のある観測データ。横軸が交絡変数 $X$（重症度など）、縦軸が結果 $Y$、青が処置群・オレンジが対照群。<strong>交絡の強さ</strong>を上げると青が右（高 $X$）に偏り、単純な群平均差（点線）が真の効果から離れます。一方、$X$ をそろえた2本の回帰直線の<strong>縦の間隔</strong>＝調整後の効果は、交絡を変えても真の効果の近くに留まります。「見かけの差」と「調整後」の乖離が交絡バイアスそのものです。</div>`,
    demo: {
      heading: '🔀 交絡と調整（処置効果の推定）',
      note: '青＝処置群・オレンジ＝対照群。点線は群平均どうしの差（単純比較）。2本の回帰直線の縦の間隔が「Xをそろえた」調整後の効果。交絡を強めると単純差だけが真の効果からずれます。',
      controls: [
        { type: 'range', id: 'conf', label: '交絡の強さ', min: 0, max: 2.5, step: 0.1, value: 1.2 },
        { type: 'range', id: 'tau', label: '真の処置効果 τ', min: 0, max: 4, step: 0.5, value: 2 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(311 + (p.reseed | 0) * 53);
        const n = 140, tau = p.tau, gamma = 2.2, conf = p.conf;
        const X = [], Y = [], Tt = [];
        for (let i = 0; i < n; i++) {
          const x = st.randn(rand);
          const e = 1 / (1 + Math.exp(-conf * x));
          const t = rand() < e ? 1 : 0;
          const y = tau * t + gamma * x + 0.9 * st.randn(rand);
          X.push(x); Y.push(y); Tt.push(t);
        }
        // 単純比較（群平均差）
        let s1 = 0, c1 = 0, s0 = 0, c0 = 0;
        for (let i = 0; i < n; i++) { if (Tt[i]) { s1 += Y[i]; c1++; } else { s0 += Y[i]; c0++; } }
        const m1 = c1 ? s1 / c1 : 0, m0 = c0 ? s0 / c0 : 0, naive = m1 - m0;
        // 回帰調整 Y ~ b0 + tauHat*T + gHat*X （3x3 正規方程式をガウス消去）
        const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], bv = [0, 0, 0];
        for (let i = 0; i < n; i++) {
          const z = [1, Tt[i], X[i]];
          for (let a = 0; a < 3; a++) { bv[a] += z[a] * Y[i]; for (let b = 0; b < 3; b++) A[a][b] += z[a] * z[b]; }
        }
        // solve 3x3
        const M = A.map((r, i) => r.concat(bv[i]));
        for (let col = 0; col < 3; col++) {
          let piv = col; for (let r = col + 1; r < 3; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
          const tmp = M[col]; M[col] = M[piv]; M[piv] = tmp;
          const d = M[col][col] || 1e-9;
          for (let j = col; j <= 3; j++) M[col][j] /= d;
          for (let r = 0; r < 3; r++) { if (r === col) continue; const f = M[r][col]; for (let j = col; j <= 3; j++) M[r][j] -= f * M[col][j]; }
        }
        const b0 = M[0][3], tauHat = M[1][3], gHat = M[2][3];
        // 描画
        const xmin = -3, xmax = 3;
        const allY = Y.concat([m0, m1]);
        const ymin = Math.min.apply(null, allY) - 1, ymax = Math.max.apply(null, allY) + 1;
        const pl = Pl.make(canvas, { xmin, xmax, ymin, ymax });
        pl.clear(); pl.axes({ xLabel: '交絡変数 X（重症度など）', yLabel: '結果 Y' });
        // 群平均の水平点線
        pl.hline(m0, { color: Pl.colors[1], dash: [3, 3] });
        pl.hline(m1, { color: Pl.colors[0], dash: [3, 3] });
        // 散布
        pl.scatter(X.map((x, i) => [x, Y[i]]).filter((_, i) => Tt[i] === 0), { color: Pl.colors[1], r: 3.2, alpha: 0.7 });
        pl.scatter(X.map((x, i) => [x, Y[i]]).filter((_, i) => Tt[i] === 1), { color: Pl.colors[0], r: 3.2, alpha: 0.7 });
        // 調整後の平行2直線
        pl.line([[xmin, b0 + gHat * xmin], [xmax, b0 + gHat * xmax]], { color: Pl.colors[1], width: 2.5 });
        pl.line([[xmin, b0 + tauHat + gHat * xmin], [xmax, b0 + tauHat + gHat * xmax]], { color: Pl.colors[0], width: 2.5 });
        pl.text(xmin, ymax, '単純比較（点線の差）= ' + naive.toFixed(2), { align: 'left', baseline: 'top', dx: 56, dy: 4, color: '#475467', size: 12.5 });
        pl.text(xmin, ymax, '調整後 τ̂（直線の間隔）= ' + tauHat.toFixed(2) + '（真値 ' + tau.toFixed(1) + '）', { align: 'left', baseline: 'top', dx: 56, dy: 24, color: Pl.colors[2], size: 12.5 });
        pl.legend([{ label: '処置群 T=1', color: Pl.colors[0] }, { label: '対照群 T=0', color: Pl.colors[1] }]);
      },
    },
  });

  /* --- 適合度の欠如（ロット・オブ・フィットと純粋誤差） --- */
  T.push({
    section: 'prep1', group: '回帰分析', id: 'lack-of-fit', title: '適合度の欠如（純粋誤差とロット・オブ・フィット）',
    summary: '決定係数が高くても「モデルの形」が間違っていることがあります。反復測定を「ものさし」にして、形の不適合を純粋誤差と切り分けて検定します。',
    body: `
<p>回帰で決定係数 $R^2$ が高くても、モデルの<strong>形</strong>が間違っていることはよくあります。放物線のように曲がったデータに直線を当てると、各点は「たまたま近い」だけで、体系的なズレ（曲率）が残ります。<strong>適合度の欠如（ロット・オブ・フィット, lack-of-fit）検定</strong>は、この「モデルの形が悪いことによるズレ」を「測定そのもののばらつき」と切り分けて検出する道具です。</p>
<p>鍵になるのが<strong>反復測定</strong>です。同じ $x$ で複数回 $y$ を測ると、その内部のばらつきは<em>モデルが何であろうと関係のない、純粋な測定の再現性</em>です。これを「ものさし」にして、モデル予測が各 $x$ のグループ平均からどれだけ外れているかを測ります。<a href="#/prep1/model-selection">モデル選択</a>が「どの変数が良いか」を問うのに対し、lack-of-fit は「そもそも直線という形でよいのか」を問います。</p>
<h3>残差平方和を「純粋誤差」と「適合度の欠如」に分ける</h3>
<p>相異なる $x$ 水準が $c$ 個、水準 $j$ で $n_j$ 回反復、全体で $n=\\sum_j n_j$ 観測、パラメータ数を $p$ とします。$y_{ji}$ を水準 $j$ の $i$ 番目、$\\bar y_j$ をその水準のグループ平均、$\\hat y_j$ をモデル予測として、残差を2つに割ります。</p>
<p>$$ y_{ji}-\\hat y_j=\\underbrace{(y_{ji}-\\bar y_j)}_{\\text{測定のばらつき}}+\\underbrace{(\\bar y_j-\\hat y_j)}_{\\text{平均とモデルのズレ}} $$</p>
<p>両辺を二乗して全点で和をとると、交差項 $2\\sum_j(\\bar y_j-\\hat y_j)\\sum_i(y_{ji}-\\bar y_j)$ は、内側の $\\bar y_j-\\hat y_j$ が $i$ に依らない定数なので括り出せ、残る $\\sum_i(y_{ji}-\\bar y_j)=0$（グループ内偏差の和はゼロ）で消えます。こうして平方和がきれいに分かれます。</p>
<p>$$ \\underbrace{\\sum_j\\sum_i(y_{ji}-\\hat y_j)^2}_{SS_E}=\\underbrace{\\sum_j\\sum_i(y_{ji}-\\bar y_j)^2}_{SS_{PE}\\,(\\text{純粋誤差})}+\\underbrace{\\sum_j n_j(\\bar y_j-\\hat y_j)^2}_{SS_{LOF}\\,(\\text{適合度の欠如})} $$</p>
<p><strong>なぜこの分解が効くか</strong>：$SS_{PE}$ は各 $x$ の内部だけを見るので<strong>モデルの形に一切依存しません</strong>。誤差分散 $\\sigma^2$ の不偏推定 $MS_{PE}=SS_{PE}/(n-c)$ を与える「純度の高いものさし」です。一方 $SS_{LOF}$ はグループ平均とモデル予測のズレなので、モデルの形が正しければ誤差だけ、間違っていれば<strong>系統的なズレが上乗せ</strong>されて膨らみます。それぞれ平均平方にして比をとると検定統計量です。</p>
<p>$$ F=\\frac{SS_{LOF}/(c-p)}{SS_{PE}/(n-c)}=\\frac{MS_{LOF}}{MS_{PE}}\\ \\sim\\ F(c-p,\\ n-c)\\quad(H_0:\\text{モデルの形は正しい}) $$</p>
<p>$df_{LOF}=c-p$ が正であるには<strong>水準数 $c$ がパラメータ数 $p$ より多い</strong>必要があります（直線 $p=2$ なら $c\\ge3$）。</p>
<h3>数値例：曲がったデータに直線を当てる</h3>
<p>$x=1,\\dots,5$ の5水準・各3回反復（$n=15,\\ c=5$）で、真の平均が下に凸の放物線になるデータに<strong>直線</strong>（$p=2$）を当てます。</p>
<table class="simple">
<tr><th></th><th>$SS$</th><th>自由度</th><th>$MS$</th></tr>
<tr><td>適合度の欠如 LOF</td><td>$48.98$</td><td>$c-p=3$</td><td>$16.33$</td></tr>
<tr><td>純粋誤差 PE</td><td>$1.81$</td><td>$n-c=10$</td><td>$0.181$</td></tr>
<tr><td>残差 E（合計）</td><td>$50.80$</td><td>$n-p=13$</td><td></td></tr>
</table>
<p>$F=16.33/0.181=90.0$、$p=1.5\\times10^{-7}$（棄却限界 $F_{0.05}(3,10)=3.71$ を大きく超える）。<strong>直線モデルの適合度の欠如は極めて有意</strong>です。注目すべきは、この直線の $R^2=0.001$（ほぼ0）だという点——放物線が左右対称で直線の傾きがほぼ0になるため、$R^2$ を見ただけでは「$x$ は無関係」と誤読しかねません。しかし lack-of-fit は「無関係」ではなく「<strong>直線という形が違う</strong>」と正しく告げます。同じデータに $x^2$ を足した<strong>2次モデル</strong>（$p=3$）を当てると $SS_{LOF}=0.30$、$F=0.84$、$p=0.46$ で欠如は消え、$R^2=0.958$ に跳ね上がります。純粋誤差 $SS_{PE}=1.81$ は<strong>モデルを変えても不変</strong>——「ものさし」が動かない実演です。</p>
<h3>前提条件と、崩れたときの影響</h3>
<table class="simple">
<tr><th>前提</th><th>崩れると起きること</th><th>対処・代替</th></tr>
<tr><td>真の反復がある（同一 $x$ で複数観測）</td><td>$SS_{PE}$ が測れず検定不能。近接点を反復と誤ると純粋誤差を過大評価し $F$ が過小に</td><td>中心点の反復を計画に入れる（<a href="#/doe/ccd">CCD</a>・<a href="#/doe/rsm">応答曲面</a>）</td></tr>
<tr><td>誤差の等分散性</td><td>$MS_{PE}$ が水準ごと分散の平均になり $F$ 分布が歪む</td><td>加重最小二乗・分散安定化変換</td></tr>
<tr><td>誤差の独立・正規性</td><td>$F$ 比が理論分布に従わず $p$ 値が不正確</td><td>系列相関の診断（<a href="#/prep1/regression-diagnostics">回帰診断</a>）・ブートストラップ</td></tr>
<tr><td>水準数 $c>p$</td><td>$df_{LOF}=c-p\\le0$ で検定が定義できない（飽和モデル）</td><td>説明変数の水準を増やす</td></tr>
</table>
<p>要点は「<strong>反復がなければ純粋誤差は存在しない</strong>」こと。反復のない観測データではこの検定は原理的にできず、代わりに<a href="#/prep1/regression-diagnostics">残差プロットの曲がり</a>で形の不適合を目で見つけます。両者は補完関係——残差プロットは形の<em>種類</em>を示唆し、lack-of-fit 検定はそれが<em>誤差に対して有意か</em>を裁定します。反復がなく「予測力」でモデルの妥当性を問いたいなら、抜いて予測する<a href="#/prep1/crossval">交差検証（$Q^2$）</a>が姉妹の道具です。</p>
<h3>有意性と実質的な意味</h3>
<p>lack-of-fit が<strong>非有意でもモデルが正しい保証にはなりません</strong>。$F$ の検出力は反復数（$df_{PE}=n-c$）に強く依存し、反復が少ないと真に曲がっていても有意にならない（第2種の誤り）ことがあります。「非有意＝直線でOK」でなく「与えられた反復数では曲がりを検出できなかった」と読みます。逆に有意でも、<strong>実害の大きさは残差の絶対的な大きさで判断</strong>します。$n$ が大きく $MS_{PE}$ が極小だと、同じ曲率なら $F\\propto1/MS_{PE}$ で、実務上無視できる微小な曲率でも $F$ が巨大になり有意化します。「有意か」でなく「モデルを複雑にする価値がある曲がりか」を、<a href="#/prep1/model-selection">AIC</a>や予測誤差と併せて読むのが実務です。</p>
<div class="note">下で「モデルの次数」（直線／2次）と「データの曲がりの強さ」を動かします。曲がりを強くしたまま直線を選ぶと、赤い直線が緑のグループ平均（各 $x$ の点）から系統的に外れ、$SS_{LOF}$ と $F$ が跳ね上がり $p$ が0に近づきます。2次に上げると曲線がグループ平均を捉えて $SS_{LOF}\\to0$、$F$ が1付近・$p$ が大に。純粋誤差 $SS_{PE}$（各 $x$ 内の縦の散らばり）はどちらの次数でも変わらないこと、曲がりを0にすると直線でも欠如が非有意になることを確認してください。</div>`,
    demo: {
      note: '青＝観測、赤＝当てはめたモデル、緑＝各xのグループ平均、灰の縦線＝平均とモデルのズレ(LOF)。曲がりを強めたまま直線だとFが跳ね上がり有意。2次にするか曲がりを0にすると欠如が消えます。',
      controls: [
        { type: 'select', id: 'degree', label: 'モデルの次数', value: '1', options: [
          { value: '1', label: '直線（1次）' },
          { value: '2', label: '2次曲線' },
        ]},
        { type: 'range', id: 'curv', label: 'データの曲がりの強さ', min: 0, max: 1.6, step: 0.1, value: 0.9 },
        { type: 'range', id: 'noise', label: '測定ノイズ（純粋誤差）', min: 0.1, max: 1.2, step: 0.1, value: 0.5 },
        { type: 'range', id: 'reps', label: '各水準の反復数', min: 2, max: 6, step: 1, value: 3 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(7 + (p.reseed | 0) * 13);
        const levels = [1, 2, 3, 4, 5], c = levels.length;
        const reps = Math.round(p.reps), deg = parseInt(p.degree, 10), np = deg + 1;
        const xs = [], ys = [];
        for (const L of levels) for (let i = 0; i < reps; i++) {
          xs.push(L);
          ys.push(2 + p.curv * (L - 3) * (L - 3) + p.noise * st.randn(rand));
        }
        const n = xs.length;
        const coef = polyfit(xs, ys, deg);
        // 水準ごとのグループ平均とモデル予測
        const ybar = {}, yhat = {};
        for (const L of levels) {
          const g = ys.filter((_, k) => xs[k] === L);
          ybar[L] = st.mean(g); yhat[L] = polyval(coef, L);
        }
        let SS_PE = 0, SS_LOF = 0;
        for (let k = 0; k < n; k++) SS_PE += (ys[k] - ybar[xs[k]]) ** 2;
        for (const L of levels) SS_LOF += reps * (ybar[L] - yhat[L]) ** 2;
        const dfL = c - np, dfP = n - c;
        const F = dfL > 0 ? (SS_LOF / dfL) / (SS_PE / dfP || 1e-9) : NaN;
        const pval = dfL > 0 ? 1 - st.fCdf(F, dfL, dfP) : NaN;
        const ymin = Math.min.apply(null, ys) - 1, ymax = Math.max.apply(null, ys) + 1.5;
        const pl = Pl.make(canvas, { xmin: 0.4, xmax: 5.6, ymin, ymax });
        pl.clear(); pl.axes({ xLabel: 'x（水準）', yLabel: 'y' });
        // モデル曲線
        const grid = st.linspace(0.4, 5.6, 120);
        pl.line(grid.map(x => [x, polyval(coef, x)]), { color: Pl.colors[1], width: 2.5 });
        // LOFの縦線（平均→モデル予測）
        for (const L of levels) pl.line([[L, ybar[L]], [L, yhat[L]]], { color: Pl.gray, width: 1.5, dash: [3, 3] });
        // 観測点
        pl.scatter(xs.map((x, k) => [x, ys[k]]), { color: Pl.colors[0], r: 3.2, alpha: 0.7 });
        // グループ平均
        for (const L of levels) pl.scatter([[L, ybar[L]]], { color: Pl.colors[2], r: 6 });
        pl.legend([{ label: '観測', color: Pl.colors[0] }, { label: 'モデル', color: Pl.colors[1] }, { label: '群平均', color: Pl.colors[2] }]);
        pl.text(0.4, ymax, 'SS_PE=' + SS_PE.toFixed(2) + '（df ' + dfP + '） SS_LOF=' + SS_LOF.toFixed(2) + '（df ' + dfL + '）', { align: 'left', baseline: 'top', dx: 54, dy: 4, color: '#475467', size: 12 });
        const verdict = !isFinite(pval) ? '検定不能（c≤p）' : (pval < 0.05 ? 'LOF有意：形が不適切' : 'LOF非有意');
        pl.text(0.4, ymax, 'F=' + (isFinite(F) ? F.toFixed(2) : '–') + '  p=' + (isFinite(pval) ? (pval < 0.001 ? '<0.001' : pval.toFixed(3)) : '–') + '  → ' + verdict, { align: 'left', baseline: 'top', dx: 54, dy: 24, color: pval < 0.05 ? '#c2410c' : '#0f766e', size: 12.5 });
      },
    },
  });

  /* --- 説明変数の選択 --- */
  T.push({
    section: 'prep1', group: '回帰分析', id: 'variable-selection', title: '説明変数の選択',
    summary: '候補変数から「どれをモデルに入れるか」を決める戦略（総当り・前進・後退・ステップワイズ）と規準（AIC・調整済みR²・CV・Lasso）、そして選択後推論の落とし穴を俯瞰します。',
    body: `
<p>説明変数の候補がたくさんあるとき、全部入れるのが最善とは限りません。<strong>無関係な変数は係数の分散を増やし解釈を濁す</strong>（<a href="#/prep1/overfitting">バイアス・バリアンス</a>）一方、<strong>本当に効く変数を落とすと欠落変数バイアス</strong>が乗ります。この綱引きの中で「どの変数を入れるか」を決めるのが<strong>説明変数の選択</strong>です。散在する道具——<a href="#/prep1/model-selection">情報量規準</a>・<a href="#/prep1/regularization">正則化</a>・<a href="#/prep1/crossval">交差検証</a>——を、選択という視点で束ねます。</p>
<h3>探索の戦略</h3>
<ul>
<li><strong>総当り（best subset）</strong>：$p$ 個の変数の入り／切りを全通り試す。$2^p$ で爆発し、$p$ が20を超えると非現実的。</li>
<li><strong>前進選択</strong>：空モデルから、規準が最も改善する変数を1つずつ足す。</li>
<li><strong>後退除去</strong>：フルモデルから、最も不要な変数を1つずつ抜く（$p\\ge n$ ではフルモデルが推定不能で使えない）。</li>
<li><strong>ステップワイズ</strong>：足す・抜くを交互に行う折衷。</li>
</ul>
<p>前進・後退・ステップワイズは<strong>貪欲法</strong>で、各ステップで最善を選ぶだけなので<strong>総当りの最適を逃す</strong>ことがあり、<strong>不安定</strong>（データが少し変わると選ばれる変数集合が変わる）です。</p>
<h3>選ぶ規準</h3>
<p>「良いモデル」を測る物差しで結果が変わります。当てはまり $R^2$ は変数を足すほど必ず上がるので使えず、複雑さに罰を科した指標を使います。</p>
<ul>
<li><strong>調整済み $R^2$・AIC・BIC</strong>：<a href="#/prep1/model-selection">モデル選択</a>参照。予測目的ならAIC、真のモデルを絞りたいならBIC。</li>
<li><strong>マローズの $C_p$</strong>：$C_p=\\mathrm{RSS}_p/\\hat\\sigma^2-n+2p$（$\\hat\\sigma^2$ は<strong>フルモデルの残差分散</strong>）。$C_p\\approx p$ に近いモデルが良い。</li>
<li><strong>交差検証誤差</strong>：<a href="#/prep1/crossval">未知データでの予測</a>を直接測る。選択が過学習しないかを見るのに最も素直。</li>
</ul>
<h3>現代的な代替：正則化</h3>
<p>変数を「入れる／切る」の離散選択でなく、<strong>Lasso（L1罰）</strong>は係数を連続的に0へ縮め、<strong>選択と縮小を同時に</strong>行います（<a href="#/prep1/regularization">正則化</a>）。ステップワイズより安定で、罰の強さを交差検証で選べます。ただし相関の強い変数群からどれか1つを恣意的に選びがちで（<a href="#/prep1/multicollinearity">多重共線性</a>下で不安定）、その緩和が Elastic Net（L1+L2）です。</p>
<h3>有意性と実質的な意味（選択後推論の罠）</h3>
<p>最大の落とし穴は<strong>選択後推論</strong>です。同じデータで変数を「選んで」から、その変数の $p$ 値や信頼区間を<strong>そのまま報告するのは誤り</strong>——選ばれるのは「偶然大きく見えた変数」なので、$p$ 値が楽観的（過小）に出ます。数値実験では、<strong>$y$ が全変数と無関係（純ノイズ, $n{=}60,p{=}8$）でも、最も効いて見える変数を素朴に検定すると $p<0.05$ になる率は 34.5%</strong>——名目5%の約7倍です。さらに前進選択は不安定で、真に効くのが3変数のデータをブートストラップ標本ごとに選び直すと、選ばれる変数集合は500回で約50種類に散らばり、真の3変数ちょうどを当てるのは1割強にすぎませんでした。だから<strong>「選んだ変数集合」は再現しにくい</strong>と心得て、性能評価は選択に使っていない<strong>独立データや入れ子交差検証</strong>で行い、可能なら選択後有効な推論（selective inference）を使います。「AIC最小の1モデル」を唯一の正解とせず、近い候補が複数あるのが普通、が実務的な姿勢です。</p>
<div class="note">下で「真に効く変数の数・ノイズ・データ数」を動かすと、前進選択が変数を1つずつ足すたびに交差検証誤差（オレンジ）と訓練誤差（青）がどう動くかが見えます。訓練誤差は変数を足すほど下がり続けますが、CV誤差は「本当に効く変数」を入れ終えたあたりで底を打ち、無関係な変数を足すと再び悪化します。その谷が選ぶべき変数の数です。ノイズを上げると谷が浅くなり、選択が不安定になる様子も確認してください。</div>`,
    demo: {
      note: '前進選択で変数を1つずつ足したときの、訓練誤差（青・単調減少）とCV誤差（オレンジ・U字）。オレンジの谷＝選ぶべき変数の数。無関係な変数を足すとCV誤差が悪化します。',
      controls: [
        { type: 'range', id: 'trueK', label: '本当に効く変数の数', min: 1, max: 6, step: 1, value: 3 },
        { type: 'range', id: 'noise', label: 'ノイズ', min: 0.3, max: 3, step: 0.3, value: 1.2 },
        { type: 'range', id: 'n', label: 'データ数', min: 30, max: 150, step: 10, value: 60 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(23 + (p.reseed | 0) * 41);
        const n = Math.round(p.n), P0 = 10, trueK = Math.round(p.trueK);
        // データ生成：P0候補、先頭trueKだけ真の係数
        const X = [], y = [];
        const beta = [];
        for (let j = 0; j < P0; j++) beta.push(j < trueK ? (1.2 - 0.12 * j) : 0);
        for (let i = 0; i < n; i++) {
          const row = []; let mu = 0;
          for (let j = 0; j < P0; j++) { const v = st.randn(rand); row.push(v); mu += beta[j] * v; }
          X.push(row); y.push(mu + p.noise * st.randn(rand));
        }
        // 最小二乗（選んだ列＋切片）でCV誤差・訓練誤差を計算するヘルパ
        const fitCols = (rows, cols, yy) => {
          const A = rows.map(r => [1].concat(cols.map(c => r[c])));
          const At = st.transpose(A);
          const beta = st.solve(st.matmul(At, A), st.matvec(At, yy));
          return beta;
        };
        const predict = (b, row, cols) => b[0] + cols.reduce((s, c, k) => s + b[k + 1] * row[c], 0);
        const K = 5;
        const idx = X.map((_, i) => i);
        for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
        // 前進選択：CV誤差最小の変数を順に足す
        const chosen = [], remaining = [];
        for (let j = 0; j < P0; j++) remaining.push(j);
        const trainErrs = [], cvErrs = [];
        const cvOf = (cols) => {
          let se = 0, cnt = 0;
          for (let f = 0; f < K; f++) {
            const trR = [], trY = [], vaR = [], vaY = [];
            idx.forEach((id, pos) => { if (pos % K === f) { vaR.push(X[id]); vaY.push(y[id]); } else { trR.push(X[id]); trY.push(y[id]); } });
            if (trR.length <= cols.length + 1) continue;
            let b; try { b = fitCols(trR, cols, trY); } catch (e) { continue; }
            for (let i = 0; i < vaR.length; i++) { se += (vaY[i] - predict(b, vaR[i], cols)) ** 2; cnt++; }
          }
          return cnt ? se / cnt : NaN;
        };
        const trainOf = (cols) => {
          let b; try { b = fitCols(X, cols, y); } catch (e) { return NaN; }
          let se = 0; for (let i = 0; i < n; i++) se += (y[i] - predict(b, X[i], cols)) ** 2;
          return se / n;
        };
        const maxSteps = Math.min(8, P0);
        for (let step = 1; step <= maxSteps; step++) {
          // remaining の中でCV誤差最小の変数を選ぶ
          let bestJ = -1, bestCv = Infinity;
          for (const j of remaining) {
            const cv = cvOf(chosen.concat([j]));
            if (isFinite(cv) && cv < bestCv) { bestCv = cv; bestJ = j; }
          }
          if (bestJ < 0) break;
          chosen.push(bestJ); remaining.splice(remaining.indexOf(bestJ), 1);
          trainErrs.push(trainOf(chosen)); cvErrs.push(bestCv);
        }
        const m = trainErrs.length;
        const allE = trainErrs.concat(cvErrs).filter(isFinite);
        const ymax = (Math.max.apply(null, allE) || 1) * 1.15;
        const pl = Pl.make(canvas, { xmin: 0.5, xmax: m + 0.5, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: '選んだ変数の数', yLabel: '誤差 (MSE)', xTicks: trainErrs.map((_, i) => i + 1) });
        pl.line(trainErrs.map((e, i) => [i + 1, e]), { color: Pl.colors[0], width: 2.5 });
        pl.scatter(trainErrs.map((e, i) => [i + 1, e]), { color: Pl.colors[0], r: 3 });
        pl.line(cvErrs.map((e, i) => [i + 1, e]), { color: Pl.colors[1], width: 2.5 });
        pl.scatter(cvErrs.map((e, i) => [i + 1, e]), { color: Pl.colors[1], r: 3 });
        let bestK = 1, bestErr = Infinity;
        cvErrs.forEach((e, i) => { if (isFinite(e) && e < bestErr) { bestErr = e; bestK = i + 1; } });
        pl.vline(bestK, { color: Pl.colors[2], label: 'CV最小 ' + bestK + '変数（真 ' + trueK + '）' });
        pl.legend([{ label: '訓練誤差', color: Pl.colors[0] }, { label: '交差検証誤差', color: Pl.colors[1] }]);
      },
    },
  });

  /* --- 多項式フィット用ヘルパー（正規方程式をガウス消去で解く） --- */
  function polyfit(xs, ys, deg) {
    const n = deg + 1;
    // Vandermonde 正規方程式 A^T A c = A^T y
    const ata = [];
    for (let i = 0; i < n; i++) { ata.push(new Array(n + 1).fill(0)); }
    for (let r = 0; r < xs.length; r++) {
      const powers = [1];
      for (let d = 1; d < n; d++) powers.push(powers[d - 1] * xs[r]);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) ata[i][j] += powers[i] * powers[j];
        ata[i][n] += powers[i] * ys[r];
      }
    }
    // 数値安定化のためわずかなリッジ
    for (let i = 0; i < n; i++) ata[i][i] += 1e-8;
    // ガウス消去
    for (let col = 0; col < n; col++) {
      let piv = col;
      for (let r = col + 1; r < n; r++) if (Math.abs(ata[r][col]) > Math.abs(ata[piv][col])) piv = r;
      const tmp = ata[col]; ata[col] = ata[piv]; ata[piv] = tmp;
      const d = ata[col][col] || 1e-12;
      for (let j = col; j <= n; j++) ata[col][j] /= d;
      for (let r = 0; r < n; r++) {
        if (r === col) continue;
        const f = ata[r][col];
        for (let j = col; j <= n; j++) ata[r][j] -= f * ata[col][j];
      }
    }
    return ata.map(row => row[n]);
  }
  function polyval(coef, x) {
    let v = 0, pw = 1;
    for (let i = 0; i < coef.length; i++) { v += coef[i] * pw; pw *= x; }
    return v;
  }
})();
