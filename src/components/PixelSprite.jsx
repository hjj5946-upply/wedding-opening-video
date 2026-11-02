// 도트 캐릭터 1개. ref.setFrame('walk_1', 'left') 처럼 프레임과 방향을 바꿉니다. (React 리렌더 없이 캔버스만 다시 그림)
//  - PNG(public/assets/sprites/<id>/<프레임>.png)가 있으면 PNG, 없으면 코드 도트
//  - 왼쪽을 볼 땐 이 캔버스만 좌우 반전 → 말풍선 등 바깥 요소는 뒤집히지 않음
//  - 앞모습 프레임(sprite.view[frame] === 'front')은 반전하지 않음
import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { drawGrid } from '../sprites/draw.js';
import { spriteImage } from '../sprites/images.js';

function paint(canvas, sprite, frame, palette) {
  const png = spriteImage(sprite.id, frame);
  if (png?.ready) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(png.img, 0, 0, canvas.width, canvas.height);
    return;
  }
  drawGrid(canvas, sprite.frames[frame] ?? sprite.frames[Object.keys(sprite.frames)[0]], palette);
  // PNG가 아직 로딩 중이면 다 받은 뒤 다시 그림 (그때도 같은 프레임일 때만)
  if (png && !png.ready) png.waiters.push(() => canvas.dataset.frame === frame && paint(canvas, sprite, frame, palette));
}

const PixelSprite = forwardRef(function PixelSprite({ sprite, palette, scale, initial = 'frontStand_1', className }, ref) {
  const canvasRef = useRef(null);
  const state = useRef({ frame: null, flip: null });

  const apply = (frame, facing) => {
    const c = canvasRef.current;
    if (!c) return;
    if (!sprite.frames[frame]) frame = initial;
    if (state.current.frame !== frame) {
      state.current.frame = frame;
      c.dataset.frame = frame;
      paint(c, sprite, frame, palette);
    }
    const flip = facing === 'left' && sprite.view[frame] === 'side';
    if (state.current.flip !== flip) {
      state.current.flip = flip;
      c.style.transform = flip ? 'scaleX(-1)' : '';
    }
  };

  useImperativeHandle(ref, () => ({ setFrame: apply }), [sprite, palette]); // eslint-disable-line react-hooks/exhaustive-deps

  // 첫 그림은 layout effect로: 부모(App)가 타임라인을 만들고 프레임을 맞추기 "전에" 끝나야 덮어쓰지 않음
  useLayoutEffect(() => {
    state.current = { frame: null, flip: null };
    apply(initial, 'right');
  }, [sprite, palette]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={sprite.w}
      height={sprite.h}
      style={{ width: sprite.w * scale, height: sprite.h * scale, imageRendering: 'pixelated', display: 'block' }}
    />
  );
});

export default PixelSprite;
