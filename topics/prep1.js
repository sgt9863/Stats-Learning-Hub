'use strict';
/* 準1級 統計理論 */
(function () {
  const T = (window.STATS_TOPICS = window.STATS_TOPICS || []);
  const S = () => window.Stats;
  const P = () => window.Plot;

  /* --- 1. 確率分布ギャラリー --- */
  T.push({
    section: 'prep1', group: '確率と分布', id: 'distributions', title: '確率分布ギャラリー',
    summary: '正規・t・カイ二乗・F・二項・ポアソンなど、準1級で扱う主要な分布を1枚のグラフで比較しながら、形を決めるパラメータの役割を体感します。',
    body: `
<p>統計検定2級では正規分布と二項分布が主役でしたが、準1級では検定・区間推定で使う<strong>t分布・カイ二乗分布・F分布</strong>が加わります。これらは「正規分布から派生した分布」であり、標本サイズ（自由度）によって形が変わるのが最大の特徴です。</p>
<h3>連続分布の関係</h3>
<p>標準正規分布に従う $Z$ と、自由度 $k$ のカイ二乗 $\\chi^2_k$ から、次のように定義されます。</p>
<p>$$ t_k = \\frac{Z}{\\sqrt{\\chi^2_k / k}}, \\qquad F_{d_1,d_2} = \\frac{\\chi^2_{d_1}/d_1}{\\chi^2_{d_2}/d_2} $$</p>
<div class="note">t分布は自由度が大きくなると標準正規分布に近づきます（裾が薄くなる）。小標本では裾が厚く、「外れ値が出やすい」ことを織り込んだ分布になっています。</div>
<h3>離散分布</h3>
<p>二項分布 $\\mathrm{Bin}(n,p)$ は「成功確率 $p$ の試行を $n$ 回」、ポアソン分布 $\\mathrm{Po}(\\lambda)$ は「単位時間あたり平均 $\\lambda$ 回起こるまれな事象の回数」を表します。$n$ が大きく $p$ が小さいとき $\\mathrm{Bin}(n,p) \\approx \\mathrm{Po}(np)$ が成り立ちます。</p>
<p>下のグラフで分布を切り替え、パラメータを動かして形の変化を確かめてください。</p>`,
    demo: {
      note: '自由度（df）を大きくすると t分布は標準正規分布（点線）に重なっていきます。カイ二乗・F分布は自由度で山の位置と歪みが変わります。',
      controls: [
        { type: 'select', id: 'dist', label: '分布', value: 't', options: [
          { value: 't', label: 't 分布' },
          { value: 'chi2', label: 'カイ二乗分布' },
          { value: 'f', label: 'F 分布' },
          { value: 'binom', label: '二項分布' },
          { value: 'poisson', label: 'ポアソン分布' },
        ]},
        { type: 'range', id: 'a', label: 'パラメータ1', min: 1, max: 30, step: 1, value: 3 },
        { type: 'range', id: 'b', label: 'パラメータ2', min: 1, max: 30, step: 1, value: 10 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const dist = p.dist;
        if (dist === 't') {
          const xs = st.linspace(-5, 5, 240);
          const pl = Pl.make(canvas, { xmin: -5, xmax: 5, ymin: 0, ymax: 0.45 });
          pl.clear(); pl.axes({ xLabel: 'x', yLabel: '密度' });
          pl.line(xs.map(x => [x, st.normalPdf(x)]), { color: Pl.gray, dash: [5, 4], width: 2 });
          pl.line(xs.map(x => [x, st.tPdf(x, p.a)]), { color: Pl.colors[0], width: 2.5 });
          pl.legend([{ label: '標準正規', color: Pl.gray }, { label: 't (df=' + p.a + ')', color: Pl.colors[0] }]);
        } else if (dist === 'chi2') {
          const pl = Pl.make(canvas, { xmin: 0, xmax: 30, ymin: 0, ymax: 0.25 });
          pl.clear(); pl.axes({ xLabel: 'x', yLabel: '密度' });
          const xs = st.linspace(0.01, 30, 240);
          pl.line(xs.map(x => [x, st.chi2Pdf(x, p.a)]), { color: Pl.colors[0], width: 2.5 });
          pl.fillUnder(xs.map(x => [x, st.chi2Pdf(x, p.a)]), { color: Pl.colors[0], alpha: 0.12 });
          pl.legend([{ label: 'χ² (df=' + p.a + ')', color: Pl.colors[0] }]);
        } else if (dist === 'f') {
          const pl = Pl.make(canvas, { xmin: 0, xmax: 5, ymin: 0, ymax: 1 });
          pl.clear(); pl.axes({ xLabel: 'x', yLabel: '密度' });
          const xs = st.linspace(0.01, 5, 240);
          pl.line(xs.map(x => [x, st.fPdf(x, p.a, p.b)]), { color: Pl.colors[0], width: 2.5 });
          pl.fillUnder(xs.map(x => [x, st.fPdf(x, p.a, p.b)]), { color: Pl.colors[0], alpha: 0.12 });
          pl.legend([{ label: 'F (d1=' + p.a + ', d2=' + p.b + ')', color: Pl.colors[0] }]);
        } else if (dist === 'binom') {
          const n = Math.max(1, Math.round(p.a)), prob = Math.min(0.95, Math.max(0.05, p.b / 30));
          const pl = Pl.make(canvas, { xmin: -0.5, xmax: n + 0.5, ymin: 0, ymax: 0.4 });
          pl.clear(); pl.axes({ xLabel: 'k（成功回数）', yLabel: '確率' });
          const items = [];
          for (let k = 0; k <= n; k++) items.push({ x0: k - 0.42, x1: k + 0.42, y: st.binomPmf(k, n, prob) });
          pl.bars(items, { color: Pl.colors[0], alpha: 0.8 });
          pl.legend([{ label: 'Bin(n=' + n + ', p=' + prob.toFixed(2) + ')', color: Pl.colors[0] }]);
        } else {
          const lam = Math.max(0.5, p.a);
          const kmax = Math.max(12, Math.round(lam * 2 + 6));
          const pl = Pl.make(canvas, { xmin: -0.5, xmax: kmax + 0.5, ymin: 0, ymax: 0.4 });
          pl.clear(); pl.axes({ xLabel: 'k（回数）', yLabel: '確率' });
          const items = [];
          for (let k = 0; k <= kmax; k++) items.push({ x0: k - 0.42, x1: k + 0.42, y: st.poissonPmf(k, lam) });
          pl.bars(items, { color: Pl.colors[2], alpha: 0.8 });
          pl.legend([{ label: 'Po(λ=' + lam.toFixed(0) + ')', color: Pl.colors[2] }]);
        }
      },
    },
  });

  /* --- 2. 中心極限定理 --- */
  T.push({
    section: 'prep1', group: '確率と分布', id: 'clt', title: '中心極限定理と標本平均',
    summary: 'どんな分布から取った標本でも、その平均は標本サイズを大きくすると正規分布に近づく——推測統計の土台となる定理を、シミュレーションで目撃します。',
    body: `
<p><strong>中心極限定理（CLT）</strong>は、元の分布の形にかかわらず、標本平均 $\\bar{X}$ の分布が標本サイズ $n$ を大きくすると正規分布に近づく、という定理です。母平均 $\\mu$・母分散 $\\sigma^2$ のとき、</p>
<p>$$ \\bar{X} \\approx \\mathcal{N}\\!\\left(\\mu,\\; \\frac{\\sigma^2}{n}\\right) $$</p>
<p>ポイントは<strong>標準誤差</strong> $\\sigma/\\sqrt{n}$ です。$n$ を4倍にすると、平均のばらつきは半分になります（$\\sqrt{n}$ に反比例）。これが「サンプルを増やすほど推定が安定する」ことの数理的な理由です。</p>
<div class="note">元が右に歪んだ分布（指数分布など）でも、$n$ を増やせば標本平均のヒストグラムは左右対称の釣鐘型に近づきます。下で元分布と $n$ を変えて確かめてください。</div>`,
    demo: {
      note: 'オレンジの曲線は理論上の正規分布 N(μ, σ²/n)。元分布が偏っていても n を増やすと標本平均の分布がこの曲線に一致していきます。',
      controls: [
        { type: 'select', id: 'src', label: '元の分布', value: 'exp', options: [
          { value: 'unif', label: '一様分布' },
          { value: 'exp', label: '指数分布（右に歪む）' },
          { value: 'bimodal', label: '二峰性' },
        ]},
        { type: 'range', id: 'n', label: '標本サイズ n', min: 1, max: 50, step: 1, value: 5 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(1234 + (p.reseed | 0) * 97);
        const draw1 = () => {
          if (p.src === 'unif') return rand();
          if (p.src === 'exp') return -Math.log(1 - rand());
          return rand() < 0.5 ? 0.2 + 0.12 * st.randn(rand) : 0.8 + 0.12 * st.randn(rand);
        };
        // 母平均・母分散（理論値）
        let mu, varr;
        if (p.src === 'unif') { mu = 0.5; varr = 1 / 12; }
        else if (p.src === 'exp') { mu = 1; varr = 1; }
        else { mu = 0.5; varr = 0.09 + 0.0144; }
        const n = Math.max(1, Math.round(p.n));
        const means = [];
        for (let i = 0; i < 3000; i++) {
          let s = 0;
          for (let j = 0; j < n; j++) s += draw1();
          means.push(s / n);
        }
        const lo = mu - 4 * Math.sqrt(varr / n), hi = mu + 4 * Math.sqrt(varr / n);
        const bins = st.histogram(means, 34, lo, hi);
        const ymax = Math.max.apply(null, bins.map(b => b.density)) * 1.15 || 1;
        const pl = Pl.make(canvas, { xmin: lo, xmax: hi, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: '標本平均 x̄', yLabel: '密度' });
        pl.bars(bins.map(b => ({ x0: b.x0, x1: b.x1, y: b.density })), { color: Pl.colors[0], alpha: 0.55 });
        const se = Math.sqrt(varr / n);
        const xs = st.linspace(lo, hi, 160);
        pl.line(xs.map(x => [x, st.normalPdf(x, mu, se)]), { color: Pl.colors[1], width: 2.5 });
        pl.vline(mu, { color: Pl.ink, label: 'μ=' + mu.toFixed(2) });
        pl.legend([{ label: '標本平均の分布', color: Pl.colors[0] }, { label: 'N(μ, σ²/n)', color: Pl.colors[1] }]);
        pl.text(hi, ymax, '標準誤差 SE = ' + se.toFixed(3), { align: 'right', baseline: 'top', dx: -8, dy: 26, color: '#475467', size: 12 });
      },
    },
  });

  /* --- 3. 最尤推定 --- */
  T.push({
    section: 'prep1', group: '推定', id: 'mle', title: '最尤推定（MLE）',
    summary: '「観測データが最も起こりやすくなるパラメータを選ぶ」という推定の考え方を、尤度曲線を動かしながら理解します。',
    body: `
<p><strong>最尤推定</strong>は、観測されたデータ $x_1,\\dots,x_n$ を「最も起こりやすくする」パラメータ $\\theta$ を選ぶ方法です。尤度関数 $L(\\theta)$ とその対数（対数尤度）を定義します。</p>
<p>$$ L(\\theta) = \\prod_{i=1}^{n} f(x_i \\mid \\theta), \\qquad \\ell(\\theta) = \\sum_{i=1}^{n} \\log f(x_i \\mid \\theta) $$</p>
<p>正規分布で分散既知の場合、対数尤度を $\\mu$ で微分して0とおくと、最尤推定量は標本平均 $\\hat{\\mu}=\\bar{x}$ になります。つまり「平均で推定する」という直感が、最尤原理から導かれます。</p>
<div class="note">下のデモは、コインの表が出た回数から成功確率 $p$ を推定する例です。データ（表の回数）を変えると尤度のピーク位置＝最尤推定値 $\\hat{p}=k/n$ が移動します。データ数 $n$ を増やすとピークが鋭くなり、推定の確信度が上がります。</div>`,
    demo: {
      note: 'ピーク（縦線）が最尤推定値。試行回数 n を増やすと曲線が鋭くなり、推定の不確かさが小さくなる様子が見えます。',
      controls: [
        { type: 'range', id: 'n', label: '試行回数 n', min: 5, max: 200, step: 5, value: 20 },
        { type: 'range', id: 'k', label: '表の回数 k', min: 0, max: 200, step: 1, value: 13 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const n = Math.round(p.n);
        const k = Math.min(n, Math.round(p.k));
        const ps = st.linspace(0.001, 0.999, 300);
        // 対数尤度（定数項無視）を最大値0に正規化して表示
        const ll = ps.map(pp => k * Math.log(pp) + (n - k) * Math.log(1 - pp));
        const maxll = Math.max.apply(null, ll);
        const pl = Pl.make(canvas, { xmin: 0, xmax: 1, ymin: -12, ymax: 0.5 });
        pl.clear(); pl.axes({ xLabel: '成功確率 p', yLabel: '対数尤度（相対）' });
        pl.line(ps.map((pp, i) => [pp, ll[i] - maxll]), { color: Pl.colors[0], width: 2.5 });
        pl.fillUnder(ps.map((pp, i) => [pp, Math.max(-12, ll[i] - maxll)]), { color: Pl.colors[0], alpha: 0.1, baseline: -12 });
        const phat = k / n;
        pl.vline(phat, { color: Pl.colors[1], label: 'p̂ = k/n = ' + phat.toFixed(3) });
        pl.legend([{ label: '対数尤度 ℓ(p)', color: Pl.colors[0] }]);
      },
    },
  });

  /* --- 4. 仮説検定 --- */
  T.push({
    section: 'prep1', group: '検定', id: 'testing', title: '仮説検定・第1種/第2種の誤りと検出力',
    summary: '有意水準・p値・検出力の関係を、帰無分布と対立分布の2つの山を重ねて視覚的に整理します。',
    body: `
<p>検定では、帰無仮説 $H_0$ のもとでの検定統計量の分布（帰無分布）を基準に、観測値が「起こりにくい」領域（棄却域）に入るかを判断します。ここで2種類の誤りが生じます。</p>
<table class="simple">
<tr><th></th><th>H₀ が真</th><th>H₁ が真</th></tr>
<tr><th>H₀ を棄却</th><td>第1種の誤り（確率 α）</td><td>正しい判断（検出力 1−β）</td></tr>
<tr><th>H₀ を採択</th><td>正しい判断（1−α）</td><td>第2種の誤り（確率 β）</td></tr>
</table>
<p><strong>有意水準 $\\alpha$</strong> は「本当は差がないのに差があると誤る確率」、<strong>検出力 $1-\\beta$</strong> は「本当に差があるとき正しく検出できる確率」です。効果量（2つの山の離れ具合）が大きいほど、また標本サイズが大きいほど検出力は上がります。</p>
<div class="note">下のグラフで、青が帰無分布、オレンジが対立分布。赤い領域が α（第1種の誤り）、灰色が β（第2種の誤り）です。効果量やαを動かして、検出力がどう変わるかを観察してください。</div>`,
    demo: {
      note: '効果量（山の間隔）を大きくする、または α を大きくすると検出力（1−β）が上がります。トレードオフが視覚的に分かります。',
      controls: [
        { type: 'range', id: 'effect', label: '効果量 (μ₁−μ₀)/σ', min: 0, max: 4, step: 0.1, value: 1.5 },
        { type: 'range', id: 'alpha', label: '有意水準 α (%)', min: 1, max: 20, step: 1, value: 5 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const d = p.effect;
        const alpha = p.alpha / 100;
        const zc = st.normalInv(1 - alpha); // 片側棄却限界
        const xs = st.linspace(-4, 4 + d + 1, 320);
        const ymax = 0.45;
        const pl = Pl.make(canvas, { xmin: -4, xmax: 4 + d, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: '検定統計量', yLabel: '密度' });
        // 帰無分布
        pl.line(xs.map(x => [x, st.normalPdf(x, 0, 1)]), { color: Pl.colors[0], width: 2 });
        // 対立分布
        pl.line(xs.map(x => [x, st.normalPdf(x, d, 1)]), { color: Pl.colors[1], width: 2 });
        // α 領域（帰無分布の右裾）
        const aReg = xs.filter(x => x >= zc).map(x => [x, st.normalPdf(x, 0, 1)]);
        if (aReg.length) pl.fillUnder(aReg, { color: '#e4572e', alpha: 0.35 });
        // β 領域（対立分布の左側）
        const bReg = xs.filter(x => x <= zc).map(x => [x, st.normalPdf(x, d, 1)]);
        if (bReg.length) pl.fillUnder(bReg, { color: Pl.gray, alpha: 0.3 });
        pl.vline(zc, { color: Pl.ink, label: '棄却限界 z=' + zc.toFixed(2) });
        const power = 1 - st.normalCdf(zc, d, 1);
        pl.legend([
          { label: 'H₀ (帰無)', color: Pl.colors[0] },
          { label: 'H₁ (対立)', color: Pl.colors[1] },
        ]);
        pl.text(4 + d, ymax, '検出力 1−β = ' + (power * 100).toFixed(1) + '%', { align: 'right', baseline: 'top', dx: -8, dy: 44, color: Pl.colors[1], size: 13 });
        pl.text(4 + d, ymax, 'α = ' + (alpha * 100).toFixed(0) + '%', { align: 'right', baseline: 'top', dx: -8, dy: 62, color: '#e4572e', size: 13 });
      },
    },
  });

  /* --- 5. 信頼区間 --- */
  T.push({
    section: 'prep1', group: '推定', id: 'confidence', title: '信頼区間の意味',
    summary: '「95%信頼区間」を正しく解釈する——区間が母平均を捉える／外すシミュレーションを繰り返し、被覆確率の意味を体感します。',
    body: `
<p>母平均 $\\mu$ の $100(1-\\alpha)\\%$ 信頼区間は、母分散未知のとき次で与えられます（$t$ は自由度 $n-1$ の $t$ 分布）。</p>
<p>$$ \\bar{x} \\pm t_{\\alpha/2,\\,n-1}\\cdot \\frac{s}{\\sqrt{n}} $$</p>
<p>よくある誤解は「この区間に母平均が95%の確率で入る」というもの。正しくは<strong>「同じ手順で何度も区間を作れば、そのうち約95%が母平均を含む」</strong>という、手順の性質（被覆確率）です。母平均は定数で、動くのは区間のほうです。</p>
<div class="note">下のデモは各行が1回の標本抽出から作った信頼区間。母平均（縦線）を含む区間は青、外した区間は赤。「再サンプル」を何度も押すと、外す割合が約 (1−信頼水準) に収まることが分かります。</div>`,
    demo: {
      note: '信頼水準を上げると区間は長くなり（安全側）、外す本数は減ります。区間の長さと確実性のトレードオフが見えます。',
      controls: [
        { type: 'range', id: 'n', label: '標本サイズ n', min: 5, max: 100, step: 5, value: 20 },
        { type: 'range', id: 'level', label: '信頼水準 (%)', min: 80, max: 99, step: 1, value: 95 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(777 + (p.reseed | 0) * 131);
        const mu = 50, sigma = 10;
        const n = Math.round(p.n);
        const level = p.level / 100;
        const K = 30; // 区間の本数
        const intervals = [];
        let covered = 0;
        // t分位点（近似: 二分法）
        const tcrit = (() => {
          const target = 1 - (1 - level) / 2;
          let lo = 0, hi = 40;
          for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (st.tCdf(m, n - 1) < target) lo = m; else hi = m; }
          return (lo + hi) / 2;
        })();
        for (let r = 0; r < K; r++) {
          const xs = [];
          for (let i = 0; i < n; i++) xs.push(mu + sigma * st.randn(rand));
          const m = st.mean(xs), s = st.sd(xs);
          const half = tcrit * s / Math.sqrt(n);
          const ok = (mu >= m - half && mu <= m + half);
          if (ok) covered++;
          intervals.push({ m, half, ok });
        }
        const pl = Pl.make(canvas, { xmin: mu - 18, xmax: mu + 18, ymin: 0, ymax: K + 1, pad: { left: 30, right: 18, top: 18, bottom: 42 } });
        pl.clear();
        pl.axes({ xLabel: '推定値と区間', yTicks: [], yFmt: () => '' });
        pl.vline(mu, { color: Pl.ink, width: 2, dash: [], label: '母平均 μ=50' });
        const ctx = pl.ctx;
        intervals.forEach((iv, r) => {
          const y = r + 1;
          const col = iv.ok ? Pl.colors[0] : Pl.colors[1];
          ctx.strokeStyle = col; ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pl.X(iv.m - iv.half), pl.Y(y));
          ctx.lineTo(pl.X(iv.m + iv.half), pl.Y(y));
          ctx.stroke();
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(pl.X(iv.m), pl.Y(y), 2.5, 0, Math.PI * 2); ctx.fill();
        });
        pl.text(mu + 18, K + 1, K + '本中 ' + covered + '本が μ を含む (' + (covered / K * 100).toFixed(0) + '%)', { align: 'right', baseline: 'top', dx: -6, dy: 2, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- 6. ベイズ推定 --- */
  T.push({
    section: 'prep1', group: 'ベイズ', id: 'bayes', title: 'ベイズ推定と事前・事後分布',
    summary: '事前分布にデータの尤度を掛けて事後分布を得る——ベイズ更新の流れを、ベータ分布の変形として見ます。',
    body: `
<p>ベイズ統計では、パラメータ $\\theta$ を確率変数とみなし、データ $D$ を観測した後の<strong>事後分布</strong>を次で求めます。</p>
<p>$$ \\underbrace{p(\\theta \\mid D)}_{\\text{事後}} \\;\\propto\\; \\underbrace{p(D \\mid \\theta)}_{\\text{尤度}}\\;\\underbrace{p(\\theta)}_{\\text{事前}} $$</p>
<p>コインの表確率 $\\theta$ を推定する例では、事前分布に $\\mathrm{Beta}(a,b)$ を使うと、$k$ 回表・$n-k$ 回裏を観測した後の事後分布は $\\mathrm{Beta}(a+k,\\; b+n-k)$ という同じ形（共役性）になります。データが増えるほど事後分布は尖り、事前分布の影響は薄れていきます。</p>
<div class="note">下で事前分布の強さ（a, b）と観測データを変えると、事前（灰）→事後（青）への更新が見えます。データが少ないと事前の影響が強く、多いと尤度（データ）に引っ張られます。</div>`,
    demo: {
      note: '観測数（表・裏）を増やすと、事後分布は事前分布から離れてデータの示す値に集中していきます。これがベイズ更新です。',
      controls: [
        { type: 'range', id: 'a', label: '事前 a（表の擬似回数）', min: 1, max: 20, step: 1, value: 2 },
        { type: 'range', id: 'b', label: '事前 b（裏の擬似回数）', min: 1, max: 20, step: 1, value: 2 },
        { type: 'range', id: 'heads', label: '観測: 表の回数', min: 0, max: 50, step: 1, value: 8 },
        { type: 'range', id: 'tails', label: '観測: 裏の回数', min: 0, max: 50, step: 1, value: 2 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const a0 = p.a, b0 = p.b;
        const a1 = a0 + p.heads, b1 = b0 + p.tails;
        const xs = st.linspace(0.001, 0.999, 300);
        const prior = xs.map(x => st.betaPdf(x, a0, b0));
        const post = xs.map(x => st.betaPdf(x, a1, b1));
        const ymax = Math.max(Math.max.apply(null, prior), Math.max.apply(null, post)) * 1.1 || 1;
        const pl = Pl.make(canvas, { xmin: 0, xmax: 1, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: '表の確率 θ', yLabel: '密度' });
        pl.line(xs.map((x, i) => [x, prior[i]]), { color: Pl.gray, width: 2, dash: [6, 4] });
        pl.line(xs.map((x, i) => [x, post[i]]), { color: Pl.colors[0], width: 2.5 });
        pl.fillUnder(xs.map((x, i) => [x, post[i]]), { color: Pl.colors[0], alpha: 0.12 });
        const mean = a1 / (a1 + b1);
        pl.vline(mean, { color: Pl.colors[1], label: '事後平均 ' + mean.toFixed(3) });
        pl.legend([
          { label: '事前 Beta(' + a0 + ',' + b0 + ')', color: Pl.gray },
          { label: '事後 Beta(' + a1 + ',' + b1 + ')', color: Pl.colors[0] },
        ]);
      },
    },
  });
})();
