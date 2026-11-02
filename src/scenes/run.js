// 40~80초: 달리기 — 맵이 오른쪽→왼쪽으로 흐르고, 신랑은 화면 x(map.groomX)에서 제자리 달리기
//  장애물은 config.map.piano / config.map.obstacles 에서 "시각"으로 적고, 맵 위 위치는 engine/timing.js 가 자동 계산
//   · hit: false → 점프로 넘음 (apexAt = 점프 최고점 시각)
//   · hit: true  → 부딪힘 (hitAt = 부딪히는 시각) → 피격 포즈 + 뒤로 밀림 + 깜빡임 + 장애물 넘어짐 + 하트 하나 깎임
//  하트/TIME 표시는 scenes/hud.js (현재 시각으로 계산)
import { runDistance, jumpWindow, hitWindow, allObstacles } from '../engine/timing.js';

/** 점프 1번: 떠오름 → 최고점(apexAt) → 착지 */
export function addJump({ tl, refs, config, poses }, apexAt) {
  const j = jumpWindow(config, apexAt);
  const { height } = config.map.jump;
  const half = j.apex - j.takeoff;
  tl.fromTo(refs.groomWrap, { y: 0 }, { y: -height, duration: half, ease: 'power2.out', immediateRender: false }, j.takeoff);
  tl.fromTo(refs.groomWrap, { y: -height }, { y: 0, duration: half, ease: 'power2.in', immediateRender: false }, j.apex);
  poses.add('groom', j.takeoff, j.land, 'jump', 'right');
}

/** 충돌 1번: 피격 포즈 + 뒤로 밀렸다 복귀 + 깜빡임 + 장애물이 앞으로 넘어지며 사라짐 */
export function addHit({ tl, refs, config, poses }, o) {
  const F = config.map.hitFx;
  const h = hitWindow(config, o.hitAt);
  const X = config.map.groomX;

  // 1) 뒤로 밀림 → 잠깐 멈춤 → 원래 자리로 (x는 항상 fromTo 로 — 시간 이동에도 같은 값)
  tl.fromTo(refs.groomWrap, { x: X }, { x: X - F.knockback, duration: F.back, ease: 'power2.out', immediateRender: false }, h.start);
  tl.fromTo(refs.groomWrap, { x: X - F.knockback }, { x: X, duration: F.recover, ease: 'power1.inOut', immediateRender: false }, h.recoverStart);
  poses.add('groom', h.start, h.end, 'hit', 'right');

  // 2) 깜빡임 (도트만 — .bob 에 걸어서 말풍선은 안 깜빡임)
  const blinkStep = 0.08;
  const repeat = Math.max(1, Math.round(F.blink / (blinkStep * 2)) * 2 - 1);
  tl.fromTo(
    refs.groomBob,
    { opacity: 1 },
    { opacity: 0.25, duration: blinkStep, repeat, yoyo: true, ease: 'none', immediateRender: false },
    h.start,
  );
  tl.set(refs.groomBob, { opacity: 1 }, h.blinkEnd);

  // 3) 장애물: 부딪힌 쪽 반대로 넘어지며(오른쪽 아래로 회전) 사라짐 → 신랑이 지나갈 수 있음
  const el = refs.obstacles[o.id];
  if (el) {
    tl.fromTo(el, { rotate: 0 }, { rotate: 84, duration: F.topple, ease: 'power2.in', immediateRender: false }, h.start);
    tl.to(el, { autoAlpha: 0, duration: F.topple * 0.45, ease: 'power1.in' }, h.start + F.topple * 0.55);
  }
}

export function buildRun(ctx) {
  const { tl, refs, config, poses } = ctx;
  const R = config.scenes.run;
  const M = config.map;
  const dur = R.end - R.start;
  const dist = runDistance(config);

  // 땅(앞) / 언덕(중간) / 구름(뒤) 스크롤 — 시차로 속도감
  tl.set([refs.world, refs.hills, refs.clouds], { x: 0 }, 0);
  tl.fromTo(refs.world, { x: 0 }, { x: -dist, duration: dur, ease: 'none', immediateRender: false }, R.start);
  tl.fromTo(refs.hills, { x: 0 }, { x: -dist * M.parallax.hills, duration: dur, ease: 'none', immediateRender: false }, R.start);
  tl.fromTo(refs.clouds, { x: 0 }, { x: -dist * M.parallax.clouds, duration: dur, ease: 'none', immediateRender: false }, R.start);

  // 글자 장애물: 처음 상태(안 넘어짐, 보임) — 되감기에도 되살아나게 0초에 고정
  for (const o of M.obstacles ?? []) {
    const el = refs.obstacles[o.id];
    if (el) tl.set(el, { rotate: 0, autoAlpha: 1, transformOrigin: '100% 100%' }, 0);
  }

  // 달리기 (점프/피격 구간은 뒤에서 덮어씀: 나중에 등록한 포즈가 우선)
  poses.add('groom', R.start, R.end, 'run', 'right');
  tl.set(refs.groomBob, { opacity: 1 }, 0);

  // 장애물 처리 (피아노 + 글자 장애물, 시각 순서대로)
  for (const o of allObstacles(config)) {
    if (o.hit) addHit(ctx, o);
    else addJump(ctx, o.apexAt);
  }
}
