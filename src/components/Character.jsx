// 캐릭터 = [말풍선 + (통통 튀는 .bob > 도트)] 를 감싼 wrapper
//  - wrapper(Wrap): 이동/점프는 이 요소를 움직임
//  - bob: 말할 때 살짝 튀는 용도(점프와 안 겹치게 분리)
import PixelSprite from './PixelSprite.jsx';
import Bubble from './Bubble.jsx';

export default function Character({ who, sprite, palette, scale, refs, style, bubble }) {
  return (
    <div className={`character ${who}`} ref={(el) => (refs[`${who}Wrap`] = el)} style={style}>
      <Bubble ref={(h) => (refs[`${who}Bubble`] = h)} fontSize={bubble.fontSize} maxWidth={bubble.maxWidth} />
      <div className="bob" ref={(el) => (refs[`${who}Bob`] = el)}>
        <PixelSprite ref={(h) => (refs[`${who}Sprite`] = h)} sprite={sprite} palette={palette} scale={scale} />
      </div>
    </div>
  );
}
