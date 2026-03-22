import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
const USAGE_API = 'https://api.anthropic.com/api/oauth/usage';
const CACHE_TTL_MS = 60_000; // 1 minute cache
function getCachePath() {
    return join(homedir(), '.claude', 'plugins', 'claude-menu', 'usage-cache.json');
}
async function getCredentials() {
    try {
        const credPath = join(homedir(), '.claude', '.credentials.json');
        const raw = await readFile(credPath, 'utf-8');
        const creds = JSON.parse(raw);
        return creds.oauth_token || creds.access_token || creds.token;
    }
    catch {
        return undefined;
    }
}
function isValidCachedUsage(v) {
    if (!v || typeof v !== 'object')
        return false;
    const c = v;
    if (typeof c['timestamp'] !== 'number')
        return false;
    const d = c['data'];
    if (!d || typeof d !== 'object')
        return false;
    return true;
}
async function readCache() {
    try {
        const raw = await readFile(getCachePath(), 'utf-8');
        const cached = JSON.parse(raw);
        if (isValidCachedUsage(cached) && Date.now() - cached.timestamp < CACHE_TTL_MS) {
            return cached;
        }
    }
    catch {
        // no cache or invalid JSON
    }
    return undefined;
}
async function writeCache(data) {
    const { writeFile, mkdir, rename } = await import('node:fs/promises');
    const dir = join(homedir(), '.claude', 'plugins', 'claude-menu');
    const cachePath = getCachePath();
    const tmpPath = cachePath + '.tmp';
    try {
        await mkdir(dir, { recursive: true });
        await writeFile(tmpPath, JSON.stringify({ data, timestamp: Date.now() }), 'utf-8');
        await rename(tmpPath, cachePath);
    }
    catch {
        // non-critical
    }
}
export async function getUsage() {
    // Try cache first
    const cached = await readCache();
    if (cached)
        return cached.data;
    const token = await getCredentials();
    if (!token)
        return undefined;
    try {
        const res = await fetch(USAGE_API, {
            headers: { Authorization: `Bearer ${token}` },
            signal: AbortSignal.timeout(3000),
        });
        if (!res.ok)
            return undefined;
        const body = (await res.json());
        const data = {
            fiveHourUsage: body.five_hour_usage,
            fiveHourLimit: body.five_hour_limit,
            sevenDayUsage: body.seven_day_usage,
            sevenDayLimit: body.seven_day_limit,
            resetAt: body.reset_at,
        };
        await writeCache(data);
        return data;
    }
    catch {
        return undefined;
    }
}
//# sourceMappingURL=usage.js.map