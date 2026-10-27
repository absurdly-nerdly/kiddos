// Parent gate: hold the corner gear 3s, then solve a two-digit sum. Opens the parent panel.
import { APPS } from './apps.js';
import { progress } from './progress.js';

const HOLD_MS = 3000;

function el(tag, props = {}, ...kids) {
  const n = Object.assign(document.createElement(tag), props);
  n.append(...kids);
  return n;
}

export function mountParentGear(parent = document.body) {
  const gear = el('button', { className: 'gear', type: 'button', ariaLabel: 'Parent settings', textContent: '⚙️' });
  let timer;
  const start = (e) => { e.preventDefault(); gear.classList.add('holding'); timer = setTimeout(openGate, HOLD_MS); };
  const stop = () => { clearTimeout(timer); gear.classList.remove('holding'); };
  gear.addEventListener('pointerdown', start);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => gear.addEventListener(ev, stop));
  gear.addEventListener('contextmenu', (e) => e.preventDefault());
  parent.append(gear);
  return gear;
}

function modal(...kids) {
  const box = el('div', { className: 'modal-box' }, ...kids);
  const back = el('div', { className: 'modal' }, box);
  document.body.append(back);
  return { box, close: () => back.remove() };
}

function openGate() {
  const a = 20 + Math.floor(Math.random() * 60);
  const b = 11 + Math.floor(Math.random() * 40);
  const input = el('input', { type: 'number', inputMode: 'numeric', className: 'field' });
  const msg = el('p', { className: 'muted' });
  const { box, close } = modal(
    el('h2', { textContent: 'Parents only' }),
    el('p', { textContent: `What is ${a} + ${b}?` }),
    input,
    msg,
  );
  const ok = el('button', { className: 'btn', textContent: 'Continue' });
  const no = el('button', { className: 'btn ghost', textContent: 'Cancel', onclick: close });
  ok.onclick = () => {
    if (Number(input.value) === a + b) { close(); openPanel(); } else msg.textContent = 'Not quite. Try again.';
  };
  box.append(el('div', { className: 'row' }, ok, no));
  input.focus();
}

function openPanel() {
  const code = el('textarea', { className: 'field', rows: 4, readOnly: true, value: progress.exportAll() });
  const paste = el('textarea', { className: 'field', rows: 3, placeholder: 'Paste backup code to restore' });
  const msg = el('p', { className: 'muted' });
  const { box, close } = modal(
    el('h2', { textContent: 'Parent panel' }),
    el('h3', { textContent: 'Backup code' }),
    code,
    el('h3', { textContent: 'Restore' }),
    paste,
    el('button', { className: 'btn', textContent: 'Restore', onclick: () => {
      try { progress.importAll(paste.value); location.reload(); } catch { msg.textContent = 'That code did not work.'; }
    } }),
    msg,
    el('h3', { textContent: 'Reset progress' }),
    el('div', { className: 'row' }, ...APPS.map((app) => el('button', { className: 'btn ghost', textContent: `Reset ${app.title}`, onclick: (e) => {
      if (e.currentTarget.dataset.armed) { progress.reset(app.id); location.reload(); return; }
      e.currentTarget.dataset.armed = '1';
      e.currentTarget.textContent = 'Tap again to confirm';
    } }))),
    el('h3', { textContent: 'Updates' }),
    el('button', { className: 'btn', textContent: 'Check for update', onclick: async () => {
      const reg = await navigator.serviceWorker?.getRegistration();
      await reg?.update().catch(() => {});
      location.reload();
    } }),
    el('div', { className: 'row' }, el('button', { className: 'btn ghost', textContent: 'Close', onclick: close })),
  );
  box.scrollTop = 0;
}
