// 67~80초: 깃발을 내린 뒤 → 신랑이 신부에게 걸어가 만남(서로 마주 보는 옆모습)
//            → 하트가 터져 나오고 → HUD 하트 3개가 하나씩 다시 채워짐(scenes/hud.js)
//            → 둘 다 앞모습으로 돌아 손 흔들기 + 꾸벅 인사 → 짧은 번쩍임 + "STAGE 1 CLEAR!" 배너
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
  poses.add('bride', E.waveAt, Infinity, 'wave');

  // 2) 신랑: 걸어가서(옆모습 오른쪽) → 마주 보고 서기 → 앞모습으로 인사
  tl.fromTo(refs.groomWrap, { x: fromX }, { x: meetX, duration: E.walkEnd - E.walkFrom, ease: 'none', immediateRender: false }, E.walkFrom);
  poses.add('groom', E.walkFrom, E.walkEnd, 'walk', 'right');
  poses.add('groom', E.walkEnd, E.waveAt, 'sideStand', 'right');
  poses.add('groom', E.waveAt, Infinity, 'wave');

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

  // 4) 꾸벅 인사 — 지금 도트에는 "인사" 프레임이 없어서, 손 흔들기 + 몸을 살짝 숙이는 코드 모션으로 대신함(임시)
  for (const who of ['groom', 'bride']) {
    const bob = refs[`${who}Bob`];
    if (!bob) continue;
    tl.fromTo(
      bob,
      { y: 0, scaleY: 1 },
      { y: 26, scaleY: 0.93, duration: E.bowDur, yoyo: true, repeat: 1, ease: 'power1.inOut', transformOrigin: '50% 100%', immediateRender: false },
      E.bowAt + (who === 'bride' ? 0.12 : 0),
    );
    tl.set(bob, { y: 0, scaleY: 1 }, E.bowAt + E.bowDur * 2 + 0.3);
  }

  // 5) 짧은 번쩍임 (STAGE 1 CLEAR 배너와 같은 시각. 눈이 피로하지 않게 옅고 짧게)
  tl.set(refs.flash, { autoAlpha: 0 }, 0);
  tl.fromTo(refs.flash, { autoAlpha: 0 }, { autoAlpha: 0.7, duration: 0.1, ease: 'power2.out', immediateRender: false }, E.flashAt);
  tl.to(refs.flash, { autoAlpha: 0, duration: E.flashDur - 0.1, ease: 'power2.in' }, E.flashAt + 0.1);
}
