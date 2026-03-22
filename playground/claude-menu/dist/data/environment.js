import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
export async function getEnvironment(cwd) {
    const info = {
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
            }
            catch { /* skip */ }
        }
    }
    catch { /* skip */ }
    // Read settings.json for rules, MCPs, hooks
    try {
        const settingsPath = join(homedir(), '.claude', 'settings.json');
        const raw = await readFile(settingsPath, 'utf-8');
        const settings = JSON.parse(raw);
        if (settings.rules && Array.isArray(settings.rules)) {
            info.rulesCount = settings.rules.length;
        }
        if (settings.mcpServers && typeof settings.mcpServers === 'object') {
            info.mcpCount = Object.keys(settings.mcpServers).length;
        }
        if (settings.hooks && typeof settings.hooks === 'object') {
            info.hooksCount = Object.keys(settings.hooks).length;
        }
    }
    catch { /* skip */ }
    return info;
}
//# sourceMappingURL=environment.js.map