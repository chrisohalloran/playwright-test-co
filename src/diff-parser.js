// Parse changed files from various input formats: file list, git diff, or git branch comparison
import { execSync } from 'node:child_process';

/**
 * Extract changed file paths from CLI input.
 * Supports: comma-separated file list, git diff output, or auto-detect from git branch.
 */
export function parseChangedFiles(input, projectDir) {
  // If input looks like file paths (comma-separated or newline-separated)
  if (!input.startsWith('diff ') && !input.startsWith('---')) {
    return input
      .split(/[,\n]/)
      .map(f => f.trim())
      .filter(f => f.length > 0 && !f.startsWith('#'));
  }

  // Parse unified diff format
  return parseDiffOutput(input);
}

/**
 * Parse a unified diff to extract changed file paths.
 */
function parseDiffOutput(diff) {
  const files = new Set();
  for (const line of diff.split('\n')) {
    // Match "diff --git a/path b/path" or "+++ b/path"
    const gitDiff = line.match(/^diff --git a\/(.+?) b\//);
    const plusFile = line.match(/^\+\+\+ b\/(.+)/);
    if (gitDiff) files.add(gitDiff[1]);
    else if (plusFile) files.add(plusFile[1]);
  }
  return [...files];
}

/**
 * Get changed files by comparing current branch to a base branch using git.
 */
export function getChangedFilesFromGit(baseBranch = 'main', projectDir = '.') {
  try {
    const output = execSync(`git diff --name-only ${baseBranch}...HEAD`, {
      cwd: projectDir,
      encoding: 'utf-8',
    });
    return output.split('\n').filter(f => f.trim().length > 0);
  } catch (e) {
    throw new Error(`Failed to get git diff against ${baseBranch}: ${e.message}`);
  }
}
