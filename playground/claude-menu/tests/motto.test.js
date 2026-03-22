import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveMotto } from '../dist/motto/resolver.js';
import { getPackByName, getAllPackNames, MOTTO_PACKS } from '../dist/motto/packs.js';

describe('motto packs', () => {
  it('has at least 5 built-in packs', () => {
    assert.ok(MOTTO_PACKS.length >= 5);
  });

  it('can find packs by name', () => {
    const pack = getPackByName('motivational-en');
    assert.ok(pack);
    assert.equal(pack.name, 'motivational-en');
    assert.ok(pack.mottos.length >= 5);
  });

  it('returns undefined for unknown pack', () => {
    assert.equal(getPackByName('nonexistent'), undefined);
  });

  it('getAllPackNames returns all pack names', () => {
    const names = getAllPackNames();
    assert.ok(names.includes('motivational-en'));
    assert.ok(names.includes('chill-zh'));
    assert.ok(names.includes('dev-humor'));
    assert.ok(names.includes('zen'));
    assert.ok(names.includes('startup-energy'));
  });
});

describe('resolveMotto', () => {
  it('returns undefined when disabled', () => {
    assert.equal(resolveMotto({ enabled: false, strategy: 'random' }), undefined);
  });

  it('returns manual motto when strategy is manual', () => {
    const result = resolveMotto({
      enabled: true,
      strategy: 'manual',
      current: 'Hello World',
    });
    assert.equal(result, 'Hello World');
  });

  it('returns a motto from pack with random strategy', () => {
    const result = resolveMotto({
      enabled: true,
      strategy: 'random',
      pack: 'motivational-en',
    });
    assert.ok(result);
    assert.ok(typeof result === 'string');
  });

  it('returns a motto with day-of-week strategy', () => {
    const result = resolveMotto({
      enabled: true,
      strategy: 'day-of-week',
      pack: 'dev-humor',
    });
    assert.ok(result);
  });

  it('prefers custom mottos over pack', () => {
    const customs = ['Custom Motto 1', 'Custom Motto 2'];
    const result = resolveMotto({
      enabled: true,
      strategy: 'random',
      pack: 'motivational-en',
      custom: customs,
    });
    assert.ok(customs.includes(result));
  });

  it('supports sequential strategy', () => {
    const result = resolveMotto({
      enabled: true,
      strategy: 'sequential',
      pack: 'zen',
    });
    assert.ok(result);
  });

  it('supports time-of-day strategy', () => {
    const result = resolveMotto({
      enabled: true,
      strategy: 'time-of-day',
      pack: 'startup-energy',
    });
    assert.ok(result);
  });
});
