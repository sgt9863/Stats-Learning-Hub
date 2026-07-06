'use strict';
/* 発展2: 判別(SVM/ROC)・多変量その他・分割表・欠測・計算統計・標本調査・ブロック計画 */
(function () {
  const T = (window.STATS_TOPICS = window.STATS_TOPICS || []);
  const S = () => window.Stats;
  const P = () => window.Plot;

  /* --- サポートベクターマシン --- */
  T.push({
    section: 'prep1', group: '多変量解析', id: 'svm', title: 'サポートベクターマシン（マージン最大化）',
    summary: '2クラスを分ける境界のうち「一番余裕（マージン）が大きい」ものを選ぶSVMの発想と、サポートベクターの役割を見ます。',
    body: `
<p>2クラスを直線（超平面）で分けるとき、境界の引き方は無数にあります。<strong>SVM</strong>は、両クラスから最も離れた——<strong>マージン（余白）が最大</strong>の境界を選びます。</p>
<p>$$ \\max_{\\boldsymbol w,b}\\ \\frac{2}{\\|\\boldsymbol w\\|}\\quad \\text{s.t.}\\ y_i(\\boldsymbol w^\\top\\boldsymbol x_i+b)\\ge 1 $$</p>
<p>マージンの縁に接する少数の点を<strong>サポートベクター</strong>と呼び、境界はこれらだけで決まります（他の点は動かしても境界は不変）。線形分離できないときは<strong>ソフトマージン</strong>（誤分類を許すスラック）や<strong>カーネル法</strong>（高次元へ写して非線形分離）を使います。<a href="#/prep1/lda">判別分析</a>が分布の仮定に基づくのに対し、SVMは境界そのものを最適化する点が対照的です。</p>
<h3>なぜマージンが $2/\\|\\boldsymbol w\\|$ か</h3>
<p>境界を $\\boldsymbol w^\\top\\boldsymbol x+b=0$、両側のマージン縁を $\\boldsymbol w^\\top\\boldsymbol x+b=\\pm1$ と置くと、点の超平面への距離は $\\frac{|\\boldsymbol w^\\top\\boldsymbol x+b|}{\\|\\boldsymbol w\\|}$ なので、2本の縁の間隔（マージン幅）は $\\frac{2}{\\|\\boldsymbol w\\|}$。<strong>マージン最大化 ＝ $\\|\\boldsymbol w\\|$ 最小化</strong>で、制約 $y_i(\\boldsymbol w^\\top\\boldsymbol x_i+b)\\ge1$ の下で $\\frac12\\|\\boldsymbol w\\|^2$ を最小化する凸2次計画になります。ラグランジュ双対を解くと最適 $\\boldsymbol w=\\sum_i\\alpha_i y_i\\boldsymbol x_i$ で、<strong>縁に乗る点だけ $\\alpha_i>0$（サポートベクター）、残りは $\\alpha_i=0$</strong>——だから境界が少数の点で決まります。双対形が内積 $\\boldsymbol x_i^\\top\\boldsymbol x_j$ だけで書けることが、それをカーネル $K(\\boldsymbol x_i,\\boldsymbol x_j)$ に置き換える<strong>カーネルトリック</strong>（明示的に高次元へ写像せず非線形分離）を可能にします。</p>
<h3>前提条件と手法選択のトレードオフ</h3>
<table class="simple">
<tr><th>要素</th><th>崩れると／効かせすぎると</th><th>調整</th></tr>
<tr><td>正則化パラメータ $C$</td><td>大：誤分類を嫌い過学習（ハードマージン寄り）／小：緩すぎて過少適合</td><td>交差検証で選ぶ</td></tr>
<tr><td>カーネル・バンド幅（RBFのγ）</td><td>複雑にしすぎると訓練は完璧でも汎化崩壊</td><td>γ・次数を<a href="#/prep1/crossval">CV</a>で選ぶ</td></tr>
<tr><td>特徴のスケール</td><td>距離ベースなので単位の大きい変数が支配</td><td>標準化が必須</td></tr>
<tr><td>クラス不均衡</td><td>多数派に寄る</td><td>クラス重み・閾値調整</td></tr>
</table>
<p>他手法との対比：<a href="#/prep1/logistic">ロジスティック回帰</a>は確率を出し係数が解釈しやすい一方、SVMは<strong>確率を直接出さず</strong>（要校正）解釈性は劣るが、高次元・非線形で強い。<a href="#/prep1/lda">LDA</a>は分布仮定に基づき効率的だが仮定に弱い。<strong>「解釈・確率が要るならロジスティック、境界の精度が欲しく非線形ならSVM」</strong>が目安です。性能評価は正解率でなく<a href="#/prep1/roc-auc">ROC/AUC</a>や適合率・再現率で行います。</p>
<div class="note">下で2クラスの離れ具合を動かすと、最大マージン境界（実線）とマージン帯（点線）、縁に乗るサポートベクター（大きい点）が変わります。マージンの内側・縁の点だけが境界を支え、遠くの点を動かしても境界が不変なこと（＝$\\alpha_i=0$）に注目してください。隔たりを狭めると線形分離不可になり、ソフトマージン（$C$ で誤分類を許容）が必要になります。</div>`,
    demo: {
      note: '境界（実線）は丸で囲んだ最も近い対向点＝サポートベクターの中点に引かれ、再サンプルすると「その2点」に応じて動きます。遠くの点は境界に影響しません。隔たりを狭めると線形分離できなくなり、ソフトマージンが必要になります。',
      controls: [
        { type: 'range', id: 'gap', label: '2クラスの隔たり', min: 0.5, max: 5, step: 0.2, value: 3.4 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        // 学習目標: 最大マージン境界は「最も近い対向点（サポートベクター）」だけで決まることを見る。
        // 操作: 2クラスの隔たり gap / 再サンプル。確認: gap を狭めると線形分離不可（ソフトマージン）へ転じる。
        const st = S(), Pl = P();
        const rand = st.rng(29 + (p.reseed | 0) * 43);
        const gap = p.gap, sd = 0.55;
        const A = [], B = [];
        for (let i = 0; i < 16; i++) {
          A.push([1.5 + 1.3 * st.randn(rand), 3 - gap / 2 + sd * st.randn(rand)]);
          B.push([1.5 + 1.3 * st.randn(rand), 3 + gap / 2 + sd * st.randn(rand)]);
        }
        // クラスは y 方向にのみ平均が異なり分散は等方的 → 最大マージンの分離方向は水平。
        // その場合の最適境界は「A の最上点」と「B の最下点」（＝サポートベクター）の中点。
        let topA = -Infinity, svA = A[0];
        A.forEach(pt => { if (pt[1] > topA) { topA = pt[1]; svA = pt; } });
        let botB = Infinity, svB = B[0];
        B.forEach(pt => { if (pt[1] < botB) { botB = pt[1]; svB = pt; } });
        const separable = botB > topA;
        const boundary = separable ? (topA + botB) / 2
          : (st.mean(A.map(q => q[1])) + st.mean(B.map(q => q[1]))) / 2;
        const m = separable ? (botB - topA) / 2 : 0;
        const pl = Pl.make(canvas, { xmin: -3, xmax: 6, ymin: -1, ymax: 7 });
        pl.clear(); pl.axes({ xLabel: 'x₁', yLabel: 'x₂' });
        if (m > 0) {
          pl.ctx.save();
          pl.ctx.fillStyle = 'rgba(152,162,179,0.14)';
          pl.ctx.fillRect(pl.pad.left, pl.Y(boundary + m), pl.W - pl.pad.left - pl.pad.right, pl.Y(boundary - m) - pl.Y(boundary + m));
          pl.ctx.restore();
          pl.hline(boundary + m, { color: Pl.gray, dash: [5, 4] });
          pl.hline(boundary - m, { color: Pl.gray, dash: [5, 4] });
        }
        pl.hline(boundary, { color: Pl.ink, width: 2.5, dash: [] });
        A.forEach(pt => pl.scatter([pt], { color: Pl.colors[0], r: pt === svA ? 7 : 3.3, alpha: 0.85 }));
        B.forEach(pt => pl.scatter([pt], { color: Pl.colors[1], r: pt === svB ? 7 : 3.3, alpha: 0.85 }));
        // サポートベクターを丸で囲んで強調
        [svA, svB].forEach(pt => { pl.ctx.strokeStyle = Pl.ink; pl.ctx.lineWidth = 1.5; pl.ctx.beginPath(); pl.ctx.arc(pl.X(pt[0]), pl.Y(pt[1]), 10, 0, Math.PI * 2); pl.ctx.stroke(); });
        pl.legend([{ label: 'クラス A', color: Pl.colors[0] }, { label: 'クラス B', color: Pl.colors[1] }]);
        if (separable) {
          pl.text(-3, 7, 'マージン幅 = ' + (2 * m).toFixed(2) + '　境界＝囲んだ2つのサポートベクターの中点（他点は無関係）', { align: 'left', baseline: 'top', dx: 56, dy: 4, color: '#475467', size: 11.5 });
        } else {
          pl.text(-3, 7, '線形分離できない → ソフトマージン（誤分類を許容）が必要', { align: 'left', baseline: 'top', dx: 56, dy: 4, color: '#e4572e', size: 12 });
        }
      },
    },
  });

  /* --- ROC曲線・AUC・混同行列 --- */
  T.push({
    section: 'prep1', group: '多変量解析', id: 'roc-auc', title: 'ROC曲線・AUC・混同行列',
    summary: '分類のしきい値を動かすと、真陽性率と偽陽性率がどうトレードオフするか——ROC曲線とAUCで分類器の性能を測ります。',
    body: `
<p>2値分類は「スコアがしきい値を超えたら陽性」と判定します。結果は<strong>混同行列</strong>にまとまります。</p>
<table class="simple">
<tr><th></th><th>実際:陽性</th><th>実際:陰性</th></tr>
<tr><th>予測:陽性</th><td>TP</td><td>FP</td></tr>
<tr><th>予測:陰性</th><td>FN</td><td>TN</td></tr>
</table>
<p>ここから、<strong>感度（真陽性率, TPR）</strong>$=\\dfrac{TP}{TP+FN}$、<strong>偽陽性率（FPR）</strong>$=\\dfrac{FP}{FP+TN}$、精度・適合率などが計算できます。</p>
<p>しきい値を上げると陽性判定が減り、TPRもFPRも下がる——このトレードオフを全しきい値で描いたのが<strong>ROC曲線</strong>（横FPR・縦TPR）。曲線下面積が<strong>AUC</strong>で、1に近いほど良い分類器、0.5はランダム（対角線）です。</p>
<h3>AUCの意味と、しきい値を分けて考える理由</h3>
<p>AUCには明快な確率的意味があります：<strong>「無作為に選んだ陽性1個と陰性1個で、陽性の方が高いスコアを持つ確率 $P(\\text{スコア}_+>\\text{スコア}_-)$」</strong>。数値でも2群が距離 $d{=}1.5$ 離れているとき、ペア比較のAUC 0.855 が理論値 $\\Phi(d/\\sqrt2)=0.856$ と一致します（これは<a href="#/prep1/nonparametric">マン・ホイットニー統計量</a>と同じもの）。重要なのは、AUCが<strong>「順位づけ（判別）の良さ」だけを測り、どこで切るか（しきい値）とは独立</strong>な点。分類器の設計は「①どれだけ判別できるか（AUC）」と「②どこで切るか（運用のしきい値）」を<strong>分けて</strong>考えるのが定石で、しきい値は誤りのコスト（見逃し vs 誤検出）と事前確率で決めます。</p>
<h3>前提と、崩れたときの注意（不均衡データ）</h3>
<p>ROC/AUCの落とし穴は<strong>クラス不均衡</strong>です。FPRの分母は陰性総数なので、陰性が圧倒的に多いと<strong>大量の偽陽性が出てもFPRは小さく見え、ROCは楽観的</strong>になります。まれな陽性を拾う課題（不正検知・希少疾患）では、AUCが0.95でも実際の陽性的中率（<a href="#/prep1/conditional-bayes">適合率＝基準率の影響</a>）は悲惨、ということが起こります。この場合は<strong>PR曲線（適合率-再現率）とその下の面積（AP）</strong>の方が実態を映します。他の注意：<strong>(1) AUCは全しきい値を平均するので、実運用で使う領域だけの性能は別に見る</strong>（部分AUC）。<strong>(2) 2つの分類器のROCが交差するとAUCの大小だけでは優劣が決まらない</strong>。<strong>(3) スコアを確率として使うなら、AUCと別にキャリブレーション（予測確率が実頻度と合うか）を確認</strong>します。「AUCが高い＝実務で使える」ではなく、不均衡と運用点を必ず確認するのが鉄則です。</p>
<div class="note">下でしきい値を動かすと、2つのスコア分布（陰性=青・陽性=橙）の重なりに対する判定が変わり、ROC曲線上の動作点（●）が移動します。2分布の重なりが小さいほどROCは左上に張り付き、AUCが1に近づきます。AUC＝「陽性の方が高スコアになる確率」なので、重なりが半々（AUC0.5）だと対角線＝ランダムと同じになります。</div>`,
    demo: {
      note: 'しきい値を左右に振ると、感度と偽陽性率が同時に動きROC上の●が曲線をなぞる。分布の隔たり（分離度）を上げるとROCが左上へ膨らみAUCが1へ近づきます。',
      controls: [
        { type: 'range', id: 'sep', label: '2群の分離度', min: 0.2, max: 4, step: 0.1, value: 1.8 },
        { type: 'range', id: 'thr', label: 'しきい値', min: -4, max: 8, step: 0.1, value: 2 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const dpr = window.devicePixelRatio || 1;
        const W = canvas.clientWidth, H = canvas.clientHeight;
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
        const sep = p.sep, thr = p.thr;
        // 左: スコア分布  右: ROC
        const lw = W * 0.54;
        // 左パネル
        const l = { xmin: -4, xmax: 8, ymin: 0, ymax: 0.45, padL: 40, padB: 34, padT: 14 };
        const LX = v => l.padL + (v - l.xmin) / (l.xmax - l.xmin) * (lw - l.padL - 12);
        const LY = v => H - l.padB - (v - l.ymin) / (l.ymax - l.ymin) * (H - l.padB - l.padT);
        const drawCurve = (mu, col) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const x = l.xmin + (l.xmax - l.xmin) * i / 120; const y = st.normalPdf(x, mu, 1); i ? ctx.lineTo(LX(x), LY(y)) : ctx.moveTo(LX(x), LY(y)); } ctx.stroke(); };
        drawCurve(0, Pl.colors[0]); drawCurve(sep, Pl.colors[1]);
        ctx.strokeStyle = Pl.ink; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(LX(thr), LY(0)); ctx.lineTo(LX(thr), LY(0.45)); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = '#c7cdd8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(l.padL, LY(0)); ctx.lineTo(lw - 12, LY(0)); ctx.stroke();
        ctx.fillStyle = '#475467'; ctx.font = '11.5px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('スコア分布（青=陰性, 橙=陽性）', lw / 2, H - 6);
        // 現在のTPR/FPR
        const TPR = 1 - st.normalCdf(thr, sep, 1);
        const FPR = 1 - st.normalCdf(thr, 0, 1);
        // 右パネル ROC
        const rx = lw + 24, rw = W - rx - 16, rTop = 20, rBot = H - 40;
        const RX = v => rx + v * rw, RY = v => rBot - v * (rBot - rTop);
        ctx.strokeStyle = '#c7cdd8'; ctx.strokeRect(rx, rTop, rw, rBot - rTop);
        ctx.strokeStyle = Pl.gray; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(RX(0), RY(0)); ctx.lineTo(RX(1), RY(1)); ctx.stroke(); ctx.setLineDash([]);
        // ROC曲線
        ctx.strokeStyle = Pl.colors[3]; ctx.lineWidth = 2.5; ctx.beginPath();
        let auc = 0, prevF = 1, prevT = 1;
        for (let i = 0; i <= 200; i++) {
          const t = -4 + 12 * i / 200;
          const f = 1 - st.normalCdf(t, 0, 1), tp = 1 - st.normalCdf(t, sep, 1);
          i ? ctx.lineTo(RX(f), RY(tp)) : ctx.moveTo(RX(f), RY(tp));
          auc += (prevF - f) * (tp + prevT) / 2; prevF = f; prevT = tp;
        }
        ctx.stroke();
        ctx.fillStyle = Pl.ink; ctx.beginPath(); ctx.arc(RX(FPR), RY(TPR), 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#475467'; ctx.textAlign = 'center'; ctx.fillText('ROC曲線', rx + rw / 2, H - 6);
        ctx.textAlign = 'left'; ctx.fillText('FPR', RX(1) - 26, RY(0) + 14);
        ctx.save(); ctx.translate(rx - 6, (rTop + rBot) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('TPR', 0, 0); ctx.restore();
        ctx.fillStyle = Pl.ink; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'right';
        ctx.fillText('AUC=' + auc.toFixed(3), RX(1) - 6, RY(0.08));
        ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('感度=' + TPR.toFixed(2) + ' / FPR=' + FPR.toFixed(2), RX(0) + 6, RY(1) - 6);
      },
    },
  });

  /* --- 共分散構造分析・パス解析 --- */
  T.push({
    section: 'prep1', group: '多変量解析', id: 'path-analysis', title: '共分散構造分析・パス解析（因子と因果図）',
    summary: '観測変数の背後にある「潜在変数」と、変数間の因果の向きを図（パス図）で表し、直接効果・間接効果を分解する枠組みを俯瞰します。',
    body: `
<p><strong>因子分析</strong>は、多数の観測変数の相関を、少数の<strong>潜在変数（因子）</strong>で説明します。<a href="#/prep1/factor">因子分析</a>を発展させ、変数間に<strong>因果の向き</strong>を仮定して矢印で結んだのが<strong>パス解析</strong>、潜在変数と測定モデルまで含めた総合枠組みが<strong>共分散構造分析（構造方程式モデリング, SEM）</strong>です。</p>
<h3>効果の分解</h3>
<p>$X\\to M\\to Y$ で $X$ が $Y$ に影響するとき、</p>
<p>$$ \\text{総合効果}=\\underbrace{(X\\to Y)}_{\\text{直接効果}}+\\underbrace{(X\\to M)(M\\to Y)}_{\\text{間接効果（媒介）}} $$</p>
<p>各矢印の<strong>パス係数</strong>（標準化偏回帰係数）を、観測された相関・共分散が再現されるように推定します。適合度は $\\chi^2$、GFI、RMSEA、CFI などで評価します。</p>
<h3>因子の回転</h3>
<p>因子分析の解は回転で不定なので、解釈しやすくするために<strong>回転</strong>します。<strong>バリマックス</strong>（直交回転：因子間は無相関のまま各変数が少数因子に強く負荷）、<strong>プロマックス</strong>（斜交回転：因子間の相関を許す）が代表的。</p>
<div class="note">下は $X\\to M\\to Y$ の媒介モデル。直接効果と媒介経路の係数を動かすと、総合効果に占める「直接」と「間接（媒介）」の割合が変わります。間接効果は2つのパス係数の積であることに注目してください。</div>`,
    demo: {
      note: '直接効果を0にすると「完全媒介」（XはMを通してのみYに効く）。間接効果=(X→M)×(M→Y)の積なので、途中経路がどちらか弱いと媒介は伝わりません。',
      controls: [
        { type: 'range', id: 'direct', label: '直接効果 X→Y', min: -0.8, max: 0.8, step: 0.05, value: 0.2 },
        { type: 'range', id: 'xm', label: 'パス X→M', min: -0.9, max: 0.9, step: 0.05, value: 0.6 },
        { type: 'range', id: 'my', label: 'パス M→Y', min: -0.9, max: 0.9, step: 0.05, value: 0.5 },
      ],
      draw(canvas, p) {
        const Pl = P();
        const dpr = window.devicePixelRatio || 1;
        const W = canvas.clientWidth, H = canvas.clientHeight;
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
        const indirect = p.xm * p.my, total = p.direct + indirect;
        const nodes = { X: [W * 0.15, H * 0.7], M: [W * 0.5, H * 0.28], Y: [W * 0.85, H * 0.7] };
        const drawNode = (name, pos) => { ctx.fillStyle = '#eef2ff'; ctx.strokeStyle = '#4f6df5'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(pos[0], pos[1], 30, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#1d2433'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(name, pos[0], pos[1]); };
        const arrow = (a, b, coef, col) => {
          const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
          const x1 = a[0] + ux * 30, y1 = a[1] + uy * 30, x2 = b[0] - ux * 34, y2 = b[1] - uy * 34;
          ctx.strokeStyle = col; ctx.lineWidth = 1 + 5 * Math.abs(coef); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
          const ang = Math.atan2(y2 - y1, x2 - x1); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 11 * Math.cos(ang - 0.4), y2 - 11 * Math.sin(ang - 0.4)); ctx.lineTo(x2 - 11 * Math.cos(ang + 0.4), y2 - 11 * Math.sin(ang + 0.4)); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#1d2433'; ctx.font = '13px sans-serif'; ctx.fillText(coef.toFixed(2), (x1 + x2) / 2, (y1 + y2) / 2 - 8);
        };
        arrow(nodes.X, nodes.M, p.xm, '#4f6df5');
        arrow(nodes.M, nodes.Y, p.my, '#4f6df5');
        arrow(nodes.X, nodes.Y, p.direct, '#e4572e');
        drawNode('X', nodes.X); drawNode('M', nodes.M); drawNode('Y', nodes.Y);
        ctx.fillStyle = '#475467'; ctx.font = '13px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('直接効果 = ' + p.direct.toFixed(2), 16, H - 60);
        ctx.fillText('間接効果 = (X→M)(M→Y) = ' + indirect.toFixed(2), 16, H - 40);
        ctx.fillStyle = '#1d2433'; ctx.font = 'bold 13px sans-serif';
        ctx.fillText('総合効果 = ' + total.toFixed(2), 16, H - 20);
      },
    },
  });

  /* --- 多次元尺度法・対応分析・正準相関 --- */
  T.push({
    section: 'prep1', group: '多変量解析', id: 'mds-ca', title: '多次元尺度法・対応分析・正準相関',
    summary: '「距離・類似度を地図にする」「2つの変数群の関係を最大化する」——PCA以外の次元縮約・関連分析の手法を整理します。',
    body: `
<p>多変量解析には、主成分分析以外にも「関係を低次元で見る」手法群があります。<strong>どれを使うかは「手元のデータの形」で決まります</strong>——生の変数行列があるなら<a href="#/prep1/pca">PCA</a>、個体間の<strong>距離しかない</strong>ならMDS、<strong>分割表</strong>なら対応分析、変数が<strong>2つのグループ</strong>に分かれているならCCA。目的（低次元で構造を見る）は同じで、入力が違うだけ、と整理すると迷いません。</p>
<h3>多次元尺度法（MDS）</h3>
<p>個体間の<strong>距離（非類似度）行列</strong>だけを入力に、その距離をできるだけ保つように個体を2次元平面に配置します。都市間距離から地図を復元するイメージ。元の変数が分からず距離だけあるときに有効です。</p>
<p><strong>なぜ距離だけから座標が戻るか</strong>：中心化した座標 $\\boldsymbol x_i$ に対して $d_{ij}^2=\\|\\boldsymbol x_i\\|^2+\\|\\boldsymbol x_j\\|^2-2\\,\\boldsymbol x_i^\\top\\boldsymbol x_j$。距離二乗行列 $D^2$ を両側から中心化行列 $J=I-\\frac1n\\boldsymbol 1\\boldsymbol 1^\\top$ で挟むと $\\|\\boldsymbol x\\|^2$ の項がちょうど消え、</p>
<p>$$ B=-\\tfrac12 J D^2 J = X X^\\top $$</p>
<p>と<strong>内積の行列（グラム行列）</strong>が復元されます。あとは $B$ を固有分解し、上位の固有ベクトル×$\\sqrt{\\lambda}$ が座標です（<a href="#/math/eigen">固有値分解</a>）。内積は回転・反転で変わらないので、<strong>復元される地図の向き・鏡像が不定</strong>なのは原理的な性質です。</p>
<h3>対応分析（コレスポンデンス分析）</h3>
<p><strong>分割表（クロス集計）</strong>の行と行、列と列の類似性を同じ平面に布置し、「どの行カテゴリとどの列カテゴリが結びつきやすいか」を可視化します。数理的には、独立を仮定した期待値からの乖離 $(p_{ij}-r_ic_j)/\\sqrt{r_ic_j}$（$r_i,c_j$ は行・列の周辺割合）を特異値分解したもの——つまり<strong>独立性のカイ二乗検定が「どこで・どう」ずれているかを地図にした</strong>手法です（総慣性 $=\\chi^2/n$、<a href="#/prep1/contingency">分割表の解析</a>）。</p>
<h3>正準相関分析（CCA）</h3>
<p>2つの<strong>変数群</strong> $\\boldsymbol X=(x_1,\\dots)$ と $\\boldsymbol Y=(y_1,\\dots)$ について、それぞれの線形結合 $\\boldsymbol a^\\top\\boldsymbol X$ と $\\boldsymbol b^\\top\\boldsymbol Y$ の<strong>相関が最大</strong>になる組を求めます（一般化固有値問題に帰着）。「学力テスト群」と「体力テスト群」の関係を1本の軸に凝縮するなど。<strong>相関</strong>を最大化するのがCCA、<strong>共分散</strong>を最大化するのが<a href="#/chemo/pls">PLS</a>、片方向の<strong>予測</strong>に徹するのが回帰、という三つ巴で対比すると位置づけが明確になります。</p>
<h3>前提条件と、崩れたときの影響</h3>
<table class="simple">
<tr><th>手法</th><th>前提</th><th>崩れると起きること・対処</th></tr>
<tr><td>計量MDS</td><td>距離がユークリッド的（$B$ が半正定値）</td><td>主観的な非類似度などでは負の固有値が出て歪む → 順序だけ保つ<strong>非計量MDS</strong>（ストレス最小化）</td></tr>
<tr><td>対応分析</td><td>総度数が十分・極端に疎なセルがない</td><td>希少カテゴリが軸を独占して布置が不安定に → カテゴリ統合・寄与率の確認</td></tr>
<tr><td>CCA</td><td>$n$ が変数の総数より十分大きい・線形関係</td><td>$n$ が小さいと正準相関が見かけ上1に近づく（過学習）→ 正則化CCA。<a href="#/prep1/multicollinearity">共線性</a>でも不安定化</td></tr>
</table>
<p>3手法とも<strong>探索的手法</strong>です。仮説検定の枠組みではなく、「構造の候補を見つける」段階の道具だと割り切って使います。</p>
<h3>読みすぎへの注意（有意性と実質的な意味）</h3>
<p>布置図は<strong>近似</strong>です。上位2軸の寄与率（固有値の割合・慣性の割合）を確認せずに点の近さを読み込むのは、$R^2=0.3$ の回帰直線で個々の予測を語るのと同じ危うさがあります。対応分析では<strong>行点どうし・列点どうしの距離は解釈できるが、行点と列点の距離の直接比較は原理的に正当化されない</strong>（同じ平面に重ねているだけ）という有名な注意点もあります。CCAの高い正準相関も、$n$ が小さければ過学習の産物かもしれません——交差検証や第2標本での確認が実務の作法です。</p>
<div class="note">下は多次元尺度法のデモ。実際の都市配置（伏せた真の座標）から距離行列だけを作り、上の式 $B=-\\frac12JD^2J$ の固有分解で復元します。真の配置が2次元なので固有値は上位2つに全情報が乗り、<strong>回転・鏡像を除いて完全に復元</strong>されます（「別の配置で試す」で何度でも確認可）。真の構造が3次元以上なら上位2軸に落とす際に歪みが生じる——その歪みの量が残りの固有値です。</div>`,
    demo: {
      note: '真の配置（灰）から距離行列だけを取り出し、MDSで復元した配置（色つき）を重ねています。距離情報だけで相対位置がほぼ再現される点がMDSの核心。回転・反転の自由度は残ります。',
      controls: [
        { type: 'button', id: 'reseed', label: '別の配置で試す' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(5 + (p.reseed | 0) * 91);
        const n = 8;
        const truth = [];
        for (let i = 0; i < n; i++) truth.push([4 * (rand() - 0.5) * 2, 4 * (rand() - 0.5) * 2]);
        // 距離行列
        const D = [];
        for (let i = 0; i < n; i++) { D[i] = []; for (let j = 0; j < n; j++) D[i][j] = Math.hypot(truth[i][0] - truth[j][0], truth[i][1] - truth[j][1]); }
        // 古典的MDS: B = -1/2 J D² J, 固有分解
        const D2 = D.map(row => row.map(d => d * d));
        const J = []; for (let i = 0; i < n; i++) { J[i] = []; for (let j = 0; j < n; j++) J[i][j] = (i === j ? 1 : 0) - 1 / n; }
        const B = st.matmul(st.matmul(J, D2), J).map(row => row.map(v => -0.5 * v));
        const eig = st.eigSym(B);
        // 上位2固有ベクトル×√固有値
        const idx = eig.values.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]);
        const coords = [];
        for (let i = 0; i < n; i++) {
          const c1 = eig.vectors[i][idx[0][1]] * Math.sqrt(Math.max(0, idx[0][0]));
          const c2 = eig.vectors[i][idx[1][1]] * Math.sqrt(Math.max(0, idx[1][0]));
          coords.push([c1, c2]);
        }
        const pl = Pl.make(canvas, { xmin: -6, xmax: 6, ymin: -6, ymax: 6 });
        pl.clear(); pl.axes({ xLabel: 'MDS 軸1', yLabel: 'MDS 軸2' });
        pl.scatter(truth, { color: Pl.gray, r: 6, alpha: 0.5 });
        coords.forEach((c, i) => { pl.scatter([c], { color: Pl.colors[i % Pl.colors.length], r: 6 }); pl.text(c[0], c[1], String(i + 1), { align: 'center', baseline: 'middle', color: '#fff', size: 10 }); });
        pl.legend([{ label: '真の配置', color: Pl.gray }, { label: 'MDS復元', color: Pl.colors[0] }]);
      },
    },
  });

  /* --- 分割表の指標（オッズ比） --- */
  T.push({
    section: 'prep1', group: '分割表', id: 'odds-ratio', title: '分割表の指標（オッズ比・相対リスク・連関係数）',
    summary: '2×2表から「関連の強さ」を測るオッズ比・相対リスク・ファイ係数を、表のセルを動かしながら計算・比較します。',
    body: `
<p>2×2分割表は「要因の有無」と「結果の有無」のクロス集計です。関連の強さを測る指標がいくつかあります。</p>
<table class="simple">
<tr><th></th><th>結果あり</th><th>結果なし</th></tr>
<tr><th>曝露あり</th><td>$a$</td><td>$b$</td></tr>
<tr><th>曝露なし</th><td>$c$</td><td>$d$</td></tr>
</table>
<ul>
<li><strong>オッズ比</strong> $OR=\\dfrac{a/b}{c/d}=\\dfrac{ad}{bc}$：曝露群と非曝露群の「オッズ」の比。1なら関連なし。症例対照研究で使える。</li>
<li><strong>相対リスク</strong> $RR=\\dfrac{a/(a+b)}{c/(c+d)}$：リスク（発生割合）の比。コホート研究で直接解釈できる。まれな結果では $OR\\approx RR$。</li>
<li><strong>ファイ係数</strong> $\\phi=\\dfrac{ad-bc}{\\sqrt{(a+b)(c+d)(a+c)(b+d)}}$：2値×2値の相関係数。$\\chi^2=n\\phi^2$ と独立性検定に直結。</li>
</ul>
<h3>なぜ研究デザインで使い分けるか</h3>
<p>指標の選択は<strong>研究デザインに縛られます</strong>。<strong>相対リスク RR</strong>は「曝露群の発生率÷非曝露群の発生率」で、発生率を推定できる<a href="#/prep1/sampling-survey">コホート研究</a>でしか正しく計算できません。一方<strong>症例対照研究</strong>（結果あり・なしから遡って曝露を調べる）では発生率が測れず RR は出せませんが、<strong>オッズ比 OR は行と列を入れ替えても同じ値</strong>（$ad/bc$ は対称）なので、遡り設計でも計算でき、これが症例対照研究で OR が使われる数学的理由です。「まれな結果では $OR\\approx RR$」は近似で——$a,c$ が小さいと $a+b\\approx b,\\ c+d\\approx d$ となり $RR\\approx\\frac{a/b}{c/d}=OR$（数値でも $a{=}5$ 級で 2.51 vs 2.50 と一致）。<strong>逆に結果が多いと OR は RR より1から離れて誇張されます</strong>（$a{=}400$ 級で OR2.67 vs RR2.00）——「オッズ比2.7」を「リスク2.7倍」と読むと過大評価になります。</p>
<h3>有意性と実質的な意味</h3>
<p>OR・RR の信頼区間は<strong>対数スケールで正規近似</strong>して作ります（$\\ln OR$ が近似的に正規、$\\mathrm{SE}(\\ln OR)=\\sqrt{1/a+1/b+1/c+1/d}$）——だから区間は1を中心に非対称で、「1を含むか」が有意性の判定。セルに0があると発散するので連続修正（+0.5）を使います。もっと重要な実質的注意が<strong>交絡</strong>：観察データの OR は「見かけの関連」で、第3の変数（年齢・喫煙）が両方を動かしているだけかもしれません（<a href="#/prep1/causal-inference">因果推論</a>）。層別してMantel-Haenszel推定で調整するか、ロジスティック回帰で共変量を入れて<strong>調整オッズ比</strong>を出します。そして「統計的に有意なOR」と「臨床的に意味のあるリスク差（絶対リスク）」は別——まれな結果ではORが大きくても実際に増える人数はわずか、という点を絶対リスクで併せて示すのが誠実です。</p>
<div class="note">下で4つのセル度数を動かすと、各指標が再計算されます。$ad=bc$（対角の積が等しい）のとき $OR=1$・$\\phi=0$＝関連なし。まれな事象（$a,c$ が小さい）では OR と RR が近づき、逆に $a,c$ を大きくすると OR が RR より1から離れて誇張されることも確かめてください。</div>`,
    demo: {
      note: 'ad=bc に近づけると OR→1・φ→0（無関連）。a を増やすと右上がりの関連が強まり OR・RR が上昇。まれな結果（a,c小）ほど OR と RR の差が縮まります。',
      controls: [
        { type: 'range', id: 'a', label: 'a: 曝露あり×結果あり', min: 1, max: 100, step: 1, value: 40 },
        { type: 'range', id: 'b', label: 'b: 曝露あり×結果なし', min: 1, max: 100, step: 1, value: 60 },
        { type: 'range', id: 'c', label: 'c: 曝露なし×結果あり', min: 1, max: 100, step: 1, value: 20 },
        { type: 'range', id: 'd', label: 'd: 曝露なし×結果なし', min: 1, max: 100, step: 1, value: 80 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const a = p.a, b = p.b, c = p.c, d = p.d;
        const OR = (a * d) / (b * c);
        const RR = (a / (a + b)) / (c / (c + d));
        const n = a + b + c + d;
        const phi = (a * d - b * c) / Math.sqrt((a + b) * (c + d) * (a + c) * (b + d));
        const chi2 = n * phi * phi;
        const pval = 1 - st.chi2Cdf(chi2, 1);
        const dpr = window.devicePixelRatio || 1;
        const W = canvas.clientWidth, H = canvas.clientHeight;
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
        // モザイク図（面積で度数を表現）
        const x0 = 40, y0 = 30, mw = Math.min(W - 260, 320), mh = H - 90;
        const rowTop = (a + b), rowBot = (c + d);
        const hTop = mh * rowTop / n, hBot = mh * rowBot / n;
        const cells = [
          { x: x0, y: y0, w: mw * a / (rowTop || 1), h: hTop, col: '#4f6df5', lab: 'a=' + a },
          { x: x0 + mw * a / (rowTop || 1), y: y0, w: mw * b / (rowTop || 1), h: hTop, col: '#a9b8f9', lab: 'b=' + b },
          { x: x0, y: y0 + hTop, w: mw * c / (rowBot || 1), h: hBot, col: '#e4572e', lab: 'c=' + c },
          { x: x0 + mw * c / (rowBot || 1), y: y0 + hTop, w: mw * d / (rowBot || 1), h: hBot, col: '#f2ad97', lab: 'd=' + d },
        ];
        cells.forEach(cl => { ctx.fillStyle = cl.col; ctx.fillRect(cl.x, cl.y, cl.w - 2, cl.h - 2); ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; if (cl.w > 24) ctx.fillText(cl.lab, cl.x + cl.w / 2, cl.y + cl.h / 2); });
        ctx.fillStyle = '#66708a'; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('上段=曝露あり / 下段=曝露なし　左=結果あり', x0, y0 + mh + 8);
        // 指標
        const tx = x0 + mw + 26; let ty = y0 + 6;
        const put = (t, v, col) => { ctx.fillStyle = col || '#1d2433'; ctx.font = '13.5px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(t + v, tx, ty); ty += 26; };
        put('オッズ比 OR = ', OR.toFixed(2), OR > 1.05 ? '#e4572e' : OR < 0.95 ? '#2a9d8f' : '#1d2433');
        put('相対リスク RR = ', RR.toFixed(2));
        put('ファイ係数 φ = ', phi.toFixed(3));
        put('χ² = ', chi2.toFixed(2) + '（df=1）');
        put('p = ', (pval < 0.001 ? '<0.001' : pval.toFixed(3)), pval < 0.05 ? '#e4572e' : '#98a2b3');
      },
    },
  });

  /* --- 対数線形モデル --- */
  T.push({
    section: 'prep1', group: '分割表', id: 'log-linear', title: '対数線形モデル・条件つき独立性',
    summary: '分割表の各セル度数の対数を「主効果＋交互作用」で表し、変数間の独立・条件つき独立をモデルとして検定する枠組みを俯瞰します。',
    body: `
<p>分割表の期待セル度数 $m_{ij}$ の<strong>対数</strong>を、分散分析のように要因の和で表すのが<strong>対数線形モデル</strong>です。</p>
<p>$$ \\log m_{ij}=\\mu+\\lambda_i^{A}+\\lambda_j^{B}+\\lambda_{ij}^{AB} $$</p>
<p>ここで<strong>交互作用項 $\\lambda_{ij}^{AB}$ が関連の強さ</strong>。これがゼロ（$\\lambda^{AB}=0$）のモデルは「$A$ と $B$ は独立」を意味し、当てはまりを $\\chi^2$ や尤度比で検定すれば、そのまま<strong>独立性の検定</strong>になります。</p>

<h3>なぜ対数なのか・独立との関係</h3>
<p>セル度数はカウントなので<a href="#/prep1/distributions">ポアソン分布</a>に従い、平均が正に制約されます。<a href="#/prep1/glm">一般化線形モデル</a>としてポアソンに合う自然なリンクが<strong>対数リンク</strong>——これが「対数」線形モデルの由来です。対数にはもう一つ決定的な利点があります。独立のとき期待度数は<strong>積</strong>の形 $m_{ij}=n\\,p_i\\,q_j$ になりますが、対数を取ると</p>
<p>$$ \\log m_{ij}=\\underbrace{\\log n}_{\\mu}+\\underbrace{\\log p_i}_{\\lambda_i^{A}}+\\underbrace{\\log q_j}_{\\lambda_j^{B}} $$</p>
<p>と<strong>和</strong>に分解でき、交互作用項が現れません。逆に言えば $\\lambda_{ij}^{AB}\\ne0$ は「期待度数が行効果×列効果の積で書けない＝独立からのズレ」そのものです。2×2表では、このズレはちょうど<strong><a href="#/prep1/odds-ratio">オッズ比</a>の対数</strong>に対応し、和ゼロ制約のもとで $\\log(\\text{オッズ比})=4\\lambda_{11}^{AB}$ が成り立ちます。交互作用＝関連＝対数オッズ比、が一本の線でつながります。</p>

<h3>3元以上と条件つき独立</h3>
<p>3変数 $A,B,C$ では、含める交互作用の組み合わせで階層的なモデル族ができます。例えば $A$–$B$ の関連が $C$ を与えると消える（$C$ を固定すると独立）なら<strong>条件つき独立</strong>。「見かけの関連」が第3変数で説明される（<a href="#/prep1/multiple-regression">交絡</a>と同じ構図）かを判定できます。変数間の条件つき独立関係を図示したものが<strong>グラフィカルモデル</strong>です。</p>
<h3>前提条件と、崩れたときの影響</h3>
<table class="simple">
<tr><th>前提</th><th>崩れると起きること</th><th>対処・代替</th></tr>
<tr><td>各セルが独立なポアソン計数</td><td>クラスター・反復でセルが群れる（過分散）とSEを過小評価し、関連を過大に有意化</td><td>準ポアソン・<a href="#/prep1/discrete-distributions">負の二項</a>・混合効果</td></tr>
<tr><td>期待度数が十分大きい</td><td>疎な表（期待度数が小さいセル）だと $\\chi^2$・$G^2$ の近似が崩れ、p値が信用できない</td><td>カテゴリを併合・正確検定（フィッシャー）・ベイズ</td></tr>
<tr><td>階層モデル（下位項を含む）</td><td>交互作用だけ入れて主効果を落とすと解釈不能・当てはめが不安定</td><td>階層性を守る（$\\lambda^{AB}$ を入れるなら $\\lambda^A,\\lambda^B$ も入れる）</td></tr>
<tr><td>関連が第3変数で交絡していない</td><td>2元表の見かけの関連が、実は第3変数 $C$ 経由（シンプソンのパラドックス）</td><td>3元表で条件つき独立を検定・層別</td></tr>
</table>

<h3>有意性と実質的な意味</h3>
<p>交互作用の有意性は<strong>標本サイズに比例して膨らみます</strong>。逸脱度は $G^2=2\\sum O\\log(O/E)$ で、関連の強さ（$\\lambda^{AB}$）が同じなら $G^2$ はおよそ $n$ に比例します。たとえば対数オッズ比 $\\psi=0.5$（弱い関連）は $n=100$ だと $G^2\\approx1.6$ で有意になりませんが、$n=200$ で $\\approx3.1$、さらに増やせば必ず有意になります。逆に $\\psi=1.0$ なら $n=100$ で $G^2\\approx6.1$、$n=200$ で $\\approx12.1$ と、同じ関連でも $n$ 次第で結論が変わります。</p>
<p>したがって「独立性が棄却された」だけでは中身は語れません。<strong>関連の大きさ＝オッズ比や $\\lambda^{AB}$ の値</strong>で実質を読むのが鉄則です。大標本ではごく弱い関連も必ず有意になり、逆に疎な表では強い関連でも検出できない——効果量と信頼区間をセットで報告します。</p>
<div class="note">下は2×2表の対数線形モデル。関連の強さ（対数オッズ比 $\\psi$）を上げると、4セルの期待度数（色）が独立モデルの一様な期待（灰）から離れます。$\\psi=0$ ではすべて $n/4$ で一致＝独立。$n$ を増やすと同じ $\\psi$ でも $G^2$ が比例して大きくなり、独立が棄却されやすくなるのを確かめてください。ロジスティック回帰とも数理的に結びつきます（応答を1変数に選べば一致）。<a href="#/prep1/contingency">分割表とカイ二乗検定</a>・<a href="#/prep1/odds-ratio">オッズ比</a>と併せて学ぶと効果的です。</div>`,
    demo: {
      heading: '📊 2×2 対数線形モデル（独立からのズレ）',
      note: 'ψ（対数オッズ比）を上げると対角セル（A1B1・A2B2）の期待度数が上がり、独立モデルの灰色バー（一律 n/4）から離れます。ψ=0 で完全一致＝独立。nを増やすと同じψでもG²が比例して増え、独立が棄却されやすくなります＝「有意性はnで決まる」。',
      controls: [
        { type: 'range', id: 'psi', label: '関連の強さ ψ（対数オッズ比）', min: -2, max: 2, step: 0.1, value: 1.0 },
        { type: 'range', id: 'n', label: '総度数 n', min: 40, max: 400, step: 20, value: 200 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const psi = p.psi, n = Math.round(p.n);
        const s = Math.exp(psi / 2);            // √θ
        const a = 0.5 * s / (1 + s), b = 0.5 / (1 + s);  // 50/50 マージン
        const pModel = [a, b, b, a];            // 11,12,21,22
        const labels = ['A1·B1', 'A1·B2', 'A2·B1', 'A2·B2'];
        const mObs = pModel.map(pp => n * pp);
        const mInd = n * 0.25;
        let G2 = 0;
        for (let k = 0; k < 4; k++) G2 += 2 * mObs[k] * Math.log(mObs[k] / mInd);
        const ymax = n * 0.45;
        const pl = Pl.make(canvas, { xmin: 0.4, xmax: 4.6, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: 'セル（A水準・B水準）', yLabel: '期待度数' });
        for (let k = 0; k < 4; k++) {
          const x = k + 1;
          pl.bars([{ x0: x - 0.34, x1: x - 0.02, y: mInd }], { color: Pl.gray, alpha: 0.4 });
          pl.bars([{ x0: x + 0.02, x1: x + 0.34, y: mObs[k] }], { color: Pl.colors[k % Pl.colors.length], alpha: 0.85 });
          pl.text(x, 0, labels[k], { align: 'center', baseline: 'top', dy: 6, color: '#475467', size: 11.5 });
        }
        const sig = G2 > 3.841;
        pl.text(0.4, ymax, 'G² = ' + G2.toFixed(2) + '（df=1, χ²5%=3.84） → ' + (sig ? '独立を棄却' : '独立と矛盾せず'),
          { align: 'left', baseline: 'top', dx: 56, dy: 4, color: sig ? '#e4572e' : '#475467', size: 12.5 });
        pl.legend([{ label: '独立モデルの期待 (n/4)', color: Pl.gray }, { label: '交互作用ありの期待', color: Pl.colors[0] }]);
      },
    },
  });

  /* --- 欠測データ --- */
  T.push({
    section: 'prep1', group: '計算統計・シミュレーション', id: 'missing-data', title: '欠測データ（欠測メカニズムとEMアルゴリズム）',
    summary: '欠測の「起こり方」（MCAR/MAR/MNAR）によって、単純除外がバイアスを生むかどうかが変わる——その分岐と対処法を理解します。',
    body: `
<p>データの欠測は、その<strong>起こり方（欠測メカニズム）</strong>によって扱いが変わります。</p>
<ul>
<li><strong>MCAR（完全にランダム）</strong>：欠測が観測値とも欠測値とも無関係。単純除外（リストワイズ削除）でもバイアスなし（ただし情報は減る）。</li>
<li><strong>MAR（ランダム）</strong>：欠測が<strong>観測されている他の変数</strong>で説明できる。適切な手法（多重代入・最尤）でバイアスを補正できる。</li>
<li><strong>MNAR（ランダムでない）</strong>：欠測が<strong>その欠測値自身</strong>に依存（高所得者ほど収入を答えない等）。最も厄介で、メカニズムのモデル化が必要。</li>
</ul>
<h3>対処法</h3>
<p><strong>リストワイズ削除</strong>は MCAR 以外ではバイアスの危険。<strong>多重代入法</strong>は欠測を複数回もっともらしく埋めて結果を統合。<strong>EMアルゴリズム</strong>は「E ステップ（欠測の期待値で補完）→ M ステップ（最尤推定）」を繰り返し、欠測がある下での最尤推定量に収束させます。</p>
<h3>なぜEMは動くか、なぜ単一代入では不十分か</h3>
<p>EMは各反復で<strong>対数尤度を必ず増やす（減らさない）</strong>ことが証明でき、だから単調に最尤解へ収束します（局所最適に落ちうる点は<a href="#/prep1/mle">最尤法</a>と同じ）。「欠測を1つの値で埋める」<strong>単一代入</strong>が危険なのは、埋めた値を<strong>あたかも観測されたかのように</strong>扱うと、代入の不確かさを無視して<strong>標準誤差を過小評価</strong>する（見かけ上、精度が高くなる）ため。<strong>多重代入法</strong>はこれを直します——欠測を $m$ 通りに（予測分布からの乱数を足して）埋めて $m$ 個の完全データを作り、各々で解析し、結果を<strong>ルービンの公式</strong>で統合します：推定値は平均、分散は「各回内の分散＋代入間のばらつき」。この2つ目の項が<strong>「欠測ゆえの追加の不確かさ」</strong>を正しく取り込みます。</p>
<h3>前提と、崩れたときの注意</h3>
<p>最大の急所は<strong>欠測メカニズムがデータからは検証できない</strong>こと。観測データだけでは MAR と MNAR を区別できません（欠測値そのものを見られないため）。多重代入も最尤も<strong>MAR を仮定して初めて正しく</strong>、真が MNAR ならバイアスが残ります——高所得者ほど収入を答えない、重症者ほど脱落する、といった状況です。対処は、<strong>欠測の理由に関わる変数をできるだけ観測してモデルに入れる</strong>（MAR に近づける）、そして<strong>感度分析</strong>で「もし MNAR だったら結論がどう変わるか」を検討すること。「欠測は少ないから気にしない」も危険で、<strong>少量でも系統的な欠測はバイアスを生みます</strong>（量より起こり方）。安易な平均代入は分散を縮め相関を歪めるので避け、まずは欠測メカニズムを考えるのが出発点です。</p>
<div class="note">下は MAR の例。「$x$ が大きいほど $y$ が欠測しやすい」状況で、欠測を単純に捨てると（赤）回帰直線が真の関係（灰）からずれます。欠測の起こり方を知らずに捨てるのが危険、という反省点そのものです。欠測強度を上げるほどバイアスが拡大する＝「量より起こり方」を確かめてください。</div>`,
    demo: {
      note: '欠測強度を上げると、xが大きい領域のyが抜け落ち、残ったデータ（赤）の回帰直線が真の直線（灰）から傾いてずれる。MARを無視した単純削除のバイアスが見えます。',
      controls: [
        { type: 'range', id: 'miss', label: '欠測の強さ（xが大→欠測）', min: 0, max: 1, step: 0.05, value: 0.6 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(63 + (p.reseed | 0) * 17);
        const all = [], kept = [];
        for (let i = 0; i < 80; i++) {
          const x = rand() * 10;
          const y = 1 + 0.8 * x + 1.5 * st.randn(rand);
          const pmiss = p.miss * (x / 10);
          const missing = rand() < pmiss;
          all.push([x, y]);
          if (!missing) kept.push([x, y]);
        }
        const fit = pts => { const X = pts.map(q => q[0]), Y = pts.map(q => q[1]); const mx = st.mean(X), my = st.mean(Y); let sxy = 0, sxx = 0; for (let i = 0; i < X.length; i++) { sxy += (X[i] - mx) * (Y[i] - my); sxx += (X[i] - mx) ** 2; } const b = sxy / sxx; return { b, a: my - b * mx }; };
        const fAll = fit(all), fKept = fit(kept);
        const pl = Pl.make(canvas, { xmin: 0, xmax: 10, ymin: -2, ymax: 12 });
        pl.clear(); pl.axes({ xLabel: 'x', yLabel: 'y' });
        const missPts = all.filter(q => !kept.includes(q));
        pl.scatter(missPts, { color: Pl.gray, r: 3, alpha: 0.35 });
        pl.scatter(kept, { color: Pl.colors[1], r: 3.5, alpha: 0.8 });
        pl.line([[0, fAll.a], [10, fAll.a + fAll.b * 10]], { color: Pl.gray, width: 2, dash: [6, 4] });
        pl.line([[0, fKept.a], [10, fKept.a + fKept.b * 10]], { color: Pl.colors[1], width: 2.5 });
        pl.legend([{ label: '全データの直線（真）', color: Pl.gray }, { label: '欠測除外後の直線', color: Pl.colors[1] }]);
      },
    },
  });

  /* --- モンテカルロ法 --- */
  T.push({
    section: 'prep1', group: '計算統計・シミュレーション', id: 'monte-carlo', title: 'モンテカルロ法・乱数・棄却法',
    summary: '乱数を大量に発生させて確率や積分を近似する考え方を、円周率πの推定で体感し、標準誤差が $1/\\sqrt{N}$ で縮むことを確かめます。',
    body: `
<p><strong>モンテカルロ法</strong>は、乱数を使って確率・期待値・積分を近似する方法です。「面積 = 当たった点の割合」で $\\pi$ を推定するのが定番。</p>
<p>$$ \\frac{\\text{円内の点数}}{\\text{全点数}}\\approx\\frac{\\pi r^2/4}{r^2}=\\frac{\\pi}{4}\\ \\Rightarrow\\ \\pi\\approx 4\\times(\\text{当たり率}) $$</p>
<p>推定の誤差（標準誤差）は $\\propto 1/\\sqrt N$。点数を100倍にして、やっと精度が10倍——という「遅いが確実」な収束です。高次元の積分でも次元に強く、実務で広く使われます。</p>
<h3>棄却法（リジェクションサンプリング）</h3>
<p>目標分布 $f$ から直接サンプルできないとき、簡単な分布 $g$ から出して「$f/g$ の割合で採択」すれば $f$ からのサンプルが得られます。包む $g$ が $f$ にフィットするほど採択率が上がり効率的です。</p>
<h3>なぜ $1/\\sqrt N$ で、なぜ次元に強いか</h3>
<p>モンテカルロ推定は「当たり/外れ」の平均＝標本平均なので、<a href="#/prep1/clt">中心極限定理</a>がそのまま効きます。$N$ 個の平均の標準誤差は $\\sigma/\\sqrt N$——だから<strong>誤差は $1/\\sqrt N$ で縮み、精度を10倍にするには点数を100倍</strong>（数値でも $N$ を4倍にするとSEが0.050→0.027と約半分）。「遅い」欠点に見えますが、<strong>この $1/\\sqrt N$ 則は次元によらない</strong>のが決定的な強みです。格子で数値積分すると点数が次元の指数で爆発する（次元の呪い）のに対し、モンテカルロの誤差は次元が上がっても $1/\\sqrt N$ のまま——だから高次元積分・ベイズの事後計算で主役になります。棄却法の採択率は「$g$ の囲む面積に対する $f$ の面積の比 $1/c$」で、$g$ が $f$ に似ていないと大量に棄却して非効率になります。</p>
<h3>前提と、精度を上げる工夫</h3>
<p>信頼できる結果には前提があります。<strong>(1) 乱数の質</strong>：擬似乱数の周期や相関が悪いと偏る（再現性のためシードは固定するが、良い生成器を使う）。<strong>(2) 独立サンプル</strong>：<a href="#/prep1/mcmc">MCMC</a>では連続する標本が相関するので、実効サンプルサイズは $N$ より小さい。<strong>(3) 分散が有限</strong>：裾が重く分散が発散する被積分関数では $1/\\sqrt N$ すら成り立たない。$1/\\sqrt N$ は「$N$ を増やす」以外に<strong>分散を下げて</strong>速められます——重点サンプリング（$f$ が大きい所を重点的に）、対照変量、層別サンプリング、準モンテカルロ（低食い違い列）などの<strong>分散減少法</strong>。「$N$ を10倍」より「分散を1/10」の方が安い場面が多く、実務ではまず分散減少を考えます。</p>
<div class="note">下で点数 $N$ を増やすと、円内（青）と円外（灰）の点から $\\pi$ の推定値が真値 $3.14159$ に近づきます。$N$ を4倍にすると誤差がおよそ半分になる（$1/\\sqrt N$ 則）ことを確かめてください——「遅いが次元に強い」収束の実感です。</div>`,
    demo: {
      note: '点を増やすほど推定πが真値に近づくが収束は遅い（1/√N）。Nを4倍にして誤差が約半分。乱数の当たり率×4がπ、という素朴な面積比の原理です。',
      controls: [
        { type: 'range', id: 'logn', label: '点数 N = 10^', min: 1.5, max: 4, step: 0.1, value: 2.7 },
        { type: 'button', id: 'reseed', label: '振り直す' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(9 + (p.reseed | 0) * 53);
        const N = Math.round(Math.pow(10, p.logn));
        const inside = [], outside = [];
        let hit = 0;
        const showMax = 3000;
        for (let i = 0; i < N; i++) {
          const x = rand() * 2 - 1, y = rand() * 2 - 1;
          const isIn = x * x + y * y <= 1;
          if (isIn) hit++;
          if (i < showMax) (isIn ? inside : outside).push([x, y]);
        }
        const piEst = 4 * hit / N;
        const pl = Pl.make(canvas, { xmin: -1, xmax: 1, ymin: -1, ymax: 1, pad: { left: 40, right: 14, top: 14, bottom: 34 } });
        pl.clear(); pl.axes({ xLabel: 'x', yLabel: 'y', xTicks: [-1, 0, 1], yTicks: [-1, 0, 1] });
        pl.scatter(outside, { color: Pl.gray, r: 1.8, alpha: 0.4 });
        pl.scatter(inside, { color: Pl.colors[0], r: 1.8, alpha: 0.5 });
        // 円
        const circle = [];
        for (let a = 0; a <= 80; a++) { const t = a / 80 * 2 * Math.PI; circle.push([Math.cos(t), Math.sin(t)]); }
        pl.line(circle, { color: Pl.colors[1], width: 2 });
        pl.text(-1, 1, 'N=' + N + '　π推定=' + piEst.toFixed(4) + '　誤差=' + Math.abs(piEst - Math.PI).toFixed(4), { align: 'left', baseline: 'top', dx: 46, dy: 4, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- MCMC --- */
  T.push({
    section: 'prep1', group: '計算統計・シミュレーション', id: 'mcmc', title: 'MCMC（メトロポリス法・ギブスサンプリング）',
    summary: '直接サンプルできない事後分布から、「少しずつ動いては採否を決める」連鎖で標本を集めるMCMCの仕組みを、ヒストグラムの立ち上がりで見ます。',
    body: `
<p><a href="#/prep1/bayes">ベイズ</a>の事後分布は、正規化定数（分母）が計算できず直接サンプルできないことが多い。そこで<strong>マルコフ連鎖</strong>を使い、定常分布が目標分布になるように標本を生成するのが<strong>MCMC</strong>です。</p>
<p>核心のアイデアは<strong>「各点に、その確率に比例した時間だけ滞在するように歩き回る」</strong>こと。うろつく道のり（連鎖）を長く記録すれば、滞在頻度のヒストグラムが目標分布に近づきます。確率の<strong>比</strong>さえ分かれば歩けるので、面積を1にする正規化定数（＝計算困難な分母）を知らなくてよい、というのが効きどころです。</p>
<h3>メトロポリス・ヘイスティングス法</h3>
<ol>
<li>現在地 $\\theta$ の近くに候補 $\\theta'$ を提案する。</li>
<li>採択確率 $\\alpha=\\min\\!\\left(1,\\dfrac{p(\\theta')}{p(\\theta)}\\right)$ で受け入れる（比なので正規化定数が消える！）。</li>
<li>受け入れれば移動、拒否すればその場に留まる。これを繰り返す。</li>
</ol>
<p>比 $p(\\theta')/p(\\theta)$ しか使わないので、規格化できない分布でも動きます。<strong>ギブスサンプリング</strong>は、多変数のとき「他を固定して1変数ずつ条件付き分布から引く」特別な場合で、条件付き分布が既知なら提案不要（採択率つねに1）で効率的。初期の<strong>バーンイン</strong>（連鎖が定常に達するまで）は捨てます。</p>

<h3>なぜ目標分布に収束するのか（詳細釣り合い）</h3>
<p>採択確率をあの形にする理由は<strong>詳細釣り合い（detailed balance）</strong>という条件にあります。遷移核 $T(\\theta\\to\\theta')$ が</p>
<p>$$ p(\\theta)\\,T(\\theta\\to\\theta')=p(\\theta')\\,T(\\theta'\\to\\theta) $$</p>
<p>を満たせば、$p$ はその連鎖の<strong>定常分布</strong>になります（両辺を $\\theta$ で足し合わせると $\\int p(\\theta)T(\\theta\\to\\theta')d\\theta=p(\\theta')$ ＝「$p$ から出発すると1歩後も $p$」）。対称な提案 $q(\\theta\\to\\theta')=q(\\theta'\\to\\theta)$ のもとでメトロポリスの採択確率 $\\alpha=\\min(1,p(\\theta')/p(\\theta))$ を入れると、$T=q\\cdot\\alpha$ がちょうどこの式を満たします——たとえば $p(\\theta')<p(\\theta)$ なら左辺は $p(\\theta)q\\cdot\\frac{p(\\theta')}{p(\\theta)}=q\\,p(\\theta')$、右辺は $p(\\theta')q\\cdot1=q\\,p(\\theta')$ で一致。数値でも $p(a)\\alpha(a\\to b)=p(b)\\alpha(b\\to a)=0.0779$ と釣り合いました。ここでも $p$ は<strong>比</strong>でしか現れないので、正規化定数は完全に消えます。</p>

<h3>前提条件と、崩れたときの影響</h3>
<table class="simple">
<tr><th>前提</th><th>崩れると起きること</th><th>対処・代替</th></tr>
<tr><td>連鎖がエルゴード的（既約・非周期）</td><td>到達できない領域があると、そこを永久にサンプルしない</td><td>提案分布を広げる・複数の初期値から連鎖を走らせる</td></tr>
<tr><td>定常分布に到達している</td><td>バーンイン前の標本は初期値に引きずられ偏る</td><td>初期の一定割合を捨てる・トレースプロットで目視</td></tr>
<tr><td>標本が実質独立に近い</td><td>連続する標本は強く自己相関（数値例で lag-1 ≈ 0.94）＝有効標本数は見かけの $n$ より遥かに少ない</td><td>間引き（thinning）より有効標本数(ESS)で評価・歩幅調整</td></tr>
<tr><td>目標が単峰、または山を渡れる歩幅</td><td>多峰だと片方の山に閉じこもる（歩幅0.15では3000歩でも隣の山へ渡れず片側に張り付く）</td><td>歩幅を大きく・焼きなまし・並列テンパリング</td></tr>
<tr><td>歩幅（提案分散）が適切</td><td>小さすぎ＝採択率高いが動かず混合が遅い、大きすぎ＝拒否だらけ</td><td>採択率20〜50%を目安に調整・適応MCMC</td></tr>
</table>
<p>収束の確認には、複数連鎖の分散比を見る<strong>$\\hat R$（Gelman–Rubin）</strong>やトレースプロット、有効標本数の点検が定番です。</p>
<div class="note">下は2つの山を持つ目標分布（直接サンプル困難）を、メトロポリス法でサンプルした結果。ステップ数を増やすとヒストグラム（青）が目標分布（オレンジ線）に一致していきます。提案の歩幅が大きすぎ（拒否だらけ）／小さすぎ（動かず片方の山に閉じこもる）と収束が悪化——採択率20〜50%が目安です。</div>`,
    demo: {
      note: 'ステップを増やすとサンプルのヒストグラムが目標分布（2つの山）に一致。歩幅が大きすぎると拒否だらけ、小さすぎると動きが遅く、どちらも収束が悪化します。',
      controls: [
        { type: 'range', id: 'logsteps', label: 'ステップ数 = 10^', min: 2, max: 5, step: 0.1, value: 3.5 },
        { type: 'range', id: 'step', label: '提案の歩幅', min: 0.2, max: 4, step: 0.1, value: 1.2 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(45 + (p.reseed | 0) * 67);
        // 目標: 2つの正規の混合
        const target = x => 0.6 * st.normalPdf(x, -2, 0.8) + 0.4 * st.normalPdf(x, 2.2, 1.0);
        const steps = Math.round(Math.pow(10, p.logsteps));
        const burn = Math.floor(steps * 0.2);
        let x = 0; const samples = []; let accept = 0;
        for (let i = 0; i < steps; i++) {
          const xp = x + p.step * st.randn(rand);
          const a = target(xp) / target(x);
          if (rand() < a) { x = xp; accept++; }
          if (i >= burn) samples.push(x);
        }
        const bins = st.histogram(samples, 44, -6, 6);
        const ymax = 0.32;
        const pl = Pl.make(canvas, { xmin: -6, xmax: 6, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: 'θ', yLabel: '密度' });
        pl.bars(bins.map(b => ({ x0: b.x0, x1: b.x1, y: b.density })), { color: Pl.colors[0], alpha: 0.55 });
        const xs = st.linspace(-6, 6, 240);
        pl.line(xs.map(v => [v, target(v)]), { color: Pl.colors[1], width: 2.5 });
        pl.legend([{ label: 'MCMC標本', color: Pl.colors[0] }, { label: '目標分布', color: Pl.colors[1] }]);
        pl.text(-6, ymax, 'ステップ=' + steps + '　採択率=' + (accept / steps * 100).toFixed(0) + '%（20〜50%が目安）', { align: 'left', baseline: 'top', dx: 46, dy: 4, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- 標本調査法 --- */
  T.push({
    section: 'prep1', group: '標本調査法', id: 'sampling-survey', title: '標本調査法（有限修正・抽出法）',
    summary: '有限母集団から抽出するときの「有限修正」と、単純無作為・層化・クラスターといった抽出デザインの違いを整理します。',
    body: `
<p>有限母集団（大きさ $N$）から $n$ 個を<strong>非復元</strong>で抽出するとき、標本平均の分散には<strong>有限母集団修正（FPC）</strong>がかかります。</p>
<p>$$ V[\\bar x]=\\frac{\\sigma^2}{n}\\cdot\\underbrace{\\frac{N-n}{N-1}}_{\\text{有限修正}} $$</p>
<p>$n$ が $N$ に近づくほど修正係数は0に近づき、全数調査（$n=N$）なら分散はゼロ。$N\\gg n$ なら修正はほぼ1で無視できます。</p>
<h3>代表的な抽出デザイン</h3>
<ul>
<li><strong>単純無作為抽出 (SRS)</strong>：全員に等しい確率。基準となる方法。</li>
<li><strong>層化抽出</strong>：母集団を似た者どうしの<strong>層</strong>に分け、各層から抽出。層内が均質なら<strong>分散が下がる</strong>（効率的）。</li>
<li><strong>クラスター抽出</strong>：集落（学校・地区）単位で抽出。コストは下がるが、集落内が似ていると<strong>分散は上がりがち</strong>。</li>
<li><strong>系統抽出</strong>：一定間隔で抽出。周期性があると偏る危険。</li>
</ul>
<div class="note">下で抽出率 $n/N$ を上げると、有限修正により標本平均の分散（標準誤差）が縮み、全数調査に近づくとゼロになる様子が見えます。「母集団の大きさ $N$ ではなく、主に標本サイズ $n$ が精度を決める」——ただし $n/N$ が大きいときは修正が効きます。</div>`,
    demo: {
      note: '抽出率 n/N を1(全数)に近づけると標準誤差が0へ。N≫n の領域では曲線がほぼ平ら＝有限修正はほぼ無視でき、精度は n でほぼ決まります。',
      controls: [
        { type: 'range', id: 'N', label: '母集団の大きさ N', min: 50, max: 2000, step: 50, value: 500 },
        { type: 'range', id: 'ratio', label: '抽出率 n/N (%)', min: 1, max: 100, step: 1, value: 20 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const N = Math.round(p.N), sigma = 10;
        const rs = st.linspace(0.01, 1, 120);
        const se = rs.map(r => { const n = Math.max(1, r * N); return [r * 100, sigma / Math.sqrt(n) * Math.sqrt((N - n) / (N - 1 || 1))]; });
        const seNoFpc = rs.map(r => { const n = Math.max(1, r * N); return [r * 100, sigma / Math.sqrt(n)]; });
        const pl = Pl.make(canvas, { xmin: 0, xmax: 100, ymin: 0, ymax: sigma / Math.sqrt(Math.max(1, 0.01 * N)) * 1.05 });
        pl.clear(); pl.axes({ xLabel: '抽出率 n/N (%)', yLabel: '標本平均の標準誤差' });
        pl.line(seNoFpc, { color: Pl.gray, width: 1.8, dash: [6, 4] });
        pl.line(se, { color: Pl.colors[0], width: 2.5 });
        const rNow = p.ratio;
        pl.vline(rNow, { color: Pl.ink, dash: [4, 3] });
        const nNow = Math.round(rNow / 100 * N);
        const seNow = sigma / Math.sqrt(nNow) * Math.sqrt((N - nNow) / (N - 1));
        pl.legend([{ label: '有限修正あり', color: Pl.colors[0] }, { label: '修正なし σ/√n', color: Pl.gray }]);
        pl.text(100, pl.ymax, 'n=' + nNow + '　SE=' + seNow.toFixed(2), { align: 'right', baseline: 'top', dx: -8, dy: 4, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- ブロック計画・乱塊法・一部実施 --- */
  T.push({
    section: 'prep1', group: '分散分析と実験計画（範囲内）', id: 'blocking-designs', title: '乱塊法・一部実施要因計画・直交配列',
    summary: 'ブロック化で誤差を減らす乱塊法と、要因が多いとき実験回数を賢く間引く一部実施要因計画・直交配列の考え方を押さえます。',
    body: `
<p>実験計画の<a href="#/prep1/principles">局所管理</a>を具体化する手法です。</p>
<h3>乱塊法（乱塊ブロック計画）</h3>
<p>日・装置・被験者など、ばらつきの原因になる要因を<strong>ブロック</strong>にまとめ、各ブロック内で全処理を無作為順に実施します。ブロック間の変動を分散分析表で分離することで、<strong>誤差分散が小さくなり検出力が上がります</strong>。</p>
<p>$$ SS_\\text{total}=SS_\\text{処理}+SS_\\text{ブロック}+SS_\\text{誤差} $$</p>
<h3>一部実施要因計画（fractional factorial）</h3>
<p>要因が $k$ 個・各2水準だと全実施は $2^k$ 回。要因が増えると爆発するので、<strong>一部（$2^{k-p}$）だけ</strong>を賢く選んで実施します。代償は<strong>交絡（別名, alias）</strong>——ある要因の主効果が、別の高次交互作用と区別できなくなること。高次交互作用は無視できるという仮定（疎性）のもとで成立します。</p>
<h3>直交配列（直交表）</h3>
<p><a href="#/prep1/orthogonal">直交表</a>は一部実施要因計画を表にしたもの。どの2列も水準組合せが均等に現れる「直交性」により、少ない実験で主効果を偏りなく推定できます。分解能（resolution）が別名構造の良し悪しを表します。</p>
<div class="note">下は乱塊法の効果。ブロック間変動（例：日ごとの差）が大きいとき、それを分離せず誤差に含めると処理効果が埋もれます。「ブロックとして分離」をオンにすると誤差が縮み、同じ処理差でも検出力（F値）が上がることが確認できます。</div>`,
    demo: {
      note: 'ブロック変動を分離しないと誤差分散に混入しF値が小さく有意になりにくい。「分離する」をオンにすると誤差が縮みF値が跳ね上がる＝乱塊法の御利益です。',
      controls: [
        { type: 'range', id: 'blockvar', label: 'ブロック間のばらつき', min: 0, max: 6, step: 0.5, value: 3 },
        { type: 'select', id: 'sep', label: 'ブロックの扱い', value: 'no', options: [
          { value: 'no', label: '分離しない（誤差に混入）' },
          { value: 'yes', label: 'ブロックとして分離' },
        ]},
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(88 + (p.reseed | 0) * 31);
        const nTreat = 3, nBlock = 5;
        const treatEff = [-2, 0, 2];
        const blockEff = [];
        for (let b = 0; b < nBlock; b++) blockEff.push(p.blockvar * st.randn(rand));
        const data = []; // {treat, block, y}
        for (let t = 0; t < nTreat; t++) for (let b = 0; b < nBlock; b++) data.push({ t, b, y: 20 + treatEff[t] + blockEff[b] + 1.0 * st.randn(rand) });
        const grand = st.mean(data.map(d => d.y));
        // 処理平方和
        let ssT = 0; for (let t = 0; t < nTreat; t++) { const m = st.mean(data.filter(d => d.t === t).map(d => d.y)); ssT += nBlock * (m - grand) ** 2; }
        // ブロック平方和
        let ssB = 0; for (let b = 0; b < nBlock; b++) { const m = st.mean(data.filter(d => d.b === b).map(d => d.y)); ssB += nTreat * (m - grand) ** 2; }
        let ssTot = 0; for (const d of data) ssTot += (d.y - grand) ** 2;
        let ssE, dfE;
        if (p.sep === 'yes') { ssE = ssTot - ssT - ssB; dfE = (nTreat - 1) * (nBlock - 1); }
        else { ssE = ssTot - ssT; dfE = nTreat * nBlock - nTreat; } // ブロックを誤差に含める
        const F = (ssT / (nTreat - 1)) / (ssE / dfE);
        const pval = 1 - st.fCdf(F, nTreat - 1, dfE);
        // 描画: 各処理の点をブロック色で
        const pl = Pl.make(canvas, { xmin: 0.3, xmax: nTreat + 0.7, ymin: grand - 12, ymax: grand + 12 });
        pl.clear(); pl.axes({ xLabel: '処理', yLabel: '測定値', xTicks: [1, 2, 3], xFmt: v => '処理' + v });
        for (const d of data) pl.scatter([[d.t + 1 + (d.b - 2) * 0.08, d.y]], { color: Pl.colors[d.b % Pl.colors.length], r: 4, alpha: 0.85 });
        for (let t = 0; t < nTreat; t++) { const m = st.mean(data.filter(d => d.t === t).map(d => d.y)); pl.ctx.strokeStyle = Pl.ink; pl.ctx.lineWidth = 3; pl.ctx.beginPath(); pl.ctx.moveTo(pl.X(t + 0.75), pl.Y(m)); pl.ctx.lineTo(pl.X(t + 1.25), pl.Y(m)); pl.ctx.stroke(); }
        pl.text(0.3, grand + 12, 'F(処理) = ' + F.toFixed(2) + '　p = ' + (pval < 0.001 ? '<0.001' : pval.toFixed(3)) + (pval < 0.05 ? ' ✓有意' : ''), { align: 'left', baseline: 'top', dx: 56, dy: 4, color: pval < 0.05 ? '#2a9d8f' : '#475467', size: 13 });
        pl.text(0.3, grand + 12, '点の色＝ブロック（例：測定日）', { align: 'left', baseline: 'top', dx: 56, dy: 24, color: '#98a2b3', size: 11.5 });
      },
    },
  });

})();
