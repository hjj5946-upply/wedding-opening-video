// 70~84초: 깃발을 내린 뒤 → 신랑이 신부에게 걸어가 만남(이 순간부터 outro.mp3)
//            → 하트가 터지고 → HUD 하트 3개가 하나씩 다시 채워짐(scenes/hud.js)
//            → 둘 다 앞모습으로 손 흔들기 → 꾸벅 인사(전용 도트 프레임)
//            → 나란히 오른쪽으로 쫄쫄 걸어감 (이때 STAGE 2 배너)
//  값은 config.meet. 신부는 맵 끝(깃발 근처)에 서 있다가 맵이 멈추면 화면 meet.brideScreenX 에 보입니다.
import { flagInfo } from '../engine/timing.js';
import { playSfx } from '../engine/audio.js';

export function buildMeet({ tl, refs, config, poses, flags }) {
  const E = config.meet;
  const L = config.layout;
  const fl = flagInfo(config);
  const meetX = E.brideScreenX - E.gap; // 신랑이 멈춰 서는 화면 x
  const fromX = fl.screenX - 56; // 깃대에서 내려온 자리

  // 1) 신부: 달리는 동안 이미 신랑 쪽(왼쪽)을 바라보고 서 있다가, 만난 뒤 앞모습으로 인사
  poses.add('bride', config.scenes.game.start, E.waveAt, 'sideStand', 'left');
  poses.add('bride', E.waveAt, E.bowAt, 'wave');

  // 2) 신랑: 걸어가서(옆모습 오른쪽) → 마주 보고 서기 → 앞모습으로 인사
  tl.fromTo(refs.groomWrap, { x: fromX }, { x: meetX, duration: E.walkEnd - E.walkFrom, ease: 'none', immediateRender: false }, E.walkFrom);
  poses.add('groom', E.walkFrom, E.walkEnd, 'walk', 'right');
  poses.add('groom', E.walkEnd, E.waveAt, 'sideStand', 'right');
  poses.add('groom', E.waveAt, E.bowAt, 'wave');

  // 3) 만나는 순간 하트가 좌우로 퍼지며 떠오름
  const cx = (meetX + E.brideScreenX) / 2;
  const cy = L.groundY - E.heartY;
  refs.hearts.forEach((h, i) => {
    const dx = (i % 2 ? 1 : -1) * Math.ceil((i + 1) / 2) * 52;
    const rise = 80 + ((i * 37) % 90);
    const y0 = cy + (i % 3) * 20;
    const t0 = E.heartsAt + i * E.heartStagger;
    tl.set(h, { x: cx + dx * 0.35, y: y0, xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.4 }, 0);
    tl.to(h, { autoAlpha: 1, scale: 1, duration: 0.22, ease: 'back.out(2)' }, t0);
    tl.to(h, { x: cx + dx, y: y0 - rise, duration: E.heartRise, ease: 'power1.out' }, t0);
    tl.to(h, { autoAlpha: 0, duration: 0.4, ease: 'power1.in' }, t0 + E.heartRise - 0.4);
  });
  tl.call(
    () => {
      if (!flags.silent) playSfx('pop', config.sfx);
    },
    null,
    E.heartsAt,
  );

  // 4) 꾸벅 인사 — 전용 도트 프레임(bow_1 살짝 / bow_2 깊이)으로: 숙임 → 머무름 → 고개 듦
  const bowMid = E.bowAt + E.bowDown;
  const bowUp = bowMid + E.bowHold;
  const bowEnd = bowUp + E.bowUp;
  for (const who of ['groom', 'bride']) {
    const off = who === 'bride' ? 0.1 : 0; // 신부가 아주 살짝 늦게 (같이 하면 로봇 같음)
    poses.add(who, E.bowAt + off, bowMid + off, 'bow1');
    poses.add(who, bowMid + off, bowUp + off, 'bow2');
    poses.add(who, bowUp + off, bowEnd + off, 'bow1');
    poses.add(who, bowEnd + off, E.strollAt, 'frontStand');
  }

  // 5) 나란히 오른쪽으로 쫄쫄 걸어감 (STAGE 2 배너와 같은 시각)
  const strollDur = E.strollEnd - E.strollAt;
  poses.add('groom', E.strollAt, E.strollEnd, 'walk', 'right');
  poses.add('bride', E.strollAt, E.strollEnd, 'walk', 'right');
  poses.add('groom', E.strollEnd, Infinity, 'sideStand', 'right');
  poses.add('bride', E.strollEnd, Infinity, 'sideStand', 'right');
  tl.fromTo(refs.groomWrap, { x: meetX }, { x: meetX + E.strollDist, duration: strollDur, ease: 'none', immediateRender: false }, E.strollAt);
  if (refs.brideWrap) {
    tl.set(refs.brideWrap, { x: 0 }, 0);
    tl.fromTo(refs.brideWrap, { x: 0 }, { x: E.strollDist, duration: strollDur, ease: 'none', immediateRender: false }, E.strollAt);
  }
}
