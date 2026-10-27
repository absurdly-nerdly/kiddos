import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProgress, defaults, SCHEMA } from '../shared/progress.js';

function stubStorage() {
  const m = new Map();
  return {
    get length() { return m.size; },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k),
  };
}

test('load returns defaults when nothing saved', () => {
  const p = createProgress(stubStorage());
  assert.deepEqual(p.load('a'), defaults());
});

test('save/update round-trips and stamps updatedAt', () => {
  const p = createProgress(stubStorage());
  p.update('a', { level: 2, round: 3, stars: 7 });
  const s = p.load('a');
  assert.equal(s.level, 2);
  assert.equal(s.round, 3);
  assert.equal(s.stars, 7);
  assert.ok(s.updatedAt > 0);
});

test('migrate upgrades old/partial saves and survives corrupt data', () => {
  const st = stubStorage();
  st.setItem('kiddos:v1:a', JSON.stringify({ schema: 0, level: 4 }));
  st.setItem('kiddos:v1:b', '{not json');
  const p = createProgress(st);
  assert.equal(p.load('a').level, 4);
  assert.equal(p.load('a').schema, SCHEMA);
  assert.equal(p.load('a').stars, 0);
  assert.deepEqual(p.load('b'), defaults());
});

test('reset clears one app only', () => {
  const p = createProgress(stubStorage());
  p.update('a', { stars: 1 });
  p.update('b', { stars: 2 });
  p.reset('a');
  assert.equal(p.load('a').stars, 0);
  assert.equal(p.load('b').stars, 2);
});

test('export/import round-trips every app into a fresh store', () => {
  const p1 = createProgress(stubStorage());
  p1.update('a', { level: 3, stars: 9 });
  p1.update('b', { level: 1, stars: 2 });
  const code = p1.exportAll();
  const p2 = createProgress(stubStorage());
  assert.deepEqual(p2.importAll(code).sort(), ['a', 'b']);
  assert.equal(p2.load('a').level, 3);
  assert.equal(p2.load('b').stars, 2);
});

test('import rejects garbage', () => {
  const p = createProgress(stubStorage());
  assert.throws(() => p.importAll('not-a-code'));
  assert.throws(() => p.importAll(btoa(JSON.stringify({ hello: 1 }))));
});
