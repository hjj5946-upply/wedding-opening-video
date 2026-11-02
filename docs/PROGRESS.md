# 작업 진행 상황 (다음 세션은 여기부터 읽기)

> 마지막 갱신: 2026-11-02 · 현재 작업: **P02 스토리 개편** (`docs/prompts/P02_스토리개편.md`) — **A·B·C 완료(사용자 확인), D부터 시작**
> P02 진행 방식: 단계(A~E)마다 `?t=초` 캡처를 보여주고 사용자 확인을 받은 뒤 다음 단계로.

## 새 PC에서 시작할 때
1. `npm install` (이번에 `@fontsource/press-start-2p` 의존성이 추가됨 — 안 하면 빌드 실패)
2. `npm run check` → 오류 0, `npm run build` → 성공 확인
3. `npm run dev` → `http://localhost:5173/?t=30` (맵+피아노+HUD 화면), `?sprites` (도트 확인 화면)
4. 이 문서의 "알려진 이슈"와 "다음 세션에서 먼저 확인할 것"을 확인하고 D단계 진행

## 현재 장면 구간 (config.scenes, 총 108초)
| 장면 | 시간 | 상태 |
|---|---|---|
| black | 0~1 | ✅ 완전 검정 |
| intro | 1~5.5 | ✅ 검정 배경, 신랑이 오른쪽→왼쪽으로 걸어 들어옴(옆모습, 왼쪽 방향) |
| greet | 5.5~23 | ✅ 앞모습으로 돌아서 손 흔들며 인사, 오른쪽 큰 말풍선(side) 멘트 1~3 |
| drop | 23~25 | ✅ 신랑이 위로 사라짐 → 맵 등장 → 낙하/착지(바운스) → HUD 등장(24.5초) |
| piano | 25~40 | ✅ 피아노 옆에서 머리 위 말풍선(above) 멘트 4~6 |
| run | 40~80 | 🚧 맵 스크롤 + 달리기 + 피아노 점프(41.0초)까지만. **D단계에서 완성** |
| meet | 80~90 | 🚧 옛 엔딩 코드를 임시로 옮겨 둔 상태. **E단계에서 새로** |
| fade | 90~96 | ⬜ E단계 |
| closing | 96~108 | ⬜ E단계 (지금은 임시 finalCard가 100초에 뜸) |

원래 초안(P02 표)과 달라진 점: 피아노 멘트 3줄이 12초에 안 들어가서 **drop 23~25 / piano 25~40 / run 40~80** 으로 조정. GAME START(BGM② 시작) = **40초**.

## 완료한 단계

### A. 도트 24×32 + 포즈/방향 시스템 + 발걸음 이벤트 훅 ✅
- `src/sprites/compile.js` — 글자 격자(`rows`) + 굵은 선(`line`, 팔다리) + 사각형/점으로 프레임을 만들고 **바깥 테두리 자동 생성**. 글자→색 = `LEGEND`
- `src/sprites/groom.js` — 신랑 15프레임. 옆모습(오른쪽 방향만): `sideStand_1, walk_1~4, run_1~4, jump_1, hit_1` / 앞모습: `frontStand_1, wave_1~2, fall_1`
- `src/sprites/bride.js` — 신부 4프레임: `frontStand_1, wave_1~2, sideStand_1`
- `src/sprites/props.js` — 맵 소품 도트(피아노, 언덕, 구름, 덤불)
- `src/engine/poses.js` — `poses.add(who, start, end, pose, 'left'|'right'|{facing,fps})` → `poses.at(who, t)` 가 {frame, facing, tick...} 반환. 겹치면 나중에 등록한 구간 우선. 기본 포즈 = frontStand
- `src/components/PixelSprite.jsx` — `setFrame(frame, facing)`. **왼쪽은 캔버스만 좌우 반전**(말풍선은 안 뒤집힘), 앞모습 프레임은 반전 안 함
- PNG 교체: `public/assets/sprites/<groom|bride>/<프레임이름>.png` (예: `groom/walk_1.png`, 24×32, 옆모습은 오른쪽 방향). `vite.config.js` 의 sprite-manifest 플러그인이 있는 파일만 목록화 → `src/sprites/images.js` 가 로드, 없으면 코드 도트
- `src/engine/steps.js` — 발걸음 이벤트(걷기/달리기에서 발 닿는 프레임 0·2번). 시간 이동/되감기/`flags.silent` 중엔 발생 안 함. 소리는 `engine/audio.js` 의 `stepSound()` + `config.sfx.step.enabled`(현재 false). 디버그(D키)에 이벤트 횟수 표시
- `src/components/SpriteGallery.jsx` — **`?sprites`** 도트 확인 화면 (모든 프레임 / 반전 / 검정·하늘 배경 / 움직이는 포즈). `?sprites&t=0.4` 멈춤, `&scale=7` 확대

