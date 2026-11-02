// HUD (하트 + TIME): 착지할 때 위에서 톡 내려오며 등장
//  하트 깎임 / TIME 증가는 D단계에서 추가
export function buildHud({ tl, refs, config }) {
  tl.set(refs.hud, { autoAlpha: 0 }, 0);
  tl.fromTo(
    refs.hud,
    { autoAlpha: 0, y: -40 },
    { autoAlpha: 1, y: 0, duration: 0.35, ease: 'back.out(2)', immediateRender: false },
    config.drop.landAt,
  );
}
