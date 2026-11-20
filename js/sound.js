// tiny beep helper so all the games can make some noise without each one
// reimplementing the same audio context junk. kept it real simple, just
// short square wave blips at different pitches
let audioCtx = null;

function beep(freq, duration) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // some browsers block audio until a user gesture happens, or just dont support it.
    // not a big deal either way, the games still work without sound
  }
}

// a few preset sounds the games can just call directly
function sfxHit() { beep(220, 0.08); }
function sfxScore() { beep(440, 0.12); }
function sfxGameOver() { beep(110, 0.3); }
function sfxLineClear() { beep(660, 0.15); }
