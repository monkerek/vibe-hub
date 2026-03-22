// Direct unit tests for the TOML parser's core functions.
// These test parseTomlValue, unescapeTomlString, and extractTomlValue in isolation
// via the loadConfig integration path, focusing on edge cases the existing
// toml.test.js (which only tests inline comment stripping) does not cover.
//
// We exercise the functions indirectly through loadConfig since the internal
// parser functions are not exported. Each test writes a minimal TOML file and
// asserts the resulting parsed value.

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdir, unlink, readFile } from 'node:fs/promises';
import { loadConfig, getConfigPath, getConfigDir } from '../dist/config.js';

const configPath = getConfigPath();
const configDir = getConfigDir();

let originalContent = null;

async function writeConfig(toml) {
  await mkdir(configDir, { recursive: true });
  await writeFile(configPath, toml, 'utf-8');
}

async function removeConfig() {
  try { await unlink(configPath); } catch { /* didn't exist */ }
}

before(async () => {
  try {
    originalContent = await readFile(configPath, 'utf-8');
  } catch {
    originalContent = null;
  }
});

after(async () => {
  if (originalContent !== null) {
    await writeFile(configPath, originalContent, 'utf-8');
  } else {
    await removeConfig();
  }
});

describe('unescapeTomlString — escape sequences', () => {
  it('handles double-backslash (\\\\) without corrupting following characters', async () => {
    // The single-pass bug: if \\ was replaced first (→ \), then \t would
    // be re-processed, turning \\t into a tab. Must stay as backslash + t.
    await writeConfig(`
[motto]
strategy = "manual"
current = "path\\\\to\\\\file"
`);
    const cfg = await loadConfig();
    assert.equal(cfg.motto.current, 'path\\to\\file');
  });

  it('handles escaped double-quote (\\") inside string', async () => {
    await writeConfig(`
[motto]
strategy = "manual"
current = "say \\"hello\\""
`);
    const cfg = await loadConfig();
    assert.equal(cfg.motto.current, 'say "hello"');
  });

  it('handles \\n (newline escape) in string', async () => {
    await writeConfig(`
[motto]
strategy = "manual"
current = "line1\\nline2"
`);
    const cfg = await loadConfig();
    assert.equal(cfg.motto.current, 'line1\nline2');
  });

  it('handles \\t (tab escape) in string', async () => {
    await writeConfig(`
[motto]
strategy = "manual"
current = "col1\\tcol2"
`);
    const cfg = await loadConfig();
    assert.equal(cfg.motto.current, 'col1\tcol2');
  });

  it('handles \\uXXXX unicode escape', async () => {
    await writeConfig(`
[motto]
strategy = "manual"
current = "smile \\u263A"
`);
    const cfg = await loadConfig();
    assert.equal(cfg.motto.current, 'smile ☺');
  });

  it('does not corrupt \\\\ followed by t (the double-backslash regression)', async () => {
    // This specifically tests the single-pass guarantee: \\t must NOT become \t (tab).
    await writeConfig(`
[motto]
strategy = "manual"
current = "a\\\\tb"
`);
    const cfg = await loadConfig();
    // \\t in TOML source = literal backslash + t, not a tab
    assert.equal(cfg.motto.current, 'a\\tb');
    assert.notEqual(cfg.motto.current, 'a\tb');
  });
});

describe('extractTomlValue — inline array parsing', () => {
  it('handles array with quoted strings containing commas', async () => {
    await writeConfig(`
[layout]
segments = ["motto,project", "git"]
`);
    const cfg = await loadConfig();
    assert.equal(cfg.layout.segments.length, 2);
    assert.equal(cfg.layout.segments[0], 'motto,project');
    assert.equal(cfg.layout.segments[1], 'git');
  });

  it('handles array with quoted strings containing # (hash)', async () => {
    await writeConfig(`
[layout]
segments = ["motto#1", "git"]
`);
    const cfg = await loadConfig();
    assert.equal(cfg.layout.segments.length, 2);
    assert.equal(cfg.layout.segments[0], 'motto#1');
  });

  it('handles empty array', async () => {
    await writeConfig(`
[layout]
segments = []
`);
    const cfg = await loadConfig();
    assert.deepEqual(cfg.layout.segments, []);
  });

  it('parses single-quoted strings in arrays (literal strings, no escapes)', async () => {
    await writeConfig(`
[layout]
segments = ['git', 'model']
`);
    const cfg = await loadConfig();
    assert.deepEqual(cfg.layout.segments, ['git', 'model']);
  });
});

describe('parseTomlValue — scalar types', () => {
  it('parses boolean true', async () => {
    await writeConfig(`
[motto]
enabled = true
`);
    const cfg = await loadConfig();
    assert.equal(cfg.motto.enabled, true);
    assert.strictEqual(typeof cfg.motto.enabled, 'boolean');
  });

  it('parses boolean false', async () => {
    await writeConfig(`
[motto]
enabled = false
`);
    const cfg = await loadConfig();
    assert.equal(cfg.motto.enabled, false);
    assert.strictEqual(typeof cfg.motto.enabled, 'boolean');
  });

  it('parses separator = "\\\\" as a single backslash', async () => {
    // Edge case: separator value of a single backslash character
    await writeConfig(`
[theme]
name = "monochrome"
separator = "\\\\"
`);
    const cfg = await loadConfig();
    assert.equal(cfg.theme.separator, '\\');
  });
});

describe('parseToml — nested sections', () => {
  it('parses [motto.dayOfWeek] subsection keys', async () => {
    // Tests that section nesting via dot notation is correctly handled
    await writeConfig(`
[motto]
strategy = "day-of-week"

[motto.dayOfWeek]
monday = "Start strong"
friday = "Almost there"
`);
    const cfg = await loadConfig();
    assert.equal(cfg.motto.strategy, 'day-of-week');
    // dayOfWeek sub-object should be parsed under motto
    assert.ok(cfg.motto.dayOfWeek, 'dayOfWeek subsection should exist');
    assert.equal(cfg.motto.dayOfWeek.monday, 'Start strong');
    assert.equal(cfg.motto.dayOfWeek.friday, 'Almost there');
  });
});
