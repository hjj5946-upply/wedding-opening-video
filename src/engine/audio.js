// 소리 전체 담당: ① 말풍선 비프음/효과음(코드로 합성) ② 배경 음악 3곡(mp3를 Web Audio로 재생)
//
//  ▶ 브라우저는 사용자 입력(스페이스바) 전에는 소리를 못 내므로 start 시점에 unlockAudio() 를 부릅니다.
//  ▶ 음악은 mp3를 "미리 디코딩" 해 두고, 영상 시각(타임라인 time)에 맞춰 버퍼를 예약 재생합니다.
//    → ?t= 이동, ←/→, 숫자키, P(일시정지) 에도 음악이 현재 시각으로 따라옵니다.
//  ▶ 효과음은 ① config.sfx 에 src(mp3)가 있으면 그 파일을 재생하고
//    ② 없으면 오실레이터로 즉석 합성합니다. (점프·코인은 깜자가 넣은 mp3, 나머지는 합성)

let ctx = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;
let voices = 0; // 지금 울리고 있는 합성음 개수 (지직거림/성능 방지용 상한)
const mute = { music: false, sfx: false };

export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    musicGain = ctx.createGain();
    sfxGain = ctx.createGain();
    musicGain.connect(masterGain);
    sfxGain.connect(masterGain);
    masterGain.connect(ctx.destination);
    applyMute();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function applyMute() {
  if (!ctx) return;
  musicGain.gain.value = mute.music ? 0 : 1;
  sfxGain.gain.value = mute.sfx ? 0 : 1;
}

/** ?music=0 / ?sfx=0 / ?mute=1 처리 */
export function setMute({ music, sfx } = {}) {
  if (music !== undefined) mute.music = music;
  if (sfx !== undefined) mute.sfx = sfx;
  applyMute();
}

export function setMasterVolume(v) {
  if (masterGain) masterGain.gain.value = v;
}

// ── 효과음 샘플(mp3) ─────────────────────────────────────────────
//  짧은 효과음은 "미리 디코딩 → 필요할 때마다 즉시 재생" 합니다 (음악 큐와 달리 여러 번 울림)
const sfxBuffers = new Map(); // 파일이름 → AudioBuffer

/** config.sfx 안에서 src 가 적힌 효과음들의 mp3를 미리 받아 둡니다 */
export async function loadSfxSamples(dir, sfxConfig = {}) {
  unlockAudio();
  if (!ctx) return;
  const names = [...new Set(Object.values(sfxConfig).filter((c) => c && c.src).map((c) => c.src))];
  await Promise.all(
    names.map(async (src) => {
      if (sfxBuffers.has(src)) return;
      try {
        const res = await fetch(dir + src);
        if (!res.ok) throw new Error(`${res.status}`);
        sfxBuffers.set(src, await ctx.decodeAudioData(await res.arrayBuffer()));
      } catch (e) {
        console.warn(`[audio] 효과음 ${src} 를 불러오지 못했습니다 (합성음으로 대신합니다): ${e.message}`);
      }
    }),
  );
}

/** 효과음 mp3 한 번 재생. 못 찾으면 false (→ 합성음으로 대체) */
function playSample(src, volume = 0.5, rate = 1) {
  const buf = sfxBuffers.get(src);
  if (!buf || !ctx || mute.sfx) return !!buf;
  const node = ctx.createBufferSource();
  node.buffer = buf;
  node.playbackRate.value = rate;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  node.connect(gain).connect(sfxGain);
  node.start();
  return true;
}

// ── 합성 효과음 ────────────────────────────────────────────────

/** 아주 짧은 음 하나. type/엔벨로프를 바꿔 여러 효과음을 만듭니다 */
function tone({ freq = 520, freq2 = null, duration = 0.06, volume = 0.1, type = 'square', attack = 0.004 }) {
  if (!ctx || mute.sfx || voices >= 8) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (freq2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq2), t + duration);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(sfxGain);
  voices++;
  osc.onended = () => voices--;
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

let lastBlipAt = -1;

/**
 * 말풍선 말소리 (동물의 숲 느낌).
 *  단순 비프음이 아니라 "모음"처럼 들리게:
 *   ① 부드러운 파형(기본 triangle) + 살짝 디튠된 두 번째 음 → 목소리 두께
 *   ② 소리 중에 음높이가 쓱 내려감(glide) → 말하는 억양
 *   ③ 밴드패스 필터(포먼트)를 글자마다 다른 주파수로 → "아/에/이" 처럼 입 모양이 바뀜
 */
