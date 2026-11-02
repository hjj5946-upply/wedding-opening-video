// 캐릭터 = [말풍선 + (통통 튀는 .bob > 도트)] 를 감싼 wrapper
//  - 좌우 반전은 도트 캔버스(PixelSprite)에만 적용 → 말풍선은 뒤집히지 않음
//  - wrapper(Wrap): 이동/점프는 이 요소를 움직임
//  - bob: 말할 때 살짝 튀는 용도(점프와 안 겹치게 분리)
import PixelSprite from './PixelSprite.jsx';
import Bubble from './Bubble.jsx';

export default function Character({ who, sprite, palette, scale, refs, style, bubble }) {
  return (
    <div className={`character ${who}`} ref={(el) => (refs[`${who}Wrap`] = el)} style={style}>
      <Bubble ref={(h) => (refs[`${who}Bubble`] = h)} bubble={bubble} />
      <div className="bob" ref={(el) => (refs[`${who}Bob`] = el)}>
        <PixelSprite ref={(h) => (refs[`${who}Sprite`] = h)} sprite={sprite} palette={palette} scale={scale} />
      </div>
    </div>
  );
}
