// 화면에 올라가는 모든 요소를 층(layer)으로 쌓아 둔 곳. 움직임은 전부 src/scenes/*.js 의 타임라인이 담당.
//  z-index 순서(styles.css): 맵(scene2) < 신랑 < 하트·HUD·사진 < 게임 자막칸 < 배너 < 번쩍임 < 검정 페이드 < 마무리 글자
//  오프닝(0~23초)은 아무 배경 없이 순수 검정(.canvas 배경색)
import Character from './Character.jsx';
import World from './World.jsx';
import Bubble from './Bubble.jsx';
import { groomSprite } from '../sprites/groom.js';
import { fillTokens } from '../engine/timing.js';
import Heart from './Heart.jsx';
import Hud from './Hud.jsx';

/** 연도별 사진 액자. 파일이 없으면 "N YEAR" 글자 액자가 그대로 보입니다 */
function PhotoFrame({ photo, P, innerRef }) {
  return (
    <div className="photoFrame" ref={innerRef} style={{ right: P.right, top: P.top, width: P.w, height: P.h }}>
      <div className="photoInner">
        <div className="photoFallback">{photo.year} YEAR</div>
        <img src={P.dir + photo.src} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
      </div>
      <div className="photoCaption">{photo.year} YEAR</div>
    </div>
  );
}

export default function Scene({ refs, config }) {
  const { groundY } = config.layout;
  const spriteScale = config.sprites.scale;
  const charW = groomSprite.w * spriteScale;
  const charH = groomSprite.h * spriteScale;
  const charStyle = { width: charW, height: charH, top: groundY - charH };
  const C = config.closing;
  const P = config.photos;
  const GB = config.bubble.game;

  return (
    <>
      <World refs={refs} config={config} charStyle={charStyle} charW={charW} />

      {/* 신랑 (화면 좌표 기준으로 움직임) */}
      <Character who="groom" sprite={groomSprite} palette={config.palette} scale={spriteScale} refs={refs} bubble={config.bubble} style={{ ...charStyle, left: 0 }} />

      <Hud refs={refs} config={config} />

      {/* 물음표상자에서 튀어나오는 하트 (3개를 돌려 씀) */}
      <div className="layer heartsLayer">
        {Array.from({ length: 3 }, (_, i) => (
          <Heart key={i} palette={config.palette} scale={5} innerRef={(el) => (refs.boxHearts[i] = el)} />
        ))}
      </div>

      {/* 만남 하트 */}
      <div className="layer heartsLayer">
        {Array.from({ length: config.meet.heartCount }, (_, i) => (
          <Heart key={i} palette={config.palette} scale={6} innerRef={(el) => (refs.hearts[i] = el)} />
        ))}
      </div>

      {/* 연도별 사진 팝업 (화면 오른쪽 위) */}
      <div className="layer photoLayer">
        {P.list.map((photo, i) => (
          <PhotoFrame key={photo.year} photo={photo} P={P} innerRef={(el) => (refs.photos[i] = el)} />
        ))}
      </div>

      {/* 게임 구간 자막칸 (화면 아래 고정 — 상자/사진/HUD 와 안 겹침) */}
      <div className="layer gameBubbleLayer" style={{ left: GB.x, top: GB.y }}>
        <Bubble ref={(h) => (refs.gameBubble = h)} bubble={config.bubble} />
      </div>

      {/* 큰 글자 배너 */}
      {config.banners.map((b) => (
        <div key={b.id} className="layer banner" ref={(el) => (refs.banners[b.id] = el)}>
          <div className="bannerMain">{fillTokens(b.text, config)}</div>
          {b.sub && <div className="bannerSub">{fillTokens(b.sub, config)}</div>}
        </div>
      ))}

      {/* 번쩍임(STAGE 1 CLEAR) */}
      <div className="layer flash" ref={(el) => (refs.flash = el)} />

      {/* 검정 페이드 — 맵·캐릭터·HUD·배너를 전부 덮음 */}
      <div className="layer blackout" ref={(el) => (refs.blackout = el)} />

      {/* 마무리 감사 인사 (한 줄씩 나타났다 사라짐) */}
      <div className="layer closing">
        {C.lines.map((l, i) => (
          <div
            key={i}
            className="clLine"
            ref={(el) => (refs.closingLines[i] = el)}
            style={{ fontSize: l.size ?? C.size, color: l.color ?? C.color, maxWidth: C.maxWidth }}
          >
            {fillTokens(l.text, config)}
          </div>
        ))}
      </div>
    </>
  );
}
