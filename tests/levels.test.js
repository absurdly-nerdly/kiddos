import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, makeRound, makeChoices } from '../apps/counting/levels.js';

const TRIALS = 500;

test('every level generates valid rounds', () => {
  for (const level of LEVELS) {
    for (let i = 0; i < TRIALS; i++) {
      const r = makeRound(level);
      if (r.kind === 'more') {
        const [a, b] = r.groups.map((g) => g.count);
        assert.notEqual(a, b);
        assert.ok(a >= level.min && a <= level.max && b >= level.min && b <= level.max);
        assert.equal(r.answer, a > b ? 0 : 1);
        continue;
      }
      assert.ok(r.answer >= level.min && r.answer <= level.max);
      assert.equal(r.choices.length, 3);
      assert.equal(new Set(r.choices).size, 3);
      assert.ok(r.choices.includes(r.answer));
      assert.ok(r.choices.every((n) => Number.isInteger(n) && n >= 1));
      if (r.kind === 'count') assert.equal(r.count, r.answer);
    }
  }
});

test('makeChoices works at the smallest range', () => {
  for (let i = 0; i < TRIALS; i++) {
    const c = makeChoices(1, 3);
    assert.equal(new Set(c).size, 3);
    assert.ok(c.includes(1));
  }
});
