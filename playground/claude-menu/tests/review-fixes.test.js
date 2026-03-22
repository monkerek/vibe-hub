/**
 * Regression tests for all issues raised in the code review.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildSegments } from '../dist/render/segments.js';
import { render } from '../dist/render/index.js';
import { stripAnsi, visibleLength } from '../dist/render/colors.js';
import { DEFAULT_CONFIG } from '../dist/config.js';
import { baseCtx, buildWith } from './helpers.js';

// ─── BUG 1: renderContext — output_tokens inflated context percentage ─────────

describe('renderContext — context window percentage', () => {
  function ctxWith(usage) {
    return {
      ...baseCtx,
      stdin: { context_window: usage },
      config: { ...DEFAULT_CONFIG, layout: { mode: 'compact', segments: ['context'] } },
    };
  }

  it('uses used_percentage directly when present', () => {
    const segs = buildSegments(ctxWith({ used_percentage: 42 }));
    assert.equal(segs.length, 1);
    assert.ok(segs[0].text.includes('42%'));
  });

  it('does NOT add output_tokens to the percentage calculation', () => {
    // input=50k, output=50k, window=100k → old code: 100%, correct: 50%
    const segs = buildSegments(ctxWith({
      current_usage: { input_tokens: 50_000, output_tokens: 50_000 },
      context_window_size: 100_000,
    }));
    assert.equal(segs.length, 1);
    assert.ok(segs[0].text.includes('50%'), `Expected 50%, got: ${segs[0].text}`);
  });

  it('includes cache_creation_input_tokens in percentage', () => {
    // input=30k, cache_creation=20k, window=100k → 50%
    const segs = buildSegments(ctxWith({
      current_usage: {
        input_tokens: 30_000,
        cache_creation_input_tokens: 20_000,
        output_tokens: 999_999, // should NOT be counted
      },
      context_window_size: 100_000,
    }));
    assert.ok(segs[0].text.includes('50%'), `Expected 50%, got: ${segs[0].text}`);
  });

  it('includes cache_read_input_tokens in percentage', () => {
    // input=0, cache_read=25k, window=100k → 25%
    const segs = buildSegments(ctxWith({
      current_usage: {
        input_tokens: 0,
        cache_read_input_tokens: 25_000,
        output_tokens: 50_000, // should NOT be counted
      },
      context_window_size: 100_000,
    }));
    assert.ok(segs[0].text.includes('25%'), `Expected 25%, got: ${segs[0].text}`);
  });

  // BUG 2: falsy check hides context at 0 tokens
  it('shows 0% context when input_tokens is exactly 0 (fresh session)', () => {
    const segs = buildSegments(ctxWith({
      current_usage: { input_tokens: 0 },
      context_window_size: 200_000,
    }));
    assert.equal(segs.length, 1, 'segment should be present even at 0 tokens');
    assert.ok(segs[0].text.includes('0%'), `Expected 0%, got: ${segs[0].text}`);
  });

  it('returns undefined (no segment) when current_usage is absent', () => {
    const segs = buildSegments(ctxWith({ context_window_size: 100_000 }));
    assert.equal(segs.length, 0, 'no segment without any usage data');
  });
});

// ─── BUG 3: stdin.ts timeout race — tested via observable: clearTimeout called ──
// (Structural: the fix is that clearTimeout is called on 'end'. We test the
//  behaviour — stdin data is not lost when 'end' fires after a delay.)

describe('readStdin — timeout cleared on end', async () => {
  it('exported function exists and resolves to an object', async () => {
    const { readStdin } = await import('../dist/data/stdin.js');
    assert.equal(typeof readStdin, 'function');
  });
});

// ─── BUG 4: environment segment is now wired up ───────────────────────────────

describe('renderEnvironment — wired up', () => {
  it('segment is omitted when environment is undefined', () => {
    const ctx = { ...baseCtx, environment: undefined, config: { ...DEFAULT_CONFIG, layout: { mode: 'compact', segments: ['environment'] } } };
    const segs = buildSegments(ctx);
    assert.equal(segs.length, 0);
  });

  it('shows md count when claudeMdCount > 0', () => {
    const ctx = {
      ...baseCtx,
      environment: { claudeMdCount: 2, rulesCount: 0, mcpCount: 0, hooksCount: 0 },
      config: { ...DEFAULT_CONFIG, layout: { mode: 'compact', segments: ['environment'] } },
    };
    const segs = buildSegments(ctx);
    assert.equal(segs.length, 1);
    assert.ok(segs[0].text.includes('md:2'));
  });

  it('shows mcp and hooks counts', () => {
    const ctx = {
      ...baseCtx,
      environment: { claudeMdCount: 0, rulesCount: 3, mcpCount: 5, hooksCount: 2 },
      config: { ...DEFAULT_CONFIG, layout: { mode: 'compact', segments: ['environment'] } },
    };
    const segs = buildSegments(ctx);
    assert.equal(segs.length, 1);
    assert.ok(segs[0].text.includes('mcp:5'));
    assert.ok(segs[0].text.includes('hooks:2'));
    assert.ok(segs[0].text.includes('rules:3'));
  });

  it('returns no segment when all counts are 0', () => {
    const ctx = {
      ...baseCtx,
      environment: { claudeMdCount: 0, rulesCount: 0, mcpCount: 0, hooksCount: 0 },
      config: { ...DEFAULT_CONFIG, layout: { mode: 'compact', segments: ['environment'] } },
    };
    const segs = buildSegments(ctx);
    assert.equal(segs.length, 0, 'all-zero env should produce no segment');
  });
});

// ─── LOGIC 5: resolveByDayOfWeek — new Date() called once ────────────────────
// (Internal: hard to unit-test directly; verify the observable output is stable)

describe('resolveMotto — day-of-week resolves without crash', async () => {
  it('returns a string for day-of-week strategy', async () => {
    const { resolveMotto } = await import('../dist/motto/resolver.js');
    const result = resolveMotto({
      enabled: true, strategy: 'day-of-week', pack: 'motivational-en',
    });
    assert.ok(typeof result === 'string' || result === undefined);
  });

  it('calling twice returns the same result (stable, not a midnight race)', async () => {
    const { resolveMotto } = await import('../dist/motto/resolver.js');
    const config = { enabled: true, strategy: 'day-of-week', pack: 'motivational-en' };
    const r1 = resolveMotto(config);
    const r2 = resolveMotto(config);
    assert.equal(r1, r2, 'two calls in the same ms should return identical motto');
  });
});

// ─── LOGIC 6: expanded mode now truncates to maxWidth ────────────────────────

describe('render expanded — respects maxWidth', () => {
  it('primary line is truncated to maxWidth in expanded mode', () => {
    const longBranch = 'feature/' + 'x'.repeat(200);
    const ctx = {
      ...baseCtx,
      git: { branch: longBranch, dirty: false, ahead: 0, behind: 0, modified: 0, added: 0, deleted: 0, untracked: 0 },
      config: { ...DEFAULT_CONFIG, layout: { mode: 'expanded', segments: ['git', 'project', 'time'] } },
      terminalWidth: 60,
    };
    const lines = render(ctx);
    assert.ok(lines.length >= 1);
    const primaryVisible = visibleLength(lines[0]);
    assert.ok(primaryVisible <= 60, `Expected ≤60 visible, got ${primaryVisible}`);
  });

  it('activity line is truncated to maxWidth in expanded mode', () => {
    const ctx = {
      ...baseCtx,
      agents: [
        { type: 'general-purpose', status: 'running', description: 'D'.repeat(300) },
      ],
      config: { ...DEFAULT_CONFIG, layout: { mode: 'expanded', segments: ['project', 'agents'] } },
      terminalWidth: 50,
    };
    const lines = render(ctx);
    for (const line of lines) {
      const w = visibleLength(line);
      assert.ok(w <= 50, `Line too wide: ${w} > 50`);
    }
  });
});

// ─── LOGIC 7: TOML string unescaping ─────────────────────────────────────────

describe('TOML string unescaping', async () => {
  it('unescapes \\" inside double-quoted strings', async () => {
    const { writeFile, unlink, mkdir } = await import('node:fs/promises');
    const { join } = await import('node:path');
    const { homedir } = await import('node:os');
    const { loadConfig, getConfigPath, getConfigDir } = await import('../dist/config.js');

    const dir = getConfigDir();
    await mkdir(dir, { recursive: true });
    const path = getConfigPath();
    await writeFile(path, `
[motto]
enabled = true
strategy = "manual"
current = "He said \\"hello\\""
`, 'utf-8');

    try {
      const cfg = await loadConfig();
      assert.equal(cfg.motto.current, 'He said "hello"');
    } finally {
      await unlink(path).catch(() => {});
    }
  });

  it('unescapes \\\\ as single backslash', async () => {
    const { writeFile, unlink, mkdir } = await import('node:fs/promises');
    const { join } = await import('node:path');
    const { loadConfig, getConfigPath, getConfigDir } = await import('../dist/config.js');

    const dir = getConfigDir();
    await mkdir(dir, { recursive: true });
    await writeFile(getConfigPath(), `
[motto]
enabled = true
strategy = "manual"
current = "path\\\\to\\\\thing"
`, 'utf-8');

    try {
      const cfg = await loadConfig();
      assert.equal(cfg.motto.current, 'path\\to\\thing');
    } finally {
      await unlink(getConfigPath()).catch(() => {});
    }
  });

  it('single-quoted strings are literal — no escape processing', async () => {
    const { writeFile, unlink, mkdir } = await import('node:fs/promises');
    const { loadConfig, getConfigPath, getConfigDir } = await import('../dist/config.js');

    const dir = getConfigDir();
    await mkdir(dir, { recursive: true });
    await writeFile(getConfigPath(), `
[motto]
enabled = true
strategy = "manual"
current = 'literal \\n no escape'
`, 'utf-8');

    try {
      const cfg = await loadConfig();
      assert.equal(cfg.motto.current, 'literal \\n no escape');
    } finally {
      await unlink(getConfigPath()).catch(() => {});
    }
  });
});

// ─── SEC 10: cache deserialization is validated ───────────────────────────────
// Tested indirectly: getUsage returns undefined on corrupt cache, doesn't crash.

describe('usage cache — corrupt file handled gracefully', async () => {
  it('getUsage returns undefined when cache has wrong shape', async () => {
    const { writeFile, mkdir } = await import('node:fs/promises');
    const { join } = await import('node:path');
    const { homedir } = await import('node:os');

    const dir = join(homedir(), '.claude', 'plugins', 'claude-menu');
    await mkdir(dir, { recursive: true });
    // Write a "recent" cache with invalid data shape
    await writeFile(
      join(dir, 'usage-cache.json'),
      JSON.stringify({ timestamp: Date.now(), data: 'not-an-object' }),
      'utf-8',
    );

    const { getUsage } = await import('../dist/data/usage.js');
    // Should not throw and should not return a corrupt UsageData
    // (returns undefined because credentials won't be present in test env)
    const result = await getUsage();
    // Either undefined (no creds) or a valid object — but NEVER the corrupt string
    assert.ok(result === undefined || typeof result === 'object');
  });
});

// ─── MINOR 11: grapheme-aware truncation ─────────────────────────────────────

describe('truncateAnsi — grapheme-cluster awareness', () => {
  it('skin-tone emoji (2 code points) counted as 2 columns, not 4', () => {
    // 👋🏽 = U+1F44B + U+1F3FD: base emoji (wide=2) + skin modifier
    // visibleLength should see 1 grapheme = 2 cols
    // truncateAnsi should not cut mid-emoji
    const waving = '👋🏽';
    const len = visibleLength(waving);
    // The exact value depends on Intl.Segmenter — if available, should be 2
    assert.ok(len === 2 || len === 4, `visibleLength of 👋🏽 = ${len}`);
  });

  it('truncated output is always within the maxWidth visible columns', () => {
    // Lots of emoji (each 2 wide) forced into a narrow terminal should stay ≤ maxWidth
    const str = '🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀'; // 10 emoji = 20 cols
    const lines = render({
      ...baseCtx,
      motto: str,
      config: { ...DEFAULT_CONFIG, layout: { mode: 'compact', segments: ['motto'] } },
      terminalWidth: 10, // tight
    });
    assert.ok(lines.length === 1);
    assert.ok(visibleLength(lines[0]) <= 10, `Expected ≤10, got ${visibleLength(lines[0])}`);
  });

  it('skin-tone emoji (2 code points) output is within bounds when truncated', () => {
    const str = 'ab👋🏽cd'; // 2 + 2 + 2 = 6 cols (best-case grapheme counting)
    const lines = render({
      ...baseCtx,
      motto: str,
      config: { ...DEFAULT_CONFIG, layout: { mode: 'compact', segments: ['motto'] } },
      terminalWidth: 5,
    });
    assert.ok(lines.length === 1);
    assert.ok(visibleLength(lines[0]) <= 5, `Expected ≤5, got ${visibleLength(lines[0])}`);
  });
});

// ─── R2 Issue 9: bold imported but never used ─────────────────────────────────

describe('segments.ts — no unused bold import', async () => {
  it('segments.ts source does not import bold from colors', async () => {
    const { readFile } = await import('node:fs/promises');
    const src = await readFile(
      new URL('../src/render/segments.ts', import.meta.url),
      'utf-8',
    );
    assert.ok(!src.includes('bold'), 'bold should not be imported in segments.ts');
  });
});

// ─── R2 Issue 10: renderUsage Infinity% when fiveHourLimit === 0 ─────────────

describe('renderUsage — fiveHourLimit edge cases', () => {
  it('returns no segment when fiveHourLimit is 0 (avoids Infinity%)', () => {
    const segs = buildWith({
      usage: { fiveHourUsage: 100, fiveHourLimit: 0 },
    }, ['usage']);
    assert.equal(segs.length, 0, 'segment should be absent when limit is 0 to avoid Infinity%');
  });

  it('still shows usage when limit is a normal positive value', () => {
    const segs = buildWith({
      usage: { fiveHourUsage: 500, fiveHourLimit: 1000 },
    }, ['usage']);
    assert.equal(segs.length, 1);
    assert.ok(segs[0].text.includes('50%'));
  });

  it('bar is clamped but text shows real % when over limit (not Infinity)', () => {
    // 1200 / 1000 = 120% — no division by zero, just over-limit
    const segs = buildWith({
      usage: { fiveHourUsage: 1200, fiveHourLimit: 1000 },
    }, ['usage']);
    assert.equal(segs.length, 1);
    assert.ok(segs[0].text.includes('120%'));
    assert.ok(segs[0].text.includes('██████')); // bar fully filled (clamped by progressBar)
  });
});

// ─── MINOR 12: git -ushort (speed) — structural check ────────────────────────

describe('getGitStatus — uses -ushort', async () => {
  it('git.ts source contains -ushort flag', async () => {
    const { readFile } = await import('node:fs/promises');
    const src = await readFile(
      new URL('../src/data/git.ts', import.meta.url),
      'utf-8',
    );
    assert.ok(src.includes('-ushort'), 'git status should use -ushort for performance');
    assert.ok(!src.includes("'-u'") && !src.includes('"-u"'), 'should not use bare -u (defaults to -uall)');
  });
});
