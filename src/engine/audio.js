// 말소리 효과음("뿅뿅") — Web Audio로 짧은 비프음을 즉석에서 만듭니다. (음원 파일 필요 없음)
// 브라우저는 사용자 입력(스페이스바) 전에는 소리를 못 내므로 start 시점에 unlockAudio()를 호출합니다.

let ctx = null;

export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
}

export function blip({ base = 520, range = 220, duration = 0.06, volume = 0.12, type = 'square' } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(base + Math.random() * range, t);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

/**
 * 발걸음 소리 (config.sfx.step). enabled: false 면 아무것도 안 함.
 * 지금은 "자리만" 있는 아주 짧은 저음 '톡' 합성음. 나중에 음원을 쓰려면 여기만 바꾸면 됩니다.
 *   예) const a = new Audio('./assets/audio/step.wav'); a.volume = cfg.volume; a.play();
 */
export function stepSound(event, cfg) {
  if (!cfg?.enabled || !ctx) return;
  const base = cfg.pitch?.[event.who] ?? 120;
  blip({ base, range: 30, duration: 0.04, volume: cfg.volume ?? 0.08, type: 'triangle' });
}
