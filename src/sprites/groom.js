// 임시 신랑 도트 (24×32칸). 검정 정장 + 보타이 + 가르마 머리
//  - 옆모습은 "오른쪽을 보는 방향"으로만 그립니다. 왼쪽은 화면에서 좌우 반전(PixelSprite).
//  - 프레임 이름 = <포즈>_<번호>. PNG로 바꿀 땐 public/assets/sprites/groom/<포즈>_<번호>.png 를 넣으면 자동 교체.
//  - 글자 → 색: sprites/compile.js 의 LEGEND (h 머리, H 가르마, s 피부, j 정장, J 정장 하이라이트, d 정장 그림자, t/T 보타이, f 구두 ...)
import { row, compileSprite } from './compile.js';

const W = 24;
const H = 32;
const R = (rows) => rows.map(([left, s]) => row(W, left, s));

// ─────────────────────────────── 옆모습 (오른쪽을 봄) ───────────────────────────────
const SIDE_HEAD = R([
  [9, 'hhhhhh'],
  [7, 'hhhhhhHHhh'],
  [6, 'hhhhhhhhHHHh'],
  [5, 'hhhhhhhhhhhHHh'],
  [5, 'hhhhhhhhhhhhhhh'], // 앞머리가 이마 쪽으로 살짝 나옴
  [5, 'hhhhhhhssssshh'],
  [5, 'hhhhhsssssssss'],
  [5, 'hhhhSssssessss'], // 귀(S) + 눈(e)
  [5, 'hhhhSssssessss'],
  [5, 'hhhsssssssssss'], // 코가 한 칸 앞으로
  [6, 'hhssssssssms'], // 입
  [8, 'sssssssss'],
]);
const SIDE_BODY = R([
  [8, 'jjjjjwwJ'], // 옷깃
  [8, 'jjjjJwtTt'], // 보타이 (옆에서 보면 앞으로 살짝 튀어나옴)
  [8, 'jjjjJwwJ'],
  [8, 'jjjjjJwj'],
  [8, 'jjjjjjJj'],
  [8, 'jjjjjjjj'],
  [8, 'jjjjjjjj'],
  [8, 'jjjjjjjj'],
  [8, 'dddddddd'], // 재킷 밑단
]);

const head = (dy = 0) => ({ rows: SIDE_HEAD, y: 1 + dy });
const body = (dy = 0) => ({ rows: SIDE_BODY, y: 13 + dy });

/** 다리: 엉덩이 → 무릎 → 발목, 끝에 구두(앞쪽=오른쪽으로 4칸) */
function leg(pts, back = false) {
  const points = pts.map((v, i) => (i % 2 ? v + 1 : v)); // 아래 좌표표는 1칸 위 기준으로 적어 둠
  const [fx, fy] = points.slice(-2);
  return [
    { line: points, w: 3, c: back ? 'suitShade' : 'suit' },
    { rect: [fx, fy + 3, 4, 2], c: 'shoe' },
    { px: [[fx + 3, fy + 3]], c: back ? 'shoe' : 'shoeHi' },
  ];
}
/** 팔: 어깨 → (팔꿈치) → 손, 끝에 손(피부 2×2) */
function arm(points, back = false) {
  const [hx, hy] = points.slice(-2);
  return [
    { line: points, w: 2, c: back ? 'suitShade' : 'suitArm' },
    { rect: [hx, hy + 1, 2, 2], c: back ? 'skinShade' : 'skin' },
  ];
}

// 한 프레임 = 뒷팔 → 뒷다리 → 몸 → 머리 → 앞다리 → 앞팔 순서로 덧칠
function sideFrame({ dy = 0, backArm, backLeg, frontLeg, frontArm, extra = [] }) {
  const sh = (pts) => pts.map((v, i) => (i % 2 ? v + dy : v)); // 몸이 위아래로 튈 때 팔다리 시작점도 같이
  return [
    ...(backArm ? arm(sh(backArm), true) : []),
    ...(backLeg ? leg(backLeg, true) : []),
    body(dy),
    head(dy),
    ...(frontLeg ? leg(frontLeg) : []),
    ...(frontArm ? arm(sh(frontArm)) : []),
    ...extra,
  ];
}

// 엉덩이 위치: 뒷다리 (9,21) / 앞다리 (11,21) (+1칸 보정). 땅을 딛는 발목 y=25 → 구두 29~30행, 31행 = 테두리(바닥선)
const STAND = sideFrame({
  backLeg: [9, 21, 9, 25],
  frontLeg: [11, 21, 11, 25],
  frontArm: [11, 14, 11, 19],
});

