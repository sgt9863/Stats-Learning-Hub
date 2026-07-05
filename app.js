'use strict';
/* =========================================================
 * Stats Learning Hub — コアランタイム
 * 方針: 状態は state に集約し、DOM への書き込みは render() に集約する。
 * 例外: デモ操作（スライダー等）は canvas の再描画と値バッジの更新のみ行う
 *       （render() を呼び直すと入力のフォーカスが外れるため）。
 * ========================================================= */

/* ---------- 統計・数値ユーティリティ（トピックのデモから利用する） ----------
 * const はグローバル(window)に載らないため、トピックスクリプトから
 * window.Stats / window.Plot として参照できるよう明示的に公開する。 */
const Stats = window.Stats = {
  // 再現可能な擬似乱数（mulberry32）。seed を変えると別の乱数列になる。
  rng(seed) {
    let t = (seed >>> 0) || 1;
    return function () {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  },
  // 標準正規乱数（Box-Muller 法）。rand は rng() が返す関数。
  randn(rand) {
    let u = 0, v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  },
  linspace(a, b, n) {
    const o = [];
    for (let i = 0; i < n; i++) o.push(a + ((b - a) * i) / (n - 1));
    return o;
  },
  sum(xs) { return xs.reduce((s, x) => s + x, 0); },
  mean(xs) { return Stats.sum(xs) / xs.length; },
  sd(xs) {
    const m = Stats.mean(xs);
    return Math.sqrt(xs.reduce((s, x) => s + (x - m) * (x - m), 0) / (xs.length - 1));
  },
  cov(xs, ys) {
    const mx = Stats.mean(xs), my = Stats.mean(ys);
    let s = 0;
    for (let i = 0; i < xs.length; i++) s += (xs[i] - mx) * (ys[i] - my);
    return s / (xs.length - 1);
  },
  corr(xs, ys) { return Stats.cov(xs, ys) / (Stats.sd(xs) * Stats.sd(ys)); },
  histogram(values, nbins, min, max) {
    const lo = (min !== undefined) ? min : Math.min.apply(null, values);
    const hi = (max !== undefined) ? max : Math.max.apply(null, values);
    const w = (hi - lo) / nbins || 1;
    const bins = [];
    for (let i = 0; i < nbins; i++) bins.push({ x0: lo + i * w, x1: lo + (i + 1) * w, count: 0, density: 0 });
    for (const v of values) {
      let k = Math.floor((v - lo) / w);
      if (k < 0) k = 0;
      if (k >= nbins) k = nbins - 1;
      bins[k].count++;
    }
    for (const b of bins) b.density = b.count / (values.length * w);
    return bins;
  },
  // 対数ガンマ関数（Lanczos 近似）
  lgamma(x) {
    const g = [676.5203681218851, -1259.1392167224028, 771.32342877765313,
      -176.61502916214059, 12.507343278686905, -0.13857109526572012,
      9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - Stats.lgamma(1 - x);
    x -= 1;
    let a = 0.99999999999980993;
    const t = x + 7.5;
    for (let i = 0; i < 8; i++) a += g[i] / (x + i + 1);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  },
  // 正則化下側不完全ガンマ P(a, x)
  gammainc(x, a) {
    if (x <= 0) return 0;
    if (x < a + 1) {
      let term = 1 / a, sum = term;
      for (let n = 1; n < 400; n++) {
        term *= x / (a + n);
        sum += term;
        if (Math.abs(term) < Math.abs(sum) * 1e-13) break;
      }
      return sum * Math.exp(-x + a * Math.log(x) - Stats.lgamma(a));
    }
    let b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
    for (let i = 1; i < 400; i++) {
      const an = -i * (i - a);
      b += 2;
      d = an * d + b;
      if (Math.abs(d) < 1e-300) d = 1e-300;
      c = b + an / c;
      if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 1e-13) break;
    }
    return 1 - Math.exp(-x + a * Math.log(x) - Stats.lgamma(a)) * h;
  },
  // 正則化不完全ベータ I_x(a, b)
  betainc(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const bt = Math.exp(Stats.lgamma(a + b) - Stats.lgamma(a) - Stats.lgamma(b) +
      a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) return bt * Stats._betacf(x, a, b) / a;
    return 1 - bt * Stats._betacf(1 - x, b, a) / b;
  },
  _betacf(x, a, b) {
    const qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= 300; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < 1e-300) d = 1e-300;
      c = 1 + aa / c;
      if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d;
      h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < 1e-300) d = 1e-300;
      c = 1 + aa / c;
      if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 1e-13) break;
    }
    return h;
  },
  erf(x) {
    const s = x < 0 ? -1 : 1;
    return s * Stats.gammainc(x * x, 0.5);
  },
  normalPdf(x, mu, sd) {
    mu = mu || 0; sd = (sd === undefined) ? 1 : sd;
    const z = (x - mu) / sd;
    return Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI));
  },
  normalCdf(x, mu, sd) {
    mu = mu || 0; sd = (sd === undefined) ? 1 : sd;
    return 0.5 * (1 + Stats.erf((x - mu) / (sd * Math.SQRT2)));
  },
  // 標準正規分布の分位点（二分法。十分高速）
  normalInv(p, mu, sd) {
    mu = mu || 0; sd = (sd === undefined) ? 1 : sd;
    let lo = -12, hi = 12;
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2;
      if (Stats.normalCdf(mid) < p) lo = mid; else hi = mid;
    }
    return mu + sd * (lo + hi) / 2;
  },
  tPdf(x, df) {
    return Math.exp(Stats.lgamma((df + 1) / 2) - Stats.lgamma(df / 2)) /
      Math.sqrt(df * Math.PI) * Math.pow(1 + x * x / df, -(df + 1) / 2);
  },
  tCdf(x, df) {
    const p = 0.5 * Stats.betainc(df / (df + x * x), df / 2, 0.5);
    return x >= 0 ? 1 - p : p;
  },
  chi2Pdf(x, k) {
    if (x <= 0) return 0;
    return Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - Stats.lgamma(k / 2) - (k / 2) * Math.LN2);
  },
  chi2Cdf(x, k) {
    if (x <= 0) return 0;
    return Stats.gammainc(x / 2, k / 2);
  },
  fPdf(x, d1, d2) {
    if (x <= 0) return 0;
    const lnum = (d1 / 2) * Math.log(d1 / d2) + (d1 / 2 - 1) * Math.log(x) -
      ((d1 + d2) / 2) * Math.log(1 + (d1 / d2) * x);
    const lbeta = Stats.lgamma(d1 / 2) + Stats.lgamma(d2 / 2) - Stats.lgamma((d1 + d2) / 2);
    return Math.exp(lnum - lbeta);
  },
  fCdf(x, d1, d2) {
    if (x <= 0) return 0;
    return Stats.betainc(d1 * x / (d1 * x + d2), d1 / 2, d2 / 2);
  },
  betaPdf(x, a, b) {
    if (x <= 0 || x >= 1) return 0;
    const lbeta = Stats.lgamma(a) + Stats.lgamma(b) - Stats.lgamma(a + b);
    return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - lbeta);
  },
  binomPmf(k, n, p) {
    if (k < 0 || k > n) return 0;
    const lc = Stats.lgamma(n + 1) - Stats.lgamma(k + 1) - Stats.lgamma(n - k + 1);
    const lp = k === 0 ? 0 : k * Math.log(p);
    const lq = (n - k) === 0 ? 0 : (n - k) * Math.log(1 - p);
    return Math.exp(lc + lp + lq);
  },
  poissonPmf(k, lam) {
    if (k < 0) return 0;
    return Math.exp(k * Math.log(lam) - lam - Stats.lgamma(k + 1));
  },
};

