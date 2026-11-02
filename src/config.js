// ============================================================================
//  결혼식 오프닝 영상 — 설정 파일
//  ▶ 문구 / 타이밍 / 색 / 위치는 거의 전부 여기서 수정합니다.
//  ▶ 시간 단위는 "초". 0초 = 스페이스바를 누른 순간.
//  ▶ 이 파일은 순수 데이터만 둡니다. (React/DOM import 금지)
//    scripts/check-config.mjs 가 이 파일을 그대로 읽어서 검사하기 때문이에요.
//  ▶ 문구 안의 {groom} {bride} {date} 는 couple 값으로 자동 치환됩니다.
// ============================================================================

export const config = {
  // ── 신랑/신부 정보 ─────────────────────────────────────────────
  couple: {
    groom: '홍정준',
    bride: 'OOO',
    date: '2026.00.00',
  },

  // ── 캔버스(예식장 규격: 1920×1080 고정) ──────────────────────────
  canvas: { width: 1920, height: 1080 },

  // ── 배치 ───────────────────────────────────────────────────
  layout: {
    groundY: 800, // 맵의 바닥선 y좌표 (캐릭터 발이 닿는 높이)
  },

  // ── 도트 캐릭터 ────────────────────────────────────────────
  //  임시 코드 도트 24×32칸. public/assets/sprites/<groom|bride>/<포즈>_<번호>.png 를 넣으면 그 프레임만 PNG로 교체
  //  (프레임 이름 목록: ?sprites 주소로 열면 전부 보임)
  sprites: {
    scale: 7, // 도트 1칸 = 화면 몇 px (24×32칸 → 168×224px)
    fps: { walk: 8, run: 12, wave: 4 }, // 포즈별 프레임 교체 속도(초당). 걷기 8 = 1초에 발걸음 4번
  },

  // ── 장면 구간 (서로 이어져야 함: 앞 장면 end = 다음 장면 start) ───
  //  마지막 장면의 end = 영상 전체 길이 (그 뒤로는 마지막 화면 고정)
  scenes: {
    black: { start: 0, end: 1 }, // 완전 검은 화면
    intro: { start: 1, end: 5.5 }, // 검정 배경, 신랑이 오른쪽 → 왼쪽으로 걸어 들어옴 (옆모습)
    greet: { start: 5.5, end: 23 }, // 왼쪽에 멈춰 앞모습, 손 흔들며 인사 (큰 말풍선은 오른쪽)
    drop: { start: 23, end: 25 }, // 맵 등장 + 신랑 낙하/착지 + HUD
    piano: { start: 25, end: 40 }, // 피아노 옆에서 멘트
    run: { start: 40, end: 80 }, // GAME START → 달리기, 장애물
    meet: { start: 80, end: 90 }, // 신부 만남 + STAGE 1 CLEAR
    fade: { start: 90, end: 96 }, // 검정으로 페이드
    closing: { start: 96, end: 108 }, // 감사 인사 (끝까지 고정)
  },

  // ── 오프닝 (검정 배경에서 걸어 들어오기 + 인사) ─────────────────
  intro: {
    fromX: 2100, // 출발 x (화면 오른쪽 바깥, 캐릭터 중심)
    groomX: 360, // 멈추는 x (화면 왼쪽)
    feetY: 700, // 이 구간에서 신랑 발 높이 (맵이 없어서 화면 가운데쯤으로)
    waveLine: 1, // 이 멘트가 끝날 때까지 손 흔들기, 그 뒤엔 앞모습 서기
  },

  // ── 맵 등장 + 낙하 (drop) ─────────────────────────────────────
  //  인사 끝 → 신랑이 위로 휙 사라짐 → 맵이 나타남 → 위에서 떨어져 착지(작게 튕김) → HUD 등장
  drop: {
    leaveAt: 23.0, // 신랑이 위로 뛰어올라 화면 밖으로
    leaveDur: 0.45,
    mapFadeAt: 23.15, // 맵이 나타나기 시작
    mapFadeDur: 0.5,
    fallStart: 23.8, // 화면 위에서 떨어지기 시작
    landAt: 24.5, // 착지 (= HUD 등장)
    bounce: 40, // 착지 후 튕기는 높이(px)
  },

  // ── 플랫포머 맵 (낙하 ~ 신부 만남까지 같은 맵) ──────────────────
  //  맵 좌표 x: 0 = 맵이 처음 나타났을 때 화면 왼쪽 끝. 달리기 시작(run.start)부터 speed 로 왼쪽으로 흐름
  map: {
    speed: 320, // 맵이 흐르는 속도(px/초)
    groomX: 480, // 착지~달리기 동안 신랑이 화면에서 서 있는 x좌표(캐릭터 중심)
    parallax: { clouds: 0.25, hills: 0.5 }, // 배경이 땅보다 얼마나 천천히 흐르는지 (0~1)
    jump: { air: 1.0, height: 300 }, // 점프 체공 시간(초), 높이(px)
    // 피아노 = 첫 번째 장애물. apexAt = 신랑이 피아노 바로 위(점프 최고점)에 오는 시각 → 위치는 자동 계산
    piano: { apexAt: 41.0 },
    // 장식 (점프와 무관). 파이프/블록 x는 맵 좌표, 블록 y는 블록 위쪽 끝
    pipes: [{ x: 60, h: 2 }],
    blockRows: [
      { x: 1480, y: 470, pattern: 'B?B' },
      { x: 2500, y: 430, pattern: '?' },
      { x: 3500, y: 470, pattern: 'BB?BB' },
    ],
    decorSeed: 7, // 구름/언덕/덤불 배치용 난수 씨앗 (바꾸면 배치가 달라짐)
  },

  // ── HUD (착지와 함께 등장, 신부를 만날 때까지) ─────────────────────
  hud: {
    hearts: { count: 3, x: 56, y: 44, scale: 8, gap: 16 }, // 왼쪽 위 하트(라이프)
    time: { from: 1, to: 8, unit: 'YEAR', label: 'TIME', right: 56, y: 44, labelSize: 30, valueSize: 46 }, // 오른쪽 위
  },

  // ── 말풍선 공통 설정 ────────────────────────────────────────
  //  멘트마다 layout: 'side'(캐릭터 오른쪽에 크게, 꼬리는 왼쪽) | 'above'(머리 위)
  bubble: {
    cps: 14, // 글자가 나오는 속도 (초당 글자 수). 클수록 빠름
    hold: 2.2, // 글자가 다 나온 뒤 풍선이 머무는 시간(초). 줄마다 hold로 개별 지정 가능
    popIn: 0.15, // 풍선이 "톡" 튀어나오는 시간
    popOut: 0.15, // 풍선이 사라지는 시간
    fontSize: 64,
    layout: 'above', // 멘트에 layout이 없을 때 기본값
    side: { maxWidth: 1340, gap: 40, centerY: 0.32 }, // gap: 캐릭터와의 간격, centerY: 풍선 세로 중심(캐릭터 키 대비, 0=머리끝)
    above: { maxWidth: 1100, gap: 34, tailX: 150 }, // tailX: 풍선 왼쪽 끝 ~ 꼬리 거리 (풍선은 캐릭터 기준 오른쪽으로 펼쳐짐)
  },

  // ── 말소리 효과음 (동물의 숲 느낌의 "뿅뿅"). 웹에서 유일하게 소리를 내는 부분 ─
  sfx: {
    blip: true, // false면 효과음 전체 끔
    blipEveryNChars: 2, // N글자마다 한 번 소리
    blipMaxPerLine: 3, // 한 문장에서 최대 몇 번 (아주 크게 늘리면 계속 "뿅뿅뿅")
    pitch: { groom: 520, bride: 760 }, // 기본 음높이(Hz)
    pitchRange: 220, // 무작위로 더해지는 음높이 폭
    volume: 0.12,
    // 발걸음 소리 — 지금은 꺼둠(훅만 준비). 켜면 걷기/달리기에서 발이 땅에 닿을 때마다 짧은 '톡'
    //  (시간 이동/되감기 중에는 울리지 않음. 소리를 바꾸려면 engine/audio.js 의 stepSound)
    step: { enabled: false, volume: 0.08, pitch: { groom: 120, bride: 170 } },
  },

  // ── 멘트 ──────────────────────────────────────────────────
  //  at    : 풍선이 뜨는 시각(초)
  //  hold  : 글자가 다 나온 뒤 머무는 시간(초) — 웃음 포인트는 길게
  //  who   : 'groom' | 'bride' (기본 groom)
  //  scene : 이 멘트가 속한 장면 이름 (npm run check 가 구간을 벗어나는지 검사)
  //  layout: 'side' | 'above'
  //  stay  : true면 풍선을 끄지 않고 남겨둠
  //  ※ 초안입니다. 문구는 언제든 바꿔도 됩니다. (바꾼 뒤 npm run check 로 시간 초과 확인)
  dialogue: [
    // 인사 (검정 배경, 큰 말풍선)
    { id: 1, scene: 'greet', layout: 'side', at: 5.8, hold: 2.0, text: '안녕하세요. 신랑 {groom}입니다.' },
    { id: 2, scene: 'greet', layout: 'side', at: 9.6, hold: 2.6, text: '날씨도 춥고, 다들 바쁘신 와중에도 저희를 위해 소중한 시간을 내주셔서 감사합니다.' },
    { id: 3, scene: 'greet', layout: 'side', at: 16.1, hold: 2.6, text: '예식 시작 전 간략하게 저희가 어떻게 오늘 이 자리까지 오게 되었는지 말씀 드리겠습니다.' },
    // 맵 위, 피아노 옆 (머리 위 말풍선)
    { id: 4, scene: 'piano', layout: 'above', at: 25.2, hold: 2.0, text: '첫 직장에 취직하고, 퇴근 후 취미로 피아노 학원을 다녔는데요.' },
    { id: 5, scene: 'piano', layout: 'above', at: 30.3, hold: 1.8, text: '거기서 아주 아름다운 선생님을 만났습니다.' },
    { id: 6, scene: 'piano', layout: 'above', at: 34.3, hold: 2.8, text: '저는 피아노에만 집중하려 했지만... 선생님께 작업만 쳤습니다.' }, // 웃음 포인트
  ],

  // ── 큰 글자 배너 ────────────────────────────────────────────
  banners: [
    { id: 'clear', text: 'STAGE 1 CLEAR!', sub: '연애 스테이지, 여기서 CLEAR!', at: 86.0, hold: 3.0 },
  ],

  // ── (임시) 신부 만남 — E단계에서 새 구조로 바뀝니다 ─────────────────
  ending: {
    brideScreenX: 1400, // 맵이 멈췄을 때 신부가 서 있는 화면 x(중심)
    brideWaveFrom: 80.5,
    meetWalkEnd: 83.4,
    gap: 170,
    heartsAt: 83.6,
    heartCount: 12,
  },

  // ── (임시) 마지막 고정 화면 — E단계에서 closing 으로 바뀝니다 ─────────
  finalCard: {
    at: 100,
    lines: [
      { text: '두 번째 스테이지, 결혼', size: 56, color: '#ffffff' },
      { text: '{groom} ♥ {bride}', size: 140, color: '#ffd84d' },
      { text: '{date}', size: 68, color: '#ffffff' },
    ],
  },

  // ── 음악 편집 메모 (화면에는 나오지 않음. 편집 때 참고용) — E단계에서 최종 갱신 ──
  audioCues: [
    { t: 1.0, label: 'BGM① 잔잔한 곡 시작(낮은 볼륨)' },
    { t: 40.0, label: 'BGM② 마리오풍 시작 (GAME START)' },
    { t: 80.0, label: 'BGM③ 하이라이트 (신부 만남)' },
    { t: 108.0, label: '끝 — 여기서 영상 자르기' },
  ],

  // ── 도트 색상표 (스프라이트가 이 이름으로 색을 찾음) ─────────────
  //  검정 배경에서도 보이도록 "검정" 정장/머리는 푸른빛이 도는 짙은 회색 + 밝은 하이라이트로 표현
  palette: {
    outline: '#0b0b14', // 도트 바깥 테두리(자동)
    skin: '#f5c9a0',
    skinShade: '#d9a37a',
    ink: '#1a1a2e',
    mouth: '#c0504d',
    blush: '#f0a0a0',
    // 신랑
    hair: '#3a3546',
    hairHi: '#b4aed0', // 가르마 선
    suit: '#3a4066',
    suitHi: '#7d88cc',
    suitShade: '#262a45',
    suitArm: '#4b5384', // 옆모습에서 몸 앞쪽 팔 (몸통과 구분)
    white: '#ffffff',
    tie: '#e8344a',
    tieDark: '#9a1c2c',
    shoe: '#2a2a38',
    shoeHi: '#8a8aa4',
    // 신부
    brown: '#7a4a2a',
    brownHi: '#b07a4c',
    veil: '#e4f1ff',
    veilEdge: '#9ec4ea',
    dress: '#ffffff',
    dressShade: '#d9e1f0',
    bouquet: '#ff7aa8',
    bouquetHi: '#ffd0e0',
    leaf: '#4caf50',
    // 하트
    heart: '#ff3b6b',
    heartHi: '#ffb3c7',
  },
};

export default config;
