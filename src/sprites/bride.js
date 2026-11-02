// 임시 신부 도트 (16×24칸). 베일 + 드레스 + 갈색 묶은머리 + 부케
// 각 항목: [x, y, 가로칸, 세로칸, 색이름]

const veil = [
  [2, 2, 12, 17, 'veil'],
  [2, 6, 1, 13, 'veilEdge'], [13, 6, 1, 13, 'veilEdge'],
];

const head = [
  [4, 1, 8, 3, 'brown'], [6, 0, 4, 1, 'brown'], // 윗머리 + 묶은 머리 덩어리
  [3, 3, 1, 5, 'brown'], [12, 3, 1, 5, 'brown'], // 옆머리
  [12, 5, 2, 5, 'brownHi'], // 묶은 머리 꼬리
  [4, 4, 8, 5, 'skin'], // 얼굴
  [5, 6, 1, 1, 'ink'], [10, 6, 1, 1, 'ink'], // 눈
  [4, 7, 1, 1, 'blush'], [11, 7, 1, 1, 'blush'], // 볼터치
  [7, 8, 2, 1, 'mouth'], // 입
  [7, 9, 2, 1, 'skin'], // 목
];

const dress = [
  [5, 10, 6, 4, 'dress'], [5, 13, 6, 1, 'dressShade'], // 상의
  [4, 14, 8, 2, 'dress'], [3, 16, 10, 2, 'dress'], [2, 18, 12, 3, 'dress'], [1, 21, 14, 3, 'dress'], // 치마
  [5, 15, 1, 3, 'dressShade'], [10, 15, 1, 3, 'dressShade'],
  [4, 19, 1, 4, 'dressShade'], [11, 19, 1, 4, 'dressShade'], [8, 18, 1, 6, 'dressShade'], // 주름
];

const armsDown = [[3, 10, 2, 5, 'skin'], [11, 10, 2, 5, 'skin']];
const bouquetCenter = [[6, 14, 4, 2, 'bouquet'], [7, 16, 2, 1, 'leaf']];

// 손 흔들기: 화면 왼쪽(신랑 쪽) 팔을 들고, 오른손에 부케
const armWave1 = [[2, 4, 2, 7, 'skin'], [11, 10, 2, 5, 'skin']];
const armWave2 = [[1, 4, 2, 7, 'skin'], [11, 10, 2, 5, 'skin']];
const bouquetRight = [[11, 12, 3, 3, 'bouquet'], [12, 15, 1, 1, 'leaf']];

const frame = (arms, bouquet) => [...veil, ...head, ...dress, ...arms, ...bouquet];

export const brideSprite = {
  w: 16,
  h: 24,
  frames: {
    stand: frame(armsDown, bouquetCenter),
    wave1: frame(armWave1, bouquetRight),
    wave2: frame(armWave2, bouquetRight),
  },
};
