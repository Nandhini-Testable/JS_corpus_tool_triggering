# JS_V20_VITE_NPM_MONO

Part of the `javascript-combos` white-box test-repo corpus (GraniteMill /
`granite-mill`, domain: Community garden plots).

## Branch variables

| Variable | This branch |
| --- | --- |
| Branch | `JS_V20_VITE_NPM_MONO` |
| Node.js | 20.20.2 (family V20) |
| Bundler | Vite (built as esbuild) |
| Package manager | npm |
| Bundled npm | 10.8.2 |
| Architecture | Monolith |
| Source root | `src` |

The application code under `src/` (or `packages/*/src/` for Microservices
branches) is byte-identical across all 576 branches of this corpus; only the
build tool, package manager, architecture layout, and each tool's real
status on this Node family vary.

## Supported tools

24 tool folders are wired on this corpus (one `Tool Triggering (Synthetic Data)/<dir>/` folder
each, covering the 103-metric white-box framework): the 23 tools of the tool list,
plus `eslint-scope`, the data-flow script behind the "ESLint (eslint-scope)" entry.
**16 of them run on Node 20; 8 do not.**

That is the measurement, not a defect. A tool that cannot run exits **3**,
not 0 -- a skip that looks like a pass is the failure mode this corpus
exists to expose. Every `Tool Triggering (Synthetic Data)/<dir>/trigger.yaml` records whether its status
here was actually invoked and observed by Claude Code (`measured: true`) or
is a real npm-registry `engines.node` claim not yet individually
invoke-verified on this exact family (`measured: false`) -- declared support
is a claim, invoking is the fact, and this corpus never blurs the two.

### Running here