### B. 오프닝 + 인사 + 큰 말풍선 ✅
- `src/scenes/opening.js` — 순수 검정 배경, x 2100→360 걷기(왼쪽 방향) → 0.25초 옆모습 정지 → 1번 멘트 끝날 때까지 손 흔들기 → 앞모습 서기
- `src/components/Bubble.jsx` + `styles.css` — 말풍선 배치 `side`(캐릭터 오른쪽, 꼬리 왼쪽) / `above`(머리 위, 꼬리는 풍선 왼쪽 tailX 위치, 풍선은 오른쪽으로 펼쳐짐). 글자 64px. **접힌 줄 폭에 맞춰 풍선 폭 자동 조정(`fit()`)**
- `src/engine/dialogue.js` — 현재 시각으로 "떠 있어야 할 멘트"를 골라 글자/배치를 결정 (예전엔 뒤로 시간 이동 시 다른 멘트 글자가 덮어쓰는 버그가 있었음 → 수정)
- 지운 것: `PianoRoom.jsx`(피아노 방 배경/음표), `engine/ambient.js`(음표 애니메이션), `scenes/stage1.js`, `scenes/clear.js`, `.spot` 스포트라이트 CSS, 피아노 방 CSS, 옛 멘트 1~15, 배너 stage1/stage2, `layout.stage1GroomX`, `layout.spriteScale`(→ `sprites.scale`)

### C. 맵 낙하 + HUD + 피아노 + 피아노 멘트 ✅
- `src/scenes/drop.js` — 위로 사라짐(23.0) → 맵 페이드인(23.15) → 낙하(23.8) → 착지 24.5 + 40px 바운스 → 달리기 전까지 앞모습 서기. 값은 `config.drop`
- `src/components/World.jsx` — 맵: 하늘 / 구름(시차 0.25) / 언덕(0.5) / 땅 / 덤불 / 파이프 / 벽돌·?블록 / 피아노 / 신부(맵 끝). 장식 배치는 `map.decorSeed` 고정 난수, 장애물 근처엔 덤불 안 둠
- `src/components/PixelArt.jsx` — 글자 격자 → SVG 사각형(가로 연속 색은 합쳐서 요소 수 줄임)
- `src/components/Hud.jsx` + `src/scenes/hud.js` — 하트 3개(왼쪽 위) + TIME / "1 YEAR"(오른쪽 위), 착지 때 등장. 폰트 Press Start 2P(`styles.css` 의 @font-face, latin woff2만, 빌드에 포함)
- `src/components/Heart.jsx` — 하트 캔버스 공용 컴포넌트
- `src/scenes/run.js` — 맵/언덕/구름 스크롤 + 달리기 포즈 + `addJump(ctx, apexAt)` 로 피아노 점프
- `src/engine/timing.js` — `scrollAt`, `runDistance`, `leftForApex`(apexAt → 맵 x 자동 계산), `jumpWindow`, `PIANO_SIZE`, `GROOM_HIT_W`, `totalDuration`, `lineLayout` (check 스크립트도 같은 함수 사용)

## 남은 단계

### D. 달리기 + 글자 장애물 + 충돌/하트 + TIME 증가 (다음 할 일)
- 40초 "GAME START" 배너 (+ 제안: "STAGE 1" 함께) — `config.banners` 에 추가, 신랑은 오른쪽 보고 달리기(이미 동작)
- 글자 장애물 4개: "수많은" / "우여곡절" / "많은" / "일들이". `hit: true|false` (기본: 우여곡절·일들이 = true). 글자는 장애물 위/안에 크고 선명하게
  - 점프 장애물: `apexAt` → 위치 자동 (`leftForApex`) / 충돌 장애물: `hitAt`(부딪히는 시각) → 위치 자동 계산 함수를 `engine/timing.js` 에 추가하고 check에서도 사용
  - 충돌 장애물은 신랑이 통과해야 하므로(맵은 계속 흐름) "부딪힌 뒤 부서짐/쓰러짐" 등 처리 방식 결정 필요
