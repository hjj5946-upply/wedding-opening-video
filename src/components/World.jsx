// 플랫포머 맵: 하늘 + 구름(느리게) + 언덕(중간) + 땅/소품/상자/장애물/계단/깃발/신부(빠르게 흐르는 world)
//  슈퍼마리오 "스타일"의 일반적인 플랫포머 요소만 직접 도트/CSS로 그립니다 (원작 이미지·캐릭터·로고 사용 안 함)
//  스크롤은 scenes/game.js 가 refs.world / refs.hills / refs.clouds 의 x를 움직여서 처리
import Character from './Character.jsx';
import PixelArt from './PixelArt.jsx';
import { brideSprite } from '../sprites/bride.js';
import { hill, cloud, bush } from '../sprites/props.js';
import { allBoxes, allPits, allObstacles, stairsInfo, flagInfo, scrollMax, worldWidth } from '../engine/timing.js';

// 매번 같은 배치가 나오도록 고정 시드 난수
function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BLOCK = 64;

function Pipe({ x, h, groundY }) {
  const bodyH = h * 64;
  return (
    <div className="pipe" style={{ left: x, top: groundY - bodyH - 56, height: bodyH + 56 }}>
      <div className="pipeRim" />
      <div className="pipeBody" />
    </div>
  );
}

function BlockRow({ x, y, pattern }) {
  return [...pattern].map((ch, i) => (
    <div key={i} className={`block ${ch === '?' ? 'question' : 'brick'}`} style={{ left: x + i * BLOCK, top: y }}>
      {ch === '?' ? '?' : null}
    </div>
  ));
}

export default function World({ refs, config, charStyle, charW }) {
  const { groundY } = config.layout;
  const W = config.canvas.width;
  const H = config.canvas.height;
  const M = config.map;
  const worldW = worldWidth(config);
  const rand = mulberry32(M.decorSeed);

  const boxes = allBoxes(config);
  const pits = allPits(config);
  const words = allObstacles(config);
  const stairs = stairsInfo(config);
  const flag = flagInfo(config);
  const P = config.piano;

  // 땅: 낭떠러지(pit)를 빼고 남은 구간만 그림
  const grounds = [];
  {
    let x = 0;
    for (const p of [...pits].sort((a, b) => a.left - b.left)) {
      if (p.left > x) grounds.push({ x, w: p.left - x });
      x = p.left + p.w;
    }
    grounds.push({ x, w: Math.max(0, worldW - x) });
  }

  // 장식(덤불)을 두지 않을 구간 — 장애물/상자/낭떠러지/계단/깃발/피아노 근처
  const busy = [
    [P.x - 120, P.x + P.w + 120],
    ...words.map((o) => [o.left - 200, o.left + o.w + 200]),
    ...pits.map((p) => [p.left - 160, p.left + p.w + 160]),
    ...M.pipes.map((p) => [p.x - 100, p.x + 250]),
    [stairs.left - 300, worldW],
  ];
  const free = (x, w) => !busy.some(([a, b]) => x + w > a && x < b);
  const onGround = (x, w) => grounds.some((g) => x >= g.x && x + w <= g.x + g.w);

  const clouds = [];
  for (let x = 0; x < scrollMax(config) * M.parallax.clouds + W + 400; x += 420) clouds.push({ x: x + rand() * 160, y: 110 + rand() * 260, s: 0.8 + rand() * 0.8 });
  const hills = [];
  for (let x = -200; x < scrollMax(config) * M.parallax.hills + W + 400; x += 700 + rand() * 500) hills.push({ x, s: 0.7 + rand() * 0.7 });
  const bushes = [];
  for (let x = 250; x < worldW; x += 480 + rand() * 520) if (free(x, 180) && onGround(x, 180)) bushes.push({ x, s: rand() < 0.5 ? 1 : 1.4 });

  const brideCenterX = scrollMax(config) + config.meet.brideScreenX; // 맵이 멈추면 화면 x = meet.brideScreenX

  return (
    <div className="layer scene2" ref={(el) => (refs.map = el)}>
      <div className="sky" />
      <div className="parallax" ref={(el) => (refs.clouds = el)}>
        {clouds.map((c, i) => (
          <PixelArt key={i} art={cloud} cell={16 * c.s} className="prop" style={{ left: c.x, top: c.y }} />
        ))}
      </div>
      <div className="parallax" ref={(el) => (refs.hills = el)}>
        {hills.map((h, i) => (
          <PixelArt key={i} art={hill} cell={16 * h.s} className="prop" style={{ left: h.x, top: groundY - hill.rows.length * 16 * h.s }} />
        ))}
      </div>

      <div className="world" ref={(el) => (refs.world = el)} style={{ width: worldW }}>
        {/* 땅 (낭떠러지 구간은 비어 있음) */}
        {grounds.map((g, i) => (
          <div key={i} className="ground" style={{ left: g.x, width: g.w, top: groundY, height: H - groundY }} />
        ))}

        {/* 장식 */}
        {bushes.map((b, i) => (
          <PixelArt key={i} art={bush} cell={16 * b.s} className="prop" style={{ left: b.x, top: groundY - bush.rows.length * 16 * b.s }} />
        ))}
        {M.blockRows.map((r, i) => (
          <BlockRow key={i} {...r} />
        ))}
        {M.pipes.map((p, i) => (
          <Pipe key={i} {...p} groundY={groundY} />
        ))}

        {/* 그랜드 피아노 (이미지) */}
        <img className="pianoImg" src={P.src} alt="" style={{ left: P.x, width: P.w, bottom: H - P.bottomY }} />

        {/* 물음표상자 8개 = 1~8년. 치면 빈 상자(갈색)로 바뀜 */}
        {boxes.map((b) => (
          <div key={b.id} className="qbox" ref={(el) => (refs.boxes[b.id] = el)} style={{ left: b.left, top: b.top, width: b.w, height: b.h }}>
            <div className="qboxFace" ref={(el) => (refs.boxFaces[b.id] = el)}>
              ?
            </div>
            <div className="qboxUsed" ref={(el) => (refs.boxUsed[b.id] = el)} />
          </div>
        ))}

        {/* 글자 장애물 — 부딪히는 것(hit)은 넘어지며 사라짐(scenes/game.js) */}
        {words.map((o) => (
          <div
            key={o.id}
            className={`wordObstacle ${o.hit ? 'hitType' : 'jumpType'}`}
            ref={(el) => (refs.obstacles[o.id] = el)}
            style={{ left: o.left, top: groundY - o.h, width: o.w, height: o.h, fontSize: o.fontSize }}
          >
            <span>{o.text}</span>
          </div>
        ))}

        {/* 계단 (마지막 구간) */}
        {Array.from({ length: stairs.steps }, (_, i) => (
          <div
            key={i}
            className="stairStep"
            style={{ left: stairs.left + i * stairs.stepW, top: groundY - (i + 1) * stairs.stepH, width: stairs.stepW, height: (i + 1) * stairs.stepH }}
          />
        ))}

        {/* 깃대 + 깃발 */}
        <div className="flagPole" style={{ left: flag.left, top: groundY - flag.poleH, height: flag.poleH }}>
          <div className="flagBall" />
          <div className="flagCloth" ref={(el) => (refs.flagCloth = el)} />
        </div>
        <div className="flagBase" style={{ left: flag.left - 28, top: groundY - 64 }} />

        <Character
          who="bride"
          sprite={brideSprite}
          palette={config.palette}
          scale={config.sprites.scale}
          refs={refs}
          bubble={config.bubble}
          style={{ ...charStyle, left: brideCenterX - charW / 2 }}
        />
      </div>
    </div>
  );
}
