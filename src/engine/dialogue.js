// 말풍선 멘트 처리
//  - 풍선이 튀어나오고 사라지는 건 GSAP 타임라인(addAll)
//  - 글자가 한 글자씩 나오는 건 "현재 시각"으로 계산(update) → 건너뛰기/되감기에도 안전
import { lineTiming, fillTokens } from './timing.js';
import { blip } from './audio.js';

export function createDialogue({ refs, config, flags }) {
  const lines = config.dialogue.map((line) => {
    const who = line.who ?? 'groom';
    const chars = [...fillTokens(line.text, config)];
    return { line, who, chars, t: lineTiming(line, config), lastN: -1, blips: 0 };
  });

  function addAll(tl) {
    const { popIn, popOut } = config.bubble;
    // 대사가 없는 캐릭터(예: 신부)의 빈 말풍선도 처음엔 반드시 숨겨 둠
    for (const who of ['groom', 'bride']) {
      tl.set(refs[`${who}Bubble`].el, { autoAlpha: 0, xPercent: -50, transformOrigin: '50% 100%' }, 0);
    }
    for (const L of lines) {
      const bubble = refs[`${L.who}Bubble`];
      const bob = refs[`${L.who}Bob`];
      tl.fromTo(
        bubble.el,
        { autoAlpha: 0, scale: 0.6 },
        { autoAlpha: 1, scale: 1, duration: popIn, ease: 'back.out(2)', immediateRender: false },
        L.line.at,
      );
      if (!L.line.stay) {
        tl.to(bubble.el, { autoAlpha: 0, scale: 0.9, duration: popOut, ease: 'power1.in' }, L.t.hideAt);
      }
      // 말하는 동안 몸이 살짝 통통 (점프와 겹치지 않게 별도 요소 .bob 사용)
      tl.to(bob, { y: -10, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.out' }, L.t.typeStart);
    }
  }

  /** 매 프레임 호출: 시각 t에 맞춰 글자를 보여주고, 글자가 늘어날 때 효과음 */
  function update(t) {
    const { sfx } = config;
    for (const L of lines) {
      const cps = L.line.cps ?? config.bubble.cps;
      const n = Math.max(0, Math.min(L.chars.length, Math.floor((t - L.t.typeStart) * cps)));
      if (n === L.lastN) continue;
      const prev = L.lastN;
      L.lastN = n;
      refs[`${L.who}Bubble`].setParts(L.chars.slice(0, n).join(''), L.chars.slice(n).join(''));
      if (n === 0) L.blips = 0;
      // 정상 재생 중 글자가 1~2개 늘어난 경우에만 소리 (건너뛰기/되감기는 무음)
      if (sfx.blip && !flags.silent && prev >= 0 && n > prev && n - prev <= 2) {
        const ch = L.chars[n - 1];
        if (/\S/.test(ch) && n % sfx.blipEveryNChars === 0 && L.blips < sfx.blipMaxPerLine) {
          L.blips++;
          blip({ base: sfx.pitch[L.who] ?? 520, range: sfx.pitchRange, volume: sfx.volume });
        }
      }
    }
  }

  return { addAll, update };
}
