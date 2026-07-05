'use strict';
/* 準1級 統計理論 — 追加トピック（範囲表の抜け漏れ対応） */
(function () {
  const T = (window.STATS_TOPICS = window.STATS_TOPICS || []);
  const S = () => window.Stats;
  const P = () => window.Plot;
  const TH = () => window.PlotlyTheme;

  /* 最小二乗（切片つき計画行列）で β を解く小道具 */
  function ols(X, y) {
    const st = S();
    const Xt = st.transpose(X);
    const XtX = st.matmul(Xt, X);
    const Xty = st.matvec(Xt, y);
    const beta = st.solve(XtX, Xty);
    return { beta, XtX };
  }

  /* --- 1. 重回帰と計画行列（Plotly 3D） --- */
  T.push({
    section: 'prep1', group: '回帰分析', id: 'multiple-regression', title: '重回帰と計画行列',
    summary: '説明変数を2つ以上に増やした重回帰を、行列 1 本の式 β̂=(XᵀX)⁻¹Xᵀy として理解し、当てはめ平面を3Dで見ます。',
    body: `
<p>2級で学ぶ単回帰は説明変数が1つ。<strong>重回帰</strong>は説明変数を複数にして、目的変数 $y$ を</p>
<p>$$ y = \\beta_0 + \\beta_1 x_1 + \\beta_2 x_2 + \\cdots + \\beta_p x_p + \\varepsilon $$</p>
<p>で予測します。例えば OpenIntro の「マリオカート」の例では、中古ゲームの落札価格を「新品か中古か」「付属コントローラの数」などから予測しました。</p>
<h3>計画行列でまとめて書く</h3>
<p>$n$ 個の観測と切片列（すべて1）を並べた<strong>計画行列</strong> $X$（$n\\times(p{+}1)$）を作ると、最小二乗解は<a href="#/math/matrix-ops">逆行列</a>1本で書けます。</p>
<p>$$ \\hat{\\boldsymbol\\beta}=(X^\\top X)^{-1}X^\\top \\boldsymbol{y} $$</p>
<p>係数の不確かさ（分散共分散）も行列で出ます。ここで $\\sigma^2$ は誤差分散です。</p>
<p>$$ \\mathrm{Var}(\\hat{\\boldsymbol\\beta})=\\sigma^2 (X^\\top X)^{-1} $$</p>
<p>説明変数が2つのとき、当てはめは3次元空間の<strong>平面</strong>になります（単回帰の直線の一段上）。各係数は「他の変数を一定にしたときの、その変数1単位あたりの $y$ の変化」を表します。</p>
<div class="note">下は $y \\sim x_1, x_2$ の重回帰。点が観測、面が最小二乗で当てた平面です。ドラッグで回せます。真の係数を動かすと平面の傾きが変わり、推定された $\\hat\\beta$ が真の値に近いことを確認できます。次の<a href="#/prep1/multicollinearity">多重共線性</a>では、$x_1,x_2$ が似ていると係数が不安定になる様子を見ます。</div>`,
    demo: {
      heading: '🌐 3Dで確かめる（ドラッグで回転）',
      note: '面が最小二乗回帰平面。ノイズを増やすと点が面から離れ、推定係数のばらつき（標準誤差）が大きくなります。β̂=(XᵀX)⁻¹Xᵀy で計算しています。',
      controls: [
        { type: 'range', id: 'b1', label: '真の係数 β₁（x₁の効き）', min: -2, max: 2, step: 0.2, value: 1.2 },
        { type: 'range', id: 'b2', label: '真の係数 β₂（x₂の効き）', min: -2, max: 2, step: 0.2, value: -0.8 },
        { type: 'range', id: 'noise', label: 'ノイズ σ', min: 0, max: 3, step: 0.2, value: 1 },
        { type: 'range', id: 'n', label: 'データ数', min: 15, max: 120, step: 5, value: 50 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      plot(div, p, Plotly) {
        const st = S();
        const rand = st.rng(400 + (p.reseed | 0) * 31);
        const n = Math.round(p.n);
        const b0 = 3;
        const X = [], y = [], x1s = [], x2s = [];
        for (let i = 0; i < n; i++) {
          const x1 = -3 + 6 * rand(), x2 = -3 + 6 * rand();
          x1s.push(x1); x2s.push(x2);
          X.push([1, x1, x2]);
          y.push(b0 + p.b1 * x1 + p.b2 * x2 + p.noise * st.randn(rand));
        }
        const { beta } = ols(X, y);
        // 当てはめ平面
        const gx = st.linspace(-3, 3, 12), gy = st.linspace(-3, 3, 12);
        const z = gy.map(yy => gx.map(xx => beta[0] + beta[1] * xx + beta[2] * yy));
        const data = [
          { type: 'scatter3d', mode: 'markers', x: x1s, y: x2s, z: y, marker: { size: 3.5, color: '#4f6df5', opacity: 0.85 }, name: '観測' },
          { type: 'surface', x: gx, y: gy, z, colorscale: [[0, '#f4a261'], [1, '#e4572e']], opacity: 0.6, showscale: false, name: '回帰平面' },
        ];
        const layout = TH().layout({
          scene: TH().scene({ xaxis: { title: 'x₁' }, yaxis: { title: 'x₂' }, zaxis: { title: 'y' } }),
          margin: { l: 0, r: 0, t: 24, b: 0 },
          title: { text: 'β̂₀=' + beta[0].toFixed(2) + ', β̂₁=' + beta[1].toFixed(2) + ' (真' + p.b1 + '), β̂₂=' + beta[2].toFixed(2) + ' (真' + p.b2 + ')', font: { size: 12.5 }, x: 0.5, y: 0.98 },
        });
        Plotly.react(div, data, layout, TH().config);
      },
    },
  });

  /* --- 2. 多重共線性 --- */
  T.push({
    section: 'prep1', group: '回帰分析', id: 'multicollinearity', title: '多重共線性',
    summary: '説明変数どうしが似すぎると、個々の係数が不安定に暴れる。VIF という指標と、係数推定のばらつきで体感します。',
    body: `
<p><strong>多重共線性</strong>は、重回帰で説明変数どうしが強く相関している状態です。このとき<a href="#/math/matrix-ops">$X^\\top X$ の行列式が0に近づき</a>、逆行列が「爆発」して<strong>係数の分散が非常に大きく</strong>なります。</p>
<p>相関した2変数を分離できないので、「$x_1$ が効いているのか $x_2$ が効いているのか」を推定が決めきれず、少しデータが変わるだけで係数が大きく揺れます。予測はできても、個々の係数の解釈は危険になります。</p>
<h3>VIF（分散拡大係数）</h3>
<p>変数 $x_j$ を他の説明変数で回帰したときの決定係数を $R_j^2$ とすると、</p>
<p>$$ \\mathrm{VIF}_j = \\frac{1}{1-R_j^2} $$</p>
<p>目安として VIF が 10 を超えると多重共線性が強いとされます（2変数なら相関 $r$ に対して $\\mathrm{VIF}=1/(1-r^2)$）。</p>
<div class="note">下は、相関のある2つの説明変数で同じ真のモデルを何度も推定し、係数 $\\hat\\beta_1$ の推定値を並べたもの。変数間の相関を上げると、点群が横に大きく広がる＝推定が不安定になります。VIF も一緒に跳ね上がります。対策が<a href="#/chemo/pls">PLS回帰</a>や正則化です。</div>`,
    demo: {
      note: '相関を上げると β̂₁ の推定値（点）が大きく散らばり、VIF が急増します。予測はできても係数の値を深読みしてはいけない、が結論です。',
      controls: [
        { type: 'range', id: 'corr', label: '説明変数どうしの相関', min: 0, max: 0.98, step: 0.02, value: 0.6 },
        { type: 'range', id: 'n', label: '各データセットの標本数', min: 20, max: 150, step: 10, value: 40 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(88 + (p.reseed | 0) * 53);
        const r = p.corr, n = Math.round(p.n);
        const trueB1 = 1.5, trueB2 = 1.0, b0 = 2;
        const est = [];
        for (let rep = 0; rep < 200; rep++) {
          const X = [], y = [];
          for (let i = 0; i < n; i++) {
            const z1 = st.randn(rand), z2 = st.randn(rand);
            const x1 = z1;
            const x2 = r * z1 + Math.sqrt(1 - r * r) * z2;
            X.push([1, x1, x2]);
            y.push(b0 + trueB1 * x1 + trueB2 * x2 + 1.0 * st.randn(rand));
          }
          try { est.push(ols(X, y).beta[1]); } catch (e) { /* skip singular */ }
        }
        const vif = 1 / (1 - r * r);
        const lo = -2, hi = 5;
        const bins = st.histogram(est, 40, lo, hi);
        const ymax = Math.max.apply(null, bins.map(b => b.count)) * 1.15 || 1;
        const pl = Pl.make(canvas, { xmin: lo, xmax: hi, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: '推定された β̂₁（真の値=1.5）', yLabel: '回数' });
        pl.bars(bins.map(b => ({ x0: b.x0, x1: b.x1, y: b.count })), { color: Pl.colors[0], alpha: 0.6 });
        pl.vline(trueB1, { color: Pl.colors[1], label: '真 β₁=1.5' });
        const sd = st.sd(est);
        pl.text(hi, ymax, 'VIF = ' + vif.toFixed(1) + (vif > 10 ? ' ⚠強い共線性' : ''), { align: 'right', baseline: 'top', dx: -8, dy: 6, color: vif > 10 ? Pl.colors[1] : '#475467', size: 13 });
        pl.text(hi, ymax, 'β̂₁ の標準偏差 = ' + sd.toFixed(2), { align: 'right', baseline: 'top', dx: -8, dy: 26, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- 3. モデル選択（AIC・調整済みR²） --- */
  T.push({
    section: 'prep1', group: '回帰分析', id: 'model-selection', title: 'モデル選択（AIC・調整済み R²）',
    summary: '「変数を増やすほど当てはまりは良くなる」罠を、複雑さに罰を科す情報量規準（AIC）と調整済み R² で乗り越えます。',
    body: `
<p>説明変数を増やすと、訓練データへの当てはまり（$R^2$）は<strong>必ず</strong>良くなります。でも無関係な変数を足しても“見かけ”が良くなるだけで、予測は改善しません。そこで<strong>複雑さに罰</strong>を科した指標を使います。</p>
<h3>調整済み決定係数</h3>
<p>変数の数 $k$ でペナルティをかけた $R^2$ です。</p>
<p>$$ \\bar{R}^2 = 1-(1-R^2)\\frac{n-1}{n-k-1} $$</p>
<h3>赤池情報量規準（AIC）</h3>
<p>「当てはまりの良さ」と「パラメータ数」を天秤にかけ、<strong>小さいほど良い</strong>とする規準です（正規線形モデルでの近似形）。</p>
<p>$$ \\mathrm{AIC}=n\\ln\\!\\left(\\frac{\\mathrm{RSS}}{n}\\right)+2k $$</p>
<p>OpenIntro の重回帰でも、後退（変数減少）法で AIC が最小になるモデルを探しました。<a href="#/prep1/crossval">交差検証</a>が「実際に予測を試す」方法なのに対し、AIC や調整済み $R^2$ は「式で罰を科す」手軽な方法です。</p>
<div class="note">下で真の重要変数の数を決め、モデルに入れる変数を1個ずつ増やします。訓練 $R^2$（青）は増え続けますが、調整済み $R^2$（緑）と AIC（オレンジ, 右軸的に反転表示）は「真の変数の数」あたりで頭打ち・最小になります。ここが選ぶべき複雑さです。</div>`,
    demo: {
      note: '青（訓練R²）は単調増加なので選択に使えません。緑（調整済みR²）の頂点、オレンジ（AIC）の谷が最適な変数の数を教えます。無駄な変数はむしろ悪化させます。',
      controls: [
        { type: 'range', id: 'trueK', label: '本当に効く変数の数', min: 1, max: 8, step: 1, value: 3 },
        { type: 'range', id: 'noise', label: 'ノイズ', min: 0.2, max: 3, step: 0.2, value: 1 },
        { type: 'range', id: 'n', label: 'データ数', min: 30, max: 200, step: 10, value: 60 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(300 + (p.reseed | 0) * 17);
        const n = Math.round(p.n), trueK = Math.round(p.trueK), maxK = 10;
        // 変数を maxK 個生成。最初の trueK 個だけ真の係数を持つ
        const cols = [];
        for (let j = 0; j < maxK; j++) { const c = []; for (let i = 0; i < n; i++) c.push(st.randn(rand)); cols.push(c); }
        const y = [];
        for (let i = 0; i < n; i++) {
          let v = 1;
          for (let j = 0; j < trueK; j++) v += 1.2 * cols[j][i];
          y.push(v + p.noise * st.randn(rand));
        }
        const ybar = st.mean(y);
        const sst = y.reduce((s, v) => s + (v - ybar) ** 2, 0);
        const r2s = [], adj = [], aics = [];
        for (let k = 1; k <= maxK; k++) {
          const X = [];
          for (let i = 0; i < n; i++) { const row = [1]; for (let j = 0; j < k; j++) row.push(cols[j][i]); X.push(row); }
          const beta = ols(X, y).beta;
          let rss = 0;
          for (let i = 0; i < n; i++) { const pred = st.dot(X[i], beta); rss += (y[i] - pred) ** 2; }
          const R2 = 1 - rss / sst;
          r2s.push(R2);
          adj.push(1 - (1 - R2) * (n - 1) / (n - k - 1));
          aics.push(n * Math.log(rss / n) + 2 * (k + 1));
        }
        // AIC を [0,1] に正規化して同じ軸に重ねる（谷が見えるように反転）
        const amin = Math.min.apply(null, aics), amax = Math.max.apply(null, aics);
        const aicN = aics.map(a => 1 - (a - amin) / (amax - amin || 1));
        const pl = Pl.make(canvas, { xmin: 0.5, xmax: maxK + 0.5, ymin: -0.05, ymax: 1.05 });
        pl.clear(); pl.axes({ xLabel: 'モデルに入れた変数の数', yLabel: '指標（正規化）', xTicks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] });
        pl.line(r2s.map((v, i) => [i + 1, v]), { color: Pl.colors[0], width: 2.5 });
        pl.scatter(r2s.map((v, i) => [i + 1, v]), { color: Pl.colors[0], r: 3 });
        pl.line(adj.map((v, i) => [i + 1, v]), { color: Pl.colors[2], width: 2.5 });
        pl.scatter(adj.map((v, i) => [i + 1, v]), { color: Pl.colors[2], r: 3 });
        pl.line(aicN.map((v, i) => [i + 1, v]), { color: Pl.colors[1], width: 2, dash: [5, 4] });
        pl.vline(trueK, { color: Pl.ink, label: '真の変数数=' + trueK });
        pl.legend([
          { label: '訓練 R²', color: Pl.colors[0] },
          { label: '調整済み R²', color: Pl.colors[2] },
          { label: 'AIC（谷が最良）', color: Pl.colors[1] },
        ]);
      },
    },
  });

  /* --- 4. デルタ法と誤差の伝搬 --- */
  T.push({
    section: 'prep1', group: '推定', id: 'delta-method', title: 'デルタ法と誤差の伝搬',
    summary: '推定値 θ̂ を関数 g に通したとき、その不確かさ（分散）がどう変わるか。接線で近似する「デルタ法」を図で理解します。',
    body: `
<p>推定量 $\\hat\\theta$ に不確かさ（分散 $\\mathrm{Var}(\\hat\\theta)$）があるとき、それを非線形な関数 $g$ に通した $g(\\hat\\theta)$ の不確かさはどうなるでしょう。<strong>デルタ法</strong>は、$g$ を推定値のまわりで<strong>接線（1次）で近似</strong>して分散を伝えます。</p>
<p>$$ \\mathrm{Var}\\big(g(\\hat\\theta)\\big)\\;\\approx\\;\\big[g'(\\theta)\\big]^2\\,\\mathrm{Var}(\\hat\\theta) $$</p>
<p>直感は単純です。$g$ の傾き $g'$ が急な場所では、入力の小さなブレが出力で大きく拡大されます。傾きがゆるい場所では逆に縮みます。これは分析化学での<strong>誤差の伝搬</strong>（検量線から濃度を逆算するときの不確かさなど）と同じ考え方です。</p>
<div class="note">下で関数 $g$ の急峻さと、入力 $\\hat\\theta$ のばらつきを動かすと、出力側の分布の広がりが $[g'(\\theta)]^2$ 倍で変わります。接線がきつい（傾きが大きい）ほど、出力のヒストグラムが横に広がるのを確認してください。多変数版が<a href="#/doe/rsm-error">応答の信頼区間</a>や共分散を使った誤差伝搬です。</div>`,
    demo: {
      note: '左の入力分布（縦）を接線で写すと右（下）の出力分布になります。傾き g′ が大きいほど出力の広がりが拡大。これが「誤差が伝搬する」仕組みです。',
      controls: [
        { type: 'range', id: 'theta', label: '推定値の位置 θ̂', min: 0.3, max: 2.5, step: 0.1, value: 1.2 },
        { type: 'range', id: 'sd', label: '入力のばらつき SD(θ̂)', min: 0.05, max: 0.5, step: 0.05, value: 0.25 },
        { type: 'select', id: 'g', label: '関数 g', value: 'sq', options: [
          { value: 'sq', label: 'g(θ)=θ²' },
          { value: 'exp', label: 'g(θ)=e^θ' },
          { value: 'log', label: 'g(θ)=ln θ' },
        ]},
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const g = p.g === 'sq' ? (t => t * t) : p.g === 'exp' ? (t => Math.exp(t)) : (t => Math.log(t));
        const gp = p.g === 'sq' ? (t => 2 * t) : p.g === 'exp' ? (t => Math.exp(t)) : (t => 1 / t);
        const th = p.theta, sd = p.sd;
        const gy = g(th), slope = gp(th);
        const outSd = Math.abs(slope) * sd; // デルタ法による出力SD
        const xmin = 0, xmax = 3;
        const ymin = Math.min(0, g(0.3) - 1), ymax = Math.max(g(2.5), gy + 3 * outSd + 0.5);
        const pl = Pl.make(canvas, { xmin, xmax, ymin, ymax });
        pl.clear(); pl.axes({ xLabel: 'θ', yLabel: 'g(θ)' });
        // 関数曲線
        const grid = st.linspace(0.3, 2.9, 120);
        pl.line(grid.map(t => [t, g(t)]), { color: Pl.colors[2], width: 2.5 });
        // 接線
        pl.line([[th - 1.2, gy - slope * 1.2], [th + 1.2, gy + slope * 1.2]], { color: Pl.gray, width: 1.5, dash: [5, 4] });
        // 入力分布（下側、横向きの山）
        const scaleIn = 0.5 / st.normalPdf(th, th, sd);
        pl.line(st.linspace(th - 3 * sd, th + 3 * sd, 60).map(t => [t, ymin + st.normalPdf(t, th, sd) * scaleIn * 0.6]), { color: Pl.colors[0], width: 2 });
        pl.vline(th, { color: Pl.colors[0], dash: [3, 3] });
        // 出力分布（左側、縦向きの山）
        const scaleOut = 0.5 / st.normalPdf(gy, gy, outSd);
        pl.line(st.linspace(gy - 3 * outSd, gy + 3 * outSd, 60).map(v => [xmin + st.normalPdf(v, gy, outSd) * scaleOut * 0.6, v]), { color: Pl.colors[1], width: 2 });
        pl.hline(gy, { color: Pl.colors[1], dash: [3, 3] });
        pl.scatter([[th, gy]], { color: Pl.ink, r: 5 });
        pl.text(xmax, ymax, "g′(θ) = " + slope.toFixed(2), { align: 'right', baseline: 'top', dx: -8, dy: 6, color: '#475467', size: 12.5 });
        pl.text(xmax, ymax, '出力SD ≈ |g′|·SD = ' + outSd.toFixed(3), { align: 'right', baseline: 'top', dx: -8, dy: 26, color: Pl.colors[1], size: 12.5 });
      },
    },
  });

  /* --- 5. 分割表とカイ二乗独立性検定 --- */
  T.push({
    section: 'prep1', group: '検定', id: 'contingency', title: '分割表とカイ二乗独立性検定',
    summary: '2つのカテゴリ変数が「無関係かどうか」を、観測度数と期待度数のズレ（カイ二乗統計量）で検定します。',
    body: `
<p>2つのカテゴリ変数（例：性別×商品の好み）をクロス集計した表を<strong>分割表</strong>と呼びます。「2変数は独立か（無関係か）」を調べるのが<strong>カイ二乗独立性検定</strong>です。</p>
<h3>期待度数と検定統計量</h3>
<p>もし独立なら、各セルの度数は行合計と列合計から次のように予想できます。</p>
<p>$$ E_{ij}=\\frac{(\\text{行}i\\text{の合計})\\times(\\text{列}j\\text{の合計})}{\\text{総数}\\,N} $$</p>
<p>観測度数 $O_{ij}$ と期待度数 $E_{ij}$ のズレを合計したのが検定統計量です。自由度は $(r-1)(c-1)$。</p>
<p>$$ \\chi^2=\\sum_{i,j}\\frac{(O_{ij}-E_{ij})^2}{E_{ij}} \\;\\sim\\; \\chi^2_{(r-1)(c-1)} $$</p>
<p>$\\chi^2$ が大きい（$p$ 値が小さい）ほど「独立とは言えない＝関連がある」と判断します。2×2 表なら<strong>オッズ比</strong>で関連の向きと強さも表せます。</p>
<div class="note">下は 2×3 の分割表。関連の強さを上げると、観測度数（濃い棒）が期待度数（薄い枠）から離れ、$\\chi^2$ と関連が大きくなります。関連ゼロだと観測と期待がほぼ重なり、$p$ 値は大きく（独立を棄却できない）なります。</div>`,
    demo: {
      note: '濃い棒が観測、薄い枠が「独立なら期待される」度数。関連を強めると両者がズレて χ² が増え、p値が下がります。ズレの二乗和がそのまま χ² です。',
      controls: [
        { type: 'range', id: 'assoc', label: '関連の強さ', min: 0, max: 1, step: 0.05, value: 0.4 },
        { type: 'range', id: 'N', label: '総サンプル数', min: 60, max: 600, step: 30, value: 240 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(500 + (p.reseed | 0) * 29);
        const rows = 2, cols = 3;
        const N = Math.round(p.N);
        // 独立な基準確率 + 関連による偏り
        const rowP = [0.5, 0.5];
        const colP = [0.3, 0.45, 0.25];
        const O = [[0, 0, 0], [0, 0, 0]];
        for (let s = 0; s < N; s++) {
          let ri = rand() < rowP[0] ? 0 : 1;
          // 関連: 行0は列0寄り、行1は列2寄りにゆがめる
          let cp = colP.slice();
          const shift = p.assoc * 0.3;
          if (ri === 0) { cp = [colP[0] + shift, colP[1], colP[2] - shift]; }
          else { cp = [colP[0] - shift, colP[1], colP[2] + shift]; }
          const u = rand(); let ci = 0, acc = 0;
          for (let j = 0; j < cols; j++) { acc += Math.max(0, cp[j]); if (u < acc) { ci = j; break; } ci = j; }
          O[ri][ci]++;
        }
        const rowT = O.map(r => r.reduce((a, b) => a + b, 0));
        const colT = [0, 1, 2].map(j => O[0][j] + O[1][j]);
        const E = [[0, 0, 0], [0, 0, 0]];
        let chi2 = 0;
        for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) { E[i][j] = rowT[i] * colT[j] / N; chi2 += (O[i][j] - E[i][j]) ** 2 / (E[i][j] || 1); }
        const dfc = (rows - 1) * (cols - 1);
        const pval = 1 - st.chi2Cdf(chi2, dfc);
        const maxV = Math.max.apply(null, O.flat().concat(E.flat())) * 1.15;
        const pl = Pl.make(canvas, { xmin: 0, xmax: 6, ymin: 0, ymax: maxV });
        pl.clear();
        pl.axes({ xLabel: '（行×列）の6セル', yLabel: '度数', xTicks: [] , xFmt: () => '' });
        const ctx = pl.ctx;
        let idx = 0;
        for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
          const x = idx + 0.5;
          // 期待（薄い枠）
          const x0 = pl.X(x - 0.38), x1 = pl.X(x + 0.38);
          ctx.strokeStyle = Pl.gray; ctx.lineWidth = 1.5;
          ctx.strokeRect(x0, pl.Y(E[i][j]), x1 - x0, pl.Y(0) - pl.Y(E[i][j]));
          // 観測（濃い棒）
          pl.bars([{ x0: x - 0.28, x1: x + 0.28, y: O[i][j] }], { color: Pl.colors[i], alpha: 0.75 });
          ctx.fillStyle = '#98a2b3'; ctx.font = '10.5px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          ctx.fillText('行' + (i + 1) + '列' + (j + 1), pl.X(x), pl.Y(0) + 6);
          idx++;
        }
        pl.text(6, maxV, 'χ² = ' + chi2.toFixed(1) + '（df=' + dfc + '）', { align: 'right', baseline: 'top', dx: -8, dy: 6, color: Pl.ink, size: 13 });
        pl.text(6, maxV, 'p = ' + (pval < 0.001 ? '<0.001' : pval.toFixed(3)) + (pval < 0.05 ? ' ✓関連あり' : ' 独立を棄却できず'), { align: 'right', baseline: 'top', dx: -8, dy: 26, color: pval < 0.05 ? Pl.colors[2] : '#98a2b3', size: 12.5 });
      },
    },
  });

  /* --- 6. ノンパラメトリック検定 --- */
  T.push({
    section: 'prep1', group: '検定', id: 'nonparametric', title: 'ノンパラメトリック検定（順位に基づく検定）',
    summary: '正規分布を仮定せず「順位」だけで比べるウィルコクソン検定。外れ値に強い理由を、t検定との比較で見ます。',
    body: `
<p>t検定は「データが正規分布に従う」ことを前提にします。分布がゆがんでいたり<strong>外れ値</strong>があると、この前提が崩れて結論を誤ります。<strong>ノンパラメトリック検定</strong>は分布の形を仮定せず、値を<strong>順位</strong>に置き換えて比較します。</p>
<h3>ウィルコクソンの順位和検定（マン・ホイットニー）</h3>
<p>2群のデータを混ぜて小さい順に順位をつけ、片方の群の順位の和 $W$ を検定統計量にします。独立・同分布なら</p>
<p>$$ E[W]=\\frac{n_1(N+1)}{2},\\qquad \\mathrm{Var}(W)=\\frac{n_1 n_2 (N+1)}{12} $$</p>
<p>で、正規近似 $z=(W-E[W])/\\sqrt{\\mathrm{Var}(W)}$ から $p$ 値を求めます。値そのものでなく順位を使うので、<strong>極端な外れ値の影響を受けにくい</strong>のが利点です。対応のあるデータには符号付き順位検定、3群以上にはクラスカル・ウォリス検定を使います。</p>
<div class="note">下で外れ値の大きさを上げると、平均を使う t検定の $p$ 値は大きく振り回されますが、順位を使うウィルコクソン検定は安定しています。「1個の異常値に結論を乗っ取られない」頑健さが体感できます。</div>`,
    demo: {
      note: '外れ値を大きくすると、t検定（平均ベース）の p値は不安定に暴れます。ウィルコクソン（順位ベース）はほぼ動かない＝外れ値に頑健。分布が正規から外れるときの保険です。',
      controls: [
        { type: 'range', id: 'shift', label: '2群の真の差', min: 0, max: 3, step: 0.1, value: 1 },
        { type: 'range', id: 'outlier', label: '外れ値の大きさ', min: 0, max: 30, step: 1, value: 0 },
        { type: 'range', id: 'n', label: '各群のサンプル数', min: 6, max: 30, step: 1, value: 12 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(610 + (p.reseed | 0) * 41);
        const n = Math.round(p.n);
        const g1 = [], g2 = [];
        for (let i = 0; i < n; i++) { g1.push(st.randn(rand)); g2.push(p.shift + st.randn(rand)); }
        if (p.outlier > 0) g2[0] += p.outlier; // 1個だけ外れ値
        // t検定（Welch 近似は使わず等分散プール、簡易）
        const m1 = st.mean(g1), m2 = st.mean(g2), s1 = st.sd(g1), s2 = st.sd(g2);
        const sp = Math.sqrt(((n - 1) * s1 * s1 + (n - 1) * s2 * s2) / (2 * n - 2));
        const tstat = (m2 - m1) / (sp * Math.sqrt(2 / n) || 1e-9);
        const tp = 2 * (1 - st.tCdf(Math.abs(tstat), 2 * n - 2));
        // ウィルコクソン順位和
        const all = g1.map(v => ({ v, g: 1 })).concat(g2.map(v => ({ v, g: 2 })));
        all.sort((a, b) => a.v - b.v);
        all.forEach((o, i) => { o.rank = i + 1; });
        let W = 0; for (const o of all) if (o.g === 1) W += o.rank;
        const N = 2 * n;
        const EW = n * (N + 1) / 2, VW = n * n * (N + 1) / 12;
        const z = (W - EW) / Math.sqrt(VW);
        const wp = 2 * (1 - st.normalCdf(Math.abs(z)));
        // 描画: 2群のドットプロット + p値
        const allV = g1.concat(g2);
        const xmin = Math.min.apply(null, allV) - 1, xmax = Math.max.apply(null, allV) + 1;
        const pl = Pl.make(canvas, { xmin, xmax, ymin: 0, ymax: 3 });
        pl.clear(); pl.axes({ xLabel: '値', yLabel: '', yTicks: [1, 2], yFmt: v => '群' + v });
        for (const v of g1) pl.scatter([[v, 1 + (rand() - 0.5) * 0.3]], { color: Pl.colors[0], r: 4, alpha: 0.75 });
        for (const v of g2) pl.scatter([[v, 2 + (rand() - 0.5) * 0.3]], { color: Pl.colors[1], r: 4, alpha: 0.75 });
        pl.vline(m1, { color: Pl.colors[0], label: '平均1' });
        pl.vline(m2, { color: Pl.colors[1], label: '平均2' });
        pl.text(xmax, 3, 't検定 p = ' + (tp < 0.001 ? '<0.001' : tp.toFixed(3)), { align: 'right', baseline: 'top', dx: -8, dy: 6, color: Pl.colors[3], size: 13 });
        pl.text(xmax, 3, 'Wilcoxon p = ' + (wp < 0.001 ? '<0.001' : wp.toFixed(3)), { align: 'right', baseline: 'top', dx: -8, dy: 26, color: Pl.colors[2], size: 13 });
      },
    },
  });

  /* --- 7. ブートストラップ --- */
  T.push({
    section: 'prep1', group: '推定', id: 'bootstrap', title: 'ブートストラップ',
    summary: '手元のデータから「復元抽出」を繰り返すだけで、中央値など難しい統計量の信頼区間を作れる計算的手法です。',
    body: `
<p>標本平均の標準誤差は $\\sigma/\\sqrt{n}$ と公式がありますが、<strong>中央値・相関係数・分位点</strong>などは公式が複雑だったり存在しません。<strong>ブートストラップ</strong>は、公式の代わりに<strong>計算機で再標本化</strong>して不確かさを見積もる方法です。</p>
<h3>やり方</h3>
<ol>
<li>手元の $n$ 個のデータから、<strong>復元抽出</strong>で $n$ 個を選び直す（同じ値が複数回選ばれてよい）。</li>
<li>その再標本で統計量（例：中央値）を計算する。</li>
<li>これを何千回も繰り返すと、統計量の<strong>ブートストラップ分布</strong>ができる。</li>
<li>その分布の 2.5% 点と 97.5% 点が 95% 信頼区間（パーセンタイル法）。</li>
</ol>
<p>「1つの標本を母集団のミニチュアとみなして、そこから何度も標本を取り直す」という発想です。<a href="#/prep1/clt">中心極限定理</a>が使えない統計量にも、区間推定を与えてくれます。ジャックナイフや並べ替え検定と同じ「計算多用手法」の仲間です。</p>
<div class="note">下は元データ（上の点）から復元抽出を繰り返して作った、統計量のブートストラップ分布（下のヒストグラム）。赤い範囲が95%信頼区間。統計量を中央値や平均に切り替え、サンプル数を変えて、区間の幅がどう変わるか見てください。</div>`,
    demo: {
      note: '下のヒストグラムがブートストラップ分布、赤い帯が95%信頼区間。中央値のように公式が面倒な統計量でも、再標本化だけで区間が得られます。n を増やすと区間が狭くなります。',
      controls: [
        { type: 'select', id: 'stat', label: '統計量', value: 'median', options: [
          { value: 'median', label: '中央値' },
          { value: 'mean', label: '平均' },
          { value: 'p90', label: '90パーセンタイル' },
        ]},
        { type: 'range', id: 'n', label: '元データのサンプル数', min: 10, max: 120, step: 10, value: 40 },
        { type: 'button', id: 'reseed', label: '元データ再生成' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(700 + (p.reseed | 0) * 61);
        const n = Math.round(p.n);
        // 右に歪んだ元データ（対数正規）
        const data = [];
        for (let i = 0; i < n; i++) data.push(Math.exp(0.5 * st.randn(rand)) * 10);
        const statf = arr => {
          const s = arr.slice().sort((a, b) => a - b);
          if (p.stat === 'mean') return st.mean(s);
          if (p.stat === 'median') return s[Math.floor(s.length / 2)];
          return s[Math.floor(s.length * 0.9)];
        };
        const B = 2000, boots = [];
        for (let b = 0; b < B; b++) {
          const re = [];
          for (let i = 0; i < n; i++) re.push(data[Math.floor(rand() * n)]);
          boots.push(statf(re));
        }
        boots.sort((a, b) => a - b);
        const lo = boots[Math.floor(B * 0.025)], hi = boots[Math.floor(B * 0.975)];
        const bmin = boots[0], bmax = boots[B - 1];
        const bins = st.histogram(boots, 40, bmin, bmax);
        const ymaxH = Math.max.apply(null, bins.map(b => b.count)) * 1.15 || 1;
        // 上段: 元データ点、下段: ブート分布。1枚に収めるため上に元データを小さく
        const pl = Pl.make(canvas, { xmin: bmin - (bmax - bmin) * 0.1, xmax: bmax + (bmax - bmin) * 0.1, ymin: 0, ymax: ymaxH * 1.25 });
        pl.clear(); pl.axes({ xLabel: '統計量の値', yLabel: '回数' });
        // 95% CI 帯
        const ctx = pl.ctx;
        ctx.fillStyle = 'rgba(228,87,46,0.10)';
        ctx.fillRect(pl.X(lo), pl.pad.top, pl.X(hi) - pl.X(lo), pl.H - pl.pad.top - pl.pad.bottom);
        pl.bars(bins.map(b => ({ x0: b.x0, x1: b.x1, y: b.count })), { color: Pl.colors[0], alpha: 0.6 });
        pl.vline(lo, { color: Pl.colors[1], label: '2.5%' });
        pl.vline(hi, { color: Pl.colors[1], label: '97.5%' });
        const obs = statf(data);
        pl.vline(obs, { color: Pl.ink, dash: [], label: '観測値' });
        pl.text(bmax, ymaxH * 1.25, '95%CI = [' + lo.toFixed(1) + ', ' + hi.toFixed(1) + ']', { align: 'right', baseline: 'top', dx: -8, dy: 6, color: Pl.colors[1], size: 12.5 });
      },
    },
  });

  /* --- 8. 時系列の基礎 --- */
  T.push({
    section: 'prep1', group: '時系列', id: 'timeseries', title: '時系列の基礎（自己相関・定常性）',
    summary: '時間で並んだデータ特有の「前の値を引きずる」性質を、AR(1)過程とランダムウォークで見ます。定常か非定常かが分かれ目です。',
    body: `
<p>時系列データは「時間順に並んでいて、隣りあう値が関係しあう」点がふつうの標本と違います。前の値との相関を<strong>自己相関</strong>と呼びます。</p>
<h3>AR(1) 過程</h3>
<p>最も基本的なモデルが1次自己回帰 AR(1) です。</p>
<p>$$ x_t = \\phi\\, x_{t-1} + \\varepsilon_t $$</p>
<ul>
<li>$|\\phi|<1$：過去の影響が徐々に薄れ、平均に戻る（<strong>定常</strong>）。自己相関は $\\phi^k$ で指数的に減衰。</li>
<li>$\\phi=1$：影響が消えない<strong>ランダムウォーク</strong>。分散が時間とともに増え、平均に戻らない（<strong>非定常</strong>）。株価などが近い。</li>
<li>$\\phi<0$：正負が交互に出て振動する。</li>
</ul>
<p>多くの時系列手法（ARIMA など）は、階差をとって<strong>定常</strong>に変換してから分析します。定常でない系列にそのまま回帰を当てると「見せかけの相関」が出るので注意が必要です。</p>
<div class="note">下で $\\phi$ を動かすと系列の様子が一変します。1 に近づけると大きくうねって戻らなくなり（非定常）、0 に近いとノイズのように暴れ、負にすると細かく振動します。右上に自己相関の減衰も表示します。</div>`,
    demo: {
      note: 'φを1に近づけると「トレンドのようにさまよう」非定常な動きに、0付近だと無相関ノイズ、負だとギザギザ振動。ARIMA はこれを階差で定常化してから扱います。',
      controls: [
        { type: 'range', id: 'phi', label: '自己回帰係数 φ', min: -0.95, max: 1.0, step: 0.05, value: 0.7 },
        { type: 'range', id: 'len', label: '系列の長さ', min: 50, max: 300, step: 25, value: 150 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(810 + (p.reseed | 0) * 23);
        const nT = Math.round(p.len), phi = p.phi;
        const x = [0];
        for (let t = 1; t < nT; t++) x.push(phi * x[t - 1] + st.randn(rand));
        const ymin = Math.min.apply(null, x) - 1, ymax = Math.max.apply(null, x) + 1;
        const pl = Pl.make(canvas, { xmin: 0, xmax: nT, ymin, ymax });
        pl.clear(); pl.axes({ xLabel: '時刻 t', yLabel: 'x(t)' });
        pl.hline(0, { color: Pl.gray, dash: [4, 4] });
        pl.line(x.map((v, t) => [t, v]), { color: Pl.colors[0], width: 1.6 });
        // 自己相関（小さく右上に）: r_k = phi^k の理論値を表示
        const stat = Math.abs(phi) < 1 ? '定常（平均に回帰）' : '非定常（ランダムウォーク）';
        pl.text(0, ymax, 'φ = ' + phi.toFixed(2) + ' → ' + stat, { align: 'left', baseline: 'top', dx: 60, dy: 4, color: Math.abs(phi) < 1 ? Pl.colors[2] : Pl.colors[1], size: 12.5 });
        // ミニ自己相関バー
        const ctx = pl.ctx;
        const bx = pl.pad.left + (pl.W - pl.pad.left - pl.pad.right) * 0.62, by = pl.pad.top + 10, bw = 120, bh = 60;
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.strokeStyle = '#dfe3ea';
        ctx.fillRect(bx, by, bw, bh); ctx.strokeRect(bx, by, bw, bh);
        ctx.fillStyle = '#66708a'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('自己相関 φ^k', bx + 6, by + 3);
        for (let k = 1; k <= 8; k++) {
          const val = Math.pow(phi, k);
          const barx = bx + 6 + (k - 1) * 14;
          const zero = by + bh - 14;
          ctx.fillStyle = val >= 0 ? '#4f6df5' : '#e4572e';
          ctx.fillRect(barx, val >= 0 ? zero - val * 22 : zero, 9, Math.abs(val) * 22);
        }
      },
    },
  });
})();
