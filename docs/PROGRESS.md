# 작업 진행 상황 (다음 세션은 여기부터 읽기)

> 마지막 갱신: 2026-11-02 · **P02 스토리 개편(A~E) 전부 구현 완료 — 처음부터 끝까지 이어지는 영상이 됐습니다.**
> 다음 할 일: 깜자가 **전체 재생**으로 확인 → 수정 요청 → 그다음 P03(아래) 또는 문구/타이밍 다듬기

## 새 PC에서 시작할 때
1. `npm install` (`galmuri`, `@fontsource/press-start-2p` 의존성 — 안 하면 빌드 실패)
2. `npm run check` → 오류 0, `npm run build` → 성공 확인
3. `npm run dev` → `http://localhost:5173` 에서 **F11 → 스페이스바**로 전체 재생. `?sprites` 는 도트 확인 화면
4. 아래 "알려진 이슈 / 남은 입력"을 확인

## 현재 장면 구간 (config.scenes, 총 108초) — 전부 구현됨
| 장면 | 시간 | 내용 |
|---|---|---|
| black | 0~1 | 완전 검정 |
| intro | 1~5.5 | 검정 배경, 신랑이 오른쪽→왼쪽으로 걸어 들어옴(옆모습) |
| greet | 5.5~23 | 앞모습으로 돌아 손 흔들며 인사, 오른쪽 큰 말풍선(side) 멘트 1~3 |
| drop | 23~25 | 위로 사라짐 → 맵 등장 → 낙하/착지(바운스) → HUD 등장(24.5) |
| piano | 25~40 | 피아노 옆에서 머리 위 말풍선(above) 멘트 4~6 |
| run | 40~80 | GAME START 배너(40.0) + 달리기 + 장애물 5개(점프3/충돌2) + 하트 3→1 + TIME 1→8 + 멘트 7(70.5) |
| meet | 80~90 | 맵 정지 → 걸어가 만남(83.2) → 하트 → 손 흔들기(85.0) → 번쩍임 + STAGE 1 CLEAR(86.0) |
| fade | 90~94 | 화면 전체(HUD 포함) 2초간 검정으로 덮임 → 2초 정적 |
| closing | 94~108 | 검은 화면에 흰 글씨 감사 인사 4줄, 끝까지 고정 |

## 구현 요약 (P02 A~E)

### A. 도트 24×32 + 포즈/방향 시스템 + 발걸음 이벤트 훅
- `sprites/compile.js` — 글자 격자(`rows`) + 굵은 선(`line`) + 사각형/점 → 프레임, 바깥 테두리 자동 생성
- `sprites/groom.js` 15프레임 (`sideStand_1, walk_1~4, run_1~4, jump_1, hit_1, frontStand_1, wave_1~2, fall_1`) · `sprites/bride.js` 4프레임 · `sprites/props.js` 맵 소품
- `engine/poses.js` — 구간 등록 → `poses.at(who, t)` 가 현재 시각으로 프레임/방향 결정. 겹치면 나중 등록 우선
- `components/PixelSprite.jsx` — 왼쪽은 **캔버스만** 좌우 반전(말풍선은 안 뒤집힘)
- `engine/steps.js` — 발걸음 이벤트(소리는 `sfx.step.enabled: false` 로 꺼둠, 훅만). 시간 이동 중엔 안 울림
- PNG 교체 구조 + `?sprites` 확인 화면

### B. 오프닝 + 인사 + 큰 말풍선
- `scenes/opening.js` — 순수 검정, x 2100→360 걷기 → 0.25초 옆모습 정지 → 1번 멘트 끝까지 손 흔들기 → 앞모습
- `components/Bubble.jsx` — `side`/`above` 배치, 글자 64px, 접힌 줄 폭에 맞춰 풍선 폭 자동 조정(`fit()`)
- `engine/dialogue.js` — 현재 시각으로 "떠 있어야 할 멘트"를 선택(되감기 안전)

### C. 맵 낙하 + HUD + 피아노
- `scenes/drop.js`(값은 `config.drop`), `components/World.jsx`(하늘/구름/언덕/땅/덤불/파이프/블록/피아노/신부), `components/Hud.jsx`
- `engine/timing.js` — `scrollAt`, `runDistance`, `leftForApex`, `jumpWindow` 등 공용 시간 계산(check도 같은 함수 사용)