/* ---------- Canvas 描画ヘルパー ---------- */
const Plot = window.Plot = {
  colors: ['#4f6df5', '#e4572e', '#2a9d8f', '#f4a261', '#9b5de5', '#577590'],
  gray: '#98a2b3',
  ink: '#1d2433',
  niceTicks(min, max, n) {
    n = n || 6;
    const span = max - min;
    if (!(span > 0)) return [min];
    const raw = span / n;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = (norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10) * mag;
    const ticks = [];
    for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) {
      ticks.push(Math.abs(v) < step * 1e-9 ? 0 : v);
    }
    return ticks;
  },
  fmtTick(v) {
    const a = Math.abs(v);
    if (a === 0) return '0';
    if (a >= 10000) return v.toExponential(1);
    if (a >= 100) return String(Math.round(v * 10) / 10);
    if (Number.isInteger(Math.round(v * 1e9) / 1e9)) return String(Math.round(v));
    if (a >= 1) return String(Math.round(v * 100) / 100);
    return v.toPrecision(2);
  },
  /**
   * プロット領域を作る。呼ぶたびに canvas をリサイズ＆クリアする。
   * opts: { xmin, xmax, ymin, ymax, pad? }
   */
  make(canvas, opts) {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth || canvas.width;
    const H = canvas.clientHeight || canvas.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pad = Object.assign({ left: 56, right: 18, top: 18, bottom: 42 }, opts.pad || {});
    const xmin = opts.xmin, xmax = opts.xmax, ymin = opts.ymin, ymax = opts.ymax;
    const iw = W - pad.left - pad.right;
    const ih = H - pad.top - pad.bottom;
    const X = v => pad.left + ((v - xmin) / (xmax - xmin)) * iw;
    const Y = v => pad.top + ih - ((v - ymin) / (ymax - ymin)) * ih;
    const clipData = fn => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(pad.left, pad.top, iw, ih);
      ctx.clip();
      fn();
      ctx.restore();
    };
    const FONT = '11.5px "Hiragino Sans", "Yu Gothic UI", sans-serif';
    return {
      ctx, W, H, X, Y, xmin, xmax, ymin, ymax, pad,
      clear() { ctx.clearRect(0, 0, W, H); },
      axes(o) {
        o = o || {};
        const xt = o.xTicks || Plot.niceTicks(xmin, xmax);
        const yt = o.yTicks || Plot.niceTicks(ymin, ymax);
        ctx.font = FONT;
        ctx.strokeStyle = '#edf0f5';
        ctx.lineWidth = 1;
        for (const t of xt) { ctx.beginPath(); ctx.moveTo(X(t), pad.top); ctx.lineTo(X(t), pad.top + ih); ctx.stroke(); }
        for (const t of yt) { ctx.beginPath(); ctx.moveTo(pad.left, Y(t)); ctx.lineTo(pad.left + iw, Y(t)); ctx.stroke(); }
        ctx.strokeStyle = '#c7cdd8';
        ctx.beginPath();
        ctx.moveTo(pad.left, pad.top);
        ctx.lineTo(pad.left, pad.top + ih);
        ctx.lineTo(pad.left + iw, pad.top + ih);
        ctx.stroke();
        ctx.fillStyle = '#66708a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (const t of xt) ctx.fillText((o.xFmt || Plot.fmtTick)(t), X(t), pad.top + ih + 6);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (const t of yt) ctx.fillText((o.yFmt || Plot.fmtTick)(t), pad.left - 7, Y(t));
        ctx.fillStyle = '#475467';
        if (o.xLabel) {
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          ctx.fillText(o.xLabel, pad.left + iw, H - 3);
        }
        if (o.yLabel) {
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(o.yLabel, 4, 2);
        }
      },
      line(pts, o) {
        o = o || {};
        clipData(() => {
          ctx.strokeStyle = o.color || Plot.colors[0];
          ctx.lineWidth = o.width || 2;
          ctx.setLineDash(o.dash || []);
          ctx.globalAlpha = (o.alpha != null) ? o.alpha : 1;
          ctx.beginPath();
          let started = false;
          for (const q of pts) {
            if (!isFinite(q[0]) || !isFinite(q[1])) { started = false; continue; }
            if (!started) { ctx.moveTo(X(q[0]), Y(q[1])); started = true; }
            else ctx.lineTo(X(q[0]), Y(q[1]));
          }
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
        });
      },
      fillUnder(pts, o) {
        o = o || {};
        clipData(() => {
          const base = Y((o.baseline != null) ? o.baseline : 0);
          ctx.fillStyle = o.color || Plot.colors[0];
          ctx.globalAlpha = (o.alpha != null) ? o.alpha : 0.15;
          ctx.beginPath();
          ctx.moveTo(X(pts[0][0]), base);
          for (const q of pts) ctx.lineTo(X(q[0]), Y(q[1]));
          ctx.lineTo(X(pts[pts.length - 1][0]), base);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;
        });
      },
      scatter(pts, o) {
        o = o || {};
        clipData(() => {
          ctx.fillStyle = o.color || Plot.colors[0];
          ctx.globalAlpha = (o.alpha != null) ? o.alpha : 0.85;
          const r = o.r || 3.5;
          for (const q of pts) {
            ctx.beginPath();
            ctx.arc(X(q[0]), Y(q[1]), r, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        });
      },
      bars(items, o) {
        o = o || {};
        clipData(() => {
          ctx.fillStyle = o.color || Plot.colors[0];
          ctx.globalAlpha = (o.alpha != null) ? o.alpha : 0.75;
          for (const b of items) {
            const x0 = X(b.x0), x1 = X(b.x1), y = Y(b.y), y0 = Y(0);
            ctx.fillRect(x0, Math.min(y, y0), Math.max(1, x1 - x0 - 1), Math.abs(y0 - y));
          }
          ctx.globalAlpha = 1;
        });
      },
      vline(x, o) {
        o = o || {};
        clipData(() => {
          ctx.strokeStyle = o.color || Plot.gray;
          ctx.lineWidth = o.width || 1.5;
          ctx.setLineDash(o.dash || [5, 4]);
          ctx.beginPath();
          ctx.moveTo(X(x), pad.top);
          ctx.lineTo(X(x), pad.top + ih);
          ctx.stroke();
          ctx.setLineDash([]);
        });
        if (o.label) {
          ctx.fillStyle = o.color || Plot.gray;
          ctx.font = FONT;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(o.label, X(x) + 5, pad.top + 3);
        }
      },
      hline(y, o) {
        o = o || {};
        clipData(() => {
          ctx.strokeStyle = o.color || Plot.gray;
          ctx.lineWidth = o.width || 1.5;
          ctx.setLineDash(o.dash || [5, 4]);
          ctx.beginPath();
          ctx.moveTo(pad.left, Y(y));
          ctx.lineTo(pad.left + iw, Y(y));
          ctx.stroke();
          ctx.setLineDash([]);
        });
        if (o.label) {
          ctx.fillStyle = o.color || Plot.gray;
          ctx.font = FONT;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          ctx.fillText(o.label, pad.left + iw - 5, Y(y) - 3);
        }
      },
      polygon(pts, o) {
        o = o || {};
        clipData(() => {
          ctx.beginPath();
          pts.forEach((q, i) => {
            if (i === 0) ctx.moveTo(X(q[0]), Y(q[1]));
            else ctx.lineTo(X(q[0]), Y(q[1]));
          });
          ctx.closePath();
          if (o.fill) {
            ctx.globalAlpha = (o.alpha != null) ? o.alpha : 0.2;
            ctx.fillStyle = o.fill;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          if (o.stroke) {
            ctx.strokeStyle = o.stroke;
            ctx.lineWidth = o.width || 1.5;
            ctx.stroke();
          }
        });
      },
      arrow(x1, y1, x2, y2, o) {
        o = o || {};
        const c = o.color || Plot.colors[1];
        const ax = X(x1), ay = Y(y1), bx = X(x2), by = Y(y2);
        const ang = Math.atan2(by - ay, bx - ax);
        ctx.strokeStyle = c;
        ctx.fillStyle = c;
        ctx.lineWidth = o.width || 2;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
        const hs = 8;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx - hs * Math.cos(ang - 0.45), by - hs * Math.sin(ang - 0.45));
        ctx.lineTo(bx - hs * Math.cos(ang + 0.45), by - hs * Math.sin(ang + 0.45));
        ctx.closePath();
        ctx.fill();
      },
      text(x, y, str, o) {
        o = o || {};
        ctx.fillStyle = o.color || Plot.ink;
        ctx.font = (o.size || 12) + 'px "Hiragino Sans", "Yu Gothic UI", sans-serif';
        ctx.textAlign = o.align || 'left';
        ctx.textBaseline = o.baseline || 'alphabetic';
        ctx.fillText(str, X(x) + (o.dx || 0), Y(y) + (o.dy || 0));
      },
      legend(items) {
        ctx.font = '12px "Hiragino Sans", "Yu Gothic UI", sans-serif';
        let w = 0;
        for (const it of items) w = Math.max(w, ctx.measureText(it.label).width);
        const bw = w + 36, lh = 19, bh = items.length * lh + 10;
        const bx = pad.left + iw - bw - 8, by = pad.top + 8;
        ctx.fillStyle = 'rgba(255,255,255,0.93)';
        ctx.strokeStyle = '#dfe3ea';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(bx, by, bw, bh);
        ctx.fill();
        ctx.stroke();
        items.forEach((it, i) => {
          const cy = by + 5 + i * lh + lh / 2 - 2;
          ctx.strokeStyle = it.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(bx + 8, cy);
          ctx.lineTo(bx + 24, cy);
          ctx.stroke();
          ctx.fillStyle = '#344054';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(it.label, bx + 30, cy);
        });
      },
    };
  },
};

