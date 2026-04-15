# Playwright Test Co

## What This Is
CLI tool that maps PR diffs to targeted Playwright tests. Feed it changed files, it runs only the relevant E2E tests.

## Project Structure
- `src/` — CLI tool (pure ESM, no build step)
  - `cli.js` — Entry point and output formatting
  - `diff-parser.js` — Parse changed files from file list, git diff, or branch comparison
  - `test-mapper.js` — Map source files → test files (import tracing, name matching, content grep)
  - `runner.js` — Execute matched Playwright tests via npx
- `sample-project/` — Demo web app with Playwright tests (for testing the tool itself)
- `sample-server.js` — Static file server for sample-project

## Commands
- `node src/cli.js --help` — Show usage
- `node src/cli.js -p sample-project -f "src/components/login-form.js"` — Demo run
- `cd sample-project && npx playwright test` — Run full sample test suite

## Conventions
- Pure Node.js ESM — no TypeScript build, no bundler
- No external dependencies in the CLI tool itself (only node: built-ins)
- Playwright is a peer dependency of the target project, not this tool
