// 모든 장면을 하나의 GSAP 타임라인으로 조립합니다. (영상 = 이 타임라인 하나)
import gsap from 'gsap';
import { createPoseTrack } from './poses.js';
import { createDialogue } from './dialogue.js';
import { buildOpening } from '../scenes/opening.js';
import { buildStage1 } from '../scenes/stage1.js';
import { buildClear } from '../scenes/clear.js';
import { buildStage2 } from '../scenes/stage2.js';
import { buildEnding } from '../scenes/ending.js';
import { buildOverlays } from '../scenes/overlays.js';

export function buildTimeline({ refs, config, flags }) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  const poses = createPoseTrack();
  const dialogue = createDialogue({ refs, config, flags });
  const ctx = { tl, refs, config, flags, poses, dialogue };

  buildOpening(ctx);
  buildStage1(ctx);
  buildClear(ctx);
  buildStage2(ctx);
  buildEnding(ctx);
  buildOverlays(ctx);
  dialogue.addAll(tl);

  // 마지막 화면 고정: 타임라인 길이를 영상 끝 시각으로 맞춤 (끝나면 마지막 상태 그대로 멈춤)
  tl.set({}, {}, config.scenes.ending.end);

  // 프레임이 갱신될 때마다: 도트 프레임 교체 + 글자 타이핑
  const update = () => {
    const t = tl.time();
    refs.groomSprite?.setFrame(poses.frameAt('groom', t));
    refs.brideSprite?.setFrame(poses.frameAt('bride', t));
    dialogue.update(t);
  };
  tl.eventCallback('onUpdate', update);
  return { tl, update };
}
