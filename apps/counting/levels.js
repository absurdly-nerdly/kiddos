// Counting levels are data; add a level by appending an entry.
// kind: 'count' = count the objects, pick the numeral; 'hear' = hear a number, pick its numeral;
// 'more' = pick the group with more objects.
export const ROUNDS_PER_LEVEL = 5;

export const LEVELS = [
  { title: 'Count to 3', kind: 'count', min: 1, max: 3 },
  { title: 'Count to 5', kind: 'count', min: 1, max: 5 },
  { title: 'Count to 10', kind: 'count', min: 3, max: 10 },
  { title: 'Find the number', kind: 'hear', min: 1, max: 10 },
  { title: 'Count to 20', kind: 'count', min: 8, max: 20 },
  { title: 'Which has more?', kind: 'more', min: 1, max: 10 },
];

export const OBJECTS = ['🍎', '🐟', '⭐', '🚗', '🐥', '🌸', '🍪', '🎈', '🐞', '🍓'];

const int = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Three unique numeral choices that include the answer.
export function makeChoices(answer, max, rng = Math.random) {
  const top = Math.max(max, answer + 3);
  const pool = [];
  for (let n = Math.max(1, answer - 3); n <= top && n <= answer + 3; n++) if (n !== answer) pool.push(n);
  return shuffle([answer, ...shuffle(pool, rng).slice(0, 2)], rng);
}

export function makeRound(level, rng = Math.random) {
  const emoji = pick(rng, OBJECTS);
  if (level.kind === 'more') {
    const a = int(rng, level.min, level.max);
    let b = int(rng, level.min, level.max);
    while (b === a) b = int(rng, level.min, level.max);
    const other = pick(rng, OBJECTS.filter((o) => o !== emoji));
    const groups = [{ emoji, count: a }, { emoji: other, count: b }];
    return { kind: 'more', prompt: 'Which group has more?', groups, answer: a > b ? 0 : 1 };
  }
  const answer = int(rng, level.min, level.max);
  const round = { kind: level.kind, answer, choices: makeChoices(answer, level.max, rng) };
  if (level.kind === 'hear') return { ...round, prompt: `Find the number ${answer}` };
  return { ...round, prompt: 'How many?', emoji, count: answer };
}
