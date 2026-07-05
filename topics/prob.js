'use strict';
/* 確率と確率変数の基礎（準1級 範囲表「確率と確率変数」を網羅） */
(function () {
  const T = (window.STATS_TOPICS = window.STATS_TOPICS || []);
  const S = () => window.Stats;
  const P = () => window.Plot;

  /* --- 事象と確率・包除原理・独立 --- */
  T.push({
    section: 'prep1', group: '確率と確率変数', id: 'events-probability', title: '事象と確率・包除原理',
    summary: '確率の加法定理・乗法定理・包除原理・統計的独立を、2つの事象の重なりを動かして目で確かめます。',
    body: `
<p>標本空間 $\\Omega$ の部分集合を<strong>事象</strong>と呼び、確率 $P$ は次の公理を満たします（コルモゴロフの公理）。</p>
<p>$$ 0\\le P(A)\\le 1,\\quad P(\\Omega)=1,\\quad A\\cap B=\\varnothing \\Rightarrow P(A\\cup B)=P(A)+P(B) $$</p>
<h3>加法定理と包除原理</h3>
<p>重なりがある場合は、重複して数えた分 $P(A\\cap B)$ を引きます。</p>
<p>$$ P(A\\cup B)=P(A)+P(B)-P(A\\cap B) $$</p>
<p>3事象なら $P(A\\cup B\\cup C)=\\sum P(A)-\\sum P(A\\cap B)+P(A\\cap B\\cap C)$。足して・引いて・足す、が<strong>包除原理</strong>です。</p>
<h3>乗法定理と独立</h3>
<p>$$ P(A\\cap B)=P(A)\\,P(B\\mid A) $$</p>
<p>特に $P(A\\cap B)=P(A)P(B)$ が成り立つとき、$A$ と $B$ は<strong>統計的に独立</strong>。独立とは「一方が起きても他方の確率が変わらない」ことです。</p>
<div class="note">下の図で $P(A)$・$P(B)$ と重なり $P(A\\cap B)$ を動かし、和事象・条件付き確率・独立条件がどう変わるかを見てください。重なりを「$P(A)P(B)$」に一致させると独立になります。</div>`,
    demo: {
      note: '重なり P(A∩B) を P(A)×P(B) に近づけると「独立」の表示になります。和事象は重なりを引いた面積であることに注目。',
      controls: [
        { type: 'range', id: 'pa', label: 'P(A)', min: 0.1, max: 0.9, step: 0.05, value: 0.5 },
        { type: 'range', id: 'pb', label: 'P(B)', min: 0.1, max: 0.9, step: 0.05, value: 0.4 },
        { type: 'range', id: 'pab', label: 'P(A∩B)', min: 0, max: 0.4, step: 0.02, value: 0.2 },
      ],
      draw(canvas, p) {
        const Pl = P();
        const dpr = window.devicePixelRatio || 1;
        const W = canvas.clientWidth, H = canvas.clientHeight;
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        const pa = p.pa, pb = p.pb;
        const pabMax = Math.min(pa, pb);
        const pab = Math.min(p.pab, pabMax);
        // ベン図（面積は概念図・比率で表現）
        const cy = H * 0.42;
        const rA = 78, rB = 70;
        const overlap = pab / pabMax; // 0..1
        const gap = (rA + rB) * (1 - 0.72 * overlap);
        const cxA = W / 2 - gap / 2, cxB = W / 2 + gap / 2;
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = '#4f6df5';
        ctx.beginPath(); ctx.arc(cxA, cy, rA, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e4572e';
        ctx.beginPath(); ctx.arc(cxB, cy, rB, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#4f6df5'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cxA, cy, rA, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#e4572e';
        ctx.beginPath(); ctx.arc(cxB, cy, rB, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#1d2433'; ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('A', cxA - rA * 0.5, cy - rA * 0.5);
        ctx.fillText('B', cxB + rB * 0.5, cy - rB * 0.5);
        // 計算表
        const punion = pa + pb - pab;
        const pBgivenA = pab / pa;
        const indep = pa * pb;
        const isIndep = Math.abs(pab - indep) < 0.012;
        ctx.font = '13.5px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        const lines = [
          ['P(A∪B) = P(A)+P(B)−P(A∩B) = ', punion.toFixed(3), '#1d2433'],
          ['P(B|A) = P(A∩B)/P(A) = ', pBgivenA.toFixed(3), '#1d2433'],
          ['独立なら P(A∩B)=P(A)P(B) = ', indep.toFixed(3), '#66708a'],
          [isIndep ? '→ ほぼ独立（一方が他方の確率を変えない）' : '→ 独立ではない（関連あり）', '', isIndep ? '#2a9d8f' : '#e4572e'],
        ];
        let y = H - 96;
        for (const [t, v, c] of lines) { ctx.fillStyle = c; ctx.fillText(t + v, 24, y); y += 22; }
      },
    },
  });

  /* --- 条件付き確率とベイズの定理 --- */
  T.push({
    section: 'prep1', group: '確率と確率変数', id: 'conditional-bayes', title: '条件付き確率とベイズの定理',
    summary: '検査の「陽性」から「本当に病気である確率」を、有病率・感度・特異度を動かして求め、直感が外れやすい理由（基準率の錯誤）を体感します。',
    body: `
<p><strong>条件付き確率</strong> $P(A\\mid B)=\\dfrac{P(A\\cap B)}{P(B)}$ は「$B$ が起きたと分かったうえでの $A$ の確率」。ここから<strong>ベイズの定理</strong>が導かれます。</p>
<p>$$ P(H\\mid D)=\\frac{P(D\\mid H)\\,P(H)}{P(D)},\\qquad P(D)=\\sum_i P(D\\mid H_i)P(H_i)\\ (\\text{全確率の公式}) $$</p>
<p>病気 $H$・陽性 $D$ の例では、事前確率＝有病率 $P(H)$、感度 $P(D\\mid H)$、特異度 $P(\\bar D\\mid \\bar H)$ から、</p>
<p>$$ P(H\\mid D)=\\frac{\\text{感度}\\cdot\\text{有病率}}{\\text{感度}\\cdot\\text{有病率}+(1-\\text{特異度})(1-\\text{有病率})} $$</p>
<div class="note">有病率が低いと、感度・特異度が高くても「陽性→実際に病気」の確率（陽性的中率）は驚くほど低くなります。これが<strong>基準率の錯誤</strong>。下で有病率を下げて確かめてください。</div>`,
    demo: {
      note: '有病率を1%まで下げると、感度95%・特異度95%でも陽性的中率は2割以下。分母に「偽陽性の大群」が入るためです。1000人の内訳バーで確認できます。',
      controls: [
        { type: 'range', id: 'prev', label: '有病率 P(H) (%)', min: 0.5, max: 50, step: 0.5, value: 1 },
        { type: 'range', id: 'sens', label: '感度 P(陽性|病気) (%)', min: 50, max: 100, step: 1, value: 95 },
        { type: 'range', id: 'spec', label: '特異度 P(陰性|健康) (%)', min: 50, max: 100, step: 1, value: 95 },
      ],
      draw(canvas, p) {
        const Pl = P();
        const dpr = window.devicePixelRatio || 1;
        const W = canvas.clientWidth, H = canvas.clientHeight;
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        const prev = p.prev / 100, sens = p.sens / 100, spec = p.spec / 100;
        const N = 1000;
        const sick = N * prev, healthy = N - sick;
        const TP = sick * sens, FN = sick - TP;
        const TN = healthy * spec, FP = healthy - TN;
        const ppv = TP / (TP + FP || 1);
        // 1000人を格子で表示（10x100）: TP=赤, FP=橙, TN=薄灰, FN=濃赤
        const cols = 50, rows = 20, cell = Math.min((W - 40) / cols, (H - 150) / rows);
        const x0 = (W - cols * cell) / 2, y0 = 12;
        let idx = 0;
        const cats = [
          { n: Math.round(TP), c: '#e4572e' },      // 真陽性
          { n: Math.round(FP), c: '#f4a261' },      // 偽陽性
          { n: Math.round(FN), c: '#9b2226' },      // 偽陰性
          { n: N - Math.round(TP) - Math.round(FP) - Math.round(FN), c: '#e5e8f0' }, // 真陰性
        ];
        for (const cat of cats) {
          for (let k = 0; k < cat.n && idx < N; k++, idx++) {
            const r = Math.floor(idx / cols), c = idx % cols;
            ctx.fillStyle = cat.c;
            ctx.fillRect(x0 + c * cell, y0 + r * cell, cell - 1, cell - 1);
          }
        }
        const ly = y0 + rows * cell + 16;
        ctx.font = '12.5px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        const leg = [['真陽性 (病気&陽性)', '#e4572e'], ['偽陽性 (健康&陽性)', '#f4a261'], ['偽陰性', '#9b2226'], ['真陰性', '#e5e8f0']];
        let lx = x0;
        for (const [t, c] of leg) {
          ctx.fillStyle = c; ctx.fillRect(lx, ly - 6, 12, 12);
          ctx.fillStyle = '#475467'; ctx.fillText(t, lx + 16, ly);
          lx += ctx.measureText(t).width + 40;
        }
        ctx.font = 'bold 15px sans-serif'; ctx.fillStyle = '#1d2433'; ctx.textAlign = 'center';
        ctx.fillText('陽性的中率 P(病気|陽性) = 真陽性 / (真陽性+偽陽性) = ' + (ppv * 100).toFixed(1) + '%',
          W / 2, ly + 30);
        ctx.font = '12.5px sans-serif'; ctx.fillStyle = '#66708a';
        ctx.fillText('陽性者 ' + Math.round(TP + FP) + '人のうち、本当に病気は ' + Math.round(TP) + '人だけ',
          W / 2, ly + 52);
      },
    },
  });

  /* --- 確率変数・pdf・cdf・生存関数 --- */
  T.push({
    section: 'prep1', group: '確率と確率変数', id: 'random-variables', title: '確率関数・密度関数・分布関数・生存関数',
    summary: '確率質量関数(pmf)・確率密度関数(pdf)・累積分布関数(cdf)・生存関数の関係を、同じ分布の3つの見方として並べて理解します。',
    body: `
<p>確率変数の分布は、いくつかの「関数」で表せます。互いに変換でつながっています。</p>
<table class="simple">
<tr><th>関数</th><th>離散</th><th>連続</th><th>意味</th></tr>
<tr><td>確率関数 / 密度関数</td><td>$p(x)=P(X=x)$</td><td>$f(x)$</td><td>その値の「起こりやすさ」</td></tr>
<tr><td>累積分布関数 $F(x)$</td><td>$\\sum_{t\\le x}p(t)$</td><td>$\\int_{-\\infty}^{x}f(t)dt$</td><td>$P(X\\le x)$。単調増加で0→1</td></tr>
<tr><td>生存関数 $S(x)$</td><td colspan="2">$1-F(x)=P(X>x)$</td><td>「$x$ を超える」確率</td></tr>
</table>
<p>連続分布では $f(x)=F'(x)$（密度は分布関数の傾き）。密度そのものは確率ではなく、<strong>面積</strong>が確率です：$P(a<X\\le b)=F(b)-F(a)=\\int_a^b f\\,dx$。</p>
<div class="note">下で分布と閾値 $x$ を動かし、密度の下の面積（＝cdf）と、右裾の面積（＝生存関数）が対応していることを見てください。生存関数は信頼性工学や生存時間解析で主役になります。</div>`,
    demo: {
      note: '縦線 x を動かすと、左の塗り面積が F(x)=P(X≤x)、右の塗り面積が S(x)=1−F(x)。密度のピークの高さは確率ではない点に注意。',
      controls: [
        { type: 'select', id: 'dist', label: '分布', value: 'normal', options: [
          { value: 'normal', label: '正規分布' },
          { value: 'exp', label: '指数分布' },
        ]},
        { type: 'range', id: 'x', label: '閾値 x', min: -3, max: 6, step: 0.1, value: 0.5 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const isExp = p.dist === 'exp';
        const xmin = isExp ? 0 : -4, xmax = 6;
        const pdf = x => isExp ? (x < 0 ? 0 : Math.exp(-x)) : st.normalPdf(x, 1, 1.2);
        const cdf = x => isExp ? (x < 0 ? 0 : 1 - Math.exp(-x)) : st.normalCdf(x, 1, 1.2);
        const xs = st.linspace(xmin, xmax, 240);
        const pl = Pl.make(canvas, { xmin, xmax, ymin: 0, ymax: isExp ? 1.05 : 0.38 });
        pl.clear(); pl.axes({ xLabel: 'x', yLabel: '密度 f(x)' });
        const xc = Math.max(xmin, Math.min(xmax, p.x));
        const left = xs.filter(x => x <= xc).map(x => [x, pdf(x)]);
        const right = xs.filter(x => x >= xc).map(x => [x, pdf(x)]);
        if (left.length) pl.fillUnder(left, { color: '#4f6df5', alpha: 0.3 });
        if (right.length) pl.fillUnder(right, { color: '#e4572e', alpha: 0.22 });
        pl.line(xs.map(x => [x, pdf(x)]), { color: Pl.ink, width: 2 });
        pl.vline(xc, { color: Pl.gray, label: 'x=' + xc.toFixed(1) });
        pl.text(xmax, isExp ? 1.05 : 0.38, 'F(x)=P(X≤x)=' + cdf(xc).toFixed(3), { align: 'right', baseline: 'top', dx: -8, dy: 6, color: '#4f6df5', size: 13 });
        pl.text(xmax, isExp ? 1.05 : 0.38, 'S(x)=P(X>x)=' + (1 - cdf(xc)).toFixed(3), { align: 'right', baseline: 'top', dx: -8, dy: 26, color: '#e4572e', size: 13 });
      },
    },
  });

  /* --- 同時分布・周辺分布・条件付き分布 --- */
  T.push({
    section: 'prep1', group: '確率と確率変数', id: 'joint-distribution', title: '同時分布・周辺分布・条件付き分布',
    summary: '2変数の同時分布から、周辺分布（片方に潰す）と条件付き分布（片方を固定して切る）がどう得られるかを、格子と断面で見ます。',
    body: `
<p>2つの確率変数 $(X,Y)$ の<strong>同時分布</strong> $f(x,y)$ から、次が得られます。</p>
<ul>
<li><strong>周辺分布</strong>：一方を積分（和）で消す。$f_X(x)=\\int f(x,y)\\,dy$。散布図を軸に「影を落とす」イメージ。</li>
<li><strong>条件付き分布</strong>：一方を固定して切る。$f_{Y\\mid X}(y\\mid x)=\\dfrac{f(x,y)}{f_X(x)}$。相関があると、$x$ の値ごとに $Y$ の中心が動きます。</li>
</ul>
<p>独立 $\\iff f(x,y)=f_X(x)f_Y(y)$。このとき条件付き分布は $x$ によらず一定になります。</p>
<div class="note">下は2次元正規分布の等高線。相関 $\\rho$ を上げると等高線が斜めの楕円になり、$x=x_0$ で切った条件付き分布（右の断面）の中心が $x_0$ とともに移動します。$\\rho=0$ では動きません（独立）。</div>`,
    demo: {
      note: '相関ρを0にすると、切る位置x₀を変えても条件付き分布(右)は動かない＝独立。ρを上げると x₀ に連動して中心が動く＝XがYの情報を持つ。',
      controls: [
        { type: 'range', id: 'rho', label: '相関 ρ', min: -0.9, max: 0.9, step: 0.1, value: 0.6 },
        { type: 'range', id: 'x0', label: '切る位置 x₀', min: -2.4, max: 2.4, step: 0.1, value: 1 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const dpr = window.devicePixelRatio || 1;
        const W = canvas.clientWidth, H = canvas.clientHeight;
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        const rho = p.rho, x0 = p.x0;
        // 左：等高線ヒートマップ
        const lw = W * 0.62, lh = H, pad = 34;
        const g = (x, y) => {
          const z = (x * x - 2 * rho * x * y + y * y) / (1 - rho * rho);
          return Math.exp(-z / 2);
        };
        const xmin = -3, xmax = 3, ymin = -3, ymax = 3;
        const X = v => pad + ((v - xmin) / (xmax - xmin)) * (lw - pad - 10);
        const Y = v => H - pad - ((v - ymin) / (ymax - ymin)) * (H - 2 * pad);
        const cols = 70, rows = 70;
        for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
          const x = xmin + (xmax - xmin) * i / cols, y = ymax - (ymax - ymin) * j / rows;
          const v = g(x, y);
          const rr = Math.round(255 - 120 * v), gg = Math.round(255 - 90 * v), bb = Math.round(255 - 20 * v);
          ctx.fillStyle = 'rgb(' + rr + ',' + gg + ',' + bb + ')';
          ctx.fillRect(X(x), Y(y) - (H - 2 * pad) / rows, (lw - pad - 10) / cols + 1, (H - 2 * pad) / rows + 1);
        }
        ctx.strokeStyle = '#c7cdd8'; ctx.strokeRect(pad, pad, lw - pad - 10, H - 2 * pad);
        // 切断線
        ctx.strokeStyle = '#e4572e'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.moveTo(X(x0), pad); ctx.lineTo(X(x0), H - pad); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#e4572e'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('x₀=' + x0.toFixed(1), X(x0), pad - 4);
        ctx.fillStyle = '#475467'; ctx.textAlign = 'center';
        ctx.fillText('同時分布 f(x,y)（等高線）', lw / 2, H - 8);
        // 右：条件付き分布 Y|X=x0 は N(ρ x0, 1-ρ²)
        const rx = lw + 12, rw = W - rx - 16;
        const cmu = rho * x0, csd = Math.sqrt(1 - rho * rho);
        const ymn = -3, ymx = 3;
        const YR = v => H - pad - ((v - ymn) / (ymx - ymn)) * (H - 2 * pad);
        const maxd = st.normalPdf(cmu, cmu, csd);
        ctx.strokeStyle = '#4f6df5'; ctx.lineWidth = 2.5; ctx.beginPath();
        let first = true;
        for (let j = 0; j <= 100; j++) {
          const y = ymn + (ymx - ymn) * j / 100;
          const d = st.normalPdf(y, cmu, csd) / maxd;
          const px = rx + d * (rw - 6), py = YR(y);
          if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.strokeStyle = '#c7cdd8'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(rx, pad); ctx.lineTo(rx, H - pad); ctx.stroke();
        ctx.strokeStyle = '#e4572e'; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(rx, YR(cmu)); ctx.lineTo(rx + rw, YR(cmu)); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#475467'; ctx.font = '11.5px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Y | X=x₀', rx + rw / 2, H - 8);
        ctx.fillText('中心 ' + cmu.toFixed(2), rx + rw / 2, YR(cmu) - 8);
      },
    },
  });

  /* --- モーメントと分布の形（歪度・尖度） --- */
  T.push({
    section: 'prep1', group: '確率と確率変数', id: 'moments-shape', title: 'モーメント・歪度・尖度・変動係数',
    summary: '平均・分散の先にある「歪度（左右の非対称）」と「尖度（裾の重さ）」を、分布の形を動かして体で覚えます。',
    body: `
<p>分布の形は<strong>モーメント</strong>で特徴づけます。平均まわりの $k$ 次モーメント $\\mu_k=E[(X-\\mu)^k]$ から、</p>
<ul>
<li><strong>分散</strong> $\\sigma^2=\\mu_2$：広がり。</li>
<li><strong>歪度</strong> $\\gamma_1=\\mu_3/\\sigma^3$：左右の非対称。正なら右に裾を引く（右歪み）。</li>
<li><strong>尖度</strong> $\\gamma_2=\\mu_4/\\sigma^4-3$：裾の重さ・とがり。正規分布を基準($0$)に、正なら裾が重い（外れ値が出やすい）。</li>
<li><strong>変動係数</strong> $CV=\\sigma/\\mu$：ばらつきを平均で割った「相対的ばらつき」。単位に依らず比較できる。</li>
</ul>
<div class="note">歪度スライダーで山が左右に偏り、尖度スライダーで裾の重さ（ピークの鋭さ）が変わります。平均・分散が同じでも形が違う、という感覚をつかんでください。</div>`,
    demo: {
      note: '歪度>0は右に長い裾（所得分布など）。尖度>0は「中心が尖り裾が重い」＝正規より外れ値が出やすい。歪度・尖度は平均分散だけでは捉えられない情報です。',
      controls: [
        { type: 'range', id: 'skew', label: '歪度（右歪み→）', min: -0.8, max: 0.8, step: 0.05, value: 0.5 },
        { type: 'range', id: 'kurt', label: '尖度（裾の重さ→）', min: 0, max: 0.9, step: 0.05, value: 0.3 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        // スキュー正規＋裾の混合で形を作る（教育目的の近似）
        const skew = p.skew, kurt = p.kurt;
        const base = (x) => st.normalPdf(x, 0, 1);
        const heavy = (x) => 0.5 * st.tPdf(x, 3); // 重い裾成分
        const f = (x) => {
          const g = (1 - kurt) * base(x) + kurt * heavy(x);
          const s = 1 + skew * Math.tanh(x); // 右/左に非対称化
          return g * s;
        };
        const xs = st.linspace(-5, 5, 300);
        // 正規化
        let area = 0; const dx = 10 / 299;
        for (const x of xs) area += Math.max(0, f(x)) * dx;
        const norm = xs.map(x => [x, Math.max(0, f(x)) / area]);
        const pl = Pl.make(canvas, { xmin: -5, xmax: 5, ymin: 0, ymax: 0.5 });
        pl.clear(); pl.axes({ xLabel: 'x', yLabel: '密度' });
        pl.line(xs.map(x => [x, st.normalPdf(x)]), { color: Pl.gray, dash: [5, 4], width: 1.5 });
        pl.line(norm, { color: Pl.colors[0], width: 2.5 });
        pl.fillUnder(norm, { color: Pl.colors[0], alpha: 0.12 });
        pl.legend([{ label: '標準正規（基準）', color: Pl.gray }, { label: 'この分布', color: Pl.colors[0] }]);
        pl.text(-5, 0.5, '歪度 γ₁ ' + (skew > 0.05 ? '> 0（右歪み）' : skew < -0.05 ? '< 0（左歪み）' : '≈ 0'), { align: 'left', baseline: 'top', dx: 60, dy: 4, color: '#475467', size: 12.5 });
        pl.text(-5, 0.5, '尖度 γ₂ ' + (kurt > 0.05 ? '> 0（裾が重い）' : '≈ 0'), { align: 'left', baseline: 'top', dx: 60, dy: 24, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- モーメント母関数・確率母関数 --- */
  T.push({
    section: 'prep1', group: '確率と確率変数', id: 'mgf', title: 'モーメント母関数・確率母関数',
    summary: '母関数を1回・2回…微分するとモーメントが「湧き出す」仕組みと、和の分布が積で書ける便利さを理解します。',
    body: `
<p><strong>モーメント母関数 (MGF)</strong> は $M_X(t)=E[e^{tX}]$ で定義されます。$e^{tX}$ をテイラー展開すると</p>
<p>$$ M_X(t)=E\\!\\left[\\sum_{k=0}^\\infty \\frac{(tX)^k}{k!}\\right]=\\sum_{k=0}^\\infty \\frac{t^k}{k!}E[X^k] $$</p>
<p>なので $t=0$ での $k$ 階微分がちょうど $k$ 次モーメントになります：$\\left.\\dfrac{d^k}{dt^k}M_X(t)\\right|_{t=0}=E[X^k]$。名前どおり「モーメントを生成する関数」です。</p>
<h3>2つの強力な性質</h3>
<ul>
<li><strong>和は積になる</strong>：独立なら $M_{X+Y}(t)=M_X(t)M_Y(t)$。畳み込み積分が掛け算に化けるので、独立同分布の和の分布が簡単に求まる。</li>
<li><strong>分布を一意に決める</strong>：MGF が一致すれば分布も一致。分布の「指紋」。</li>
</ul>
<p>離散で $0,1,2,\\dots$ の値をとるときは<strong>確率母関数</strong> $G_X(s)=E[s^X]=\\sum_k P(X=k)s^k$ が便利で、$G_X^{(k)}(0)/k!=P(X=k)$、$G_X'(1)=E[X]$ が取り出せます。</p>
<div class="note">例：正規 $N(\\mu,\\sigma^2)$ の MGF は $\\exp(\\mu t+\\tfrac12\\sigma^2 t^2)$。独立な正規の和も正規になるのは、MGF の積がまた同じ形になるからです（再生性）。下でパラメータを変え、MGF の $t=0$ 近傍の曲がり方（＝分散）を見てください。</div>`,
    demo: {
      note: 'MGF は t=0 で必ず1を通り、そこでの傾き＝平均、曲がり具合（2階微分）＝E[X²]。σを上げると t=0 近傍で急に立ち上がる（分散が大きい）様子が見えます。',
      controls: [
        { type: 'range', id: 'mu', label: '平均 μ', min: -1, max: 2, step: 0.1, value: 0.5 },
        { type: 'range', id: 'sd', label: '標準偏差 σ', min: 0.4, max: 1.6, step: 0.1, value: 1 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const mu = p.mu, sd = p.sd;
        const M = t => Math.exp(mu * t + 0.5 * sd * sd * t * t);
        const ts = st.linspace(-1.5, 1.5, 200);
        const ys = ts.map(t => M(t));
        const pl = Pl.make(canvas, { xmin: -1.5, xmax: 1.5, ymin: 0, ymax: Math.min(8, Math.max.apply(null, ys)) });
        pl.clear(); pl.axes({ xLabel: 't', yLabel: 'M_X(t) = E[e^{tX}]' });
        pl.line(ts.map((t, i) => [t, ys[i]]), { color: Pl.colors[0], width: 2.5 });
        // t=0 での接線（傾き=μ）
        pl.scatter([[0, 1]], { color: Pl.colors[1], r: 5 });
        const tangent = ts.map(t => [t, 1 + mu * t]);
        pl.line(tangent, { color: Pl.colors[1], dash: [5, 4], width: 1.5 });
        pl.legend([{ label: 'MGF', color: Pl.colors[0] }, { label: 't=0の接線（傾き=μ=' + mu.toFixed(1) + '）', color: Pl.colors[1] }]);
        pl.text(-1.5, Math.min(8, Math.max.apply(null, ys)), "M(0)=1, M'(0)=μ, M''(0)=E[X²]=" + (sd * sd + mu * mu).toFixed(2), { align: 'left', baseline: 'top', dx: 60, dy: 4, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- 変数変換と線形結合 --- */
  T.push({
    section: 'prep1', group: '確率と確率変数', id: 'transformations', title: '変数変換と確率変数の線形結合',
    summary: '$Y=g(X)$ と変数を変換したとき密度がどう変わるか（ヤコビアン）と、線形結合の平均・分散の公式を可視化します。',
    body: `
<p>確率変数 $X$ を $Y=g(X)$ と変換すると、密度は「引き伸ばし・圧縮」の分だけ変わります。$g$ が単調なら</p>
<p>$$ f_Y(y)=f_X\\!\\big(g^{-1}(y)\\big)\\left|\\frac{dx}{dy}\\right| $$</p>
<p>最後の $|dx/dy|$ が<strong>ヤコビアン</strong>。変換で軸が伸びた所は密度が薄まり、縮んだ所は濃くなります（確率の総量1は保存）。</p>
<h3>線形結合はモーメントだけで決まる</h3>
<p>分布の形が何であれ、線形結合 $aX+bY+c$ の平均と分散は次の公式で計算できます。</p>
<p>$$ E[aX+bY+c]=a\\mu_X+b\\mu_Y+c $$</p>
<p>$$ V[aX+bY]=a^2\\sigma_X^2+b^2\\sigma_Y^2+2ab\\,\\mathrm{Cov}(X,Y) $$</p>
<p>独立なら共分散項が消え、<strong>分散は足し算</strong>（標準偏差は足し算ではない点に注意）。これが誤差の伝わり方や標準誤差 $\\sigma/\\sqrt{n}$ の根拠です。</p>
<div class="note">下は $X\\sim$一様分布を $Y=g(X)$ で変換した密度。$g$ を変えると、傾きが急なところで密度が薄く、緩いところで濃くなる（ヤコビアンの効果）のが見えます。</div>`,
    demo: {
      note: 'Y=X²やY=√Xでは、元が一様でも変換後は一様でなくなる。密度は「傾きの逆数」で決まる＝ヤコビアン。指数変換で右に裾を引く様子も確認できます。',
      controls: [
        { type: 'select', id: 'g', label: '変換 Y=g(X)', value: 'sq', options: [
          { value: 'sq', label: 'Y = X²' },
          { value: 'sqrt', label: 'Y = √X' },
          { value: 'exp', label: 'Y = eˣ' },
        ]},
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        // X~Uniform(0.05,2) を変換。数値的にヒストグラムで密度を作る
        const rand = st.rng(31);
        const N = 60000;
        const ys = [];
        for (let i = 0; i < N; i++) {
          const x = 0.05 + 1.95 * rand();
          let y;
          if (p.g === 'sq') y = x * x;
          else if (p.g === 'sqrt') y = Math.sqrt(x);
          else y = Math.exp(x);
        ys.push(y);
        }
        const lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys);
        const bins = st.histogram(ys, 40, lo, hi);
        const ymax = Math.max.apply(null, bins.map(b => b.density)) * 1.15 || 1;
        const pl = Pl.make(canvas, { xmin: lo, xmax: hi, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: 'Y', yLabel: '密度 f_Y(y)' });
        pl.bars(bins.map(b => ({ x0: b.x0, x1: b.x1, y: b.density })), { color: Pl.colors[0], alpha: 0.6 });
        pl.text(lo, ymax, 'X は一様分布。変換で密度が偏る＝ヤコビアン |dx/dy| の効果', { align: 'left', baseline: 'top', dx: 60, dy: 4, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- 大数の法則 --- */
  T.push({
    section: 'prep1', group: '確率と確率変数', id: 'lln', title: '大数の法則',
    summary: '標本平均が試行を重ねるほど母平均に落ち着く様子を、複数の実現パスで観察し、中心極限定理との違いを整理します。',
    body: `
<p><strong>大数の（弱）法則</strong>は、標本平均 $\\bar X_n$ が $n\\to\\infty$ で母平均 $\\mu$ に（確率）収束する、という主張です。</p>
<p>$$ P\\big(|\\bar X_n-\\mu|>\\varepsilon\\big)\\to 0\\quad(n\\to\\infty) $$</p>
<p>チェビシェフの不等式から、$V[\\bar X_n]=\\sigma^2/n\\to 0$ なので中心が動かず散らばりだけ消える、と理解できます。</p>
<div class="note"><strong>大数の法則と中心極限定理の違い</strong>：大数の法則は「$\\bar X_n$ が $\\mu$ に近づく」（1点への収束）。中心極限定理は「$\\bar X_n$ の<em>ばらつきの形</em>が正規分布になる」（分布の形）。前者は的の中心へ、後者はその周りの散らばり方の話です。</div>`,
    demo: {
      note: '各色の線は1回の「実験の履歴」。試行回数を増やすと、どのパスも母平均μ（点線）に吸い寄せられて収束します。再サンプルで別の運命を引き直せます。',
      controls: [
        { type: 'range', id: 'nmax', label: '試行回数の上限', min: 20, max: 1000, step: 20, value: 400 },
        { type: 'select', id: 'src', label: '母集団', value: 'coin', options: [
          { value: 'coin', label: 'コイン（母平均0.5）' },
          { value: 'die', label: 'サイコロ（母平均3.5）' },
        ]},
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const mu = p.src === 'coin' ? 0.5 : 3.5;
        const nmax = Math.round(p.nmax);
        const paths = 5;
        const series = [];
        for (let s = 0; s < paths; s++) {
          const rand = st.rng(100 + s * 999 + (p.reseed | 0) * 17);
          const pts = []; let sum = 0;
          for (let n = 1; n <= nmax; n++) {
            const x = p.src === 'coin' ? (rand() < 0.5 ? 0 : 1) : (1 + Math.floor(rand() * 6));
            sum += x;
            pts.push([n, sum / n]);
          }
          series.push(pts);
        }
        const ymin = mu - (p.src === 'coin' ? 0.5 : 2.2), ymax = mu + (p.src === 'coin' ? 0.5 : 2.2);
        const pl = Pl.make(canvas, { xmin: 1, xmax: nmax, ymin, ymax });
        pl.clear(); pl.axes({ xLabel: '試行回数 n', yLabel: '標本平均 x̄ₙ' });
        pl.hline(mu, { color: Pl.ink, label: '母平均 μ=' + mu, dash: [6, 3] });
        series.forEach((pts, i) => pl.line(pts, { color: Pl.colors[i % Pl.colors.length], width: 1.4, alpha: 0.85 }));
      },
    },
  });

  /* --- 二項・ポアソンの正規近似と連続修正 --- */
  T.push({
    section: 'prep1', group: '確率と確率変数', id: 'normal-approx', title: '二項・ポアソンの正規近似と連続修正',
    summary: '離散分布を正規分布で近似するときの一致度と、$\\pm 0.5$ の「連続修正」がなぜ効くかを重ねて確かめます。',
    body: `
<p>$n$ が大きいと二項分布は正規分布で近似できます（ド・モアブル–ラプラスの定理）。</p>
<p>$$ \\mathrm{Bin}(n,p)\\approx \\mathcal N\\big(np,\\ np(1-p)\\big) $$</p>
<p>ポアソン分布も $\\lambda$ が大きいと $\\mathcal N(\\lambda,\\lambda)$ に近づきます。目安は二項で $np\\ge5$ かつ $n(1-p)\\ge5$。</p>
<h3>連続修正</h3>
<p>離散（棒）を連続（曲線）で近似するとき、$P(X\\le k)$ は $k$ の棒の「右端」まで含めたいので $k+0.5$ まで積分します。</p>
<p>$$ P(X\\le k)\\approx \\Phi\\!\\left(\\frac{k+0.5-np}{\\sqrt{np(1-p)}}\\right) $$</p>
<p>この $\\pm0.5$ が<strong>連続修正</strong>。棒の幅の半分を足し引きすることで、近似がぐっと良くなります。</p>
<div class="note">下で $n,p$ を変えると二項の棒に正規曲線が重なります。$p$ が0.5から離れる（歪む）ほど、また $n$ が小さいほど近似はずれ、連続修正の効き目が大きくなります。</div>`,
    demo: {
      note: 'n を大きくすると棒と曲線がぴったり重なる。p=0.1のように偏っていると小さな n では曲線が左にはみ出す（近似が悪い）。連続修正は棒の幅を考慮する補正です。',
      controls: [
        { type: 'range', id: 'n', label: '試行回数 n', min: 5, max: 80, step: 1, value: 20 },
        { type: 'range', id: 'p', label: '成功確率 p', min: 0.1, max: 0.9, step: 0.05, value: 0.5 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const n = Math.round(p.n), prob = p.p;
        const mu = n * prob, sd = Math.sqrt(n * prob * (1 - prob));
        const lo = Math.max(0, Math.floor(mu - 4 * sd)), hi = Math.min(n, Math.ceil(mu + 4 * sd));
        let ymax = 0;
        const items = [];
        for (let k = lo; k <= hi; k++) { const pr = st.binomPmf(k, n, prob); items.push({ x0: k - 0.5, x1: k + 0.5, y: pr }); ymax = Math.max(ymax, pr); }
        ymax *= 1.2;
        const pl = Pl.make(canvas, { xmin: lo - 0.5, xmax: hi + 0.5, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: 'k', yLabel: '確率' });
        pl.bars(items, { color: Pl.colors[0], alpha: 0.55 });
        const xs = st.linspace(lo - 0.5, hi + 0.5, 200);
        pl.line(xs.map(x => [x, st.normalPdf(x, mu, sd)]), { color: Pl.colors[1], width: 2.5 });
        pl.legend([{ label: '二項分布', color: Pl.colors[0] }, { label: 'N(np, np(1−p))', color: Pl.colors[1] }]);
        const ok = (n * prob >= 5 && n * (1 - prob) >= 5);
        pl.text(hi + 0.5, ymax, 'np=' + mu.toFixed(1) + ', n(1−p)=' + (n * (1 - prob)).toFixed(1) + (ok ? ' ✓近似の目安を満たす' : ' ✗ まだ近似が粗い'), { align: 'right', baseline: 'top', dx: -8, dy: 6, color: ok ? '#2a9d8f' : '#e4572e', size: 12.5 });
      },
    },
  });

})();