export function blip(o = {}) {
  if (!ctx || mute.sfx) return;
  const now = ctx.currentTime;
  const minGap = o.minGap ?? 0.03;
  const maxVoices = o.maxVoices ?? 8;
  if (now - lastBlipAt < minGap) return; // 너무 빨리 겹치면 건너뜀
  if (voices >= maxVoices) return;
  lastBlipAt = now;

  const dur = o.duration ?? 0.09;
  const vol = o.volume ?? 0.1;
  const detune = o.detune ?? 0.07;
  const f0 = (o.base ?? 400) * (1 + (Math.random() * 2 - 1) * detune);
  const f1 = Math.max(60, f0 * (o.glide ?? 0.74));
  const formant = Math.max(300, (o.formant ?? 1150) + (Math.random() * 2 - 1) * (o.formantRange ?? 520));

  // 입 모양(포먼트) 필터 → 출력
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(formant, now);
  filter.frequency.exponentialRampToValueAtTime(Math.max(300, formant * 0.78), now + dur);
  filter.Q.value = o.formantQ ?? 7;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), now + 0.012);
  gain.gain.setValueAtTime(Math.max(0.0002, vol), now + dur * 0.55);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  filter.connect(gain).connect(sfxGain);

  // 기본음 + 살짝 디튠된 두 번째 음 (목소리 두께)
  const oscs = [];
  for (const [type, mul, lv] of [[o.type ?? 'triangle', 1, 1], ['sine', 1.005, 0.55]]) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f0 * mul, now);
    osc.frequency.exponentialRampToValueAtTime(f1 * mul, now + dur);
    if (lv < 1) {
      const g2 = ctx.createGain();
      g2.gain.value = lv;
      osc.connect(g2).connect(filter);
    } else {
      osc.connect(filter);
    }
    oscs.push(osc);
  }
  voices++;
  oscs[0].onended = () => voices--;
  for (const osc of oscs) {
    osc.start(now);
    osc.stop(now + dur + 0.03);
  }
}

/** 이름으로 고르는 효과음 (config.sfx 의 각 항목에서 볼륨/on·off) */
export function playSfx(name, sfxConfig = {}) {
  const c = sfxConfig[name];
  if (!c || c.enabled === false) return;
  const v = c.volume ?? 0.14;
  // mp3 가 지정돼 있고 준비돼 있으면 그걸 재생 (없으면 아래 합성음)
  if (c.src && playSample(c.src, v, c.rate ?? 1)) return;
  if (name === 'box') tone({ freq: 220, freq2: 110, duration: 0.09, volume: v, type: 'square' }); // 상자 '통'
  else if (name === 'hit') tone({ freq: 200, freq2: 80, duration: 0.16, volume: v, type: 'square' }); // 부딪힘 '퉁'
  else if (name === 'jump') tone({ freq: 440, freq2: 980, duration: 0.14, volume: v, type: 'square' }); // 점프 (mp3 없을 때)
  else if (name === 'pop') tone({ freq: 880, freq2: 1760, duration: 0.11, volume: v, type: 'triangle' }); // 하트 '뿅'
  else if (name === 'heal') tone({ freq: 660, freq2: 1320, duration: 0.22, volume: v, type: 'sine' }); // 하트 채움
  else if (name === 'burst') tone({ freq: 520, freq2: 1500, duration: 0.14, volume: v, type: 'square' }); // 사진 "팡"
  else if (name === 'flag') tone({ freq: 1320, freq2: 330, duration: 0.5, volume: v, type: 'square' }); // 깃발
  else tone({ freq: 440, duration: 0.08, volume: v });
}

/** 발걸음 소리 (config.sfx.step). enabled: false 면 아무것도 안 함 */
export function stepSound(event, cfg) {
  if (!cfg?.enabled || !ctx) return;
  tone({ freq: cfg.pitch?.[event.who] ?? 120, duration: 0.04, volume: cfg.volume ?? 0.08, type: 'triangle' });
}

// ── 배경 음악 (mp3) ──────────────────────────────────────────────

const RESYNC = 0.25; // 영상 시각과 음악 위치가 이만큼(초) 어긋나면 다시 맞춤

