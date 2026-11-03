// 마무리 장면 층 — 검정 페이드 "위", 감사 인사 글자 "아래".
//  배경은 없습니다(순수 검정). 신랑은 왼쪽 바깥, 신부는 오른쪽 바깥에서 걸어 들어와
//  가운데에서 앞을 보고 서 있다가, 마지막 줄에서 함께 꾸벅 인사합니다.
//  움직임(걸어오기·숨·하트·꾸벅)은 전부 scenes/closing.js 의 타임라인이 담당. 값은 config.closing.stage.
import PixelSprite from './PixelSprite.jsx';
import Heart from './Heart.jsx';
import { groomSprite } from '../sprites/groom.js';
import { brideSprite } from '../sprites/bride.js';

export default function ClosingStage({ refs, config }) {
  const S = config.closing.stage;
  const charW = groomSprite.w * S.scale;
  const charH = groomSprite.h * S.scale;
  const top = S.feetY - charH;
  const cx = config.canvas.width / 2;

  // 가운데에서 멈추는 자리 (신랑이 왼쪽, 신부가 오른쪽)
  const pair = [
    { who: 'closeGroom', sprite: groomSprite, left: cx - S.gap / 2 - charW },
    { who: 'closeBride', sprite: brideSprite, left: cx + S.gap / 2 },
  ];

  return (
    <div className="layer closingStage" ref={(el) => (refs.closingStage = el)}>
      {/* 두 사람 사이에서 천천히 떠오르는 하트 */}
      {Array.from({ length: S.hearts.count }, (_, i) => (
        <Heart key={i} palette={config.palette} scale={S.hearts.scale} className="heart clHeart" innerRef={(el) => (refs.closingHearts[i] = el)} />
      ))}

      {pair.map((p) => (
        <div key={p.who} className="clChar" ref={(el) => (refs[`${p.who}Wrap`] = el)} style={{ left: p.left, top, width: charW, height: charH }}>
          <div className="clBob" ref={(el) => (refs[`${p.who}Bob`] = el)}>
            <PixelSprite ref={(h) => (refs[`${p.who}Sprite`] = h)} sprite={p.sprite} palette={config.palette} scale={S.scale} />
          </div>
        </div>
      ))}
    </div>
  );
}
