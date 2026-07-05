'use strict';
/* 推定の理論（点推定の性質・十分統計量・フィッシャー情報量・ガウスマルコフ・モーメント法・順序統計量） */
(function () {
  const T = (window.STATS_TOPICS = window.STATS_TOPICS || []);
  const S = () => window.Stats;
  const P = () => window.Plot;

  /* --- 点推定量の性質（不偏性・一致性・有効性） --- */
  T.push({
    section: 'prep1', group: '推定', id: 'estimator-properties', title: '点推定量の性質（不偏性・一致性・有効性）',
    summary: '「良い推定量」の条件——的の中心に当たる（不偏）、増やせば当たる（一致）、ばらつきが小さい（有効）——を、推定量の標本分布で見比べます。',
    body: `
<p>母数 $\\theta$ の推定量 $\\hat\\theta$ を評価する基本的な性質です。</p>
<ul>
<li><strong>不偏性</strong>：$E[\\hat\\theta]=\\theta$。平均的に的の中心に当たる（かたよりゼロ）。</li>
<li><strong>一致性</strong>：$n\\to\\infty$ で $\\hat\\theta\\to\\theta$。データを増やせば真値に収束する。</li>
<li><strong>有効性</strong>：不偏推定量のなかで分散が最小。ばらつきが小さいほど「有効」。</li>
<li><strong>相対効率</strong>：2つの不偏推定量の分散の比 $V[\\hat\\theta_1]/V[\\hat\\theta_2]$。</li>
</ul>
<p>推定量の良し悪しは平均二乗誤差でまとめられます。</p>
<p>$$ \\mathrm{MSE}(\\hat\\theta)=\\underbrace{\\big(E[\\hat\\theta]-\\theta\\big)^2}_{\\text{バイアス}^2}+\\underbrace{V[\\hat\\theta]}_{\\text{分散}} $$</p>
<div class="note">例1「平均 vs 中央値」：正規母集団ではどちらも不偏だが、平均のほうが分散が小さい（＝有効）。<br>例2「分散 ÷(n−1) vs ÷n」：$n$ で割る標本分散は<strong>下ぶれ（バイアス）</strong>する。$n-1$ で割ると不偏になる（ベッセル補正）。下で切り替え・$n$ を動かして確かめてください。</div>`,
    demo: {
      note: 'n を大きくするとどの推定量も真値へ集まる（一致性）。「÷n」を選ぶと分布の中心が真の分散より左にずれる＝バイアス。「平均vs中央値」では平均の山のほうが細い＝有効。',
      controls: [
        { type: 'select', id: 'case', label: '比べる推定量', value: 'meanmed', options: [
          { value: 'meanmed', label: '母平均: 標本平均 vs 中央値' },
          { value: 'var', label: '母分散: ÷(n−1) vs ÷n' },
        ]},
        { type: 'range', id: 'n', label: '標本サイズ n', min: 3, max: 60, step: 1, value: 10 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(21 + (p.reseed | 0) * 61);
        const n = Math.round(p.n), reps = 3000;
        const mu = 0, sigma = 1;
        const A = [], B = [];
        for (let r = 0; r < reps; r++) {
          const xs = [];
          for (let i = 0; i < n; i++) xs.push(mu + sigma * st.randn(rand));
          if (p.case === 'meanmed') {
            A.push(st.mean(xs));
            const sorted = xs.slice().sort((a, b) => a - b);
            B.push(n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2);
          } else {
            const m = st.mean(xs);
            let ss = 0; for (const x of xs) ss += (x - m) ** 2;
            A.push(ss / (n - 1)); // 不偏
            B.push(ss / n);       // バイアスあり
          }
        }
        const truth = p.case === 'meanmed' ? mu : sigma * sigma;
        const lo = p.case === 'meanmed' ? -1.5 : 0, hi = p.case === 'meanmed' ? 1.5 : 3;
        const binsA = st.histogram(A, 36, lo, hi), binsB = st.histogram(B, 36, lo, hi);
        const ymax = Math.max(Math.max.apply(null, binsA.map(b => b.density)), Math.max.apply(null, binsB.map(b => b.density))) * 1.15 || 1;
        const pl = Pl.make(canvas, { xmin: lo, xmax: hi, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: '推定値', yLabel: '密度' });
        pl.bars(binsA.map(b => ({ x0: b.x0, x1: b.x1, y: b.density })), { color: Pl.colors[0], alpha: 0.45 });
        pl.bars(binsB.map(b => ({ x0: b.x0, x1: b.x1, y: b.density })), { color: Pl.colors[1], alpha: 0.4 });
        pl.vline(truth, { color: Pl.ink, label: '真値 ' + truth.toFixed(2), dash: [6, 3] });
        const nameA = p.case === 'meanmed' ? '標本平均' : '÷(n−1) 不偏';
        const nameB = p.case === 'meanmed' ? '中央値' : '÷n バイアス';
        pl.legend([{ label: nameA + ' (SD ' + st.sd(A).toFixed(3) + ')', color: Pl.colors[0] }, { label: nameB + ' (平均 ' + st.mean(B).toFixed(3) + ')', color: Pl.colors[1] }]);
      },
    },
  });

  /* --- 十分統計量とネイマンの分解定理 --- */
  T.push({
    section: 'prep1', group: '推定', id: 'sufficiency', title: '十分統計量とネイマンの分解定理',
    summary: 'データを要約しても「母数についての情報を1ビットも失わない」統計量＝十分統計量の考え方を、分解定理で理解します。',
    body: `
<p>$n$ 個のデータ $x_1,\\dots,x_n$ を1つ（や少数）の値に要約したとき、母数 $\\theta$ の推定に必要な情報がすべて残っているなら、その統計量 $T$ を<strong>十分統計量</strong>と呼びます。</p>
<p>形式的には「$T=t$ を与えたときのデータの条件付き分布が $\\theta$ に依存しない」こと。判定には<strong>ネイマンの分解定理（因子分解定理）</strong>が便利です。</p>
<p>$$ f(\\boldsymbol x\\mid\\theta)=g\\big(T(\\boldsymbol x),\\theta\\big)\\cdot h(\\boldsymbol x) $$</p>
<p>のように「$\\theta$ と $T$ を含む部分」と「データだけの部分」に分解できれば、$T$ は十分統計量です。</p>
<h3>例（分解を実際にやってみる）</h3>
<p><strong>正規分布（分散既知）</strong>：平方和の分解 $\\sum(x_i-\\mu)^2=\\sum(x_i-\\bar x)^2+n(\\bar x-\\mu)^2$（クロス項が $\\sum(x_i-\\bar x)=0$ で消える）を尤度に代入すると</p>
<p>$$ f(\\boldsymbol x\\mid\\mu)=\\underbrace{e^{-n(\\bar x-\\mu)^2/2\\sigma^2}}_{g(\\bar x,\\;\\mu)}\\cdot\\underbrace{(2\\pi\\sigma^2)^{-n/2}\\,e^{-\\sum(x_i-\\bar x)^2/2\\sigma^2}}_{h(\\boldsymbol x)\\;(\\mu\\text{を含まない})} $$</p>
<p>$\\mu$ が絡む因子は $\\bar x$ 経由だけ——だから $\\bar x$ が $\\mu$ の十分統計量です。<strong>尤度が $\\theta$ とデータを「$T$ を通してしか」結びつけない</strong>、というのが分解定理の読み方です。</p>
<ul>
<li>ベルヌーイ：$f=p^{\\sum x_i}(1-p)^{n-\\sum x_i}$——そのまま $g(T,p)$ の形（$h=1$）。成功回数 $\\sum x_i$ が十分。</li>
<li>ポアソン：$f=\\dfrac{\\lambda^{\\sum x_i}e^{-n\\lambda}}{\\prod x_i!}$——$\\sum x_i$ が十分（$\\prod x_i!$ が $h$）。</li>
</ul>
<h3>前提条件と、崩れたときの影響</h3>
<p>十分性は<strong>モデルに対する相対的な概念</strong>です。「$\\bar x$ が十分」は「データが本当に正規分布から来ている」ことを前提にした主張であって、モデルが違えば保証ごと消えます。例えば外れ値が混ざる（裾の重い）分布では、$\\bar x$ は情報を失わないどころか外れ値に引きずられる壊れやすい要約です——モデル内の効率（十分性・<a href="#/prep1/fisher-cramer-rao">クラーメル・ラオ下限</a>の達成）と、モデルを外れたときの頑健性（中央値・トリム平均）は<strong>トレードオフ</strong>の関係にあります。また十分統計量は一意ではなく（$\\sum x_i$ でも $\\bar x$ でも、生データ全体も自明に十分）、実用上は「これ以上縮められない」<strong>最小十分統計量</strong>に意味があります。</p>
<h3>実務での意味</h3>
<p>論文や報告書が生データの代わりに $(n,\\ \\bar x,\\ s^2)$ を載せるだけで済むのは、正規モデルなら $(\\bar x,s^2)$ が $(\\mu,\\sigma^2)$ の<strong>結合十分統計量</strong>だから——要約統計量から $t$ 検定も信頼区間もそっくり再構成できます。ただしそれはモデルの中での話で、外れ値・二峰性・打ち切りといった「モデル外の情報」は要約で消えます。<strong>推論は要約から、診断は生データから</strong>、が実務の使い分けです。</p>
<div class="note">「十分」とは、生データを捨てて $T$ だけ手元に残しても、$\\theta$ については何も損しない、という意味です。最尤推定量は十分統計量の関数になります（<a href="#/prep1/mle">MLE</a> と地続き）。ラオ・ブラックウェルの定理は「推定量を十分統計量で条件付ければ分散が下がる（改善できる）」ことを保証します。</div>`,
    demo: {
      note: '青が全データ n 個の尤度曲線、オレンジが「要約だけ」から作った尤度曲線（どちらも最大値1に規格化）。要約に標本平均（十分統計量）を選ぶと2本は完全に一致＝情報の損失ゼロ。「最初の半分」「最初の5個」に落とすと曲線が平らに広がる＝μ の情報を失った証拠です。',
      controls: [
        { type: 'select', id: 'summary', label: '要約の仕方', value: 'mean', options: [
          { value: 'mean', label: '標本平均 x̄（十分統計量）' },
          { value: 'half', label: '最初の半分だけ使う' },
          { value: 'five', label: '最初の5個だけ使う' },
        ]},
        { type: 'range', id: 'n', label: '標本サイズ n', min: 10, max: 100, step: 5, value: 30 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(31 + (p.reseed | 0) * 17);
        const n = Math.round(p.n);
        const xs = [];
        for (let i = 0; i < n; i++) xs.push(st.randn(rand));
        // σ=1 既知の正規尤度は L(μ) ∝ exp(-k(x̄_k-μ)²/2)——部分集合 k 個でも同じ形
        const likeOf = data => {
          const k = data.length, m = st.mean(data);
          return mu => Math.exp(-k * (m - mu) * (m - mu) / 2);
        };
        const Lfull = likeOf(xs);
        const sub = p.summary === 'mean' ? xs : p.summary === 'half' ? xs.slice(0, Math.max(2, Math.floor(n / 2))) : xs.slice(0, 5);
        const Lsub = likeOf(sub);
        const grid = st.linspace(-1.6, 1.6, 240);
        const pl = Pl.make(canvas, { xmin: -1.6, xmax: 1.6, ymin: 0, ymax: 1.12 });
        pl.clear(); pl.axes({ xLabel: '母平均 μ の候補', yLabel: '規格化尤度' });
        pl.line(grid.map(mu => [mu, Lfull(mu)]), { color: Pl.colors[0], width: 2.5 });
        pl.line(grid.map(mu => [mu, Lsub(mu)]), { color: Pl.colors[1], width: 2, dash: [5, 4] });
        pl.vline(0, { color: Pl.gray, dash: [3, 3], label: '真の μ=0' });
        const match = p.summary === 'mean';
        pl.legend([
          { label: '全データ (n=' + n + ')', color: Pl.colors[0] },
          { label: '要約から (' + (match ? 'x̄ と n' : sub.length + '個') + ')', color: Pl.colors[1] },
        ]);
        pl.text(-1.6, 1.12, match ? '2本が一致 → 情報の損失ゼロ（十分）' : '幅が広がる → 情報を損失（不十分な要約）', { align: 'left', baseline: 'top', dx: 56, dy: 4, color: match ? '#0f766e' : '#c2410c', size: 12.5 });
      },
    },
  });

  /* --- フィッシャー情報量とクラーメル・ラオの下限 --- */
  T.push({
    section: 'prep1', group: '推定', id: 'fisher-cramer-rao', title: 'フィッシャー情報量とクラーメル・ラオの下限',
    summary: '対数尤度の「とがり具合」がデータの持つ情報量であり、それが不偏推定量の分散の限界（達成不可能な下限）を決めることを見ます。',
    body: `
<p><strong>フィッシャー情報量</strong> $I(\\theta)$ は、対数尤度が最尤点でどれだけ鋭く尖っているか（曲率）です。</p>
<p>$$ I(\\theta)=E\\!\\left[\\left(\\frac{\\partial}{\\partial\\theta}\\log f(X\\mid\\theta)\\right)^2\\right]=-E\\!\\left[\\frac{\\partial^2}{\\partial\\theta^2}\\log f(X\\mid\\theta)\\right] $$</p>
<p>尖っている（曲率が大きい）ほど、少しのパラメータのズレで尤度が大きく落ちる＝データが $\\theta$ を強く特定できる＝情報が多い、ということです。$n$ 個の独立標本では情報は $n$ 倍になります。</p>

<h3>なぜ2つの式が等しいのか</h3>
<p>鍵は<strong>スコア</strong> $U=\\dfrac{\\partial}{\\partial\\theta}\\log f(X\\mid\\theta)$ の平均がゼロであることです。$\\int f\\,dx=1$ を $\\theta$ で微分すると $\\int\\frac{\\partial f}{\\partial\\theta}dx=\\int U f\\,dx=E[U]=0$。これをもう一度 $\\theta$ で微分すると $E\\!\\left[\\frac{\\partial U}{\\partial\\theta}\\right]+E[U^2]=0$、すなわち</p>
<p>$$ I(\\theta)=E[U^2]=-E\\!\\left[\\frac{\\partial^2}{\\partial\\theta^2}\\log f\\right] $$</p>
<p>つまり「スコアの分散（$E[U^2]$、$E[U]=0$ なので分散に等しい）」と「対数尤度の曲率の期待値」が一致するのは偶然でなく、正規化条件 $\\int f=1$ の帰結です。$n$ 標本では総スコアが各観測スコアの<strong>和</strong>で、独立ゆえ分散が足し合わさって $I_n(\\theta)=nI(\\theta)$ になります。</p>
<h3>クラーメル・ラオの下限</h3>
<p>どんな不偏推定量も、この情報量が決める限界より分散を小さくできません。</p>
<p>$$ V[\\hat\\theta]\\ \\ge\\ \\frac{1}{n\\,I(\\theta)}\\quad(\\text{クラーメル・ラオ不等式}) $$</p>
<p><strong>なぜこの下限が出るか</strong>：不偏 $E[\\hat\\theta]=\\theta$ を $\\theta$ で微分すると $\\mathrm{Cov}(\\hat\\theta,U)=1$ が出ます。コーシー・シュワルツの不等式 $\\mathrm{Cov}(\\hat\\theta,U)^2\\le V[\\hat\\theta]\\,V[U]$ に入れると $1\\le V[\\hat\\theta]\\cdot nI(\\theta)$、移項してクラーメル・ラオ不等式が得られます。等号（＝下限達成）はスコアと推定量が線形関係のときだけで、これが指数型分布族で起きます。下限を達成する推定量を<strong>有効推定量</strong>と呼びます。最尤推定量は大標本で漸近的にこの下限を達成し（漸近有効）、$\\hat\\theta \\approx N\\big(\\theta,\\ 1/(nI(\\theta))\\big)$ となります。</p>

<h3>前提条件と、崩れたときの影響</h3>
<table class="simple">
<tr><th>前提（正則条件）</th><th>崩れると起きること</th><th>対処・代替</th></tr>
<tr><td>台（値域）が $\\theta$ に依存しない</td><td>$U(0,\\theta)$ のように端が $\\theta$ で動くと下限が破れる。MLE（最大値）の分散は $\\theta^2/n^2$ 級で下限 $\\theta^2/n$ を大きく下回る</td><td>下限は適用外。順序統計量の分布から直接分散を評価</td></tr>
<tr><td>微分と積分の交換ができる</td><td>尤度が滑らかでない・スコアが定義できないと $I(\\theta)$ が求まらない</td><td>正則条件を満たすモデルへ・数値的評価</td></tr>
<tr><td>推定量が不偏</td><td>偏りがあると下限に $(1+b'(\\theta))^2$ が掛かり式が変わる。縮小推定量は<strong>下限より小さいMSE</strong>を達成しうる</td><td>不偏に限らずMSEで比較（バイアス・分散トレードオフ）</td></tr>
<tr><td>パラメータが1個</td><td>多母数ではスカラーで書けない</td><td>フィッシャー情報<strong>行列</strong>、下限はその逆行列の対角成分</td></tr>
</table>

<h3>有意性と実質的な意味</h3>
<p>クラーメル・ラオ下限は「これ以上は精度を上げられない床」なので、<strong>必要な標本数の設計</strong>に直結します。目標の標準誤差 $\\mathrm{SE}$ を達成するには $n\\ge 1/[I(\\theta)\\,\\mathrm{SE}^2]$ が要る、と逆算できます。ベルヌーイでは $I(p)=1/[p(1-p)]$ が $p=0.5$ で最小＝情報が最も少ないので、$p$ が不明なときは $p=0.5$ を最悪ケースにとって $n$ を見積もるのが安全側の定石です。</p>
<p>また漸近正規性 $\\hat\\theta\\approx N(\\theta,1/(nI))$ が、最尤推定に基づく<a href="#/prep1/confidence">ワルド型信頼区間</a> $\\hat\\theta\\pm z_{\\alpha/2}/\\sqrt{nI(\\hat\\theta)}$ や検定の土台です。実務では推定量の良し悪しを<strong>効率＝下限／実分散</strong>で測ります。効率50%の推定量は、同じ精度を得るのに<strong>2倍のデータ</strong>が要る——「どの推定量を使うか」が標本数・コストにそのまま跳ね返ります。</p>
<div class="note">下はベルヌーイ（表確率 $p$）の対数尤度。$n$ を増やすと曲線が鋭く尖り、フィッシャー情報 $nI(p)=n/[p(1-p)]$ が増え、クラーメル・ラオ下限 $p(1-p)/n$ が小さくなる様子が同時に見えます。</div>`,
    demo: {
      note: 'n を増やすと対数尤度が鋭くなる＝情報量が増える＝推定の分散下限が下がる。p=0.5付近が最も情報が少なく(分散大)、0や1に寄るほど情報が増えます。',
      controls: [
        { type: 'range', id: 'n', label: '標本サイズ n', min: 5, max: 200, step: 5, value: 30 },
        { type: 'range', id: 'p', label: '真の p', min: 0.1, max: 0.9, step: 0.05, value: 0.3 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const n = Math.round(p.n), truep = p.p;
        const khat = Math.round(n * truep); // 期待的な成功数
        const ps = st.linspace(0.02, 0.98, 300);
        const ll = ps.map(pp => khat * Math.log(pp) + (n - khat) * Math.log(1 - pp));
        const maxll = Math.max.apply(null, ll);
        const pl = Pl.make(canvas, { xmin: 0, xmax: 1, ymin: -15, ymax: 0.5 });
        pl.clear(); pl.axes({ xLabel: '母数 p', yLabel: '対数尤度（相対）' });
        pl.line(ps.map((pp, i) => [pp, Math.max(-15, ll[i] - maxll)]), { color: Pl.colors[0], width: 2.5 });
        pl.vline(truep, { color: Pl.colors[1], label: 'p̂=' + truep.toFixed(2) });
        const info = n / (truep * (1 - truep));
        const crlb = truep * (1 - truep) / n;
        pl.text(0, 0.5, 'フィッシャー情報 nI(p)=' + info.toFixed(1), { align: 'left', baseline: 'top', dx: 56, dy: 4, color: '#475467', size: 12.5 });
        pl.text(0, 0.5, 'クラーメル・ラオ下限 V[p̂]≥' + crlb.toFixed(4) + '  (SD≥' + Math.sqrt(crlb).toFixed(3) + ')', { align: 'left', baseline: 'top', dx: 56, dy: 24, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- モーメント法 --- */
  T.push({
    section: 'prep1', group: '推定', id: 'moment-method', title: 'モーメント法',
    summary: '「理論上のモーメント＝標本のモーメント」と置いて解くだけ——最尤法より手軽な推定法の考え方と、長所短所を押さえます。',
    body: `
<p><strong>モーメント法</strong>は、母数の数だけモーメントの式を立て、「理論モーメント＝標本モーメント」と等式で結んで解く方法です。</p>
<p>$$ E[X]=\\bar x,\\quad E[X^2]=\\frac1n\\sum x_i^2,\\ \\dots $$</p>
<h3>例：ガンマ分布 $\\mathrm{Ga}(k,\\theta)$</h3>
<p>理論では $E[X]=k\\theta,\\ V[X]=k\\theta^2$。標本平均 $\\bar x$ と標本分散 $s^2$ と等しいと置くと、</p>
<p>$$ \\hat\\theta=\\frac{s^2}{\\bar x},\\qquad \\hat k=\\frac{\\bar x^2}{s^2} $$</p>
<p>と、連立を解くだけで推定量が求まります。</p>
<p><strong>なぜこれで正当化されるか</strong>：標本モーメント $\\frac1n\\sum x_i^r$ は<a href="#/prep1/lln">大数の法則</a>で理論モーメント $E[X^r]$ に収束します。連立方程式の解がパラメータの連続関数なら、収束はそのまま解に引き継がれる（連続写像定理）——つまり<strong>モーメント法の推定量は一致推定量</strong>です。保証されるのはそこまでで、不偏性や有効性は保証されません。</p>
<h3>前提条件と、崩れたときの影響</h3>
<table class="simple">
<tr><th>前提</th><th>崩れると起きること</th><th>対処・代替</th></tr>
<tr><td>使うモーメントが存在する</td><td>コーシー分布のように平均が存在しないと、そもそも式が立てられない</td><td>分位点ベースの推定・<a href="#/prep1/mle">最尤法</a></td></tr>
<tr><td>解が定義域に収まる</td><td>$\\hat k<0$ や負の分散推定など、実現不可能な値が出ることがある</td><td>境界に切り詰める・最尤法へ切り替え</td></tr>
<tr><td>効率（分散）は問わない</td><td>同じデータでも最尤推定より分散が大きいことがある（情報をモーメントに圧縮した分の損）</td><td>MoM を初期値にして最尤法で仕上げる、が実務の定石</td></tr>
<tr><td>どのモーメントを使うか</td><td>選ぶモーメントの組で推定量が変わる（非一意）</td><td>低次モーメント優先（高次は外れ値に激しく敏感）</td></tr>
</table>
<p>使い分けの整理：<strong>最尤法</strong>は分布の完全な指定と引き換えに漸近有効、<strong>モーメント法</strong>は「式が解ければ即使える」簡便さ、<strong>最小二乗法</strong>は平均構造だけを仮定する回帰の標準——仮定の強さと効率のトレードオフです。</p>
<h3>有意性と実質的な意味</h3>
<p>モーメント法の点推定は<strong>小標本で偏り得ます</strong>。下のデモのガンマ分布では、$n=15$ で $\\hat k$ の平均は約 2.4（真値 2）と<strong>2割以上の上方バイアス</strong>が出ます（$n=200$ でほぼ解消——一致性はあるが不偏ではない、の実物）。点推定だけを報告せず、標準誤差（デルタ法や<a href="#/prep1/bootstrap">ブートストラップ</a>）を添えるのが作法です。</p>
<div class="note"><strong>長所</strong>：計算が簡単で、尤度が複雑でも使える。最尤推定の初期値によく使う。<br><strong>短所</strong>：一般に最尤法より効率が悪い（分散が大きい）ことがあり、パラメータが定義域外（例：負の分散）になることもある。準1級では「最尤法・モーメント法・最小二乗法」の使い分けが問われます。</div>`,
    demo: {
      note: 'ガンマ分布のデータからモーメント法で k̂=x̄²/s² を繰り返し推定した分布。n が小さいと山が真値（点線）より右にずれる＝上方バイアス。n を増やすと山が真値に寄って細くなる＝一致性。バイアスがあっても一致推定量、を1枚で確認できます。',
      controls: [
        { type: 'range', id: 'k', label: '真の形状 k', min: 1, max: 6, step: 1, value: 2 },
        { type: 'range', id: 'n', label: '標本サイズ n', min: 10, max: 200, step: 10, value: 20 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(910 + (p.reseed | 0) * 37);
        const kTrue = Math.round(p.k), n = Math.round(p.n), theta = 1;
        // 整数kのガンマ＝指数乱数k個の和（アーラン）
        const gammaRv = () => { let s = 0; for (let j = 0; j < kTrue; j++) s += -theta * Math.log(1 - rand()); return s; };
        const R = 2000, khats = [];
        for (let r = 0; r < R; r++) {
          const xs = [];
          for (let i = 0; i < n; i++) xs.push(gammaRv());
          const m = st.mean(xs);
          let ss = 0; for (const x of xs) ss += (x - m) * (x - m);
          const s2 = ss / (n - 1);
          if (s2 > 1e-9) khats.push(m * m / s2);
        }
        const lo = 0, hi = kTrue * 3;
        const bins = st.histogram(khats.filter(v => v <= hi), 44, lo, hi);
        const ymax = Math.max.apply(null, bins.map(b => b.density)) * 1.15 || 1;
        const pl = Pl.make(canvas, { xmin: lo, xmax: hi, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: 'k̂ = x̄²/s² の推定値', yLabel: '密度' });
        pl.bars(bins.map(b => ({ x0: b.x0, x1: b.x1, y: b.density })), { color: Pl.colors[0], alpha: 0.6 });
        pl.vline(kTrue, { color: Pl.ink, dash: [6, 3], label: '真値 k=' + kTrue });
        const mk = st.mean(khats);
        pl.vline(mk, { color: Pl.colors[1], label: '平均 ' + mk.toFixed(2) });
        pl.text(hi, ymax, 'バイアス ' + (mk - kTrue >= 0 ? '+' : '') + (mk - kTrue).toFixed(2), { align: 'right', baseline: 'top', dx: -8, dy: 4, color: Pl.colors[1], size: 12.5 });
      },
    },
  });

  /* --- ガウス・マルコフの定理 --- */
  T.push({
    section: 'prep1', group: '推定', id: 'gauss-markov', title: 'ガウス・マルコフの定理（BLUE）',
    summary: '「誤差が無相関・等分散なら、最小二乗推定量が最良線形不偏推定量（BLUE）になる」——回帰でOLSを使う根拠を理解します。',
    body: `
<p>線形モデル $\\boldsymbol y=X\\boldsymbol\\beta+\\boldsymbol\\varepsilon$ で、誤差が次を満たすとします。</p>
<p>$$ E[\\boldsymbol\\varepsilon]=\\boldsymbol0,\\quad V[\\boldsymbol\\varepsilon]=\\sigma^2 I\\ (\\text{等分散・無相関}) $$</p>
<p><strong>ガウス・マルコフの定理</strong>：このとき最小二乗推定量 $\\hat{\\boldsymbol\\beta}=(X^\\top X)^{-1}X^\\top\\boldsymbol y$ は、すべての<strong>線形</strong>な<strong>不偏</strong>推定量のなかで<strong>分散が最小</strong>になります。頭文字をとって <strong>BLUE</strong>（Best Linear Unbiased Estimator）。</p>
<div class="note">重要なのは「正規分布は仮定していない」こと。誤差が正規でなくても、等分散・無相関でありさえすればOLSは最良の線形不偏推定量です。ただし前提が崩れると最良でなくなります：
<ul>
<li><strong>不等分散（heteroscedasticity）</strong>や<strong>系列相関</strong>があると $V[\\boldsymbol\\varepsilon]\\ne\\sigma^2 I$ になり、<a href="#/prep1/regression-diagnostics">一般化最小二乗（GLS）</a>のほうが有効。</li>
<li>正規性を追加で仮定すると、OLSは線形に限らず全不偏推定量のなかで最良（最尤推定量と一致）になる。</li>
</ul></div>`,
  });

  /* --- 順序統計量 --- */
  T.push({
    section: 'prep1', group: '推定', id: 'order-statistics', title: '順序統計量（最小・最大・中央値の分布）',
    summary: 'データを小さい順に並べ替えた「$k$ 番目の値」がどんな分布に従うか——最小値・最大値・中央値の分布を、標本サイズを変えて観察します。',
    body: `
<p>標本を小さい順に並べた $x_{(1)}\\le x_{(2)}\\le\\dots\\le x_{(n)}$ を<strong>順序統計量</strong>と呼びます。最小値 $x_{(1)}$、最大値 $x_{(n)}$、中央値などがこれにあたります。</p>
<p>累積分布 $F$ をもつ母集団からの標本で、最大値・最小値の分布は簡単に書けます。</p>
<p>$$ P(x_{(n)}\\le t)=F(t)^n,\\qquad P(x_{(1)}>t)=\\big(1-F(t)\\big)^n $$</p>
<p>（最大が $t$ 以下 ⟺ 全員が $t$ 以下、最小が $t$ 超 ⟺ 全員が $t$ 超、という単純な理屈です。）一般の $k$ 番目の密度は</p>
<p>$$ f_{(k)}(t)=\\frac{n!}{(k-1)!(n-k)!}F(t)^{k-1}\\big(1-F(t)\\big)^{n-k}f(t) $$</p>
<p>一様分布 $U(0,1)$ の $k$ 番目は $\\mathrm{Beta}(k,\\,n-k+1)$ に従います。</p>
<div class="note">下は $U(0,1)$ からの最小・中央・最大値の分布。$n$ を増やすと最大値は1へ、最小値は0へ張り付き、中央値は0.5に集中していきます（極値の分布は極値統計・信頼性工学の基礎）。</div>`,
    demo: {
      note: 'n を増やすと最大値の分布が右端(1)へ、最小値が左端(0)へ押し寄せる。中央値は0.5に集中して尖る。これが「n個中の最大」がだんだん大きくなる直感の正体です。',
      controls: [
        { type: 'range', id: 'n', label: '標本サイズ n', min: 2, max: 40, step: 1, value: 8 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(3 + (p.reseed | 0) * 83);
        const n = Math.round(p.n), reps = 4000;
        const mins = [], meds = [], maxs = [];
        for (let r = 0; r < reps; r++) {
          const xs = [];
          for (let i = 0; i < n; i++) xs.push(rand());
          xs.sort((a, b) => a - b);
          mins.push(xs[0]); maxs.push(xs[n - 1]);
          meds.push(n % 2 ? xs[(n - 1) / 2] : (xs[n / 2 - 1] + xs[n / 2]) / 2);
        }
        const mk = arr => st.histogram(arr, 40, 0, 1);
        const bMin = mk(mins), bMed = mk(meds), bMax = mk(maxs);
        const ymax = Math.max(
          Math.max.apply(null, bMin.map(b => b.density)),
          Math.max.apply(null, bMed.map(b => b.density)),
          Math.max.apply(null, bMax.map(b => b.density))) * 1.1 || 1;
        const pl = Pl.make(canvas, { xmin: 0, xmax: 1, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: '値', yLabel: '密度' });
        pl.bars(bMin.map(b => ({ x0: b.x0, x1: b.x1, y: b.density })), { color: Pl.colors[0], alpha: 0.4 });
        pl.bars(bMed.map(b => ({ x0: b.x0, x1: b.x1, y: b.density })), { color: Pl.colors[2], alpha: 0.4 });
        pl.bars(bMax.map(b => ({ x0: b.x0, x1: b.x1, y: b.density })), { color: Pl.colors[1], alpha: 0.4 });
        pl.legend([
          { label: '最小 x₍₁₎', color: Pl.colors[0] },
          { label: '中央値', color: Pl.colors[2] },
          { label: '最大 x₍ₙ₎', color: Pl.colors[1] },
        ]);
      },
    },
  });

})();
