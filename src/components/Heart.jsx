// 도트 하트 1개 (캔버스). className 으로 용도 구분 (만남 하트 / HUD 라이프)
import { heartSprite } from '../sprites/heart.js';
import { drawMatrix } from '../sprites/draw.js';

export default function Heart({ palette, scale, innerRef, className = 'heart', style }) {
  return (
    <canvas
      ref={(el) => {
        innerRef?.(el);
        if (el) drawMatrix(el, heartSprite, palette);
      }}
      className={className}
      width={heartSprite.w}
      height={heartSprite.h}
      style={{ width: heartSprite.w * scale, height: heartSprite.h * scale, imageRendering: 'pixelated', ...style }}
    />
  );
}