/* ---------- セクション定義 ---------- */
const SECTIONS = [
  {
    id: 'prep1', icon: '📘', title: '準1級 統計理論',
    desc: '確率分布・推定・検定・ベイズなど、2級から準1級への橋渡しとなる核心理論。',
  },
  {
    id: 'doe', icon: '🧪', title: '実験計画法',
    desc: 'フィッシャーの3原則から分散分析・直交表・応答曲面まで、少ない実験で最大の情報を得る方法論。',
  },
  {
    id: 'ml', icon: '🤖', title: '機械学習',
    desc: '回帰・分類・クラスタリングの基礎と、過学習・交差検証という実務の要点。',
  },
  {
    id: 'mva', icon: '📊', title: '多変量解析',
    desc: '主成分分析・因子分析・判別分析など、多変数データの構造を見抜く手法群。',
  },
];

window.STATS_TOPICS = window.STATS_TOPICS || [];

/* ---------- 状態管理 ---------- */
const state = { route: { page: 'home' } };
const demoState = { topic: null, params: {} };

function topicsBySection(id) { return window.STATS_TOPICS.filter(t => t.section === id); }
function findTopic(sec, id) { return window.STATS_TOPICS.find(t => t.section === sec && t.id === id) || null; }
function allTopicsOrdered() {
  const out = [];
  for (const s of SECTIONS) out.push.apply(out, topicsBySection(s.id));
  return out;
}

