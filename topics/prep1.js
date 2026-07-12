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
<h3>どの場面でどの分布が出るか（検定との対応）</h3>
<p>t・カイ二乗・F は「形を覚える」より「<strong>どの統計量がその分布に従うか</strong>」で覚えると、検定編の見通しが一気に良くなります。</p>
<table class="simple">
<tr><th>統計量</th><th>従う分布</th><th>使う場面</th></tr>
<tr><td>$\\dfrac{\\bar x-\\mu}{s/\\sqrt n}$（分散未知）</td><td>$t_{n-1}$</td><td>母平均の検定・信頼区間、回帰係数の検定</td></tr>
<tr><td>$\\dfrac{(n-1)s^2}{\\sigma_0^2}$</td><td>$\\chi^2_{n-1}$</td><td>母分散の検定・区間。<a href="#/prep1/goodness-of-fit">適合度</a>・独立性の検定も $\\chi^2$</td></tr>
<tr><td>$\\dfrac{s_1^2}{s_2^2}$</td><td>$F_{n_1-1,\\,n_2-1}$</td><td>等分散性の検定、<a href="#/prep1/anova1">分散分析</a>（群間/群内の分散比）</td></tr>
</table>
<p>合言葉は「<strong>平均には $t$、分散には $\\chi^2$、分散の比には $F$</strong>」。一覧は<a href="#/prep1/normal-tests">正規分布に関する検定</a>にまとまっています。</p>
<h3>離散分布</h3>
<p>二項分布 $\\mathrm{Bin}(n,p)$ は「成功確率 $p$ の試行を $n$ 回」、ポアソン分布 $\\mathrm{Po}(\\lambda)$ は「単位時間あたり平均 $\\lambda$ 回起こるまれな事象の回数」を表します。$n$ が大きく $p$ が小さいとき $\\mathrm{Bin}(n,p) \\approx \\mathrm{Po}(np)$ が成り立ちます（例：不良率0.1%の製品1万個中の不良数）。さらに $n$ が大きく $p$ が極端でなければ<a href="#/prep1/normal-approx">正規近似</a>も効きます。</p>
<h3>これらの分布が「成り立つ」前提</h3>
<p>t・カイ二乗・F 分布は、<strong>元のデータが正規分布</strong>という仮定から導かれます。標本分散について $(n-1)s^2/\\sigma^2\\sim\\chi^2_{n-1}$、平均の統計量 $(\\bar x-\\mu)/(s/\\sqrt n)\\sim t_{n-1}$ が成り立つのはこのためです。</p>
<ul>
<li><strong>正規性が崩れると</strong>：これらは近似でしかなくなり検定の有意水準がずれる。ただし<em>平均</em>に関する統計量は大標本なら中心極限定理でほぼ $t$／正規に近づく。一方<em>分散</em>に関する $\\chi^2$・$F$ は正規性に敏感で、崩れが緩和されにくい。</li>
<li><strong>独立性</strong>：$\\chi^2_k$ が「独立な $k$ 個の $Z^2$ の和」であることが自由度の意味。観測が相関すると実効自由度が減る。</li>
</ul>
<p><strong>極限（要チェック）</strong>：自由度 $\\to\\infty$ で $\\chi^2_k/k\\to1$、$F_{d_1,d_2}\\to1$、$t_k\\to$ 標準正規。だから大標本では $t$ 検定と $z$ 検定、$F$ と $\\chi^2$ がほぼ一致します。</p>
<p>下のグラフで分布を切り替え、自由度を上げて $t$ が標準正規（点線）に重なることを確かめてください。</p>`,
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
<h3>なぜ $\\sqrt n$ なのか</h3>
<p>標本平均は $\\bar X=\\frac1n\\sum X_i$。独立な和の分散は<a href="#/prep1/transformations">足し算</a>なので $V[\\sum X_i]=n\\sigma^2$、これを $n^2$ で割って $V[\\bar X]=\\sigma^2/n$、標準偏差はその平方根で $\\sigma/\\sqrt n$——<strong>ばらつきが $\\sqrt n$ に反比例するのはこの「分散は足し算・平均は $n$ で割る」の帰結</strong>です。正規に「近づく」のは、和をとるたびに各変数の細かい癖（歪み）が相対的に薄まるため。実際、元分布の歪度 $\\gamma_1$ に対し標本平均の歪度は $\\gamma_1/\\sqrt n$ で減衰し（ベリー・エセーンの定理が収束の速さを保証）、数値でも指数分布（歪度2）の平均は $n{=}5$ で歪度0.89 → $n{=}30$ で0.37 と対称に近づきます。</p>
<h3>前提と、崩れたときの注意</h3>
<p>CLTが効くには<strong>分散が有限</strong>である必要があります。裾が極端に重く分散が発散する分布——<a href="#/prep1/continuous-distributions">コーシー分布</a>など——では成り立たず、標本平均は $n$ を増やしても正規に近づきません（コーシーの標本平均はまたコーシー）。もう一つの前提が<strong>独立（弱い依存まで）</strong>で、強い系列相関があると実効的な標本数が減り収束が遅れます。さらに<strong>収束は元分布の歪みが強いほど遅い</strong>——「$n\\ge30$ で正規とみなす」の目安は対称に近い分布での話で、強く歪んだ分布や離散でまれな事象では $n$ がもっと必要です。「平均を扱うから正規でよい」と機械的に当てはめず、元分布の裾と歪みを確認するのが安全です。</p>
<div class="note">元が右に歪んだ分布（指数分布など）でも、$n$ を増やせば標本平均のヒストグラムは左右対称の釣鐘型に近づきます。下で元分布と $n$ を変えて確かめてください。二峰性の元分布でも平均は単峰の正規へ向かう一方、収束の速さは元の歪みで変わることも見てください。</div>`,
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
<p>対数をとるのは、積を和に変えて微分しやすくするため（対数は単調なのでピークの位置は変わりません）。</p>
<h3>導出を1つ追う（正規分布の平均）</h3>
<p>分散 $\\sigma^2$ 既知の正規分布 $N(\\mu,\\sigma^2)$ では、対数尤度は</p>
<p>$$ \\ell(\\mu)=-\\frac{n}{2}\\log(2\\pi\\sigma^2)-\\frac{1}{2\\sigma^2}\\sum_{i=1}^n(x_i-\\mu)^2 $$</p>
<p>第1項は $\\mu$ に無関係なので、最大化は「二乗和 $\\sum(x_i-\\mu)^2$ の最小化」と同じ——<strong>正規分布の最尤法は最小二乗法と一致</strong>します。微分して0とおくと</p>
<p>$$ \\ell'(\\mu)=\\frac{1}{\\sigma^2}\\sum_{i=1}^n(x_i-\\mu)=0 \\;\\Rightarrow\\; \\hat\\mu=\\bar x $$</p>
<p>と標本平均が導かれます。「平均で推定する」という直感が、最尤原理から出てくるわけです。この1階微分 $\\ell'(\\theta)$ を<strong>スコア関数</strong>と呼び、真のパラメータのもとで期待値0になります。さらにピークの<strong>曲がりの鋭さ（2階微分の大きさ）</strong>が推定の確からしさに対応し、その期待値がフィッシャー情報量 $I(\\theta)=-E[\\ell''(\\theta)]$——「尤度が鋭いほどデータの持つ情報が多い」を式にしたものです（<a href="#/prep1/fisher-cramer-rao">フィッシャー情報量</a>へ続く話）。</p>
<h3>前提条件と、崩れたときの影響</h3>
<p>最尤推定量は<strong>正則条件</strong>のもとで望ましい大標本の性質を持ちます：一致性（$n\\to\\infty$ で真値へ収束）、漸近正規性、漸近有効性（<a href="#/prep1/fisher-cramer-rao">クラーメル・ラオ下限</a>を達成）、不変性（$g(\\theta)$ の最尤推定量は $g(\\hat\\theta)$）。</p>
<ul>
<li><strong>台（値域）がパラメータに依存すると破綻</strong>：例えば $U(0,\\theta)$ の最尤推定量は標本最大値で、微分＝0では求まらず偏り（下ぶれ）がある。</li>
<li><strong>小標本の偏り</strong>：最尤推定量は不偏とは限らない。正規分散の最尤推定量は $\\frac1n\\sum(x_i-\\bar x)^2$ で下ぶれ（不偏化は $n-1$ で割る）。</li>
<li><strong>モデル誤特定に弱い</strong>：仮定した分布が実際と違うと推定が偏る。→ 頑健推定・準最尤・<a href="#/prep1/model-selection">モデル選択</a>で妥当性を確認。</li>
</ul>
<h3>点推定だけで終わらせない</h3>
<p>最尤推定値は「点」にすぎません。推定の不確かさをフィッシャー情報量から $\\mathrm{SE}(\\hat\\theta)\\approx 1/\\sqrt{n\\,I(\\hat\\theta)}$ と見積もり、$\\hat\\theta\\pm z\\,\\mathrm{SE}$ の信頼区間や尤度比検定と併せて報告します。$n$ が大きいほど SE は小さくなりますが、モデルが誤っていれば「狭い区間で自信満々に間違える」ことに注意します。</p>
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
<p><strong>p値と棄却域</strong>：p値は「$H_0$ が正しいと仮定したとき、観測された統計量<em>以上に極端</em>な値が出る確率」です。あらかじめ決めた $\\alpha$ と比べ、$p<\\alpha$ なら棄却します。棄却域を分布の<strong>裾</strong>に置くのは、そこが $H_0$ のもとで最も起こりにくい領域だから——もしその領域の値が出たら「$H_0$ では説明しにくい」根拠になります。両側検定は $|T|$ が大きい両裾に、片側検定は一方の裾に $\\alpha$ を割り当てます。</p>
<p>$$ p=P\\!\\left(T\\ge t_{\\mathrm{obs}}\\mid H_0\\right)\\ \\text{(右片側)},\\qquad p<\\alpha \\Rightarrow H_0\\ \\text{を棄却} $$</p>
<h3>前提条件と、崩れたときの影響</h3>
<p>検定が「$\\alpha$ を主張どおりに保つ」ためには、<strong>帰無分布が正しく求まっている</strong>ことが必要です。これが崩れると、名目上の $\\alpha$（例：5%）と実際の第1種の誤り率がずれます。</p>
<ul>
<li><strong>観測の独立性</strong>：系列相関やクラスター構造で崩れると分散を見誤り、実際の $\\alpha$ が膨張。→ 混合効果モデル・クラスター頑健標準誤差、時系列は専用手法。</li>
<li><strong>分布の仮定（正規性・等分散）</strong>：$t$・$F$ 検定などパラメトリック検定の前提。小標本で崩れると帰無分布がずれる。→ <a href="#/prep1/nonparametric">ノンパラ検定</a>・並べ替え検定・ウェルチ補正。大標本ではCLTで緩和される。</li>
<li><strong>多重比較</strong>：検定を繰り返すと「どれかが偶然有意」になり、族全体の $\\alpha$ が膨張。→ <a href="#/prep1/multiple-comparison">ボンフェローニ等</a>の補正。</li>
</ul>
<p>頑健性と検出力はトレードオフです：ノンパラ検定は前提に強い代わり、前提が実際に成り立つ場面ではパラメトリック検定より検出力がやや落ちます。</p>
<h3>有意性と実質的な意味</h3>
<p>p値は「$H_0$ が正しい確率」ではなく、あくまで「$H_0$ を仮定したときのデータの珍しさ」です。<strong>有意でない＝差がない、ではありません</strong>（単に検出力が足りないだけかもしれない）。逆に標本が大きければ、実質的に無意味な小さな差でも $p<\\alpha$ になります。結論は「有意か」だけでなく<strong>効果量とその信頼区間</strong>で読み、必要なら事前に<a href="#/prep1/sample-size">サンプルサイズ設計</a>で目標の検出力を確保します。</p>
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
<p><strong>なぜこの式になるか</strong>：標準化した<strong>ピボット量</strong> $T=\\dfrac{\\bar x-\\mu}{s/\\sqrt n}$ は（正規母集団なら）自由度 $n-1$ の $t$ 分布に従います。$P(-t_{\\alpha/2}\\le T\\le t_{\\alpha/2})=1-\\alpha$ を $\\mu$ について解くと $\\bar x - t_{\\alpha/2}\\,s/\\sqrt n \\le \\mu \\le \\bar x + t_{\\alpha/2}\\,s/\\sqrt n$。つまり信頼区間は「$T$ が中央 $1-\\alpha$ に入る」という確率言明を、$\\mu$ の範囲に読み替えたものです。母分散が既知なら $t$ を正規分布の $z$ に置き換えます。</p>
<h3>前提条件と、崩れたときの影響</h3>
<ul>
<li><strong>正規性</strong>：$T$ が $t$ 分布に従う根拠。崩れると実際の被覆確率が名目 $1-\\alpha$ からずれる。ただし<strong>大標本では中心極限定理で緩和</strong>され $\\bar x$ はほぼ正規に。小標本＋強い歪みが危険 → <a href="#/prep1/bootstrap">ブートストラップ信頼区間</a>。</li>
<li><strong>独立性</strong>：系列相関などで崩れると $s/\\sqrt n$ が真の標準誤差を過小評価し、区間が<strong>狭すぎて</strong>被覆が不足する。</li>
<li><strong>外れ値</strong>：$\\bar x$・$s$ を歪めて区間を動かす → 中央値ベースなど頑健な区間を検討。</li>
</ul>
<p>区間幅は $\\propto s/\\sqrt n$。$n$ を4倍にすると幅は半分になり、信頼水準を上げると幅は広がります（確実性と精度のトレードオフ）。</p>
<h3>有意性と実質的な意味</h3>
<p>信頼区間は検定より情報が多く、<strong>効果量そのものと不確かさを同時に</strong>示します。「差＝0」を区間が含めば有意水準 $\\alpha$ で有意でない、と検定と一致しますが、実質的判断の鍵は区間の<strong>幅</strong>です：0を含んでも幅が狭ければ「効果は小さいと言い切れる」、幅が広ければ「まだ何も言えない（$n$ を増やす必要）」。$p<\\alpha$ かどうかより、区間の位置と幅で「どれだけ効くか」を読むのが実務的です。</p>
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
<p><strong>なぜ同じ形になるか</strong>：尤度は $\\theta^{k}(1-\\theta)^{n-k}$、事前は $\\theta^{a-1}(1-\\theta)^{b-1}$ に比例するので、掛けると $\\theta^{a+k-1}(1-\\theta)^{b+n-k-1}$——ベータ分布の形がそのまま残ります。さらに事後平均は</p>
<p>$$ \\frac{a+k}{a+b+n} \\;=\\; \\frac{a+b}{a+b+n}\\cdot\\underbrace{\\frac{a}{a+b}}_{\\text{事前平均}} \\;+\\; \\frac{n}{a+b+n}\\cdot\\underbrace{\\frac{k}{n}}_{\\text{標本比率}} $$</p>
<p>と分解でき、<strong>「事前の意見」と「データ」の重み付き平均</strong>だと読めます。$a+b$ は事前分布の強さ（擬似観測数）、$n$ はデータ量。$n$ が増えるほどデータ側の重みが勝つ——ベイズ更新の本質がこの1行に出ています。</p>
<h3>前提・注意点と、崩れたときの影響</h3>
<table class="simple">
<tr><th>前提・選択</th><th>問題になること</th><th>対処</th></tr>
<tr><td>事前分布の選択</td><td>小標本では結論が事前分布に敏感（$n$ 大なら影響は消える）</td><td>無情報・弱情報事前（Jeffreys事前など）＋事前を変えて感度分析</td></tr>
<tr><td>尤度（モデル）の正しさ</td><td>モデル誤特定なら事後分布ごと間違える——頻度論と同じ弱点</td><td>事後予測チェック（予測がデータを再現するか）</td></tr>
<tr><td>共役性</td><td>計算の便宜にすぎず、現実の事前が共役形とは限らない</td><td>共役でなければ <a href="#/prep1/mcmc">MCMC</a> で事後分布を数値的に求める</td></tr>
</table>
<h3>有意性と実質的な意味</h3>
<p>ベイズでは p 値の代わりに、事後分布から直接「$\\theta$ がこの範囲にある確率は95%」と言える<strong>信用区間</strong>（credible interval）を使います。<a href="#/prep1/confidence">頻度論の信頼区間</a>が「手続きを繰り返せば95%の区間が当たりを含む」という回りくどい主張しかできないのに対し、信用区間はパラメータそのものの確率として読めるのが実務上の強みです。ただし読み方の作法は同じ：事後平均という点だけでなく、<strong>分布の幅（不確かさ）ごと</strong>報告・判断します。「$\\theta>0.5$ の事後確率」のような実質的な問いに直接答えられるのもベイズの利点です。</p>
<div class="note">下で事前分布の強さ（a, b）と観測データを変えると、事前（灰）→事後（青）への更新が見えます。データが少ないと事前の影響が強く、多いと尤度（データ）に引っ張られます。事前 a,b を大きくすると事後平均（オレンジ線）が標本比率から事前平均側へ引き戻される——上の重み付き平均の式そのものです。</div>`,
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
