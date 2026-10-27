// Spoken prompts via the device's text-to-speech. Silent if unavailable.
export function speak(text, { rate = 0.85, pitch = 1.1 } = {}) {
  try {
    const synth = globalThis.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(String(text));
    u.lang = 'en-US';
    u.rate = rate;
    u.pitch = pitch;
    synth.speak(u);
  } catch { /* silent fallback */ }
}

let ctx;
// Short happy chime (WebAudio, no audio files).
export function chime() {
  try {
    ctx ??= new (globalThis.AudioContext || globalThis.webkitAudioContext)();
    const t = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.25, t + i * 0.1 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.1 + 0.35);
      o.connect(g).connect(ctx.destination);
      o.start(t + i * 0.1);
      o.stop(t + i * 0.1 + 0.4);
    });
  } catch { /* silent fallback */ }
}
