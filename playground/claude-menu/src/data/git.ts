import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { GitStatus } from '../types.js';

const exec = promisify(execFile);

async function git(args: string[], cwd: string): Promise<string> {
  try {
    const { stdout } = await exec('git', args, { cwd, timeout: 3000 });
    return stdout.trim();
  } catch {
    return '';
  }
}

export async function getGitStatus(cwd: string): Promise<GitStatus | undefined> {
  const branch = await git(['rev-parse', '--abbrev-ref', 'HEAD'], cwd);
  if (!branch) return undefined;

  const [statusRaw, aheadBehind] = await Promise.all([
    git(['status', '--porcelain', '-u'], cwd),
    git(['rev-list', '--left-right', '--count', `HEAD...@{upstream}`], cwd),
  ]);

  let ahead = 0;
  let behind = 0;
  if (aheadBehind) {
    const parts = aheadBehind.split(/\s+/);
    ahead = parseInt(parts[0], 10) || 0;
    behind = parseInt(parts[1], 10) || 0;
  }

  let modified = 0;
  let added = 0;
  let deleted = 0;
  let untracked = 0;

  if (statusRaw) {
    for (const line of statusRaw.split('\n')) {
      if (!line) continue;
      const code = line.substring(0, 2);
      if (code === '??') untracked++;
      else if (code.includes('M')) modified++;
      else if (code.includes('A')) added++;
      else if (code.includes('D')) deleted++;
    }
  }

  const dirty = modified + added + deleted + untracked > 0;

  return { branch, dirty, ahead, behind, modified, added, deleted, untracked };
}
