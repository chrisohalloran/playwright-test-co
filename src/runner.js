// Execute matched Playwright tests and report results
import { execSync } from 'node:child_process';
import { join } from 'node:path';

/**
 * Run only the specified Playwright test files within a project.
 * Returns { success, output, testCount, duration }.
 */
export function runTests(testFiles, projectDir) {
  if (testFiles.length === 0) {
    return { success: true, output: 'No tests to run.', testCount: 0, duration: 0 };
  }

  // Build the npx playwright test command with specific test files
  const testArgs = testFiles.map(f => `"${f}"`).join(' ');
  const cmd = `npx playwright test ${testArgs}`;

  const start = Date.now();
  try {
    const output = execSync(cmd, {
      cwd: projectDir,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120000,
    });
    const duration = Date.now() - start;
    return {
      success: true,
      output,
      testCount: testFiles.length,
      duration,
    };
  } catch (e) {
    const duration = Date.now() - start;
    return {
      success: false,
      output: e.stdout || e.stderr || e.message,
      testCount: testFiles.length,
      duration,
    };
  }
}
