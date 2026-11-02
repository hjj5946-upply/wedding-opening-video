// 말풍선 멘트 처리
//  - 풍선이 튀어나오고 사라지는 건 GSAP 타임라인(addAll)
//  - 어떤 멘트가 떠 있는지 / 글자가 몇 개 나왔는지 / 배치는 "현재 시각"으로 계산(update) → 건너뛰기·되감기에 안전
//  - 말풍선은 3곳 중 하나에 뜹니다: 신랑(side·above) / 신부 / 게임 구간 자막칸(layout: 'game')
import { lineTiming, fillTokens, lineLayout } from './timing.js';
import { blip } from './audio.js';

// 비프음을 내지 않을 글자 (공백·문장부호)
const SILENT_CHAR = /[\s.,!?·…'"()[\]{}~\-—:;]/;

export function createDialogue({ refs, config, flags }) {
  const lines = config.dialogue
    .map((line) => {
      const layout = lineLayout(line, config);
      return {
        line,
        who: line.who ?? 'groom',
        channel: layout === 'game' ? 'game' : (line.who ?? 'groom'), // 같은 말풍선을 쓰는 묶음
        chars: [...fillTokens(line.text, config)],
        t: lineTiming(line, config),
        layout,
      };
    })
    .sort((a, b) => a.line.at - b.line.at);

  const channels = [...new Set(['groom', 'bride', 'game', ...lines.map((L) => L.channel)])];
  const bubbleOf = (L) => (L.channel === 'game' ? refs.gameBubble : refs[`${L.channel}Bubble`]);
  const state = {};

  function addAll(tl) {
    const { popIn, popOut } = config.bubble;
    // 대사가 없는 말풍선(신부 등)도 처음엔 반드시 숨겨 둠
    for (const ch of ['groom', 'bride']) tl.set(refs[`${ch}Bubble`].el, { autoAlpha: 0 }, 0);
    if (refs.gameBubble) tl.set(refs.gameBubble.el, { autoAlpha: 0 }, 0);

    for (const L of lines) {
      const bubble = bubbleOf(L);
      if (!bubble) continue;
      tl.fromTo(bubble.el, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: popIn, ease: 'back.out(2)', immediateRender: false }, L.line.at);
      if (!L.line.stay) tl.to(bubble.el, { autoAlpha: 0, scale: 0.9, duration: popOut, ease: 'power1.in' }, L.t.hideAt);
      // 말하는 동안 몸이 살짝 통통 (게임 자막칸은 제외 — 달리는 중이라 어색함)
      if (L.layout !== 'game') tl.to(refs[`${L.who}Bob`], { y: -10, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.out' }, L.t.typeStart);
    }
  }

  /** 매 프레임: 시각 t에 떠 있어야 할 멘트의 글자/배치를 맞추고, 글자가 늘어날 때 비프음 */
  function update(t) {
    const { sfx } = config;
    for (const ch of channels) {
      const mine = lines.filter((L) => L.channel === ch);
      if (!mine.length) continue;
      let L = mine[0];
      for (const c of mine) if (c.line.at <= t) L = c;
      const n = Math.max(0, Math.min(L.chars.length, Math.floor((t - L.t.typeStart) * (L.line.cps ?? config.bubble.cps))));

      const s = (state[ch] ??= { L: null, n: -1, blips: 0 });
      if (s.L === L && s.n === n) continue;
      const sameLine = s.L === L;
      const prev = s.n;
      if (!sameLine) s.blips = 0;
      s.L = L;
      s.n = n;
      const bubble = bubbleOf(L);
      if (!bubble) continue;
      bubble.setLayout(L.layout);
      bubble.setParts(L.chars.slice(0, n).join(''), L.chars.slice(n).join(''));
      if (!sameLine) bubble.fit(); // 새 멘트: 접힌 줄 길이에 맞춰 풍선 폭 조정

      // 정상 재생 중 같은 멘트에서 글자가 늘어난 경우에만 소리 (건너뛰기/되감기는 무음)
      if (sfx.blip && !flags.silent && sameLine && n > prev && n - prev <= 2) {
        const limit = sfx.blipMaxPerLine ?? Infinity;
        const every = Math.max(1, sfx.blipEveryNChars ?? 1);
        const chr = L.chars[n - 1];
        if (chr && !SILENT_CHAR.test(chr) && n % every === 0 && s.blips < limit) {
          s.blips++;
          blip({
            base: sfx.pitch[L.who] ?? 460,
            detune: sfx.blipDetune ?? 0.06,
            duration: sfx.blipDuration ?? 0.045,
            volume: sfx.volume ?? 0.085,
            minGap: sfx.blipMinGap ?? 0.035,
            maxVoices: sfx.maxVoices ?? 6,
          });
        }
      }
    }
  }

  return { addAll, update };
}
