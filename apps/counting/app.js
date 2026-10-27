import { progress, requestPersistence } from '../../shared/progress.js';
import { speak, chime } from '../../shared/speak.js';
import { mountParentGear } from '../../shared/parent.js';
import { registerSW } from '../../shared/sw-register.js';
import { LEVELS, ROUNDS_PER_LEVEL, makeRound } from './levels.js';

const APP_ID = 'counting';
const $ = (id) => document.getElementById(id);
const stage = $('stage');

let state = progress.load(APP_ID);
state.level = Math.min(state.level, LEVELS.length - 1);
state.unlocked = Math.min(Math.max(state.unlocked, state.level), LEVELS.length - 1);
let round;
let locked = false;

const save = (patch) => { state = progress.update(APP_ID, patch); };

function renderChrome() {
  $('stars').textContent = `⭐ ${state.stars}`;
  $('title').textContent = LEVELS[state.level].title;
  $('levels').replaceChildren(...LEVELS.map((_, i) => {
    const b = document.createElement('button');
    b.className = 'lvl' + (i === state.level ? ' on' : '');
    b.textContent = i + 1;
    b.disabled = i > state.unlocked;
    b.onclick = () => { save({ level: i, round: 0 }); newRound(); };
    return b;
  }));
  $('dots').replaceChildren(...Array.from({ length: ROUNDS_PER_LEVEL }, (_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i < state.round ? ' done' : '');
    return d;
  }));
}

function confetti() {
  const bits = ['🎉', '⭐', '🎈', '✨', '🌟'];
  for (let i = 0; i < 18; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.textContent = bits[i % bits.length];
    c.style.left = `${Math.random() * 95}vw`;
    c.style.animationDelay = `${Math.random() * 0.4}s`;
    document.body.append(c);
    setTimeout(() => c.remove(), 2200);
  }
}

function correct(node) {
  locked = true;
  node.classList.add('right');
  chime();
  confetti();
  speak(['Great job!', 'You got it!', 'Yay!', 'Awesome!'][Math.floor(Math.random() * 4)]);
  const nextRound = state.round + 1;
  const stars = state.stars + 1;
  if (nextRound >= ROUNDS_PER_LEVEL) {
    const next = Math.min(state.level + 1, LEVELS.length - 1);
    save({ stars, level: next, round: 0, unlocked: Math.max(state.unlocked, next) });
    setTimeout(levelComplete, 1400);
  } else {
    save({ stars, round: nextRound });
    setTimeout(newRound, 1400);
  }
  renderChrome();
}

function wrong(node) {
  node.classList.add('wrong');
  node.disabled = true;
  speak('Try again!');
}

function levelComplete() {
  const el = document.createElement('div');
  el.className = 'celebrate';
  el.innerHTML = '<div class="big">🏆</div><h1>You finished the level!</h1>';
  const go = document.createElement('button');
  go.className = 'btn';
  go.textContent = 'Keep playing ▶';
  go.onclick = newRound;
  el.append(go);
  stage.replaceChildren(el);
  speak('You finished the level! Amazing!');
  confetti();
  renderChrome();
}

function choiceButtons(r) {
  const row = document.createElement('div');
  row.className = 'choices';
  for (const n of r.choices) {
    const b = document.createElement('button');
    b.className = 'choice';
    b.textContent = n;
    b.onclick = () => {
      if (locked) return;
      if (n === r.answer) correct(b); else wrong(b);
    };
    row.append(b);
  }
  return row;
}

function countingStage(r) {
  const wrap = document.createElement('div');
  const objs = document.createElement('div');
  objs.className = 'objects' + (r.count > 10 ? ' dense' : '');
  let counted = 0;
  for (let i = 0; i < r.count; i++) {
    const o = document.createElement('button');
    o.className = 'obj';
    o.textContent = r.emoji;
    o.onclick = () => {
      if (o.classList.contains('counted')) return;
      o.classList.add('counted');
      counted += 1;
      o.innerHTML = `${r.emoji}<span class="count-badge">${counted}</span>`;
      speak(String(counted), { rate: 0.8 });
    };
    objs.append(o);
  }
  wrap.append(objs, choiceButtons(r));
  return wrap;
}

function moreStage(r) {
  const wrap = document.createElement('div');
  wrap.className = 'groups';
  r.groups.forEach((g, i) => {
    const box = document.createElement('div');
    box.className = 'group';
    box.setAttribute('role', 'button');
    box.innerHTML = Array.from({ length: g.count }, () => `<span>${g.emoji}</span>`).join('');
    box.onclick = () => {
      if (locked || box.classList.contains('wrong')) return;
      if (i === r.answer) correct(box); else wrong(box);
    };
    wrap.append(box);
  });
  return wrap;
}

function newRound() {
  locked = false;
  round = makeRound(LEVELS[state.level]);
  const prompt = document.createElement('div');
  prompt.className = 'prompt';
  prompt.textContent = round.prompt;
  prompt.onclick = () => speak(round.prompt);
  const body = round.kind === 'more' ? moreStage(round) : round.kind === 'hear' ? choiceButtons(round) : countingStage(round);
  stage.replaceChildren(prompt, body);
  renderChrome();
  speak(round.prompt);
}

mountParentGear();
requestPersistence();
registerSW();
newRound();
