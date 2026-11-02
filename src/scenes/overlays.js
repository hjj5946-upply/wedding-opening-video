// 화면 위에 얹히는 큰 글자 배너 (GAME START / STAGE 1 CLEAR). 시각/문구는 config.banners
//  검정 페이드와 마무리 감사 인사는 scenes/closing.js
export function buildOverlays({ tl, refs, config }) {
  for (const b of config.banners) {
    const el = refs.banners[b.id];
    if (!el) continue;
    tl.set(el, { autoAlpha: 0 }, 0);
    tl.fromTo(
      el,
      { autoAlpha: 0, scale: 1.5 },
      { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(1.6)', immediateRender: false },
      b.at,
    );
    tl.to(el, { autoAlpha: 0, duration: 0.35 }, b.at + b.hold);
  }
}
