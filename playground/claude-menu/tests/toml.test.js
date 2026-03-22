// Tests for the TOML parser's inline comment handling.
// We test via loadConfig by temporarily writing to the actual config path,
// then restoring the original (or absence) afterwards.
//
// Since loadConfig reads from a fixed path (~/.claude/plugins/claude-menu/config.toml),
// we write temp configs there, load, then clean up.

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdir, unlink, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
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

describe('TOML parser — inline comment stripping', () => {
  before(async () => {
    // Save existing config if present
    try {
      originalContent = await readFile(configPath, 'utf-8');
    } catch {
      originalContent = null;
    }
  });

  after(async () => {
    // Restore original state
    if (originalContent !== null) {
      await writeFile(configPath, originalContent, 'utf-8');
    } else {
      await removeConfig();
    }
  });

  it('strips inline comment from double-quoted string value', async () => {
    await writeConfig(`
[theme]
name = "nord-frost"  # cool theme
`);
    const cfg = await loadConfig();
    assert.equal(cfg.theme.name, 'nord-frost');
  });

  it('strips inline comment from empty double-quoted string', async () => {
    await writeConfig(`
[theme]
name = "monochrome"
separator = ""  # Powerline arrow. Try "" for thin, "|" for pipe
`);
    const cfg = await loadConfig();
    // Separator should be empty string, NOT the comment text
    assert.equal(cfg.theme.separator, '');
  });

  it('strips inline comment after separator with spaces', async () => {
    await writeConfig(`
[theme]
name = "monochrome"
separator = ""            # Powerline arrow. Try "" for thin, "|" for pipe
`);
    const cfg = await loadConfig();
    assert.equal(cfg.theme.separator, '');
  });

  it('strips inline comment from boolean value', async () => {
    await writeConfig(`
[motto]
enabled = false  # disable motto
strategy = "manual"
`);
    const cfg = await loadConfig();
    assert.equal(cfg.motto.enabled, false);
  });

  it('strips inline comment from string with Powerline characters in comment', async () => {
    await writeConfig(`
[theme]
name = "dracula"
separator = "|"  # use pipe instead of
`);
    const cfg = await loadConfig();
    assert.equal(cfg.theme.separator, '|');
  });

  it('strips inline comment from array value', async () => {
    await writeConfig(`
[layout]
mode = "compact"  # single line
segments = ["git", "model"]  # reduced set
`);
    const cfg = await loadConfig();
    assert.equal(cfg.layout.mode, 'compact');
    assert.deepEqual(cfg.layout.segments, ['git', 'model']);
  });

  it('preserves # inside a quoted string value', async () => {
    await writeConfig(`
[motto]
enabled = true
strategy = "manual"
current = "fix #123"
`);
    const cfg = await loadConfig();
    assert.equal(cfg.motto.current, 'fix #123');
  });

  it('handles value with no comment', async () => {
    await writeConfig(`
[theme]
name = "catppuccin"
`);
    const cfg = await loadConfig();
    assert.equal(cfg.theme.name, 'catppuccin');
  });

  it('returns DEFAULT_CONFIG when config file does not exist', async () => {
    await removeConfig();
    const cfg = await loadConfig();
    // Should return defaults, not throw
    assert.ok(cfg.theme.name);
    assert.ok(Array.isArray(cfg.layout.segments));
  });

  it('handles full config.example.toml-style with many inline comments', async () => {
    await writeConfig(`
[theme]
name = "pastel-rainbow"
separator = ""            # Powerline arrow. Try "" for thin, "|" for pipe

[layout]
mode = "expanded"
segments = ["motto", "project", "git", "model", "context", "time"]

[motto]
enabled = true
strategy = "day-of-week"    # or: random, sequential, time-of-day, manual
pack = "motivational-en"    # motivational-en, chill-zh, dev-humor, zen, startup-energy
emoji = true
`);
    const cfg = await loadConfig();
    assert.equal(cfg.theme.name, 'pastel-rainbow');
    assert.equal(cfg.theme.separator, '');
    assert.equal(cfg.layout.mode, 'expanded');
    assert.equal(cfg.layout.segments.length, 6);
    assert.equal(cfg.motto.strategy, 'day-of-week');
    assert.equal(cfg.motto.pack, 'motivational-en');
    assert.equal(cfg.motto.enabled, true);
  });
});
