// 맵 소품 도트 (코드 정의, 순수 데이터). PixelArt 컴포넌트가 SVG 사각형으로 그림.
//  rows: 글자 격자, colors: 글자 → 색. '.' 는 투명

const keys = (n) => {
  // 흰 건반 위 검은 건반 패턴 (2개, 3개 묶음 반복)
  const oct = 'wbwbwwbwbwbw';
  return oct.repeat(Math.ceil(n / oct.length)).slice(0, n);
};

/** 업라이트 피아노 (옆에서 본 2D 오브젝트, 28×26칸 → 8배 = 224×208px) */
export const piano = {
  cell: 8,
  colors: {
    L: '#5d5680', // 뚜껑/선반 하이라이트
    K: '#1c1a26', // 몸체
    k: '#2c2840', // 앞판
    G: '#6a6290', // 광택
    W: '#ffffff', // 악보
    g: '#8f8fa8', // 악보 줄
    w: '#f6f6f6', // 흰 건반
    b: '#121018', // 검은 건반
    s: '#b9b9c9', // 건반 사이 그림자
    P: '#e8c252', // 페달(금색)
  },
  rows: [
    '.LLLLLLLLLLLLLLLLLLLLLLLLLL.',
    '.KKKKKKKKKKKKKKKKKKKKKKKKKK.',
    '.KGkkkkkkkkkkkkkkkkkkkkkkkK.',
    '.KGkkkkkkWWWWWWWWWWkkkkkkkK.',
    '.KGkkkkkkWggggggggWkkkkkkkK.',
    '.KGkkkkkkWWWWWWWWWWkkkkkkkK.',
    '.KGkkkkkkWggggggggWkkkkkkkK.',
    '.KGkkkkkkWWWWWWWWWWkkkkkkkK.',
    '.KGkkkkkkkkkkkkkkkkkkkkkkkK.',
    '.KKKKKKKKKKKKKKKKKKKKKKKKKK.',
    'LLLLLLLLLLLLLLLLLLLLLLLLLLLL',
    'K' + keys(26) + 'K',
    'K' + keys(26) + 'K',
    'K' + 'ws'.repeat(13) + 'K',
    'K' + 'ws'.repeat(13) + 'K',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    '..KGkkkkkkkkkkkkkkkkkkkkK...',
    '..KGkkkkkkkkkkkkkkkkkkkkK...',
    '..KGkkkkkkkkkkkkkkkkkkkkK...',
    '..KGkkkkkkkkkkkkkkkkkkkkK...',
    '..KGkkkkkkkkkkkkkkkkkkkkK...',
    '..KGkkkkkkkkkkkkkkkkkkkkK...',
    '..KGkkkkkkkPkPkPkkkkkkkkK...',
    '..KKKKKKKKKKKKKKKKKKKKKKK...',
    '.LLLLLLLLLLLLLLLLLLLLLLLLL..',
    '.KKKKKKKKKKKKKKKKKKKKKKKKK..',
  ],
};

/** 언덕 (배경, 계단식 둥근 모양) */
export const hill = {
  cell: 16,
  colors: { h: '#5fc35a', d: '#47a447', l: '#86dd6f' },
  rows: [
    '.......hhhhhh.......',
    '.....hhllhhhhhh.....',
    '....hhllhhhhhhhh....',
    '...hhlhhhhhhdhhhh...',
    '..hhhhhhhhhhhhhhhh..',
    '.hhhhhdhhhhhhhhhhhh.',
    'hhhhhhhhhhhhhhdhhhhh',
    'hhhhhhhhhhhhhhhhhhhh',
  ],
};

/** 구름 */
export const cloud = {
  cell: 16,
  colors: { c: '#ffffff', s: '#d6ecff' },
  rows: ['....cccccc.....', '..cccccccccc...', '.ccccccccccccc.', 'ccccccccccccccc', 'sssssssssssssss'],
};

/** 덤불 */
export const bush = {
  cell: 16,
  colors: { b: '#3fb24b', d: '#2b8a37', l: '#6fd36a' },
  rows: ['..bbb..bbb.', '.bblbbbblbb', 'bbbbbbbbbbb', 'ddddddddddd'],
};
