'use strict';
/* 多変量解析 */
(function () {
  const T = (window.STATS_TOPICS = window.STATS_TOPICS || []);
  const S = () => window.Stats;
  const P = () => window.Plot;

  /* 2x2 対称行列の固有値・固有ベクトル（PCA・相関で使用） */
  function eig2(a, b, c, d) {
    // 行列 [[a,b],[c,d]]（対称なら b=c）
    const tr = a + d, det = a * d - b * c;
    const disc = Math.sqrt(Math.max(0, tr * tr / 4 - det));
    const l1 = tr / 2 + disc, l2 = tr / 2 - disc;
    const vecFor = l => {
      // (a-l)x + b y = 0 → v = [b, l-a] （bが0でなければ）
      let vx, vy;
      if (Math.abs(b) > 1e-9) { vx = b; vy = l - a; }
      else { vx = l - d; vy = c; if (Math.abs(vx) < 1e-9 && Math.abs(vy) < 1e-9) { vx = 1; vy = 0; } }
      const n = Math.hypot(vx, vy) || 1;
      return [vx / n, vy / n];
    };
    return { l1, l2, v1: vecFor(l1), v2: vecFor(l2) };
  }

  /* --- 1. 相関と共分散 --- */
  T.push({
    section: 'prep1', group: '多変量解析', id: 'correlation', title: '相関・共分散と散布の形',
    summary: '相関係数が散布図の「楕円の細さと傾き」にどう対応するかを、相関を連続的に変えながら見ます。',
    body: `
<p>多変量解析の出発点は、変数どうしの関係を測る<strong>共分散</strong>と<strong>相関係数</strong>です。</p>
<p>$$ \\mathrm{Cov}(X,Y)=\\frac{1}{n-1}\\sum (x_i-\\bar{x})(y_i-\\bar{y}),\\qquad r=\\frac{\\mathrm{Cov}(X,Y)}{s_X s_Y} $$</p>
<p>相関係数 $r$ は $-1 \\le r \\le 1$ に標準化された値で、散布図の形と対応します。</p>
<ul>
<li>$r \\to 1$：右上がりの細い直線状</li>
<li>$r \\to 0$：円形に散らばる（無相関）</li>
<li>$r \\to -1$：右下がりの細い直線状</li>
</ul>
<div class="note">注意：相関は<strong>直線的な</strong>関係しか測れません。また「相関があっても因果があるとは限らない」——第3の変数（交絡）が両方を動かしているだけかもしれません。下で r を動かし、点群の楕円が細くなったり傾いたりする様子を確かめてください。</div>`,
    demo: {
      note: '相関を1や−1に近づけると点群は直線状に、0に近づけると円状になります。青い楕円は分布の広がり（等確率線）を表します。',
      controls: [
        { type: 'range', id: 'r', label: '相関係数 r', min: -0.98, max: 0.98, step: 0.02, value: 0.7 },
        { type: 'range', id: 'n', label: 'データ数', min: 20, max: 300, step: 20, value: 120 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(64 + (p.reseed | 0) * 91);
        const r = p.r;
        const n = Math.round(p.n);
        const xs = [], ys = [];
        for (let i = 0; i < n; i++) {
          const z1 = st.randn(rand), z2 = st.randn(rand);
          xs.push(z1);
          ys.push(r * z1 + Math.sqrt(1 - r * r) * z2);
        }
        const pl = Pl.make(canvas, { xmin: -3.5, xmax: 3.5, ymin: -3.5, ymax: 3.5 });
        pl.clear(); pl.axes({ xLabel: 'X', yLabel: 'Y' });
        pl.scatter(xs.map((x, i) => [x, ys[i]]), { color: Pl.colors[0], r: 3, alpha: 0.5 });
        // 共分散楕円（2σ）
        const e = eig2(1, r, r, 1);
        const ellipse = [];
        for (let a = 0; a <= 60; a++) {
          const t = a / 60 * Math.PI * 2;
          const s1 = 2 * Math.sqrt(e.l1) * Math.cos(t), s2 = 2 * Math.sqrt(e.l2) * Math.sin(t);
          ellipse.push([s1 * e.v1[0] + s2 * e.v2[0], s1 * e.v1[1] + s2 * e.v2[1]]);
        }
        pl.polygon(ellipse, { stroke: Pl.colors[1], width: 2 });
        const rEmp = st.corr(xs, ys);
        pl.text(-3.5, 3.5, '設定 r = ' + r.toFixed(2) + '　（標本 r = ' + rEmp.toFixed(2) + '）', { align: 'left', baseline: 'top', dx: 60, dy: 4, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- 2. 主成分分析 --- */
  T.push({
    section: 'prep1', group: '多変量解析', id: 'pca', title: '主成分分析（PCA）',
    summary: '相関のあるデータを「最もばらつく方向」に座標変換して次元を圧縮するPCAを、第1・第2主成分の軸として描きます。',
    body: `
<p><strong>主成分分析（PCA）</strong>は、相関のある多変数データを、情報（分散）を最大限保ちながら少数の新しい軸（主成分）で表現し直す手法です。</p>
<p>第1主成分は<strong>データが最もばらつく方向</strong>、第2主成分はそれと直交する中で次にばらつく方向……と選びます。数学的には、共分散行列 $\\Sigma$ の<strong>固有ベクトル</strong>が主成分の方向、<strong>固有値</strong>がその方向の分散です。</p>
<p>$$ \\Sigma\\, \\boldsymbol{v}_k = \\lambda_k \\boldsymbol{v}_k,\\qquad \\text{寄与率} = \\frac{\\lambda_k}{\\sum_j \\lambda_j} $$</p>
<p>寄与率は「その主成分がデータ全体の何割の情報を説明するか」。第1・第2主成分の寄与率の合計（累積寄与率）が高ければ、2次元の散布図でデータのほぼ全体像を捉えられます。</p>
<div class="note">下のデータに対し、赤い矢印が第1主成分（最もばらつく方向）、緑が第2主成分。相関を強めると第1主成分に分散が集中し、第1主成分だけで大部分を説明できる＝次元圧縮が効く状態になります。</div>`,
    demo: {
      note: '矢印の長さが各主成分の分散（固有値）。相関を強めると第1主成分（赤）が長くなり寄与率が上がる＝2変数を1軸にまとめやすくなります。',
      controls: [
        { type: 'range', id: 'r', label: '変数間の相関', min: -0.95, max: 0.95, step: 0.05, value: 0.75 },
        { type: 'range', id: 'scale', label: '変数2のスケール', min: 0.3, max: 2, step: 0.1, value: 1 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(202 + (p.reseed | 0) * 43);
        const r = p.r, sc = p.scale;
        const n = 150;
        const xs = [], ys = [];
        for (let i = 0; i < n; i++) {
          const z1 = st.randn(rand), z2 = st.randn(rand);
          xs.push(1.6 * z1);
          ys.push(sc * (r * z1 + Math.sqrt(1 - r * r) * z2) * 1.6);
        }
        const mx = st.mean(xs), my = st.mean(ys);
        const sxx = st.cov(xs, xs), syy = st.cov(ys, ys), sxy = st.cov(xs, ys);
        const e = eig2(sxx, sxy, sxy, syy);
        const total = e.l1 + e.l2;
        const pl = Pl.make(canvas, { xmin: -6, xmax: 6, ymin: -6, ymax: 6 });
        pl.clear(); pl.axes({ xLabel: '変数1', yLabel: '変数2' });
        pl.scatter(xs.map((x, i) => [x, ys[i]]), { color: Pl.colors[0], r: 3, alpha: 0.45 });
        const s1 = 2.2 * Math.sqrt(e.l1), s2 = 2.2 * Math.sqrt(e.l2);
        pl.arrow(mx, my, mx + e.v1[0] * s1, my + e.v1[1] * s1, { color: Pl.colors[1], width: 3 });
        pl.arrow(mx, my, mx + e.v2[0] * s2, my + e.v2[1] * s2, { color: Pl.colors[2], width: 3 });
        pl.legend([
          { label: '第1主成分 (' + (e.l1 / total * 100).toFixed(0) + '%)', color: Pl.colors[1] },
          { label: '第2主成分 (' + (e.l2 / total * 100).toFixed(0) + '%)', color: Pl.colors[2] },
        ]);
      },
    },
  });

  /* --- 3. 判別分析 --- */
  T.push({
    section: 'prep1', group: '多変量解析', id: 'lda', title: '線形判別分析（LDA）',
    summary: '2つのグループを最もよく分ける直線（判別境界）を、群間の差と群内のばらつきの比を最大化する形で可視化します。',
    body: `
<p><strong>線形判別分析（LDA）</strong>は、2つ以上のグループを最もよく分離する軸（判別関数）を見つける手法です。フィッシャーのアイデアは明快で、<strong>「群間のばらつきを大きく、群内のばらつきを小さく」</strong>する方向を選びます。</p>
<p>$$ \\text{最大化}\\quad J(\\boldsymbol{w}) = \\frac{\\boldsymbol{w}^\\top S_B \\boldsymbol{w}}{\\boldsymbol{w}^\\top S_W \\boldsymbol{w}} = \\frac{\\text{群間分散}}{\\text{群内分散}} $$</p>
<p>PCAが「ラベルを無視して最もばらつく方向」を探すのに対し、LDAは「ラベルを分けるのに最も役立つ方向」を探します。目的が違うので、選ばれる軸も異なります。</p>
<div class="note">下の2群（青・オレンジ）に対し、黒い直線が判別境界。2群の中心を離す、または群内のばらつきを小さくすると分離が良くなり、誤分類（境界を越えた点）が減ります。境界に垂直な方向がフィッシャーの判別軸です。</div>`,
    demo: {
      note: '黒い直線が判別境界。群の中心距離を大きく、群内のばらつきを小さくすると、境界の反対側に紛れ込む誤分類点が減ります。',
      controls: [
        { type: 'range', id: 'dist', label: '2群の中心距離', min: 1, max: 8, step: 0.5, value: 4 },
        { type: 'range', id: 'spread', label: '群内のばらつき', min: 0.5, max: 3, step: 0.25, value: 1.2 },
        { type: 'range', id: 'angle', label: '群の並ぶ向き（度）', min: 0, max: 180, step: 10, value: 30 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(303 + (p.reseed | 0) * 59);
        const ang = p.angle * Math.PI / 180;
        const dir = [Math.cos(ang), Math.sin(ang)];
        const c0 = [-dir[0] * p.dist / 2, -dir[1] * p.dist / 2];
        const c1 = [dir[0] * p.dist / 2, dir[1] * p.dist / 2];
        const g0 = [], g1 = [];
        for (let i = 0; i < 50; i++) g0.push([c0[0] + st.randn(rand) * p.spread, c0[1] + st.randn(rand) * p.spread]);
        for (let i = 0; i < 50; i++) g1.push([c1[0] + st.randn(rand) * p.spread, c1[1] + st.randn(rand) * p.spread]);
        // 判別方向 w ∝ Sw^{-1}(m1-m0)。等方性なので w ∝ (m1-m0) = dir
        const m0 = [st.mean(g0.map(q => q[0])), st.mean(g0.map(q => q[1]))];
        const m1 = [st.mean(g1.map(q => q[0])), st.mean(g1.map(q => q[1]))];
        const w = [m1[0] - m0[0], m1[1] - m0[1]];
        const mid = [(m0[0] + m1[0]) / 2, (m0[1] + m1[1]) / 2];
        const thr = w[0] * mid[0] + w[1] * mid[1];
        const pl = Pl.make(canvas, { xmin: -7, xmax: 7, ymin: -7, ymax: 7 });
        pl.clear(); pl.axes({ xLabel: '変数1', yLabel: '変数2' });
        // 誤分類判定
        let err = 0;
        const classify = q => (w[0] * q[0] + w[1] * q[1]) > thr ? 1 : 0;
        g0.forEach(q => { if (classify(q) !== 0) err++; });
        g1.forEach(q => { if (classify(q) !== 1) err++; });
        pl.scatter(g0, { color: Pl.colors[0], r: 4, alpha: 0.7 });
        pl.scatter(g1, { color: Pl.colors[1], r: 4, alpha: 0.7 });
        // 判別境界：w·x = thr。方向 perp = (-w[1], w[0])
        const wn = Math.hypot(w[0], w[1]) || 1;
        const perp = [-w[1] / wn, w[0] / wn];
        const p1 = [mid[0] - perp[0] * 20, mid[1] - perp[1] * 20];
        const p2 = [mid[0] + perp[0] * 20, mid[1] + perp[1] * 20];
        pl.line([p1, p2], { color: Pl.ink, width: 2 });
        pl.legend([{ label: 'グループA', color: Pl.colors[0] }, { label: 'グループB', color: Pl.colors[1] }]);
        pl.text(-7, 7, '誤分類 ' + err + ' / 100 点', { align: 'left', baseline: 'top', dx: 60, dy: 4, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- 4. クラスター分析（階層的） --- */
  T.push({
    section: 'prep1', group: '多変量解析', id: 'clustering', title: '階層的クラスター分析',
    summary: '近いものから順に併合してデータの階層構造を作り、樹形図（デンドログラム）を「どの高さで切るか」で見ます。',
    body: `
<p><strong>階層的クラスター分析</strong>は、最初は各データを1つのクラスタとし、<strong>最も近いクラスタどうしを順に併合</strong>していく手法です。結果は<strong>デンドログラム（樹形図）</strong>で表され、「どの高さで枝を切るか」でクラスタ数を後から決められます。</p>
<p>クラスタ間の距離の測り方（連結法）にはいくつかあります。</p>
<table class="simple">
<tr><th>連結法</th><th>クラスタ間距離の定義</th></tr>
<tr><td>単連結法（最近隣）</td><td>最も近い点どうしの距離</td></tr>
<tr><td>完全連結法（最遠隣）</td><td>最も遠い点どうしの距離</td></tr>
<tr><td>群平均法</td><td>全ペアの平均距離</td></tr>
<tr><td>ウォード法</td><td>併合による分散増加が最小</td></tr>
</table>
<div class="note">下は少数の点を階層的に併合したデンドログラム。横の点線（切断線）を上下に動かすと、その高さで分かれるクラスタ数と色分けが変わります。低く切れば多く、高く切れば少ないクラスタになります。</div>`,
    demo: {
      note: '点線（切断の高さ）を動かすと、線より下でつながっている点が同じクラスタ（同色）になります。切る高さでクラスタ数を柔軟に選べるのが階層法の利点です。',
      controls: [
        { type: 'range', id: 'cut', label: '切断の高さ', min: 0.5, max: 10, step: 0.25, value: 4 },
        { type: 'button', id: 'reseed', label: 'データ再生成' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(404 + (p.reseed | 0) * 73);
        // 3つの塊から12点生成
        const centers = [[-3, 0], [3, 1], [0, -3]];
        const pts = [];
        for (const c of centers) for (let i = 0; i < 4; i++) pts.push([c[0] + st.randn(rand) * 0.7, c[1] + st.randn(rand) * 0.7]);
        const N = pts.length;
        // 群平均法で階層併合。leaf の順序と併合高さを記録
        let clusters = pts.map((pt, i) => ({ id: i, members: [i], x: null }));
        const dist = (A, B) => {
          let s = 0, cnt = 0;
          for (const i of A.members) for (const j of B.members) { s += Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]); cnt++; }
          return s / cnt;
        };
        const merges = [];
        while (clusters.length > 1) {
          let bi = 0, bj = 1, bd = Infinity;
          for (let i = 0; i < clusters.length; i++) for (let j = i + 1; j < clusters.length; j++) {
            const d = dist(clusters[i], clusters[j]);
            if (d < bd) { bd = d; bi = i; bj = j; }
          }
          merges.push({ a: clusters[bi], b: clusters[bj], height: bd });
          const merged = { members: clusters[bi].members.concat(clusters[bj].members) };
          clusters = clusters.filter((_, k) => k !== bi && k !== bj);
          clusters.push(merged);
        }
        // leaf順序を決める（併合ツリーを辿る）
        const order = [];
        (function collect(node) {
          if (node.members.length === 1) { order.push(node.members[0]); return; }
          // 対応する merge を探す
          for (const m of merges) {
            const mm = m.a.members.concat(m.b.members);
            if (mm.length === node.members.length && mm.every(x => node.members.includes(x))) {
              collect({ members: m.a.members }); collect({ members: m.b.members }); return;
            }
          }
          node.members.forEach(x => order.push(x));
        })({ members: clusters[0].members });
        const leafX = {};
        order.forEach((leaf, i) => { leafX[leaf] = i; });
        const maxH = Math.max.apply(null, merges.map(m => m.height)) * 1.1;
        const pl = Pl.make(canvas, { xmin: -0.7, xmax: N - 0.3, ymin: 0, ymax: maxH, pad: { left: 46, right: 16, top: 18, bottom: 52 } });
        pl.clear();
        pl.axes({ yLabel: '併合の距離（高さ）', xTicks: [], xFmt: () => '' });
        // 各クラスタのx座標（併合ノードは子の中点）
        const nodeX = {};
        order.forEach(leaf => { nodeX['L' + leaf] = leafX[leaf]; });
        const ctx = pl.ctx;
        // 切断高さで色分けするための、切断時点のクラスタ判定
        const cut = p.cut;
        // union-find で cut 未満の併合のみ結合
        const parent = pts.map((_, i) => i);
        const find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
        for (const m of merges) if (m.height < cut) { const ra = find(m.a.members[0]), rb = find(m.b.members[0]); if (ra !== rb) parent[ra] = rb; }
        const rootColor = {};
        let colorIdx = 0;
        const colorOf = leaf => { const r = find(leaf); if (rootColor[r] === undefined) rootColor[r] = colorIdx++; return Pl.colors[rootColor[r] % Pl.colors.length]; };
        // デンドログラムの枝を描画
        const nodeInfo = {}; // key -> {x, height}
        order.forEach(leaf => { nodeInfo['L' + leaf] = { x: leafX[leaf], h: 0, members: [leaf] }; });
        let mi = 0;
        const keyOf = members => 'M' + members.slice().sort((a, b) => a - b).join('_');
        order.forEach(leaf => { nodeInfo[keyOf([leaf])] = { x: leafX[leaf], h: 0, members: [leaf] }; });
        for (const m of merges) {
          const ka = keyOf(m.a.members), kb = keyOf(m.b.members);
          const na = nodeInfo[ka], nb = nodeInfo[kb];
          if (!na || !nb) continue;
          const h = m.height;
          const col = (h < cut) ? colorOf(m.a.members[0]) : Pl.gray;
          ctx.strokeStyle = col; ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pl.X(na.x), pl.Y(na.h)); ctx.lineTo(pl.X(na.x), pl.Y(h));
          ctx.lineTo(pl.X(nb.x), pl.Y(h)); ctx.lineTo(pl.X(nb.x), pl.Y(nb.h));
          ctx.stroke();
          const merged = m.a.members.concat(m.b.members);
          nodeInfo[keyOf(merged)] = { x: (na.x + nb.x) / 2, h, members: merged };
          mi++;
        }
        // 葉のマーカー
        order.forEach(leaf => {
          ctx.fillStyle = colorOf(leaf);
          ctx.beginPath(); ctx.arc(pl.X(leafX[leaf]), pl.Y(0), 4, 0, Math.PI * 2); ctx.fill();
        });
        // 切断線
        pl.hline(cut, { color: Pl.colors[1], dash: [6, 4], label: '切断 h=' + cut.toFixed(1) });
        const nClusters = new Set(pts.map((_, i) => find(i))).size;
        pl.text(N - 0.3, maxH, nClusters + ' クラスタに分割', { align: 'right', baseline: 'top', dx: -6, dy: 4, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- 5. 因子分析 --- */
  T.push({
    section: 'prep1', group: '多変量解析', id: 'factor', title: '因子分析（潜在変数）',
    summary: '観測された多数の変数の背後にある「共通因子」を推定する考え方を、共通因子と独自因子の分解として見ます。',
    body: `
<p><strong>因子分析</strong>は、多数の観測変数の相関の背後に、少数の<strong>共通因子（潜在変数）</strong>があると仮定してその構造を推定します。例：5教科の点数の背後に「文系能力」「理系能力」という2因子を想定する、など。</p>
<p>各観測変数 $x_j$ は、共通因子 $f$ と、その変数固有の<strong>独自因子</strong> $u_j$ の和で表されます。</p>
<p>$$ x_j = \\underbrace{\\lambda_{j1}f_1 + \\lambda_{j2}f_2 + \\cdots}_{\\text{共通因子}} + \\underbrace{u_j}_{\\text{独自因子}} $$</p>
<p>係数 $\\lambda_{jk}$ は<strong>因子負荷量</strong>で、「変数 $x_j$ が因子 $f_k$ とどれだけ強く結びつくか」を表します。PCAが分散最大化なのに対し、因子分析は「共通因子で説明できる部分（共通性）」と「各変数固有の部分（独自性）」を分離するのが特徴です。</p>
<div class="note">下は変数ごとの分散を「共通因子で説明される部分（共通性）」と「独自因子（誤差）」に分解した積み上げ図。共通性を上げると、変数群が少数の共通因子でよく説明できる（＝因子分析が有効な）状態になります。</div>`,
    demo: {
      note: '青が共通因子で説明される分散（共通性）、灰が各変数独自の分散（独自性）。共通性が高いほど、背後の少数因子でデータをうまくまとめられます。',
      controls: [
        { type: 'range', id: 'commonality', label: '共通性の強さ', min: 0.1, max: 0.95, step: 0.05, value: 0.6 },
        { type: 'range', id: 'nvars', label: '観測変数の数', min: 3, max: 8, step: 1, value: 6 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(505 + (p.reseed | 0) * 83);
        const m = Math.round(p.nvars);
        const items = [];
        for (let i = 0; i < m; i++) {
          const comm = Math.min(0.98, Math.max(0.02, p.commonality + (rand() - 0.5) * 0.25));
          items.push({ common: comm, unique: 1 - comm });
        }
        const pl = Pl.make(canvas, { xmin: 0.3, xmax: m + 0.7, ymin: 0, ymax: 1.05 });
        pl.clear();
        pl.axes({ xLabel: '観測変数', yLabel: '分散の割合', xTicks: [], xFmt: () => '', yTicks: [0, 0.25, 0.5, 0.75, 1] });
        const ctx = pl.ctx;
        items.forEach((it, i) => {
          const x = i + 1;
          // 共通性（下）
          pl.bars([{ x0: x - 0.32, x1: x + 0.32, y: it.common }], { color: Pl.colors[0], alpha: 0.85 });
          // 独自性（上に積む）
          const x0 = pl.X(x - 0.32), x1 = pl.X(x + 0.32);
          ctx.fillStyle = Pl.gray; ctx.globalAlpha = 0.55;
          ctx.fillRect(x0, pl.Y(1), Math.max(1, x1 - x0 - 1), pl.Y(it.common) - pl.Y(1));
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#475467'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          ctx.fillText('x' + (i + 1), pl.X(x), pl.Y(0) + 6);
        });
        const avgComm = st.mean(items.map(it => it.common));
        pl.legend([{ label: '共通性（共通因子）', color: Pl.colors[0] }, { label: '独自性（誤差）', color: Pl.gray }]);
        pl.text(0.3, 1.05, '平均共通性 = ' + avgComm.toFixed(2), { align: 'left', baseline: 'top', dx: 60, dy: 4, color: '#475467', size: 12.5 });
      },
    },
  });
})();
