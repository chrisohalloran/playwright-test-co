#!/usr/bin/env node
// ptc — Playwright Test Co: run only the tests affected by your changes

import { parseChangedFiles, getChangedFilesFromGit } from './diff-parser.js';
import { mapChangedFilesToTests } from './test-mapper.js';
import { runTests } from './runner.js';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

function printBanner() {
  console.log(`\n${BOLD}${CYAN}⚡ Playwright Test Co${RESET} ${DIM}— targeted E2E testing${RESET}\n`);
}

function printUsage() {
  printBanner();
  console.log(`${BOLD}Usage:${RESET}
  ptc --project <dir> --files <file1,file2,...>   Run tests for specific changed files
  ptc --project <dir> --diff <file>               Read changed files from a diff file
  ptc --project <dir> --git-base <branch>         Auto-detect changes vs a base branch
  ptc --project <dir> --stdin                     Read file list from stdin

${BOLD}Options:${RESET}
  --project, -p    Path to the Playwright project directory (required)
  --files, -f      Comma-separated list of changed files
  --diff, -d       Path to a unified diff file
  --git-base, -g   Base branch for git comparison (default: main)
  --stdin          Read changed file list from stdin
  --dry-run        Show matched tests without running them
  --help, -h       Show this help message

${BOLD}Examples:${RESET}
  ${DIM}# Run tests affected by specific files${RESET}
  ptc -p ./my-app -f src/components/login.js,src/utils/auth.js

  ${DIM}# Pipe git diff into ptc${RESET}
  git diff main... | ptc -p ./my-app --stdin

  ${DIM}# Auto-detect changes from current branch${RESET}
  ptc -p ./my-app --git-base main
`);
}

function parseArgs(argv) {
  const args = { project: null, files: null, diff: null, gitBase: null, stdin: false, dryRun: false, help: false };
  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case '--project': case '-p': args.project = argv[++i]; break;
      case '--files': case '-f': args.files = argv[++i]; break;
      case '--diff': case '-d': args.diff = argv[++i]; break;
      case '--git-base': case '-g': args.gitBase = argv[++i]; break;
      case '--stdin': args.stdin = true; break;
      case '--dry-run': args.dryRun = true; break;
      case '--help': case '-h': args.help = true; break;
    }
  }
  return args;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.help || (!args.project && !args.files && !args.diff && !args.gitBase && !args.stdin)) {
    printUsage();
    process.exit(0);
  }

  if (!args.project) {
    console.error(`${RED}Error: --project is required${RESET}`);
    process.exit(1);
  }

  printBanner();
  const projectDir = resolve(args.project);

  // Step 1: Determine changed files
  let changedFiles;
  if (args.files) {
    changedFiles = parseChangedFiles(args.files, projectDir);
  } else if (args.diff) {
    const diffContent = readFileSync(args.diff, 'utf-8');
    changedFiles = parseChangedFiles(diffContent, projectDir);
  } else if (args.stdin) {
    const input = await readStdin();
    changedFiles = parseChangedFiles(input, projectDir);
  } else if (args.gitBase) {
    changedFiles = getChangedFilesFromGit(args.gitBase, projectDir);
  } else {
    console.error(`${RED}Error: provide --files, --diff, --git-base, or --stdin${RESET}`);
    process.exit(1);
  }

  if (changedFiles.length === 0) {
    console.log(`${YELLOW}No changed files detected. Nothing to do.${RESET}\n`);
    process.exit(0);
  }

  // Step 2: Report detected changes
  console.log(`${BOLD}Changed files detected:${RESET}`);
  changedFiles.forEach(f => console.log(`  ${DIM}•${RESET} ${f}`));
  console.log();

  // Step 3: Map to test files
  const mappings = mapChangedFilesToTests(changedFiles, projectDir);

  if (mappings.length === 0) {
    console.log(`${YELLOW}No matching Playwright tests found for the changed files.${RESET}`);
    console.log(`${DIM}Tip: Ensure test files import or reference the changed source files.${RESET}\n`);
    process.exit(0);
  }

  console.log(`${BOLD}Matched tests:${RESET}`);
  mappings.forEach(m => {
    const badge = m.reason === 'import' ? `${GREEN}import${RESET}` :
                  m.reason === 'name-match' ? `${CYAN}name${RESET}` :
                  `${YELLOW}content${RESET}`;
    console.log(`  ${DIM}•${RESET} ${m.testFile}  ${DIM}[${badge}${DIM}]${RESET}  ← ${DIM}${m.changedFile}${RESET}`);
  });
  console.log();

  const testFilePaths = mappings.map(m => m.testFile);
  const totalTestsInProject = countAllTests(projectDir);

  if (args.dryRun) {
    console.log(`${BOLD}Dry run:${RESET} would run ${testFilePaths.length} test file(s) out of ~${totalTestsInProject} total.`);
    console.log(`${DIM}Skipped: ~${totalTestsInProject - testFilePaths.length} unaffected test file(s).${RESET}\n`);
    process.exit(0);
  }

  // Step 4: Run only matched tests
  console.log(`${BOLD}Running ${testFilePaths.length} targeted test file(s)...${RESET} ${DIM}(skipping ~${totalTestsInProject - testFilePaths.length} unaffected)${RESET}\n`);

  const result = runTests(testFilePaths, projectDir);

  // Step 5: Report results
  console.log(result.output);

  const seconds = (result.duration / 1000).toFixed(1);
  if (result.success) {
    console.log(`\n${GREEN}${BOLD}✓ All targeted tests passed${RESET} ${DIM}(${seconds}s, ${testFilePaths.length}/${totalTestsInProject} test files)${RESET}\n`);
  } else {
    console.log(`\n${RED}${BOLD}✗ Some targeted tests failed${RESET} ${DIM}(${seconds}s, ${testFilePaths.length}/${totalTestsInProject} test files)${RESET}\n`);
  }

  process.exit(result.success ? 0 : 1);
}

function countAllTests(projectDir) {
  let count = 0;
  function walk(dir) {
    try {
      for (const e of readdirSync(dir)) {
        if (e === 'node_modules' || e === '.git') continue;
        const p = resolve(dir, e);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(spec|test)\.(ts|js|mjs)$/.test(e)) count++;
      }
    } catch {}
  }
  walk(projectDir);
  return count;
}

main().catch(e => {
  console.error(`${RED}Error: ${e.message}${RESET}`);
  process.exit(1);
});
