'use strict';
/* 数学の基礎 — 例題・まとめ・確認問題 */
(function () {
  const Q = (window.STATS_QUIZ = window.STATS_QUIZ || {});

  Q['math/vectors-matrices'] = {
    example: {
      title: '行列とベクトルの積',
      body: `
<p>3人の「数学・英語」の点数を行列 $X$、各科目の重み $\\boldsymbol{w}$ として、総合点を計算します。</p>
<div class="step">$$ X=\\begin{pmatrix}80&60\\\\50&90\\\\70&70\\end{pmatrix},\\quad \\boldsymbol{w}=\\begin{pmatrix}0.6\\\\0.4\\end{pmatrix} $$</div>
<div class="step">各行（各人）について「点数×重み」を足すのが行列×ベクトル：
$$ X\\boldsymbol{w}=\\begin{pmatrix}80\\cdot0.6+60\\cdot0.4\\\\50\\cdot0.6+90\\cdot0.4\\\\70\\cdot0.6+70\\cdot0.4\\end{pmatrix}=\\begin{pmatrix}72\\\\66\\\\70\\end{pmatrix} $$</div>
<p>結果は3人ぶんの総合点ベクトル。回帰の予測 $\\hat{\\boldsymbol y}=X\\boldsymbol\\beta$ もまったく同じ計算です。</p>`,
    },
    keypoints: [
      '<strong>1行＝1個体、1列＝1変数</strong>。データ表はそのまま行列 $X$（$n\\times p$）になる。',
      '行列 $A$ をかける操作は、平面（空間）を回転・拡大・せん断する<strong>変換</strong>と見なせる。',
      '<strong>行列式 $\\det$</strong> は面積・体積が何倍になるかを表す。$\\det=0$ は空間が低次元へつぶれ、情報が失われる（逆行列が作れない）合図。',
      '$m\\times k$ 行列と $k\\times n$ 行列は掛けられる（内側の $k$ が一致）。結果は $m\\times n$。',
    ],
    quiz: [
      {
        q: '$3\\times4$ 行列と $4\\times2$ 行列の積は、何行何列の行列になりますか。',
        choices: ['$3\\times2$', '$4\\times4$', '$3\\times4$', '掛けられない'],
        answer: 0,
        explain: '内側の次元（4と4）が一致するので掛けられ、結果は外側の $3\\times2$ になります。$(m\\times k)(k\\times n)=(m\\times n)$。',
      },
      {
        q: '$2\\times2$ 行列 $A$ の行列式が $\\det(A)=0$ のとき、正しいのは？',
        choices: [
          '$A$ は平面を1本の直線（以下）につぶす変換で、逆行列を持たない',
          '$A$ は必ず単位行列である',
          '$A$ をかけると面積が2倍になる',
          '$A$ は必ず回転を表す',
        ],
        answer: 0,
        explain: '$\\det=0$ は「面積が0倍」＝平面が線や点につぶれることを意味します。つぶれると元に戻せない（逆変換なし）ので逆行列は存在しません。多重共線性の数学的な正体でもあります。',
      },
    ],
  };

  Q['math/matrix-ops'] = {
    keypoints: [
      '連立一次方程式は $A\\boldsymbol{x}=\\boldsymbol{b}$ と1本にまとめられ、解は $\\boldsymbol{x}=A^{-1}\\boldsymbol{b}$。',
      '$2\\times2$ の逆行列は $A^{-1}=\\dfrac{1}{ad-bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}$。分母の $ad-bc$ が行列式。',
      '行列式が0に近い＝2直線がほぼ平行＝<strong>解が不安定</strong>。これが重回帰の<a href="#/prep1/multicollinearity">多重共線性</a>の本質。',
      '重回帰の係数 $\\hat{\\boldsymbol\\beta}=(X^\\top X)^{-1}X^\\top\\boldsymbol y$ も、この逆行列で一気に求まる。',
    ],
    quiz: [
      {
        q: '$A=\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$ の行列式は？',
        choices: ['$3$', '$5$', '$0$', '$4$'],
        answer: 0,
        explain: '$\\det=ad-bc=2\\cdot2-1\\cdot1=3$。0でないので逆行列が存在し、連立方程式は一意に解けます。',
      },
      {
        q: '重回帰で説明変数どうしが強く相関すると $X^\\top X$ の行列式はどうなり、何が起きますか。',
        choices: [
          '行列式が0に近づき、逆行列が不安定になって係数の推定が大きくばらつく',
          '行列式が大きくなり、推定が安定する',
          '行列式は変わらず、影響はない',
          '行列式が負になり、予測が反転する',
        ],
        answer: 0,
        explain: '相関が強いと列が「似た方向」になり $X^\\top X$ がつぶれ気味（行列式≈0）に。逆行列が爆発して係数分散が増大します。これが多重共線性です。',
      },
    ],
  };

  Q['math/eigen'] = {
    example: {
      title: '固有値を求める',
      body: `
<p>$A=\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$ の固有値を求めます。固有値 $\\lambda$ は $\\det(A-\\lambda I)=0$ の解。</p>
<div class="step">$$ \\det\\begin{pmatrix}2-\\lambda&1\\\\1&2-\\lambda\\end{pmatrix}=(2-\\lambda)^2-1=0 $$</div>
<div class="step">$(2-\\lambda)^2=1 \\Rightarrow 2-\\lambda=\\pm1 \\Rightarrow \\lambda=1,\\ 3$</div>
<p>固有ベクトルは $\\lambda=3$ で $(1,1)$ 方向、$\\lambda=1$ で $(1,-1)$ 方向（互いに直交）。対称行列の固有ベクトルは必ず直交します。</p>`,
    },
    keypoints: [
      '$A\\boldsymbol{v}=\\lambda\\boldsymbol{v}$：固有ベクトル $\\boldsymbol v$ は変換で<strong>向きが変わらず</strong>、長さだけ $\\lambda$ 倍になる特別な方向。',
      '固有値は $\\det(A-\\lambda I)=0$ を解いて求める。',
      '<strong>対称行列</strong>（共分散行列など）の固有ベクトルは互いに<strong>直交</strong>し、固有値は実数。',
      '共分散行列の固有ベクトル＝<a href="#/prep1/pca">主成分</a>の方向、固有値＝その方向の分散。PCAの心臓部。',
    ],
    quiz: [
      {
        q: '対称行列の固有ベクトルについて正しいものは？',
        choices: [
          '異なる固有値に属する固有ベクトルは互いに直交する',
          '必ずすべて平行になる',
          '固有値は必ず複素数になる',
          '固有ベクトルは常に1本しかない',
        ],
        answer: 0,
        explain: '対称行列（共分散行列はいつも対称）は直交する固有ベクトルの組を持ち、固有値はすべて実数です。これがPCAで直交する主成分が得られる理由です。',
      },
      {
        q: '共分散行列の「最大の固有値」に対応する固有ベクトルは、データの何を表しますか。',
        choices: [
          'データが最もばらつく方向（第1主成分）',
          'データの平均の位置',
          '最も情報が少ない方向',
          '外れ値の個数',
        ],
        answer: 0,
        explain: '固有値＝その方向の分散なので、最大固有値の固有ベクトルは「最も分散が大きい方向」＝第1主成分です。次元圧縮では、この方向を優先的に残します。',
      },
    ],
  };

  Q['math/covariance-matrix'] = {
    keypoints: [
      '分散共分散行列 $\\Sigma$ は、対角に各変数の分散、非対角に共分散を並べた<strong>対称行列</strong>。',
      '相関 $\\rho=\\sigma_{XY}/(\\sigma_X\\sigma_Y)$ は共分散を $-1\\sim1$ に標準化したもの。',
      '2次元正規分布の「丘」の形は $\\Sigma$ で決まり、その等高線が<a href="#/prep1/correlation">散布図の楕円</a>。',
      '$\\Sigma$ の固有ベクトルが尾根の向き（主成分方向）、固有値がその方向の分散。',
    ],
    quiz: [
      {
        q: '分散共分散行列が必ず対称（$\\sigma_{XY}=\\sigma_{YX}$）になるのはなぜですか。',
        choices: [
          '$\\mathrm{Cov}(X,Y)=\\mathrm{Cov}(Y,X)$ だから（掛ける順序によらない）',
          '分散が常に正だから',
          '相関が1以下だから',
          '偶然そうなることが多いだけ',
        ],
        answer: 0,
        explain: '共分散は $E[(X-\\mu_X)(Y-\\mu_Y)]$ で、$X$ と $Y$ の役割を入れ替えても同じ値です。よって $\\Sigma$ は常に対称になります。',
      },
      {
        q: '相関 $\\rho$ が $+1$ に近いとき、2次元正規分布の「丘」の形は？',
        choices: [
          '対角方向に細長くのびた尾根になる',
          '完全な円形になる',
          '平らになって消える',
          'X軸に平行な細い帯になる',
        ],
        answer: 0,
        explain: '$\\rho\\to1$ は「XとYが連動」を意味し、丘は対角線方向に細長い尾根になります。$\\rho=0$ なら円形（等方的）です。',
      },
    ],
  };

  Q['math/gradient'] = {
    keypoints: [
      '勾配 $\\nabla f$ は各変数の偏微分を並べたベクトルで、「最も急に増える向き」を指す。',
      '勾配の<strong>逆向き</strong>に少しずつ進むのが勾配降下法。誤差の谷（最小）を目指す。',
      '更新式 $\\boldsymbol{x}_{新}=\\boldsymbol{x}_{旧}-\\eta\\nabla f$。$\\eta$（学習率）は歩幅。',
      '$\\eta$ が小さすぎると遅く、大きすぎると谷を飛び越えて<strong>発散</strong>する。最小二乗・最尤・ニューラルネットの学習の共通原理。',
    ],
    quiz: [
      {
        q: '勾配降下法で学習率 $\\eta$ を大きくしすぎると、典型的に何が起きますか。',
        choices: [
          '谷を飛び越えて振動し、発散することがある',
          '必ず最速で最小値に到達する',
          '勾配が0になる',
          '関数が対称になる',
        ],
        answer: 0,
        explain: '歩幅が大きすぎると谷の反対側へ行き過ぎ、往復しながら発散します。小さすぎると収束が遅い。適切な $\\eta$ を選ぶのが実務の勘所です。',
      },
      {
        q: '勾配 $\\nabla f$ が指す向きは何ですか。',
        choices: [
          'その地点で関数が最も急に増加する向き',
          '関数が最も減少する向き',
          '常に原点を指す向き',
          '関数の値そのもの',
        ],
        answer: 0,
        explain: '勾配は「最も急に増える向き」。だから最小化ではその逆向き（最も急に減る向き）へ進みます。',
      },
    ],
  };

  Q['math/linearization'] = {
    keypoints: [
      '曲がった関係も、軸を対数などに取り替えると直線になることがある（線形化）。',
      '$y=Ae^{kx}$ は両辺の対数で $\\ln y=\\ln A+kx$：$\\ln y$ を $x$ に対して描けば直線。',
      '温度依存 $\\ln k=a+b/T$ は横軸を $1/T$ にとると直線。分析化学でおなじみ。',
      '線形化できれば傾き・切片を最小二乗で安定に推定でき、<a href="#/prep1/multiple-regression">重回帰</a>で多要因も扱える。',
    ],
    quiz: [
      {
        q: '$y=Ae^{kx}$ を直線にするには、どの軸をどう変換しますか。',
        choices: [
          '縦軸を $\\ln y$ にする（横軸は $x$ のまま）',
          '横軸を $\\ln x$ にする',
          '両軸とも $\\ln$ をとる',
          '変換の必要はない',
        ],
        answer: 0,
        explain: '$\\ln y=\\ln A+kx$ なので、$\\ln y$ 対 $x$ が直線（傾き $k$、切片 $\\ln A$）。これを片対数プロットと呼びます。',
      },
      {
        q: '反応速度の温度依存 $\\ln k=a+b/T$ を直線化するとき、横軸に取るべきは？',
        choices: ['$1/T$', '$T$', '$T^2$', '$\\ln T$'],
        answer: 0,
        explain: '$\\ln k$ を $1/T$ に対して描くと傾き $b$、切片 $a$ の直線になります（アレニウス／ファントホッフ・プロット）。',
      },
    ],
  };
})();
