// 34~67초: 게임 구간 — 맵이 오른쪽→왼쪽으로 흐르고, 신랑은 화면 x(map.groomX)에서 제자리 달리기
//  · 물음표상자 8개(1~8년): 점프해서 머리로 치면 상자가 튀고 빈 상자로 바뀌며
//    하트가 뿅뿅 + 그 자리에서 동그란 사진이 떠올랐다가 "팡" 터짐 + TIME 증가
//  · 낭떠러지: 점프로 건너뜀 (시각 지정이라 항상 성공)
//  · 벽돌 장애물: hit:false 는 점프로 넘고, hit:true 는 부딪혀서 하트가 깎임
//  · 거북이 1마리: 왼쪽으로 기어오고 신랑이 점프로 넘음
//  · 마지막: 계단을 오르고 → 맵이 멈추고 → 깃대로 뛰어 깃발을 내림
//  모든 위치는 config 의 "시각"으로부터 engine/timing.js 가 계산합니다 (?t= 로 어디를 열어도 정확)
import {
  scrollMax,
  mapStopAt,
  jumpWindow,
  hitWindow,
  photoTiming,
  allBoxes,
  allPits,
  allObstacles,
  turtleInfo,
  stairsInfo,
  flagInfo,
} from '../engine/timing.js';
import { playSfx } from '../engine/audio.js';

/** 시간 이동(시킹) 중에는 소리가 나지 않도록 감싼 효과음 예약 */
function sfxAt({ tl, flags, config }, time, name) {
  tl.call(
    () => {
      if (!flags.silent) playSfx(name, config.sfx);
    },
    null,
    time,
  );
}

/** 점프 1번: 떠오름 → 최고점(apexAt) → 착지 (뛰는 순간 점프 소리) */
export function addJump(ctx, apexAt, kind = 'jump') {
  const { tl, refs, config, poses } = ctx;
  const j = jumpWindow(config, apexAt, kind);
  const height = kind === 'pit' ? config.map.pitJump.height : config.map.jump.height;
  const half = j.apex - j.takeoff;
  tl.fromTo(refs.groomWrap, { y: 0 }, { y: -height, duration: half, ease: 'power2.out', immediateRender: false }, j.takeoff);
  tl.fromTo(refs.groomWrap, { y: -height }, { y: 0, duration: half, ease: 'power2.in', immediateRender: false }, j.apex);
  poses.add('groom', j.takeoff, j.land, 'jump', 'right');
  sfxAt(ctx, j.takeoff, 'jump');
  return j;
}

