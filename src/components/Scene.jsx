// 화면에 올라가는 모든 요소를 층(layer)으로 쌓아 둔 곳. 움직임은 전부 src/scenes/*.js 의 타임라인이 담당.
//  z-index 순서(styles.css): 맵(scene2) < 신랑 < 하트 < HUD < 마지막카드 < 배너 < 번쩍임
//  오프닝(0~23초)은 아무 배경 없이 순수 검정(.canvas 배경색)
import Character from './Character.jsx';
import World from './World.jsx';
import { groomSprite } from '../sprites/groom.js';
import { fillTokens } from '../engine/timing.js';
import Heart from './Heart.jsx';
import Hud from './Hud.jsx';

export default function Scene({ refs, config }) {
  const { groundY } = config.layout;
  const spriteScale = config.sprites.scale;
  const charW = groomSprite.w * spriteScale;
  const charH = groomSprite.h * spriteScale;
  const charStyle = { width: charW, height: charH, top: groundY - charH };

  return (
    <>
      <World refs={refs} config={config} charStyle={charStyle} charW={charW} />

      {/* 신랑 (화면 좌표 기준으로 움직임) */}
      <Character who="groom" sprite={groomSprite} palette={config.palette} scale={spriteScale} refs={refs} bubble={config.bubble} style={{ ...charStyle, left: 0 }} />

      <Hud refs={refs} config={config} />

      {/* 만남 하트 */}
      <div className="layer heartsLayer">
        {Array.from({ length: config.ending.heartCount }, (_, i) => (
          <Heart key={i} palette={config.palette} scale={6} innerRef={(el) => (refs.hearts[i] = el)} />
        ))}
      </div>

      {/* 마지막 고정 카드 */}
      <div className="layer finalCard" ref={(el) => (refs.finalCard = el)}>
        {config.finalCard.lines.map((l, i) => (
          <div key={i} className="fcLine" style={{ fontSize: l.size, color: l.color }}>
            {fillTokens(l.text, config)}
          </div>
        ))}
      </div>

      {/* 큰 글자 배너 */}
      {config.banners.map((b) => (
        <div key={b.id} className="layer banner" ref={(el) => (refs.banners[b.id] = el)}>
          <div className="bannerMain">{fillTokens(b.text, config)}</div>
          {b.sub && <div className="bannerSub">{fillTokens(b.sub, config)}</div>}
        </div>
      ))}

      {/* 번쩍임(STAGE CLEAR) */}
      <div className="layer flash" ref={(el) => (refs.flash = el)} />
    </>
  );
}
