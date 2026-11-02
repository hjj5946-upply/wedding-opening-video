// 90초~끝: 화면 전체(HUD 포함)가 검정으로 덮임 → 검은 화면에 흰 글씨 감사 인사가 한 줄씩 → 영상 끝까지 고정
//  값은 config.closing. 문구는 config.closing.lines (줄마다 at / size / color 지정 가능)
export function buildClosing({ tl, refs, config }) {
  const C = config.closing;
  const F = config.scenes.fade;

  // 1) 검정으로 덮기 (맵·캐릭터·HUD·배너 위를 전부 덮는 층)
  tl.set(refs.blackout, { autoAlpha: 0 }, 0);
  tl.fromTo(
    refs.blackout,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: C.blackoutDur, ease: 'power1.inOut', immediateRender: false },
    F.start,
  );

  // 2) 감사 인사: 한 줄씩 떠오르며 나타나고, 그 뒤로는 끝까지 그대로 (사라지는 연출 없음)
  C.lines.forEach((line, i) => {
    const el = refs.closingLines[i];
    if (!el) return;
    tl.set(el, { autoAlpha: 0, y: 26 }, 0);
    tl.fromTo(
      el,
      { autoAlpha: 0, y: 26 },
      { autoAlpha: 1, y: 0, duration: C.fadeIn, ease: 'power2.out', immediateRender: false },
      line.at,
    );
  });
}
