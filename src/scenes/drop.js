// 27~41초: 인사 끝 → 신랑이 위로 휙 → 피아노 학원 등장 → 위에서 낙하, 착지(작게 튕김) → 피아노 앞에서 멘트
//           → 게임이 시작될 때(41초) 학원이 게임 맵으로 바뀌고 HUD가 나옵니다
//  멘트(머리 위 말풍선)는 config.dialogue 의 piano 장면 줄들. HUD 등장은 scenes/hud.js
export function buildDrop({ tl, refs, config, poses }) {
  const D = config.drop;
  const L = config.layout;
  const startY = config.intro.feetY - L.groundY; // 인사할 때 발 높이 (맵 바닥 기준)
  const offTop = -(L.groundY + 60); // 캐릭터 전체가 화면 위로 사라지는 y

  // 1) 위로 휙 사라짐 (팔 벌린 포즈)
  tl.fromTo(refs.groomWrap, { y: startY }, { y: offTop, duration: D.leaveDur, ease: 'power2.in', immediateRender: false }, D.leaveAt);

  // 2) 피아노 학원 등장 (검정 → 학원). 게임 맵과 HUD는 아직 안 보입니다
  const R = config.room;
  tl.set(refs.room, { autoAlpha: 0 }, 0);
  tl.fromTo(refs.room, { autoAlpha: 0 }, { autoAlpha: 1, duration: R.fadeIn, ease: 'power1.out', immediateRender: false }, R.showAt);

  // 2-2) 게임 시작 때 학원 → 게임 맵 (교차 전환, R.hideAt + R.fadeDur = game.start)
  tl.to(refs.room, { autoAlpha: 0, duration: R.fadeDur, ease: 'power1.in' }, R.hideAt);
  tl.set(refs.map, { autoAlpha: 0 }, 0);
  tl.fromTo(refs.map, { autoAlpha: 0 }, { autoAlpha: 1, duration: R.fadeDur, ease: 'power1.out', immediateRender: false }, R.hideAt);

  // 3) 화면 위, 피아노 옆 x에서 낙하 → 착지 → 작게 튕김
  tl.set(refs.groomWrap, { x: config.map.groomX }, D.fallStart - 0.05);
  tl.fromTo(refs.groomWrap, { y: offTop }, { y: 0, duration: D.landAt - D.fallStart, ease: 'power2.in', immediateRender: false }, D.fallStart);
  tl.fromTo(refs.groomWrap, { y: 0 }, { y: -D.bounce, duration: 0.14, ease: 'power2.out', immediateRender: false }, D.landAt);
  tl.fromTo(refs.groomWrap, { y: -D.bounce }, { y: 0, duration: 0.14, ease: 'power2.in', immediateRender: false }, D.landAt + 0.14);

  poses.add('groom', D.leaveAt, D.landAt, 'fall');
  // 4) 착지 후 달리기 시작 전까지 앞모습 서기 (말할 때 통통은 dialogue.js)
  poses.add('groom', D.landAt, config.scenes.game.start, 'frontStand');
}