function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  if (!h) return { page: 'home' };
  const parts = h.split('/');
  const sec = parts[0], top = parts[1];
  if (findTopic(sec, top)) return { page: 'topic', section: sec, topic: top };
  if (SECTIONS.some(s => s.id === sec)) {
    const list = topicsBySection(sec);
    if (list.length) return { page: 'topic', section: sec, topic: list[0].id };
  }
  return { page: 'home' };
}

/* ---------- 描画（DOM 書き込みはここに集約） ---------- */
function render() {
  renderNav();
  const main = document.getElementById('main');
  if (state.route.page === 'home') {
    main.innerHTML = homeHtml();
  } else {
    const t = findTopic(state.route.section, state.route.topic);
    main.innerHTML = topicHtml(t);
    buildDemo(t); // デモ入力部品の生成（render の一部として、トピック表示時に一度だけ）
  }
  if (window.renderMathInElement) {
    window.renderMathInElement(main, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
      ],
      throwOnError: false,
    });
  }
  window.scrollTo(0, 0);
}

function renderNav() {
  const nav = document.getElementById('sidebar');
  let html = '<a class="nav-home' + (state.route.page === 'home' ? ' active' : '') + '" href="#/">🏠 ホーム</a>';
  for (const s of SECTIONS) {
    const list = topicsBySection(s.id);
    const open = state.route.section === s.id || state.route.page === 'home';
    html += '<details' + (open ? ' open' : '') + '><summary>' + s.icon + ' ' + s.title +
      ' <span class="count">(' + list.length + ')</span></summary>';
    for (const t of list) {
      const active = state.route.page === 'topic' && state.route.section === s.id && state.route.topic === t.id;
      html += '<a class="nav-link' + (active ? ' active' : '') + '" href="#/' + s.id + '/' + t.id + '">' + t.title + '</a>';
    }
    html += '</details>';
  }
  nav.innerHTML = html;
}

