import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  fgColor,
  bgColor,
  bold,
  dim,
  reset,
  stripAnsi,
  visibleLength,
  progressBar,
} from '../dist/render/colors.js';

describe('fgColor', () => {
  it('generates truecolor foreground escape for red', () => {
    assert.ok(fgColor('#ff0000').includes('38;2;255;0;0'));
  });

  it('generates truecolor foreground escape for green', () => {
    assert.ok(fgColor('#00ff00').includes('38;2;0;255;0'));
  });

  it('generates truecolor foreground for blue', () => {
    assert.ok(fgColor('#0000ff').includes('38;2;0;0;255'));
  });

  it('generates truecolor foreground for white', () => {
    assert.ok(fgColor('#ffffff').includes('38;2;255;255;255'));
  });

  it('generates truecolor foreground for black', () => {
    assert.ok(fgColor('#000000').includes('38;2;0;0;0'));
  });

  it('generates correct RGB for mixed hex', () => {
    // #1a2b3c => r=26, g=43, b=60
    assert.ok(fgColor('#1a2b3c').includes('38;2;26;43;60'));
  });

  it('starts with ESC[', () => {
    assert.ok(fgColor('#ffffff').startsWith('\x1b['));
  });

  it('ends with m', () => {
    assert.ok(fgColor('#000000').endsWith('m'));
  });
});

describe('bgColor', () => {
  it('generates truecolor background escape for blue', () => {
    assert.ok(bgColor('#0000ff').includes('48;2;0;0;255'));
  });

  it('generates truecolor background for white', () => {
    assert.ok(bgColor('#ffffff').includes('48;2;255;255;255'));
  });

  it('generates truecolor background for black', () => {
    assert.ok(bgColor('#000000').includes('48;2;0;0;0'));
  });

  it('generates correct RGB for mixed hex', () => {
    // #a6e3a1 => r=166, g=227, b=161
    assert.ok(bgColor('#a6e3a1').includes('48;2;166;227;161'));
  });

  it('starts with ESC[', () => {
    assert.ok(bgColor('#ffffff').startsWith('\x1b['));
  });

  it('ends with m', () => {
    assert.ok(bgColor('#000000').endsWith('m'));
  });

  it('differs from fgColor for same input', () => {
    assert.notEqual(fgColor('#ff0000'), bgColor('#ff0000'));
  });
});

describe('bold', () => {
  it('returns bold ANSI escape', () => {
    assert.equal(bold(), '\x1b[1m');
  });
});

describe('dim', () => {
  it('returns dim ANSI escape', () => {
    assert.equal(dim(), '\x1b[2m');
  });
});

describe('reset', () => {
  it('returns reset ANSI escape', () => {
    assert.equal(reset(), '\x1b[0m');
  });
});

describe('stripAnsi (extended)', () => {
  it('removes standard foreground color codes', () => {
    assert.equal(stripAnsi('\x1b[38;2;255;0;0mhello\x1b[0m'), 'hello');
  });

  it('removes background color codes', () => {
    assert.equal(stripAnsi('\x1b[48;2;0;255;0mworld\x1b[0m'), 'world');
  });

  it('removes multiple consecutive escape sequences', () => {
    const input = '\x1b[1m\x1b[38;2;255;0;0mhello\x1b[0m world\x1b[0m';
    assert.equal(stripAnsi(input), 'hello world');
  });

  it('handles empty string', () => {
    assert.equal(stripAnsi(''), '');
  });

  it('returns plain text unchanged', () => {
    assert.equal(stripAnsi('hello world'), 'hello world');
  });

  it('handles string with only ANSI codes', () => {
    assert.equal(stripAnsi('\x1b[0m\x1b[1m'), '');
  });

  it('handles bold escape in text', () => {
    assert.equal(stripAnsi('\x1b[1mbold\x1b[0m'), 'bold');
  });

  it('handles dim escape in text', () => {
    assert.equal(stripAnsi('\x1b[2mdim\x1b[0m'), 'dim');
  });

  it('preserves special chars after stripping', () => {
    assert.equal(stripAnsi('\x1b[0m←→↑↓\x1b[0m'), '←→↑↓');
  });
});

describe('visibleLength (extended)', () => {
  it('counts ASCII correctly', () => {
    assert.equal(visibleLength('hello'), 5);
  });

  it('returns 0 for empty string', () => {
    assert.equal(visibleLength(''), 0);
  });

  it('returns 0 for ANSI-only string', () => {
    assert.equal(visibleLength('\x1b[31m\x1b[0m'), 0);
  });

  it('ignores ANSI codes in mixed string', () => {
    assert.equal(visibleLength('\x1b[31mhi\x1b[0m'), 2);
  });

  it('counts CJK character as 2 wide', () => {
    assert.equal(visibleLength('中'), 2);
  });

  it('counts multiple CJK characters', () => {
    assert.equal(visibleLength('中文'), 4);
  });

  it('counts mixed ASCII and CJK', () => {
    // 'hi中' = 2 ASCII + 2 CJK = 4
    assert.equal(visibleLength('hi中'), 4);
  });

  it('handles CJK with ANSI codes', () => {
    // ANSI + 2 ASCII + 2 CJK + ANSI = 4 visible
    assert.equal(visibleLength('\x1b[31mhi中\x1b[0m'), 4);
  });

  it('counts Hangul as 2 wide', () => {
    // 한 is Hangul (U+D55C)
    assert.equal(visibleLength('한'), 2);
  });

  it('counts spaces as 1', () => {
    assert.equal(visibleLength('   '), 3);
  });
});

describe('progressBar (extended)', () => {
  it('renders 0% as all empty', () => {
    assert.equal(progressBar(0, 10), '░░░░░░░░░░');
  });

  it('renders 100% as all filled', () => {
    assert.equal(progressBar(100, 10), '██████████');
  });

  it('renders 50% as half filled', () => {
    assert.equal(progressBar(50, 10), '█████░░░░░');
  });

  it('clamps below 0 to 0', () => {
    assert.equal(progressBar(-10, 10), '░░░░░░░░░░');
  });

  it('clamps above 100 to 100', () => {
    assert.equal(progressBar(200, 10), '██████████');
  });

  it('uses custom fill character', () => {
    assert.equal(progressBar(100, 4, '#', '-'), '####');
  });

  it('uses custom empty character', () => {
    assert.equal(progressBar(0, 4, '#', '-'), '----');
  });

  it('uses both custom characters', () => {
    assert.equal(progressBar(50, 4, '#', '-'), '##--');
  });

  it('handles width of 1', () => {
    assert.equal(progressBar(50, 1), '█');
    assert.equal(progressBar(0, 1), '░');
  });

  it('handles width of 0 (empty string)', () => {
    assert.equal(progressBar(50, 0), '');
  });

  it('renders 25% correctly with width 8', () => {
    assert.equal(progressBar(25, 8), '██░░░░░░');
  });

  it('renders 75% correctly with width 8', () => {
    assert.equal(progressBar(75, 8), '██████░░');
  });

  it('output length equals width', () => {
    for (const width of [1, 5, 8, 10, 20]) {
      assert.equal(progressBar(50, width).length, width);
    }
  });
});