// 걷기 4프레임: 1 앞발 내딛기 → 2 지나가기 → 3 반대발 내딛기 → 4 지나가기  (1, 3번에서 발걸음 이벤트)
const WALK = [
  sideFrame({
    backArm: [11, 14, 14, 18],
    backLeg: [9, 21, 7, 23, 6, 25],
    frontLeg: [11, 21, 13, 23, 14, 25],
    frontArm: [11, 14, 8, 18],
  }),
  sideFrame({
    dy: -1,
    backArm: [11, 14, 12, 18],
    backLeg: [9, 20, 8, 22, 9, 23],
    frontLeg: [11, 20, 11, 24],
    frontArm: [11, 14, 10, 18],
  }),
  sideFrame({
    backArm: [11, 14, 8, 18],
    backLeg: [9, 21, 12, 23, 14, 25],
    frontLeg: [11, 21, 9, 23, 6, 25],
    frontArm: [11, 14, 14, 18],
  }),
  sideFrame({
    dy: -1,
    backArm: [11, 14, 10, 18],
    backLeg: [9, 20, 9, 24],
    frontLeg: [11, 20, 12, 22, 10, 23],
    frontArm: [11, 14, 12, 18],
  }),
];

// 달리기 4프레임: 보폭 크게, 팔은 굽혀서 크게 흔듦, 2·4번은 공중(몸이 1칸 위)
const RUN = [
  sideFrame({
    backArm: [11, 14, 14, 16, 16, 13],
    backLeg: [9, 21, 6, 23, 3, 24],
    frontLeg: [11, 21, 14, 23, 16, 25],
    frontArm: [11, 14, 8, 16, 7, 18],
  }),
  sideFrame({
    dy: -2,
    backArm: [11, 14, 12, 17, 14, 16],
    backLeg: [9, 19, 7, 22, 5, 21],
    frontLeg: [11, 19, 14, 21, 12, 23],
    frontArm: [11, 14, 10, 17, 9, 17],
  }),
  sideFrame({
    backArm: [11, 14, 8, 16, 7, 18],
    backLeg: [9, 21, 12, 23, 15, 25],
    frontLeg: [11, 21, 8, 23, 4, 24],
    frontArm: [11, 14, 14, 16, 16, 13],
  }),
  sideFrame({
    dy: -2,
    backArm: [11, 14, 10, 17, 9, 17],
    backLeg: [9, 19, 12, 21, 11, 23],
    frontLeg: [11, 19, 9, 22, 6, 21],
    frontArm: [11, 14, 12, 17, 14, 16],
  }),
];

// 점프: 한 팔은 위로 쭉, 다리는 접기
const JUMP = sideFrame({
  dy: -1,
  backArm: [11, 14, 8, 12, 7, 9],
  backLeg: [9, 20, 7, 23, 5, 22],
  frontLeg: [11, 20, 14, 22, 12, 24],
  frontArm: [11, 14, 17, 12, 20, 8], // 얼굴 앞을 지나지 않게 앞쪽 위로
});

// 피격: 몸이 뒤로 젖혀짐(머리 1칸 뒤) + 눈은 >< + 입 벌림 + 팔다리 버둥
const HIT = [
  ...sideFrame({
    backArm: [11, 14, 8, 11, 6, 9],
    backLeg: [9, 21, 7, 23, 5, 24],
    frontLeg: [11, 21, 13, 23, 15, 24],
    frontArm: [11, 14, 15, 14, 18, 13], // 앞팔은 턱 아래로 앞으로 뻗음 (얼굴을 가리지 않게)
  }),
  { px: [[14, 8], [15, 9], [14, 10], [16, 9]], c: 'skin' }, // 원래 눈 지우기
  { px: [[14, 8], [15, 9], [14, 10]], c: 'ink' }, // > 모양 눈
  { rect: [16, 11, 2, 2], c: 'mouth' }, // 벌린 입
  { px: [[19, 3], [20, 4], [21, 2], [21, 5]], c: 'white' }, // 충격 반짝
];

