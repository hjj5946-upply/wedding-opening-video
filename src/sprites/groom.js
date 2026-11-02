// 임시 신랑 도트 (16×24칸). 검정 정장 + 보타이 + 가르마 머리
// 각 항목: [x, y, 가로칸, 세로칸, 색이름]  — 색이름은 config.palette 의 키
// 나중에 예쁜 도트(PNG)가 생기면 PixelSprite만 이미지 방식으로 바꾸면 됩니다. (docs/03_DECISIONS.md 참고)

const head = [
  [4, 1, 8, 3, 'hair'], [3, 3, 1, 3, 'hair'], [12, 3, 1, 3, 'hair'], // 머리카락
  [6, 1, 1, 2, 'hairHi'], // 가르마(밝은 선)
  [4, 4, 8, 5, 'skin'], // 얼굴
  [5, 6, 1, 1, 'ink'], [10, 6, 1, 1, 'ink'], // 눈
  [7, 8, 2, 1, 'mouth'], // 입
  [7, 9, 2, 1, 'skin'], // 목
];

const torso = [
  [4, 10, 8, 7, 'suit'], // 재킷
  [6, 11, 1, 3, 'suitHi'], [9, 11, 1, 3, 'suitHi'], // 라펠(옷깃)
  [7, 10, 2, 5, 'white'], // 셔츠
  [5, 10, 2, 1, 'tie'], [9, 10, 2, 1, 'tie'], [7, 10, 2, 1, 'tieDark'], // 보타이
];

const armsDown = [
  [2, 10, 2, 6, 'suit'], [12, 10, 2, 6, 'suit'],
  [2, 16, 2, 2, 'skin'], [12, 16, 2, 2, 'skin'],
];
const armsSwingA = [
  [2, 9, 2, 6, 'suit'], [12, 11, 2, 6, 'suit'],
  [2, 15, 2, 2, 'skin'], [12, 17, 2, 2, 'skin'],
];
const armsSwingB = [
  [2, 11, 2, 6, 'suit'], [12, 9, 2, 6, 'suit'],
  [2, 17, 2, 2, 'skin'], [12, 15, 2, 2, 'skin'],
];
const armsUp = [
  [1, 7, 2, 5, 'suit'], [13, 7, 2, 5, 'suit'],
  [1, 5, 2, 2, 'skin'], [13, 5, 2, 2, 'skin'],
];
const armsWave1 = [
  [2, 10, 2, 6, 'suit'], [2, 16, 2, 2, 'skin'],
  [12, 10, 1, 1, 'suit'], [13, 5, 2, 6, 'suit'], [13, 3, 2, 2, 'skin'],
];
const armsWave2 = [
  [2, 10, 2, 6, 'suit'], [2, 16, 2, 2, 'skin'],
  [12, 10, 2, 1, 'suit'], [14, 5, 2, 6, 'suit'], [14, 3, 2, 2, 'skin'],
];

const legsStand = [
  [5, 17, 3, 5, 'suit'], [8, 17, 3, 5, 'suit'],
  [4, 22, 4, 2, 'shoe'], [8, 22, 4, 2, 'shoe'],
];
const legsStepA = [
  [5, 17, 3, 4, 'suit'], [8, 17, 3, 5, 'suit'],
  [4, 21, 4, 2, 'shoe'], [8, 22, 4, 2, 'shoe'],
];
const legsStepB = [
  [5, 17, 3, 5, 'suit'], [8, 17, 3, 4, 'suit'],
  [4, 22, 4, 2, 'shoe'], [8, 21, 4, 2, 'shoe'],
];
const legsJump = [
  [5, 17, 3, 3, 'suit'], [8, 17, 3, 3, 'suit'],
  [4, 20, 4, 2, 'shoe'], [8, 20, 4, 2, 'shoe'],
];

const frame = (arms, legs) => [...head, ...torso, ...arms, ...legs];

export const groomSprite = {
  w: 16,
  h: 24,
  frames: {
    stand: frame(armsDown, legsStand),
    walkA: frame(armsSwingA, legsStepA),
    walkB: frame(armsSwingB, legsStepB),
    jump: frame(armsUp, legsJump),
    wave1: frame(armsWave1, legsStand),
    wave2: frame(armsWave2, legsStand),
  },
};
