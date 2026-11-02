// 55~62초: "STAGE 1 CLEAR!" → 배경이 피아노 방에서 들판으로 바뀌고, 신랑이 달리기 출발 위치로 이동
export function buildClear({ tl, refs, config, poses }) {
  const C = config.scenes.clear;
  const S2 = config.stage2;

  // 하얀 번쩍임(짧게) + 신랑 환호
  tl.set(refs.flash, { autoAlpha: 0 }, 0);
  tl.fromTo(refs.flash, { autoAlpha: 0.85 }, { autoAlpha: 0, duration: 0.5, ease: 'power1.out', immediateRender: false }, C.start);
  poses.add('groom', C.start + 0.4, C.switchAt, 'wave');

  // 배경 전환: 피아노 방 → 하늘/들판
  tl.set(refs.scene2, { autoAlpha: 0 }, 0);
  tl.to(refs.bgPiano, { autoAlpha: 0, duration: 0.4 }, C.switchAt);
  tl.to(refs.scene2, { autoAlpha: 1, duration: 0.4 }, C.switchAt);

  // 신랑이 달리기 출발 위치로 걸어감
  tl.to(refs.groomWrap, { x: S2.groomScreenX, duration: C.walkBackEnd - C.switchAt, ease: 'none' }, C.switchAt);
  poses.add('groom', C.switchAt, C.walkBackEnd, 'walk');
}
