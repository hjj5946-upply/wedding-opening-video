// 피아노 학원 (27~41초 배경). 맵(하늘·언덕) 대신 실내를 보여 주고, 게임이 시작될 때 맵으로 바뀝니다.
//  납작한 색 + 네모만 씁니다 (블러/그림자 없음 → 60fps 안전). 값은 config.room, 피아노 그림은 config.piano.
//  층 순서: 맵(scene2) < 이 층(room) < 신랑

/** 음표 — 액자 안에 넣는 작은 도트 */
function Note({ cell, color }) {
  const rows = [
    '...ooo',
    '...oooo',
    '...oo.o',
    '...oo..',
    '...oo..',
    '...oo..',
    'ooooo..',
    'ooooo..',
    'oooo...',
  ];
  const w = Math.max(...rows.map((r) => r.length));
  const rects = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x] === 'o') {
        let n = 1;
        while (x + n < row.length && row[x + n] === 'o') n++;
        rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={n} height={1} fill={color} />);
        x += n;
      } else x++;
    }
  });
  return (
    <svg width={w * cell} height={rows.length * cell} viewBox={`0 0 ${w} ${rows.length}`} shapeRendering="crispEdges">
      {rects}
    </svg>
  );
}

export default function PianoRoom({ refs, config }) {
  const R = config.room;
  const P = config.piano;
  const { groundY } = config.layout;
  const { height: H } = config.canvas;
  const win = R.window;

  return (
    <div className="layer room" ref={(el) => (refs.room = el)}>
      {/* 벽 (위 / 허리 아래) + 몰딩 */}
      <div className="roomWall" style={{ height: R.railY, background: R.wall }} />
      <div className="roomRail" style={{ top: R.railY, background: R.rail }} />
      <div className="roomWainscot" style={{ top: R.railY + 10, height: groundY - R.railY - 10, background: R.wainscot }} />

      {/* 창문 */}
      <div className="roomWindow" style={{ left: win.x, top: win.y, width: win.w, height: win.h, background: win.frame }}>
        <div className="roomGlass" style={{ background: win.glass }} />
        <div className="roomSashV" style={{ background: win.sash }} />
        <div className="roomSashH" style={{ background: win.sash }} />
      </div>

      {/* 음표 액자 */}
      {R.frames.map((f, i) => (
        <div key={i} className="roomFrame" style={{ left: f.x, top: f.y, width: f.w, height: f.h, background: R.frameColor }}>
          <div className="roomFrameIn" style={{ background: R.frameInner }}>
            <Note cell={Math.round(f.h / 14)} color={R.noteColor} />
          </div>
        </div>
      ))}

      {/* 반 이름 팻말 (예: 쇼팽반) */}
      {R.sign && (
        <div className="roomSign" style={{ left: R.sign.x, top: R.sign.y, width: R.sign.w, height: R.sign.h, background: R.sign.frame }}>
          <div className="roomSignIn" style={{ background: R.sign.back, color: R.sign.color, fontSize: R.sign.size }}>
            {R.sign.text}
          </div>
        </div>
      )}

      {/* 마루 + 걸레받이 */}
      <div
        className="roomFloor"
        style={{
          top: groundY,
          height: H - groundY,
          backgroundColor: R.floor,
          //  마루 결 — 가로줄 (무거운 효과 없이 그라데이션 하나로)
          backgroundImage: `repeating-linear-gradient(180deg, transparent 0 ${R.plank - 6}px, ${R.floorLine} ${R.plank - 6}px ${R.plank}px)`,
        }}
      />
      <div className="roomBase" style={{ top: groundY - 16, background: R.baseboard }} />

      {/* 그랜드 피아노 (게임 맵이 아니라 이 방에 둡니다) */}
      <img className="pianoImg" src={P.src} alt="" style={{ left: P.x, width: P.w, bottom: H - P.bottomY }} />
    </div>
  );
}
