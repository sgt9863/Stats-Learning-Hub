'use strict';
/* 種々の確率分布（離散型・連続型ギャラリーと多変量正規） */
(function () {
  const T = (window.STATS_TOPICS = window.STATS_TOPICS || []);
  const S = () => window.Stats;
  const P = () => window.Plot;

  // 対数二項係数
  function logC(n, k) {
    const st = S();
    if (k < 0 || k > n) return -Infinity;
    return st.lgamma(n + 1) - st.lgamma(k + 1) - st.lgamma(n - k + 1);
  }

  /* --- 離散型分布ギャラリー --- */
  T.push({
    section: 'prep1', group: '種々の確率分布', id: 'discrete-distributions', title: '離散型分布ギャラリー',
    summary: 'ベルヌーイ・二項・超幾何・ポアソン・幾何・負の二項・多項——「何を数えているか」で分布を選び分けられるようになります。',
    body: `
<p>離散分布は「回数・個数」を数える確率変数の分布です。どれも<strong>試行の設定の違い</strong>から生まれます。</p>
<table class="simple">
<tr><th>分布</th><th>数えるもの</th><th>平均</th><th>分散</th></tr>
<tr><td>ベルヌーイ $\\mathrm{Bern}(p)$</td><td>1回の成功(1)/失敗(0)</td><td>$p$</td><td>$p(1-p)$</td></tr>
<tr><td>二項 $\\mathrm{Bin}(n,p)$</td><td>独立 $n$ 回中の成功数</td><td>$np$</td><td>$np(1-p)$</td></tr>
<tr><td>超幾何</td><td>非復元抽出での成功数</td><td>$n\\frac{K}{N}$</td><td>$n\\frac{K}{N}\\frac{N-K}{N}\\frac{N-n}{N-1}$</td></tr>
<tr><td>ポアソン $\\mathrm{Po}(\\lambda)$</td><td>単位時間のまれな事象数</td><td>$\\lambda$</td><td>$\\lambda$</td></tr>
<tr><td>幾何 $\\mathrm{Geo}(p)$</td><td>初成功までの試行回数</td><td>$1/p$</td><td>$(1-p)/p^2$</td></tr>
<tr><td>負の二項 $\\mathrm{NB}(r,p)$</td><td>$r$ 回成功するまでの失敗数</td><td>$r(1-p)/p$</td><td>$r(1-p)/p^2$</td></tr>
</table>
<p><strong>二項 vs 超幾何</strong>：くじを引くとき「戻す」なら二項、「戻さない」なら超幾何。$N$ が大きいと両者はほぼ一致します。<br>
<strong>二項 vs ポアソン</strong>：$n$ 大・$p$ 小の極限が $\\mathrm{Po}(np)$。ポアソンは平均＝分散が特徴。<br>
<strong>幾何 vs 負の二項</strong>：幾何は「1回成功するまで」、その一般化（$r$ 回）が負の二項。</p>
<div class="note">下で分布を切り替え、パラメータを動かしてください。グラフ上部に「今のパラメータの意味と平均・分散」が表示されます。</div>`,
    demo: {
      note: 'ポアソンは平均=分散なので λ を上げると山が右へ広がる。幾何は必ず右下がり。超幾何は母集団N=50固定で、非復元のぶん二項より分散がやや小さくなります。',
      controls: [
        { type: 'select', id: 'dist', label: '分布', value: 'binom', options: [
          { value: 'uniform', label: '離散一様' },
          { value: 'bernoulli', label: 'ベルヌーイ' },
          { value: 'binom', label: '二項' },
          { value: 'hyper', label: '超幾何 (N=50)' },
          { value: 'poisson', label: 'ポアソン' },
          { value: 'geom', label: '幾何' },
          { value: 'negbinom', label: '負の二項' },
          { value: 'multinom', label: '多項 (3カテゴリ)' },
        ]},
        { type: 'range', id: 'a', label: 'パラメータ①', min: 1, max: 30, step: 1, value: 15 },
        { type: 'range', id: 'b', label: 'パラメータ②', min: 1, max: 30, step: 1, value: 12 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const a = Math.round(p.a), b = Math.round(p.b);
        let kmax = 20, items = [], label = '', mean = 0, varr = 0;
        const prob = Math.min(0.95, Math.max(0.05, b / 30));
        if (p.dist === 'uniform') {
          const K = a; kmax = K;
          for (let k = 1; k <= K; k++) items.push({ k, pr: 1 / K });
          mean = (K + 1) / 2; varr = (K * K - 1) / 12; label = '離散一様{1..' + K + '}';
        } else if (p.dist === 'bernoulli') {
          kmax = 1; items = [{ k: 0, pr: 1 - prob }, { k: 1, pr: prob }];
          mean = prob; varr = prob * (1 - prob); label = 'Bern(p=' + prob.toFixed(2) + ')';
        } else if (p.dist === 'binom') {
          const n = a; kmax = n;
          for (let k = 0; k <= n; k++) items.push({ k, pr: st.binomPmf(k, n, prob) });
          mean = n * prob; varr = n * prob * (1 - prob); label = 'Bin(n=' + n + ', p=' + prob.toFixed(2) + ')';
        } else if (p.dist === 'hyper') {
          const N = 50, K = Math.min(N, a), n = Math.min(N, b); kmax = Math.min(n, K);
          for (let k = 0; k <= Math.min(n, K); k++) {
            const lp = logC(K, k) + logC(N - K, n - k) - logC(N, n);
            items.push({ k, pr: Math.exp(lp) });
          }
          mean = n * K / N; varr = n * (K / N) * (1 - K / N) * (N - n) / (N - 1);
          label = '超幾何(N=50, K=' + K + ', n=' + n + ')';
        } else if (p.dist === 'poisson') {
          const lam = a; kmax = Math.max(12, Math.round(lam * 2 + 6));
          for (let k = 0; k <= kmax; k++) items.push({ k, pr: st.poissonPmf(k, lam) });
          mean = lam; varr = lam; label = 'Po(λ=' + lam + ')';
        } else if (p.dist === 'geom') {
          kmax = Math.max(10, Math.round(3 / prob));
          for (let k = 1; k <= kmax; k++) items.push({ k, pr: Math.pow(1 - prob, k - 1) * prob });
          mean = 1 / prob; varr = (1 - prob) / (prob * prob); label = 'Geo(p=' + prob.toFixed(2) + ')';
        } else if (p.dist === 'negbinom') {
          const r = a; kmax = Math.max(12, Math.round(r * (1 - prob) / prob * 2 + 8));
          for (let k = 0; k <= kmax; k++) {
            const lp = logC(k + r - 1, k) + r * Math.log(prob) + k * Math.log(1 - prob);
            items.push({ k, pr: Math.exp(lp) });
          }
          mean = r * (1 - prob) / prob; varr = r * (1 - prob) / (prob * prob);
          label = 'NB(r=' + r + ', p=' + prob.toFixed(2) + ')';
        } else { // multinom（3カテゴリの期待度数）
          const n = a; const probs = [0.5, 0.3, 0.2];
          const pl2 = Pl.make(canvas, { xmin: 0.3, xmax: 3.7, ymin: 0, ymax: n * 0.6 + 1 });
          pl2.clear(); pl2.axes({ xLabel: 'カテゴリ', yLabel: '期待度数 n·pᵢ', xTicks: [1, 2, 3], xFmt: v => ['A', 'B', 'C'][v - 1] });
          probs.forEach((pr, i) => {
            pl2.bars([{ x0: i + 1 - 0.3, x1: i + 1 + 0.3, y: n * pr }], { color: Pl.colors[i], alpha: 0.8 });
            pl2.text(i + 1, n * pr, (n * pr).toFixed(1), { align: 'center', baseline: 'bottom', dy: -2, color: Pl.ink, size: 12 });
          });
          pl2.text(0.3, n * 0.6 + 1, '多項分布: n=' + n + ' 回を確率(0.5,0.3,0.2)で3カテゴリへ配分。各カテゴリの周辺分布は二項', { align: 'left', baseline: 'top', dx: 56, dy: 4, color: '#475467', size: 12 });
          return;
        }
        const ymax = Math.max.apply(null, items.map(it => it.pr)) * 1.18 || 1;
        const x0 = p.dist === 'geom' ? 0.5 : -0.5;
        const pl = Pl.make(canvas, { xmin: x0, xmax: kmax + 0.5, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: 'k', yLabel: '確率 P(X=k)' });
        pl.bars(items.map(it => ({ x0: it.k - 0.42, x1: it.k + 0.42, y: it.pr })), { color: Pl.colors[0], alpha: 0.78 });
        pl.text(x0, ymax, label + '　平均=' + mean.toFixed(2) + '　分散=' + varr.toFixed(2), { align: 'left', baseline: 'top', dx: 56, dy: 4, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- 連続型分布ギャラリー --- */
  T.push({
    section: 'prep1', group: '種々の確率分布', id: 'continuous-distributions', title: '連続型分布ギャラリー',
    summary: '一様・正規・指数・ガンマ・ベータ・対数正規・コーシー——それぞれの「素性」と、パラメータで形がどう動くかを一望します。',
    body: `
<p>連続分布は密度 $f(x)$ で表され、面積が確率です。準1級で頻出のものを整理します。</p>
<table class="simple">
<tr><th>分布</th><th>使いどころ・素性</th></tr>
<tr><td>連続一様 $U(a,b)$</td><td>区間内で等しい確率。乱数生成の土台</td></tr>
<tr><td>正規 $N(\\mu,\\sigma^2)$</td><td>誤差・平均の分布。中心極限定理の到達点</td></tr>
<tr><td>指数 $\\mathrm{Exp}(\\lambda)$</td><td>「次に起こるまでの待ち時間」。無記憶性をもつ</td></tr>
<tr><td>ガンマ $\\mathrm{Ga}(k,\\theta)$</td><td>指数の和（$k$ 回起こるまでの時間）。$k$ で形が変わる</td></tr>
<tr><td>ベータ $\\mathrm{Be}(a,b)$</td><td>$[0,1]$ 上。割合・確率そのものの分布（ベイズの事前）</td></tr>
<tr><td>対数正規</td><td>$\\ln X$ が正規。正の右歪みデータ（濃度・所得）</td></tr>
<tr><td>コーシー</td><td>裾が極端に重く、平均・分散が存在しない（要注意）</td></tr>
</table>
<p><strong>指数の無記憶性</strong>：$P(X>s+t\\mid X>s)=P(X>t)$。すでに待った時間は次の待ち時間に影響しません。<br>
<strong>ガンマ</strong>は指数（$k=1$）を含み、$k$ を増やすと山ができて正規に近づきます。カイ二乗は $\\mathrm{Ga}(k/2,2)$ の特別な場合です。</p>
<div class="note">下で分布とパラメータを動かし、形の変化を確かめてください。コーシーと正規を見比べると「裾の重さ」の違い（外れ値の出やすさ）がよく分かります。</div>`,
    demo: {
      note: 'ガンマの形状 k を1にすると指数分布に一致。対数正規は必ず右に裾を引く。コーシーは正規そっくりに見えても裾が桁違いに重い＝平均が定義できない分布です。',
      controls: [
        { type: 'select', id: 'dist', label: '分布', value: 'gamma', options: [
          { value: 'uniform', label: '連続一様' },
          { value: 'normal', label: '正規' },
          { value: 'exp', label: '指数' },
          { value: 'gamma', label: 'ガンマ' },
          { value: 'beta', label: 'ベータ' },
          { value: 'lognormal', label: '対数正規' },
          { value: 'cauchy', label: 'コーシー' },
        ]},
        { type: 'range', id: 'a', label: 'パラメータ①', min: 0.5, max: 6, step: 0.1, value: 2 },
        { type: 'range', id: 'b', label: 'パラメータ②', min: 0.5, max: 6, step: 0.1, value: 2 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const a = p.a, b = p.b;
        let xmin = 0, xmax = 8, ymax = 1, f, label;
        if (p.dist === 'uniform') {
          const lo = 0, hi = a + 1; xmin = -1; xmax = 8;
          f = x => (x >= lo && x <= hi) ? 1 / (hi - lo) : 0; ymax = 1.2 / (hi - lo);
          label = 'U(0, ' + hi.toFixed(1) + ')';
        } else if (p.dist === 'normal') {
          xmin = -6; xmax = 6; f = x => st.normalPdf(x, a - 2, b * 0.5); ymax = 0.9 / (b * 0.5);
          label = 'N(μ=' + (a - 2).toFixed(1) + ', σ=' + (b * 0.5).toFixed(2) + ')';
        } else if (p.dist === 'exp') {
          const lam = a; xmin = 0; xmax = 8; f = x => x < 0 ? 0 : lam * Math.exp(-lam * x); ymax = lam * 1.1;
          label = 'Exp(λ=' + lam.toFixed(1) + ')';
        } else if (p.dist === 'gamma') {
          const k = a, th = b * 0.5; xmin = 0; xmax = 16;
          f = x => x <= 0 ? 0 : Math.exp((k - 1) * Math.log(x) - x / th - st.lgamma(k) - k * Math.log(th));
          ymax = 0.5; label = 'Gamma(k=' + k.toFixed(1) + ', θ=' + th.toFixed(2) + ')';
        } else if (p.dist === 'beta') {
          xmin = 0; xmax = 1; f = x => st.betaPdf(x, a, b); ymax = 4;
          label = 'Beta(a=' + a.toFixed(1) + ', b=' + b.toFixed(1) + ')';
        } else if (p.dist === 'lognormal') {
          const mu = (a - 2) * 0.3, sig = b * 0.3; xmin = 0; xmax = 10;
          f = x => x <= 0 ? 0 : Math.exp(-Math.pow(Math.log(x) - mu, 2) / (2 * sig * sig)) / (x * sig * Math.sqrt(2 * Math.PI));
          ymax = 0.8; label = 'LogN(μ=' + mu.toFixed(2) + ', σ=' + sig.toFixed(2) + ')';
        } else { // cauchy
          const x0 = a - 2, g = b * 0.4; xmin = -8; xmax = 8;
          f = x => 1 / (Math.PI * g * (1 + Math.pow((x - x0) / g, 2))); ymax = 1 / (Math.PI * g) * 1.1;
          label = 'Cauchy(x₀=' + x0.toFixed(1) + ', γ=' + g.toFixed(2) + ')';
        }
        const xs = st.linspace(xmin, xmax, 300);
        const pl = Pl.make(canvas, { xmin, xmax, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: 'x', yLabel: '密度 f(x)' });
        if (p.dist === 'cauchy') pl.line(xs.map(x => [x, st.normalPdf(x, a - 2, b * 0.4)]), { color: Pl.gray, dash: [5, 4], width: 1.5 });
        pl.line(xs.map(x => [x, f(x)]), { color: Pl.colors[0], width: 2.5 });
        pl.fillUnder(xs.map(x => [x, f(x)]), { color: Pl.colors[0], alpha: 0.12 });
        const legend = [{ label: label, color: Pl.colors[0] }];
        if (p.dist === 'cauchy') legend.push({ label: '同スケールの正規（比較）', color: Pl.gray });
        pl.legend(legend);
      },
    },
  });

  /* --- 多変量正規分布 --- */
  T.push({
    section: 'prep1', group: '種々の確率分布', id: 'multivariate-normal', title: '多変量正規分布',
    summary: '平均ベクトルと分散共分散行列 Σ が「丘の位置と楕円の形」をどう決めるかを、標本点と等高線で確かめます。',
    body: `
<p>多変量正規分布は、複数の正規変数がまとめて従う分布です。密度は</p>
<p>$$ f(\\boldsymbol x)=\\frac{1}{(2\\pi)^{p/2}|\\Sigma|^{1/2}}\\exp\\!\\left(-\\tfrac12(\\boldsymbol x-\\boldsymbol\\mu)^\\top\\Sigma^{-1}(\\boldsymbol x-\\boldsymbol\\mu)\\right) $$</p>
<p>平均ベクトル $\\boldsymbol\\mu$ が丘の位置、<strong>分散共分散行列 $\\Sigma$</strong> が広がりと傾きを決めます。等高線は $\\Sigma$ の固有ベクトル方向を軸とする楕円で、軸の長さは固有値の平方根に比例します（＝<a href="#/prep1/pca">主成分</a>）。</p>
<h3>2つの便利な性質</h3>
<ul>
<li><strong>周辺分布も正規</strong>：どの1変数を取り出しても正規分布。</li>
<li><strong>条件付き分布も正規</strong>：$X_2$ を固定した $X_1$ も正規で、$\\rho$ が大きいほど条件付き分散が小さくなる（＝予測が効く）。</li>
</ul>
<div class="note">下で相関 $\\rho$ と各軸の標準偏差を動かすと、標本点（散布）と等高線の楕円が同時に変わります。$\\rho$ の符号で楕円が右上がり／右下がりに傾きます。</div>`,
    demo: {
      note: 'σ₁とσ₂を変えると楕円が縦横に伸縮。ρを±に振ると楕円が傾く（固有ベクトルが回る）。ρ→±1で楕円がつぶれ、2変数が1直線に乗る＝共線性の極限です。',
      controls: [
        { type: 'range', id: 's1', label: 'σ₁（横の広がり）', min: 0.4, max: 2.5, step: 0.1, value: 1.4 },
        { type: 'range', id: 's2', label: 'σ₂（縦の広がり）', min: 0.4, max: 2.5, step: 0.1, value: 1 },
        { type: 'range', id: 'rho', label: '相関 ρ', min: -0.9, max: 0.9, step: 0.1, value: 0.5 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const s1 = p.s1, s2 = p.s2, rho = p.rho;
        const c12 = rho * s1 * s2;
        // コレスキー分解で相関つき標本を生成
        const L11 = s1, L21 = c12 / s1, L22 = Math.sqrt(Math.max(1e-6, s2 * s2 - L21 * L21));
        const rand = st.rng(7 + (p.reseed | 0) * 41);
        const pts = [];
        for (let i = 0; i < 400; i++) {
          const z1 = st.randn(rand), z2 = st.randn(rand);
          pts.push([L11 * z1, L21 * z1 + L22 * z2]);
        }
        const lim = 6;
        const pl = Pl.make(canvas, { xmin: -lim, xmax: lim, ymin: -lim, ymax: lim });
        pl.clear(); pl.axes({ xLabel: 'X₁', yLabel: 'X₂' });
        pl.scatter(pts, { color: Pl.colors[0], r: 2.6, alpha: 0.4 });
        // 等高線楕円（1σ,2σ）を固有分解で
        const tr = s1 * s1 + s2 * s2, det = s1 * s1 * s2 * s2 - c12 * c12;
        const l1 = tr / 2 + Math.sqrt(Math.max(0, tr * tr / 4 - det));
        const l2 = tr / 2 - Math.sqrt(Math.max(0, tr * tr / 4 - det));
        let ang = 0.5 * Math.atan2(2 * c12, s1 * s1 - s2 * s2);
        for (const scale of [1, 2]) {
          const ell = [];
          for (let a = 0; a <= 60; a++) {
            const t = a / 60 * 2 * Math.PI;
            const ex = scale * Math.sqrt(l1) * Math.cos(t), ey = scale * Math.sqrt(l2) * Math.sin(t);
            ell.push([ex * Math.cos(ang) - ey * Math.sin(ang), ex * Math.sin(ang) + ey * Math.cos(ang)]);
          }
          pl.line(ell, { color: Pl.colors[1], width: scale === 1 ? 2.5 : 1.5, alpha: scale === 1 ? 1 : 0.6 });
        }
        // 固有ベクトル軸
        pl.arrow(0, 0, 2 * Math.sqrt(l1) * Math.cos(ang), 2 * Math.sqrt(l1) * Math.sin(ang), { color: Pl.ink, width: 2 });
        pl.legend([{ label: '標本点', color: Pl.colors[0] }, { label: '1σ・2σ 等高線', color: Pl.colors[1] }]);
        pl.text(-lim, lim, '主軸方向 ' + (ang * 180 / Math.PI).toFixed(0) + '°　|Σ|=' + det.toFixed(2), { align: 'left', baseline: 'top', dx: 56, dy: 4, color: '#475467', size: 12 });
      },
    },
  });

})();