| Tool | Role | Pin | Why |
| --- | --- | --- | --- |
| `Lizard` | primary | lizard (pip) | measured directly: pip-installed and run for real against this domain's src/ (lizard 1.24.0). Found policy.js's evaluatePolicy as the highest-CCN function at 18 -- corrects an earlier assumption that dataflow.js's tally loop (CCN 17) was highest; Node-independent by construction, so this holds on every family. _(measured: real invocation confirmed by Claude Code)_ |
| `eslint-plugin-sonarjs` | primary | eslint-plugin-sonarjs==4.2.1 | eslint-plugin-sonarjs 4.2.1 declares Node 20 compatibility; runs through eslint itself. _(declared active from npm registry data; not yet individually invoke-verified on this family)_ |
| `jscpd` | primary | jscpd==5.2.1 | jscpd 5.2.1 declares Node 20 compatibility (npm registry engines.node range). _(declared active from npm registry data; not yet individually invoke-verified on this family)_ |
| `eslint` | primary | eslint==10.10.0 | eslint 10.10.0 declares Node 20 compatibility (npm registry engines.node range). _(declared active from npm registry data; not yet individually invoke-verified on this family)_ |
| `eslint-plugin-security` | primary | eslint-plugin-security==4.0.1 | eslint-plugin-security 4.0.1 declares Node 20 compatibility; runs through eslint itself. _(declared active from npm registry data; not yet individually invoke-verified on this family)_ |
| `npm audit + npm ls` | primary | n/a | npm's own bundled audit/ls -- ships with npm itself on every Node family this corpus supports. _(declared active from npm registry data; not yet individually invoke-verified on this family)_ |
| `npm ls` | primary | n/a | npm's own bundled `npm ls` -- ships with npm itself on every Node family this corpus supports (npm 10.8.2 on this branch). _(declared active from npm registry data; not yet individually invoke-verified on this family)_ |
| `nyc + mocha` | primary | nyc==18.0.0 | clean on every family once the architecture-aware test glob (bug #1) and the Microservices require() path (bug #4) were both fixed. _(measured: real invocation confirmed by Claude Code)_ |
| `Mocha` | primary | mocha==12.0.1 | mocha 12.0.1 declares Node 20 compatibility (npm registry engines.node range). This branch's own `npm test` runs mocha@11.8.0. _(declared active from npm registry data; not yet individually invoke-verified on this family)_ |
| `monocart-coverage-reports` | alternative | monocart-coverage-reports==2.13.0 | monocart-coverage-reports 2.13.0 declares Node 20 compatibility (npm registry engines.node range). _(declared active from npm registry data; not yet individually invoke-verified on this family)_ |
| `gutcheck` | alternative | gutcheck==0.10.0 | gutcheck 0.10.0 declares Node 20 compatibility (npm registry engines.node range). _(declared active from npm registry data; not yet individually invoke-verified on this family)_ |
| `diff-cover` | primary | diff-cover (pip) | the diff-cover CLI itself was invoked for real (pip install + --help) and works; its coverage-delta output depends on nyc's cobertura report, which needs a full npm install this session's verification bridge could not complete (slow mounted filesystem + shared disk quota, not a tool defect -- see javascript-repos-build-contract.md). Node-independent by construction. _(measured: real invocation confirmed by Claude Code)_ |
| `ESLint (eslint-scope)` | primary | eslint-scope==9.1.2 | clean on every family tested (12 through 26) -- the dataflow script is hand-written without `?.`/`??` specifically so it never depends on the same syntax features that break other tools on the oldest families. _(measured: real invocation confirmed by Claude Code)_ |
| `knip` | alternative | knip==6.36.0 | knip 6.36.0 declares Node 20 compatibility (npm registry engines.node range). _(declared active from npm registry data; not yet individually invoke-verified on this family)_ |
| `PyDriller` | primary | pydriller (pip) | PyDriller is a Python package invoked externally via a small wrapper script -- Node-version-independent by construction. _(declared active from npm registry data; not yet individually invoke-verified on this family)_ |
| `Git-Spark` | alternative | git-spark==1.3.0 | Git-Spark 1.3.0 declares Node 20 compatibility (npm registry engines.node range). _(declared active from npm registry data; not yet individually invoke-verified on this family)_ |

### Dark here

| Tool | Role | Status | Why |
| --- | --- | --- | --- |
| `debtmap` | alternative | not installed | debtmap is a Rust CLI (`cargo install debtmap`; version 0.24.1 on crates.io), not present on this host. The Clean corpus's debtmap README records it built from crates.io and run for real there. |
| `cccc` | alternative | not installed | CCCC (C and C++ Code Counter) is a native program, not installable via npm/pip on this host. It parses C, C++, Ada and Java, not JavaScript, so on this branch's JavaScript it is not expected to produce meaningful metrics (see Tool Clean (Synthetic Data)/cccc/README.md). Version 3.2.0 is the Debian package's upstream version; it was not confirmed against the upstream project. |
| `Dolos` | alternative | not installed | dolos's native tree-sitter step needs a C++ toolchain -- already documented as absent on this host by the C#/Python sibling corpora's own precedent; installs with --ignore-scripts, which skips the native build |
| `oxlint` | alternative | skipped | same oxlint 1.16.0-vs-1.83.0 range-drift break as N18; 1.83.0 resolves here even more often since N20 favours newer optional native bindings. |
| `OpenGrep` | alternative | not installed | standalone binary, not installable via npm/pip on this host -- same category as Dolos's native step and the Python corpus's own Trivy/OpenGrep entries |
| `Trivy` | alternative | not installed | standalone binary, not installable via npm/pip on this host |
| `StrykerJS + Mocha` | primary | skipped | `@stryker-mutator/mocha-runner@9.6.1` accepts `mocha >= 7.2 < 12`, so this branch pins `mocha ^11.8.0` (the pairing the node20 fixtures already use) and `npm install` resolves. The mutation run itself has not been re-measured on this branch family. |
| `CodeQL` | alternative | not installed | standalone binary (CodeQL CLI release bundle), not installable via npm/pip on this host; the Clean corpus's CodeQL README records GitHub release downloads returning 403 in the build environment. |

## Build

```
npm install    # or yarn / pnpm / bun, per this branch's packageManager field
npm run build
```

## Run

```
node src/index.js
```

## Test

```
npm test              # mocha tests/**/*.test.js
npm run coverage      # nyc + mocha
node "Tool Triggering (Synthetic Data)/full_check.js"   # cross-file consistency audit
```


## Tool entry points

Every tool directory carries a `trigger.yaml` recording its pin, its
declared status and what a working run should find. Run one tool directly,
or all of them:

```
bash "Tool Triggering (Synthetic Data)/eslint/run_eslint.sh"
node "Tool Triggering (Synthetic Data)/tool_integration.js" --run
node "Tool Triggering (Synthetic Data)/tool_integration.js" --verify
```

`--run` distinguishes three outcomes: a tool that ran, a tool that skipped
for a reason `dataset.json` already records, and a tool that skipped for a
reason it does not. Only the third is a finding.

## Planted fixtures

| Fixture | File(s) | Planted for |
| --- | --- | --- |
| Duplication | [`src/http-errors.js`](src/http-errors.js) + [`src/http-errors-legacy.js`](src/http-errors-legacy.js) | jscpd, Dolos |

## Workspace layout

```
javascript-combos/  (JS_V20_VITE_NPM_MONO)
|-- .github/
|-- Tool Triggering (Synthetic Data)/  (24 tool directories + _skip.sh, tool_integration.js, full_check.js)
|-- scripts/
|-- src/
|-- tests/
|-- .gitignore
|-- .jscpd.json
|-- .nvmrc
|-- .nycrc.json
|-- .oxlintrc.json
|-- LICENSE
|-- README.md
|-- dataset.json
|-- eslint.config.js
|-- knip.json
|-- package.json
|-- stryker.conf.json
|-- vite.config.js
```

## History

This branch's real commit history starts from the corpus's scaffolding
generation, followed by the six genuine scaffolding-bug fixes found by
Claude Code's actual local install/test runs across all nine Node families
(see `javascript-repos-build-contract.md`) -- every commit here is real,
authored by the accounts that actually did the work; nothing is
back-filled or fabricated.

## Machine-readable

[`dataset.json`](dataset.json) carries every branch variable and the full
tool-status breakdown, including the reason each dark tool is dark and
whether that status was actually measured. It is the answer key: a run is
correct when what the tool platform reports matches what `dataset.json`
says should happen, including the tools that are supposed to be dark.

See `javascript-repos-build-contract.md` in the Testable (Tools) project for
the full 103-metric roster, the repair notes, and the live pin-resolution
method (npm registry `engines.node` ranges, prereleases excluded).

<!-- dummy PR 2026-11-04 07:23:30 -->
<!-- dummy PR 2026-11-05 12:59:53 -->
<!-- dummy PR 2026-11-06 11:31:18 -->
<!-- dummy PR 2026-11-06 12:14:33 -->
