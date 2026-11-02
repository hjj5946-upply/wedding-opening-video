// 말풍선 멘트 처리
//  - 풍선이 튀어나오고 사라지는 건 GSAP 타임라인(addAll)
//  - 어떤 멘트가 떠 있는지 / 글자가 몇 개 나왔는지 / 배치(side·above)는 "현재 시각"으로 계산(update)
//    → 건너뛰기/되감기에도 안전
import { lineTiming, fillTokens, lineLayout } from './timing.js';
import { blip } from './audio.js';

export function createDialogue({ refs, config, flags }) {
  const lines = config.dialogue
    .map((line) => ({
      line,
      who: line.who ?? 'groom',
      chars: [...fillTokens(line.text, config)],
      t: lineTiming(line, config),
      layout: lineLayout(line, config),
    }))
    .sort((a, b) => a.line.at - b.line.at);

  // 캐릭터별 표시 상태 (지금 보여주는 멘트, 글자 수, 이번 멘트에서 낸 효과음 수)
  const state = {};

  function addAll(tl) {
    const { popIn, popOut } = config.bubble;
    // 대사가 없는 캐릭터(예: 신부)의 빈 말풍선도 처음엔 반드시 숨겨 둠
    for (const who of ['groom', 'bride']) tl.set(refs[`${who}Bubble`].el, { autoAlpha: 0 }, 0);
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

  /** 매 프레임 호출: 시각 t에 떠 있어야 할 멘트의 글자/배치를 맞추고, 글자가 늘어날 때 효과음 */
  function update(t) {
    const { sfx } = config;
    for (const who of ['groom', 'bride']) {
      // 이 캐릭터의 멘트 중 이미 시작한 마지막 것 (없으면 첫 멘트로 자리만 잡아 둠)
      const mine = lines.filter((L) => L.who === who);
      if (!mine.length) continue;
      let L = mine[0];
      for (const c of mine) if (c.line.at <= t) L = c;
      const n = Math.max(0, Math.min(L.chars.length, Math.floor((t - L.t.typeStart) * (L.line.cps ?? config.bubble.cps))));

      const s = (state[who] ??= { L: null, n: -1, blips: 0 });
      if (s.L === L && s.n === n) continue;
      const sameLine = s.L === L;
      const prev = s.n;
      if (!sameLine) s.blips = 0;
      s.L = L;
      s.n = n;
      const bubble = refs[`${who}Bubble`];
      bubble.setLayout(L.layout);
      bubble.setParts(L.chars.slice(0, n).join(''), L.chars.slice(n).join(''));
      if (!sameLine) bubble.fit(); // 새 멘트: 접힌 줄 길이에 맞춰 풍선 폭 조정

      // 정상 재생 중 같은 멘트에서 글자가 1~2개 늘어난 경우에만 소리 (건너뛰기/되감기는 무음)
      if (sfx.blip && !flags.silent && sameLine && n > prev && n - prev <= 2) {
        const ch = L.chars[n - 1];
        if (/\S/.test(ch) && n % sfx.blipEveryNChars === 0 && s.blips < sfx.blipMaxPerLine) {
          s.blips++;
          blip({ base: sfx.pitch[who] ?? 520, range: sfx.pitchRange, volume: sfx.volume });
        }
      }
    }
  }

  return { addAll, update };
}
