'use strict';
/* 実験計画法 */
(function () {
  const T = (window.STATS_TOPICS = window.STATS_TOPICS || []);
  const S = () => window.Stats;
  const P = () => window.Plot;

  /* --- 1. 実験計画の3原則 --- */
  T.push({
    section: 'doe', id: 'principles', title: '実験計画の3原則',
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
    section: 'doe', id: 'anova1', title: '一元配置分散分析（ANOVA）',
    summary: '3群以上の平均を比べる分散分析を、「群間のばらつき」と「群内のばらつき」の比（F値）として視覚化します。',
    body: `
<p>3つ以上の水準（群）の平均に差があるかを調べるのが<strong>分散分析</strong>です。全体のばらつき（総平方和）を「群間」と「群内（誤差）」に分解します。</p>
<p>$$ \\underbrace{SS_T}_{\\text{総}} = \\underbrace{SS_B}_{\\text{群間}} + \\underbrace{SS_W}_{\\text{群内}} $$</p>
<p>それぞれを自由度で割った平均平方の比が $F$ 値です。</p>
<p>$$ F = \\frac{SS_B/(k-1)}{SS_W/(N-k)} = \\frac{\\text{群間の分散}}{\\text{群内の分散}} $$</p>
<p>群間のばらつき（平均どうしの離れ具合）が、群内のばらつき（各群内のノイズ）に比べて大きいほど $F$ 値は大きくなり、「平均に差がある」と判断されます。</p>
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
    section: 'doe', id: 'interaction', title: '二元配置と交互作用',
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
    section: 'doe', id: 'orthogonal', title: '直交表による効率的な実験',
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
<div class="note">下は L8 直交表を使った実験のシミュレーション。各因子の真の効果をスライダーで設定すると、8回の実験結果から「要因効果図」が推定されます。設定した効果が、少ない実験からきちんと復元されることを確認してください。</div>`,
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

  /* --- 5. 応答曲面法 --- */
  T.push({
    section: 'doe', id: 'rsm', title: '応答曲面法（最適条件の探索）',
    summary: '2要因を連続的に変えて「応答（収率など）が最大になる条件」を等高線で探る方法を、地形図のように可視化します。',
    body: `
<p><strong>応答曲面法（RSM）</strong>は、温度・時間のような連続要因を変えたときの応答（収率・強度など）を2次式で近似し、最適条件を探す手法です。</p>
<p>$$ y = \\beta_0 + \\beta_1 x_1 + \\beta_2 x_2 + \\beta_{11}x_1^2 + \\beta_{22}x_2^2 + \\beta_{12}x_1 x_2 $$</p>
<p>2次項があることで、応答曲面は「山（最大値をもつ丘）」や「谷」「鞍点」といった曲面になります。等高線図で見れば、まさに地形図の等高線を読むように<strong>頂上（最適点）</strong>の位置が分かります。</p>
<div class="note">下は収率の応答曲面。温度と時間の最適な組み合わせ（★）を、等高線の中心として探します。曲面の形（相関・鋭さ）を動かして、最適点がどう動くかを見てください。実務では実験点をこの曲面にフィットさせて頂上を推定します。</div>`,
    demo: {
      note: '明るい（黄色い）領域ほど応答が高い。★が推定される最適条件。相関を入れると等高線が斜めの楕円になり、要因が独立でないことを表します。',
      controls: [
        { type: 'range', id: 'optx', label: '最適な温度（中心）', min: -2, max: 2, step: 0.2, value: 0.6 },
        { type: 'range', id: 'opty', label: '最適な時間（中心）', min: -2, max: 2, step: 0.2, value: -0.4 },
        { type: 'range', id: 'corr', label: '要因間の相関', min: -0.9, max: 0.9, step: 0.1, value: 0.4 },
        { type: 'range', id: 'sharp', label: '山の鋭さ', min: 0.2, max: 2, step: 0.1, value: 0.8 },
      ],
      draw(canvas, p) {
        const Pl = P();
        const canvasEl = canvas;
        const dpr = window.devicePixelRatio || 1;
        const W = canvasEl.clientWidth, H = canvasEl.clientHeight;
        canvasEl.width = Math.round(W * dpr); canvasEl.height = Math.round(H * dpr);
        const ctx = canvasEl.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        const pad = { left: 52, right: 16, top: 16, bottom: 40 };
        const iw = W - pad.left - pad.right, ih = H - pad.top - pad.bottom;
        const xmin = -3, xmax = 3, ymin = -3, ymax = 3;
        const cx = p.optx, cy = p.opty, r = p.corr, s = p.sharp;
        // 応答 = exp(-Q/2), Q は二次形式（共分散の逆行列由来）
        const det = 1 - r * r;
        const resp = (X, Y) => {
          const dx = (X - cx), dy = (Y - cy);
          const q = (dx * dx - 2 * r * dx * dy + dy * dy) / det * s;
          return Math.exp(-q / 2);
        };
        // ヒートマップ
        const cols = 90, rows = 60;
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const X = xmin + (xmax - xmin) * (i + 0.5) / cols;
            const Y = ymax - (ymax - ymin) * (j + 0.5) / rows;
            const v = resp(X, Y); // 0..1
            // viridis 風の簡易カラーマップ
            const rr = Math.round(70 + 185 * v);
            const gg = Math.round(30 + 200 * Math.sqrt(v));
            const bb = Math.round(120 - 90 * v + 30);
            ctx.fillStyle = 'rgb(' + rr + ',' + Math.min(255, gg) + ',' + Math.max(0, bb) + ')';
            const px = pad.left + iw * i / cols, py = pad.top + ih * j / rows;
            ctx.fillRect(Math.floor(px), Math.floor(py), Math.ceil(iw / cols) + 1, Math.ceil(ih / rows) + 1);
          }
        }
        // 等高線（数レベル）
        const X = v => pad.left + ((v - xmin) / (xmax - xmin)) * iw;
        const Y = v => pad.top + ih - ((v - ymin) / (ymax - ymin)) * ih;
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
        for (const lv of [0.2, 0.4, 0.6, 0.8]) {
          ctx.beginPath();
          for (let a = 0; a <= 60; a++) {
            // 楕円近似で等高線を描く: Q = -2 ln(lv)
            const t = a / 60 * Math.PI * 2;
            const R = Math.sqrt(-2 * Math.log(lv) * det / s);
            // 楕円の主軸回転（相関に応じて）
            const ex = R * Math.cos(t), ey = R * Math.sin(t);
            const ang = Math.PI / 4 * Math.sign(r) * (Math.abs(r) > 0.05 ? 1 : 0);
            const gx = cx + ex * Math.cos(ang) - ey * Math.sin(ang) * (1 + Math.abs(r));
            const gy = cy + ex * Math.sin(ang) * (1 + Math.abs(r)) + ey * Math.cos(ang);
            if (a === 0) ctx.moveTo(X(gx), Y(gy)); else ctx.lineTo(X(gx), Y(gy));
          }
          ctx.stroke();
        }
        // 軸
        ctx.strokeStyle = '#c7cdd8'; ctx.lineWidth = 1;
        ctx.strokeRect(pad.left, pad.top, iw, ih);
        ctx.fillStyle = '#66708a'; ctx.font = '11.5px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        for (const t of [-2, -1, 0, 1, 2]) ctx.fillText(String(t), X(t), pad.top + ih + 6);
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        for (const t of [-2, -1, 0, 1, 2]) ctx.fillText(String(t), pad.left - 6, Y(t));
        ctx.fillStyle = '#475467'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
        ctx.fillText('温度（標準化）', pad.left + iw, H - 2);
        ctx.save(); ctx.translate(12, pad.top + ih / 2); ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center'; ctx.fillText('時間（標準化）', 0, 0); ctx.restore();
        // 最適点 ★
        ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1d2433'; ctx.lineWidth = 1.5;
        ctx.font = '20px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('★', X(cx), Y(cy));
        ctx.strokeStyle = '#1d2433';
        ctx.fillStyle = '#1d2433'; ctx.font = '12px sans-serif'; ctx.textBaseline = 'bottom';
        ctx.fillText('最適 (' + cx.toFixed(1) + ', ' + cy.toFixed(1) + ')', X(cx), Y(cy) - 14);
      },
    },
  });
})();
