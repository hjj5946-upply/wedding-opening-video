// 23~40초: 인사 끝 → 신랑이 위로 휙 → 맵 등장 → 위에서 낙하, 착지(작게 튕김) → 피아노 옆에서 멘트
//  멘트(머리 위 말풍선)는 config.dialogue 의 piano 장면 줄들. HUD 등장은 scenes/hud.js
export function buildDrop({ tl, refs, config, poses }) {
  const D = config.drop;
  const L = config.layout;
  const startY = config.intro.feetY - L.groundY; // 인사할 때 발 높이 (맵 바닥 기준)
  const offTop = -(L.groundY + 60); // 캐릭터 전체가 화면 위로 사라지는 y

  // 1) 위로 휙 사라짐 (팔 벌린 포즈)
  tl.fromTo(refs.groomWrap, { y: startY }, { y: offTop, duration: D.leaveDur, ease: 'power2.in', immediateRender: false }, D.leaveAt);

  // 2) 맵 등장 (검정 → 맵)
  tl.set(refs.map, { autoAlpha: 0 }, 0);
  tl.fromTo(refs.map, { autoAlpha: 0 }, { autoAlpha: 1, duration: D.mapFadeDur, ease: 'power1.out', immediateRender: false }, D.mapFadeAt);

  // 3) 화면 위, 피아노 옆 x에서 낙하 → 착지 → 작게 튕김
  tl.set(refs.groomWrap, { x: config.map.groomX }, D.fallStart - 0.05);
  tl.fromTo(refs.groomWrap, { y: offTop }, { y: 0, duration: D.landAt - D.fallStart, ease: 'power2.in', immediateRender: false }, D.fallStart);
  tl.fromTo(refs.groomWrap, { y: 0 }, { y: -D.bounce, duration: 0.14, ease: 'power2.out', immediateRender: false }, D.landAt);
  tl.fromTo(refs.groomWrap, { y: -D.bounce }, { y: 0, duration: 0.14, ease: 'power2.in', immediateRender: false }, D.landAt + 0.14);

  poses.add('groom', D.leaveAt, D.landAt, 'fall');
  // 4) 착지 후 달리기 시작 전까지 앞모습 서기 (말할 때 통통은 dialogue.js)
  poses.add('groom', D.landAt, config.scenes.game.start, 'frontStand');
}
