// Per-app progress in localStorage. Storage is injected so tests can use a stub.
export const SCHEMA = 1;
const PREFIX = 'kiddos:v1:';

export const defaults = () => ({ schema: SCHEMA, level: 0, round: 0, stars: 0, unlocked: 0, updatedAt: 0 });

// Upgrade older/foreign save shapes to the current schema. Add a step per schema bump.
export function migrate(state) {
  if (!state || typeof state !== 'object') return defaults();
  const out = { ...defaults(), ...state };
  out.schema = SCHEMA;
  return out;
}

function memoryStorage() {
  const m = new Map();
  return {
    get length() { return m.size; },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k),
  };
}

function defaultStorage() {
  try {
    const s = globalThis.localStorage;
    s.setItem('kiddos:probe', '1');
    s.removeItem('kiddos:probe');
    return s;
  } catch {
    return memoryStorage(); // private mode / blocked storage: play on, just don't persist
  }
}

const encode = (obj) => btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
const decode = (code) => JSON.parse(decodeURIComponent(escape(atob(code.trim()))));

export function createProgress(storage = defaultStorage()) {
  const keyFor = (appId) => PREFIX + appId;

  function load(appId) {
    try {
      const raw = storage.getItem(keyFor(appId));
      return migrate(raw ? JSON.parse(raw) : null);
    } catch {
      return defaults();
    }
  }

  function save(appId, state) {
    const next = { ...migrate(state), updatedAt: Date.now() };
    storage.setItem(keyFor(appId), JSON.stringify(next));
    return next;
  }

  const update = (appId, patch) => save(appId, { ...load(appId), ...patch });
  const reset = (appId) => storage.removeItem(keyFor(appId));

  function allKeys() {
    const keys = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    return keys;
  }

  // Backup code: copy it somewhere private; paste it back to restore.
  function exportAll() {
    const data = {};
    for (const k of allKeys()) data[k.slice(PREFIX.length)] = load(k.slice(PREFIX.length));
    return encode({ kiddos: 1, data });
  }

  function importAll(code) {
    const parsed = decode(code);
    if (!parsed || parsed.kiddos !== 1 || typeof parsed.data !== 'object') throw new Error('Not a Kiddos backup code');
    for (const [appId, state] of Object.entries(parsed.data)) save(appId, state);
    return Object.keys(parsed.data);
  }

  return { load, save, update, reset, exportAll, importAll };
}

// Ask Android not to evict our storage under pressure.
export async function requestPersistence() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist();
  } catch { /* best effort */ }
}

export const progress = createProgress();
