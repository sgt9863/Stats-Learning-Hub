#!/usr/bin/env node
'use strict';
/*
 * 全トピックの構造・内部リンク・数式フェンスの整合性チェック（依存パッケージなし）。
 * 実行: node tools/verify-topics.js
 * ブラウザなしの環境（クラウドセッション等）で、深掘り編集後の検証に使う。
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

// index.html に登録されている順で topics/content を読み込む（登録漏れも検出できる）
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="((?:topics|content)\/[^"]+)"><\/script>/g)].map(m => m[1]);

const window = { STATS_TOPICS: [], STATS_QUIZ: {}, Stats: {}, Plot: {}, PlotlyTheme: {} };
let errors = 0;

for (const f of files) {
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  try {
    new Function('window', src)(window);
  } catch (e) {
    console.error(`✗ ${f}: 読み込みエラー: ${e.message}`);
    errors++;
  }
}

const topics = window.STATS_TOPICS;
const ids = new Set();

for (const t of topics) {
  const key = `${t.section}/${t.id}`;
  if (ids.has(key)) { console.error(`✗ 重複ID: ${key}`); errors++; }
  ids.add(key);
  for (const field of ['section', 'id', 'title', 'summary', 'body']) {
    if (!t[field]) { console.error(`✗ ${key}: ${field} が欠落`); errors++; }
  }
}

for (const t of topics) {
  const body = t.body || '';
  // 内部リンクの実在チェック
  for (const m of body.matchAll(/href="#\/([^"]+)"/g)) {
    if (m[1] && !ids.has(m[1])) { console.error(`✗ ${t.section}/${t.id}: デッドリンク #/${m[1]}`); errors++; }
  }
  // KaTeX ディスプレイ数式フェンスの偶数性
  const fences = (body.match(/\$\$/g) || []).length;
  if (fences % 2) { console.error(`✗ ${t.section}/${t.id}: $$ が奇数個（数式が閉じていない）`); errors++; }
}

// クイズ側のデッドリンク（"section/id" キーがトピックに存在するか）
for (const key of Object.keys(window.STATS_QUIZ)) {
  if (!ids.has(key)) { console.error(`✗ quiz: 対応トピックなし ${key}`); errors++; }
}

console.log(`topics: ${topics.length} / quiz付き: ${Object.keys(window.STATS_QUIZ).length}`);
if (errors) {
  console.error(`✗ ${errors} 件の問題`);
  process.exit(1);
}
console.log('✓ 構造・内部リンク・$$フェンス・quiz対応 すべてOK');
