#!/usr/bin/env node
'use strict';
/* 全トピックの「説明の厚み」を監査する。
 * 指標: 本文の実質文字数（タグ除去後）、h3見出し数、数式ブロック数、
 *       前提条件/直感/なぜ系の見出しの有無、例題・まとめ・クイズの有無。
 * 使い方: node tools/audit-depth.js [--json]
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const sandbox = { window: {}, console };
sandbox.window.STATS_TOPICS = [];
sandbox.window.STATS_QUIZ = {};
vm.createContext(sandbox);

const topicFiles = fs.readdirSync(path.join(ROOT, 'topics')).filter(f => f.endsWith('.js'));
for (const f of topicFiles) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'topics', f), 'utf8'), sandbox, { filename: f });
}
const quizFiles = fs.readdirSync(path.join(ROOT, 'content')).filter(f => f.endsWith('.js'));
for (const f of quizFiles) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'content', f), 'utf8'), sandbox, { filename: f });
}

const topics = sandbox.window.STATS_TOPICS;
const quiz = sandbox.window.STATS_QUIZ;

function strip(html) {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' [数式] ')
    .replace(/\$[^$]*\$/g, ' [式] ')
    .replace(/\s+/g, ' ')
    .trim();
}

const rows = topics.map(t => {
  const body = t.body || '';
  const plain = strip(body);
  const q = quiz[t.section + '/' + t.id] || {};
  const h3 = (body.match(/<h3/g) || []).length;
  const displayMath = (body.match(/\$\$/g) || []).length / 2;
  const hasAssumption = /前提|仮定|崩れ|破綻|限界|注意/.test(body);
  const hasIntuition = /直感|イメージ|つかむ|気持ち|なぜ/.test(body);
  const hasDemoNote = !!(t.demo && t.demo.note);
  return {
    key: t.section + '/' + t.id,
    title: t.title,
    chars: plain.length,
    h3,
    math: displayMath,
    assumption: hasAssumption,
    intuition: hasIntuition,
    demo: !!t.demo,
    demoNote: hasDemoNote,
    example: !!q.example,
    keypoints: (q.keypoints || []).length,
    quiz: (q.quiz || []).length,
  };
});

rows.sort((a, b) => a.chars - b.chars);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rows, null, 1));
} else {
  const med = rows[Math.floor(rows.length / 2)].chars;
  console.log('topics: ' + rows.length + ' / 本文実質文字数 中央値: ' + med);
  console.log('--- 薄い順（本文chars | h3 | 数式 | 前提 | 直感 | 例題 | KP | Q）---');
  for (const r of rows) {
    console.log(
      String(r.chars).padStart(5) + ' | h3:' + String(r.h3).padStart(2) +
      ' | $$:' + String(r.math).padStart(2) +
      ' | ' + (r.assumption ? '前提○' : '前提✗') +
      ' | ' + (r.intuition ? '直感○' : '直感✗') +
      ' | ' + (r.example ? '例題○' : '例題✗') +
      ' | KP:' + r.keypoints + ' Q:' + r.quiz +
      ' | ' + r.key + ' ' + r.title
    );
  }
}
