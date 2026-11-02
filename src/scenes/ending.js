// 92~108초: 맵이 멈추고 신부가 보임 → 신랑이 걸어가 만남 → 하트 → 마무리 멘트 → 마지막 카드(고정)
export function buildEnding({ tl, refs, config, poses }) {
  const S = config.scenes.ending;
  const E = config.ending;
  const L = config.layout;
  const brideX = config.stage2.brideScreenX;
  const meetX = brideX - E.gap;

  // 신부는 먼저 손 흔들기, 신랑은 걸어가서 만남
  poses.add('bride', E.brideWaveFrom, Infinity, 'wave');
  tl.to(refs.groomWrap, { x: meetX, duration: E.meetWalkEnd - S.start, ease: 'none' }, S.start);
  poses.add('groom', S.start, E.meetWalkEnd, 'walk');
  poses.add('groom', E.meetWalkEnd, Infinity, 'wave');

  // 하트 뿅뿅 (두 사람 사이에서 위로 떠오르며 사라짐)
  const cx = (meetX + brideX) / 2;
  const cy = L.groundY - 330; // 말풍선 윗선 근처에서 시작해서 위로 (말풍선 글자를 가리지 않게)
  refs.hearts.forEach((h, i) => {
    const n = refs.hearts.length;
    const dx = (i - (n - 1) / 2) * 38;
    const rise = 100 + (i % 4) * 45;
    const t0 = E.heartsAt + i * 0.12;
    tl.set(h, { x: cx + dx * 0.4, y: cy, xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.4 }, 0);
    tl.to(h, { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'back.out(2)' }, t0);
    tl.to(h, { x: cx + dx, y: cy - rise, duration: 2.0, ease: 'power1.out' }, t0);
    tl.to(h, { autoAlpha: 0, duration: 0.5, ease: 'power1.in' }, t0 + 1.6);
  });
}
