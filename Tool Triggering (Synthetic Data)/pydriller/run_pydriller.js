#!/usr/bin/env node
'use strict';
/**
 * PyDriller (git-history churn) -- Node implementation for JS corpus branches.
 * Mines this checkout's git log via git(1); no Python runtime required.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const MAX_COMMITS = 265;
const ROOT = path.dirname(path.dirname(path.dirname(__filename)));
const REPORTS = path.join(ROOT, 'reports');
const REPORT_PATH = path.join(REPORTS, 'pydriller.js');

function fail(status, lines) {
  console.log(`STATUS: ${status}`);
  for (const line of lines) console.log(line);
  process.exit(status === 'SKIPPED' ? 3 : status === 'NOT INSTALLED' ? 4 : 1);
}

if (!fs.existsSync(path.join(ROOT, '.git'))) {
  fail('NOT INSTALLED', [
    '  tool  : pydriller',
    `  reason: ${ROOT} is not a git repository, and this tool mines history.`,
  ]);
}

let historyTotal = 0;
try {
  historyTotal = parseInt(
    execFileSync('git', ['rev-list', '--count', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(),
    10
  );
} catch (exc) {
  fail('FAILED', ['  tool  : pydriller', `  error : ${exc.message}`]);
}

const churnByFile = {};
const authors = {};
let commits = 0;

try {
  const log = execFileSync(
    'git',
    [
      'log',
      '-n',
      String(MAX_COMMITS),
      '--pretty=format:%an%x1f',
      '--name-only',
      '--no-renames',
    ],
    { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
  );

  let afterHeader = false;
  for (const line of log.split(/\r?\n/)) {
    if (!line) {
      afterHeader = false;
      continue;
    }
    if (line.endsWith('\x1f')) {
      const author = line.slice(0, -1).trim() || 'unknown';
      authors[author] = (authors[author] || 0) + 1;
      commits += 1;
      afterHeader = true;
      continue;
    }
    if (afterHeader) {
      const filePath = line.trim();
      if (filePath) churnByFile[filePath] = (churnByFile[filePath] || 0) + 1;
    }
  }
} catch (exc) {
  fail('FAILED', ['  tool  : pydriller', `  error : ${exc.message}`]);
}

const topChurn = Object.entries(churnByFile)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([file, count]) => ({ file, count }));

const report = {
  tool: 'PyDriller',
  commits,
  commitLimit: MAX_COMMITS,
  historyTotal,
  historyCapped: historyTotal > MAX_COMMITS,
  authors,
  churnByFile,
  top_churn: topChurn,
};

fs.mkdirSync(REPORTS, { recursive: true });
fs.writeFileSync(
  REPORT_PATH,
  `'use strict';\nmodule.exports = ${JSON.stringify(report, null, 2)};\n`,
  'utf8'
);

console.log('STATUS: RAN');
console.log('  tool    : pydriller');
console.log(`  commits : ${commits} (limit ${MAX_COMMITS}, repo total ${historyTotal})`);
console.log(`  files   : ${Object.keys(churnByFile).length}`);
process.exit(0);
