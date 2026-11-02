// 글자 격자 도트 → SVG 사각형 (같은 색이 가로로 이어지면 사각형 하나로 합쳐서 요소 수를 줄임)
//  art = { cell, colors: { 글자: 색 }, rows: [...] }   (sprites/props.js)
export default function PixelArt({ art, cell = art.cell, className, style }) {
  const w = Math.max(...art.rows.map((r) => r.length));
  const h = art.rows.length;
  const rects = [];
  art.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let n = 1;
      while (x + n < row.length && row[x + n] === ch) n++;
      if (ch !== '.' && art.colors[ch]) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={n} height={1} fill={art.colors[ch]} />);
      x += n;
    }
  });
  return (
    <svg className={className} style={style} width={w * cell} height={h * cell} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges">
      {rects}
    </svg>
  );
}