### D. 달리기 + 글자 장애물 + 충돌/하트 + TIME
- `config.map.obstacles` — 수많은(점프 47.0) / 우여곡절(충돌 53.5) / 많은(점프 60.5) / 일들이(충돌 67.0). **시각만 적으면 위치 자동 계산**
- `scenes/run.js` 의 `addJump` / `addHit` — 충돌 시 피격 포즈 + 뒤로 80px 밀림 + 깜빡임 + 장애물이 앞으로 넘어지며 사라짐
- `scenes/hud.js` — 하트 3→2→1(오른쪽부터), TIME 1→8 YEAR (`hud.time.fullAt: 68.0`). `buildHud` 가 `{ update(t) }` 반환 → 매 프레임 현재 시각으로 계산
- `engine/timing.js` 추가: `leftForHit`, `hitWindow`, `obstacleInfo`, `obstacleFontSize`, `allObstacles`, `heartsAt`, `timeYears`

### E. 신부 만남 + 페이드 + 마무리 감사 인사
- `scenes/meet.js` (옛 `scenes/ending.js` 삭제) — 맵 정지 → 신랑이 x 480→1020 걸어감 → 마주 보는 옆모습 → 하트 분수(좌우 교대) → 85.0 둘 다 앞모습 손 흔들기 → 86.0 번쩍임
- `scenes/closing.js` — `.blackout` 층(z-index 10)으로 **HUD·배너까지 전부** 검정으로 덮고, `.closing` 층(11)에 감사 인사 4줄이 한 줄씩 떠오름(사라지지 않음)
- `scenes/overlays.js` 는 배너만 담당하도록 정리
- `config` 정리: `ending` → **`meet`**, `finalCard` → **`closing`**, `audioCues` 최종(①1.0 ②40.0 ③80.0 + 83.2/90.0 메모), `scenes.fade` 90~94 / `scenes.closing` 94~108
- `bubble.above.maxWidth` 1100 → **1400** (긴 멘트가 4줄로 넘치지 않게)
- `check-config.mjs` — 멘트 길이 경고를 **말풍선 배치별 3줄 기준**(`maxCharsForLine`)으로, meet/closing 검사 추가, 화면에 안 쓰는 `{date}` 는 경고 안 함

## 남은 일
1. **깜자 전체 재생 확인** (아래 "확인 포인트")
2. 신부 이름 `config.couple.bride` 입력 (지금 `OOO` — check가 경고)
3. 멘트/감사 인사 문구 다듬기 (`config.dialogue`, `config.closing.lines`)
4. BGM 3곡이 정해지면 `audioCues` 시각에 맞춰 장애물 `apexAt`/`hitAt` 미세 조정
5. 녹화 → 편집 → 제출 (`docs/04_RECORDING_GUIDE.md`)

## 확인 포인트 (전체 재생하며)
- 멘트 읽기 속도(`bubble.cps` 14) — 뒷자리 하객 기준으로 빠르지 않은지
- 충돌 2번의 "맞은 느낌"(밀림 80px / 깜빡임 0.96초 / 장애물 넘어짐 0.55초)
- 80~86초 만남 구간의 속도 — 걸어가는 3.2초가 늘어지지 않는지
- 90초 페이드 2초가 적당한지, 감사 인사 4줄 읽을 시간이 충분한지(마지막 줄 약 4.6초)
- 끊김(프레임 드랍) 없는지 — 있으면 `map.decorSeed` 로 장식 수를 줄이거나 `sprites.scale` 조정

## 그 이후: P03 계획 (사용자 요청, 아직 시작 안 함)
1. 신부를 만나면 HUD 하트가 3개로 다시 가득 차는 연출
2. **`?music=1` 미리듣기**: BGM 3곡이 `audioCues` 시각에 맞춰 재생, `?t=` 이동에도 따라감. 녹화 땐 끔(주소에 안 붙이면 무음). 곡별 시작 위치/볼륨은 config. 파일은 `public/assets/audio/` (`.gitignore` 로 깃 제외)
   - CLAUDE.md "웹에서 나는 소리는 blip뿐" 규칙의 예외(미리듣기 전용)이므로 문서에 명시할 것

