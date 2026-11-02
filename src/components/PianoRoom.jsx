// STAGE 1 배경: 피아노 학원 (벽 + 마룻바닥 + 피아노 + 액자 + 떠다니는 음표) — 전부 CSS 도형
const WHITE_KEYS = 14;
const KEY_W = 40;
const BLACK_AFTER = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12]; // 이 번호의 흰 건반 오른쪽에 검은 건반

export default function PianoRoom({ refs, config }) {
  const { groundY } = config.layout;
  const H = config.canvas.height;
  const notes = ['♪', '♫', '♪', '♫', '♪', '♫'];

  return (
    <div className="layer bgPiano" ref={(el) => (refs.bgPiano = el)}>
      <div className="wall" style={{ height: groundY }} />
      <div className="floor" style={{ top: groundY, height: H - groundY }} />

      {/* 벽 장식 */}
      <div className="frameArt" style={{ left: 150, top: 150, width: 210, height: 150 }} />
      <div className="frameArt" style={{ left: 420, top: 120, width: 140, height: 190 }} />
      <div className="frameArt" style={{ left: 1480, top: 140, width: 260, height: 160 }} />

      {/* 피아노 */}
      <div className="piano" style={{ left: 1250, top: groundY - 330 }}>
        <div className="pianoStand" />
        <div className="pianoKeys">
          {BLACK_AFTER.map((i) => (
            <i key={i} style={{ left: (i + 1) * KEY_W - 13 }} />
          ))}
        </div>
      </div>
      <div className="pianoStool" style={{ left: 1100, top: groundY - 70 }} />

      {/* 떠다니는 음표 (engine/ambient.js) */}
      {notes.map((ch, i) => (
        <span key={i} className="note" ref={(el) => (refs.notes[i] = el)} style={{ left: 1300 + i * 95, top: groundY - 380 }}>
          {ch}
        </span>
      ))}
    </div>
  );
}
