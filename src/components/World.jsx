// 플랫포머 맵: 하늘 + 구름(느리게) + 언덕(중간) + 땅/소품/장애물/신부(빠르게 흐르는 world)
//  일반적인 플랫포머 요소만 사용한 오리지널 도트 (특정 게임의 그래픽을 따라 그리지 않음)
//  스크롤은 scenes/run.js 가 refs.world / refs.hills / refs.clouds 의 x를 움직여서 처리
import Character from './Character.jsx';
import PixelArt from './PixelArt.jsx';
import { brideSprite } from '../sprites/bride.js';
import { piano, hill, cloud, bush } from '../sprites/props.js';
import { PIANO_SIZE, leftForApex, runDistance } from '../engine/timing.js';

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
  const M = config.map;
  const dist = runDistance(config);
  const worldW = dist + W + 800;
  const rand = mulberry32(M.decorSeed);

  // 장애물(피아노 등) 근처에는 덤불을 두지 않음 (장애물처럼 보이지 않게)
  const pianoX = leftForApex(config, M.piano.apexAt, PIANO_SIZE.w);
  const busy = [[pianoX - 200, pianoX + PIANO_SIZE.w + 200], ...M.pipes.map((p) => [p.x - 100, p.x + 250])];
  const free = (x, w) => !busy.some(([a, b]) => x + w > a && x < b);

  const clouds = [];
  for (let x = 0; x < dist * M.parallax.clouds + W + 400; x += 420) clouds.push({ x: x + rand() * 160, y: 110 + rand() * 260, s: 0.8 + rand() * 0.8 });
  const hills = [];
  for (let x = -200; x < dist * M.parallax.hills + W + 400; x += 700 + rand() * 500) hills.push({ x, s: 0.7 + rand() * 0.7 });
  const bushes = [];
  for (let x = 250; x < worldW; x += 500 + rand() * 600) if (free(x, 180)) bushes.push({ x, s: rand() < 0.5 ? 1 : 1.4 });

  const brideCenterX = dist + config.ending.brideScreenX;

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
        <div className="ground" style={{ top: groundY, height: config.canvas.height - groundY }} />
        {bushes.map((b, i) => (
          <PixelArt key={i} art={bush} cell={16 * b.s} className="prop" style={{ left: b.x, top: groundY - bush.rows.length * 16 * b.s }} />
        ))}
        {M.blockRows.map((r, i) => (
          <BlockRow key={i} {...r} />
        ))}
        {M.pipes.map((p, i) => (
          <Pipe key={i} {...p} groundY={groundY} />
        ))}
        <PixelArt art={piano} className="prop obstacle" style={{ left: pianoX, top: groundY - PIANO_SIZE.h }} />
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
