// 임시 신부 도트 (24×32칸). 베일 + 드레스 + 갈색 묶은머리(올림머리) + 부케
//  - 옆모습은 "오른쪽을 보는 방향"으로만 그림. 신랑 쪽(왼쪽)을 볼 땐 화면에서 좌우 반전.
//  - PNG 교체: public/assets/sprites/bride/<포즈>_<번호>.png
import { row, compileSprite } from './compile.js';

const W = 24;
const H = 32;
const R = (rows) => rows.map(([left, s]) => row(W, left, s));

// ─────────────────────────────── 앞모습 ───────────────────────────────
const VEIL = R([
  [6, 'vvvvvvvvvvvv'],
  [5, 'vvvvvvvvvvvvvv'],
  ...Array(5).fill([4, 'vvvvvvvvvvvvvvvv']),
  ...Array(6).fill([3, 'Vvvvvvvvvvvvvvvvvv']),
  ...Array(6).fill([2, 'VVvvvvvvvvvvvvvvvvvv']),
  ...Array(3).fill([2, 'VV................VV']),
]); // y=4 부터 (머리 뒤로 내려오는 베일)

const FRONT_HEAD = R([
  [9, 'rrrrrr'], // 올림머리(번)
  [9, 'rRRrrr'],
  [7, 'rrrrrrrrrr'],
  [6, 'rrrrrrRRrrrr'],
  [5, 'rrrrrrrrrrrrrr'],
  [5, 'rrrssssssssrrr'], // 앞머리 가운데 가르마
  [5, 'rrssssssssssrr'],
  [5, 'rssssssssssssr'],
  [5, 'rssessssssessr'], // 눈
  [5, 'rssessssssessr'],
  [5, 'rscsssmmssscsr'], // 볼터치 + 입
  [6, 'rssssssssssr'],
  [8, 'ssssssss'],
]); // y=1

const FRONT_DRESS = R([
  [10, 'ssss'], // 목
  [7, 'sssxxxxsss'], // 어깨 (오프숄더)
  [7, 'xxxxxxxxxx'],
  [8, 'xxxXXxxx'],
  [8, 'xxxxxxxx'],
  [8, 'XxxxxxxX'], // 허리
  [7, 'xxxxxxxxxx'],
  [7, 'xxxxxxxxxx'],
  [6, 'xxxxxXxxxxxx'],
  [6, 'xxxxxXxxxxxx'],
  [5, 'xxxxXxxxxXxxxx'],
  [5, 'xxxxXxxxxXxxxx'],
  [4, 'xxxxxXxxxxXxxxxx'],
  [4, 'xxxxxXxxxxXxxxxx'],
  [3, 'xxxxXxxxxxxXxxxxxx'],
  [3, 'xxxxXxxxxxxXxxxxxx'],
  [3, 'XXXXXXXXXXXXXXXXXX'], // 드레스 밑단 (30행)
]); // y=14

const bArm = (pts, hand) => [
  { line: pts, w: 2, c: 'skin' },
  { rect: hand, c: 'skin' },
];
const BOUQUET_CENTER = [
  { rect: [10, 20, 4, 3], c: 'bouquet' },
  { px: [[10, 20], [12, 21]], c: 'bouquetHi' },
  { rect: [11, 23, 2, 2], c: 'leaf' },
];
const front = (arms, bouquet) => [
  { rows: VEIL, y: 4 },
  { rows: FRONT_HEAD, y: 1 },
  { rows: FRONT_DRESS, y: 14 },
  ...arms,
  ...bouquet,
];
const FRONT_STAND = front([...bArm([7, 15, 8, 19, 9, 20], [9, 20, 2, 2]), ...bArm([15, 15, 14, 19, 13, 20], [13, 20, 2, 2])], BOUQUET_CENTER);

// 손 흔들기: 화면 왼쪽 팔(신랑 쪽)을 들고, 부케는 다른 손에
const BOUQUET_SIDE = [
  { rect: [16, 20, 3, 3], c: 'bouquet' },
  { px: [[16, 20]], c: 'bouquetHi' },
  { rect: [17, 23, 1, 2], c: 'leaf' },
];
const ARM_HOLD = bArm([15, 15, 16, 18, 16, 19], [16, 19, 2, 2]);
const WAVE = [
  front([...bArm([7, 15, 4, 13, 3, 9], [3, 7, 2, 2]), ...ARM_HOLD], BOUQUET_SIDE),
  front([...bArm([7, 15, 4, 13, 2, 9], [2, 7, 2, 2]), ...ARM_HOLD], BOUQUET_SIDE),
];

