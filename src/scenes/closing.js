// 80초~끝: 화면 전체(HUD 포함)가 검정으로 덮임 → 검은 화면에 흰 글씨 감사 인사가
//           한 줄씩 떠올랐다 사라지고 → 마지막 줄까지 사라지면 완전한 검정으로 끝납니다.
//  값과 문구는 config.closing (줄마다 at = 나타나는 시각 / out = 사라지기 시작하는 시각)
export function buildClosing({ tl, refs, config }) {
  const C = config.closing;
  const F = config.scenes.fade;

  // 1) 검정으로 덮기 (맵·캐릭터·HUD·배너 위를 전부 덮는 층)
  tl.set(refs.blackout, { autoAlpha: 0 }, 0);
  tl.fromTo(refs.blackout, { autoAlpha: 0 }, { autoAlpha: 1, duration: C.blackoutDur, ease: 'power1.inOut', immediateRender: false }, F.start);

  // 2) 감사 인사: 화면 가운데에 한 줄씩 떠올랐다(fadeIn) 사라짐(fadeOut)
  C.lines.forEach((line, i) => {
    const el = refs.closingLines[i];
    if (!el) return;
    tl.set(el, { autoAlpha: 0, y: 26 }, 0);
    tl.fromTo(el, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: C.fadeIn, ease: 'power2.out', immediateRender: false }, line.at);
    tl.to(el, { autoAlpha: 0, y: -18, duration: C.fadeOut, ease: 'power1.in' }, line.out);
  });
}
