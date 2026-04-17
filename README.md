# Playwright Test Co

Run only the Playwright tests affected by your PR changes. Stop re-running the full E2E suite after every fix.

## The Problem

You apply a fix to your PR — maybe from AI code review feedback, maybe a quick bug fix — and now you need to re-run E2E tests. But your full Playwright suite takes 10+ minutes. You only changed one component. Why run everything?

## The Solution

`ptc` analyzes which files changed, maps them to the Playwright test files that exercise those areas, and runs **only those tests**.

```
$ ptc -p ./my-app -f src/components/login-form.js

⚡ Playwright Test Co — targeted E2E testing

Changed files detected:
  • src/components/login-form.js

Matched tests:
  • tests/login.spec.ts  [import]  ← src/components/login-form.js

Running 1 targeted test file(s)... (skipping ~4 unaffected)

  ✓ shows login form with email and password fields (240ms)
  ✓ requires email field to be filled (129ms)
  ✓ shows error for short password (94ms)
  ✓ navigates to dashboard on successful login (588ms)

  4 passed (1.7s)

✓ All targeted tests passed (2.5s, 1/5 test files)
```

## Install

Install directly from GitHub:

```bash
npm install -g github:chrisohalloran/playwright-test-co
```

Or use directly with npx — no install needed:

```bash
npx github:chrisohalloran/playwright-test-co --help
```

<details>
<summary>Other install methods</summary>

From npm registry (when available):
```bash
npm install -g playwright-test-co
```

From a specific branch or tag:
```bash
npm install -g github:chrisohalloran/playwright-test-co#main
```
</details>

## Usage

```
ptc --project <dir> --files <file1,file2,...>   Run tests for specific changed files
ptc --project <dir> --diff <file>               Read changed files from a diff file
ptc --project <dir> --git-base <branch>         Auto-detect changes vs a base branch
ptc --project <dir> --stdin                     Read file list from stdin
```

### Options

| Flag | Short | Description |
|------|-------|-------------|
| `--project` | `-p` | Path to the Playwright project directory (required) |
| `--files` | `-f` | Comma-separated list of changed files |
| `--diff` | `-d` | Path to a unified diff file |
| `--git-base` | `-g` | Base branch for git comparison (default: main) |
| `--stdin` | | Read changed file list from stdin |
| `--dry-run` | | Show matched tests without running them |

### Examples

```bash
# After fixing a specific component
ptc -p ./my-app -f src/components/login-form.js

# Pipe git diff directly (the killer CI feature)
git diff main... | ptc -p ./my-app --stdin

# Auto-detect changes on your branch
ptc -p ./my-app --git-base main

# Preview which tests would run (no execution)
ptc -p ./my-app -f src/api/auth.js --dry-run
```

## CI Integration

The stdin piping mode makes `ptc` a drop-in for CI pipelines. Pipe your PR diff and only the affected tests run:

### GitHub Actions

```yaml
- name: Run affected Playwright tests
  run: |
    npx playwright install --with-deps
    git diff origin/main...HEAD --name-only | npx github:chrisohalloran/playwright-test-co -p . --stdin
```

### Generic CI

```bash
# Get changed files from your PR and pipe to ptc
git diff $BASE_BRANCH...HEAD --name-only | ptc -p . --stdin
```

This replaces a full `npx playwright test` run with a targeted one — same confidence, fraction of the time.

## How It Maps Changes to Tests

Three heuristics, applied in priority order:

1. **Import tracing** — Parses test files for `import`/`require` statements and `// Tests for:` comments that reference changed source files. Most reliable signal.

2. **Name matching** — Fuzzy matches file stems: `login-form.js` maps to `login.spec.ts`. Catches convention-based test organization.

3. **Content reference** — Searches test file content for mentions of the changed module name. Catches indirect dependencies.

## Prerequisites

- Node.js 18+
- The target project must have [Playwright](https://playwright.dev/) installed and configured
- Run `npx playwright install` in your target project if browsers aren't set up yet

## License

MIT
