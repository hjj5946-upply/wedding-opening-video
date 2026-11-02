// 도트 그리기 도우미. 캔버스는 "도트 칸 수" 크기 그대로 만들고, CSS로 확대(image-rendering: pixelated)합니다.

/** 코드 도트(격자) 한 프레임 그리기. grid[y][x] = 팔레트 색이름 | null */
export function drawGrid(canvas, grid, palette) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  grid.forEach((line, y) => {
    line.forEach((key, x) => {
      if (!key) return;
      ctx.fillStyle = palette[key] ?? key; // 팔레트에 없으면 '#ff0000' 같은 색 문자열로 취급
      ctx.fillRect(x, y, 1, 1);
    });
  });
}

/** 문자 행렬 방식(하트) */
export function drawMatrix(canvas, sprite, palette) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, sprite.w, sprite.h);
  sprite.rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === 'X') ctx.fillStyle = palette.heart;
      else if (ch === 'H') ctx.fillStyle = palette.heartHi;
      else return;
      ctx.fillRect(x, y, 1, 1);
    });
  });
}
