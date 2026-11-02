// 도트 확인 화면 (영상과 무관한 개발용). 주소: http://localhost:5173/?sprites
//   ?sprites            모든 프레임(오른쪽/왼쪽 반전) + 아래 줄은 포즈 트랙으로 움직이는 미리보기
//   ?sprites&t=0.4      움직이는 미리보기를 0.4초 시점에 멈춤 (캡처/프레임 확인용)
//   ?sprites&scale=6    확대 배율 바꾸기
// 움직이는 줄은 실제 영상과 같은 poses.js / steps.js 를 쓰므로, 발걸음 이벤트 횟수도 같이 표시됩니다.
import { useEffect, useRef } from 'react';
import config from '../config.js';
import Stage from './Stage.jsx';
import PixelSprite from './PixelSprite.jsx';
import { groomSprite } from '../sprites/groom.js';
import { brideSprite } from '../sprites/bride.js';
import { pngFrames } from '../sprites/images.js';
import { createPoseTrack, POSES } from '../engine/poses.js';
import { createStepTracker } from '../engine/steps.js';

const params = new URLSearchParams(window.location.search);
const SCALE = Number(params.get('scale')) || 4;
const FREEZE = params.has('t') ? Number(params.get('t')) : null;

function Cell({ sprite, frame, facing = 'right', label, scale = SCALE }) {
  const ref = useRef(null);
  useEffect(() => ref.current?.setFrame(frame, facing), [frame, facing]);
  const png = pngFrames.includes(`${sprite.id}/${frame}`);
  return (
    <div className="gCell">
      <PixelSprite ref={ref} sprite={sprite} palette={config.palette} scale={scale} initial={frame} />
      <div className="gLabel">
        {label ?? frame}
        {png ? ' (PNG)' : ''}
      </div>
    </div>
  );
}

function Row({ title, bg, children }) {
  return (
    <div className={`gRow ${bg}`}>
      <div className="gTitle">{title}</div>
      <div className="gCells">{children}</div>
    </div>
  );
}

// 움직이는 미리보기: 각 칸이 포즈 트랙 하나
const LIVE = [
  { id: 'gwl', sprite: groomSprite, who: 'groom', pose: 'walk', facing: 'left', label: '걷기 ←' },
  { id: 'gwr', sprite: groomSprite, who: 'groom', pose: 'walk', facing: 'right', label: '걷기 →' },
  { id: 'grr', sprite: groomSprite, who: 'groom', pose: 'run', facing: 'right', label: '달리기 →' },
  { id: 'grl', sprite: groomSprite, who: 'groom', pose: 'run', facing: 'left', label: '달리기 ←' },
  { id: 'gwv', sprite: groomSprite, who: 'groom', pose: 'wave', facing: 'right', label: '손 흔들기' },
  { id: 'bwv', sprite: brideSprite, who: 'bride', pose: 'wave', facing: 'right', label: '신부 손 흔들기' },
  { id: 'bsl', sprite: brideSprite, who: 'bride', pose: 'sideStand', facing: 'left', label: '신부 옆 ←' },
];

function Live() {
  const refs = useRef({});
  const info = useRef(null);
  useEffect(() => {
    const poses = createPoseTrack(config.sprites.fps);
    LIVE.forEach((l) => poses.add(l.id, 0, Infinity, l.pose, l.facing));
    const flags = { silent: false };
    const steps = createStepTracker({ flags });
    const t0 = performance.now();
    let raf;
    const draw = () => {
      const t = FREEZE ?? (performance.now() - t0) / 1000;
      for (const l of LIVE) {
        const p = poses.at(l.id, t);
        refs.current[l.id]?.setFrame(p.frame, p.facing);
        if (FREEZE == null) steps.update(l.id, p, t);
        const lab = refs.current[`${l.id}-f`];
        if (lab) lab.textContent = p.frame;
      }
      if (info.current) {
        const e = steps.lastEvent;
        info.current.textContent =
          `t = ${t.toFixed(2)}s   발걸음 이벤트 ${steps.count}회` +
          (e ? `   (마지막: ${e.who === 'grr' || e.who === 'grl' ? '달리기' : '걷기'} ${e.frame})` : '') +
          `   · sfx.step.enabled = ${config.sfx.step.enabled}`;
      }
      if (FREEZE == null) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <Row title={`움직이는 포즈 (실제 poses.js 사용 · fps ${JSON.stringify(config.sprites.fps)})`} bg="gBlack">
      {LIVE.map((l) => (
        <div className="gCell" key={l.id}>
          <PixelSprite ref={(h) => (refs.current[l.id] = h)} sprite={l.sprite} palette={config.palette} scale={SCALE} />
          <div className="gLabel">{l.label}</div>
          <div className="gLabel dim" ref={(el) => (refs.current[`${l.id}-f`] = el)} />
        </div>
      ))}
      <div className="gInfo" ref={info} />
    </Row>
  );
}

export default function SpriteGallery() {
  const side = (s) => Object.keys(s.frames).filter((f) => s.view[f] === 'side');
  const front = (s) => Object.keys(s.frames).filter((f) => s.view[f] === 'front');
  return (
    <Stage width={config.canvas.width} height={config.canvas.height}>
      <div className="gallery">
        <div className="gHead">
          도트 확인 (24×32칸 · 화면 배율 {config.sprites.scale}배 = {groomSprite.w * config.sprites.scale}×{groomSprite.h * config.sprites.scale}px · 여기선 {SCALE}배) — 포즈:{' '}
          {Object.keys(POSES).join(' / ')}
        </div>
        <Row title="신랑 옆모습 → (원본, 검정 배경)" bg="gBlack">
          {side(groomSprite).map((f) => <Cell key={f} sprite={groomSprite} frame={f} />)}
        </Row>
        <Row title="신랑 옆모습 ← (좌우 반전, 맵 하늘 배경)" bg="gSky">
          {side(groomSprite).map((f) => <Cell key={f} sprite={groomSprite} frame={f} facing="left" />)}
        </Row>
        <Row title="신랑 앞모습 (검정) · 신부 (하늘)" bg="gSplit">
          {front(groomSprite).map((f) => <Cell key={f} sprite={groomSprite} frame={f} />)}
          <div className="gGap" />
          {front(brideSprite).map((f) => <Cell key={f} sprite={brideSprite} frame={f} />)}
          {side(brideSprite).map((f) => <Cell key={f} sprite={brideSprite} frame={f} label={`${f} →`} />)}
          {side(brideSprite).map((f) => <Cell key={`${f}L`} sprite={brideSprite} frame={f} facing="left" label={`${f} ←`} />)}
        </Row>
        <Live />
      </div>
    </Stage>
  );
}