- 충돌 연출: `hit` 포즈 + 살짝 뒤로 밀렸다 복귀 + 깜빡임 + HUD 하트 하나 터지듯 사라짐 (3→2→1, **절대 0 안 됨** — check가 검사)
  - 하트 개수/TIME 값은 "현재 시각"으로 계산되게 (seek-safe). `refs.hudHearts[i]`, `refs.hudTime` 사용
- TIME: 맵 스크롤 거리(`scrollAt`)에 비례해 1 → 8 YEAR (`config.hud.time`)
- 장애물을 다 지난 뒤 말풍선: "있었지만 8년 6개월을 만났고, 오늘 지금 이 자리, 드디어 STAGE 2탄으로 향해 가려 합니다!" (달리는 중 머리 위 above, 장면은 run 또는 meet 시작)
- `scripts/check-config.mjs` 5번 섹션 확장: 점프·충돌 타이밍 겹침, 체공/높이, 하트 0 방지

### E. 신부 만남 + 페이드 + 마무리 감사 + 문서/check 정리
- 맵 멈춤 → 신부 등장 → 신랑 걸어가 만남(서로 마주 보는 옆모습: 신부는 `sideStand` facing left) → 하트 → 둘 다 앞모습 손 흔들기 → "STAGE 1 CLEAR!" 배너 + 짧은 번쩍임
- 90~96 화면 전체(HUD 포함) 검정 페이드 → 96~ 흰 글씨 감사 인사 한 줄씩, 끝까지 고정. 문구는 `config.closing` 배열 (P02 초안 4줄)
- 지울 것: `scenes/ending.js` 임시 코드, `config.ending`(임시), `config.finalCard`(→ closing), `Scene.jsx` 의 finalCard
- `config.audioCues` 최종: ① 1.0초 / ② 40.0초(GAME START) / ③ 신부 만나는 시각
- check 정리: 총 길이(110초 초과 경고), 멘트 구간/겹침, 장애물, 하트, 배너 시간. "36자 넘으면 경고" 기준은 말풍선 배치(side는 3줄 들어감)에 맞게 조정
- 문서 갱신: `docs/02_SCENARIO.md`(장면표/멘트/BGM 큐), `docs/03_DECISIONS.md`(이번 변경 결정), `CLAUDE.md`(스프라이트 방향/포즈 규칙), `README.md`(키 0~8, ?sprites, 수정 위치 표)
- 완료 기준 캡처: `?t=3, 8, 24, 30, 45, 60, 75, 85, 93, 100, 107`

## 그 이후: P03 계획 (사용자 요청, 아직 시작 안 함)
1. 신부를 만나면 HUD 하트가 3개로 다시 가득 차는 연출
2. **`?music=1` 미리듣기**: BGM 3곡이 타임라인 시각(audioCues)에 맞춰 재생, `?t=` 이동에도 따라감. 녹화 땐 끔(주소에 안 붙이면 무음). 곡별 시작 위치와 볼륨은 config에서 조절. 파일은 `public/assets/audio/` (이미 `.gitignore` 로 깃에서 제외)
   - CLAUDE.md "웹에서 나는 소리는 blip뿐" 규칙의 예외(미리듣기 전용, 녹화 땐 끔)이므로 문서에 명시할 것

## 사용자가 확정한 결정
- P02 새 흐름 전체(위 장면표), A·B·C 단계 결과물 확인 완료
- 신랑 이름 `couple.groom = '홍정준'` / 인사 멘트 1~3 문구(P02 원문)
- 스포트라이트 삭제, 오프닝은 순수 검정 배경
- 옆모습은 오른쪽 방향만 그리고 왼쪽은 반전(말풍선은 안 뒤집힘)
- 걸음 효과음은 훅만(소리는 나중에 사용자가 연결)
- HUD 폰트 Press Start 2P 추가 허용
- 기존 게임 캐릭터/맵 모사 금지 — 일반 플랫포머 요소만, 오리지널 도트

