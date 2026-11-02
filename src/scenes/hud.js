// HUD (하트 + TIME)
//  · 착지할 때 위에서 톡 내려오며 등장
//  · 하트: 부딪힐 때마다 오른쪽 하트가 터지듯 사라짐 (3 → 2 → 1. 절대 0이 되지 않게 check 가 검사)
//  · TIME: 달리기 진행도에 비례해 1 YEAR → 8 YEAR. 숫자는 "현재 시각"으로 계산(update) → 시간 이동/되감기에도 정확
import { timeYears, heartsAt } from '../engine/timing.js';

export function buildHud({ tl, refs, config }) {
  const T = config.hud.time;
  const H = config.hud.hearts;

  // 등장
  tl.set(refs.hud, { autoAlpha: 0 }, 0);
  tl.fromTo(
    refs.hud,
    { autoAlpha: 0, y: -40 },
    { autoAlpha: 1, y: 0, duration: 0.35, ease: 'back.out(2)', immediateRender: false },
    config.drop.landAt,
  );

  // 하트: 부딪히는 장애물 순서대로 오른쪽 하트부터 하나씩 터지듯 사라짐
  for (const el of refs.hudHearts) if (el) tl.set(el, { autoAlpha: 1, scale: 1 }, 0);
  const hits = (config.map.obstacles ?? []).filter((o) => o.hit).sort((a, b) => a.hitAt - b.hitAt);
  hits.forEach((o, i) => {
    const el = refs.hudHearts[H.count - 1 - i];
    if (!el) return;
    tl.fromTo(
      el,
      { scale: 1, autoAlpha: 1 },
      { scale: 1.9, autoAlpha: 0, duration: 0.32, ease: 'power2.out', immediateRender: false },
      o.hitAt + 0.05,
    );
  });

  // TIME 숫자가 올라가는 순간 살짝 커짐 (값이 바뀌는 시각을 미리 계산 → 시간 이동에도 안전)
  tl.set(refs.hudTime, { scale: 1 }, 0);
  const span = (T.fullAt ?? config.scenes.run.end) - config.scenes.run.start;
  const steps = T.to - T.from;
  for (let v = T.from + 1; v <= T.to; v++) {
    const at = config.scenes.run.start + (span * (v - T.from - 0.5)) / steps;
    tl.fromTo(refs.hudTime, { scale: 1 }, { scale: 1.18, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.out', immediateRender: false }, at);
  }

  /** 매 프레임: 현재 시각의 TIME 값을 글자로 */
  let shown = null;
  function update(t) {
    const v = timeYears(config, t);
    if (v !== shown) {
      shown = v;
      if (refs.hudTime) refs.hudTime.textContent = `${v} ${T.unit}`;
    }
  }

  return { update, heartsAt: (t) => heartsAt(config, t) };
}
