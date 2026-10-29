#!/usr/bin/env node
/**
 * Installs the repository git hooks (see `.githooks/`).
 *
 * The hook directory is registered through `core.hooksPath`, so no changes to
 * the local `.git/hooks` directory are required. The script is intentionally
 * fail-safe: it never breaks `npm install` (for example inside CI) and it is
 * idempotent.
 */
import { execFileSync } from 'node:child_process';
import { chmodSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');
const hooksPath = join(repoRoot, '.githooks');

if (!existsSync(hooksPath)) {
  console.log('[git-hooks] No .githooks directory found - skipping hook installation.');
  process.exit(0);
}

if (process.env.CI || process.env.GIT_HOOKS_SKIP) {
  console.log('[git-hooks] CI detected - skipping hook installation.');
  process.exit(0);
}

// Make sure the hook is executable (no-op on Windows).
const preCommitHook = join(hooksPath, 'pre-commit');
if (existsSync(preCommitHook)) {
  try {
    chmodSync(preCommitHook, 0o755);
  } catch {
    // Ignore - the file system may not support POSIX permissions.
  }
}

try {
  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { cwd: repoRoot, stdio: 'ignore' });
  console.log('[git-hooks] Installed pre-commit hook (core.hooksPath=.githooks).');
} catch (error) {
  console.log(`[git-hooks] Could not install hooks automatically (${error.message}).`);
  console.log('[git-hooks] Run "git config core.hooksPath .githooks" manually.');
}
