// Network-first so every push reaches the tablet on the next online launch;
// falls back to cache offline or when the network is slow. No version bumps needed
// for content changes. Bump CACHE only to force-drop old caches.
const CACHE = 'kiddos-v1';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
  'shared/apps.js', 'shared/progress.js', 'shared/speak.js', 'shared/parent.js', 'shared/sw-register.js', 'shared/ui.css',
  'apps/counting/', 'apps/counting/index.html', 'apps/counting/app.js', 'apps/counting/levels.js',
];
const TIMEOUT_MS = 3000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(SHELL.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {}))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await Promise.race([
      fetch(request, { cache: 'no-cache' }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)),
    ]);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(request, { ignoreSearch: true });
    if (hit) return hit;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(networkFirst(request));
});
