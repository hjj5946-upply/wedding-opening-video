// 93초~끝: 화면 전체(HUD 포함)가 검정으로 덮임 → 검은 화면에 감사 인사가 한 줄씩 떠올랐다 사라지고,
//           그 아래에서 신랑(왼쪽)·신부(오른쪽)가 걸어 들어와 가운데에서 만남
//           → 마지막 줄에서 함께 꾸벅 인사 → 두 사람도 사라지며 완전한 검정으로 끝.
//  문구/시각은 config.closing, 두 사람 연출 값은 config.closing.stage
export function buildClosing({ tl, refs, config, poses }) {
  const C = config.closing;
  const S = C.stage;
  const F = config.scenes.fade;
  const W = config.canvas.width;

  // 1) 검정으로 덮기 (맵·캐릭터·HUD·배너 위를 전부 덮는 층)
  tl.set(refs.blackout, { autoAlpha: 0 }, 0);
  tl.fromTo(refs.blackout, { autoAlpha: 0 }, { autoAlpha: 1, duration: C.blackoutDur, ease: 'power1.inOut', immediateRender: false }, F.start);

  // 2) 두 사람 층 켜고 끄기 (배경 없이 도트만 — 뒤는 그냥 검정)
  const stageEnd = S.hideAt + S.fadeOut;
  tl.set(refs.closingStage, { autoAlpha: 0 }, 0);
  tl.fromTo(refs.closingStage, { autoAlpha: 0 }, { autoAlpha: 1, duration: S.fadeIn, ease: 'none', immediateRender: false }, S.showAt);
  tl.to(refs.closingStage, { autoAlpha: 0, duration: S.fadeOut, ease: 'power1.in' }, S.hideAt);

  // 3) 양쪽 바깥에서 걸어 들어와 가운데에서 멈춤 (멈춘 자리가 x=0 — 거기서부터 거꾸로 밀어냄)
  const walkDur = S.walkEnd - S.walkFrom;
  const enter = [
    { who: 'closeGroom', from: -(W / 2 + S.walkOutside), facing: 'right' }, // 왼쪽 바깥 → 오른쪽으로 걸어옴
    { who: 'closeBride', from: W / 2 + S.walkOutside, facing: 'left' }, // 오른쪽 바깥 → 왼쪽으로 걸어옴
  ];
  for (const e of enter) {
    const el = refs[`${e.who}Wrap`];
    if (el) {
      tl.set(el, { x: e.from }, 0);
      tl.fromTo(el, { x: e.from }, { x: 0, duration: walkDur, ease: 'none', immediateRender: false }, S.walkFrom);
    }
    poses.add(e.who, S.showAt, S.walkFrom, 'walk', e.facing); // 켜지기 전부터 같은 모습 (화면 밖)
    poses.add(e.who, S.walkFrom, S.walkEnd, 'walk', e.facing);
    poses.add(e.who, S.walkEnd, Infinity, 'frontStand');
  }

  // 4) 서 있는 동안 숨 쉬듯 아주 살짝 위아래 (두 사람이 조금씩 어긋나게)
  const half = S.breath.period / 2;
  const breaths = Math.ceil((stageEnd - S.walkEnd) / half);
  ['closeGroomBob', 'closeBrideBob'].forEach((key, i) => {
    const el = refs[key];
    if (!el) return;
    tl.set(el, { y: 0 }, 0);
    tl.to(el, { y: -S.breath.amount, duration: half, ease: 'sine.inOut', repeat: breaths, yoyo: true }, S.walkEnd + i * 0.4);
  });

  // 5) 두 사람 사이에서 하트가 천천히 떠오름
  const H = S.hearts;
  const cx = W / 2;
  refs.closingHearts.forEach((el, i) => {
    if (!el) return;
    const t0 = H.at + i * H.every;
    const dx = (i % 2 ? 1 : -1) * ((i % 3) + 1) * (H.spread / 3);
    const y0 = S.feetY - H.y;
    tl.set(el, { x: cx, y: y0, xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.5 }, 0);
    tl.to(el, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, t0);
    tl.to(el, { x: cx + dx, y: y0 - H.rise, duration: H.dur, ease: 'power1.out' }, t0);
    tl.to(el, { autoAlpha: 0, duration: 0.8, ease: 'power1.in' }, t0 + H.dur - 0.8);
  });

  // 6) 마지막 줄에서 함께 꾸벅 (전용 도트 프레임 bow_1 / bow_2)
  const bowMid = S.bowAt + S.bow.down;
  const bowUp = bowMid + S.bow.hold;
  const bowEnd = bowUp + S.bow.up;
  for (const who of ['closeGroom', 'closeBride']) {
    const off = who === 'closeBride' ? 0.12 : 0; // 신부가 아주 살짝 늦게 (같이 하면 로봇 같음)
    poses.add(who, S.bowAt + off, bowMid + off, 'bow1');
    poses.add(who, bowMid + off, bowUp + off, 'bow2');
    poses.add(who, bowUp + off, bowEnd + off, 'bow1');
    poses.add(who, bowEnd + off, Infinity, 'frontStand');
  }

  // 7) 오른쪽 위 "다시보기" 안내 — 마지막 줄쯤에 잠깐 깜빡였다 사라짐
  const N = C.notice;
  if (N && refs.closingNotice) {
    const el = refs.closingNotice;
    const half = Math.max(0.15, N.blink / 2);
    const reps = Math.max(1, Math.round((N.out - N.at) / half) - 1);
    tl.set(el, { autoAlpha: 0 }, 0);
    tl.fromTo(el, { autoAlpha: 1 }, { autoAlpha: N.dim ?? 0.15, duration: half, ease: 'none', repeat: reps, yoyo: true, immediateRender: false }, N.at);
    tl.set(el, { autoAlpha: 0 }, N.out);
  }

  // 8) 감사 인사: 화면 위쪽에 한 줄씩 떠올랐다(fadeIn) 사라짐(fadeOut)
  C.lines.forEach((line, i) => {
    const el = refs.closingLines[i];
    if (!el) return;
    tl.set(el, { autoAlpha: 0, y: 26 }, 0);
    tl.fromTo(el, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: C.fadeIn, ease: 'power2.out', immediateRender: false }, line.at);
    tl.to(el, { autoAlpha: 0, y: -18, duration: C.fadeOut, ease: 'power1.in' }, line.out);
  });
}
