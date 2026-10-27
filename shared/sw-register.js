// Registers the root service worker. A new version only reloads the page on the hub,
// never mid-activity.
export async function registerSW() {
  if (!('serviceWorker' in navigator)) return null;
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloaded || document.body.dataset.hub !== 'true') return;
    reloaded = true;
    location.reload();
  });
  try {
    const reg = await navigator.serviceWorker.register(new URL('../sw.js', import.meta.url));
    reg.update().catch(() => {});
    return reg;
  } catch {
    return null;
  }
}
