'use strict';
/* 発展1: マルコフ連鎖・確率過程／回帰の発展／時系列の発展 */
(function () {
  const T = (window.STATS_TOPICS = window.STATS_TOPICS || []);
  const S = () => window.Stats;
  const P = () => window.Plot;

  /* --- マルコフ連鎖 --- */
  T.push({
    section: 'prep1', group: 'マルコフ連鎖と確率過程', id: 'markov-chain', title: 'マルコフ連鎖と定常分布',
    summary: '「次の状態は今の状態だけで決まる」マルコフ性から、状態の確率分布が時間とともに定常分布へ落ち着く様子を観察します。',
    body: `
<p><strong>マルコフ連鎖</strong>は、次の状態が「1つ前の状態」だけで決まる確率過程です（過去の履歴は不要＝マルコフ性）。状態間の移りやすさを<strong>推移確率行列</strong> $P$ にまとめます。</p>
<p>$$ \\pi_{t+1}=\\pi_t P,\\qquad \\pi_t=\\pi_0 P^{t} $$</p>
<p>$\\pi_t$ は時刻 $t$ の状態分布（行ベクトル）。条件（既約かつ非周期）がそろうと、初期状態によらず一定の分布 $\\pi^*$ に収束します。これを<strong>定常分布</strong>と呼び、$\\pi^*=\\pi^* P$ を満たします。</p>
<ul>
<li><strong>既約性</strong>：どの状態からどの状態へも（何ステップかで）行ける。</li>
<li><strong>再帰性</strong>：出発した状態にいつか必ず戻る。</li>
<li><strong>非周期性</strong>：戻る周期が特定の倍数に縛られない。</li>
</ul>
<div class="note">下は2状態（晴れ・雨）のマルコフ連鎖。各状態の「継続確率」を動かすと、初期状態（晴れ100%）から出発した分布が定常分布（点線）へ収束していく速さが変わります。継続確率が高いほど収束は遅くなります。</div>`,
    demo: {
      note: 'どの初期状態から始めても同じ定常分布(点線)に収束する＝マルコフ連鎖の記憶が消えていく様子。継続確率を1に近づけると状態が粘り、収束が遅くなります。',
      controls: [
        { type: 'range', id: 'paa', label: '晴れの継続確率 P(晴→晴)', min: 0.1, max: 0.95, step: 0.05, value: 0.8 },
        { type: 'range', id: 'pbb', label: '雨の継続確率 P(雨→雨)', min: 0.1, max: 0.95, step: 0.05, value: 0.6 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const a = p.paa, b = p.pbb;
        // P = [[a,1-a],[1-b,b]] 状態0=晴,1=雨
        let pi = [1, 0];
        const traj = [[0, 1, 0]];
        for (let t = 1; t <= 30; t++) {
          const n0 = pi[0] * a + pi[1] * (1 - b);
          const n1 = pi[0] * (1 - a) + pi[1] * b;
          pi = [n0, n1];
          traj.push([t, n0, n1]);
        }
        const piStar0 = (1 - b) / (2 - a - b), piStar1 = 1 - piStar0;
        const pl = Pl.make(canvas, { xmin: 0, xmax: 30, ymin: 0, ymax: 1 });
        pl.clear(); pl.axes({ xLabel: '時刻 t', yLabel: '状態の確率' });
        pl.hline(piStar0, { color: Pl.colors[0], dash: [5, 4], label: '定常 π晴=' + piStar0.toFixed(2) });
        pl.hline(piStar1, { color: Pl.colors[1], dash: [5, 4], label: '定常 π雨=' + piStar1.toFixed(2) });
        pl.line(traj.map(r => [r[0], r[1]]), { color: Pl.colors[0], width: 2.5 });
        pl.line(traj.map(r => [r[0], r[2]]), { color: Pl.colors[1], width: 2.5 });
        pl.scatter(traj.map(r => [r[0], r[1]]), { color: Pl.colors[0], r: 2.5 });
        pl.scatter(traj.map(r => [r[0], r[2]]), { color: Pl.colors[1], r: 2.5 });
        pl.legend([{ label: 'P(晴れ)', color: Pl.colors[0] }, { label: 'P(雨)', color: Pl.colors[1] }]);
      },
    },
  });

  /* --- 確率過程の基礎 --- */
  T.push({
    section: 'prep1', group: 'マルコフ連鎖と確率過程', id: 'stochastic-process', title: 'ランダムウォーク・ポアソン過程・ブラウン運動',
    summary: '時間とともに動く確率過程の代表3種を、実際のサンプルパスで見比べ、「独立増分」「連続化」の関係を掴みます。',
    body: `
<p><strong>確率過程</strong>は、時間 $t$ で添字づけられた確率変数の族 $\\{X_t\\}$ です。基本の3つ。</p>
<ul>
<li><strong>ランダムウォーク</strong>：$S_n=\\sum_{i=1}^n Z_i$（$Z_i=\\pm1$）。1歩ずつランダムに動く離散過程。$V[S_n]=n$ なので広がりは $\\sqrt n$ に比例。</li>
<li><strong>ポアソン過程</strong>：まれな事象の到着数 $N(t)$。到着間隔が指数分布 $\\mathrm{Exp}(\\lambda)$、$N(t)\\sim\\mathrm{Po}(\\lambda t)$。窓口の客数・放射線計数など。</li>
<li><strong>ブラウン運動（ウィーナー過程）</strong>：ランダムウォークの歩幅と時間を細かくした連続極限。$W_t\\sim N(0,t)$、増分は独立。株価モデルや拡散現象の基礎。</li>
</ul>
<p>共通点は<strong>独立増分</strong>（重ならない時間区間の変化が独立）。ランダムウォークを $\\Delta t\\to0$ にするとブラウン運動、まれな成功の数を数えるとポアソン過程、という関係です。</p>

<h3>なぜその式になるか</h3>
<p><strong>ランダムウォークの $\\sqrt n$ 則</strong>：各ステップは独立で $E[Z_i]=0,\\ V[Z_i]=1$。和の分散は<strong>独立ゆえ</strong>そのまま足せて $V[S_n]=\\sum_i V[Z_i]=n$、標準偏差は $\\sqrt n$——これが「末広がりが $\\sqrt t$ に比例」の正体です。もし各ステップが相関していたら共分散項が残り、この式は成り立ちません（L3で扱う）。</p>
<p><strong>ポアソン過程が $\\mathrm{Po}(\\lambda t)$ になる理由</strong>：区間 $[0,t]$ を $m$ 個の微小区間に割ると、各区間で事象が起きる確率はおよそ $\\lambda t/m$、起きない確率がほとんど、しかも独立。よって事象数は $\\mathrm{Binom}(m,\\lambda t/m)$ に従い、$m\\to\\infty$ の<a href="#/prep1/distributions">二項→ポアソン極限</a>で $N(t)\\sim\\mathrm{Po}(\\lambda t)$。ここから $E[N(t)]=V[N(t)]=\\lambda t$（平均と分散が等しい＝ポアソンの指紋）。また「区間 $[0,s]$ に1件も来ない確率」は $e^{-\\lambda s}$ なので、<strong>到着間隔は $\\mathrm{Exp}(\\lambda)$</strong>（平均 $1/\\lambda$）で無記憶です。</p>
<p><strong>ランダムウォーク→ブラウン運動</strong>：歩幅を $\\pm\\sqrt{\\Delta t}$、1歩の時間を $\\Delta t$ にとると、時刻 $t$ までの $n=t/\\Delta t$ 歩の分散は $n\\cdot\\Delta t=t$。<a href="#/prep1/clt">中心極限定理</a>で和は正規に近づくので、極限は $W_t\\sim N(0,t)$。<strong>$\\sqrt t$ 則はCLTの言い換え</strong>で、空間を $\\sqrt{\\Delta t}$・時間を $\\Delta t$ でスケールすると有限の極限が残る、というのが連続化の勘所です。</p>

<h3>前提条件と、崩れたときの影響</h3>
<table class="simple">
<tr><th>前提</th><th>崩れると起きること</th><th>対処・代替</th></tr>
<tr><td>増分が独立</td><td>ステップが相関すると $V[S_n]\\ne n$ で $\\sqrt t$ 則が壊れ、広がり方が変わる</td><td>自己相関を持つ過程（<a href="#/prep1/arima">ARIMA</a>）・フラクショナルブラウン運動</td></tr>
<tr><td>増分が定常・強度 $\\lambda$ 一定</td><td>時間帯で到着率が変わる（昼夜の来客差）と $\\lambda t$ が合わない</td><td>非斉次ポアソン過程 $\\lambda(t)$</td></tr>
<tr><td>事象が「まれ・独立」（ポアソン）</td><td>事象が群れる（伝染・余震）と分散＞平均＝<strong>過分散</strong>になり $\\mathrm{Po}$ が破綻</td><td>Cox過程・Hawkes過程・<a href="#/prep1/discrete-distributions">負の二項</a></td></tr>
<tr><td>ドリフトなし（対称ステップ）</td><td>$p\\ne0.5$ の偏りやトレンドがあると平均が動き、対称な広がりでなくなる</td><td>ドリフト付きBM・幾何ブラウン運動（株価）</td></tr>
<tr><td>経路の滑らかさを仮定しない</td><td>BMは至る所で微分不可能・無限変動。普通の微積分が使えない</td><td>確率微分方程式・伊藤積分で扱う</td></tr>
</table>

<h3>推定と実質的な意味</h3>
<p>過程のパラメータは観測から推定できます。ポアソン過程の強度は $\\hat\\lambda=N/T$（観測時間 $T$ に $N$ 件）が<a href="#/prep1/mle">最尤推定量</a>で、その分散は $V[\\hat\\lambda]=\\lambda/T$——<strong>観測時間 $T$ を伸ばすほど精度が上がる</strong>（標本サイズでなく観測時間が効く）。$\\lambda=2.5,\\ T=8$ なら $\\hat\\lambda$ の分散は約 $0.31$、標準誤差 $\\approx0.56$ です。</p>
<p>より本質的な「実質的意味」は<strong>予測の限界</strong>です。ランダムウォーク・ブラウン運動の分散は $t$ に比例して増え続けます（広がりは $\\sqrt t$）。つまり<strong>長期予測の信頼区間は青天井に広がり、遠い将来は実質的に予測不能</strong>。株価がランダムウォーク的なら「明日は多少読めても1年後はほぼ無情報」で、この $\\sqrt t$ 則はリスク管理（VaRの $\\sqrt t$ スケーリング）や予測地平の設計に直結します。データが本当にランダムウォークか（トレンドや平均回帰がないか）は単位根検定で確かめ、あれば<a href="#/prep1/arima">ARIMA</a>など別モデルに切り替えます。</p>

<div class="note">下で過程を切り替え、複数のサンプルパスを観察してください。ランダムウォークとブラウン運動は「$\\sqrt t$ で広がる末広がり」、ポアソン過程は「階段状に増える」のが特徴です。</div>`,
    demo: {
      note: 'ランダムウォーク/ブラウン運動は時間とともに√tで扇状に広がる（分散が t に比例）。ポアソン過程は下向きに増えない階段関数で、λを上げると段が密になります。',
      controls: [
        { type: 'select', id: 'proc', label: '過程', value: 'rw', options: [
          { value: 'rw', label: 'ランダムウォーク' },
          { value: 'bm', label: 'ブラウン運動' },
          { value: 'pp', label: 'ポアソン過程' },
        ]},
        { type: 'range', id: 'rate', label: 'ポアソン強度 λ', min: 0.5, max: 6, step: 0.5, value: 2 },
        { type: 'button', id: 'reseed', label: '再生成' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const npaths = 6;
        if (p.proc === 'pp') {
          const Tmax = 10, lam = p.rate;
          const series = [];
          let ymax = 5;
          for (let s = 0; s < 4; s++) {
            const rand = st.rng(200 + s * 137 + (p.reseed | 0) * 13);
            const pts = [[0, 0]]; let t = 0, n = 0;
            while (t < Tmax) { t += -Math.log(1 - rand()) / lam; if (t < Tmax) { pts.push([t, n]); n++; pts.push([t, n]); } }
            pts.push([Tmax, n]); series.push(pts); ymax = Math.max(ymax, n + 1);
          }
          const pl = Pl.make(canvas, { xmin: 0, xmax: Tmax, ymin: 0, ymax });
          pl.clear(); pl.axes({ xLabel: '時刻 t', yLabel: '到着数 N(t)' });
          series.forEach((pts, i) => pl.line(pts, { color: Pl.colors[i % Pl.colors.length], width: 1.8 }));
          pl.text(0, ymax, 'E[N(t)] = λt、傾き λ=' + lam, { align: 'left', baseline: 'top', dx: 56, dy: 4, color: '#475467', size: 12.5 });
          return;
        }
        const steps = 100;
        const series = [];
        let lim = 3 * Math.sqrt(steps) * 0.4;
        for (let s = 0; s < npaths; s++) {
          const rand = st.rng(300 + s * 271 + (p.reseed | 0) * 29);
          const pts = [[0, 0]]; let x = 0;
          for (let t = 1; t <= steps; t++) {
            if (p.proc === 'rw') x += (rand() < 0.5 ? -1 : 1);
            else x += st.randn(rand); // bm: 単位分散増分
            pts.push([t, x]);
          }
          series.push(pts);
        }
        const pl = Pl.make(canvas, { xmin: 0, xmax: steps, ymin: -lim, ymax: lim });
        pl.clear(); pl.axes({ xLabel: p.proc === 'rw' ? 'ステップ n' : '時刻 t', yLabel: '位置' });
        // ±√t の広がり帯
        const band = [];
        for (let t = 0; t <= steps; t++) band.push([t, Math.sqrt(t)]);
        pl.line(band, { color: Pl.gray, dash: [5, 4], width: 1.5 });
        pl.line(band.map(q => [q[0], -q[1]]), { color: Pl.gray, dash: [5, 4], width: 1.5 });
        series.forEach((pts, i) => pl.line(pts, { color: Pl.colors[i % Pl.colors.length], width: 1.4, alpha: 0.85 }));
        pl.hline(0, { color: Pl.ink, dash: [] });
        pl.text(0, lim, '灰点線 = ±√t（標準偏差の広がり）', { align: 'left', baseline: 'top', dx: 56, dy: 4, color: '#475467', size: 12 });
      },
    },
  });

  /* --- 回帰診断 --- */
  T.push({
    section: 'prep1', group: '回帰分析', id: 'regression-diagnostics', title: '回帰診断（残差・てこ比・外れ値）',
    summary: '回帰は「当てはめて終わり」ではありません。残差プロット・てこ比・Q-Qプロットで前提の崩れと影響点を見抜きます。',
    body: `
<p>最小二乗回帰の前提（線形性・等分散・独立・正規性）が崩れていないかを、<strong>残差 $e_i=y_i-\\hat y_i$</strong> を使って点検します。</p>
<ul>
<li><strong>残差プロット</strong>（横軸: 予測値、縦軸: 残差）：ランダムな帯なら良好。曲がり→非線形、ラッパ状→不等分散。</li>
<li><strong>てこ比（leverage）</strong> $h_{ii}$：説明変数が極端な点ほど大きく、回帰直線を強く引っ張る。$h_{ii}$ が大きく残差も大きい点は<strong>影響点</strong>。</li>
<li><strong>Q-Qプロット</strong>：残差の分位点と正規分布の分位点。直線に乗れば正規性OK、裾で反れば外れ値・裾の重さ。</li>
<li><strong>クックの距離</strong>：その点を除くと係数がどれだけ動くか。影響の大きさの総合指標。</li>
<li><strong>系列相関</strong>（時系列データ）：残差が隣と相関していないかを<strong>ダービン・ワトソン比</strong>で判定（2付近なら無相関、0に近いと正の系列相関）。</li>
</ul>
<div class="note">下で「影響点」を動かしてください。$x$ が平均から離れた位置（高てこ比）にあると、その1点だけで回帰直線（実線）が大きく傾き、全体の当てはめが歪みます。中央付近の点をいくら動かしても直線はあまり動きません。</div>`,
    demo: {
      note: '影響点をxが端（高てこ比）に置いてyを上下させると、赤の回帰直線が大きく振られる。灰の直線はその点を除いた本来の関係。てこ比が高い点ほど1点の破壊力が大きい。',
      controls: [
        { type: 'range', id: 'px', label: '影響点の x 位置', min: 0, max: 10, step: 0.2, value: 9 },
        { type: 'range', id: 'py', label: '影響点の y 位置', min: -2, max: 12, step: 0.2, value: 10 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(55 + (p.reseed | 0) * 19);
        // 基本データ: y = 0.6x + 1 + noise, x in [2,6]
        const xs = [], ys = [];
        for (let i = 0; i < 20; i++) { const x = 2 + 4 * rand(); xs.push(x); ys.push(0.6 * x + 1 + 0.7 * st.randn(rand)); }
        const fit = (X, Y) => {
          const mx = st.mean(X), my = st.mean(Y);
          let sxy = 0, sxx = 0;
          for (let i = 0; i < X.length; i++) { sxy += (X[i] - mx) * (Y[i] - my); sxx += (X[i] - mx) ** 2; }
          const b = sxy / sxx; return { b, a: my - b * mx };
        };
        const base = fit(xs, ys);
        const xs2 = xs.concat([p.px]), ys2 = ys.concat([p.py]);
        const withPt = fit(xs2, ys2);
        const pl = Pl.make(canvas, { xmin: 0, xmax: 10.5, ymin: -3, ymax: 13 });
        pl.clear(); pl.axes({ xLabel: 'x', yLabel: 'y' });
        pl.scatter(xs.map((x, i) => [x, ys[i]]), { color: Pl.colors[0], r: 3.5, alpha: 0.8 });
        pl.scatter([[p.px, p.py]], { color: Pl.colors[1], r: 7, alpha: 0.9 });
        pl.line([[0, base.a], [10.5, base.a + base.b * 10.5]], { color: Pl.gray, width: 2, dash: [6, 4] });
        pl.line([[0, withPt.a], [10.5, withPt.a + withPt.b * 10.5]], { color: Pl.colors[1], width: 2.5 });
        // てこ比の目安（xの標準化距離）
        const mx = st.mean(xs2);
        const lev = Math.abs(p.px - mx);
        pl.legend([{ label: '影響点なしの直線', color: Pl.gray }, { label: '影響点ありの直線', color: Pl.colors[1] }]);
        pl.text(0, 13, '影響点の x−x̄ = ' + (p.px - mx).toFixed(1) + '（大きいほど高てこ比）', { align: 'left', baseline: 'top', dx: 56, dy: 4, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- 正則化（Ridge / Lasso） --- */
  T.push({
    section: 'prep1', group: '回帰分析', id: 'regularization', title: '正則化（リッジ回帰・Lasso）',
    summary: '係数に「罰則」を課して過学習と多重共線性を抑える正則化を、罰則の強さで係数が縮む・ゼロになる様子（係数パス）で理解します。',
    body: `
<p>最小二乗の目的関数に係数の大きさへの<strong>罰則</strong>を足すと、係数が0の方へ引っ張られ、過学習や<a href="#/prep1/multicollinearity">多重共線性</a>による暴れを抑えられます。</p>
<p>$$ \\text{リッジ(L2)}:\\ \\min_\\beta \\|y-X\\beta\\|^2+\\lambda\\sum_j\\beta_j^2 $$</p>
<p>$$ \\text{Lasso(L1)}:\\ \\min_\\beta \\|y-X\\beta\\|^2+\\lambda\\sum_j|\\beta_j| $$</p>
<ul>
<li><strong>リッジ</strong>：係数を滑らかに縮める（0にはしない）。共線性に強く、係数を安定化。</li>
<li><strong>Lasso</strong>：角ばった制約のため、いくつかの係数を<strong>ちょうど0</strong>にする＝<strong>変数選択</strong>を兼ねる。範囲表の「$L_1$ 正則化法」。</li>
</ul>
<p>$\\lambda$ は「当てはまり」と「係数の小ささ」のトレードオフつまみ。大きいほど強く縮み、バイアスは増えるが分散は減ります。$\\lambda$ は交差検証で選びます。</p>

<h3>なぜ縮むのか・なぜLassoだけ0になるのか</h3>
<p>リッジには<strong>閉じた解</strong>があります。目的関数を $\\beta$ で微分して0と置くと</p>
<p>$$ \\hat{\\boldsymbol\\beta}_{\\mathrm{ridge}}=(X^\\top X+\\lambda I)^{-1}X^\\top\\boldsymbol y $$</p>
<p>最小二乗の $(X^\\top X)^{-1}X^\\top\\boldsymbol y$ に対角成分 $\\lambda$ を足しただけですが、この $\\lambda I$ が効きます。<a href="#/prep1/multicollinearity">多重共線性</a>や $p>n$ で $X^\\top X$ が特異（逆行列を持てない）でも、$\\lambda I$ を足すと必ず正則になり解が一意に定まる——これが「共線性に強い」のカラクリです。実際、ほぼ共線な2変数で $X^\\top X$ の条件数が約390万でも、$\\lambda I$ を足すと約180まで下がり、係数が暴れなくなります。</p>
<p>「なぜリッジは0にせず、Lassoは0にするのか」は、変数が直交する（$X^\\top X=nI$）理想ケースで各係数がどう変換されるかを見ると一目瞭然です。</p>
<p>$$ \\hat\\beta^{\\mathrm{ridge}}_j=\\frac{\\hat\\beta^{\\mathrm{LS}}_j}{1+\\lambda/n}, \\qquad \\hat\\beta^{\\mathrm{lasso}}_j=\\mathrm{sign}(\\hat\\beta^{\\mathrm{LS}}_j)\\,\\max\\!\\Big(0,\\ |\\hat\\beta^{\\mathrm{LS}}_j|-\\tfrac{\\lambda}{2n}\\Big) $$</p>
<p>リッジは全係数を<strong>同じ割合で縮める</strong>ので、いくら $\\lambda$ を上げても0には漸近するだけで到達しません。Lassoは<strong>一定量 $\\lambda/2n$ を差し引いてマイナスになったら0で止める</strong>（軟しきい値）ので、もともと小さい係数はきれいに0になります＝変数選択。この差は幾何でも説明できます。制約 $\\sum|\\beta_j|\\le t$（L1）は<strong>角が座標軸上にあるダイヤ型</strong>、$\\sum\\beta_j^2\\le t$（L2）は<strong>角のない円</strong>。誤差の等高線がこの制約に最初に触れる点は、ダイヤなら角＝どれかの係数が0、円なら滑らかな縁＝0にはならない、というわけです。</p>

<h3>前提条件と、崩れたときの影響</h3>
<table class="simple">
<tr><th>前提</th><th>崩れると起きること</th><th>対処・代替</th></tr>
<tr><td>変数を標準化してある</td><td>罰則 $\\sum\\beta_j^2$ はスケール依存。単位の大きい変数ほど係数が小さく罰せられにくく、縮小が不公平になる</td><td>各変数を平均0・分散1に標準化してから当てはめる（切片は罰しない）</td></tr>
<tr><td>$\\lambda$ を交差検証で選ぶ</td><td>大きすぎるとバイアス過大（過少適合）、小さすぎると縮小が効かず過学習</td><td><a href="#/prep1/crossval">交差検証</a>で予測誤差最小の $\\lambda$（や1-SEルール）</td></tr>
<tr><td>Lassoでは説明変数が強く相関しない</td><td>相関する変数群からLassoは<strong>1本を気まぐれに選び他を0</strong>にする。標本が変わると選択が入れ替わり不安定</td><td>Elastic Net（L1+L2）でグループごと残す・安定性選択</td></tr>
<tr><td>$p>n$ で真に効く変数が $n$ 個以下</td><td>Lassoは最大でも $n$ 個しか選べず、真の変数がそれ以上あると取りこぼす</td><td>Elastic Net・スクリーニング＋正則化</td></tr>
<tr><td>スパース性を求めている</td><td>リッジは変数を1つも落とさない（解釈用の絞り込みには不向き）</td><td>選択が要るならLasso/Elastic Net、安定な予測だけならリッジ</td></tr>
</table>

<h3>有意性と実質的な意味</h3>
<p>正則化は<strong>係数をわざとバイアスさせて分散を下げる</strong>手法です。実際、$\\beta$ の推定二乗誤差（MSE）を $\\lambda$ で走査すると、$\\lambda=0$（最小二乗）ではなく<strong>ある正の $\\lambda$ で最小</strong>になります（数値例では MSE が $\\lambda{=}0$ の 2.12 から $\\lambda{=}20$ の 0.80 まで下がってから再上昇）。つまり「最良のモデルは意図的に偏らせたモデル」です。</p>
<p>この性質から、正則化した係数の読み方には注意が要ります。<strong>縮んだ係数はもはや不偏でない</strong>ため、その大きさをそのまま効果量として読むと過小評価になります。さらに、Lassoが変数を選んだあとに通常の最小二乗の $t$ 検定・p値を当てはめるのは<strong>誤り</strong>です（同じデータで選択と検定を二度使うと有意性が過大評価される＝選択後推論の問題）。正則化は本質的に<strong>予測と変数スクリーニングの道具</strong>であり、有意性検定の代わりにはなりません。係数の信頼区間が要るなら、選択の不確実性まで込みで評価する安定性選択やベイズ的縮小（<a href="#/prep1/bayes">ベイズ</a>の事前分布としての解釈：リッジ＝正規事前、Lasso＝ラプラス事前）を使います。</p>

<div class="note">下は罰則の強さ $\\lambda$ を上げたときの<strong>係数パス</strong>。リッジでは全係数が滑らかに0へ近づき、Lassoでは係数が次々と0に到達して消える（スパース化）のが見えます。$\\lambda=0$ は通常の最小二乗です。</div>`,
    demo: {
      note: 'λを右へ動かすと係数が原点へ収縮。Lassoでは線が次々ゼロに張り付く＝不要な変数を自動で落とす。リッジは0に漸近するが完全な0にはならない点が両者の決定的な違いです。',
      controls: [
        { type: 'select', id: 'kind', label: '種類', value: 'lasso', options: [
          { value: 'ridge', label: 'リッジ (L2)' },
          { value: 'lasso', label: 'Lasso (L1)' },
        ]},
        { type: 'range', id: 'loglam', label: 'log₁₀ λ', min: -2, max: 2.5, step: 0.1, value: 0 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        // 最小二乗解（固定の擬似データの真の係数）
        const beta0 = [2.5, -1.8, 1.2, 0.5, -0.3];
        const colors = Pl.colors;
        const lamNow = Math.pow(10, p.loglam);
        const lams = [];
        for (let e = -2; e <= 2.5; e += 0.05) lams.push(Math.pow(10, e));
        // 教育用の縮小則（直交近似）: ridge b/(1+λ), lasso soft-threshold
        const shrink = (b, lam, kind) => kind === 'ridge' ? b / (1 + lam) : Math.sign(b) * Math.max(0, Math.abs(b) - lam * 0.5);
        const pl = Pl.make(canvas, { xmin: -2, xmax: 2.5, ymin: -2.2, ymax: 2.8 });
        pl.clear(); pl.axes({ xLabel: 'log₁₀ λ（罰則の強さ →）', yLabel: '係数 βⱼ' });
        pl.hline(0, { color: Pl.gray, dash: [] });
        beta0.forEach((b, j) => {
          const path = lams.map(l => [Math.log10(l), shrink(b, l, p.kind)]);
          pl.line(path, { color: colors[j % colors.length], width: 2.2 });
        });
        pl.vline(p.loglam, { color: Pl.ink, dash: [4, 3], label: 'λ=' + lamNow.toFixed(2) });
        const legend = beta0.map((b, j) => ({ label: 'β' + (j + 1), color: colors[j % colors.length] }));
        pl.legend(legend);
      },
    },
  });

  /* --- 一般化線形モデル --- */
  T.push({
    section: 'prep1', group: '回帰分析', id: 'glm', title: '一般化線形モデル（ロジスティック・プロビット・ポアソン回帰）',
    summary: '「線形予測子＋リンク関数」という共通の枠組みで、2値・カウントなど正規でない応答を回帰する一般化線形モデルを俯瞰します。',
    body: `
<p>普通の回帰は応答が正規で $E[y]=X\\beta$。<strong>一般化線形モデル (GLM)</strong> は、これを次の3部品に一般化します。</p>
<ol>
<li><strong>確率分布</strong>（指数型分布族：正規・二項・ポアソン・ガンマ…）</li>
<li><strong>線形予測子</strong> $\\eta=X\\beta$</li>
<li><strong>リンク関数</strong> $g$：平均と線形予測子を結ぶ $g(\\mu)=\\eta$</li>
</ol>
<table class="simple">
<tr><th>応答の型</th><th>分布</th><th>リンク</th><th>モデル名</th></tr>
<tr><td>2値(0/1)</td><td>二項</td><td>ロジット $\\ln\\frac{\\mu}{1-\\mu}$</td><td>ロジスティック回帰</td></tr>
<tr><td>2値(0/1)</td><td>二項</td><td>プロビット $\\Phi^{-1}(\\mu)$</td><td>プロビット分析</td></tr>
<tr><td>カウント</td><td>ポアソン</td><td>対数 $\\ln\\mu$</td><td>ポアソン回帰</td></tr>
</table>
<p><strong>ロジットとプロビット</strong>はどちらもS字。ロジットは裾がやや厚く、係数の解釈がオッズ比になる利点があります。プロビットは正規分布の閾値モデルとして解釈しやすい。実データではほとんど同じ当てはまりになります。</p>
<p><strong>なぜリンク関数が要るか</strong>：平均 $\\mu$ には範囲の制約があります（確率なら $0<\\mu<1$、カウントの平均なら $\\mu>0$）。一方、線形予測子 $\\eta=X\\beta$ は $-\\infty$〜$+\\infty$ を動く。リンク関数はこの2つの世界の<strong>橋渡し</strong>です（例：ロジットは $(0,1)\\to(-\\infty,\\infty)$）。推定は<a href="#/prep1/mle">最尤法</a>（IRLSで数値計算）。GLMでは分散も分布から自動的に決まり（二項: $\\mu(1-\\mu)$、ポアソン: $\\mu$）、<strong>等分散を仮定しない</strong>のが普通の回帰との大きな違いです。あてはまりの尺度は残差二乗和の一般化である<strong>逸脱度</strong>（deviance）で、入れ子モデルの比較は逸脱度の差が近似的に $\\chi^2$ 分布に従うことを使います（尤度比検定）。</p>
<h3>前提条件と、崩れたときの影響</h3>
<table class="simple">
<tr><th>前提</th><th>崩れると起きること</th><th>対処・代替</th></tr>
<tr><td>分布の指定が正しい</td><td>ポアソンなのに $\\mathrm{Var}>\\mu$（<strong>過分散</strong>）だと、SEを過小評価し偽陽性が増える</td><td>負の二項回帰・準ポアソン（分散を別推定）</td></tr>
<tr><td>リンク上の線形性</td><td>$g(\\mu)$ と $x$ の関係が曲がっていると系統的にずれる</td><td>多項式項・スプライン・リンクの変更</td></tr>
<tr><td>観測の独立性</td><td>クラスター・反復測定でSEが過小評価</td><td>混合効果モデル（GLMM）・GEE</td></tr>
<tr><td>ゼロの出方がモデル通り</td><td>カウントに構造的なゼロが多い（ゼロ過剰）と当てはまらない</td><td>ゼロ過剰モデル（ZIP・ZINB）</td></tr>
</table>
<h3>有意性と実質的な意味</h3>
<p>GLMの係数の「効き目」は<strong>リンクの逆変換で読む</strong>のが鉄則です。ロジットなら $e^{\\beta}$ がオッズ比（<a href="#/prep1/logistic">ロジスティック回帰</a>）、対数リンクなら $e^{\\beta}$ が「$x$ が1増えると平均が $e^{\\beta}$ 倍」という<strong>率比</strong>。係数の符号と p 値だけ見て「正で有意」と言うのは、効果の大きさを何も語っていません。また過分散を無視した「有意」は見かけだけのことが多く、カウントデータではまず $\\mathrm{Var}$ と $\\mu$ の比（分散パラメータ）を確認してから係数を読みます。</p>
<div class="note">下でロジット曲線とプロビット曲線を重ね、傾き（効果の強さ）を動かしてください。2つはほぼ重なりますが、裾の立ち上がり方がわずかに違います。傾きを大きくすると「効き目のしきい値」がシャープになります。</div>`,
    demo: {
      note: 'ロジットとプロビットはほぼ重なる2本のS字。傾きβを上げると0→1の切り替わりが急になり「閾値的」に。線形回帰(灰直線)は0-1の外へ突き抜けてしまい2値応答に不向きなことも分かります。',
      controls: [
        { type: 'range', id: 'beta', label: '傾き β（効果の強さ）', min: 0.3, max: 4, step: 0.1, value: 1.5 },
        { type: 'range', id: 'x0', label: '中心 x₀', min: -2, max: 2, step: 0.1, value: 0 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const b = p.beta, x0 = p.x0;
        const xs = st.linspace(-5, 5, 240);
        const logit = x => 1 / (1 + Math.exp(-b * (x - x0)));
        const probit = x => st.normalCdf(b * (x - x0) * 1.7); // スケール合わせ
        const pl = Pl.make(canvas, { xmin: -5, xmax: 5, ymin: -0.15, ymax: 1.15 });
        pl.clear(); pl.axes({ xLabel: '説明変数 x', yLabel: 'P(y=1)' });
        pl.hline(0, { color: Pl.gray, dash: [2, 3] }); pl.hline(1, { color: Pl.gray, dash: [2, 3] });
        pl.line(xs.map(x => [x, 0.5 + 0.12 * b * (x - x0)]), { color: Pl.gray, width: 1.5, dash: [6, 4] });
        pl.line(xs.map(x => [x, logit(x)]), { color: Pl.colors[0], width: 2.5 });
        pl.line(xs.map(x => [x, probit(x)]), { color: Pl.colors[1], width: 2, dash: [4, 3] });
        pl.legend([{ label: 'ロジスティック', color: Pl.colors[0] }, { label: 'プロビット', color: Pl.colors[1] }, { label: '線形回帰（不適）', color: Pl.gray }]);
      },
    },
  });

  /* --- 生存時間解析 --- */
  T.push({
    section: 'prep1', group: '回帰分析', id: 'survival', title: '生存時間解析・比例ハザード・打ち切り',
    summary: '「イベントまでの時間」を、途中で観察が切れる（打ち切り）データも活かして扱う枠組みと、比例ハザードモデルの考え方を押さえます。',
    body: `
<p>故障・再発・離職などの「イベントまでの時間」を分析するのが<strong>生存時間解析</strong>です。特有の難しさが<strong>打ち切り (censoring)</strong>——観察終了までにイベントが起きていない人がいる（「少なくとも $t$ までは生存」という部分情報）。</p>
<h3>主要な関数</h3>
<ul>
<li><strong>生存関数</strong> $S(t)=P(T>t)$：時刻 $t$ まで生き残る確率。</li>
<li><strong>ハザード関数</strong> $h(t)=\\dfrac{f(t)}{S(t)}$：「今この瞬間に起こる」条件付きの起こりやすさ（瞬間死亡率）。</li>
</ul>
<p><strong>カプラン・マイヤー推定量</strong>は、打ち切りを考慮して $S(t)$ を階段状に推定します。<strong>コックスの比例ハザードモデル</strong>は</p>
<p>$$ h(t\\mid x)=h_0(t)\\,\\exp(\\beta_1 x_1+\\dots) $$</p>
<p>と、基準ハザード $h_0(t)$ の形を仮定せずに、共変量がハザードを何倍にするか（ハザード比 $e^\\beta$）だけを推定します（セミパラメトリック）。</p>
<div class="note">下はカプラン・マイヤー生存曲線。打ち切り（＋印）ではカーブは下がらず、イベント発生でのみ階段状に下がります。ハザードを上げると曲線が速く下降＝早くイベントが起きる集団になります。2群を比べるとハザード比の意味が見えます。</div>`,
    demo: {
      note: '＋印は打ち切り（イベント未発生で観察終了）。曲線はイベント時のみ段差で低下。群Bのハザードを上げると曲線が速く落ち、両群の隔たり＝ハザード比の効果が視覚化されます。',
      controls: [
        { type: 'range', id: 'hazB', label: '群Bのハザード倍率', min: 0.5, max: 4, step: 0.1, value: 2 },
        { type: 'range', id: 'cens', label: '打ち切りの割合', min: 0, max: 0.6, step: 0.05, value: 0.25 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        function km(seed, hazard, cens) {
          const rand = st.rng(seed);
          const n = 40, data = [];
          for (let i = 0; i < n; i++) {
            const t = -Math.log(1 - rand()) / hazard;   // イベント時刻 ~ Exp
            const c = -Math.log(1 - rand()) / (0.15 + cens * 0.5); // 打ち切り時刻
            const censored = c < t;
            data.push({ t: Math.min(t, c), ev: !censored });
          }
          data.sort((a, b) => a.t - b.t);
          const pts = [[0, 1]]; const censMarks = [];
          let surv = 1, atRisk = n;
          for (const d of data) {
            if (d.ev) { surv *= (atRisk - 1) / atRisk; pts.push([d.t, surv]); }
            else censMarks.push([d.t, surv]);
            atRisk--;
          }
          return { pts, censMarks };
        }
        const A = km(71 + (p.reseed | 0) * 7, 0.5, p.cens);
        const B = km(91 + (p.reseed | 0) * 7, 0.5 * p.hazB, p.cens);
        const pl = Pl.make(canvas, { xmin: 0, xmax: 6, ymin: 0, ymax: 1.05 });
        pl.clear(); pl.axes({ xLabel: '時間 t', yLabel: '生存確率 S(t)' });
        const stepLine = pts => { const out = []; for (let i = 0; i < pts.length; i++) { out.push(pts[i]); if (i + 1 < pts.length) out.push([pts[i + 1][0], pts[i][1]]); } return out; };
        pl.line(stepLine(A.pts), { color: Pl.colors[0], width: 2.5 });
        pl.line(stepLine(B.pts), { color: Pl.colors[1], width: 2.5 });
        A.censMarks.forEach(m => pl.text(m[0], m[1], '+', { align: 'center', baseline: 'middle', color: Pl.colors[0], size: 13 }));
        B.censMarks.forEach(m => pl.text(m[0], m[1], '+', { align: 'center', baseline: 'middle', color: Pl.colors[1], size: 13 }));
        pl.legend([{ label: '群A（基準）', color: Pl.colors[0] }, { label: '群B（ハザード×' + p.hazB.toFixed(1) + '）', color: Pl.colors[1] }]);
      },
    },
  });

  /* --- 自己相関・偏自己相関 --- */
  T.push({
    section: 'prep1', group: '時系列', id: 'acf-pacf', title: '自己相関・偏自己相関（コレログラム）',
    summary: '時系列が「何時点前まで自分と似ているか」を測る自己相関(ACF)と偏自己相関(PACF)を、AR過程を動かしながら読み解きます。',
    body: `
<p>時系列 $\\{y_t\\}$ の<strong>自己相関 (ACF)</strong> は、$k$ 時点離れた自分との相関です。</p>
<p>$$ \\rho_k=\\frac{\\mathrm{Cov}(y_t,y_{t-k})}{V[y_t]} $$</p>
<p><strong>偏自己相関 (PACF)</strong> は、間の時点の影響を除いた「$k$ 時点前との直接の相関」。ACF/PACF を棒グラフにした<strong>コレログラム</strong>で、モデルの次数を読みます。</p>
<table class="simple">
<tr><th></th><th>ACF</th><th>PACF</th></tr>
<tr><td>AR(p)</td><td>徐々に減衰</td><td>ラグ $p$ で切れる</td></tr>
<tr><td>MA(q)</td><td>ラグ $q$ で切れる</td><td>徐々に減衰</td></tr>
</table>
<div class="note">下は AR(1)：$y_t=\\phi\\,y_{t-1}+\\varepsilon_t$。係数 $\\phi$ を動かすと、ACF が $\\phi^k$ で幾何的に減衰します（$\\phi$ が1に近いほどゆっくり）。$\\phi<0$ では符号が交互に振れます。青帯は「相関ゼロ」とみなせる目安の範囲です。</div>`,
    demo: {
      note: 'AR(1)のACFは φ^k で減衰。φを1に近づけると系列が滑らかになりACFがゆっくり減る＝強い持続性。φを負にすると値がジグザグしACFも交互に符号を変えます。',
      controls: [
        { type: 'range', id: 'phi', label: 'AR係数 φ', min: -0.9, max: 0.95, step: 0.05, value: 0.7 },
        { type: 'button', id: 'reseed', label: '再生成' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(13 + (p.reseed | 0) * 23);
        const phi = p.phi, n = 240;
        const y = [0];
        for (let t = 1; t < n; t++) y.push(phi * y[t - 1] + st.randn(rand));
        // ACF
        const my = st.mean(y);
        let c0 = 0; for (const v of y) c0 += (v - my) ** 2; c0 /= n;
        const K = 20, acf = [];
        for (let k = 0; k <= K; k++) {
          let c = 0; for (let t = k; t < n; t++) c += (y[t] - my) * (y[t - k] - my);
          acf.push(c / n / c0);
        }
        const pl = Pl.make(canvas, { xmin: -0.5, xmax: K + 0.5, ymin: -1, ymax: 1 });
        pl.clear(); pl.axes({ xLabel: 'ラグ k', yLabel: '自己相関 ρ_k' });
        // 有意帯 ±1.96/√n
        const bound = 1.96 / Math.sqrt(n);
        pl.ctx.save();
        const yb1 = pl.Y(bound), yb2 = pl.Y(-bound);
        pl.ctx.fillStyle = 'rgba(79,109,245,0.10)';
        pl.ctx.fillRect(pl.pad.left, yb1, pl.W - pl.pad.left - pl.pad.right, yb2 - yb1);
        pl.ctx.restore();
        pl.hline(0, { color: Pl.gray, dash: [] });
        acf.forEach((r, k) => { pl.ctx.strokeStyle = Pl.colors[0]; pl.ctx.lineWidth = 3; pl.ctx.beginPath(); pl.ctx.moveTo(pl.X(k), pl.Y(0)); pl.ctx.lineTo(pl.X(k), pl.Y(r)); pl.ctx.stroke(); pl.scatter([[k, r]], { color: Pl.colors[0], r: 3 }); });
        // 理論値 φ^k
        pl.line(acf.map((r, k) => [k, Math.pow(phi, k)]), { color: Pl.colors[1], width: 1.5, dash: [4, 3] });
        pl.legend([{ label: '標本ACF', color: Pl.colors[0] }, { label: '理論 φ^k', color: Pl.colors[1] }]);
      },
    },
  });

  /* --- ARIMA・定常性・階差 --- */
  T.push({
    section: 'prep1', group: '時系列', id: 'arima', title: 'ARIMAモデル・定常性・階差',
    summary: 'トレンドを持つ非定常な系列を「階差」で定常化し、AR・MA・和分(I)を組み合わせるARIMAの発想を、系列の見た目で掴みます。',
    body: `
<p>時系列モデルの多くは<strong>定常性</strong>（平均・分散・自己相関構造が時間で変わらない）を前提にします。<strong>ARIMA(p,d,q)</strong> は3部品の組み合わせ。</p>
<ul>
<li><strong>AR(p) 自己回帰</strong>：過去の自分 $y_{t-1},\\dots$ の線形和。</li>
<li><strong>I(d) 和分</strong>：$d$ 回<strong>階差</strong> $\\nabla y_t=y_t-y_{t-1}$ をとって定常化する。トレンドや単位根の除去。</li>
<li><strong>MA(q) 移動平均</strong>：過去の誤差 $\\varepsilon_{t-1},\\dots$ の線形和。</li>
</ul>
<p>ランダムウォーク $y_t=y_{t-1}+\\varepsilon_t$ は非定常（単位根）ですが、1階差 $\\nabla y_t=\\varepsilon_t$ は定常（ホワイトノイズ）。この「差をとると定常になる」のが $I(1)$ です。定常性の検定には<strong>ADF検定（単位根検定）</strong>を使います。</p>
<div class="note">下で「ランダムウォーク（非定常）」を選ぶと、系列は行き当たりばったりに漂い平均が定まりません。「階差をとる」をオンにすると、水平に均された定常な系列（ホワイトノイズ）に変わります。定常AR(1)との違いも見比べてください。</div>`,
    demo: {
      note: 'ランダムウォークは平均が定まらず漂う＝非定常。「階差をとる」で水平のノイズ（定常）に一変。定常AR(1)は最初から一定水準の周りを揺れます。ARIMAのI(和分)の意味が見えます。',
      controls: [
        { type: 'select', id: 'kind', label: '系列', value: 'rw', options: [
          { value: 'rw', label: 'ランダムウォーク（非定常）' },
          { value: 'ar', label: '定常 AR(1) φ=0.6' },
          { value: 'trend', label: 'トレンド＋ノイズ' },
        ]},
        { type: 'select', id: 'diff', label: '変換', value: 'raw', options: [
          { value: 'raw', label: 'そのまま' },
          { value: 'diff', label: '階差をとる ∇yₜ' },
        ]},
        { type: 'button', id: 'reseed', label: '再生成' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(17 + (p.reseed | 0) * 37);
        const n = 200;
        let y = [0];
        for (let t = 1; t < n; t++) {
          if (p.kind === 'rw') y.push(y[t - 1] + st.randn(rand));
          else if (p.kind === 'ar') y.push(0.6 * y[t - 1] + st.randn(rand));
          else y.push(0.05 * t + st.randn(rand));
        }
        let series = y, label = '原系列';
        if (p.diff === 'diff') { series = []; for (let t = 1; t < n; t++) series.push(y[t] - y[t - 1]); label = '階差 ∇yₜ'; }
        const lo = Math.min.apply(null, series), hi = Math.max.apply(null, series);
        const pad = (hi - lo) * 0.1 + 0.5;
        const pl = Pl.make(canvas, { xmin: 0, xmax: series.length, ymin: lo - pad, ymax: hi + pad });
        pl.clear(); pl.axes({ xLabel: '時刻 t', yLabel: label });
        pl.hline(st.mean(series), { color: Pl.gray, dash: [5, 4], label: '平均' });
        pl.line(series.map((v, i) => [i, v]), { color: Pl.colors[0], width: 1.6 });
        const stationary = (p.diff === 'diff') || (p.kind === 'ar');
        pl.text(0, hi + pad, stationary ? '→ ほぼ定常（水平な帯）' : '→ 非定常（平均が漂う／トレンド）', { align: 'left', baseline: 'top', dx: 56, dy: 4, color: stationary ? '#2a9d8f' : '#e4572e', size: 12.5 });
      },
    },
  });

})();
