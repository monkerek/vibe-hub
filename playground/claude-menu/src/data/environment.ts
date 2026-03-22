import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { EnvironmentInfo } from '../types.js';

export async function getEnvironment(cwd: string): Promise<EnvironmentInfo> {
  const info: EnvironmentInfo = {
    claudeMdCount: 0,
    rulesCount: 0,
    mcpCount: 0,
    hooksCount: 0,
  };

  // Count CLAUDE.md files in project
  try {
    const files = [
      join(cwd, 'CLAUDE.md'),
      join(cwd, '.claude', 'CLAUDE.md'),
    ];
    for (const f of files) {
      try {
        await readFile(f, 'utf-8');
        info.claudeMdCount++;
      } catch { /* skip */ }
    }
  } catch { /* skip */ }

  // Read settings.json for rules, MCPs, hooks
  try {
    const settingsPath = join(homedir(), '.claude', 'settings.json');
    const raw = await readFile(settingsPath, 'utf-8');
    const settings = JSON.parse(raw) as Record<string, unknown>;

    if (settings.rules && Array.isArray(settings.rules)) {
      info.rulesCount = settings.rules.length;
    }
    if (settings.mcpServers && typeof settings.mcpServers === 'object') {
      info.mcpCount = Object.keys(settings.mcpServers as object).length;
    }
    if (settings.hooks && typeof settings.hooks === 'object') {
      info.hooksCount = Object.keys(settings.hooks as object).length;
    }
  } catch { /* skip */ }

  return info;
}
