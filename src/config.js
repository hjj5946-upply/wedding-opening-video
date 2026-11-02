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
    groom: 'OOO',
    bride: 'OOO',
    date: '2026.00.00',
  },

  // ── 캔버스(예식장 규격: 1920×1080 고정) ──────────────────────────
  canvas: { width: 1920, height: 1080 },

  // ── 배치 ───────────────────────────────────────────────────
  layout: {
    groundY: 800, // 바닥선 y좌표 (캐릭터 발이 닿는 높이)
    spriteScale: 8, // 도트 1칸을 화면 몇 px로 키울지 (16x24칸 → 128x192px)
    stage1GroomX: 700, // STAGE 1에서 신랑이 서 있는 x좌표(캐릭터 중심)
  },

  // ── 장면 구간 (서로 이어져야 함: 앞 장면 end = 다음 장면 start) ───
  scenes: {
    black: { start: 0, end: 1 }, // 완전 검은 화면
    intro: { start: 1, end: 8, walkEnd: 5.2 }, // 신랑이 어둠 속에서 걸어 들어와 인사
    stage1: { start: 8, end: 55 }, // 인사 + 연애 스토리
    clear: { start: 55, end: 62, switchAt: 58.4, walkBackEnd: 60.6 }, // STAGE 1 CLEAR → 배경 전환
    stage2: { start: 62, end: 92 }, // 달리기 + 점프
    ending: { start: 92, end: 108 }, // 신부 만남 + 마무리 (마지막 화면 고정)
  },

  // ── 말풍선 공통 설정 ────────────────────────────────────────
  bubble: {
    cps: 14, // 글자가 나오는 속도 (초당 글자 수). 클수록 빠름
    hold: 2.2, // 글자가 다 나온 뒤 풍선이 머무는 시간(초). 줄마다 hold로 개별 지정 가능
    popIn: 0.15, // 풍선이 "톡" 튀어나오는 시간
    popOut: 0.15, // 풍선이 사라지는 시간
    fontSize: 52,
    maxWidth: 980,
  },

  // ── 말소리 효과음 (동물의 숲 느낌의 "뿅뿅"). 웹에서 유일하게 소리를 내는 부분 ─
  sfx: {
    blip: true, // false면 효과음 전체 끔
    blipEveryNChars: 2, // N글자마다 한 번 소리
    blipMaxPerLine: 3, // 한 문장에서 최대 몇 번 (아주 크게 늘리면 계속 "뿅뿅뿅")
    pitch: { groom: 520, bride: 760 }, // 기본 음높이(Hz)
    pitchRange: 220, // 무작위로 더해지는 음높이 폭
    volume: 0.12,
  },

  // ── 멘트 ──────────────────────────────────────────────────
  //  at   : 풍선이 뜨는 시각(초)
  //  hold : 글자가 다 나온 뒤 머무는 시간(초) — 웃음 포인트는 길게
  //  who  : 'groom' | 'bride' (기본 groom)
  //  scene: 검사용 — 이 멘트가 속한 장면 이름
  //  stay : true면 풍선을 끄지 않고 남겨둠
  //  ※ 초안입니다. 문구는 언제든 바꿔도 됩니다. (바꾼 뒤 npm run check 로 시간 초과 확인)
  dialogue: [
    // STAGE 1 — 인사 / 감사
    { id: 1, scene: 'stage1', at: 8.0, hold: 2.0, text: '안녕하세요! 신랑 {groom}입니다.' },
    { id: 2, scene: 'stage1', at: 11.9, hold: 2.4, text: '바쁘신 중에 저희 결혼식에 와주셔서 정말 감사합니다!' },
    { id: 3, scene: 'stage1', at: 17.0, hold: 2.2, text: '그럼 저희가 어떻게 만났는지, 짧게 소개해 드릴게요.' },
    // STAGE 1 — 피아노 학원
    { id: 4, scene: 'stage1', at: 22.0, hold: 2.6, text: '첫 직장에 취직하고, 퇴근 후 취미로 피아노 학원에 등록했어요.' },
    { id: 5, scene: 'stage1', at: 27.8, hold: 2.6, text: '그런데 거기서... 아주 아름다운 선생님을 만났습니다.' },
    { id: 6, scene: 'stage1', at: 33.2, hold: 2.4, text: '저는 피아노에만 집중하려고 했어요. 진짜예요.' },
    { id: 7, scene: 'stage1', at: 38.0, hold: 3.6, text: '하지만 피아노는 안 치고... 선생님께 작업만 쳤습니다.' }, // 웃음 포인트
    { id: 8, scene: 'stage1', at: 44.5, hold: 3.4, text: '선생님은 결국 넘어오셨고요. 아니, 제가 넘어간 건가요?' }, // 웃음 포인트
    { id: 9, scene: 'stage1', at: 50.8, hold: 2.2, text: '그렇게 8년 6개월을 함께했습니다.' },
    // (10번 "연애 스테이지, 여기서 CLEAR!" 는 아래 banners 의 'clear' 로 표시)

    // STAGE 2 — 달리는 중
    { id: 11, scene: 'stage2', at: 62.4, hold: 1.2, text: 'STAGE 2. 오늘 이 자리에서 결혼을 증명하고,' },
    { id: 12, scene: 'stage2', at: 66.2, hold: 2.4, text: '앞으로 행복하게 나아가 보려 합니다.' },
    { id: 13, scene: 'stage2', at: 78.0, hold: 2.0, text: '함께하면 장애물쯤이야!' },

    // 엔딩 — 신부 만남
    { id: 14, scene: 'ending', at: 94.8, hold: 1.6, text: '드디어 만났다!' },
    { id: 15, scene: 'ending', at: 97.6, hold: 3.0, text: '두 번째 스테이지, 오늘의 결혼식을 여러분이 함께 축복해 주세요!' },
    // (16번 "{groom} ♥ {bride} · {date}" 는 아래 finalCard 로 표시)
  ],

  // ── 큰 글자 배너 (STAGE 1 / CLEAR / STAGE 2) ─────────────────
  banners: [
    { id: 'stage1', text: 'STAGE 1', sub: '첫 번째 스테이지 · 연애', at: 6.8, hold: 2.6 },
    { id: 'clear', text: 'STAGE 1 CLEAR!', sub: '연애 스테이지, 여기서 CLEAR!', at: 55.2, hold: 3.0 },
    { id: 'stage2', text: 'STAGE 2', sub: '두 번째 스테이지 · 결혼', at: 58.4, hold: 3.4 },
  ],

  // ── STAGE 2 (달리기/점프) ───────────────────────────────────
  stage2: {
    speed: 260, // 맵이 흐르는 속도(px/초)
    groomScreenX: 520, // 달리는 동안 신랑이 화면에서 서 있는 x좌표(중심)
    brideScreenX: 1400, // 맵이 멈췄을 때 신부가 서 있는 x좌표(중심)
    cloudParallax: 0.3, // 구름이 땅보다 얼마나 천천히 흐르는지 (0~1)
    jumpAir: 1.0, // 점프 체공 시간(초)
    jumpHeight: 220, // 점프 높이(px)
    // 장애물: apexAt = 신랑이 장애물 "바로 위"(점프 최고점)에 오는 시각(초)
    //  → 노래 비트에 맞춰 이 숫자만 바꾸면 됩니다. 장애물 위치는 자동 계산돼요.
    //  type: 'crate'(상자) | 'spike'(가시)
    obstacles: [
      { type: 'crate', apexAt: 66.5 },
      { type: 'spike', apexAt: 71.0 },
      { type: 'crate', apexAt: 75.5 },
      { type: 'spike', apexAt: 80.0 },
      { type: 'crate', apexAt: 84.0 },
      { type: 'spike', apexAt: 88.0 },
    ],
    // 장식용 덤불의 맵상 x좌표 (점프와 무관)
    bushes: [300, 1100, 2300, 3300, 4500, 5500, 6700, 7500],
  },

  // ── 엔딩 ───────────────────────────────────────────────────
  ending: {
    brideWaveFrom: 90.5, // 신부가 손을 흔들기 시작하는 시각
    meetWalkEnd: 94.4, // 신랑이 신부 앞에 도착하는 시각
    gap: 170, // 만났을 때 둘 사이 간격(px)
    heartsAt: 94.6, // 하트가 뿅뿅 나오는 시각
    heartCount: 12,
  },

  // ── 마지막 고정 화면 ────────────────────────────────────────
  finalCard: {
    at: 103.6,
    lines: [
      { text: '두 번째 스테이지, 결혼', size: 56, color: '#ffffff' },
      { text: '{groom} ♥ {bride}', size: 140, color: '#ffd84d' },
      { text: '{date}', size: 68, color: '#ffffff' },
    ],
  },

  // ── 음악 편집 메모 (화면에는 나오지 않음. 편집 때 참고용) ────────
  audioCues: [
    { t: 1.0, label: 'BGM① 페이커 롤드컵 곡 — 잔잔하게 시작(낮은 볼륨)' },
    { t: 55.0, label: 'BGM① → ② 전환 준비 (CLEAR)' },
    { t: 62.0, label: 'BGM② 슈퍼마리오풍 시작 (크게)' },
    { t: 92.0, label: 'BGM③ 페이커 곡 하이라이트 시작' },
    { t: 108.0, label: '끝 — 여기서 영상 자르기' },
  ],

  // ── 도트 색상표 (스프라이트가 이 이름으로 색을 찾음) ─────────────
  palette: {
    skin: '#f5c9a0',
    ink: '#1a1a2e',
    mouth: '#c0504d',
    blush: '#f0a0a0',
    // 신랑
    hair: '#2a2a35',
    hairHi: '#8a8a9a',
    suit: '#2b2f4a',
    suitHi: '#5a6196',
    white: '#ffffff',
    tie: '#d7263d',
    tieDark: '#8f1a28',
    shoe: '#151520',
    // 신부
    brown: '#7a4a2a',
    brownHi: '#a66e44',
    veil: '#e4f1ff',
    veilEdge: '#9ec4ea',
    dress: '#ffffff',
    dressShade: '#d9e1f0',
    bouquet: '#ff7aa8',
    leaf: '#4caf50',
    // 하트
    heart: '#ff3b6b',
    heartHi: '#ffb3c7',
  },
};

export default config;