function homeHtml() {
  const cards = SECTIONS.map(s => {
    const list = topicsBySection(s.id);
    const first = list[0];
    return '<a class="card" href="' + (first ? '#/' + s.id + '/' + first.id : '#/') + '">' +
      '<div class="card-icon">' + s.icon + '</div>' +
      '<h3>' + s.title + '</h3>' +
      '<p>' + s.desc + '</p>' +
      '<span class="card-count">' + list.length + ' トピック</span></a>';
  }).join('');
  return '<div class="home">' +
    '<section class="hero">' +
    '<h1>統計学習ハブ <span class="en">Stats Learning Hub</span></h1>' +
    '<p>統計検定<strong>2級</strong>の知識を土台に、<strong>準1級レベルの統計理論・実験計画法・機械学習・多変量解析</strong>を「動かして」学ぶための教材です。すべてのトピックに、パラメータを操作できるインタラクティブなグラフが付いています。</p>' +
    '<ul class="hero-points">' +
    '<li>📈 全トピックに触って動かせるグラフ</li>' +
    '<li>🧭 2級 → 準1級のギャップを埋める構成</li>' +
    '<li>🔬 スライダーで「式の意味」を体感</li>' +
    '</ul></section>' +
    '<section class="cards">' + cards + '</section>' +
    '<section class="howto"><h2>📖 学び方のヒント</h2><ol>' +
    '<li>各トピックはまず本文を読み、そのあと「インタラクティブ実験」でパラメータを動かして直感をつくります。</li>' +
    '<li>順番に迷ったら「準1級 統計理論 → 実験計画法 → 多変量解析 → 機械学習」の順がおすすめです。</li>' +
    '<li>数式は暗記するより、「パラメータを動かしたときのグラフの変化」とセットで覚えると定着します。</li>' +
    '</ol></section></div>';
}

