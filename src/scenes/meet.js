// 80~90초: 맵이 멈추고 신부가 보임 → 신랑이 걸어가 만남(서로 마주 보는 옆모습)
//            → 하트 → 둘 다 앞모습으로 돌아 손 흔들기 → 짧은 번쩍임 + "STAGE 1 CLEAR!" 배너(scenes/overlays.js)
//  값은 config.meet. 신부가 서 있는 위치는 components/World.jsx 가 맵 위에 배치(맵이 멈추면 brideScreenX 에 옴)
export function buildMeet({ tl, refs, config, poses }) {
  const S = config.scenes.meet;
  const E = config.meet;
  const L = config.layout;
  const meetX = E.brideScreenX - E.gap; // 신랑이 멈춰 서는 화면 x

  // 1) 신부: 달리는 동안 이미 신랑 쪽(왼쪽)을 바라보고 서 있다가, 만난 뒤 앞모습으로 손 흔들기
  poses.add('bride', config.scenes.run.start, E.waveAt, 'sideStand', 'left');
  poses.add('bride', E.waveAt, Infinity, 'wave');

  // 2) 신랑: 걸어가서(옆모습 오른쪽) → 마주 보고 서기 → 앞모습으로 손 흔들기
  tl.fromTo(
    refs.groomWrap,
    { x: config.map.groomX },
    { x: meetX, duration: E.walkEnd - S.start, ease: 'none', immediateRender: false },
    S.start,
  );
  poses.add('groom', S.start, E.walkEnd, 'walk', 'right');
  poses.add('groom', E.walkEnd, E.waveAt, 'sideStand', 'right');
  poses.add('groom', E.waveAt, Infinity, 'wave');

  // 3) 하트 뿅뿅 (두 사람 사이에서 위로 떠오르며 사라짐). STAGE 1 CLEAR 배너 글자와 겹치지 않게 낮게 띄움
  const cx = (meetX + E.brideScreenX) / 2;
  const cy = L.groundY - E.heartY;
  refs.hearts.forEach((h, i) => {
    const dx = (i % 2 ? 1 : -1) * Math.ceil((i + 1) / 2) * 52; // 가운데에서 좌우로 번갈아 퍼지게 (분수처럼)
    const rise = 80 + ((i * 37) % 90); // 올라가는 높이를 하트마다 다르게
    const y0 = cy + (i % 3) * 20; // 시작 높이도 조금씩 다르게
    const t0 = E.heartsAt + i * E.heartStagger;
    tl.set(h, { x: cx + dx * 0.35, y: y0, xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.4 }, 0);
    tl.to(h, { autoAlpha: 1, scale: 1, duration: 0.22, ease: 'back.out(2)' }, t0);
    tl.to(h, { x: cx + dx, y: y0 - rise, duration: E.heartRise, ease: 'power1.out' }, t0);
    tl.to(h, { autoAlpha: 0, duration: 0.4, ease: 'power1.in' }, t0 + E.heartRise - 0.4);
  });

  // 4) 짧은 번쩍임 (STAGE 1 CLEAR 배너와 같은 시각. 눈이 피로하지 않게 옅고 짧게)
  tl.set(refs.flash, { autoAlpha: 0 }, 0);
  tl.fromTo(refs.flash, { autoAlpha: 0 }, { autoAlpha: 0.7, duration: 0.1, ease: 'power2.out', immediateRender: false }, E.flashAt);
  tl.to(refs.flash, { autoAlpha: 0, duration: E.flashDur - 0.1, ease: 'power2.in' }, E.flashAt + 0.1);
}
