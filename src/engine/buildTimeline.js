// 모든 장면을 하나의 GSAP 타임라인으로 조립합니다. (영상 = 이 타임라인 하나)
import gsap from 'gsap';
import { createPoseTrack } from './poses.js';
import { createDialogue } from './dialogue.js';
import { createStepTracker } from './steps.js';
import { totalDuration } from './timing.js';
import { stepSound } from './audio.js';
import { buildOpening } from '../scenes/opening.js';
import { buildDrop } from '../scenes/drop.js';
import { buildHud } from '../scenes/hud.js';
import { buildRun } from '../scenes/run.js';
import { buildMeet } from '../scenes/meet.js';
import { buildClosing } from '../scenes/closing.js';
import { buildOverlays } from '../scenes/overlays.js';

export function buildTimeline({ refs, config, flags }) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  const poses = createPoseTrack(config.sprites.fps);
  const steps = createStepTracker({ flags, onStep: (e) => stepSound(e, config.sfx.step) });
  const dialogue = createDialogue({ refs, config, flags });
  const ctx = { tl, refs, config, flags, poses, dialogue };

  buildOpening(ctx);
  buildDrop(ctx);
  const hud = buildHud(ctx);
  buildRun(ctx);
  buildMeet(ctx);
  buildClosing(ctx);
  buildOverlays(ctx);
  dialogue.addAll(tl);

  // 마지막 화면 고정: 타임라인 길이를 영상 끝 시각으로 맞춤 (끝나면 마지막 상태 그대로 멈춤)
  tl.set({}, {}, totalDuration(config));

  // 프레임이 갱신될 때마다: 도트 프레임/방향 교체 + 발걸음 이벤트 + 글자 타이핑
  const update = () => {
    const t = tl.time();
    for (const who of ['groom', 'bride']) {
      const p = poses.at(who, t);
      refs[`${who}Sprite`]?.setFrame(p.frame, p.facing);
      steps.update(who, p, t);
    }
    dialogue.update(t);
    hud.update(t);
  };
  tl.eventCallback('onUpdate', update);
  return { tl, update, poses, steps };
}