## Claude가 임의로 정한 값 (사용자가 바꿀 수 있음, 전부 src/config.js)
| 항목 | 값 | 위치 |
|---|---|---|
| 도트 화면 배율 | 7 (168×224px) | `sprites.scale` |
| 포즈 속도 | 걷기 8 / 달리기 12 / 손 흔들기 4 (초당 프레임) | `sprites.fps` |
| 장면 시간 | drop 23~25, piano 25~40, run 40~80 | `scenes` |
| 오프닝 | 출발 x 2100, 정지 x 360, 발 높이 700, 정지 후 옆모습 0.25초 | `intro`, `scenes/opening.js` TURN_PAUSE |
| 말풍선 | 64px, side 최대폭 1340 / 간격 40 / 세로중심 0.32, above 최대폭 1100 / 간격 34 / tailX 150 | `bubble` |
| 멘트 시각/hold | 1~3: 5.8/9.6/16.1초, hold 2.0/2.6/2.6 · 4~6: 25.2/30.3/34.3초, hold 2.0/1.8/2.8 | `dialogue` |
| 낙하 | leave 23.0(0.45초), 맵 페이드 23.15(0.5초), 낙하 23.8, 착지 24.5, 바운스 40px | `drop` |
| 맵 | 속도 320px/s, 신랑 x 480, 점프 높이 300 / 체공 1.0초, 시차 구름 0.25 / 언덕 0.5 | `map` |
| 피아노 | apexAt 41.0 (224×208px) | `map.piano` |
| 장식 | 파이프 x 60, 블록 3묶음(1480/2500/3500), decorSeed 7 | `map` |
| HUD | 하트 8배 x56 y44 간격16, TIME 라벨 30px / 값 46px, 오른쪽 56 | `hud` |
| 색 | 정장 #3a4066 / 하이라이트 #7d88cc / 머리 #3a3546 / 가르마 #b4aed0 등 | `palette` |
| 발걸음 소리 | enabled false, volume 0.08 | `sfx.step` |

## 알려진 이슈 / 임시 상태
- **23초 이후 일부는 임시**: `scenes/ending.js`(옛 엔딩 이식: 80초 신랑 걸어감, 하트), `config.ending`, `config.finalCard`(100초), 배너 'clear'(86초), `audioCues` 의 80초 값 — D/E에서 교체
- HUD 하트는 아직 안 깎이고 TIME은 "1 YEAR" 고정 (D단계)
- `npm run check` 경고: 멘트 2·3이 36자 초과(실제로는 side 풍선 3줄로 잘 들어감 — E에서 기준 조정), 신부 이름 `OOO`, 날짜 `2026.00.00` 미입력
- `README.md`, `docs/02_SCENARIO.md`, `docs/03_DECISIONS.md`, `CLAUDE.md` 의 장면/구조 설명은 아직 옛 내용 (E단계에서 일괄 갱신 예정)
- 헤드리스 Chrome 캡처는 시간이 한 번에 크게 건너뛰어서 `?sprites` 의 발걸음 이벤트가 0으로 찍힘(정상: 시간 이동은 무시하도록 설계). 실제 브라우저에선 증가해야 함 — 사용자 미확인
- 헤드리스 캡처에서 가끔 화면 좌우에 검은 여백이 생김(창 크기 문제, 앱 문제 아님)
- 말풍선 폭 맞춤(`fit`)은 폰트 로딩 후 측정 — 폰트 로딩 전에 `?t=` 로 열면 `document.fonts.ready` 후 다시 맞춤

## 다음 세션에서 먼저 확인할 것
1. `npm install` → `npm run check` / `npm run build` 통과
2. `?t=24.6`, `?t=37`, `?t=41` 캡처가 C단계 결과와 같은지 (착지+HUD / 머리 위 말풍선 / 피아노 점프)
3. 사용자에게 C단계 이후 실제 브라우저 재생 소감(낙하 속도, 멘트 읽기 속도, 맵 색감)이 있었는지 물어본 뒤 D단계 시작

## 화면 캡처 방법 (Claude Code용)
개발 서버(`npx vite --port 5173`)를 켠 뒤 Chrome 헤드리스로:
```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1920,1080 --virtual-time-budget=4000 \
  --screenshot=<저장경로>.png "http://localhost:5173/?t=30"
```
(Edge도 같은 옵션으로 가능: `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`)
