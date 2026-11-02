// ============================================================================
//  결혼식 오프닝 영상 — 설정 파일
//  ▶ 문구 / 타이밍 / 색 / 위치 / 음악은 거의 전부 여기서 수정합니다.
//  ▶ 시간 단위는 "초". 0초 = 스페이스바를 누른 순간.
//  ▶ 이 파일은 순수 데이터만 둡니다. (React/DOM import 금지)
//    scripts/check-config.mjs 가 이 파일을 그대로 읽어서 검사하기 때문이에요.
//  ▶ 문구 안의 {groom} {bride} {date} 는 couple 값으로 자동 치환됩니다.
//  ▶ 바꾼 뒤에는 꼭 `npm run check` 로 시간 겹침/초과를 확인하세요.
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
    charH: 224, // 캐릭터 높이(px) = 도트 32칸 × sprites.scale 7
  },

  // ── 도트 캐릭터 ────────────────────────────────────────────
  //  임시 코드 도트 24×32칸. public/assets/sprites/<groom|bride>/<포즈>_<번호>.png 로 교체 가능
  sprites: {
    scale: 7, // 도트 1칸 = 화면 몇 px (24×32칸 → 168×224px)
    fps: { walk: 8, run: 12, wave: 4 }, // 포즈별 프레임 교체 속도(초당)
  },

  // ── 장면 구간 (서로 이어져야 함: 앞 장면 end = 다음 장면 start) ───
  scenes: {
    black: { start: 0, end: 1 }, // 완전 검은 화면
    intro: { start: 1, end: 5.5 }, // 검정 배경, 신랑이 오른쪽 → 왼쪽으로 걸어 들어옴
    greet: { start: 5.5, end: 23 }, // 왼쪽에 멈춰 앞모습, 손 흔들며 인사
    drop: { start: 23, end: 25 }, // 맵 등장 + 신랑 낙하/착지 + HUD
    piano: { start: 25, end: 34 }, // 그랜드 피아노 앞에서 멘트 2줄
    game: { start: 34, end: 70 }, // STAGE 1 START → 상자 8개 · 낭떠러지 · 벽돌 · 거북이 · 계단+깃발
    meet: { start: 70, end: 84 }, // 신부 만남 + 하트 회복 + 인사 → 나란히 오른쪽으로(STAGE 2)
    fade: { start: 84, end: 87 }, // 화면 전체가 검정으로
    closing: { start: 87, end: 105 }, // 검은 화면에 감사 인사 → 완전한 검정
  },

  // ── 오프닝 (검정 배경에서 걸어 들어오기 + 인사) ─────────────────
  intro: {
    fromX: 2100, // 출발 x (화면 오른쪽 바깥, 캐릭터 중심)
    groomX: 360, // 멈추는 x (화면 왼쪽)
    feetY: 700, // 이 구간에서 신랑 발 높이
    waveLine: 1, // 이 멘트가 끝날 때까지 손 흔들기
  },

  // ── 맵 등장 + 낙하 (drop) ─────────────────────────────────────
  drop: {
    leaveAt: 23.0, // 신랑이 위로 뛰어올라 화면 밖으로
    leaveDur: 0.45,
    mapFadeAt: 23.15, // 맵이 나타나기 시작
    mapFadeDur: 0.5,
    fallStart: 23.8, // 화면 위에서 떨어지기 시작
    landAt: 24.5, // 착지 (= HUD 등장)
    bounce: 40, // 착지 후 튕기는 높이(px)
  },

  // ── 플랫포머 맵 (낙하 ~ 깃발까지 같은 맵) ────────────────────────
  //  맵 좌표 x: 0 = 맵이 처음 나타났을 때 화면 왼쪽 끝.
  //  game.start 부터 speed 로 흐르고, 계단 꼭대기(자동 계산)에서 멈춥니다.
  map: {
    speed: 340, // 맵이 흐르는 속도(px/초)
    groomX: 420, // 맵 위에서 신랑이 서 있는 화면 x(중심)
    parallax: { clouds: 0.25, hills: 0.5 }, // 배경이 땅보다 얼마나 천천히 흐르는지
    jump: { air: 0.85, height: 240 }, // 보통 점프: 체공(초) / 높이(px)
    pitJump: { air: 1.05, height: 250 }, // 낭떠러지 건너뛰기
    boxY: 280, // 물음표상자 위쪽 y
    boxSize: 72, // 상자 한 칸 크기(px)

    // ── 물음표상자 8개 = 1년 ~ 8년 ──────────────────────────────
    //  apexAt = 신랑이 점프 최고점에서 상자를 머리로 치는 시각 → 위치는 자동 계산
    //  치면: 상자가 튀고 빈 상자로 + 하트 뿅뿅 + 그 자리에서 동그란 사진이 떠올랐다가 "팡"
    boxes: [
      { year: 1, apexAt: 35.7 },
      { year: 2, apexAt: 38.0 },
      { year: 3, apexAt: 42.5 },
      { year: 4, apexAt: 46.5 },
      { year: 5, apexAt: 54.0 },
      { year: 6, apexAt: 58.5 },
      { year: 7, apexAt: 61.0 },
      { year: 8, apexAt: 63.5 },
    ],

    // ── 낭떠러지 (땅이 끊긴 구간). apexAt = 건너뛰는 점프의 최고점 시각 ──
    //  시각으로 위치가 정해지므로 항상 정확히 건넙니다(떨어지지 않음). 하트도 안 닳음
    pits: [
      { apexAt: 40.2, w: 230 },
      { apexAt: 52.0, w: 260 },
    ],

    // ── 벽돌 장애물 (글자 없는 작은 벽돌 블록). hit: true 면 부딪혀서 하트가 깎임 ──
    obstacles: [
      { id: 'b1', label: '벽돌1', hit: false, apexAt: 44.3, w: 130, h: 130 },
      { id: 'b2', label: '벽돌2', hit: true, hitAt: 48.5, w: 150, h: 150 },
      { id: 'b3', label: '벽돌3', hit: true, hitAt: 56.3, w: 150, h: 150 },
    ],
    // 부딪혔을 때 연출 (초 / px)
    hitFx: {
      knockback: 80, // 뒤로 밀리는 거리(px)
      back: 0.14,
      pause: 0.16,
      recover: 0.42,
      blink: 0.96, // 깜빡이는 시간 (무적 느낌)
      topple: 0.55, // 장애물이 넘어지며 사라지는 시간
    },

    // ── 거북이 몬스터 1마리 (왼쪽으로 기어옴 → 신랑이 점프로 넘음) ──────
    turtle: { apexAt: 50.6, w: 126, h: 90, speed: 60 }, // speed: 맵보다 더 빨리 다가오는 속도(px/초)

    // ── 계단 + 깃발 (게임 구간 마무리) ───────────────────────────
    //  atTime 에 첫 칸이 신랑 발밑에 오도록 위치가 자동 계산됩니다.
    stairs: { atTime: 65.0, steps: 6, stepW: 90, stepH: 60 },
    flag: {
      screenX: 900, // 맵이 멈췄을 때 깃대가 서 있는 화면 x
      poleH: 520, // 깃대 높이(px)
      grabY: 280, // 신랑이 깃대를 잡는 높이 (바닥에서 px)
      jumpAt: 66.9, // 계단 꼭대기에서 깃대로 뛰는 시각
      touchAt: 67.4, // 깃대를 치는 시각 (= 깃발이 내려오기 시작 / 음악 페이드아웃)
      slideDur: 1.2, // 깃발과 신랑이 미끄러져 내려오는 시간
    },

    // ── 장식 (연출과 무관) ────────────────────────────────────
    pipes: [
      { x: 1500, h: 2 },
      { x: 7000, h: 3 },
    ],
    // 장식 벽돌 — 물음표상자(y 280)보다 위에 둬서 점프하는 신랑과 겹치지 않게
    blockRows: [
      { x: 2850, y: 196, pattern: 'BB' },
      { x: 5600, y: 196, pattern: 'BBB' },
      { x: 8450, y: 196, pattern: 'BB' },
    ],
    decorSeed: 7, // 구름/언덕/덤불 배치용 난수 씨앗
  },

  // ── 그랜드 피아노 (public/assets/images/grandPiano.png) ────────────
  //  건반이 왼쪽을 향한 그림이라, 신랑이 건반 앞에 서도록 x를 맞춰 둠
  piano: {
    src: './assets/images/grandPiano.png',
    x: 246, // 그림 왼쪽 끝 (맵 좌표)
    w: 700, // 그림 폭 (비율 유지 → 높이 자동)
    bottomY: 832, // 그림 아래쪽이 놓이는 y
  },

  // ── 연도별 사진 (물음표상자를 치면 그 자리에서 동그랗게 떠올랐다가 "팡") ──
  //  파일이 없으면 "N YEAR" 글자 동그라미가 대신 보입니다 (화면은 그대로 돌아감)
  //  권장: public/assets/photos/year1.jpg ~ year8.jpg, 긴 변 1200px 이하 jpg
  photos: {
    dir: './assets/photos/',
    size: 280, // 동그라미 지름(px)
    riseY: 10, // 상자 중심에서 위로 얼마나 떠오르는지(px) — HUD 하트/신랑과 안 겹치게 작게
    drift: 130, // 떠 있는 동안 왼쪽으로 흘러가는 속도(px/초) — 맵보다 느려서 오래 보임
    objectPosition: 'center 38%', // 동그라미 안에서 사진의 어느 부분을 보여줄지 (세로 사진은 위쪽이 얼굴)
    delay: 0.05, // 상자를 친 뒤 몇 초 있다가 나오는지
    popIn: 0.26,
    hold: 1.5, // 떠 있는 시간 (상자 간격보다 짧아야 함 — check 가 검사)
    burst: 0.3, // "팡" 터지는 시간
    list: [
      { year: 1, src: 'year1.jpg' },
      { year: 2, src: 'year2.jpg' },
      { year: 3, src: 'year3.jpg' },
      { year: 4, src: 'year4.jpg' },
      { year: 5, src: 'year5.jpg' },
      { year: 6, src: 'year6.jpg' },
      { year: 7, src: 'year7.jpg' },
      { year: 8, src: 'year8.jpg' },
    ],
  },

  // ── HUD (착지와 함께 등장, 영상이 검어질 때까지) ────────────────────
  hud: {
    hearts: { count: 3, x: 56, y: 44, scale: 8, gap: 16 }, // 왼쪽 위 하트(라이프)
    //  TIME 은 물음표상자를 칠 때마다 1씩 올라갑니다 (상자 8개 = 8 YEAR)
    time: {
      label: 'TIME',
      unit: 'YEAR',
      start: 0,
      right: 56,
      y: 44,
      labelSize: 30,
      valueSize: 46,
      finalText: '8 YEAR 6 MONTH', // 깃발을 친 뒤 마무리 표시
    },
  },

  // ── 말풍선 공통 설정 ────────────────────────────────────────
  //  멘트마다 layout: 'side'(캐릭터 오른쪽) | 'above'(머리 위) | 'game'(화면 아래 고정 자막칸)
  bubble: {
    cps: 14, // 글자가 나오는 속도 (초당 글자 수)
    hold: 2.2, // 글자가 다 나온 뒤 머무는 시간(초)
    popIn: 0.15,
    popOut: 0.15,
    fontSize: 64,
    layout: 'above',
    side: { maxWidth: 1340, gap: 40, centerY: 0.32 },
    above: { maxWidth: 1400, gap: 34, tailX: 150 },
    // 게임 구간 전용: 화면 아래쪽 고정 자막칸 (상자/사진/HUD와 안 겹침, 최대 2줄)
    game: { x: 80, y: 852, maxWidth: 1760, fontSize: 56 },
  },

  // ── 소리: 말풍선 말소리 + 효과음 ────────────────────────────────
  //  ?sfx=0 으로 끌 수 있고, ?mute=1 이면 음악까지 전부 꺼집니다.
  sfx: {
    blip: true, // 말풍선 말소리 전체 on/off
    blipEveryNChars: 1, // 1 = 글자마다 소리
    blipMaxPerLine: null, // null = 한 문장에서 횟수 제한 없음
    blipMinGap: 0.03, // 소리 사이 최소 간격(초)
    // ── 동물의 숲 느낌의 "말소리" (단순 비프음이 아니라 모음처럼 들리게) ──
    blipType: 'triangle', // 파형: triangle(부드러움) / square(또렷) / sawtooth(거침)
    blipDuration: 0.09, // 한 글자 소리 길이(초). 길수록 말하는 느낌
    blipGlide: 0.74, // 소리 중에 음높이가 이 비율까지 내려감 (0.74 = 26% 하강)
    blipFormant: 1150, // 입 모양(포먼트) 주파수 — 사람 목소리처럼 들리게 하는 필터
    blipFormantRange: 520, // 글자마다 입 모양이 바뀌는 폭 (모음이 달라지는 느낌)
    blipFormantQ: 7, // 필터 날카로움. 크면 더 "아/에/이" 같아짐
    blipDetune: 0.07, // 글자마다 음높이를 ±7% 흔들기
    pitch: { groom: 330, bride: 430 }, // 기본 음높이(Hz) — 낮을수록 굵은 목소리
    pitchRange: 0, // (옛 설정) 지금은 blipDetune 을 씀
    volume: 0.1,
    maxVoices: 8, // 동시에 울리는 소리 개수 제한
    box: { enabled: true, volume: 0.14 }, // 물음표상자를 칠 때 '통'
    pop: { enabled: true, volume: 0.14 }, // 하트가 튀어나올 때 '뿅'
    burst: { enabled: true, volume: 0.13 }, // 사진이 "팡" 터질 때
    heal: { enabled: true, volume: 0.18 }, // HUD 하트가 채워질 때
    flag: { enabled: true, volume: 0.16 }, // 깃발을 칠 때
    step: { enabled: false, volume: 0.08, pitch: { groom: 120, bride: 170 } }, // 발걸음(훅만)
  },

  // ── 음악 (웹페이지가 직접 재생 → OBS 데스크톱 오디오로 함께 녹음) ──────
  //  ?music=0 으로 음악만 끄고, ?mute=1 이면 전부 끕니다.
  //  파일은 public/assets/audio/ (깃에는 안 올라감 — 다른 PC에서는 따로 복사)
  audio: {
    enabled: true,
    masterVolume: 0.9,
    dir: './assets/audio/',
    //  volume: 0~1 / offset: 파일 안에서 몇 초부터 재생할지 / loop: 구간보다 짧으면 반복
    tracks: {
      walk: { src: 'walk.mp3', volume: 0.5, offset: 0, loop: true }, // 22.6초
      intro: { src: 'intro.mp3', volume: 0.4, offset: 0, loop: false }, // 40.5초
      game: { src: 'inGame.mp3', volume: 0.34, offset: 0, loop: true }, // 125.2초
      outro: { src: 'outro.mp3', volume: 0.42, offset: 0, loop: false }, // 42.5초
    },
    //  start/stop = 영상 시각(초). fadeOut 은 stop "이전"부터 서서히 줄어듭니다.
    cues: [
      { id: 'walkIn', track: 'walk', start: 1.0, stop: 5.5, fadeIn: 0.2, fadeOut: 0.35 },
      { id: 'greet', track: 'intro', start: 5.6, stop: 33.6, fadeIn: 0.8, fadeOut: 0.6 },
      { id: 'game', track: 'game', start: 34.0, stop: 69.0, fadeIn: 0.25, fadeOut: 1.5 },
      // 깃발을 내린 뒤 신부에게 걸어가는 동안만 발소리처럼 살짝
      { id: 'walkMeet', track: 'walk', start: 70.2, stop: 72.6, fadeIn: 0.15, fadeOut: 0.3, volume: 0.32 },
      // 신부를 만나는 순간부터 끝까지
      { id: 'outro', track: 'outro', start: 72.6, stop: 105.0, fadeIn: 1.0, fadeOut: 2.5 },
    ],
  },

  // ── 멘트 ──────────────────────────────────────────────────
  //  at: 뜨는 시각 / hold: 글자가 다 나온 뒤 머무는 시간 / cps: 이 줄만 다른 타이핑 속도
  //  scene: 속한 장면 이름 (check 가 구간을 벗어나는지 검사) / layout: 'side' | 'above' | 'game'
  dialogue: [
    // 인사 (검정 배경, 오른쪽 큰 말풍선)
    { id: 1, scene: 'greet', layout: 'side', at: 5.8, hold: 2.0, text: '안녕하세요. 신랑 {groom}입니다.' },
    { id: 2, scene: 'greet', layout: 'side', at: 9.6, hold: 2.6, text: '날씨도 춥고, 다들 바쁘신 와중에도 저희를 위해 소중한 시간을 내주셔서 감사합니다.' },
    { id: 3, scene: 'greet', layout: 'side', at: 16.1, hold: 2.6, text: '예식 시작 전 간략하게 저희가 어떻게 오늘 이 자리까지 오게 되었는지 말씀 드리겠습니다.' },
    // 피아노 앞 (머리 위 말풍선)
    { id: 4, scene: 'piano', layout: 'above', at: 25.3, hold: 1.4, text: '첫 직장에 취직하고, 퇴근 후 취미로 피아노 학원에 등록했어요.' },
    { id: 5, scene: 'piano', layout: 'above', at: 29.7, cps: 15, hold: 1.6, text: '그런데 거기서... 아주 아름다운 선생님을 만났습니다.' },
    // 게임 구간 (화면 아래 자막칸, 최대 2줄)
    //  어른들도 읽을 수 있게 천천히(cps 12) + 다 나온 뒤 2초 넘게 유지
    { id: 6, scene: 'game', layout: 'game', at: 35.5, cps: 12, hold: 2.2, text: '저는 피아노에만 집중하려고 했어요. 진짜예요. (진짜임)' },
    { id: 7, scene: 'game', layout: 'game', at: 41.2, cps: 12, hold: 2.2, text: '근데 쳐야 할 피아노는 안 치고... 선생님께 작업만 쳤습니다.' },
    { id: 8, scene: 'game', layout: 'game', at: 47.2, cps: 12, hold: 2.4, text: '그리고 결국 선생님이 저에게 넘어왔습니다. 아니, 제가 넘어간...? 예... 뭐, 그렇습니다.' },
    { id: 9, scene: 'game', layout: 'game', at: 55.0, cps: 12, hold: 2.3, text: '아무튼 8년 6개월의 연애를 마치고, 이제 다음 챕터로 넘어가 보려 합니다.' },
    { id: 10, scene: 'game', layout: 'game', at: 61.7, cps: 12, hold: 2.4, text: '앞으로의 길도 함께 잘 걸어갈 수 있다는 걸, 오늘 증명해 보이겠습니다.' },
  ],

  // ── 큰 글자 배너 ────────────────────────────────────────────
  banners: [
    // 게임 시작 (1 YEAR 상자를 치기 직전에 사라짐)
    { id: 'stage1', text: 'STAGE 1 START', sub: '우리가 만난 이야기', at: 34.0, hold: 1.2 },
    // 둘이 손잡고 오른쪽으로 걸어가기 시작할 때
    { id: 'stage2', text: 'STAGE 2 START', sub: '이제부터는 둘이서', at: 77.8, hold: 3.4 },
  ],

  // ── 신부 만남 (meet 장면) ────────────────────────────────────
  //  깃발을 내린 뒤 → 걸어가 만남(이 순간부터 outro) → 하트 → HUD 하트 회복
  //  → 둘이 인사 → 손잡고 오른쪽으로 쫄쫄 걸어감(STAGE 2)
  meet: {
    brideScreenX: 1360, // 맵이 멈췄을 때 신부가 서 있는 화면 x(중심)
    gap: 180, // 만났을 때 두 사람 중심 사이 거리(px)
    walkFrom: 70.2, // 신랑이 걷기 시작 (이때만 walk 소리)
    walkEnd: 72.6, // 신부 앞에 도착 — 이 순간부터 outro.mp3
    heartsAt: 72.8, // 두 사람 사이에서 하트가 터져 나옴
    heartCount: 12,
    heartStagger: 0.09,
    heartRise: 1.5,
    heartY: 280, // 하트가 시작하는 높이 (바닥선에서 위로 px)
    healAt: 73.6, // HUD 하트가 하나씩 다시 채워지기 시작
    healGap: 0.65,
    waveAt: 75.4, // 둘 다 앞모습으로 돌아 손 흔들기
    // 꾸벅 인사 (전용 도트 프레임 bow_1 / bow_2 사용)
    bowAt: 76.0, // 고개를 숙이기 시작
    bowDown: 0.32, // 숙이는 데 걸리는 시간
    bowHold: 0.55, // 숙인 채로 머무는 시간
    bowUp: 0.3, // 고개를 드는 시간
    // 나란히 오른쪽으로 쫄쫄 걸어가기 (STAGE 2 배너와 같은 시각)
    strollAt: 77.8,
    strollEnd: 83.2,
    strollDist: 430, // 둘이 오른쪽으로 이동하는 거리(px)
  },

  // ── 마무리 감사 인사 (검정 페이드 → 흰 글씨 한 줄씩 → 완전한 검정) ──────
  //  at = 나타나는 시각 / out = 사라지기 시작하는 시각
  closing: {
    blackoutDur: 2.0, // fade 장면 시작부터 검정으로 덮이는 시간
    maxWidth: 1700,
    fadeIn: 0.9,
    fadeOut: 0.8,
    size: 54,
    color: '#ffffff',
    lines: [
      { at: 87.8, out: 91.2, text: '귀한 걸음으로 함께해 주셔서 진심으로 감사드립니다.' },
      { at: 91.8, out: 95.2, text: '이제 저희 두 사람, 새로운 길의 첫걸음을 내딛습니다.' },
      { at: 95.8, out: 99.2, text: '오늘 이 자리에서 저희의 앞날을 함께 축복해 주세요.' },
      { at: 99.8, out: 103.2, text: '신랑 {groom} · 신부 {bride}', size: 88, color: '#ffd84d' },
    ],
  },

  // ── 도트 색상표 (스프라이트가 이 이름으로 색을 찾음) ─────────────
  palette: {
    outline: '#0b0b14',
    skin: '#f5c9a0',
    skinShade: '#d9a37a',
    ink: '#1a1a2e',
    mouth: '#c0504d',
    blush: '#f0a0a0',
    // 신랑
    hair: '#3a3546',
    hairHi: '#b4aed0',
    suit: '#3a4066',
    suitHi: '#7d88cc',
    suitShade: '#262a45',
    suitArm: '#4b5384',
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
