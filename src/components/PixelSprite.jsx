// 도트 캐릭터 1개. setFrame('walkA') 처럼 ref로 프레임을 바꿉니다. (React 리렌더 없이 캔버스만 다시 그림)
import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { drawFrame } from '../sprites/draw.js';

const PixelSprite = forwardRef(function PixelSprite({ sprite, palette, scale }, ref) {
  const canvasRef = useRef(null);
  const current = useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      setFrame(name) {
        if (current.current === name || !canvasRef.current) return;
        current.current = name;
        drawFrame(canvasRef.current, sprite, name, palette);
      },
    }),
    [sprite, palette],
  );

  // 첫 그림은 layout effect로: 부모(App)가 타임라인을 만들고 프레임을 맞추기 "전에" 끝나야 덮어쓰지 않음
  useLayoutEffect(() => {
    drawFrame(canvasRef.current, sprite, 'stand', palette);
    current.current = 'stand';
  }, [sprite, palette]);

  return (
    <canvas
      ref={canvasRef}
      width={sprite.w}
      height={sprite.h}
      style={{ width: sprite.w * scale, height: sprite.h * scale, imageRendering: 'pixelated', display: 'block' }}
    />
  );
});

export default PixelSprite;
