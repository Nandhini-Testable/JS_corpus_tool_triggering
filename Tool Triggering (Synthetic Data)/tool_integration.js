#!/usr/bin/env node
'use strict';
/**
 * Tool integration entry point for branch JS_V21_VITE_NPM_MONO (Node 21).
 *
 *   node "Tool Triggering (Synthetic Data)/tool_integration.js"            banner
 *   node "Tool Triggering (Synthetic Data)/tool_integration.js" --verify   check every tool is wired
 *   node "Tool Triggering (Synthetic Data)/tool_integration.js" --run      run every tool, honouring skips
 *
 * Exit codes from --run mirror the runners' own contract:
 *   0  every tool either ran, or skipped for a reason dataset.json records
 *   1  a tool recorded active could not run because it is missing from this host
 *   2  a tool skipped for a reason dataset.json does NOT record
 *
 * Ported from the sibling Python corpus's tools/tool_integration.py.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.dirname(__dirname);
const FOLDER = path.basename(__dirname);
const TOOLS_DIR = __dirname;

const WIRING = [
  { dir: "lizard", label: "Lizard", role: "primary", entrypoint: "Tool Triggering (Synthetic Data)/lizard/run_lizard.sh" },
  { dir: "debtmap", label: "debtmap", role: "alternative", entrypoint: "Tool Triggering (Synthetic Data)/debtmap/run_debtmap.sh" },
  { dir: "sonarjs", label: "eslint-plugin-sonarjs", role: "primary", entrypoint: "Tool Triggering (Synthetic Data)/sonarjs/run_sonarjs.sh" },
  { dir: "cccc", label: "cccc", role: "alternative", entrypoint: "Tool Triggering (Synthetic Data)/cccc/run_cccc.sh" },
  { dir: "jscpd", label: "jscpd", role: "primary", entrypoint: "Tool Triggering (Synthetic Data)/jscpd/run_jscpd.sh" },
  { dir: "dolos", label: "Dolos", role: "alternative", entrypoint: "Tool Triggering (Synthetic Data)/dolos/run_dolos.sh" },
  { dir: "eslint", label: "eslint", role: "primary", entrypoint: "Tool Triggering (Synthetic Data)/eslint/run_eslint.sh" },
  { dir: "oxlint", label: "oxlint", role: "alternative", entrypoint: "Tool Triggering (Synthetic Data)/oxlint/run_oxlint.sh" },
  { dir: "security", label: "eslint-plugin-security", role: "primary", entrypoint: "Tool Triggering (Synthetic Data)/security/run_security.sh" },
  { dir: "opengrep", label: "OpenGrep", role: "alternative", entrypoint: "Tool Triggering (Synthetic Data)/opengrep/run_opengrep.sh" },
  { dir: "npm-audit", label: "npm audit + npm ls", role: "primary", entrypoint: "Tool Triggering (Synthetic Data)/npm-audit/run_npm_audit.sh" },
  { dir: "npm-ls", label: "npm ls", role: "primary", entrypoint: "Tool Triggering (Synthetic Data)/npm-ls/run_npm_ls.sh" },
  { dir: "trivy", label: "Trivy", role: "alternative", entrypoint: "Tool Triggering (Synthetic Data)/trivy/run_trivy.sh" },
  { dir: "nyc", label: "nyc + mocha", role: "primary", entrypoint: "Tool Triggering (Synthetic Data)/nyc/run_nyc.sh" },
  { dir: "mocha", label: "Mocha", role: "primary", entrypoint: "Tool Triggering (Synthetic Data)/mocha/run_mocha.sh" },
  { dir: "monocart", label: "monocart-coverage-reports", role: "alternative", entrypoint: "Tool Triggering (Synthetic Data)/monocart/run_monocart.sh" },
  { dir: "stryker", label: "StrykerJS + Mocha", role: "primary", entrypoint: "Tool Triggering (Synthetic Data)/stryker/run_stryker.sh" },
  { dir: "gutcheck", label: "gutcheck", role: "alternative", entrypoint: "Tool Triggering (Synthetic Data)/gutcheck/run_gutcheck.sh" },
  { dir: "diff-cover", label: "diff-cover", role: "primary", entrypoint: "Tool Triggering (Synthetic Data)/diff-cover/run_diff_cover.sh" },
  { dir: "eslint-scope", label: "ESLint (eslint-scope)", role: "primary", entrypoint: "Tool Triggering (Synthetic Data)/eslint-scope/run_eslint_scope.sh" },
  { dir: "codeql", label: "CodeQL", role: "alternative", entrypoint: "Tool Triggering (Synthetic Data)/codeql/run_codeql.sh" },
  { dir: "knip", label: "knip", role: "alternative", entrypoint: "Tool Triggering (Synthetic Data)/knip/run_knip.sh" },
  { dir: "pydriller", label: "PyDriller", role: "primary", entrypoint: "Tool Triggering (Synthetic Data)/pydriller/run_pydriller.js" },
  { dir: "git-spark", label: "Git-Spark", role: "alternative", entrypoint: "Tool Triggering (Synthetic Data)/git-spark/run_git_spark.sh" }
];

function loadDataset() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'dataset.json'), 'utf8'));
}

function banner() {
  const data = loadDataset();
  console.log('='.repeat(78));
  console.log(`  JS_V21_VITE_NPM_MONO  --  Node 21 (21.7.3)`);
  console.log('='.repeat(78));
  console.log(`  bundler        : ${data.bundler}`);
  console.log(`  package manager: ${data.packageManager}`);
  console.log(`  architecture   : ${data.architecture}`);
  console.log('-'.repeat(78));
  console.log(`  tools wired    : ${data.toolsWired}`);
  console.log(`  active here    : ${data.toolsActive}`);
  console.log(`  dark here      : ${data.toolsDark}  (declared on purpose; see dataset.json)`);
  console.log('='.repeat(78));
}

function verify() {
  const data = loadDataset();
  const problems = [];
  for (const row of WIRING) {
    const folder = path.join(TOOLS_DIR, row.dir);
    if (!fs.existsSync(folder)) { problems.push(`missing directory: ${FOLDER}/${row.dir}`); continue; }
    if (!fs.existsSync(path.join(folder, 'trigger.yaml'))) problems.push(`missing manifest: ${FOLDER}/${row.dir}/trigger.yaml`);
    if (!fs.existsSync(path.join(ROOT, row.entrypoint))) problems.push(`missing entrypoint: ${row.entrypoint}`);
  }
  const declared = new Set(WIRING.map((r) => r.dir));
  const present = new Set(fs.readdirSync(TOOLS_DIR).filter((n) => {
    const full = path.join(TOOLS_DIR, n);
    return fs.statSync(full).isDirectory() && !n.startsWith('_');
  }));
  for (const extra of [...present].filter((n) => !declared.has(n)).sort()) problems.push(`orphan tool directory with no wiring row: ${FOLDER}/${extra}`);
  for (const missing of [...declared].filter((n) => !present.has(n)).sort()) problems.push(`wiring row with no directory: ${FOLDER}/${missing}`);
  if (data.toolsWired !== WIRING.length) problems.push(`dataset.json says ${data.toolsWired} tools wired, wiring table has ${WIRING.length}`);

  if (problems.length) {
    for (const p of problems) console.log('FAIL  ' + p);
    return 1;
  }
  console.log(`OK    ${WIRING.length} tools wired, every manifest and entrypoint present`);
  return 0;
}

function runAll() {
  const data = loadDataset();
  const activeDetail = data.toolsActiveDetail || [];
  const expectedActive = new Set(activeDetail.filter((t) => t.status === 'active').map((t) => t.dir));
  const expectedDark = new Set(activeDetail.filter((t) => t.status !== 'active').map((t) => t.dir));

  const ran = [], skipped = [], absent = [], failed = [], unexpected = [];
  for (const row of WIRING) {
    const entry = path.join(ROOT, row.entrypoint);
    const cmd = entry.endsWith('.js') ? 'node' : entry.endsWith('.py') ? 'python3' : 'bash';
    console.log(`\n--- ${row.label} (${row.dir}) ---`);
    const result = spawnSync(cmd, [entry], { cwd: ROOT, stdio: 'inherit' });
    const rc = result.status === null ? 1 : result.status;
    if (rc === 3) { skipped.push(row.dir); if (!expectedDark.has(row.dir)) unexpected.push(row.dir); }
    else if (rc === 4) absent.push(row.dir);
    else if (rc === 0) ran.push(row.dir);
    else failed.push(row.dir);
  }

  console.log('\n' + '='.repeat(78));
  console.log(`  ran           : ${String(ran.length).padStart(2)}  ${ran.sort().join(' ')}`);
  console.log(`  skipped (3)   : ${String(skipped.length).padStart(2)}  ${skipped.sort().join(' ')}`);
  console.log(`  not installed : ${String(absent.length).padStart(2)}  ${absent.sort().join(' ')}`);
  console.log(`  failed        : ${String(failed.length).padStart(2)}  ${failed.sort().join(' ')}`);
  console.log('='.repeat(78));

  if (failed.length) { console.log(`FAIL  these tools ran and failed: ${failed.sort().join(' ')}`); return 1; }
  if (absent.length) { console.log(`INCOMPLETE  recorded active but not installed here: ${absent.sort().join(' ')}`); return 1; }
  const missingActive = [...expectedActive].filter((d) => !ran.includes(d)).sort();
  if (missingActive.length) { console.log(`FAIL  recorded active but did not run: ${missingActive.join(' ')}`); return 1; }
  if (unexpected.length) { console.log(`FAIL  skipped for a reason dataset.json does not record: ${unexpected.sort().join(' ')}`); return 2; }
  console.log('OK    every active tool ran; every skip was already recorded');
  return 0;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--verify')) return verify();
  if (args.includes('--run')) return runAll();
  banner();
  return 0;
}

process.exit(main());
