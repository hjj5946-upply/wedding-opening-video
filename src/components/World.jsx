// STAGE 2 배경: 하늘 + 구름(느리게) + 땅/장애물/덤불/신부(빠르게 흐르는 world)
import Character from './Character.jsx';
import { brideSprite } from '../sprites/bride.js';
import { OBSTACLE_TYPES, obstacleX, stage2Distance } from '../engine/timing.js';

// 도트 모양 도형: [x,y,w,h] 칸 목록을 SVG 사각형으로 (cell = 1칸 px)
function PixelShape({ rects, cell, fill, shade, className, style }) {
  const w = Math.max(...rects.map(([x, , rw]) => x + rw)) * cell;
  const h = Math.max(...rects.map(([, y, , rh]) => y + rh)) * cell;
  return (
    <svg className={className} style={style} width={w} height={h} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges">
      {rects.map(([x, y, rw, rh], i) => (
        <rect key={i} x={x * cell} y={y * cell} width={rw * cell} height={rh * cell} fill={i === rects.length - 1 && shade ? shade : fill} />
      ))}
    </svg>
  );
}

const CLOUD = [[4, 0, 6, 1], [2, 1, 10, 1], [1, 2, 13, 1], [0, 3, 15, 2]];
const BUSH = [[2, 0, 4, 1], [1, 1, 6, 1], [0, 2, 8, 2]];

// 매번 같은 구름 배치가 나오도록 고정 시드 난수
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function World({ refs, config, charStyle, charW }) {
  const { groundY, spriteScale } = config.layout;
  const H = config.canvas.height;
  const P = config.stage2;
  const dist = stage2Distance(config);
  const worldW = dist + config.canvas.width + 400;
  const cloudsW = dist * P.cloudParallax + config.canvas.width + 400;

  const rand = mulberry32(7);
  const clouds = [];
  for (let x = 0; x < cloudsW; x += 380) {
    clouds.push({ x: x + rand() * 120, y: 50 + rand() * 330, s: 0.8 + rand() * 0.9 });
  }

  const brideCenterX = dist + P.brideScreenX;

  return (
    <div className="layer scene2" ref={(el) => (refs.scene2 = el)}>
      <div className="sky" />
      <div className="clouds" ref={(el) => (refs.clouds = el)} style={{ width: cloudsW }}>
        {clouds.map((c, i) => (
          <PixelShape key={i} rects={CLOUD} cell={16 * c.s} fill="#ffffff" shade="#d6ecff" className="cloud" style={{ left: c.x, top: c.y }} />
        ))}
      </div>
      <div className="world" ref={(el) => (refs.world = el)} style={{ width: worldW }}>
        <div className="ground" style={{ top: groundY, height: H - groundY }} />
        {P.bushes.map((x, i) => (
          <PixelShape key={i} rects={BUSH} cell={16} fill="#3aa84a" shade="#2b7d37" className="bush" style={{ left: x, top: groundY - 64 }} />
        ))}
        {P.obstacles.map((ob, i) => {
          const def = OBSTACLE_TYPES[ob.type];
          return (
            <div key={i} className={`obstacle ${ob.type}`} style={{ left: obstacleX(config, ob), top: groundY - def.h, width: def.w, height: def.h }} />
          );
        })}
        <Character
          who="bride"
          sprite={brideSprite}
          palette={config.palette}
          scale={spriteScale}
          refs={refs}
          bubble={config.bubble}
          style={{ ...charStyle, left: brideCenterX - charW / 2 }}
        />
      </div>
    </div>
  );
}
