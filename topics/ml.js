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
<div class="note">下で多項式の次数を上げると、曲線が全ての訓練点（青）を通ろうとしてグニャグニャに暴れ、点のない場所で大きく外れます。真の関数（灰の点線）から離れていく様子が過学習です。ちょうど良い次数を探してください。</div>`,
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
<p>これは、各点と自分のクラスタ中心との距離の二乗和（クラスタ内平方和）を最小化する操作です。</p>
<p>$$ \\min \\sum_{j=1}^{k}\\sum_{x\\in C_j}\\|x-\\mu_j\\|^2 $$</p>
<div class="note">下のデモは「反復を進める」ボタンを押すたびに1ステップ進みます。×印が中心。最初はランダムな中心が、反復するうちに自然な塊の中心へ移動して落ち着きます。クラスタ数 k を変えるとグループ分けも変わります。</div>`,
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
<div class="note">下で「真の複雑さ」とノイズを変えると、訓練誤差（青・単調減少）と検証誤差（オレンジ・U字）の谷が動きます。谷の位置＝選ぶべき次数。ノイズが多いほど、単純なモデルが選ばれやすくなります。</div>`,
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