// ─────────────────────────────── 앞모습 ───────────────────────────────
const FRONT_HEAD = R([
  [9, 'hhhhhh'],
  [7, 'hhhhHHhhhh'],
  [6, 'hhhhhHhhhhhh'], // H = 가르마 선
  [5, 'hhhhhhHhhhhhhh'],
  [5, 'hhhhhsHhhhhhhh'],
  [5, 'hhssssshhhhhhh'], // 가르마 오른쪽 머리가 이마 위로 넘어감
  [5, 'hsssssssssshhh'],
  [5, 'hssssssssssssh'],
  [5, 'hssessssssessh'], // 눈
  [5, 'sssessssssesss'], // 귀
  [6, 'sssssmmsssss'], // 입
  [7, 'ssssssssss'],
]);
const FRONT_BODY = R([
  [6, 'Jjjjwwwwjjjd'], // 옷깃 (왼쪽 어깨 하이라이트)
  [6, 'Jjjtwwwwtjjd'], // 보타이 바깥
  [6, 'jjJttTTttJjd'], // 보타이 매듭
  [6, 'jjJtwwwwtJjd'],
  [6, 'jjjJwwwwJjjd'],
  [6, 'jjjjJwwJjjjd'],
  [6, 'jjjjjJJjjjjd'],
  [6, 'jjjjjjjjjjjd'],
  [6, 'jjjjjjjjjjjd'],
  [6, 'dddddddddddd'],
]);
const FRONT_LEGS = R([
  [7, 'jjjjjjjjjj'],
  [7, 'jjjd..jjjd'],
  [7, 'jjjd..jjjd'],
  [7, 'jjjd..jjjd'],
  [7, 'jjjd..jjjd'],
  [7, 'jjjd..jjjd'],
  [6, 'fffff..fffff'],
  [6, 'fFfff..fFfff'],
]);
const front = (arms, { legs = { rows: FRONT_LEGS, y: 23 }, extra = [] } = {}) => [
  { rows: FRONT_HEAD, y: 1 },
  { rows: FRONT_BODY, y: 13 },
  legs,
  ...arms,
  ...extra,
];
const fArm = (pts, hand) => [
  { line: pts, w: 2, c: 'suit' },
  { rect: hand, c: 'skin' },
];
const ARM_L_DOWN = fArm([4, 13, 4, 19], [4, 21, 2, 2]);
const ARM_R_DOWN = fArm([18, 13, 18, 19], [18, 21, 2, 2]);

const FRONT_STAND = front([...ARM_L_DOWN, ...ARM_R_DOWN]);
// 손 흔들기: 화면 오른쪽 팔을 들어 좌우로
const WAVE = [
  front([...ARM_L_DOWN, ...fArm([18, 13, 20, 11, 20, 7], [20, 5, 2, 2])]),
  front([...ARM_L_DOWN, ...fArm([18, 13, 20, 11, 21, 7], [21, 5, 2, 2])]),
];
// 낙하: 팔 벌리고 다리 살짝 벌림, 놀란 입
const FALL = front(
  [...fArm([5, 14, 3, 11, 2, 8], [1, 6, 2, 2]), ...fArm([17, 14, 19, 11, 20, 8], [21, 6, 2, 2])],
  {
    legs: { rows: R([[7, 'jjjjjjjjjj'], [6, 'jjjd....djjj'], [5, 'jjjd......djjj'], [4, 'fffff......fffff']]), y: 23 },
    extra: [{ rect: [11, 11, 2, 1], c: 'mouth' }, { rect: [11, 12, 2, 1], c: 'mouth' }],
  },
);

const SIDE_FRAMES = {
  sideStand_1: STAND,
  walk_1: WALK[0], walk_2: WALK[1], walk_3: WALK[2], walk_4: WALK[3],
  run_1: RUN[0], run_2: RUN[1], run_3: RUN[2], run_4: RUN[3],
  jump_1: JUMP,
  hit_1: HIT,
};
const FRONT_FRAMES = {
  frontStand_1: FRONT_STAND,
  wave_1: WAVE[0], wave_2: WAVE[1],
  fall_1: FALL,
};

export const groomSprite = compileSprite({
  id: 'groom',
  w: W,
  h: H,
  // 프레임별 시점: side = 좌우 반전 가능 / front = 반전 안 함
  view: Object.fromEntries([
    ...Object.keys(SIDE_FRAMES).map((k) => [k, 'side']),
    ...Object.keys(FRONT_FRAMES).map((k) => [k, 'front']),
  ]),
  frames: { ...SIDE_FRAMES, ...FRONT_FRAMES },
});
