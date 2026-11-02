// 0~8초: 검은 화면 → 어둠 속에서 신랑이 스포트라이트 안으로 걸어 들어와 손 흔들며 인사
export function buildOpening({ tl, refs, config, poses }) {
  const { scenes: S, layout: L } = config;
  const walkStart = S.intro.start;

  // 신랑: 화면 왼쪽 바깥에서 출발
  tl.set(refs.groomWrap, { xPercent: -50, x: -300, y: 0 }, 0);
  tl.to(refs.groomWrap, { x: L.stage1GroomX, duration: S.intro.walkEnd - walkStart, ease: 'none' }, walkStart);
  poses.add('groom', walkStart, S.intro.walkEnd, 'walk');
  poses.add('groom', S.intro.walkEnd, S.stage1.start + 0.4, 'wave'); // 도착 후 인사(손 흔들기)

  // 스포트라이트가 켜졌다가, 피아노 학원 배경으로 교체
  tl.set(refs.spot, { autoAlpha: 0 }, 0);
  tl.to(refs.spot, { autoAlpha: 1, duration: 1.5, ease: 'power1.out' }, walkStart);
  tl.to(refs.spot, { autoAlpha: 0, duration: 1.0, ease: 'power1.in' }, S.intro.end - 1.0);
  tl.set(refs.bgPiano, { autoAlpha: 0 }, 0);
  tl.to(refs.bgPiano, { autoAlpha: 1, duration: 1.0, ease: 'power1.inOut' }, S.intro.end - 1.0);
}