function topicHtml(t) {
  const sec = SECTIONS.find(s => s.id === t.section);
  const flat = allTopicsOrdered();
  const i = flat.indexOf(t);
  const prev = i > 0 ? flat[i - 1] : null;
  const next = i < flat.length - 1 ? flat[i + 1] : null;
  let html = '<article class="topic">' +
    '<p class="crumbs"><a href="#/">ホーム</a> › ' + sec.icon + ' ' + sec.title + '</p>' +
    '<h1>' + t.title + '</h1>' +
    '<p class="lead">' + t.summary + '</p>' +
    '<div class="body">' + t.body + '</div>';
  if (t.demo) {
    html += '<section class="demo"><h2>🔬 インタラクティブ実験</h2>' +
      '<div class="controls" id="demo-controls"></div>' +
      '<div class="canvas-wrap"><canvas id="demo-canvas" class="demo-canvas"></canvas></div>' +
      (t.demo.note ? '<p class="demo-note">' + t.demo.note + '</p>' : '') +
      '</section>';
  }
  html += '<nav class="pager">' +
    (prev ? '<a class="pg prev" href="#/' + prev.section + '/' + prev.id + '">← ' + prev.title + '</a>' : '<span></span>') +
    (next ? '<a class="pg next" href="#/' + next.section + '/' + next.id + '">' + next.title + ' →</a>' : '<span></span>') +
    '</nav></article>';
  return html;
}

