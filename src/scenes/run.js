// 40~80초: 달리기 — 맵이 오른쪽→왼쪽으로 흐르고, 신랑은 화면 x(map.groomX)에서 제자리 달리기
//  장애물 점프는 apexAt(최고점 시각) 기준 → 위치는 engine/timing.js 가 자동 계산
//  (D단계: GAME START 배너, 글자 장애물, 충돌/하트, TIME 증가 추가 예정)
import { runDistance, jumpWindow } from '../engine/timing.js';

/** 점프 1번: 떠오름 → 최고점(apexAt) → 착지 */
export function addJump({ tl, refs, config, poses }, apexAt) {
  const j = jumpWindow(config, apexAt);
  const { height } = config.map.jump;
  const half = j.apex - j.takeoff;
  tl.fromTo(refs.groomWrap, { y: 0 }, { y: -height, duration: half, ease: 'power2.out', immediateRender: false }, j.takeoff);
  tl.fromTo(refs.groomWrap, { y: -height }, { y: 0, duration: half, ease: 'power2.in', immediateRender: false }, j.apex);
  poses.add('groom', j.takeoff, j.land, 'jump', 'right');
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

  // 달리기 (점프 구간은 뒤에서 덮어씀: 나중에 등록한 포즈가 우선)
  poses.add('groom', R.start, R.end, 'run', 'right');

  // 첫 장애물: 피아노
  addJump(ctx, M.piano.apexAt);
}