## 사용자가 확정한 결정
- P02 새 흐름 전체, A·B·C·D 단계 결과물 확인 완료
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
| 장면 시간 | drop 23~25, piano 25~40, run 40~80, meet 80~90, fade 90~94, closing 94~108 | `scenes` |
| 오프닝 | 출발 x 2100, 정지 x 360, 발 높이 700, 정지 후 옆모습 0.25초 | `intro`, `scenes/opening.js` TURN_PAUSE |
| 말풍선 | 64px, side 최대폭 1340 / 간격 40 / 세로중심 0.32, above 최대폭 1400 / 간격 34 / tailX 150 | `bubble` |
| 멘트 시각/hold | 1~3: 5.8/9.6/16.1 · 4~6: 25.2/30.3/34.3 · 7: 70.5 (hold 3.0) | `dialogue` |
| 낙하 | leave 23.0(0.45초), 맵 페이드 23.15(0.5초), 낙하 23.8, 착지 24.5, 바운스 40px | `drop` |
| 맵 | 속도 320px/s, 신랑 x 480, 점프 높이 300 / 체공 1.0초, 시차 구름 0.25 / 언덕 0.5 | `map` |
| 피아노 | apexAt 41.0 (224×208px) | `map.piano` |
| 글자 장애물 | 수많은 47.0(240×190) / 우여곡절 53.5(300×220) / 많은 60.5(200×170) / 일들이 67.0(260×200) | `map.obstacles` |
| 충돌 연출 | 밀림 80px(0.14초) → 멈춤 0.16초 → 복귀 0.42초, 깜빡임 0.96초, 장애물 넘어짐 0.55초 | `map.hitFx` |
| 장식 | 파이프 x 60, 블록 3묶음(1480/2500/3500), decorSeed 7 | `map` |
| HUD | 하트 8배 x56 y44 간격16, TIME 라벨 30px / 값 46px, 8 YEAR 도달 68.0초 | `hud` |
| 배너 | GAME START 40.0(1.8초) / STAGE 1 CLEAR 86.0(3.0초) | `banners` |
| 만남 | 신부 x 1220, 간격 200, 도착 83.2, 하트 83.5(12개), 손 흔들기 85.0, 번쩍임 86.0 | `meet` |
| 마무리 | 페이드 2초, 글자 52px(이름 줄 86px 노랑), 94.6 / 97.2 / 99.8 / 102.6초 | `closing` |
| 색 | 정장 #3a4066 / 하이라이트 #7d88cc / 머리 #3a3546 / 가르마 #b4aed0 등 | `palette` |
| 발걸음 소리 | enabled false, volume 0.08 | `sfx.step` |

## 알려진 이슈 / 남은 입력
- `npm run check` 경고: **신부 이름이 아직 `OOO`** (`config.couple.bride`). 넣으면 경고 0개
- `config.couple.date` 는 현재 화면 어디에도 안 나옴(마지막 카드를 감사 인사로 바꾸면서 빠짐). 날짜를 넣고 싶으면 `config.closing.lines` 에 `{date}` 줄을 추가하면 check도 다시 검사함
- 헤드리스 캡처는 시간이 크게 건너뛰어서 `?sprites` 의 발걸음 이벤트가 0으로 찍힘(정상 — 시간 이동은 무시하도록 설계). 실제 브라우저에선 증가해야 함 (사용자 미확인)
- 헤드리스 캡처에서 가끔 화면 좌우에 검은 여백이 생김(창 크기 문제, 앱 문제 아님)
- 말풍선 폭 맞춤(`fit`)은 폰트 로딩 후 측정 — `?t=` 로 바로 열면 `document.fonts.ready` 후 다시 맞춤
- 전체 재생 시 프레임 드랍 여부는 **실제 PC에서만** 확인 가능 (녹화 전 반드시 확인)

## 화면 캡처 방법 (Claude Code용)
> 이 PC에는 **Chrome이 없고 Edge만 설치돼 있음** → `msedge.exe` 를 쓰세요.

개발 서버(`npx vite --port 5173`)를 켠 뒤 헤드리스로:
```bash
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1920,1080 --virtual-time-budget=4000 \
  --screenshot=<저장경로>.png "http://localhost:5173/?t=30"
```
확인용 시각: `?t=3, 8, 24, 30, 45, 60, 75, 84, 86.2, 93, 100, 107`
