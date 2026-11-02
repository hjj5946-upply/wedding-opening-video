// 화면 위에 얹히는 큰 글자들: 배너(STAGE 1 / CLEAR / STAGE 2) + 마지막 고정 카드
export function buildOverlays({ tl, refs, config }) {
  for (const b of config.banners) {
    const el = refs.banners[b.id];
    tl.set(el, { autoAlpha: 0 }, 0);
    tl.fromTo(
      el,
      { autoAlpha: 0, scale: 1.5 },
      { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(1.6)', immediateRender: false },
      b.at,
    );
    tl.to(el, { autoAlpha: 0, duration: 0.35 }, b.at + b.hold);
  }

  // 마지막 카드: 한 번 나타난 뒤 영상 끝까지 고정
  tl.set(refs.finalCard, { autoAlpha: 0 }, 0);
  tl.fromTo(
    refs.finalCard,
    { autoAlpha: 0, y: 30 },
    { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out', immediateRender: false },
    config.finalCard.at,
  );
}
