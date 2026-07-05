'use strict';
/* ケモメトリクス（PLS回帰 / PLS-DA / OPLS-DA） — 準1級範囲外 */
(function () {
  const T = (window.STATS_TOPICS = window.STATS_TOPICS || []);
  const S = () => window.Stats;
  const TH = () => window.PlotlyTheme;

  /* なめらかな「スペクトルの山」型の負荷ベクトルを作る */
  function bump(p, center, width) {
    const v = [];
    for (let j = 0; j < p; j++) v.push(Math.exp(-((j - center) ** 2) / (2 * width * width)));
    const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
    return v.map(x => x / n);
  }

  /* 2群のスペクトル様データを生成。class ±1、予測方向 pd と交絡方向 co を持つ */
  function makeClassData(rand, n, p, sep, orthAmt, noise) {
    const st = S();
    const pd = bump(p, p * 0.32, p * 0.06);   // クラスを分ける成分
    const co = bump(p, p * 0.68, p * 0.08);   // クラスと無関係な交絡（ロット差など）
    const X = [], cls = [];
    for (let i = 0; i < n; i++) {
      const c = i < n / 2 ? 1 : -1;
      const batch = st.randn(rand); // 交絡因子（装置差・ロット）
      const row = [];
      for (let j = 0; j < p; j++) {
        row.push(c * sep * pd[j] + orthAmt * batch * co[j] + noise * st.randn(rand) + 1.0 * bump(p, p * 0.5, p * 0.3)[j]);
      }
      X.push(row); cls.push(c);
    }
    return { X, cls, pd, co };
  }

  /* --- 1. PLS回帰 --- */
  T.push({
    section: 'chemo', id: 'pls', title: 'PLS回帰（部分最小二乗回帰）',
    summary: 'スペクトルのように「変数が多くて互いに強く相関する」データから、少数の潜在成分を通して物性値を予測する回帰法です。',
    body: `
<p>近赤外スペクトルやクロマトグラムは、<strong>変数（波長・保持時間）が数百〜数千あるのに、サンプル数はずっと少ない</strong>のがふつうです。しかも隣りあう波長は強く相関しています。この状況では<a href="#/prep1/multiple-regression">通常の重回帰</a>は<a href="#/prep1/multicollinearity">多重共線性</a>で破綻します（$X^\\top X$ が逆行列を持てない）。</p>
<h3>潜在変数という発想</h3>
<p><strong>PLS回帰（部分最小二乗）</strong>は、$X$ を少数の<strong>潜在成分（latent variable）</strong>に圧縮してから回帰します。ここが<a href="#/prep1/pca">主成分分析</a>と決定的に違う点で、PCA が「$X$ の分散が最大の方向」を探すのに対し、PLS は<strong>「$X$ の分散が大きく、かつ目的変数 $y$ との共分散も大きい方向」</strong>を探します。予測に役立つ方向を優先して抜き出すわけです。</p>
<p>$$ \\boldsymbol{t}_a=X\\boldsymbol{w}_a \\quad(\\boldsymbol{w}_a\\text{は }\\mathrm{Cov}(X\\boldsymbol{w},\\,y)\\text{ を最大化する方向}) $$</p>
<p>成分数（使う潜在変数の数）が最重要のハイパーパラメータで、少なすぎると当てられず（過少）、多すぎるとノイズまで拾って<a href="#/prep1/overfitting">過学習</a>します。<a href="#/prep1/crossval">交差検証</a>で最適な成分数を選ぶのが定石です。漢方・生薬の品質管理では、指紋（フィンガープリント）から指標成分量や薬効指標を予測するのに使われます。</p>
<div class="note">下は潜在的に2成分で駆動されるスペクトル様データ。PLSの成分数を増やすと予測（実測 vs 予測の散布）が対角線に乗り、R²が上がります。ただし真の成分数（2）を超えて増やすとノイズを拾い、かえって悪化する場合があります。ノイズを上げて過学習の起こりやすさも確かめてください。</div>`,
    demo: {
      heading: '📈 実測 vs 予測（PLS）',
      note: '点が対角線（y=x）に乗るほど予測が良好。成分数を増やすと当てはまりは上がりますが、真の成分数を超えるとノイズを学習して汎化が崩れることがあります。',
      controls: [
        { type: 'range', id: 'ncomp', label: '潜在成分の数', min: 1, max: 8, step: 1, value: 2 },
        { type: 'range', id: 'noise', label: '測定ノイズ', min: 0.05, max: 1.2, step: 0.05, value: 0.3 },
        { type: 'range', id: 'n', label: 'サンプル数', min: 20, max: 80, step: 5, value: 45 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      plot(div, p, Plotly) {
        const st = S();
        const rand = st.rng(1200 + (p.reseed | 0) * 29);
        const n = Math.round(p.n), pdim = 24;
        const L1 = bump(pdim, 6, 2.2), L2 = bump(pdim, 16, 2.8);
        const X = [], y = [];
        for (let i = 0; i < n; i++) {
          const f1 = st.randn(rand), f2 = st.randn(rand);
          const row = [];
          for (let j = 0; j < pdim; j++) row.push(f1 * L1[j] + f2 * L2[j] + p.noise * st.randn(rand));
          X.push(row);
          y.push([4 * f1 - 2 * f2 + 10 + 0.5 * p.noise * st.randn(rand)]);
        }
        const ncomp = Math.min(Math.round(p.ncomp), pdim - 1);
        const model = st.plsNipals(X, y, ncomp);
        // 予測 yhat = (X - xmean) B + ymean
        const yhat = X.map(row => {
          const xc = row.map((v, j) => v - model.xmean[j]);
          return st.dot(xc, model.B.map(r => r[0])) + model.ymean[0];
        });
        const yv = y.map(r => r[0]);
        const ybar = st.mean(yv);
        let ssr = 0, sst = 0;
        for (let i = 0; i < n; i++) { ssr += (yv[i] - yhat[i]) ** 2; sst += (yv[i] - ybar) ** 2; }
        const r2 = 1 - ssr / sst;
        const lo = Math.min.apply(null, yv.concat(yhat)) - 1, hi = Math.max.apply(null, yv.concat(yhat)) + 1;
        const data = [
          { type: 'scatter', mode: 'lines', x: [lo, hi], y: [lo, hi], line: { color: '#c7cdd8', dash: 'dash', width: 1.5 }, hoverinfo: 'skip', showlegend: false },
          { type: 'scatter', mode: 'markers', x: yv, y: yhat, marker: { size: 8, color: '#4f6df5', opacity: 0.75 }, showlegend: false, hovertemplate: '実測 %{x:.1f}<br>予測 %{y:.1f}<extra></extra>' },
        ];
        const layout = TH().layout({
          xaxis: { title: '実測値 y', range: [lo, hi] },
          yaxis: { title: '予測値 ŷ', range: [lo, hi], scaleanchor: 'x' },
          margin: { l: 52, r: 12, t: 28, b: 42 },
          title: { text: ncomp + ' 成分　R² = ' + r2.toFixed(3), font: { size: 13 }, x: 0.5 },
        });
        Plotly.react(div, data, layout, TH().config);
      },
    },
  });

  /* --- 2. PLS-DA --- */
  T.push({
    section: 'chemo', id: 'pls-da', title: 'PLS-DA（判別のためのPLS）',
    summary: 'PLS回帰の目的変数を「クラス（0/1）」にして分類に使う手法。多変数の指紋データから2群を分けるスコアプロットを描きます。',
    body: `
<p><strong>PLS-DA</strong>は、<a href="#/chemo/pls">PLS回帰</a>の目的変数を<strong>クラスを表すダミー変数</strong>（例：真正品=+1／偽和品=−1）に置き換え、分類に転用した手法です。ケモメトリクスでの<a href="#/prep1/lda">判別分析</a>の定番で、変数がサンプル数より多い高次元データでもそのまま使えます。</p>
<h3>スコアプロットで群を見る</h3>
<p>PLS-DAは、クラスの違いをよく説明する潜在成分 $\\boldsymbol{t}_1,\\boldsymbol{t}_2$ を作ります。各サンプルをこの成分の座標（<strong>スコア</strong>）で描いた<strong>スコアプロット</strong>を見ると、群がどれだけ分離しているかが一目で分かります。どの変数（波長・成分）が分離に効いたかは<strong>負荷量（ローディング）</strong>で読み取ります。</p>
<p>漢方・生薬の品質管理では、産地判別・真贋判定・製法の違いの検出などに広く使われます。ただしPLS-DAは<strong>群を無理にでも分けてしまう</strong>過学習傾向があるため、必ず<a href="#/prep1/crossval">交差検証</a>や並べ替え検定で「その分離は本物か」を確認します。</p>

<h3>潜在成分はどう作られるか</h3>
<p>PLS-DAは特別な分類器ではなく、<strong>目的変数をクラスのダミー $y\\in\\{+1,-1\\}$ にした<a href="#/chemo/pls">PLS回帰</a>そのもの</strong>です。第1成分の重み $\\boldsymbol{w}_1$ は $\\mathrm{Cov}(X\\boldsymbol{w},y)$ を最大化する方向でしたが、中心化した $X$ とダミー $y$ ではこれが具体的な形になります。</p>
<p>$$ \\boldsymbol{w}_1 \\;\\propto\\; X^\\top\\boldsymbol{y} \\;=\\; \\sum_i \\boldsymbol{x}_i\\,y_i \\;=\\; \\tfrac{n}{2}\\,(\\bar{\\boldsymbol{x}}_A-\\bar{\\boldsymbol{x}}_B) $$</p>
<p>右側の等号は、$y_i=+1$（クラスA）と $y_i=-1$（クラスB）で和を分ければ $\\sum_A\\boldsymbol{x}_i-\\sum_B\\boldsymbol{x}_i$ になり、各群 $n/2$ 個なら $\\tfrac{n}{2}(\\bar{\\boldsymbol{x}}_A-\\bar{\\boldsymbol{x}}_B)$ になるからです。つまり<strong>第1予測方向は「2群の平均ベクトルの差」そのもの</strong>——これがスコアプロットで群が横に分かれる正体です。</p>
<p><a href="#/prep1/lda">線形判別分析（LDA）</a>との違いもここで見えます。LDAは同じ平均差を<strong>群内共分散 $S_W$ の逆行列で割って</strong>白色化しますが（$\\boldsymbol{w}\\propto S_W^{-1}(\\bar{\\boldsymbol{x}}_A-\\bar{\\boldsymbol{x}}_B)$）、変数がサンプルより多い（$p>n$）と $S_W$ が特異で逆行列を持てません。PLS-DAは逆行列を取らず共分散だけで方向を決めるので、<strong>高次元でもそのまま動く</strong>——ここがケモメトリクスでLDAでなくPLS-DAが使われる理由です。分類は予測値 $\\hat y$ の符号（多クラスならクラスごとにダミー列を作り最大の $\\hat y$）で行います。</p>

<h3>前提条件と、崩れたときの影響</h3>
<table class="simple">
<thead><tr><th>前提</th><th>崩れると起きること</th><th>対処・代替</th></tr></thead>
<tbody>
<tr><td>変数のスケールがそろっている</td><td>分散の大きい変数（強い吸収帯）が方向を独占し、微量マーカーが埋もれる</td><td>オートスケーリング（各変数を標準化）／Pareto スケーリング</td></tr>
<tr><td>$p$ に対し十分な $n$ とCV</td><td>$p\\gg n$ ではランダムなラベルでも標本内で完全分離＝過学習。「きれいな分離」が情報ゼロのこともある</td><td>交差検証で成分数を決める・並べ替え検定で有意性を確認（下記L5）</td></tr>
<tr><td>クラスサイズが均衡</td><td>不均衡だと多数派へ予測が偏り、少数派の感度が落ちる（見かけの正解率は高い）</td><td>クラス重み・バランス化・balanced accuracy／混同行列で評価</td></tr>
<tr><td>群を分けるのはクラス由来の変動</td><td>ロット差・装置差など交絡が予測軸に混入し、産地でなく測定日を分けてしまう</td><td><a href="#/chemo/opls-da">OPLS-DA</a>で直交変動を分離・実験計画でブロック化</td></tr>
<tr><td>群構造が線形に分けられる</td><td>非線形な群配置は潜在成分では捉えきれない</td><td>カーネルPLS・非線形判別／特徴量の変換</td></tr>
</tbody>
</table>

<h3>有意性と実質的な意味</h3>
<p>PLS-DAで一番危険なのは「スコアプロットで群が分かれた＝意味がある」と読むことです。<strong>標本内の当てはまり $R^2Y$ はほぼ常に1近くまで上がる</strong>ため、当てはまりの良さは証拠になりません。実際、$n=20,\\ p=200$ のデータに<strong>でたらめなクラスラベル</strong>を貼っても、2成分PLS-DAの標本内正解率は<strong>100%</strong>になります（どんなラベルでも完全分離できてしまう）。</p>
<p>そこで有意性は<strong>並べ替え検定（permutation test）</strong>で測ります。クラスラベルを何百回もシャッフルして毎回モデルを組み直し、<strong>交差検証</strong>で得た $Q^2$（または CV 正解率）の分布＝帰無分布を作り、実データの $Q^2$ がその上位何%に入るかで $p$ 値を出します。先の「でたらめラベル」でも、一つ抜き交差検証（LOO-CV）の正解率は<strong>約0.5（偶然と同じ）</strong>に落ちます——標本内の100%とCVの50%のギャップが、そのまま過学習の大きさです。</p>
<p>報告では「分離した」ではなく、<strong>$Q^2$・CV混同行列・並べ替え $p$ 値・効果量（群間距離やマーカーのVIP）</strong>をそろえます。統計的に有意でも、実務では「その差で真贋・産地を判定できる誤分類率か」まで見て初めて意味を持ちます。</p>

<div class="note">下は2群（青・オレンジ）の高次元スペクトルデータのスコアプロット。クラスの分離度を上げると2群が左右に離れ、ノイズや交絡（ロット差など）を増やすと重なって誤分類が増えます。次の<a href="#/chemo/opls-da">OPLS-DA</a>では、この「分離軸」と「無関係なばらつき軸」を分けて見やすくします。</div>`,
    demo: {
      heading: '🎯 PLS-DA スコアプロット（t₁ vs t₂）',
      note: 'クラス分離度を上げると2群が離れます。交絡（ロット差）を増やすと、分離に無関係なばらつきが t₁・t₂ に混じって群が重なりがちに。分離軸が斜めになることもあります。',
      controls: [
        { type: 'range', id: 'sep', label: 'クラスの分離度', min: 0, max: 3, step: 0.2, value: 1.5 },
        { type: 'range', id: 'orth', label: '交絡（ロット差など）', min: 0, max: 3, step: 0.2, value: 1 },
        { type: 'range', id: 'noise', label: '測定ノイズ', min: 0.1, max: 1, step: 0.1, value: 0.3 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      plot(div, p, Plotly) {
        const st = S();
        const rand = st.rng(1300 + (p.reseed | 0) * 37);
        const n = 60, pdim = 24;
        const { X, cls } = makeClassData(rand, n, pdim, p.sep, p.orth, p.noise);
        const Y = cls.map(c => [c]);
        const model = st.plsNipals(X, Y, 2);
        const T2 = model.T; // n×2
        const g1x = [], g1y = [], g2x = [], g2y = [];
        for (let i = 0; i < n; i++) {
          if (cls[i] > 0) { g1x.push(T2[i][0]); g1y.push(T2[i][1]); }
          else { g2x.push(T2[i][0]); g2y.push(T2[i][1]); }
        }
        const data = [
          { type: 'scatter', mode: 'markers', x: g1x, y: g1y, marker: { size: 9, color: '#4f6df5', opacity: 0.8 }, name: 'クラスA（真正品）' },
          { type: 'scatter', mode: 'markers', x: g2x, y: g2y, marker: { size: 9, color: '#e4572e', opacity: 0.8 }, name: 'クラスB（偽和品）' },
        ];
        const layout = TH().layout({
          showlegend: true, legend: { x: 0.5, y: 1.12, xanchor: 'center', orientation: 'h', font: { size: 11 } },
          xaxis: { title: '第1成分 t₁' }, yaxis: { title: '第2成分 t₂' },
          margin: { l: 52, r: 12, t: 34, b: 42 },
        });
        Plotly.react(div, data, layout, TH().config);
      },
    },
  });

  /* --- 3. OPLS-DA --- */
  T.push({
    section: 'chemo', id: 'opls-da', title: 'OPLS-DA（直交補正つきPLS-DA）',
    summary: 'クラスに関係する変動と、関係しない変動（ロット差・装置差）を分離。分離軸を1本に集約して、解釈しやすいスコアプロットにします。',
    body: `
<p>PLS-DAのスコアプロットでは、クラスを分ける情報が第1・第2成分に<strong>斜めに散らばって</strong>しまい、「どの軸がクラスの違いか」が読みにくいことがあります。原因は、クラスとは無関係な大きな変動（ロット差・装置差・日間差＝<strong>直交変動</strong>）が成分に混ざるためです。</p>
<h3>予測成分と直交成分に分ける</h3>
<p><strong>OPLS-DA</strong>は、$X$ の変動を2種類に分解します。</p>
<ul>
<li><strong>予測成分（predictive）</strong> $t_{\\mathrm{p}}$：クラスの違いに関係する変動。横軸に集約する。</li>
<li><strong>直交成分（orthogonal）</strong> $t_{\\mathrm{o}}$：クラスと無関係な変動。縦軸へ追い出す。</li>
</ul>
<p>こうすると、<strong>クラスの分離はすべて横軸（1本）に乗り</strong>、縦軸は「クラスと関係ないばらつき」を表します。予測性能自体はPLS-DAと基本的に同じですが、<strong>解釈が格段にしやすく</strong>なるのが利点です。「どの成分がクラスを分けるのか」を負荷量から読みやすくなるため、メタボロミクスや生薬フィンガープリントの<strong>バイオマーカー探索</strong>で標準的に使われます。</p>
<div class="note">下は同じデータを OPLS-DA で描いたもの。<strong>横軸（予測成分）だけで2群が分離</strong>し、縦軸（直交成分）はクラスと無関係なばらつき＝交絡を上げると縦に伸びます。<a href="#/chemo/pls-da">PLS-DA</a>の斜めの散らばりと見比べてください。分離が1軸にまとまるぶん、解釈がクリアです。</div>`,
    demo: {
      heading: '🎯 OPLS-DA スコアプロット（予測成分 vs 直交成分）',
      note: '2群は横軸（予測成分）で分離、縦軸（直交成分）はクラスと無関係なばらつき。交絡を増やすと点が縦に伸びるだけで、横方向の分離は保たれます。ここがOPLS-DAの読みやすさです。',
      controls: [
        { type: 'range', id: 'sep', label: 'クラスの分離度', min: 0, max: 3, step: 0.2, value: 1.5 },
        { type: 'range', id: 'orth', label: '交絡（ロット差など）', min: 0, max: 3, step: 0.2, value: 1.5 },
        { type: 'range', id: 'noise', label: '測定ノイズ', min: 0.1, max: 1, step: 0.1, value: 0.3 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      plot(div, p, Plotly) {
        const st = S();
        const rand = st.rng(1400 + (p.reseed | 0) * 41);
        const n = 60, pdim = 24;
        const { X, cls } = makeClassData(rand, n, pdim, p.sep, p.orth, p.noise);
        // 中心化
        const { Xc } = st.center(X);
        // 予測方向: クラス平均差
        const idx1 = [], idx0 = [];
        cls.forEach((c, i) => (c > 0 ? idx1 : idx0).push(i));
        const m1 = new Array(pdim).fill(0), m0 = new Array(pdim).fill(0);
        idx1.forEach(i => Xc[i].forEach((v, j) => m1[j] += v / idx1.length));
        idx0.forEach(i => Xc[i].forEach((v, j) => m0[j] += v / idx0.length));
        let wp = m1.map((v, j) => v - m0[j]);
        const wpn = st.norm(wp) || 1; wp = wp.map(v => v / wpn);
        const tp = Xc.map(row => st.dot(row, wp)); // 予測スコア
        // 予測成分を除いた残差
        const Xres = Xc.map((row, i) => row.map((v, j) => v - tp[i] * wp[j]));
        // 直交方向: 残差の最大分散方向（PC1）
        const C = st.matmul(st.transpose(Xres), Xres);
        const eig = st.eigSym(C);
        const wo = eig.vectors[0];
        const to = Xres.map(row => st.dot(row, wo)); // 直交スコア
        const g1x = [], g1y = [], g2x = [], g2y = [];
        for (let i = 0; i < n; i++) {
          if (cls[i] > 0) { g1x.push(tp[i]); g1y.push(to[i]); }
          else { g2x.push(tp[i]); g2y.push(to[i]); }
        }
        const data = [
          { type: 'scatter', mode: 'markers', x: g1x, y: g1y, marker: { size: 9, color: '#4f6df5', opacity: 0.8 }, name: 'クラスA（真正品）' },
          { type: 'scatter', mode: 'markers', x: g2x, y: g2y, marker: { size: 9, color: '#e4572e', opacity: 0.8 }, name: 'クラスB（偽和品）' },
          { type: 'scatter', mode: 'lines', x: [0, 0], y: [Math.min.apply(null, to) - 0.5, Math.max.apply(null, to) + 0.5], line: { color: '#c7cdd8', dash: 'dot', width: 1 }, hoverinfo: 'skip', showlegend: false },
        ];
        const layout = TH().layout({
          showlegend: true, legend: { x: 0.5, y: 1.12, xanchor: 'center', orientation: 'h', font: { size: 11 } },
          xaxis: { title: '予測成分 t_p（クラスを分ける軸）' },
          yaxis: { title: '直交成分 t_o（クラスと無関係）' },
          margin: { l: 52, r: 12, t: 34, b: 42 },
        });
        Plotly.react(div, data, layout, TH().config);
      },
    },
  });
})();
