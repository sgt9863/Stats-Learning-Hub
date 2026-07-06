'use strict';
/* 数学の基礎（高校数学・数IIIからの橋渡し） */
(function () {
  const T = (window.STATS_TOPICS = window.STATS_TOPICS || []);
  const S = () => window.Stats;
  const P = () => window.Plot;
  const TH = () => window.PlotlyTheme;

  /* --- 1. ベクトルと行列でデータを表す --- */
  T.push({
    section: 'math', group: '線形代数', id: 'vectors-matrices', title: 'ベクトルと行列でデータを表す',
    summary: '「1人ぶんのデータ＝1本のベクトル」「表全体＝1つの行列」。統計を多次元で扱うための言葉を、図で身につけます。',
    body: `
<p>統計では、たくさんの観測をまとめて扱います。そのための言葉が<strong>ベクトル</strong>と<strong>行列</strong>です。数IIIまでで習うベクトルの延長なので、身構える必要はありません。</p>
<h3>ベクトル ＝ 1つの観測</h3>
<p>ある1個体について「身長・体重」を測ったら、それは2つの数の組、つまり<strong>2次元ベクトル</strong> $\\boldsymbol{x}=(x_1,x_2)$ です。測る項目が $p$ 個なら $p$ 次元ベクトルになります。ベクトルは「$p$ 次元空間の1つの点（矢印）」だと思ってください。</p>
<h3>行列 ＝ データ表そのもの</h3>
<p>$n$ 人ぶんのデータを縦に積むと、$n$ 行 $p$ 列の<strong>行列</strong> $X$ になります。これが統計での「データ行列」で、機械学習では特徴量行列とも呼びます。</p>
<p>$$ X=\\begin{pmatrix} x_{11} & \\cdots & x_{1p}\\\\ \\vdots & & \\vdots \\\\ x_{n1} & \\cdots & x_{np}\\end{pmatrix} \\quad\\begin{array}{l}\\leftarrow \\text{1行 = 1個体}\\\\[2pt] \\uparrow \\text{1列 = 1変数}\\end{array} $$</p>
<h3>行列は「空間を変形する規則」でもある</h3>
<p>行列にはもう1つの顔があります。ベクトルに行列を掛けると、そのベクトルは<strong>回転・拡大・せん断</strong>され、別のベクトルに移ります。$2\\times2$ 行列 $A$ をかける操作は、平面全体をゆがめる「変換」です。主成分分析やPLSは、結局この「空間の変形」を読み解く話に行き着きます。</p>
<div class="note">下で行列 $A=\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}$ の4つの数を動かすと、青い単位の正方形（と円）が $A$ によってどう変形するかが見えます。行列＝図形を動かす規則、という感覚をつかんでください。</div>`,
    demo: {
      note: 'a,d は各軸の拡大率、b,c はせん断（斜めのゆがみ）。行列式 det=ad−bc は「面積が何倍になるか」。det=0 だと平面が1本の線につぶれ、情報が失われます（逆行列が作れない状態）。',
      controls: [
        { type: 'range', id: 'a', label: 'a（左上）', min: -2, max: 2, step: 0.1, value: 1 },
        { type: 'range', id: 'b', label: 'b（右上）', min: -2, max: 2, step: 0.1, value: 0.5 },
        { type: 'range', id: 'c', label: 'c（左下）', min: -2, max: 2, step: 0.1, value: 0 },
        { type: 'range', id: 'd', label: 'd（右下）', min: -2, max: 2, step: 0.1, value: 1 },
      ],
      draw(canvas, p) {
        const Pl = P();
        const pl = Pl.make(canvas, { xmin: -3, xmax: 3, ymin: -3, ymax: 3 });
        pl.clear(); pl.axes({ xLabel: 'x', yLabel: 'y' });
        const A = (x, y) => [p.a * x + p.b * y, p.c * x + p.d * y];
        // 変換前グリッド（薄い）
        for (let g = -3; g <= 3; g++) {
          pl.line([[-3, g], [3, g]], { color: '#eef1f6', width: 1 });
          pl.line([[g, -3], [g, 3]], { color: '#eef1f6', width: 1 });
        }
        // 変換前の単位正方形
        pl.polygon([[0, 0], [1, 0], [1, 1], [0, 1]], { stroke: Pl.gray, width: 1.5 });
        // 変換後グリッド（Aで写した線）
        for (let g = -3; g <= 3; g++) {
          const h1 = []; for (let t = -3; t <= 3; t += 0.5) h1.push(A(t, g));
          const v1 = []; for (let t = -3; t <= 3; t += 0.5) v1.push(A(g, t));
          pl.line(h1, { color: '#cfd9ff', width: 1 });
          pl.line(v1, { color: '#cfd9ff', width: 1 });
        }
        // 変換後の単位正方形
        pl.polygon([A(0, 0), A(1, 0), A(1, 1), A(0, 1)], { stroke: Pl.colors[0], fill: Pl.colors[0], alpha: 0.18, width: 2 });
        // 基底ベクトルの行き先
        pl.arrow(0, 0, ...A(1, 0), { color: Pl.colors[1], width: 3 });
        pl.arrow(0, 0, ...A(0, 1), { color: Pl.colors[2], width: 3 });
        const det = p.a * p.d - p.b * p.c;
        pl.text(-3, 3, 'det(A) = ' + det.toFixed(2) + '（面積は ' + Math.abs(det).toFixed(2) + ' 倍）', { align: 'left', baseline: 'top', dx: 60, dy: 4, color: Math.abs(det) < 0.05 ? Pl.colors[1] : '#475467', size: 12.5 });
      },
    },
  });

  /* --- 2. 行列の積・逆行列と連立方程式 --- */
  T.push({
    section: 'math', group: '線形代数', id: 'matrix-ops', title: '行列の積・逆行列と連立方程式',
    summary: '連立一次方程式を「行列 × 未知数ベクトル ＝ 右辺」と書くと、解は逆行列で一気に求まる。最小二乗法の下準備です。',
    body: `
<p>2本の連立方程式</p>
<p>$$ \\begin{cases} a x + b y = e \\\\ c x + d y = f \\end{cases} \\quad\\Longleftrightarrow\\quad \\underbrace{\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}}_{A}\\underbrace{\\begin{pmatrix}x\\\\y\\end{pmatrix}}_{\\boldsymbol{x}}=\\underbrace{\\begin{pmatrix}e\\\\f\\end{pmatrix}}_{\\boldsymbol{b}} $$</p>
<p>は、行列を使うと $A\\boldsymbol{x}=\\boldsymbol{b}$ と1本で書けます。各方程式は平面上の1本の直線で、<strong>解は2直線の交点</strong>です。</p>
<h3>逆行列 ＝ 割り算のかわり</h3>
<p>普通の方程式 $ax=b$ は $x=b/a$。行列版では「割り算」の代わりに<strong>逆行列</strong> $A^{-1}$ を使います。</p>
<p>$$ A\\boldsymbol{x}=\\boldsymbol{b} \\;\\Longrightarrow\\; \\boldsymbol{x}=A^{-1}\\boldsymbol{b},\\qquad A^{-1}=\\frac{1}{ad-bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix} $$</p>
<p>ここで分母の $ad-bc$ が<strong>行列式</strong>。これが0だと逆行列は存在せず、2直線が<strong>平行</strong>（交点なし、または一致して無数）になります。</p>
<h3>行列式と「壊れやすさ」を測る条件数</h3>
<p>行列式 $\\det A=ad-bc$ には<strong>面積の拡大率</strong>という意味があります：$A$ は単位正方形（面積1）を平行四辺形（面積 $|\\det A|$）へ移す変換で、$\\det A=0$ は「面積が潰れて次元が落ちる＝情報が失われて元に戻せない（逆行列なし）」状態です。ただし実務で効くのは $\\det$ そのものより<strong>条件数 $\\kappa(A)=\\lambda_{\\max}/\\lambda_{\\min}$</strong>（最大・最小<a href="#/math/eigen">固有値</a>の比）。これは「入力の小さな誤差が解でどれだけ増幅されるか」の上限で、$\\kappa$ が大きいほど右辺やデータのわずかな変化に解が過敏になります。相関 $\\rho$ の2変数では $\\kappa=(1+\\rho)/(1-\\rho)$ で、$\\rho{=}0.9$ で19、$\\rho{=}0.99$ で199（数値確認済み）——似た変数ほど条件数が跳ね上がります。</p>
<h3>前提と、崩れたときの注意</h3>
<p>逆行列は「解を<em>書く</em>」には便利ですが、<strong>実際に計算する道具としては危険</strong>です。$\\det\\approx0$（悪条件）だと桁落ちで精度が失われ、$p{>}n$ では $X^\\top X$ が特異で逆行列が存在しません。数値計算では逆行列を陽に作らず、<strong>LU分解・QR分解・コレスキー分解で $A\\boldsymbol x=\\boldsymbol b$ を直接解く</strong>のが定石（速く安定）。悪条件・特異なときは、<strong>擬似逆行列（<a href="#/prep1/pca">SVD</a>ベース）</strong>や<a href="#/prep1/regularization">正則化</a>（$X^\\top X+\\lambda I$ で条件数を下げる＝リッジ回帰）で対処します。「逆行列の式が書けること」と「安定に計算できること」は別問題だと意識してください。</p>
<div class="note">これは統計で最重要です。重回帰の係数は $\\hat{\\boldsymbol\\beta}=(X^\\top X)^{-1}X^\\top \\boldsymbol{y}$ と、まさに逆行列で求まります。行列式が0に近い＝説明変数が似すぎている状態が「<a href="#/prep1/multicollinearity">多重共線性</a>」で、条件数が跳ね上がり係数が不安定になります。下で2直線を動かし、平行に近づく（$\\det\\to0$・条件数→∞）と交点（解）が不安定に飛ぶ様子を見てください。</div>`,
    demo: {
      note: '2直線の傾きを近づける（平行に近づける）と、交点＝連立方程式の解が遠くへ大きく動きます。行列式が0に近いと解が不安定、というのが多重共線性の正体です。',
      controls: [
        { type: 'range', id: 'a', label: '式1の x 係数 a', min: -3, max: 3, step: 0.1, value: 1 },
        { type: 'range', id: 'b', label: '式1の y 係数 b', min: -3, max: 3, step: 0.1, value: 1 },
        { type: 'range', id: 'c', label: '式2の x 係数 c', min: -3, max: 3, step: 0.1, value: 1 },
        { type: 'range', id: 'd', label: '式2の y 係数 d', min: -3, max: 3, step: 0.1, value: -1 },
      ],
      draw(canvas, p) {
        const Pl = P();
        const e = 2, f = 0.5; // 右辺は固定
        const pl = Pl.make(canvas, { xmin: -8, xmax: 8, ymin: -8, ymax: 8 });
        pl.clear(); pl.axes({ xLabel: 'x', yLabel: 'y' });
        // 直線1: a x + b y = e → y = (e - a x)/b
        const lineFor = (A, B, R, col) => {
          if (Math.abs(B) > 1e-6) pl.line([[-8, (R - A * -8) / B], [8, (R - A * 8) / B]], { color: col, width: 2.5 });
          else pl.vline(R / A, { color: col, dash: [] });
        };
        lineFor(p.a, p.b, e, Pl.colors[0]);
        lineFor(p.c, p.d, f, Pl.colors[1]);
        const det = p.a * p.d - p.b * p.c;
        if (Math.abs(det) > 1e-4) {
          const x = (e * p.d - p.b * f) / det;
          const y = (p.a * f - e * p.c) / det;
          if (Math.abs(x) < 8 && Math.abs(y) < 8) pl.scatter([[x, y]], { color: Pl.ink, r: 6 });
          pl.text(-8, 8, 'det = ' + det.toFixed(2) + '　解 (x,y) = (' + x.toFixed(1) + ', ' + y.toFixed(1) + ')', { align: 'left', baseline: 'top', dx: 60, dy: 4, color: '#475467', size: 12.5 });
        } else {
          pl.text(-8, 8, 'det ≈ 0 → 2直線が平行、解が定まらない（逆行列なし）', { align: 'left', baseline: 'top', dx: 60, dy: 4, color: Pl.colors[1], size: 12.5 });
        }
        pl.legend([{ label: '式1', color: Pl.colors[0] }, { label: '式2', color: Pl.colors[1] }]);
      },
    },
  });

  /* --- 3. 固有値・固有ベクトル --- */
  T.push({
    section: 'math', group: '線形代数', id: 'eigen', title: '固有値・固有ベクトル',
    summary: '行列をかけても「向きが変わらない」特別な方向が固有ベクトル、その伸び率が固有値。主成分分析の心臓部です。',
    body: `
<p>行列 $A$ をベクトルにかけると、ふつうは向きも長さも変わります。ところが、ある特別な方向のベクトルは<strong>向きが変わらず、長さだけ $\\lambda$ 倍</strong>になります。この方向を<strong>固有ベクトル</strong> $\\boldsymbol{v}$、倍率 $\\lambda$ を<strong>固有値</strong>と呼びます。</p>
<p>$$ A\\boldsymbol{v}=\\lambda\\boldsymbol{v} $$</p>
<p>「変換 $A$ の“芯”になっている軸」が固有ベクトル、「その軸方向にどれだけ引き伸ばすか」が固有値、というイメージです。</p>
<h3>なぜ統計で重要か</h3>
<p>データの<a href="#/math/covariance-matrix">分散共分散行列</a>の固有ベクトルは「データが最もばらつく方向」を、固有値は「その方向の分散の大きさ」を表します。これがそのまま<a href="#/prep1/pca">主成分分析（PCA）</a>です。対称行列（共分散行列はいつも対称）の固有ベクトルは互いに直交する、という性質も効いてきます。</p>
<div class="note">下で対称行列 $A=\\begin{pmatrix}a&b\\\\b&c\\end{pmatrix}$ を動かすと、青い単位円が楕円に変形します。灰色の任意ベクトルは向きが変わりますが、<strong>赤・緑の固有ベクトルだけは変換後も同じ直線上</strong>にとどまり、長さが固有値倍になります。これが「変換の主軸」です。</div>`,
    demo: {
      note: '赤・緑の矢印（固有ベクトル）は、行列をかけても同じ直線上に伸縮するだけ。楕円の長軸・短軸の向きと一致します。固有値が楕円の半径になります。',
      controls: [
        { type: 'range', id: 'a', label: 'a', min: 0.2, max: 3, step: 0.1, value: 2 },
        { type: 'range', id: 'b', label: 'b（非対角）', min: -2, max: 2, step: 0.1, value: 0.8 },
        { type: 'range', id: 'c', label: 'c', min: 0.2, max: 3, step: 0.1, value: 1 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const pl = Pl.make(canvas, { xmin: -3.5, xmax: 3.5, ymin: -3.5, ymax: 3.5 });
        pl.clear(); pl.axes({ xLabel: 'x', yLabel: 'y' });
        const A = (x, y) => [p.a * x + p.b * y, p.b * x + p.c * y];
        // 単位円 → 楕円
        const circ = [], ell = [];
        for (let t = 0; t <= 64; t++) { const th = t / 64 * 2 * Math.PI; circ.push([Math.cos(th), Math.sin(th)]); ell.push(A(Math.cos(th), Math.sin(th))); }
        pl.polygon(circ, { stroke: Pl.gray, width: 1.2 });
        pl.polygon(ell, { stroke: Pl.colors[0], fill: Pl.colors[0], alpha: 0.1, width: 2 });
        // 固有分解
        const e = st.eigSym([[p.a, p.b], [p.b, p.c]]);
        const v1 = e.vectors[0], v2 = e.vectors[1], l1 = e.values[0], l2 = e.values[1];
        pl.arrow(0, 0, v1[0] * l1, v1[1] * l1, { color: Pl.colors[1], width: 3 });
        pl.arrow(0, 0, v2[0] * l2, v2[1] * l2, { color: Pl.colors[2], width: 3 });
        // 任意ベクトル（向きが変わる例）
        pl.arrow(0, 0, 1.4, 0.2, { color: Pl.gray, width: 1.5 });
        const moved = A(1.4, 0.2);
        pl.arrow(0, 0, moved[0], moved[1], { color: '#c7cdd8', width: 1.5 });
        pl.legend([
          { label: '固有ベクトル1 (λ=' + l1.toFixed(2) + ')', color: Pl.colors[1] },
          { label: '固有ベクトル2 (λ=' + l2.toFixed(2) + ')', color: Pl.colors[2] },
        ]);
      },
    },
  });

  /* --- 4. 分散共分散行列（Plotly 3D） --- */
  T.push({
    section: 'math', group: '線形代数', id: 'covariance-matrix', title: '分散共分散行列',
    summary: '2変数の「広がり方」をまるごと1つの行列に詰め込んだのが分散共分散行列。2次元正規分布の丘の形として3Dで見ます。',
    body: `
<p>1変数の散らばりは分散 $\\sigma^2$ ひとつで表せました。2変数以上では、各変数の分散に加えて<strong>変数どうしの連動（共分散）</strong>も要ります。これらをまとめたのが<strong>分散共分散行列</strong>です。</p>
<p>$$ \\Sigma=\\begin{pmatrix}\\sigma_X^2 & \\sigma_{XY}\\\\ \\sigma_{XY} & \\sigma_Y^2\\end{pmatrix},\\qquad \\sigma_{XY}=\\mathrm{Cov}(X,Y),\\quad \\rho=\\frac{\\sigma_{XY}}{\\sigma_X\\sigma_Y} $$</p>
<p>対角成分が各変数の分散、非対角成分が共分散です。いつも対称行列（$\\sigma_{XY}=\\sigma_{YX}$）になります。</p>
<h3>なぜ対称で、なぜ「半正定値」なのか</h3>
<p>定義 $\\Sigma=E[(\\boldsymbol x-\\boldsymbol\\mu)(\\boldsymbol x-\\boldsymbol\\mu)^\\top]$ から、$(i,j)$ 成分は $\\mathrm{Cov}(X_i,X_j)$。共分散は順序を入れ替えても同じなので<strong>必ず対称</strong>です。さらに任意の方向 $\\boldsymbol a$ について、$\\boldsymbol a^\\top\\Sigma\\boldsymbol a=V[\\boldsymbol a^\\top\\boldsymbol x]\\ge0$——<strong>どんな線形結合の分散も負にならない</strong>ので、$\\Sigma$ は<strong>半正定値</strong>（固有値がすべて0以上）になります。これは飾りの性質ではなく、共分散行列であるための必要条件です。対称かつ半正定値だから固有分解 $\\Sigma=V\\Lambda V^\\top$ ができ、<a href="#/math/eigen">固有ベクトル</a>が「丘の尾根の向き＝主成分の方向」、固有値が各方向の分散になります（<a href="#/prep1/pca">PCA</a>の数学的な核）。</p>
<h3>前提と、崩れたときの注意</h3>
<p>実データから作る<strong>標本</strong>共分散行列 $S$ には落とし穴があります。<strong>(1) $S$ が満ランクになるには標本数 $n$ が変数数 $p$ より大きい必要があり</strong>、$p\\ge n$ だと $S$ は特異（固有値に0が出る）で逆行列が作れません——高次元データ（遺伝子・スペクトル）で頻発し、<strong>縮小推定（Ledoit-Wolf）</strong>で対角へ引き寄せて安定化します。<strong>(2) 共分散は外れ値に極端に弱い</strong>（2乗が効くため1点で楕円が大きく歪む）ので、汚染が疑われるときは<strong>ロバスト共分散（MCD）</strong>を使います。<strong>(3) $\\Sigma$ は線形の連動しか捉えません</strong>——非線形従属（例 $Y=X^2$）は共分散0でも従属、という<a href="#/prep1/joint-distribution">無相関≠独立</a>の話がここにも効きます。</p>
<div class="note">下は2次元正規分布の密度を3Dの丘で表示。マウスでドラッグして回せます。相関 ρ を上げると尾根が対角方向に細長くのび、σ を変えると裾の広がりが変わります。この「丘の等高線」が<a href="#/prep1/correlation">相関の散布図の楕円</a>と同じ形です。$\\rho\\to\\pm1$ で尾根が1本の直線に潰れる＝$\\Sigma$ の固有値の1つが0になり半正定値の「境界」に達する様子です。</div>`,
    demo: {
      heading: '🌐 3Dで確かめる（ドラッグで回転）',
      note: '相関を±1に近づけると丘は対角の細い尾根に。σX・σY はその軸方向の広がり。丘を真上から見たときの等高線が、散布図に現れる楕円です。',
      controls: [
        { type: 'range', id: 'sx', label: 'σX（X方向の広がり）', min: 0.4, max: 2, step: 0.1, value: 1 },
        { type: 'range', id: 'sy', label: 'σY（Y方向の広がり）', min: 0.4, max: 2, step: 0.1, value: 1 },
        { type: 'range', id: 'rho', label: '相関 ρ', min: -0.9, max: 0.9, step: 0.05, value: 0.6 },
      ],
      plot(div, p, Plotly) {
        const sx = p.sx, sy = p.sy, rho = p.rho;
        const det = sx * sx * sy * sy * (1 - rho * rho);
        const n = 40, lim = 3;
        const xs = [], ys = [], z = [];
        for (let i = 0; i < n; i++) { xs.push(-lim + 2 * lim * i / (n - 1)); ys.push(-lim + 2 * lim * i / (n - 1)); }
        for (let j = 0; j < n; j++) {
          const row = [];
          for (let i = 0; i < n; i++) {
            const X = xs[i], Y = ys[j];
            const q = (X * X * sy * sy - 2 * rho * sx * sy * X * Y + Y * Y * sx * sx) / det;
            row.push(Math.exp(-0.5 * q) / (2 * Math.PI * Math.sqrt(det)));
          }
          z.push(row);
        }
        const data = [{
          type: 'surface', x: xs, y: ys, z,
          colorscale: 'Viridis', showscale: false,
          contours: { z: { show: true, usecolormap: true, project: { z: true } } },
        }];
        const layout = TH().layout({
          scene: TH().scene({ zaxis: { title: '密度' }, xaxis: { title: 'X' }, yaxis: { title: 'Y' } }),
          margin: { l: 0, r: 0, t: 6, b: 0 },
        });
        Plotly.react(div, data, layout, TH().config);
      },
    },
  });

  /* --- 5. 偏微分・勾配で最小化する（Plotly 3D） --- */
  T.push({
    section: 'math', group: '微分と最適化', id: 'gradient', title: '偏微分・勾配で最小化する',
    summary: '「坂を下る」ように誤差を減らすのが勾配降下法。最小二乗法も最尤法も、この谷下りで解を見つけています。',
    body: `
<p>数IIIの微分は「接線の傾き＝関数が増える速さ」でした。変数が2つ以上ある関数 $f(x,y)$ では、$x$ だけで微分した<strong>偏微分</strong> $\\partial f/\\partial x$ と、$y$ だけの $\\partial f/\\partial y$ を並べた<strong>勾配ベクトル</strong>を使います。</p>
<p>$$ \\nabla f=\\left(\\frac{\\partial f}{\\partial x},\\ \\frac{\\partial f}{\\partial y}\\right) $$</p>
<p>勾配は「その地点で最も急に増える向き」を指します。だから、その<strong>逆向き</strong>へ少しずつ進めば、関数の谷（最小値）へ下れます。これが<strong>勾配降下法</strong>です。</p>
<p>$$ \\boldsymbol{x}_{\\text{新}}=\\boldsymbol{x}_{\\text{旧}}-\\eta\\,\\nabla f(\\boldsymbol{x}_{\\text{旧}}) $$</p>
<p>$\\eta$（学習率）は歩幅。小さすぎると時間がかかり、大きすぎると谷を飛び越えて<strong>発散</strong>します。最小二乗法・最尤推定・ロジスティック回帰・ニューラルネットの学習は、すべて「誤差という谷を下る」この操作です。</p>
<h3>なぜ勾配の逆向きか、いつ発散するか</h3>
<p>ある向き $\\boldsymbol u$（単位ベクトル）へ進んだときの増え方（方向微分）は $\\nabla f\\cdot\\boldsymbol u$ で、これが最大になるのは $\\boldsymbol u$ が $\\nabla f$ と同じ向きのとき（内積は同方向で最大）。だから<strong>最も急に増える向きが $\\nabla f$、最も急に減る向きがその逆 $-\\nabla f$</strong>——勾配降下が $-\\eta\\nabla f$ で動く理由です。学習率の限界も計算できます。谷を2次関数（最大曲率 $L$＝最大固有値）で近似すると、更新が収束するのは <strong>$\\eta<2/L$</strong> のとき。これを超えると1歩で反対側のより高い所へ飛び、振動しながら発散します（$L{=}4$ なら閾値 $\\eta{=}0.5$——数値でも $\\eta{=}0.5$ で収束・$0.55$ で発散を確認）。</p>
<h3>前提と、崩れたときの注意</h3>
<p>勾配降下がたどり着くのは<strong>「近くの」谷底＝局所最小</strong>にすぎません。誤差地形が<strong>凸</strong>（お椀が1つ）なら局所＝大域で安心ですが（最小二乗・線形の対数尤度は凸）、ニューラルネットなど<strong>非凸</strong>では初期値しだいで別の谷や<strong>鞍点</strong>に捕まります——初期値を変える・確率的勾配（SGD）で揺さぶるのが対策。もう一つの敵が<strong>悪条件な谷（細長い谷＝条件数大）</strong>で、収束を決めるのは実は最小曲率と最大曲率の比 $\\kappa$。$\\kappa$ が大きいと、発散しない小さな $\\eta$ に抑える必要があり、その分「緩い方向」の下りが極端に遅くなってジグザグします。対策が<strong>モメンタム・前処理（プレコンディショニング）・ニュートン法</strong>（曲率 $=$ ヘッセ行列で歩幅を方向ごとに補正）です。下のデモの「谷の細長さ」がこの $\\kappa$ にあたります。</p>
<div class="note">下は誤差の地形（お椀型）を3Dで表示。「1歩進める」を押すと勾配の逆向きに1ステップ下ります。学習率を上げると速く下りますが、上げすぎると谷を飛び越えて登ってしまう（発散）のが見えます——閾値 $\\eta<2/L$ の $L$（最大曲率）を「谷の細長さ」で変えられます。谷底が最適解です。</div>`,
    demo: {
      heading: '🌐 3Dで確かめる（ドラッグで回転）',
      note: '赤い点が現在地、線が下ってきた軌跡。学習率が小さいとゆっくり確実に、大きすぎるとジグザグして発散します。細長い谷（係数を非等方に）ほど下りにくくなります。',
      controls: [
        { type: 'range', id: 'lr', label: '学習率 η（歩幅）', min: 0.02, max: 1.0, step: 0.02, value: 0.15 },
        { type: 'range', id: 'curv', label: '谷の細長さ', min: 1, max: 12, step: 1, value: 4 },
        { type: 'button', id: 'step', label: '1歩進める' },
        { type: 'button', id: 'reset', label: 'リセット' },
      ],
      plot(div, p, Plotly) {
        const a = 1, b = p.curv; // f = a x^2 + b y^2 （細長い谷）
        const f = (x, y) => a * x * x + b * y * y;
        const grad = (x, y) => [2 * a * x, 2 * b * y];
        // reset ボタンが押された回数を基準に軌跡を再計算
        const nsteps = Math.max(0, (p.step | 0));
        let x = -2.4, y = 1.3; // 開始点
        const path = [[x, y, f(x, y)]];
        for (let s = 0; s < nsteps && s < 60; s++) {
          const g = grad(x, y);
          x = x - p.lr * g[0];
          y = y - p.lr * g[1];
          if (!isFinite(x) || Math.abs(x) > 100) { x = Math.sign(x) * 100; }
          if (!isFinite(y) || Math.abs(y) > 100) { y = Math.sign(y) * 100; }
          path.push([x, y, f(x, y)]);
        }
        // 曲面
        const n = 36, lim = 3;
        const xs = [], ys = [], z = [];
        for (let i = 0; i < n; i++) { xs.push(-lim + 2 * lim * i / (n - 1)); ys.push(-lim + 2 * lim * i / (n - 1)); }
        for (let j = 0; j < n; j++) { const row = []; for (let i = 0; i < n; i++) row.push(f(xs[i], ys[j])); z.push(row); }
        const cur = path[path.length - 1];
        const data = [
          { type: 'surface', x: xs, y: ys, z, colorscale: 'Blues', reversescale: true, opacity: 0.85, showscale: false },
          { type: 'scatter3d', mode: 'lines+markers', x: path.map(q => q[0]), y: path.map(q => q[1]), z: path.map(q => q[2] + 0.3), line: { color: '#e4572e', width: 5 }, marker: { size: 3, color: '#e4572e' } },
          { type: 'scatter3d', mode: 'markers', x: [cur[0]], y: [cur[1]], z: [cur[2] + 0.3], marker: { size: 6, color: '#e4572e' } },
        ];
        const layout = TH().layout({
          scene: TH().scene({ zaxis: { title: '誤差 f' }, xaxis: { title: '係数1' }, yaxis: { title: '係数2' } }),
          margin: { l: 0, r: 0, t: 6, b: 0 },
        });
        Plotly.react(div, data, layout, TH().config);
        // 現在地の情報を注記（div の上に小さく）
        div.setAttribute('data-step', nsteps);
      },
    },
  });

  /* --- 6. 変数変換と線形化 --- */
  T.push({
    section: 'math', group: '微分と最適化', id: 'linearization', title: '変数変換と線形化',
    summary: '曲がった関係も、軸を対数などに取り替えると直線になることがある。最小二乗法を非線形な現象に使うための発想です。',
    body: `
<p>最小二乗法や重回帰は「直線（1次式）」の当てはめが得意です。ところが現実の関係はしばしば曲がっています。そこで<strong>軸を取り替えて（変数変換して）直線に直す</strong>のが線形化です。</p>
<h3>例1：指数関数 → 片対数で直線</h3>
<p>$y=A e^{kx}$ の両辺の対数をとると</p>
<p>$$ \\ln y = \\ln A + k x $$</p>
<p>となり、$\\ln y$ を $x$ に対してプロットすれば<strong>傾き $k$、切片 $\\ln A$ の直線</strong>です。細菌の増殖や薬物の消失など、指数的な現象で使います。</p>
<h3>例2：アレニウス/ファントホッフ型</h3>
<p>反応速度や分配係数の温度依存は $\\ln k = a + b/T$ の形。横軸を $1/T$ にとると直線になり、傾き $b$ から活性化エネルギー等が読めます。分析化学・品質管理でおなじみの手口です。</p>

<h3>線形化できる形と、隠れた落とし穴</h3>
<p>同じ発想で多くの非線形式が直線化できます。べき則 $y=Ax^b$ は両対数（$\\ln y$ vs $\\ln x$）で傾き $b$、ミカエリス・メンテン $1/v=1/V_{\\max}+(K_m/V_{\\max})(1/[S])$ は逆数プロット、といった具合です。実際べき則の合成データで両対数の傾きは $1.500$（真値 $b$）、切片の指数は $2.00$（真値 $A$）と正しく戻りました。</p>
<p>ただし線形化には<strong>見落としやすい落とし穴</strong>があります。対数をとると<strong>誤差の構造も一緒に変換される</strong>のです。もとの誤差が<strong>乗法的</strong>（$y=Ae^{kx}\\cdot\\varepsilon$、$\\varepsilon$ が対数正規）なら、$\\ln y=\\ln A+kx+\\ln\\varepsilon$ は等分散の加法誤差になり、$\\ln y$ への最小二乗が<strong>正しく最適</strong>です（数値実験で $\\hat k=0.4996$、真値 0.5）。ところが誤差が<strong>加法的</strong>（$y=Ae^{kx}+\\varepsilon$）だと、対数をとった途端に不等分散になり、小さい $y$ を過度に重視して<strong>推定が偏ります</strong>（同じ条件で $\\ln y$ 回帰の $\\hat k=0.95$ と真値 0.5 から大きくずれ、生データへの<a href="#/prep1/mle">非線形最小二乗</a>なら $0.50$ と正しい）。線形化は「軸を変えれば直線」という便利さと引き換えに、誤差の重みづけを勝手に変えてしまうわけです。</p>

<h3>前提条件と、崩れたときの影響</h3>
<table class="simple">
<tr><th>前提</th><th>崩れると起きること</th><th>対処・代替</th></tr>
<tr><td>誤差が乗法的（対数変換と整合）</td><td>加法誤差なのに対数回帰すると推定が偏る（小さい値を過大に重視）</td><td>生データへの非線形最小二乗（NLS）・重み付き最小二乗</td></tr>
<tr><td>変換の定義域を満たす（$\\ln$ は $y>0$）</td><td>ゼロや負の値があると対数がとれず、点を捨てると偏る</td><td>オフセット付き変換・別の変換・NLS</td></tr>
<tr><td>逆変換して平均を語らない</td><td>$E[\\ln y]\\ne\\ln E[y]$ なので $\\exp(\\hat{\\ln y})$ は平均を過小評価</td><td>スミアリング補正・$\\exp(\\hat\\mu+\\hat\\sigma^2/2)$ 補正</td></tr>
<tr><td>変換後も直線が妥当</td><td>変換で曲がりが残る／新たな曲率が出ることがある</td><td>残差プロットで確認・別の変換や多項式項</td></tr>
</table>

<h3>有意性と実質的な意味</h3>
<p>線形化した軸で計算する $R^2$ や傾きの有意性は<strong>変換後のスケールの話</strong>で、生データでの予測精度とは別物です。両対数で点がきれいに直線に乗っても、それは「元の量の予測が最良」を意味しません。実務では、線形化は<strong>手早く・頑健で・係数の意味が読める出発点</strong>として使い、最終的な係数と不確かさは、誤差構造が加法的なら<strong>生データへの非線形最小二乗</strong>で求め直すのが安全です。逆変換して「平均何倍」を語るときは $\\exp(\\hat\\sigma^2/2)$ のバイアス補正（数値例で $\\sigma=0.2$ なら約 $1.02$ 倍）を忘れないようにします。</p>
<div class="note">「線形化」を切り替えると、左の曲がった生データが、右では直線に化けます。直線になれば、傾き・切片を最小二乗法で安定して推定でき、さらに<a href="#/prep1/multiple-regression">重回帰</a>で複数要因を同時に扱えます。ノイズを足しても、線形化した軸の上でまっすぐ並ぶことを確認してください。</div>`,
    demo: {
      note: '「変換なし」では曲線、「対数変換」に切り替えると同じデータが直線に。線形化できれば係数を最小二乗で素直に求められます。これが非線形現象を線形モデルで扱うコツです。',
      controls: [
        { type: 'select', id: 'model', label: '現象', value: 'exp', options: [
          { value: 'exp', label: 'y = A·e^(kx)（指数増殖）' },
          { value: 'arr', label: 'ln k = a + b/T（温度依存）' },
        ]},
        { type: 'select', id: 'view', label: '軸', value: 'raw', options: [
          { value: 'raw', label: '変換なし（生データ）' },
          { value: 'log', label: '線形化した軸' },
        ]},
        { type: 'range', id: 'noise', label: 'ノイズ', min: 0, max: 0.3, step: 0.02, value: 0.08 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(720 + (p.reseed | 0) * 37);
        const pts = [];
        if (p.model === 'exp') {
          const A = 1.2, k = 0.5;
          for (let i = 0; i < 22; i++) {
            const x = i / 21 * 6;
            const y = A * Math.exp(k * x) * (1 + p.noise * st.randn(rand));
            pts.push({ x, y });
          }
          if (p.view === 'raw') {
            const ymax = Math.max.apply(null, pts.map(q => q.y)) * 1.1;
            const pl = Pl.make(canvas, { xmin: 0, xmax: 6.2, ymin: 0, ymax });
            pl.clear(); pl.axes({ xLabel: 'x', yLabel: 'y' });
            pl.scatter(pts.map(q => [q.x, q.y]), { color: Pl.colors[0], r: 4 });
            const grid = st.linspace(0, 6, 100);
            pl.line(grid.map(x => [x, A * Math.exp(k * x)]), { color: Pl.colors[1], width: 2, dash: [5, 4] });
            pl.text(0, ymax, '曲線：直線では当てられない', { align: 'left', baseline: 'top', dx: 60, dy: 4, color: '#475467', size: 12.5 });
          } else {
            const lys = pts.map(q => Math.log(q.y));
            const pl = Pl.make(canvas, { xmin: 0, xmax: 6.2, ymin: Math.min.apply(null, lys) - 0.3, ymax: Math.max.apply(null, lys) + 0.3 });
            pl.clear(); pl.axes({ xLabel: 'x', yLabel: 'ln y' });
            pl.scatter(pts.map((q, i) => [q.x, lys[i]]), { color: Pl.colors[0], r: 4 });
            // 最小二乗直線
            const xs = pts.map(q => q.x);
            const b = st.cov(xs, lys) / (st.sd(xs) ** 2), a = st.mean(lys) - b * st.mean(xs);
            pl.line([[0, a], [6.2, a + b * 6.2]], { color: Pl.colors[1], width: 2.5 });
            pl.text(0, Math.max.apply(null, lys) + 0.3, 'ln y = ' + a.toFixed(2) + ' + ' + b.toFixed(2) + ' x（直線！）', { align: 'left', baseline: 'top', dx: 60, dy: 4, color: Pl.colors[1], size: 12.5 });
          }
        } else {
          const a0 = 2, b0 = -1800;
          const pts2 = [];
          for (let i = 0; i < 22; i++) {
            const Tk = 290 + i / 21 * 60; // 290〜350 K
            const lnk = a0 + b0 / Tk + p.noise * st.randn(rand);
            pts2.push({ T: Tk, invT: 1 / Tk, lnk });
          }
          if (p.view === 'raw') {
            const pl = Pl.make(canvas, { xmin: 288, xmax: 352, ymin: Math.min.apply(null, pts2.map(q => q.lnk)) - 0.2, ymax: Math.max.apply(null, pts2.map(q => q.lnk)) + 0.2 });
            pl.clear(); pl.axes({ xLabel: '温度 T (K)', yLabel: 'ln k' });
            pl.scatter(pts2.map(q => [q.T, q.lnk]), { color: Pl.colors[0], r: 4 });
            pl.text(288, Math.max.apply(null, pts2.map(q => q.lnk)) + 0.2, 'T に対しては曲がっている', { align: 'left', baseline: 'top', dx: 60, dy: 4, color: '#475467', size: 12.5 });
          } else {
            const xs = pts2.map(q => q.invT), ys = pts2.map(q => q.lnk);
            const pl = Pl.make(canvas, { xmin: Math.min.apply(null, xs) * 0.999, xmax: Math.max.apply(null, xs) * 1.001, ymin: Math.min.apply(null, ys) - 0.2, ymax: Math.max.apply(null, ys) + 0.2, pad: { left: 64, right: 18, top: 18, bottom: 42 } });
            pl.clear(); pl.axes({ xLabel: '1/T (1/K)', yLabel: 'ln k', xFmt: v => v.toExponential(1) });
            pl.scatter(xs.map((x, i) => [x, ys[i]]), { color: Pl.colors[0], r: 4 });
            const b = st.cov(xs, ys) / (st.sd(xs) ** 2), a = st.mean(ys) - b * st.mean(xs);
            pl.line([[xs[0], a + b * xs[0]], [xs[xs.length - 1], a + b * xs[xs.length - 1]]], { color: Pl.colors[1], width: 2.5 });
            pl.text(xs[xs.length - 1], Math.max.apply(null, ys) + 0.2, '1/T なら直線（傾き=b）', { align: 'right', baseline: 'top', dx: -8, dy: 4, color: Pl.colors[1], size: 12.5 });
          }
        }
      },
    },
  });
})();
