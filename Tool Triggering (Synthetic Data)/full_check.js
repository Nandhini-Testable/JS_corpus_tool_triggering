#!/usr/bin/env node
'use strict';
/**
 * Cross-file consistency audit for this branch. Every rule here reads its
 * expected value from the repository itself (.nvmrc, dataset.json, the
 * Tool Triggering (Synthetic Data) tree) -- never a hardcoded literal. Ported from the sibling
 * Python corpus's tools/full_check.py, whose own comment records why:
 * a full_check that once asserted a version literal produced a spurious
 * FAIL on every later family once that literal went stale.
 *
 * Exit 0 = clean, 1 = at least one FAIL.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.dirname(__dirname);
const PROBLEMS = [];
let checks = 0;

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }
function fail(msg) { PROBLEMS.push(msg); }
function check() { checks += 1; }

const NODE_FAMILY = read('.nvmrc').trim();
const DATA = JSON.parse(read('dataset.json'));
const PKG = JSON.parse(read('package.json'));

check();
if (String(DATA.nodeFamily) !== NODE_FAMILY) {
  fail(`dataset.json nodeFamily ${JSON.stringify(DATA.nodeFamily)} disagrees with .nvmrc ${JSON.stringify(NODE_FAMILY)}`);
}

check();
const enginesNode = (PKG.engines && PKG.engines.node) || '';
if (!enginesNode.includes(NODE_FAMILY)) {
  fail(`package.json engines.node ${JSON.stringify(enginesNode)} does not mention the .nvmrc family ${NODE_FAMILY}`);
}

check();
const FOLDER = path.basename(__dirname);
const toolsDir = __dirname;
const presentToolDirs = fs.existsSync(toolsDir)
  ? fs.readdirSync(toolsDir).filter((n) => fs.statSync(path.join(toolsDir, n)).isDirectory() && !n.startsWith('_'))
  : [];
const datasetToolDirs = (DATA.toolsActiveDetail || []).map((t) => t.dir);
for (const extra of presentToolDirs.filter((d) => !datasetToolDirs.includes(d)).sort()) {
  fail(`${FOLDER}/${extra} exists on disk but has no entry in dataset.json's toolsActiveDetail`);
}
for (const missing of datasetToolDirs.filter((d) => !presentToolDirs.includes(d)).sort()) {
  fail(`dataset.json's toolsActiveDetail references ${FOLDER}/${missing}, which does not exist on disk`);
}

check();
if (typeof DATA.toolsWired === 'number' && DATA.toolsWired !== presentToolDirs.length) {
  fail(`dataset.json toolsWired=${DATA.toolsWired} disagrees with the actual ${FOLDER}/ directory count (${presentToolDirs.length})`);
}

check();
if (exists('src') === exists('packages')) {
  fail('exactly one of src/ or packages/ should exist for this architecture, found ' +
       (exists('src') && exists('packages') ? 'both' : 'neither'));
}

check();
for (const t of DATA.toolsActiveDetail || []) {
  const entrypoint = path.join(toolsDir, t.dir, t.dir === 'pydriller' ? 'run_pydriller.js' : `run_${t.dir.replace(/-/g, '_')}.sh`);
  if (!fs.existsSync(entrypoint)) {
    fail(`dataset.json declares ${FOLDER}/${t.dir} but its entrypoint is missing: ${path.relative(ROOT, entrypoint)}`);
  }
}

if (PROBLEMS.length) {
  console.log(`FAIL  ${PROBLEMS.length} problem(s) out of ${checks} checks:`);
  for (const p of PROBLEMS) console.log('  - ' + p);
  process.exit(1);
}
console.log(`OK    ${checks} cross-file consistency checks passed`);
process.exit(0);
