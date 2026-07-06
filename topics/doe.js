'use strict';
/* 実験計画法 */
(function () {
  const T = (window.STATS_TOPICS = window.STATS_TOPICS || []);
  const S = () => window.Stats;
  const P = () => window.Plot;
  const TH = () => window.PlotlyTheme;

  /* --- 1. 実験計画の3原則 --- */
  T.push({
    section: 'prep1', group: '分散分析と実験計画（範囲内）', id: 'principles', title: '実験計画の3原則',
    summary: 'フィッシャーの「反復・無作為化・局所管理」を、なぜそれが必要かとセットで理解します。',
    body: `
<p>実験計画法は、限られた実験回数で「本当に効いている要因」を見抜くための方法論です。土台となるのが<strong>フィッシャーの3原則</strong>です。</p>
<h3>① 反復 (Replication)</h3>
<p>同じ条件で複数回実験することで、偶然のばらつき（誤差）の大きさを見積もれます。反復がないと、観測した差が「効果」なのか「たまたま」なのか区別できません。</p>
<h3>② 無作為化 (Randomization)</h3>
<p>実験の順序や割り付けをランダムにすることで、時間経過や測定順といった<strong>未知の系統誤差</strong>を偶然誤差に変え、特定の処理に偏って影響しないようにします。</p>
<h3>③ 局所管理 (Local Control / Blocking)</h3>
<p>ばらつきの原因になりそうな要因（日・装置・ロットなど）を「ブロック」としてまとめ、その中で比較することで、誤差を小さくして検出力を上げます。</p>
<div class="note">下のデモは、系統誤差（右肩上がりのドリフト）がある状況で「無作為化する／しない」を切り替えたもの。無作為化しないと処理Aと処理Bの見かけの差にドリフトが混入しますが、無作為化すると両群に均され、真の差が推定できます。</div>`,
    demo: {
      note: '「無作為化なし」ではAを先・Bを後に実施→ドリフトがBを押し上げ偽の差に。「無作為化あり」は順序を混ぜるため両群にドリフトが均等に散らばります。',
      controls: [
        { type: 'range', id: 'drift', label: '系統誤差（ドリフト）の大きさ', min: 0, max: 10, step: 0.5, value: 5 },
        { type: 'select', id: 'mode', label: '割り付け', value: 'no', options: [
          { value: 'no', label: '無作為化なし（A先→B後）' },
          { value: 'yes', label: '無作為化あり' },
        ]},
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(42 + (p.reseed | 0) * 53);
        const N = 24; // 総実験数
        const trueA = 20, trueB = 22; // 真の効果（Bがわずかに高い）
        const assign = [];
        if (p.mode === 'no') {
          for (let i = 0; i < N; i++) assign.push(i < N / 2 ? 'A' : 'B');
        } else {
          for (let i = 0; i < N; i++) assign.push(i < N / 2 ? 'A' : 'B');
          for (let i = N - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); const t = assign[i]; assign[i] = assign[j]; assign[j] = t; }
        }
        const pts = [];
        const aVals = [], bVals = [];
        for (let i = 0; i < N; i++) {
          const drift = p.drift * (i / (N - 1));
          const base = assign[i] === 'A' ? trueA : trueB;
          const y = base + drift + 1.5 * st.randn(rand);
          pts.push({ order: i + 1, y, g: assign[i] });
          if (assign[i] === 'A') aVals.push(y); else bVals.push(y);
        }
        const pl = Pl.make(canvas, { xmin: 0, xmax: N + 1, ymin: 14, ymax: 14 + Math.max(18, p.drift + 14) });
        pl.clear(); pl.axes({ xLabel: '実験の実施順', yLabel: '測定値' });
        for (const pt of pts) pl.scatter([[pt.order, pt.y]], { color: pt.g === 'A' ? Pl.colors[0] : Pl.colors[1], r: 5, alpha: 0.9 });
        const ma = st.mean(aVals), mb = st.mean(bVals);
        pl.hline(ma, { color: Pl.colors[0], label: 'A平均 ' + ma.toFixed(1) });
        pl.hline(mb, { color: Pl.colors[1], label: 'B平均 ' + mb.toFixed(1) });
        pl.legend([{ label: '処理A', color: Pl.colors[0] }, { label: '処理B', color: Pl.colors[1] }]);
        const diff = (mb - ma).toFixed(1);
        pl.text(N + 1, 14 + Math.max(18, p.drift + 14), '見かけの差 B−A = ' + diff + '（真の差 = 2.0）', { align: 'right', baseline: 'top', dx: -8, dy: 44, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- 2. 一元配置分散分析 --- */
  T.push({
    section: 'prep1', group: '分散分析と実験計画（範囲内）', id: 'anova1', title: '一元配置分散分析（ANOVA）',
    summary: '3群以上の平均を比べる分散分析を、「群間のばらつき」と「群内のばらつき」の比（F値）として視覚化します。',
    body: `
<p>3つ以上の水準（群）の平均に差があるかを調べるのが<strong>分散分析</strong>です。全体のばらつき（総平方和）を「群間」と「群内（誤差）」に分解します。</p>
<p>$$ \\underbrace{SS_T}_{\\text{総}} = \\underbrace{SS_B}_{\\text{群間}} + \\underbrace{SS_W}_{\\text{群内}} $$</p>
<p>それぞれを自由度で割った平均平方の比が $F$ 値です。</p>
<p>$$ F = \\frac{SS_B/(k-1)}{SS_W/(N-k)} = \\frac{\\text{群間の分散}}{\\text{群内の分散}} $$</p>
<p>群間のばらつき（平均どうしの離れ具合）が、群内のばらつき（各群内のノイズ）に比べて大きいほど $F$ 値は大きくなり、「平均に差がある」と判断されます。</p>
<p><strong>なぜ比で検定できるか</strong>：帰無仮説（全群の母平均が等しい）のもとでは、群間平均平方 $MS_B$ と群内平均平方 $MS_W$ は<strong>どちらも誤差分散 $\\sigma^2$ の不偏推定</strong>になるため比 $F\\approx1$。対立仮説では平均の差が $MS_B$ を押し上げ、$F>1$ に偏ります。だから $F$ が大きいほど「差あり」。ちなみに2群のときは $F=t^2$ で、分散分析は $t$ 検定の多群への一般化です。</p>
<h3>前提条件と、崩れたときの影響</h3>
<ul>
<li><strong>誤差の独立性</strong>：崩れると検定が無効。<a href="#/prep1/principles">無作為化</a>で担保し、反復測定は専用の分散分析／混合効果モデルを使う。</li>
<li><strong>各群で正規性</strong>：$F$ 分布の根拠。$F$ 検定は正規性のずれには比較的頑健（とくに大標本・釣り合い型）。小標本＋強い歪みなら <a href="#/prep1/nonparametric">クラスカル・ウォリス検定</a>。</li>
<li><strong>等分散性</strong>：群ごとに分散が異なると、とくに<strong>群サイズが不揃い</strong>のとき第一種の誤りが膨張。→ ウェルチの分散分析。事前チェックにレヴィン検定。</li>
</ul>
<p>また $F$ が有意でも「どこかの群が違う」までしか言えず、<strong>どの対が違うか</strong>は多重性を考慮した事後検定（テューキー法など、<a href="#/prep1/multiple-comparison">多重比較</a>参照）で調べます。</p>
<h3>有意性と実質的な意味</h3>
<p>有意な $F$ は「全群が同一ではない」を示すだけで、差の<strong>大きさ</strong>とは別問題です。効果量は $\\eta^2=SS_B/SS_T$（説明された分散の割合）や、より偏りの小さい $\\omega^2$ で測ります。$n$ が大きいほど実質的に小さな差でも有意になるため、$\\eta^2$ と各群平均の信頼区間を併せて読みます。</p>
<div class="note">下で群間の差（効果）と群内のばらつき（ノイズ）を動かすと、F値とp値が変わります。効果が同じでもノイズが大きいと有意にならない——「シグナル対ノイズ比」の感覚がつかめます。</div>`,
    demo: {
      note: '群平均の広がり（効果）が大きいほど、また群内のばらつきが小さいほど F 値は大きくなります。点は各観測、太線は群平均、点線は全体平均です。',
      controls: [
        { type: 'range', id: 'effect', label: '群間の効果（平均差）', min: 0, max: 8, step: 0.5, value: 3 },
        { type: 'range', id: 'noise', label: '群内のばらつき σ', min: 0.5, max: 6, step: 0.5, value: 2 },
        { type: 'range', id: 'n', label: '各群のサンプル数', min: 3, max: 30, step: 1, value: 10 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(9 + (p.reseed | 0) * 71);
        const k = 3;
        const centers = [20 - p.effect, 20, 20 + p.effect];
        const n = Math.round(p.n);
        const groups = centers.map(c => {
          const arr = [];
          for (let i = 0; i < n; i++) arr.push(c + p.noise * st.randn(rand));
          return arr;
        });
        const all = [].concat.apply([], groups);
        const grand = st.mean(all);
        let ssb = 0, ssw = 0;
        const means = groups.map(g => st.mean(g));
        groups.forEach((g, i) => {
          ssb += g.length * (means[i] - grand) ** 2;
          for (const v of g) ssw += (v - means[i]) ** 2;
        });
        const dfb = k - 1, dfw = all.length - k;
        const F = (ssb / dfb) / (ssw / dfw || 1e-9);
        const pval = 1 - st.fCdf(F, dfb, dfw);
        const ymin = grand - 4 * p.noise - p.effect - 2, ymax = grand + 4 * p.noise + p.effect + 2;
        const pl = Pl.make(canvas, { xmin: 0.3, xmax: k + 0.7, ymin, ymax });
        pl.clear();
        pl.axes({ xLabel: '群', yLabel: '測定値', xTicks: [1, 2, 3], xFmt: v => '群' + v });
        pl.hline(grand, { color: Pl.gray, label: '全体平均' });
        groups.forEach((g, i) => {
          const x = i + 1;
          for (const v of g) pl.scatter([[x + (rand() - 0.5) * 0.3, v]], { color: Pl.colors[i], r: 3.5, alpha: 0.7 });
          const ctx = pl.ctx;
          ctx.strokeStyle = Pl.colors[i]; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(pl.X(x - 0.25), pl.Y(means[i])); ctx.lineTo(pl.X(x + 0.25), pl.Y(means[i])); ctx.stroke();
        });
        pl.text(k + 0.7, ymax, 'F = ' + F.toFixed(2), { align: 'right', baseline: 'top', dx: -8, dy: 6, color: Pl.ink, size: 14 });
        pl.text(k + 0.7, ymax, 'p = ' + (pval < 0.001 ? '<0.001' : pval.toFixed(3)) + (pval < 0.05 ? ' ✓有意' : ' 有意でない'), { align: 'right', baseline: 'top', dx: -8, dy: 26, color: pval < 0.05 ? Pl.colors[2] : '#98a2b3', size: 13 });
      },
    },
  });

  /* --- 3. 二元配置と交互作用 --- */
  T.push({
    section: 'prep1', group: '分散分析と実験計画（範囲内）', id: 'interaction', title: '二元配置と交互作用',
    summary: '2つの要因を同時に扱うとき現れる「交互作用」を、平行／非平行になる折れ線グラフで直感的に捉えます。',
    body: `
<p>2つの要因 A・B を同時に変える実験では、それぞれの主効果に加えて<strong>交互作用</strong>を評価できます。交互作用とは「要因Aの効果が、要因Bの水準によって変わる」現象です。</p>
<p>$$ y_{ij} = \\mu + \\alpha_i + \\beta_j + (\\alpha\\beta)_{ij} + \\varepsilon_{ij} $$</p>
<p>交互作用を見る定番が<strong>交互作用プロット</strong>です。要因Bの各水準ごとに「Aの水準 → 平均」の折れ線を描きます。</p>
<ul>
<li><strong>線が平行</strong> → 交互作用なし（Aの効果はBに依存しない）</li>
<li><strong>線が非平行・交差</strong> → 交互作用あり（組み合わせで効果が変わる）</li>
</ul>
<div class="note">例：肥料（要因A）と品種（要因B）。「品種によって効く肥料が違う」なら線は交差します。下で交互作用の強さを動かして、平行→交差への変化を見てください。</div>`,
    demo: {
      note: '交互作用の強さを0にすると2本の線は平行（各要因が独立に足し算で効く）。強くすると交差し、「組み合わせ次第で最適が変わる」状態になります。',
      controls: [
        { type: 'range', id: 'inter', label: '交互作用の強さ', min: -6, max: 6, step: 0.5, value: 4 },
        { type: 'range', id: 'mainA', label: '要因Aの主効果', min: 0, max: 8, step: 0.5, value: 3 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        // 2水準×2水準の平均。B1, B2 各水準で A低→A高 の折れ線
        const base = 10;
        const A = [0, p.mainA]; // A低, A高の主効果
        // B1: 交互作用 +、B2: 交互作用 -
        const y_B1 = [base + A[0], base + A[1] + p.inter];
        const y_B2 = [base + A[0] + 3, base + A[1] + 3 - p.inter];
        const pl = Pl.make(canvas, { xmin: 0.7, xmax: 2.3, ymin: 4, ymax: 26 });
        pl.clear();
        pl.axes({ xLabel: '要因A', yLabel: '応答の平均', xTicks: [1, 2], xFmt: v => v === 1 ? 'A低' : 'A高' });
        pl.line([[1, y_B1[0]], [2, y_B1[1]]], { color: Pl.colors[0], width: 2.5 });
        pl.line([[1, y_B2[0]], [2, y_B2[1]]], { color: Pl.colors[1], width: 2.5 });
        pl.scatter([[1, y_B1[0]], [2, y_B1[1]]], { color: Pl.colors[0], r: 5 });
        pl.scatter([[1, y_B2[0]], [2, y_B2[1]]], { color: Pl.colors[1], r: 5 });
        pl.legend([{ label: '要因B: 水準1', color: Pl.colors[0] }, { label: '要因B: 水準2', color: Pl.colors[1] }]);
        const parallel = Math.abs(p.inter) < 0.3;
        pl.text(0.7, 26, parallel ? '≈ 平行 → 交互作用なし' : '非平行 → 交互作用あり', { align: 'left', baseline: 'top', dx: 60, dy: 4, color: parallel ? Pl.colors[2] : Pl.colors[1], size: 13 });
      },
    },
  });

  /* --- 4. 直交表 --- */
  T.push({
    section: 'prep1', group: '分散分析と実験計画（範囲内）', id: 'orthogonal', title: '直交表による効率的な実験',
    summary: '多数の要因を少ない実験回数で調べる「直交表」の仕組みと、なぜ各要因を公平に評価できるのかを可視化します。',
    body: `
<p>要因が7つ、各2水準あると、全組み合わせ（総当たり）は $2^7 = 128$ 回。これを<strong>直交表 $L_8$</strong> を使うとわずか8回で主効果を推定できます。</p>
<p>直交表の「直交」とは、<strong>どの2列を取り出しても、水準の組み合わせが均等に現れる</strong>性質のこと。これにより各要因の効果を、他の要因の影響から分離して（公平に）推定できます。</p>
<table class="simple">
<tr><th>実験</th><th>因子A</th><th>因子B</th><th>因子C</th><th>結果y</th></tr>
<tr><td>1</td><td>1</td><td>1</td><td>1</td><td>…</td></tr>
<tr><td>2</td><td>1</td><td>1</td><td>2</td><td>…</td></tr>
<tr><td>3</td><td>1</td><td>2</td><td>1</td><td>…</td></tr>
<tr><td>…</td><td>…</td><td>…</td><td>…</td><td>…</td></tr>
</table>
<p>各因子について「水準1のときの結果の平均」と「水準2のときの平均」の差が、その因子の効果（要因効果）の推定値になります。</p>
<p><strong>なぜ直交だと効果を分離できるか</strong>：水準1/2を $-1/+1$ にコード化すると、「どの2列も組み合わせが均等」は「<strong>どの2列も内積が0</strong>」と同じことです。効果の推定は回帰 $y=\\mu+\\frac{\\alpha_A}{2}x_A+\\frac{\\alpha_B}{2}x_B+\\cdots$ の最小二乗と同値で、列が直交なら $X^\\top X$ が対角行列になり（<a href="#/prep1/multiple-regression">重回帰</a>で逆行列が対角）、<strong>各因子の係数が他の因子と無相関に・独立に推定される</strong>——「水準2平均−水準1平均」という単純な引き算が、そのまま最小二乗解に一致します。精度も全因子で平等で、$n$ 回の実験なら</p>
<p>$$ \\mathrm{SE}(\\hat\\alpha)=\\sigma\\sqrt{\\tfrac{1}{n/2}+\\tfrac{1}{n/2}}=\\frac{2\\sigma}{\\sqrt n}\\quad(L_8\\text{なら }\\sigma/\\sqrt2) $$</p>
<h3>前提条件と、崩れたときの影響</h3>
<table class="simple">
<tr><th>前提</th><th>崩れると起きること</th><th>対処・代替</th></tr>
<tr><td>交互作用が無視できる</td><td>$L_8$ に因子を7つ詰め込むと、交互作用の列に因子が乗り、<strong>主効果と2因子交互作用が交絡</strong>（どちらの効果か区別不能＝バイアス）</td><td>交互作用が疑わしい列は空けて割り付ける・分解能の高い計画・折り返し実験</td></tr>
<tr><td>効果が水準間で線形</td><td>2水準では曲率（中間水準が最良）を検出できない</td><td>中心点の追加・3水準系（$L_9$）・<a href="#/doe/rsm">応答曲面法</a>へ</td></tr>
<tr><td>誤差の独立・等分散</td><td>実験順序に系統誤差（日間差・ドリフト）が乗ると効果推定が歪む</td><td><a href="#/prep1/principles">ランダム化・ブロック化</a></td></tr>
<tr><td>誤差の自由度がある</td><td>全列に因子を割り付けると誤差が推定できず検定不能</td><td>空き列を誤差に使う・反復・確認実験</td></tr>
</table>
<p>なお下のデモの3因子×8回は、実は $2^3$ 総当たりと同型（A×B の交互作用列が C と直交＝交絡なし）です。交絡が問題になるのは、8回のまま因子を4つ以上に増やしたとき——「実験回数の節約」は「交互作用なしの仮定」で買っている、という等価交換を忘れないでください。</p>
<h3>有意性と実質的な意味</h3>
<p>$L_8$ の効果推定のばらつきは $\\mathrm{SE}=\\sigma/\\sqrt2\\approx0.71\\sigma$。つまり<strong>測定ノイズと同程度の大きさの効果は、8回の実験では偶然と区別できません</strong>。下のデモでノイズを4に上げると、真の効果0の因子Bにも±3程度の棒が立ちます——これが偽発見の実物です。実務では効果の大小で因子を絞ったあと、<strong>最適条件での確認実験（追試）</strong>で再現性を確かめるのが定石です。統計的に有意でも、効果量が工程の要求精度より小さければ実質的な意味はありません。</p>
<div class="note">下は L8 直交表を使った実験のシミュレーション。各因子の真の効果をスライダーで設定すると、8回の実験結果から「要因効果図」が推定されます。設定した効果が、少ない実験からきちんと復元されることを確認してください。ノイズを上げたときに因子B（真の効果0）に立つ「見かけの棒」の大きさが、上の式の $\\mathrm{SE}=\\sigma/\\sqrt2$ の実感です。</div>`,
    demo: {
      note: '棒の高さ（水準2平均−水準1平均）が各因子の推定効果。真の効果を大きく設定した因子ほど棒が長くなり、8回の実験で主効果が分離できることが分かります。',
      controls: [
        { type: 'range', id: 'effA', label: '因子Aの真の効果', min: -8, max: 8, step: 1, value: 6 },
        { type: 'range', id: 'effB', label: '因子Bの真の効果', min: -8, max: 8, step: 1, value: 0 },
        { type: 'range', id: 'effC', label: '因子Cの真の効果', min: -8, max: 8, step: 1, value: -4 },
        { type: 'range', id: 'noise', label: '測定ノイズ', min: 0, max: 4, step: 0.5, value: 1 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(5 + (p.reseed | 0) * 29);
        // L8 の最初の3列（A,B,C）。1/2 を -1/+1 に対応させる
        const L8 = [
          [1, 1, 1], [1, 1, 2], [1, 2, 1], [1, 2, 2],
          [2, 1, 1], [2, 1, 2], [2, 2, 1], [2, 2, 2],
        ];
        const effs = [p.effA, p.effB, p.effC];
        const y = L8.map(row => {
          let v = 30;
          for (let f = 0; f < 3; f++) v += (row[f] === 2 ? 1 : -1) * effs[f] / 2;
          return v + p.noise * st.randn(rand);
        });
        // 各因子: 水準2の平均 − 水準1の平均
        const estimated = [0, 1, 2].map(f => {
          const lo = [], hi = [];
          L8.forEach((row, i) => { (row[f] === 1 ? lo : hi).push(y[i]); });
          return st.mean(hi) - st.mean(lo);
        });
        const pl = Pl.make(canvas, { xmin: 0.3, xmax: 3.7, ymin: -9, ymax: 9 });
        pl.clear();
        pl.axes({ xLabel: '因子', yLabel: '推定した効果', xTicks: [1, 2, 3], xFmt: v => ['A', 'B', 'C'][v - 1] });
        pl.hline(0, { color: Pl.gray, dash: [] });
        const labels = ['A', 'B', 'C'];
        estimated.forEach((e, i) => {
          const x = i + 1;
          pl.bars([{ x0: x - 0.28, x1: x + 0.28, y: e }], { color: Pl.colors[i], alpha: 0.8 });
          pl.text(x, e + (e >= 0 ? 0.3 : -0.3), e.toFixed(1), { align: 'center', baseline: e >= 0 ? 'bottom' : 'top', color: Pl.ink, size: 12 });
          pl.text(x, 0, '真:' + effs[i], { align: 'center', baseline: 'top', dy: 20, color: '#98a2b3', size: 11 });
        });
      },
    },
  });

  /* --- 5. 応答曲面法（Plotly 3D） --- */
  T.push({
    section: 'doe', id: 'rsm', title: '応答曲面法（RSM）',
    summary: '要因を連続的に変えたときの応答を2次式で近似し、その「曲面の頂上」として最適条件を探します。3Dの地形として回して眺めます。',
    body: `
<p>ここからは統計検定準1級の範囲を超えた<strong>応用</strong>です。<a href="#/prep1/orthogonal">直交表</a>や要因計画で「どの要因が効くか」を絞ったあと、温度・pH・時間のような<strong>連続要因を細かく変えて最適条件を突き止める</strong>のが応答曲面法（RSM）です。</p>
<p>応答 $y$（収率・分離度など）を、要因の<strong>2次多項式</strong>で近似します。</p>
<p>$$ y = \\beta_0 + \\beta_1 x_1 + \\beta_2 x_2 + \\beta_{11}x_1^2 + \\beta_{22}x_2^2 + \\beta_{12}x_1 x_2 + \\varepsilon $$</p>
<p>2次項 $\\beta_{11},\\beta_{22}$ が曲率（山や谷）を、交互作用項 $\\beta_{12}$ が尾根の「ねじれ」を生みます。係数は<a href="#/prep1/multiple-regression">重回帰（最小二乗）</a>で推定し、曲面を微分して $\\partial y/\\partial x=0$ となる<strong>停留点</strong>を最適候補とします。この2次モデルをうまく推定するための実験点の配置が、次の<a href="#/doe/ccd">中心複合計画</a>です。</p>
<h3>停留点が最適とは限らない（前提と注意）</h3>
<p>2次多項式は<strong>局所的な近似</strong>であって真の応答関数ではありません。ここから3つの注意が出ます。<strong>(1) 停留点の種類を確かめる</strong>：$\\partial y/\\partial x=0$ は最大・最小・<strong>鞍点</strong>のいずれでもあり得ます。2次項の行列（ヘッセ行列）の固有値の符号で判別し（全て負なら最大、混在なら鞍点）、鞍点や「尾根」なら唯一の最適点は存在しません（正準分析）。<strong>(2) 実験領域の外に停留点が出たら外挿してはいけない</strong>：2次近似は調べた範囲でしか信用できず、領域外の予測は根拠がありません——その場合は最急上昇法で有望方向へ<strong>領域ごと移動</strong>して実験し直します。<strong>(3) モデルの当てはまり（ロット・オブ・フィット）を検定</strong>：2次で足りなければ（複雑な曲面）近似が破綻します。RSMは「最適点を1回で当てる」のでなく<strong>逐次的に最適へ近づく探索プロセス</strong>だと捉えるのが正しい姿勢です。</p>
<h3>有意性と実質的な意味</h3>
<p>停留点は推定した係数から計算されるので、<strong>それ自体に不確かさがあります</strong>——「最適はここ」と1点で報告せず、応答の<a href="#/doe/rsm-error">予測信頼区間</a>や、目標を満たす条件の<strong>範囲（デザインスペース）</strong>で示すのが実務（<a href="#/doe/robust">ICH Q8</a>）。また統計的に有意な曲率でも、実際の応答差が工程の要求（分離度や収率の許容幅）に対して小さければ意味がありません。複数の応答（収率と純度）を同時に最適化するには、望ましさ関数（desirability）で折り合いをつけます。<strong>最終的な最適条件は必ず確認実験で再現性を検証</strong>してから採用します。</p>
<div class="note">下は応答曲面を3Dで表示（ドラッグで回転）。最適点の位置・曲率・交互作用を動かすと、なだらかな丘・鋭い峰・ねじれた尾根・鞍点へと地形が変わります。交互作用や曲率で「鞍点」を作ると唯一の最適点が消える様子（停留点＝最適ではない例）を確かめてください。分析化学では収率だけでなく「分離度 Rs を最大化」する条件探索に使います。</div>`,
    demo: {
      heading: '🌐 3D応答曲面（ドラッグで回転）',
      note: '交互作用を入れると尾根が斜めにねじれ、要因を独立に最適化できなくなります。曲率の符号を変えると山（最大）↔谷（最小）が反転。停留点（★）が最適候補です。',
      controls: [
        { type: 'range', id: 'cx', label: '最適点 x₁', min: -1.5, max: 1.5, step: 0.1, value: 0.5 },
        { type: 'range', id: 'cy', label: '最適点 x₂', min: -1.5, max: 1.5, step: 0.1, value: -0.3 },
        { type: 'range', id: 'curv', label: '曲率（山の鋭さ）', min: 0.3, max: 3, step: 0.1, value: 1.2 },
        { type: 'range', id: 'inter', label: '交互作用 β₁₂', min: -2, max: 2, step: 0.2, value: 0.8 },
      ],
      plot(div, p, Plotly) {
        const st = S();
        const cx = p.cx, cy = p.cy, k = p.curv, b12 = p.inter;
        const resp = (x, y) => 90 - k * ((x - cx) ** 2 + (y - cy) ** 2) - b12 * (x - cx) * (y - cy);
        const g = st.linspace(-2, 2, 40);
        const z = g.map(yy => g.map(xx => resp(xx, yy)));
        const data = [{
          type: 'surface', x: g, y: g, z, colorscale: 'Viridis', showscale: false,
          contours: { z: { show: true, usecolormap: true, project: { z: true } } },
        }, {
          type: 'scatter3d', mode: 'markers', x: [cx], y: [cy], z: [resp(cx, cy) + 1],
          marker: { size: 5, color: '#e4572e', symbol: 'diamond' }, name: '停留点',
        }];
        const layout = TH().layout({
          scene: TH().scene({ xaxis: { title: 'x₁（温度など）' }, yaxis: { title: 'x₂（pHなど）' }, zaxis: { title: '応答 y' } }),
          margin: { l: 0, r: 0, t: 6, b: 0 },
        });
        Plotly.react(div, data, layout, TH().config);
      },
    },
  });

  /* --- 6. 中心複合計画・Box-Behnken・回転可能性（Plotly 2D） --- */
  T.push({
    section: 'doe', id: 'ccd', title: '中心複合計画と回転可能性',
    summary: '2次モデルをうまく推定するための実験点の配置。要因点・軸点・中心点をどう置くと「どの方向にも公平な」計画になるかを見ます。',
    body: `
<p>応答曲面（2次モデル）を推定するには、各要因を<strong>3水準以上</strong>で変える必要があります（2水準では曲がりを捉えられない）。代表的な配置が<strong>中心複合計画（CCD）</strong>です。3種類の点を組み合わせます。</p>
<ul>
<li><strong>要因点</strong>（$\\pm1$ の頂点）：主効果と交互作用を推定</li>
<li><strong>軸点（星点）</strong>（$\\pm\\alpha$）：2次項（曲率）を推定</li>
<li><strong>中心点</strong>（0,0）：純誤差の見積もりと曲率の検定（複数回反復）</li>
</ul>

<h3>2次モデルとなぜ3水準か</h3>
<p>CCD が推定するのは<strong>2次（応答曲面）モデル</strong>です。</p>
<p>$$ \\hat y=\\beta_0+\\sum_i\\beta_i x_i+\\sum_i\\beta_{ii}x_i^2+\\sum_{i<j}\\beta_{ij}x_ix_j $$</p>
<p>2乗項 $\\beta_{ii}x_i^2$（曲率）を推定するには、その因子が<strong>3つ以上の異なる水準</strong>を取らねばなりません（2点では直線しか引けない）。要因点 $\\pm1$ だけでは2水準なので、軸点 $\\pm\\alpha$ と中心点 $0$ を足して3水準以上にする——これがCCDが3種類の点を持つ理由です。総実験回数は $2^k$（要因点）＋$2k$（軸点）＋$n_c$（中心点反復）で、$k=2$・中心点4回なら $4+4+4=12$ 回です。</p>

<h3>回転可能性（rotatability）</h3>
<p>軸点の距離を $\\alpha=(2^k)^{1/4}$（2因子なら $\\alpha=\\sqrt{2}\\approx1.414$、3因子なら $1.682$）にすると、<strong>中心から等距離の点はどの向きでも予測分散 $\\mathrm{Var}(\\hat y(\\boldsymbol x))$ が同じ</strong>になります。これを<strong>回転可能</strong>といい、「特定の方向をえこひいきしない」公平な計画です。実際、$k=2$ で $\\alpha=\\sqrt2$ にすると半径1の円周上の予測分散は完全に一定（数値で全点 0.281）ですが、$\\alpha=1$（面心・face-centered）だと同じ円周上で $0.31\\sim0.50$ とばらつき、向きによって精度が変わってしまいます。$\\alpha$ をこの値にすると設計行列のモーメントが等方性の条件を満たす、というのが回転可能性の中身です。因子数が多いときは軸点を使わない<strong>Box-Behnken計画</strong>も使われます（極端な角の条件を避けられる利点）。</p>

<h3>前提条件と、崩れたときの影響</h3>
<table class="simple">
<tr><th>前提</th><th>崩れると起きること</th><th>対処・代替</th></tr>
<tr><td>応答が2次で十分近似できる</td><td>強い高次の曲がりがあると2次モデルがずれ、最適点を外す</td><td>領域を狭める・逐次的に最適点へ移動（最急降下）・3次項</td></tr>
<tr><td>実験領域が箱型（制約なし）</td><td>「その組み合わせは不可能」等の制約があると軸点・角が実現不可</td><td><a href="#/doe/d-optimal">D最適計画</a>など計算による最適配置</td></tr>
<tr><td>中心点を複数反復</td><td>反復がないと純誤差が測れず、当てはまりの悪さ（ロックオブフィット）を検定できない</td><td>中心点を3〜6回反復</td></tr>
<tr><td>因子を $\\pm\\alpha$ まで設定できる</td><td>$\\alpha>1$ は $\\pm1$ より外側。装置や安全上その水準にできないことがある</td><td>面心CCD（$\\alpha=1$、回転可能性は捨てる）・Box-Behnken</td></tr>
</table>

<h3>有意性と実質的な意味</h3>
<p>中心点の反復が生む<strong>純誤差</strong>を基準に、モデルの残差と比べる<strong>ロックオブフィット検定</strong>で「2次モデルで足りているか」を判定します。2乗項 $\\beta_{ii}$ が有意なら<strong>応答に曲がりがある＝最適点が領域の内部にある</strong>合図で、線形モデルの「端が最適」とは結論が変わります。ただし<strong>統計的に曲率あり≠実質的に重要</strong>——反復を増やせば小さな曲率も有意になるので、係数の大きさ（最適条件が中心からどれだけずれるか）を工程の許容幅と比べて判断します。回転可能性も「どの方向にも公平」という設計上の性質であって、それ自体が良い結果を保証するわけではありません。</p>
<div class="note">下で計画の種類と α を切り替えると、実験点の配置が変わります。CCD で α=1.414 にすると要因点と軸点が同じ円周上に並び「回転可能」に。α=1 だと face-centered（立方体の面）になります。点の総数＝実験回数です。</div>`,
    demo: {
      heading: '📐 実験点の配置',
      note: 'CCD は要因点(青)＋軸点(オレンジ)＋中心点(緑)。α=√2 で回転可能（青とオレンジが同一円周＝点線円上）。Box-Behnkenは角を避け、辺の中点＋中心に置きます。',
      controls: [
        { type: 'select', id: 'design', label: '計画', value: 'ccd', options: [
          { value: 'ccd', label: '中心複合計画 (CCD)' },
          { value: 'bb', label: 'Box-Behnken' },
          { value: 'fact', label: '2水準要因計画のみ' },
        ]},
        { type: 'range', id: 'alpha', label: '軸点の距離 α（CCD）', min: 1, max: 2, step: 0.05, value: 1.41 },
        { type: 'range', id: 'center', label: '中心点の反復数', min: 1, max: 6, step: 1, value: 4 },
      ],
      plot(div, p, Plotly) {
        const design = p.design, al = p.alpha;
        let fac = [], ax = [], cen = [];
        if (design === 'ccd') {
          fac = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
          ax = [[-al, 0], [al, 0], [0, -al], [0, al]];
        } else if (design === 'bb') {
          // 2因子ではBox-Behnkenは定義しにくいので、辺の中点で近似的に示す
          fac = [[-1, 0], [1, 0], [0, -1], [0, 1]];
          ax = [];
        } else {
          fac = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
          ax = [];
        }
        for (let i = 0; i < (p.center | 0); i++) cen.push([0, 0]);
        const jitter = cen.map((c, i) => [c[0] + (i - p.center / 2) * 0.04, c[1] + (i % 2 - 0.5) * 0.05]);
        const data = [];
        // 回転可能を示す参照円
        if (design === 'ccd') {
          const th = [], cxr = [], cyr = [];
          for (let a = 0; a <= 60; a++) { const t = a / 60 * 2 * Math.PI; cxr.push(al * Math.cos(t)); cyr.push(al * Math.sin(t)); }
          data.push({ type: 'scatter', mode: 'lines', x: cxr, y: cyr, line: { color: '#c7cdd8', dash: 'dot', width: 1 }, hoverinfo: 'skip', showlegend: false });
        }
        data.push({ type: 'scatter', mode: 'markers', x: fac.map(q => q[0]), y: fac.map(q => q[1]), marker: { size: 12, color: '#4f6df5' }, name: '要因点(±1)' });
        if (ax.length) data.push({ type: 'scatter', mode: 'markers', x: ax.map(q => q[0]), y: ax.map(q => q[1]), marker: { size: 12, color: '#e4572e', symbol: 'diamond' }, name: '軸点(±α)' });
        data.push({ type: 'scatter', mode: 'markers', x: jitter.map(q => q[0]), y: jitter.map(q => q[1]), marker: { size: 10, color: '#2a9d8f' }, name: '中心点×' + (p.center | 0) });
        const total = fac.length + ax.length + (p.center | 0);
        const layout = TH().layout({
          showlegend: true, legend: { x: 1, y: 1, xanchor: 'right', font: { size: 11 } },
          xaxis: { title: 'x₁', range: [-2.2, 2.2], zeroline: true, zerolinecolor: '#e5e8f0' },
          yaxis: { title: 'x₂', range: [-2.2, 2.2], zeroline: true, zerolinecolor: '#e5e8f0', scaleanchor: 'x' },
          margin: { l: 48, r: 12, t: 28, b: 40 },
          title: { text: '総実験回数 = ' + total + ' 回', font: { size: 12.5 }, x: 0.5 },
        });
        Plotly.react(div, data, layout, TH().config);
      },
    },
  });

  /* --- 7. D最適計画 --- */
  T.push({
    section: 'doe', id: 'd-optimal', title: '最適計画（D最適など）',
    summary: '制約があって定型計画が使えないとき、「情報量を最大にする」よう実験点を計算で選ぶ。det(XᵀX) を最大化するD最適基準を見ます。',
    body: `
<p>CCD や Box-Behnken は「きれいな箱型の実験領域」を前提にした定型計画です。ところが現実には<strong>「この組み合わせは実験できない」</strong>という制約や、飛び地の実験領域、予算による回数制限があります。そこで、<strong>情報量が最大になるよう実験点を計算で選ぶ</strong>のが最適計画です。</p>
<h3>D最適基準</h3>
<p>推定精度は<a href="#/prep1/multiple-regression">係数の分散共分散</a> $\\sigma^2(X^\\top X)^{-1}$ で決まります。この「小ささ」を測る代表が行列式で、</p>
<p>$$ \\text{D最適：}\\quad \\det(X^\\top X)\\ \\text{を最大化} $$</p>
<p>これは係数推定の<strong>信頼領域（楕円）の体積を最小</strong>にすることに対応します。<a href="#/prep1/multivariate-normal">係数の信頼楕円</a>の体積は $\\sqrt{\\det((X^\\top X)^{-1})}=1/\\sqrt{\\det(X^\\top X)}$ に比例するので、$\\det(X^\\top X)$ を最大化＝楕円を最小化＝全係数をまとめて最も精密に、という意味になります。ほかにも A最適（分散の和 $\\mathrm{tr}((X^\\top X)^{-1})$）、G最適（最大予測分散）、I最適（平均予測分散）があり、目的で使い分けます。計算は<strong>候補点集合からの交換法（Fedorov）</strong>などで行います。実験点を領域の<strong>端・角に散らす</strong>ほど情報量が増える、というのが基本的な直感です。</p>
<h3>前提と、崩れたときの注意（モデル依存）</h3>
<p>最適計画の最大の注意は<strong>「どのモデルに対して最適か」を先に決めないと計算できない</strong>こと——1次モデル前提のD最適点と、2次モデル前提のそれは違います。だから<strong>仮定したモデルが間違っていると、最適だったはずの配置が最悪になり得ます</strong>。関連して、<strong>実験点を端・角に集めると当てはまりの悪さ（ロット・オブ・フィット）を検出できなくなる</strong>——中間点がないと「本当に2次で足りるのか」を確かめられず、モデル誤りに気づけません。だから実務では純粋なD最適に<strong>中心点・検証点を足して</strong>頑健性と誤差評価を確保します。他の注意：解は候補点集合と回数に依存し交換法は局所最適に落ちうる（複数初期値）、外れ値1点の影響が端点で大きい。<strong>「情報量最大」は仮定モデルの中での最適であって、モデルの正しさは保証しない</strong>と理解するのが肝心です。</p>
<div class="note">下で実験点を中心付近に固めるか、領域の端へ散らすかを「広がり」で調整します。点を端へ散らすほど det(XᵀX) が増え、係数の信頼楕円（右上）が小さく＝推定が精密になります。ただし端に寄せすぎると中間の当てはまりを確かめられずモデル誤りに弱い、というトレードオフも意識してください。</div>`,
    demo: {
      note: '「点の広がり」を上げて実験点を領域の端に散らすほど det(XᵀX) が増え、係数の信頼楕円が縮みます。少ない回数で精度を稼ぐのが最適計画の狙いです。',
      controls: [
        { type: 'range', id: 'spread', label: '実験点の広がり', min: 0.15, max: 1, step: 0.05, value: 0.5 },
        { type: 'range', id: 'runs', label: '実験回数', min: 6, max: 20, step: 1, value: 10 },
        { type: 'button', id: 'reseed', label: '配置を変える' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(900 + (p.reseed | 0) * 37);
        const n = Math.round(p.runs);
        // 実験点を半径 spread 前後で配置（一次モデル x1,x2 の計画行列）
        const pts = [];
        for (let i = 0; i < n; i++) {
          const ang = i / n * 2 * Math.PI + rand() * 0.3;
          const rr = p.spread * (0.8 + 0.4 * rand());
          pts.push([Math.cos(ang) * rr, Math.sin(ang) * rr]);
        }
        // X = [1, x1, x2], XtX
        const X = pts.map(q => [1, q[0], q[1]]);
        const XtX = st.matmul(st.transpose(X), X);
        const det = XtX[0][0] * (XtX[1][1] * XtX[2][2] - XtX[1][2] * XtX[2][1])
          - XtX[0][1] * (XtX[1][0] * XtX[2][2] - XtX[1][2] * XtX[2][0])
          + XtX[0][2] * (XtX[1][0] * XtX[2][1] - XtX[1][1] * XtX[2][0]);
        const pl = Pl.make(canvas, { xmin: -1.2, xmax: 1.2, ymin: -1.2, ymax: 1.2 });
        pl.clear(); pl.axes({ xLabel: 'x₁', yLabel: 'x₂' });
        // 実験可能領域（単位円）
        const circ = []; for (let a = 0; a <= 60; a++) { const t = a / 60 * 2 * Math.PI; circ.push([Math.cos(t), Math.sin(t)]); }
        pl.polygon(circ, { stroke: Pl.gray, width: 1, dash: [4, 4] });
        pl.scatter(pts, { color: Pl.colors[0], r: 6, alpha: 0.85 });
        // 係数の信頼楕円: (XtX)^{-1} の (x1,x2) 部分
        const inv = st.inverse(XtX);
        const sub = [[inv[1][1], inv[1][2]], [inv[2][1], inv[2][2]]];
        const e = st.eigSym(sub);
        const cxp = 0.7, cyp = 0.7, sc = 0.25;
        const ell = [];
        for (let a = 0; a <= 60; a++) { const t = a / 60 * 2 * Math.PI; const s1 = Math.sqrt(e.values[0]) * Math.cos(t), s2 = Math.sqrt(e.values[1]) * Math.sin(t); ell.push([cxp + sc * (s1 * e.vectors[0][0] + s2 * e.vectors[1][0]), cyp + sc * (s1 * e.vectors[0][1] + s2 * e.vectors[1][1])]); }
        pl.polygon(ell, { stroke: Pl.colors[1], fill: Pl.colors[1], alpha: 0.15, width: 2 });
        pl.text(0.72, 1.05, '係数の信頼楕円', { align: 'center', baseline: 'bottom', color: Pl.colors[1], size: 11 });
        pl.text(-1.2, 1.2, 'det(XᵀX) = ' + det.toFixed(3) + '（大きいほど精密）', { align: 'left', baseline: 'top', dx: 60, dy: 4, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- 8. ロバスト最適化と設計空間（ICH Q8） --- */
  T.push({
    section: 'doe', id: 'robust', title: 'ロバスト最適化と設計空間（ICH Q8）',
    summary: '「応答が最大の点」より「多少ばらついても規格を外さない範囲」を選ぶ考え方。医薬品品質の設計空間（Design Space）に直結します。',
    body: `
<p>応答が最大の点（ピーク）がピンポイントの尖った峰の上にあると、要因がわずかにずれただけで応答が急落します。実務では、応答の高さだけでなく<strong>「変動に対する頑健さ（ロバストネス）」</strong>が重要です。</p>
<p>医薬品の品質保証では ICH Q8 が<strong>設計空間（Design Space）</strong>を「品質が保証される要因の範囲」と定めます。日々の運転では原料ロット・室温・装置差などで操作点は必ず少し揺れます。だから狙うべきは、規格を満たす領域の<strong>ふち（境界）ではなく“真ん中”</strong>です。境界に近い点を選ぶと、少しの揺れで規格外へ落ちてしまいます。</p>
<h3>考え方</h3>
<ul>
<li>応答曲面と<strong>規格の下限</strong>を重ね、規格を満たす領域（＝設計空間）を求める。</li>
<li>その領域の<strong>境界から最も離れた点（マージン最大）</strong>を常用の操作点にする。</li>
<li>単純な山なら操作点はピークと一致しますが、<strong>交互作用で尾根がねじれる</strong>と設計空間は細長くゆがみ、「余裕のある方向／ない方向」が生まれます。細い方向のばらつきほど危険です。</li>
</ul>
<div class="note">下の緑の領域が「規格を満たす」設計空間です。規格（下限）を厳しくすると領域がみるみる痩せ、余裕がなくなります。交互作用を強めると領域が斜めに細長くゆがみ、細い方向へのばらつきに弱くなる＝その方向の管理を厳しくすべき、と読み取れます。★は領域の中央（最も余裕のある操作点）です。</div>`,
    demo: {
      heading: '🗺 設計空間（合格領域）',
      note: '緑が規格を満たす設計空間。★はその中央（最も余裕のある操作点）。規格を厳しくすると領域が痩せ、交互作用を強めると斜めに細長くなります。細い方向のばらつきが要注意です。',
      controls: [
        { type: 'range', id: 'spec', label: '規格の下限（合格ライン）', min: 60, max: 88, step: 1, value: 75 },
        { type: 'range', id: 'inter', label: '交互作用（尾根のねじれ）', min: -2, max: 2, step: 0.2, value: 1 },
        { type: 'range', id: 'curv', label: '峰の鋭さ', min: 0.5, max: 3, step: 0.1, value: 1.4 },
      ],
      plot(div, p, Plotly) {
        const st = S();
        const cx = 0.3, cy = -0.2, k = p.curv, b12 = p.inter;
        const resp = (x, y) => 90 - k * ((x - cx) ** 2 + (y - cy) ** 2) - b12 * (x - cx) * (y - cy);
        const g = st.linspace(-2, 2, 70);
        const z = g.map(yy => g.map(xx => resp(xx, yy)));
        // 合格領域マスク（規格以上を1）: 緑で塗る
        const mask = g.map(yy => g.map(xx => resp(xx, yy) >= p.spec ? 1 : 0));
        const data = [
          // 応答の等高線（線のみ、文脈）
          { type: 'contour', x: g, y: g, z, showscale: false, contours: { start: 55, end: 90, size: 4, coloring: 'lines' }, line: { color: '#c7cdd8', width: 1 }, hoverinfo: 'skip' },
          // 設計空間（緑の塗り）
          { type: 'heatmap', x: g, y: g, z: mask, showscale: false, colorscale: [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,255,255,0)'], [0.5001, 'rgba(42,157,143,0.28)'], [1, 'rgba(42,157,143,0.28)']], zmin: 0, zmax: 1, hoverinfo: 'skip' },
          // 規格ライン
          { type: 'contour', x: g, y: g, z, showscale: false, contours: { start: p.spec, end: p.spec, size: 1, coloring: 'none' }, line: { color: '#1d2433', width: 2.5 }, hoverinfo: 'skip' },
          // 操作点★（設計空間の中央 = 応答ピーク）
          { type: 'scatter', mode: 'markers+text', x: [cx], y: [cy], marker: { size: 13, color: '#fff', line: { color: '#e4572e', width: 2 }, symbol: 'star' }, text: ['★'], textposition: 'top center', textfont: { color: '#e4572e' }, showlegend: false, hoverinfo: 'skip' },
        ];
        // 合格面積の割合を表示
        let inCount = 0, tot = 0;
        for (const row of mask) for (const v of row) { tot++; if (v) inCount++; }
        const pct = (inCount / tot * 100).toFixed(0);
        const layout = TH().layout({
          xaxis: { title: 'x₁', range: [-2, 2] },
          yaxis: { title: 'x₂', range: [-2, 2], scaleanchor: 'x' },
          margin: { l: 48, r: 12, t: 28, b: 40 },
          title: { text: '設計空間（緑）= 実験領域の ' + pct + '%', font: { size: 12.5 }, x: 0.5 },
        });
        Plotly.react(div, data, layout, TH().config);
      },
    },
  });

  /* --- 9. 誤差の伝搬でRs（分離度）の信頼区間 --- */
  T.push({
    section: 'doe', id: 'rsm-error', title: '誤差の伝搬とモンテカルロで応答の信頼区間',
    summary: '推定した応答曲面の「予測値」にも不確かさがあります。係数の共分散をモンテカルロで伝搬し、最適点での応答の信頼区間を出します。',
    body: `
<p>応答曲面から「最適点での予測応答（例：分離度 Rs）」を1つの数字で報告するのは危険です。係数 $\\hat{\\boldsymbol\\beta}$ 自体に推定誤差があるので、<strong>予測値にも不確かさ</strong>があります。これを見積もる実務的な方法が2つあります。</p>
<h3>① デルタ法（解析）</h3>
<p><a href="#/prep1/delta-method">デルタ法</a>を多変数に拡張すると、予測 $\\hat{y}(\\boldsymbol{x})=\\boldsymbol{f}(\\boldsymbol{x})^\\top\\hat{\\boldsymbol\\beta}$ の分散は</p>
<p>$$ \\mathrm{Var}(\\hat y)=\\boldsymbol{f}^\\top\\,\\mathrm{Var}(\\hat{\\boldsymbol\\beta})\\,\\boldsymbol{f}=\\sigma^2\\,\\boldsymbol{f}^\\top(X^\\top X)^{-1}\\boldsymbol{f} $$</p>
<h3>② モンテカルロ（数値）</h3>
<p>係数を<a href="#/prep1/multivariate-normal">多変量正規分布</a> $\\hat{\\boldsymbol\\beta}\\sim\\mathcal N(\\hat{\\boldsymbol\\beta},\\ \\mathrm{Var}(\\hat{\\boldsymbol\\beta}))$ から何千回もサンプリングし、そのつど応答（Rs など）を計算して分布を作ります。非線形な応答（保持時間 $t_R$ から計算する Rs など）でも、そのまま扱えるのが強みです。分布の 2.5%〜97.5% 点が 95% 信頼区間です。</p>
<h3>2つの方法の使い分け（前提と注意）</h3>
<p>デルタ法とモンテカルロは同じ問いに答えますが、前提が違います。<strong>デルタ法は速いが1次近似</strong>——応答が係数に対して<strong>強く非線形</strong>だと（Rs のように比や差の関数）、接線近似が外れて分散を誤り、対称な区間が実際の非対称な分布と合いません（<a href="#/prep1/delta-method">デルタ法の限界</a>そのもの）。<strong>モンテカルロは重いが柔軟</strong>で、非線形でも分布の形（歪み）ごと得られるので、応答が複雑な RSM では基本こちらが安全です。共通の前提として、<strong>(1) 係数の共分散 $\\sigma^2(X^\\top X)^{-1}$ の $\\sigma^2$ 推定が正しいこと</strong>（実験の誤差分散を過小評価すると区間が狭すぎる）、<strong>(2) この区間は「モデルが正しいと仮定した上での」係数由来の不確かさだけ</strong>——モデル自体の誤り（2次で足りない等）や外挿の危険は含みません。区間はあくまで「同じモデル内のばらつき」で、モデル選択の不確かさは別に考えます。</p>
<div class="note">下は、係数の不確かさをモンテカルロで伝搬させた「最適点での応答」の分布。測定ノイズ（誤差分散）を上げると分布が広がり、信頼区間が広くなります。応答が非線形だと分布が左右非対称になる（デルタ法の対称区間では捉えきれない）ことも確かめてください。「最適条件はここ、ただし応答は 82±3」のように幅つきで報告するのが誠実な姿勢です。</div>`,
    demo: {
      note: '応答の点推定（縦線）は同じでも、測定ノイズが増えると分布が広がり信頼区間が広くなります。実験回数を増やすと逆に狭まります。点推定だけでなく幅で語るための計算です。',
      controls: [
        { type: 'range', id: 'noise', label: '測定ノイズ σ', min: 0.5, max: 6, step: 0.5, value: 2 },
        { type: 'range', id: 'runs', label: '実験回数', min: 8, max: 40, step: 2, value: 16 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(950 + (p.reseed | 0) * 43);
        const n = Math.round(p.runs);
        // 応答曲面の真値 y = 80 + 6 x1 - 4 x1^2 - 3 x2^2 + 2 x1 x2 (最適点付近)
        const trueBeta = [80, 6, 0, -4, -3, 2]; // 1, x1, x2, x1^2, x2^2, x1x2
        const basis = (x1, x2) => [1, x1, x2, x1 * x1, x2 * x2, x1 * x2];
        // 実験点（簡易CCD風）
        const design = [[-1, -1], [1, -1], [-1, 1], [1, 1], [-1.41, 0], [1.41, 0], [0, -1.41], [0, 1.41], [0, 0], [0, 0]];
        const pts = [];
        for (let i = 0; i < n; i++) pts.push(design[i % design.length]);
        const X = pts.map(q => basis(q[0], q[1]));
        const y = pts.map(q => st.dot(basis(q[0], q[1]), trueBeta) + p.noise * st.randn(rand));
        // OLS
        const Xt = st.transpose(X);
        const XtX = st.matmul(Xt, X);
        let beta, XtXinv;
        try {
          XtXinv = st.inverse(XtX);
          beta = st.matvec(XtXinv, st.matvec(Xt, y));
        } catch (e) { beta = trueBeta; XtXinv = st.inverse(st.matmul(Xt, X)); }
        // 残差分散
        let rss = 0; for (let i = 0; i < n; i++) rss += (y[i] - st.dot(X[i], beta)) ** 2;
        const sigma2 = rss / Math.max(1, n - 6);
        // 最適点（真の最適に近い固定点）での予測をモンテカルロ
        const xstar = basis(0.9, 0.3);
        // Var(yhat) = sigma2 * f' (XtX)^-1 f
        const tmp = st.matvec(XtXinv, xstar);
        const predVar = sigma2 * st.dot(xstar, tmp);
        const predMean = st.dot(xstar, beta);
        const sims = [];
        for (let s = 0; s < 3000; s++) sims.push(predMean + Math.sqrt(Math.max(1e-9, predVar)) * st.randn(rand));
        sims.sort((a, b) => a - b);
        const lo = sims[Math.floor(3000 * 0.025)], hi = sims[Math.floor(3000 * 0.975)];
        const bmin = sims[30], bmax = sims[2970];
        const bins = st.histogram(sims, 40, bmin, bmax);
        const ymax = Math.max.apply(null, bins.map(b => b.count)) * 1.15 || 1;
        const pl = Pl.make(canvas, { xmin: bmin, xmax: bmax, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: '最適点での予測応答', yLabel: '回数' });
        const ctx = pl.ctx;
        ctx.fillStyle = 'rgba(228,87,46,0.10)';
        ctx.fillRect(pl.X(lo), pl.pad.top, pl.X(hi) - pl.X(lo), pl.H - pl.pad.top - pl.pad.bottom);
        pl.bars(bins.map(b => ({ x0: b.x0, x1: b.x1, y: b.count })), { color: Pl.colors[0], alpha: 0.6 });
        pl.vline(predMean, { color: Pl.ink, dash: [], label: '点推定 ' + predMean.toFixed(1) });
        pl.text(bmax, ymax, '95%CI = [' + lo.toFixed(1) + ', ' + hi.toFixed(1) + ']', { align: 'right', baseline: 'top', dx: -8, dy: 6, color: Pl.colors[1], size: 12.5 });
        pl.text(bmax, ymax, '幅 = ' + (hi - lo).toFixed(1), { align: 'right', baseline: 'top', dx: -8, dy: 26, color: '#475467', size: 12 });
      },
    },
  });
})();