/* ---------- デモ制御 ----------
 * 入力部品はトピック表示時に一度だけ生成する。
 * 操作時は canvas の再描画と値バッジの更新のみを行い、render() は呼ばない
 * （フォーカス維持のための意図的な例外）。 */
function fmtCtl(v, step) {
  const dec = (step && step < 1) ? (String(step).split('.')[1] || '').length : 0;
  return Number(v).toFixed(dec);
}

function buildDemo(topic) {
  demoState.topic = topic;
  demoState.params = {};
  if (!topic || !topic.demo) return;
  const box = document.getElementById('demo-controls');
  const controls = topic.demo.controls || [];
  for (const c of controls) {
    if (c.type === 'select') demoState.params[c.id] = String(c.value != null ? c.value : c.options[0].value);
    else if (c.type === 'button') demoState.params[c.id] = 0;
    else demoState.params[c.id] = c.value;
  }
  for (const c of controls) {
    const wrap = document.createElement('div');
    wrap.className = 'ctl';
    if (c.type === 'range') {
      const lab = document.createElement('label');
      lab.textContent = c.label;
      const input = document.createElement('input');
      input.type = 'range';
      input.min = c.min;
      input.max = c.max;
      input.step = c.step || 1;
      input.value = c.value;
      const val = document.createElement('span');
      val.className = 'ctl-value';
      val.textContent = fmtCtl(c.value, c.step);
      input.addEventListener('input', () => {
        demoState.params[c.id] = parseFloat(input.value);
        val.textContent = fmtCtl(parseFloat(input.value), c.step);
        drawDemo();
      });
      wrap.append(lab, input, val);
    } else if (c.type === 'select') {
      const lab = document.createElement('label');
      lab.textContent = c.label;
      const sel = document.createElement('select');
      for (const o of c.options) {
        const op = document.createElement('option');
        op.value = String(o.value);
        op.textContent = o.label;
        sel.append(op);
      }
      sel.value = demoState.params[c.id];
      sel.addEventListener('change', () => {
        demoState.params[c.id] = sel.value;
        drawDemo();
      });
      wrap.append(lab, sel);
    } else if (c.type === 'button') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn';
      btn.textContent = c.label;
      btn.addEventListener('click', () => {
        demoState.params[c.id]++;
        drawDemo();
      });
      wrap.append(btn);
    }
    box.append(wrap);
  }
  // 初回描画。canvas.clientWidth の読み取りが同期リフローを促すため、
  // innerHTML 直後でも実寸が得られる（rAF はタブ非表示時に発火しないため使わない）。
  drawDemo();
}

function drawDemo() {
  const t = demoState.topic;
  if (!t || !t.demo) return;
  const canvas = document.getElementById('demo-canvas');
  if (!canvas) return;
  try {
    t.demo.draw(canvas, Object.assign({}, demoState.params));
  } catch (err) {
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#b42318';
    ctx.fillText('デモの描画でエラーが発生しました: ' + err.message, 12, 26);
    console.error('[demo:' + t.id + ']', err);
  }
}

/* ---------- 起動 ---------- */
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(drawDemo, 150);
});
window.addEventListener('hashchange', () => {
  state.route = parseHash();
  render();
});
window.addEventListener('DOMContentLoaded', () => {
  state.route = parseHash();
  render();
});
