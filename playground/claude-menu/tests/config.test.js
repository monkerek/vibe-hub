import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CONFIG, resolveSegmentStyle, getThemeSeparator } from '../dist/config.js';

describe('config', () => {
  describe('DEFAULT_CONFIG', () => {
    it('has pastel-rainbow theme by default', () => {
      assert.equal(DEFAULT_CONFIG.theme.name, 'pastel-rainbow');
    });

    it('has expanded layout by default', () => {
      assert.equal(DEFAULT_CONFIG.layout.mode, 'expanded');
    });

    it('has motto enabled by default', () => {
      assert.equal(DEFAULT_CONFIG.motto.enabled, true);
      assert.equal(DEFAULT_CONFIG.motto.strategy, 'day-of-week');
    });

    it('has default segments', () => {
      assert.ok(DEFAULT_CONFIG.layout.segments.includes('motto'));
      assert.ok(DEFAULT_CONFIG.layout.segments.includes('project'));
      assert.ok(DEFAULT_CONFIG.layout.segments.includes('git'));
      assert.ok(DEFAULT_CONFIG.layout.segments.includes('model'));
      assert.ok(DEFAULT_CONFIG.layout.segments.includes('context'));
    });
  });

  describe('resolveSegmentStyle', () => {
    it('returns built-in theme style for known segment', () => {
      const style = resolveSegmentStyle({ name: 'pastel-rainbow' }, 'motto');
      assert.ok(style.fg);
      assert.ok(style.bg);
    });

    it('returns fallback for unknown theme', () => {
      const style = resolveSegmentStyle({ name: 'nonexistent' }, 'motto');
      assert.equal(style.fg, '#ffffff');
      assert.equal(style.bg, '#555555');
    });

    it('applies user overrides over built-in', () => {
      const style = resolveSegmentStyle(
        { name: 'pastel-rainbow', segments: { motto: { bg: '#ff0000' } } },
        'motto',
      );
      assert.equal(style.bg, '#ff0000');
    });
  });

  describe('getThemeSeparator', () => {
    it('returns configured separator', () => {
      assert.equal(getThemeSeparator({ name: 'test', separator: '' }), '');
    });

    it('defaults to  when not specified', () => {
      assert.equal(getThemeSeparator({ name: 'test' }), '');
    });
  });
});
