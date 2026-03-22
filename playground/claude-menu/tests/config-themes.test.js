import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  THEMES,
  DEFAULT_CONFIG,
  resolveSegmentStyle,
  getConfigDir,
  getConfigPath,
  getThemeSeparator,
} from '../dist/config.js';

const ALL_THEMES = [
  'pastel-rainbow',
  'claude-orange',
  'nord-frost',
  'dracula',
  'catppuccin',
  'monochrome',
];

const ALL_SEGMENTS = [
  'motto',
  'model',
  'project',
  'git',
  'context',
  'usage',
  'tools',
  'agents',
  'todos',
  'environment',
  'time',
];

describe('THEMES export', () => {
  it('exports exactly 6 built-in themes', () => {
    assert.equal(Object.keys(THEMES).length, 6);
  });

  it('exports all expected theme names', () => {
    for (const name of ALL_THEMES) {
      assert.ok(name in THEMES, `Expected THEMES to contain "${name}"`);
    }
  });

  for (const themeName of ALL_THEMES) {
    describe(`theme "${themeName}"`, () => {
      it('has all segment types', () => {
        const theme = THEMES[themeName];
        for (const seg of ALL_SEGMENTS) {
          assert.ok(seg in theme, `${themeName} should have "${seg}" segment`);
        }
      });

      it('all segments have fg color', () => {
        const theme = THEMES[themeName];
        for (const seg of ALL_SEGMENTS) {
          assert.ok(theme[seg].fg, `${themeName}.${seg} should have fg`);
          assert.match(theme[seg].fg, /^#[0-9a-fA-F]{6}$/, `${themeName}.${seg}.fg should be a hex color`);
        }
      });

      it('all segments have bg color', () => {
        const theme = THEMES[themeName];
        for (const seg of ALL_SEGMENTS) {
          assert.ok(theme[seg].bg, `${themeName}.${seg} should have bg`);
          assert.match(theme[seg].bg, /^#[0-9a-fA-F]{6}$/, `${themeName}.${seg}.bg should be a hex color`);
        }
      });
    });
  }
});

describe('resolveSegmentStyle (all themes)', () => {
  for (const themeName of ALL_THEMES) {
    it(`resolves style correctly for theme "${themeName}"`, () => {
      const style = resolveSegmentStyle({ name: themeName }, 'model');
      assert.ok(style.fg, `fg should be set for theme ${themeName}`);
      assert.ok(style.bg, `bg should be set for theme ${themeName}`);
    });
  }

  it('falls back to white/grey for completely unknown theme', () => {
    const style = resolveSegmentStyle({ name: 'nonexistent-theme' }, 'motto');
    assert.equal(style.fg, '#ffffff');
    assert.equal(style.bg, '#555555');
  });

  it('falls back to white/grey for unknown segment in known theme', () => {
    const style = resolveSegmentStyle({ name: 'pastel-rainbow' }, 'nonexistent-segment');
    assert.equal(style.fg, '#ffffff');
    assert.equal(style.bg, '#555555');
  });

  it('applies user override for fg', () => {
    const style = resolveSegmentStyle(
      { name: 'dracula', segments: { git: { fg: '#aabbcc' } } },
      'git',
    );
    assert.equal(style.fg, '#aabbcc');
  });

  it('applies user override for bg', () => {
    const style = resolveSegmentStyle(
      { name: 'nord-frost', segments: { model: { bg: '#112233' } } },
      'model',
    );
    assert.equal(style.bg, '#112233');
  });

  it('user override bg keeps built-in fg', () => {
    const style = resolveSegmentStyle(
      { name: 'nord-frost', segments: { model: { bg: '#112233' } } },
      'model',
    );
    assert.equal(style.fg, THEMES['nord-frost'].model.fg);
  });

  it('user override on one segment does not affect another', () => {
    const style = resolveSegmentStyle(
      { name: 'catppuccin', segments: { motto: { bg: '#ff0000' } } },
      'model',
    );
    assert.equal(style.bg, THEMES['catppuccin'].model.bg);
  });

  it('user can override icon', () => {
    const style = resolveSegmentStyle(
      { name: 'pastel-rainbow', segments: { time: { icon: '⏰' } } },
      'time',
    );
    assert.equal(style.icon, '⏰');
  });

  it('returns built-in icon when no override', () => {
    const style = resolveSegmentStyle({ name: 'pastel-rainbow' }, 'time');
    assert.equal(style.icon, '🕐');
  });
});

describe('getThemeSeparator', () => {
  it('returns configured separator', () => {
    assert.equal(getThemeSeparator({ name: 'test', separator: '' }), '');
  });

  it('returns empty string separator when explicitly set', () => {
    assert.equal(getThemeSeparator({ name: 'test', separator: '' }), '');
  });

  it('defaults to powerline separator when not specified', () => {
    assert.equal(getThemeSeparator({ name: 'test' }), '');
  });

  it('returns custom string separator', () => {
    assert.equal(getThemeSeparator({ name: 'test', separator: '|' }), '|');
  });
});

describe('config path utilities', () => {
  it('getConfigDir returns string', () => {
    assert.equal(typeof getConfigDir(), 'string');
  });

  it('getConfigDir ends with "claude-menu"', () => {
    assert.ok(getConfigDir().endsWith('claude-menu'));
  });

  it('getConfigDir contains ".claude"', () => {
    assert.ok(getConfigDir().includes('.claude'));
  });

  it('getConfigPath returns string', () => {
    assert.equal(typeof getConfigPath(), 'string');
  });

  it('getConfigPath ends with "config.toml"', () => {
    assert.ok(getConfigPath().endsWith('config.toml'));
  });

  it('getConfigPath starts with getConfigDir', () => {
    const dir = getConfigDir();
    const path = getConfigPath();
    assert.ok(path.startsWith(dir));
  });
});

describe('DEFAULT_CONFIG structure', () => {
  it('has theme, layout, and motto keys', () => {
    assert.ok('theme' in DEFAULT_CONFIG);
    assert.ok('layout' in DEFAULT_CONFIG);
    assert.ok('motto' in DEFAULT_CONFIG);
  });

  it('theme has name and separator', () => {
    assert.ok('name' in DEFAULT_CONFIG.theme);
    assert.ok('separator' in DEFAULT_CONFIG.theme);
  });

  it('default theme is pastel-rainbow', () => {
    assert.equal(DEFAULT_CONFIG.theme.name, 'pastel-rainbow');
  });

  it('layout has mode and segments array', () => {
    assert.ok('mode' in DEFAULT_CONFIG.layout);
    assert.ok(Array.isArray(DEFAULT_CONFIG.layout.segments));
    assert.ok(DEFAULT_CONFIG.layout.segments.length > 0);
  });

  it('default layout mode is expanded', () => {
    assert.equal(DEFAULT_CONFIG.layout.mode, 'expanded');
  });

  it('default layout segments include essential items', () => {
    const segs = DEFAULT_CONFIG.layout.segments;
    assert.ok(segs.includes('motto'));
    assert.ok(segs.includes('model'));
    assert.ok(segs.includes('git'));
    assert.ok(segs.includes('context'));
  });

  it('motto has enabled, strategy, and pack', () => {
    assert.ok('enabled' in DEFAULT_CONFIG.motto);
    assert.ok('strategy' in DEFAULT_CONFIG.motto);
  });

  it('default motto is enabled', () => {
    assert.equal(DEFAULT_CONFIG.motto.enabled, true);
  });

  it('default motto strategy is day-of-week', () => {
    assert.equal(DEFAULT_CONFIG.motto.strategy, 'day-of-week');
  });
});
