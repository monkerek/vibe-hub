import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { UsageData } from '../types.js';

const USAGE_API = 'https://api.anthropic.com/api/oauth/usage';
const CACHE_TTL_MS = 60_000; // 1 minute cache

interface CachedUsage {
  data: UsageData;
  timestamp: number;
}

function getCachePath(): string {
  return join(homedir(), '.claude', 'plugins', 'claude-menu', 'usage-cache.json');
}

async function getCredentials(): Promise<string | undefined> {
  try {
    const credPath = join(homedir(), '.claude', '.credentials.json');
    const raw = await readFile(credPath, 'utf-8');
    const creds = JSON.parse(raw);
    return creds.oauth_token || creds.access_token || creds.token;
  } catch {
    return undefined;
  }
}

function isValidCachedUsage(v: unknown): v is CachedUsage {
  if (!v || typeof v !== 'object') return false;
  const c = v as Record<string, unknown>;
  if (typeof c['timestamp'] !== 'number') return false;
  const d = c['data'];
  if (!d || typeof d !== 'object') return false;
  return true;
}

async function readCache(): Promise<CachedUsage | undefined> {
  try {
    const raw = await readFile(getCachePath(), 'utf-8');
    const cached: unknown = JSON.parse(raw);
    if (isValidCachedUsage(cached) && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached;
    }
  } catch {
    // no cache or invalid JSON
  }
  return undefined;
}

async function writeCache(data: UsageData): Promise<void> {
  const { writeFile, mkdir } = await import('node:fs/promises');
  const dir = join(homedir(), '.claude', 'plugins', 'claude-menu');
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(
      getCachePath(),
      JSON.stringify({ data, timestamp: Date.now() }),
      'utf-8',
    );
  } catch {
    // non-critical
  }
}

export async function getUsage(): Promise<UsageData | undefined> {
  // Try cache first
  const cached = await readCache();
  if (cached) return cached.data;

  const token = await getCredentials();
  if (!token) return undefined;

  try {
    const res = await fetch(USAGE_API, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) return undefined;

    const body = (await res.json()) as Record<string, unknown>;
    const data: UsageData = {
      fiveHourUsage: body.five_hour_usage as number | undefined,
      fiveHourLimit: body.five_hour_limit as number | undefined,
      sevenDayUsage: body.seven_day_usage as number | undefined,
      sevenDayLimit: body.seven_day_limit as number | undefined,
      resetAt: body.reset_at as string | undefined,
    };

    await writeCache(data);
    return data;
  } catch {
    return undefined;
  }
}
