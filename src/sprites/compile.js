// 임시 코드 도트를 "칸 격자"로 만드는 도우미 (순수 함수 — React/DOM 없음, check-config 에서도 사용)
//
// 한 프레임 = 그리기 명령(op) 목록. 위에서부터 차례로 덧칠합니다.
//   { rows: [...문자열], y }          글자 그림. 글자 → 색이름은 LEGEND, '.' 은 투명
//   { line: [x0,y0, x1,y1, ...], w, c } 굵기 w칸 붓으로 꺾은선 (팔/다리용). 좌표는 붓의 왼쪽 위
//   { rect: [x, y, w, h], c }         사각형
//   { px: [[x, y], ...], c }          점 몇 개
// 다 그린 뒤 실루엣 바깥 1칸에 테두리(outline 색)를 자동으로 둘러요. (그래서 그림은 가장자리 1칸을 비워 둬야 함)
// 결과: grid[y][x] = 팔레트 색이름 | null

export const LEGEND = {
  o: 'outline',
  h: 'hair', H: 'hairHi',
  s: 'skin', S: 'skinShade',
  e: 'ink', m: 'mouth', c: 'blush',
  j: 'suit', J: 'suitHi', d: 'suitShade', k: 'suitArm',
  w: 'white', t: 'tie', T: 'tieDark',
  f: 'shoe', F: 'shoeHi',
  r: 'brown', R: 'brownHi',
  v: 'veil', V: 'veilEdge',
  x: 'dress', X: 'dressShade',
  p: 'bouquet', P: 'bouquetHi', g: 'leaf',
};

/** 한 줄 만들기: 왼쪽에 left칸 비우고 content, 나머지는 '.' 로 채워 폭 w 맞춤 */
export function row(w, left, content = '') {
  const s = '.'.repeat(left) + content;
  if (s.length > w) throw new Error(`도트 줄이 ${w}칸을 넘어요: "${s}" (${s.length}칸)`);
  return s + '.'.repeat(w - s.length);
}

export function compileFrame(ops, w, h, { outline = true } = {}) {
  const grid = Array.from({ length: h }, () => Array(w).fill(null));
  const put = (x, y, key) => {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && y >= 0 && x < w && y < h) grid[y][x] = key;
  };
  const fill = (x, y, rw, rh, key) => {
    for (let yy = 0; yy < rh; yy++) for (let xx = 0; xx < rw; xx++) put(x + xx, y + yy, key);
  };

  for (const op of ops) {
    if (op.rows) {
      const y0 = op.y ?? 0;
      const x0 = op.x ?? 0;
      op.rows.forEach((str, ry) => {
        [...str].forEach((ch, rx) => {
          if (ch === '.' || ch === ' ') return;
          const key = LEGEND[ch];
          if (!key) throw new Error(`도트 글자 '${ch}' 의 색이 LEGEND 에 없어요`);
          put(x0 + rx, y0 + ry, key);
        });
      });
    } else if (op.rect) {
      const [x, y, rw, rh] = op.rect;
      fill(x, y, rw, rh, op.c);
    } else if (op.line) {
      const pts = op.line;
      const bw = op.w ?? 2;
      for (let i = 0; i + 3 < pts.length; i += 2) {
        const [x0, y0, x1, y1] = [pts[i], pts[i + 1], pts[i + 2], pts[i + 3]];
        const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2));
        for (let k = 0; k <= n; k++) {
          const t = k / n;
          fill(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), bw, bw, op.c);
        }
      }
    } else if (op.px) {
      for (const [x, y] of op.px) put(x, y, op.c);
    }
  }

  if (outline) {
    const filled = (x, y) => x >= 0 && y >= 0 && x < w && y < h && grid[y][x] && grid[y][x] !== 'outline';
    const marks = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (grid[y][x]) continue;
        if (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)) marks.push([x, y]);
      }
    }
    for (const [x, y] of marks) grid[y][x] = 'outline';
  }
  return grid;
}

/** { 프레임이름: ops } → { 프레임이름: grid } */
export function compileSprite({ id, w, h, view, frames }, options) {
  const out = {};
  for (const [name, ops] of Object.entries(frames)) out[name] = compileFrame(ops, w, h, options);
  return { id, w, h, view, frames: out };
}
