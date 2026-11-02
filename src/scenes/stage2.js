// 62~92초: STAGE 2 — 맵이 오른쪽→왼쪽으로 흐르고, 신랑은 제자리에서 달리다가 장애물에서 점프
import { OBSTACLE_TYPES, stage2Distance } from '../engine/timing.js';

export function buildStage2({ tl, refs, config, poses }) {
  const S = config.scenes.stage2;
  const P = config.stage2;
  const dur = S.end - S.start;
  const dist = stage2Distance(config);

  // 땅(앞)과 구름(뒤, 느리게)을 스크롤 — 시차(parallax)로 속도감
  tl.set(refs.world, { x: 0 }, 0);
  tl.set(refs.clouds, { x: 0 }, 0);
  tl.to(refs.world, { x: -dist, duration: dur, ease: 'none' }, S.start);
  tl.to(refs.clouds, { x: -dist * P.cloudParallax, duration: dur, ease: 'none' }, S.start);

  // 달리기 포즈 (점프 구간은 아래에서 덮어씀: 뒤에 등록한 포즈가 우선)
  poses.add('groom', S.start, S.end, 'walk');

  // 점프: apexAt(최고점) 기준으로 앞뒤 jumpAir/2 초
  const half = P.jumpAir / 2;
  for (const ob of P.obstacles) {
    if (!OBSTACLE_TYPES[ob.type]) throw new Error(`알 수 없는 장애물 type: ${ob.type}`);
    const takeoff = ob.apexAt - half;
    tl.to(refs.groomWrap, { y: -P.jumpHeight, duration: half, ease: 'power2.out' }, takeoff);
    tl.to(refs.groomWrap, { y: 0, duration: half, ease: 'power2.in' }, ob.apexAt);
    poses.add('groom', takeoff, ob.apexAt + half, 'jump');
  }
}