/** 물음표상자 1개: 머리로 치기 → 상자 튀고 빈 상자로 → 하트 뿅뿅 → 그 자리에서 동그란 사진 → "팡" */
function addBox(ctx, box, index) {
  const { tl, refs, config } = ctx;
  addJump(ctx, box.apexAt);
  const t0 = box.apexAt;
  const M = config.map;

  // 1) 상자가 위로 톡 튀었다 내려옴 + 빈 상자(갈색)로 교체
  const el = refs.boxes[box.id];
  if (el) {
    tl.fromTo(el, { y: 0 }, { y: -18, duration: 0.09, ease: 'power2.out', immediateRender: false }, t0);
    tl.to(el, { y: 0, duration: 0.13, ease: 'bounce.out' }, t0 + 0.09);
  }
  const face = refs.boxFaces[box.id];
  const used = refs.boxUsed[box.id];
  if (face && used) {
    tl.set(face, { autoAlpha: 1 }, 0);
    tl.set(used, { autoAlpha: 0 }, 0);
    tl.set(face, { autoAlpha: 0 }, t0);
    tl.set(used, { autoAlpha: 1 }, t0);
  }
  sfxAt(ctx, t0, 'box');

  // 2) 상자 위로 하트가 뿅뿅 (화면 좌표. 3개를 돌려 씁니다)
  const cx = M.groomX;
  const cyBox = M.boxY + M.boxSize / 2;
  refs.boxHearts.forEach((h, i) => {
    const dx = (i - 1) * 54;
    const t = t0 + 0.05 + i * 0.05;
    tl.fromTo(h, { x: cx, y: cyBox - 30, xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.14, ease: 'back.out(2)', immediateRender: false }, t);
    tl.to(h, { x: cx + dx, y: cyBox - 150 - i * 18, duration: 0.8, ease: 'power1.out' }, t);
    tl.to(h, { autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, t + 0.5);
  });
  sfxAt(ctx, t0 + 0.06, 'pop');

  // 3) 그 자리에서 동그란 사진이 떠오름 → 천천히 왼쪽으로 흘러감 → "팡" 터짐
  const P = config.photos;
  const pt = photoTiming(config, t0);
  const yTop = cyBox - P.riseY;
  const xEnd = cx - P.drift * P.hold;
  const frame = refs.photos[index];
  if (frame) {
    tl.set(frame, { xPercent: -50, yPercent: -50, x: cx, y: cyBox, scale: 0.2, autoAlpha: 0 }, 0);
    tl.fromTo(
      frame,
      { x: cx, y: cyBox, scale: 0.2, autoAlpha: 0 },
      { y: yTop, scale: 1, autoAlpha: 1, duration: P.popIn, ease: 'back.out(1.6)', immediateRender: false },
      pt.start,
    );
    tl.to(frame, { x: xEnd, duration: P.hold, ease: 'none' }, pt.popEnd); // 떠 있는 동안 천천히 흘러감
    tl.to(frame, { scale: 1.55, autoAlpha: 0, duration: P.burst, ease: 'power2.out' }, pt.burstAt); // 팡!
  }
  const ring = refs.photoRings[index];
  if (ring) {
    tl.set(ring, { xPercent: -50, yPercent: -50, x: xEnd, y: yTop, scale: 0.55, autoAlpha: 0 }, 0);
    tl.fromTo(
      ring,
      { scale: 0.55, autoAlpha: 0.95 },
      { scale: 2.1, autoAlpha: 0, duration: P.burst * 1.3, ease: 'power2.out', immediateRender: false },
      pt.burstAt,
    );
  }
  sfxAt(ctx, pt.burstAt, 'burst');
}

/** 충돌 1번: 피격 포즈 + 뒤로 밀렸다 복귀 + 깜빡임 + 장애물이 앞으로 넘어지며 사라짐 */
export function addHit(ctx, o) {
  const { tl, refs, config, poses } = ctx;
  const F = config.map.hitFx;
  const h = hitWindow(config, o.hitAt);
  const X = config.map.groomX;

  tl.fromTo(refs.groomWrap, { x: X }, { x: X - F.knockback, duration: F.back, ease: 'power2.out', immediateRender: false }, h.start);
  tl.fromTo(refs.groomWrap, { x: X - F.knockback }, { x: X, duration: F.recover, ease: 'power1.inOut', immediateRender: false }, h.recoverStart);
  poses.add('groom', h.start, h.end, 'hit', 'right');

  // 깜빡임 (도트만 — .bob 에 걸어서 말풍선은 안 깜빡임)
  const blinkStep = 0.08;
  const repeat = Math.max(1, Math.round(F.blink / (blinkStep * 2)) * 2 - 1);
  tl.fromTo(refs.groomBob, { opacity: 1 }, { opacity: 0.25, duration: blinkStep, repeat, yoyo: true, ease: 'none', immediateRender: false }, h.start);
  tl.set(refs.groomBob, { opacity: 1 }, h.blinkEnd);

  // 장애물이 오른쪽 아래를 축으로 넘어지며 사라짐 → 신랑이 지나갈 수 있음
  const el = refs.obstacles[o.id];
  if (el) {
    tl.fromTo(el, { rotate: 0 }, { rotate: 84, duration: F.topple, ease: 'power2.in', immediateRender: false }, h.start);
    tl.to(el, { autoAlpha: 0, duration: F.topple * 0.45, ease: 'power1.in' }, h.start + F.topple * 0.55);
  }
  sfxAt(ctx, h.start, 'hit'); // 부딪힘 — 코인 소리가 아니라 둔탁한 '퉁'
}

/** 계단 오르기 → 맵 정지 → 깃대로 점프 → 깃발 내리기 → 땅으로 */
function addStairsAndFlag(ctx) {
  const { tl, refs, config, poses } = ctx;
  const st = stairsInfo(config);
  const fl = flagInfo(config);
  const X = config.map.groomX;

  // 1) 계단: 한 칸씩 올라감 (steps 이징 = 칸 단위로 뚝뚝)
  tl.fromTo(refs.groomWrap, { y: 0 }, { y: -st.topY, duration: st.climbDur, ease: `steps(${st.steps})`, immediateRender: false }, st.climbStart);
  tl.set(refs.groomWrap, { y: -st.topY }, st.climbEnd);

  // 2) 깃대로 점프 (앞으로 + 살짝 위로)
  const jumpDur = fl.touchAt - fl.jumpAt;
  const grabX = fl.screenX - 56;
  tl.fromTo(refs.groomWrap, { x: X }, { x: grabX, duration: jumpDur, ease: 'none', immediateRender: false }, fl.jumpAt);
  tl.fromTo(refs.groomWrap, { y: -st.topY }, { y: -(fl.grabY + 70), duration: jumpDur * 0.55, ease: 'power2.out', immediateRender: false }, fl.jumpAt);
  tl.fromTo(refs.groomWrap, { y: -(fl.grabY + 70) }, { y: -fl.grabY, duration: jumpDur * 0.45, ease: 'power2.in', immediateRender: false }, fl.jumpAt + jumpDur * 0.55);
  poses.add('groom', st.climbStart, fl.touchAt, 'run', 'right');
  poses.add('groom', fl.jumpAt, fl.touchAt, 'jump', 'right');
  sfxAt(ctx, fl.jumpAt, 'jump');
  sfxAt(ctx, fl.touchAt, 'flag');

  // 3) 깃발이 기둥을 따라 내려오고, 신랑도 같이 미끄러져 내려옴
  if (refs.flagCloth) {
    tl.set(refs.flagCloth, { y: 0 }, 0);
    tl.fromTo(refs.flagCloth, { y: 0 }, { y: fl.poleH - 90, duration: fl.slideDur, ease: 'power1.in', immediateRender: false }, fl.touchAt);
  }
  tl.fromTo(refs.groomWrap, { y: -fl.grabY }, { y: 0, duration: fl.slideDur, ease: 'power1.in', immediateRender: false }, fl.touchAt);
  poses.add('groom', fl.touchAt, fl.slideEnd, 'jump', 'right');
  // 4) 착지 후 신부에게 걸어가기 전까지 서 있기
  poses.add('groom', fl.slideEnd, config.meet.walkFrom, 'sideStand', 'right');
  tl.set(refs.groomWrap, { x: grabX, y: 0 }, fl.slideEnd);
}

export function buildGame(ctx) {
  const { tl, refs, config, poses } = ctx;
  const G = config.scenes.game;
  const M = config.map;
  const stopAt = mapStopAt(config);
  const dur = stopAt - G.start;
  const dist = scrollMax(config);

  // 땅(앞) / 언덕(중간) / 구름(뒤) 스크롤 — 시차로 속도감
  tl.set([refs.world, refs.hills, refs.clouds], { x: 0 }, 0);
  tl.fromTo(refs.world, { x: 0 }, { x: -dist, duration: dur, ease: 'none', immediateRender: false }, G.start);
  tl.fromTo(refs.hills, { x: 0 }, { x: -dist * M.parallax.hills, duration: dur, ease: 'none', immediateRender: false }, G.start);
  tl.fromTo(refs.clouds, { x: 0 }, { x: -dist * M.parallax.clouds, duration: dur, ease: 'none', immediateRender: false }, G.start);

  // 벽돌 장애물: 처음 상태(안 넘어짐, 보임) — 되감기에도 되살아나게 0초에 고정
  for (const o of M.obstacles ?? []) {
    const el = refs.obstacles[o.id];
    if (el) tl.set(el, { rotate: 0, autoAlpha: 1, transformOrigin: '100% 100%' }, 0);
  }

  // 달리기 (점프/피격/계단 구간은 뒤에서 덮어씀: 나중에 등록한 포즈가 우선)
  poses.add('groom', G.start, stopAt, 'run', 'right');
  tl.set(refs.groomBob, { opacity: 1 }, 0);
  tl.set(refs.groomWrap, { x: M.groomX }, G.start - 0.01);

  // 물음표상자 / 낭떠러지 / 벽돌 장애물
  allBoxes(config).forEach((b, i) => addBox(ctx, b, i));
  for (const p of allPits(config)) addJump(ctx, p.apexAt, 'pit');
  for (const o of allObstacles(config)) {
    if (o.hit) addHit(ctx, o);
    else addJump(ctx, o.apexAt);
  }

  // 거북이 1마리: 맵보다 조금 더 빨리 왼쪽으로 기어옴 → 신랑이 점프로 넘음
  const tt = turtleInfo(config);
  if (tt) {
    addJump(ctx, tt.apexAt);
    if (refs.turtle) {
      tl.set(refs.turtle, { x: 0 }, 0);
      tl.fromTo(refs.turtle, { x: 0 }, { x: -tt.driftTotal, duration: tt.driftDur, ease: 'none', immediateRender: false }, G.start);
    }
  }

  // 계단 + 깃발
  addStairsAndFlag(ctx);
}