/**
 * config.audio 의 큐대로 mp3를 재생합니다.
 *  music.load()            → 모든 mp3 디코딩 (스페이스바 전에 미리)
 *  music.update(t, playing) → 매 프레임 호출. 현재 시각에 맞는 곡을 켜고/끄고/페이드
 *  music.stop()            → 전부 정지
 */
export function createMusic(config, cues) {
  const buffers = new Map(); // src → AudioBuffer
  const active = new Map(); // cue.id → { src, gain, startedCtx, startedPos }
  let loaded = false;

  async function load() {
    if (loaded) return true;
    const A = config.audio;
    if (!A?.enabled) {
      loaded = true;
      return true;
    }
    unlockAudio();
    if (!ctx) return false;
    const names = [...new Set(Object.values(A.tracks).map((t) => t.src))];
    await Promise.all(
      names.map(async (src) => {
        try {
          const res = await fetch(A.dir + src);
          if (!res.ok) throw new Error(`${res.status}`);
          const arr = await res.arrayBuffer();
          const buf = await ctx.decodeAudioData(arr);
          buffers.set(src, buf);
        } catch (e) {
          console.warn(`[audio] ${src} 를 불러오지 못했습니다 (소리 없이 계속 진행): ${e.message}`);
        }
      }),
    );
    await loadSfxSamples(A.dir, config.sfx); // 점프/코인 같은 효과음 mp3도 같이 준비
    loaded = true;
    return true;
  }

  /** 큐 안에서의 재생 위치(파일 기준 초) */
  function positionOf(cue, t, buf) {
    const elapsed = t - cue.start;
    if (!cue.loop) return cue.offset + elapsed;
    const span = Math.max(0.1, buf.duration - cue.offset);
    return cue.offset + (elapsed % span);
  }

  /** 페이드 포함한 현재 볼륨 (0~1) */
  function volumeOf(cue, t) {
    let v = cue.volume;
    if (cue.fadeIn > 0 && t < cue.start + cue.fadeIn) v *= Math.max(0, (t - cue.start) / cue.fadeIn);
    if (cue.fadeOut > 0 && t > cue.stop - cue.fadeOut) v *= Math.max(0, (cue.stop - t) / cue.fadeOut);
    return Math.max(0, v) * (config.audio.masterVolume ?? 1);
  }

  function startCue(cue, t, buf) {
    const pos = positionOf(cue, t, buf);
    if (pos >= buf.duration && !cue.loop) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    if (cue.loop) {
      src.loop = true;
      src.loopStart = cue.offset;
      src.loopEnd = buf.duration;
    }
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(gain).connect(musicGain);
    src.start(ctx.currentTime, Math.min(pos, buf.duration - 0.05));
    active.set(cue.id, { src, gain, startedCtx: ctx.currentTime, startedPos: pos, cue });
  }

  function stopCue(id) {
    const a = active.get(id);
    if (!a) return;
    try {
      a.gain.gain.setValueAtTime(a.gain.gain.value, ctx.currentTime);
      a.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.04);
      a.src.stop(ctx.currentTime + 0.06);
    } catch {
      /* 이미 멈춘 소스 */
    }
    active.delete(id);
  }

  function stop() {
    for (const id of [...active.keys()]) stopCue(id);
  }

  /** 매 프레임: 지금 시각에 울려야 할 곡을 맞춥니다 */
  function update(t, playing) {
    if (!ctx || !loaded) return;
    for (const cue of cues) {
      const buf = buffers.get(cue.src);
      const should = playing && buf && t >= cue.start && t < cue.stop;
      const a = active.get(cue.id);
      if (!should) {
        if (a) stopCue(cue.id);
        continue;
      }
      if (!a) {
        startCue(cue, t, buf);
        continue;
      }
      // 어긋났으면(시킹/일시정지 후) 다시 맞춤
      const playedFor = ctx.currentTime - a.startedCtx;
      const actual = a.startedPos + playedFor;
      const want = positionOf(cue, t, buf);
      if (Math.abs(actual - want) > RESYNC) {
        stopCue(cue.id);
        startCue(cue, t, buf);
      }
      const cur = active.get(cue.id);
      if (cur) cur.gain.gain.value = volumeOf(cue, t);
    }
  }

  return { load, update, stop, get ready() { return loaded; } };
}
