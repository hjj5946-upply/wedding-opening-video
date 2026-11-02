// HUD (하트 + TIME)
//  · 착지할 때 위에서 톡 내려오며 등장
//  · 하트: 글자 장애물에 부딪히면 오른쪽부터 터지듯 사라지고, 신부를 만나면 하나씩 다시 채워짐
//  · TIME: 물음표상자를 칠 때마다 1 YEAR 씩 → 깃발을 친 뒤에는 '8 YEAR 6 MONTH'
//    숫자는 "현재 시각"으로 계산(update) → 시간 이동/되감기에도 정확
import { timeText, healTimes } from '../engine/timing.js';
import { playSfx } from '../engine/audio.js';

export function buildHud({ tl, refs, config, flags }) {
  const T = config.hud.time;
  const H = config.hud.hearts;
  const M = config.meet;

  // 등장
  tl.set(refs.hud, { autoAlpha: 0 }, 0);
  tl.fromTo(refs.hud, { autoAlpha: 0, y: -40 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'back.out(2)', immediateRender: false }, config.drop.landAt);

  // 하트 처음 상태
  for (const el of refs.hudHearts) if (el) tl.set(el, { autoAlpha: 1, scale: 1 }, 0);

  // ① 부딪힐 때마다 오른쪽 하트부터 터지듯 사라짐
  const hits = (config.map.obstacles ?? []).filter((o) => o.hit).sort((a, b) => a.hitAt - b.hitAt);
  hits.forEach((o, i) => {
    const el = refs.hudHearts[H.count - 1 - i];
    if (!el) return;
    tl.fromTo(el, { scale: 1, autoAlpha: 1 }, { scale: 1.9, autoAlpha: 0, duration: 0.32, ease: 'power2.out', immediateRender: false }, o.hitAt + 0.05);
  });

  // ② 신부를 만나면 하나씩 다시 채워짐 (+ 짧은 효과음)
  const heals = healTimes(config);
  for (const h of heals) {
    const el = refs.hudHearts[h.index];
    if (!el) continue;
    tl.fromTo(el, { scale: 0.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(2.4)', immediateRender: false }, h.at);
    tl.call(
      () => {
        if (!flags.silent) playSfx('heal', config.sfx);
      },
      null,
      h.at,
    );
  }
  // 다 채워지면 세 개가 함께 한 번 콩 (가득 찼다는 느낌)
  if (heals.length) {
    const at = heals[heals.length - 1].at + 0.45;
    refs.hudHearts.forEach((el, i) => {
      if (el) tl.fromTo(el, { scale: 1 }, { scale: 1.25, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.out', immediateRender: false }, at + i * 0.06);
    });
  }

  // TIME 숫자가 바뀌는 순간 살짝 커짐 (상자를 친 시각 + 깃발 시각)
  tl.set(refs.hudTime, { scale: 1 }, 0);
  const marks = [...(config.map.boxes ?? []).map((b) => b.apexAt), config.map.flag.touchAt];
  for (const at of marks) {
    tl.fromTo(refs.hudTime, { scale: 1 }, { scale: 1.18, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.out', immediateRender: false }, at);
  }

  /** 매 프레임: 현재 시각의 TIME 글자 */
  let shown = null;
  function update(t) {
    const v = timeText(config, t);
    if (v !== shown) {
      shown = v;
      if (refs.hudTime) refs.hudTime.textContent = v;
    }
  }

  return { update };
}