// ─────────────────────────────── 옆모습 (오른쪽을 봄) ───────────────────────────────
const SIDE_VEIL = R([
  [5, 'vvvv'],
  [4, 'vvvvvv'],
  [3, 'Vvvvvvv'],
  [3, 'Vvvvvvv'],
  [2, 'VVvvvvvv'],
  [2, 'VVvvvvvv'],
  [2, 'VVvvvvvv'],
  [1, 'VVvvvvvvv'],
  [1, 'VVvvvvvvv'],
  [1, 'VVvvvvvvv'],
  [1, 'VVvvvvvvv'],
  [1, 'VVvvvvvvv'],
  [1, 'VVvvvvvvvv'],
  [1, 'VVvvvvvvvv'],
  [1, 'VVvvvvvvvv'],
  [1, 'VVVVVVVVVV'],
]); // y=6, 머리 뒤에서 땅까지 흘러내림
const SIDE_HEAD = R([
  [6, 'rrr'], // 뒤쪽 올림머리
  [5, 'rRRrrrrrrrr'],
  [5, 'rrrrrrrrrrrrr'],
  [6, 'rrrrrrrrrrrrr'],
  [6, 'rrrrrrrrrssrr'],
  [6, 'rrrrrssssssss'],
  [6, 'rrrrsssssssss'],
  [6, 'rrrrSssssesss'], // 귀 + 눈
  [6, 'rrrrSssssessss'], // 코
  [6, 'rrrsssscsssss'], // 볼터치
  [7, 'rrsssssssms'], // 입
  [9, 'sssssssss'],
  [11, 'ssss'], // 목
]); // y=1
const SIDE_DRESS = R([
  [9, 'sxxxxxs'],
  [9, 'xxxxxxx'],
  [9, 'xxxXxxx'],
  [9, 'Xxxxxxx'],
  [8, 'xxxxxxxxx'],
  [8, 'xxxxxxxxxx'],
  [7, 'xxxxXxxxxxx'],
  [7, 'xxxxXxxxxxx'],
  [6, 'xxxxxXxxxxxxx'],
  [6, 'xxxxxXxxxxxxx'],
  [5, 'xxxxxxXxxxxxxx'],
  [5, 'xxxxxxXxxxxxxxx'],
  [4, 'xxxxxxxXxxxxxxxx'],
  [4, 'XXXXXXXXXXXXXXXX'],
]); // y=14 ~ 27 → 밑단 27행? (아래에서 30행까지 늘림)

// 드레스 밑단 모양 3가지 — 걸을 때 치맛자락이 살랑이는 느낌
const HEM_A = R([[4, 'xxxxxxxXxxxxxxxx'], [4, 'xxxxxxxXxxxxxxxx'], [3, 'xxxxxxxxXxxxxxxxx'], [3, 'XXXXXXXXXXXXXXXXX']]);
const HEM_B = R([[4, 'xxxxxxxXxxxxxxxx'], [3, 'xxxxxxxxXxxxxxxxx'], [3, 'xxxxxxxxXxxxxxxxx'], [4, 'XXXXXXXXXXXXXXXX']]);
const HEM_C = R([[5, 'xxxxxxXxxxxxxxx'], [4, 'xxxxxxxXxxxxxxxx'], [4, 'xxxxxxxxXxxxxxxx'], [3, 'XXXXXXXXXXXXXXXXX']]);

//  hem: 밑단 모양 / dy: 부케를 든 팔이 위아래로 살짝 (걷기 느낌)
const sideBase = (hem, dy = 0) => [
  { rows: SIDE_VEIL, y: 6 },
  { rows: SIDE_HEAD, y: 1 },
  { rows: SIDE_DRESS.slice(0, -1), y: 14 },
  { rows: hem, y: 27 },
  // 앞으로 부케를 든 팔
  { line: [11, 15 + dy, 14, 18 + dy, 15, 19 + dy], w: 2, c: 'skin' },
  { rect: [15, 18 + dy, 3, 3], c: 'bouquet' },
  { px: [[16, 18 + dy]], c: 'bouquetHi' },
  { rect: [16, 21 + dy, 1, 2], c: 'leaf' },
];

const SIDE_STAND = sideBase(HEM_A);
// 걷기 4프레임 (긴 드레스라 다리 대신 밑단과 팔로 표현)
const SIDE_WALK = [sideBase(HEM_A, 0), sideBase(HEM_B, -1), sideBase(HEM_C, 0), sideBase(HEM_B, -1)];

const FRONT_FRAMES = { frontStand_1: FRONT_STAND, wave_1: WAVE[0], wave_2: WAVE[1] };
const SIDE_FRAMES = {
  sideStand_1: SIDE_STAND,
  walk_1: SIDE_WALK[0],
  walk_2: SIDE_WALK[1],
  walk_3: SIDE_WALK[2],
  walk_4: SIDE_WALK[3],
};

export const brideSprite = compileSprite({
  id: 'bride',
  w: W,
  h: H,
  view: Object.fromEntries([
    ...Object.keys(SIDE_FRAMES).map((k) => [k, 'side']),
    ...Object.keys(FRONT_FRAMES).map((k) => [k, 'front']),
  ]),
  frames: { ...FRONT_FRAMES, ...SIDE_FRAMES },
});
