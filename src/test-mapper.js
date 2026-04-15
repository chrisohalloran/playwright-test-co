// Map changed source files to relevant Playwright test files
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, relative, dirname } from 'node:path';

/**
 * Find all Playwright test files in a directory (recursively).
 */
function findTestFiles(dir) {
  const results = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (entry === 'node_modules' || entry === '.git') continue;
      const stat = statSync(full);
      if (stat.isDirectory()) {
        results.push(...findTestFiles(full));
      } else if (/\.(spec|test)\.(ts|js|mjs)$/.test(entry)) {
        results.push(full);
      }
    }
  } catch { /* skip unreadable dirs */ }
  return results;
}

/**
 * Normalize a filename for fuzzy matching.
 * "login-form.js" → "loginform", "settings-panel.js" → "settingspanel"
 */
function normalizeForMatch(filename) {
  return basename(filename)
    .replace(/\.(spec|test)\.(ts|js|mjs)$/, '')
    .replace(/\.(ts|js|mjs|jsx|tsx|vue|svelte)$/, '')
    .replace(/[-_.]/g, '')
    .toLowerCase();
}

/**
 * Map a list of changed files to the Playwright test files that should run.
 *
 * Uses three heuristics:
 * 1. Import tracing — test file imports/requires the changed source file
 * 2. Name matching — test file name is a fuzzy match for the changed file name
 * 3. Content grep  — test file references the changed file's module name
 *
 * Returns: { testFile, changedFile, matchReason }[]
 */
export function mapChangedFilesToTests(changedFiles, projectDir) {
  const testFiles = findTestFiles(projectDir);
  const matches = [];
  const matchedTests = new Set();

  for (const changedFile of changedFiles) {
    const changedNorm = normalizeForMatch(changedFile);
    const changedBase = basename(changedFile);
    // Stem without extension for content grep
    const changedStem = changedBase.replace(/\.[^.]+$/, '');

    for (const testFile of testFiles) {
      if (matchedTests.has(`${testFile}:${changedFile}`)) continue;

      const testContent = readTestFile(testFile);
      if (!testContent) continue;

      // Strategy 1: Import tracing
      if (testImportsFile(testContent, changedFile, testFile, projectDir)) {
        matches.push({ testFile: relative(projectDir, testFile), changedFile, reason: 'import' });
        matchedTests.add(`${testFile}:${changedFile}`);
        continue;
      }

      // Strategy 2: Name matching
      const testNorm = normalizeForMatch(testFile);
      if (changedNorm.length > 2 && (testNorm.includes(changedNorm) || changedNorm.includes(testNorm))) {
        matches.push({ testFile: relative(projectDir, testFile), changedFile, reason: 'name-match' });
        matchedTests.add(`${testFile}:${changedFile}`);
        continue;
      }

      // Strategy 3: Content grep — test mentions the source file or module
      if (changedStem.length > 2 && testContent.includes(changedStem)) {
        matches.push({ testFile: relative(projectDir, testFile), changedFile, reason: 'content-ref' });
        matchedTests.add(`${testFile}:${changedFile}`);
        continue;
      }
    }
  }

  // Deduplicate by test file — a test only needs to run once even if multiple changes map to it
  const uniqueTests = new Map();
  for (const m of matches) {
    if (!uniqueTests.has(m.testFile)) {
      uniqueTests.set(m.testFile, { ...m, changedFiles: [m.changedFile], reasons: [m.reason] });
    } else {
      const existing = uniqueTests.get(m.testFile);
      if (!existing.changedFiles.includes(m.changedFile)) {
        existing.changedFiles.push(m.changedFile);
        existing.reasons.push(m.reason);
      }
    }
  }

  return [...uniqueTests.values()].map(m => ({
    testFile: m.testFile,
    changedFile: m.changedFiles.join(', '),
    reason: m.reasons[0], // Primary match reason
  }));
}

function readTestFile(path) {
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Check if a test file imports/requires a changed source file.
 * Handles relative imports like: import { x } from '../src/components/login-form.js'
 */
function testImportsFile(testContent, changedFile, testFile, projectDir) {
  // Extract all import/require paths from test content
  const importPaths = [];
  const importRegex = /(?:import|require)\s*\(?[^)'"]*['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(testContent)) !== null) {
    importPaths.push(match[1]);
  }

  // Also check comment-based references like "// Tests for: src/components/login-form.js"
  const commentRef = /Tests?\s+for:\s*(.+)/gi;
  while ((match = commentRef.exec(testContent)) !== null) {
    importPaths.push(match[1].trim());
  }

  for (const importPath of importPaths) {
    // Normalize: resolve relative to test file location, compare with changed file
    const changedNorm = changedFile.replace(/^\.\//, '');
    const importNorm = importPath.replace(/^\.\//, '');

    // Direct path match
    if (importNorm === changedNorm || importNorm.endsWith(changedNorm) || changedNorm.endsWith(importNorm)) {
      return true;
    }

    // Resolve relative import from test file directory
    if (importPath.startsWith('.')) {
      const testDir = dirname(testFile);
      const resolved = join(testDir, importPath);
      const resolvedRel = relative(projectDir, resolved);
      if (resolvedRel === changedNorm || resolvedRel.replace(/\.[^.]+$/, '') === changedNorm.replace(/\.[^.]+$/, '')) {
        return true;
      }
    }
  }

  return false;
}
