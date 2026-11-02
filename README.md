# 결혼식 오프닝 영상 (웹페이지 = 영상)

개식 직후 상영할 오프닝 영상입니다. **웹페이지 자체가 영상**이고, 이 페이지를 OBS로 화면 녹화한 뒤 편집 툴에서 음악을 입혀 MP4로 내보냅니다.

- 컨셉: 도트 게임풍 (인사 → 플랫포머 맵으로 낙하 → 물음표상자 8개로 8년 연애사(사진 팝업) → 깃발 → 신부 만남 → STAGE 2 → 감사 인사)
- 길이: **약 115.5초**. 음악과 효과음은 **웹페이지가 직접 재생**합니다 (OBS 데스크톱 오디오로 함께 녹음)
- 규격: **1920×1080 / 60fps / MP4(H.264+AAC) / 2분 이내** (예식장 필수 규격)
- 기술: Vite + React + GSAP

## 처음 한 번만: 설치

1. [Node.js LTS](https://nodejs.org) 설치 (20.19 이상). 설치 후 터미널(PowerShell)을 새로 엽니다.
2. 이 폴더에서 터미널을 열고:

```bash
npm install
```

## 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 을 열고 **F11(전체화면) → 스페이스바**를 누르면 시작합니다.

| 키 | 동작 |
|---|---|
| Space | 영상 시작 (이때 소리 허용도 풀림) |
| R | 처음 상태로 되돌리기 |
| D | 디버그 표시(현재 시간/장면/다음 음악 큐) 켜기·끄기 — **녹화 땐 꺼두기** |
| P | 일시정지/재개 |
| ← → / [ ] | ±5초 / ±1초 이동 (디버그 켠 상태) |
| 0~8 | 장면 시작으로 점프 (디버그 켠 상태) — black/intro/greet/drop/piano/run/meet/fade/closing |

주소 뒤에 붙이는 옵션:

- `?t=62` : 62초 지점에서 멈춘 채로 열기 (특정 장면 화면만 확인할 때)
- `?debug=1` : 디버그 표시를 켠 채로 열기
- `?autostart=1` : 스페이스 없이 바로 재생 (테스트용)
- `?sprites` : 도트 프레임 확인 화면 (모든 포즈 / 좌우 반전 / 검정·하늘 배경). `?sprites&t=0.4` 로 멈춤, `&scale=7` 로 확대
- `?music=0` : 배경 음악만 끄기   ·   `?sfx=0` : 효과음/비프음만 끄기   ·   `?mute=1` : 전부 끄기

## 수정하는 곳 (거의 전부 `src/config.js` 한 곳)

| 바꾸고 싶은 것 | config.js 위치 |
|---|---|
| 신랑/신부 이름, 날짜 | `couple` |
| 멘트 문구/타이밍 | `dialogue` |
| 장면 시간 구간 | `scenes` |
| 큰 글자 배너 (STAGE 1 / STAGE 2 START) | `banners` |
| 벽돌 장애물 시각·크기 | `map.obstacles[].apexAt` / `.hitAt` |
| 부딪힐 때 연출(밀림·깜빡임) | `map.hitFx` |
| 하트 개수, TIME 1→8 YEAR | `hud` |
| 신부 만남(위치·시각·하트) | `meet` |
| 마무리 감사 인사 문구 | `closing.lines` |
| 글자 속도, 말풍선 크기 | `bubble` |
| 말풍선 말소리 / 효과음 | `sfx` |
| 색상 | `palette` |
| 음악 파일/볼륨/구간 | `audio.tracks`, `audio.cues` |
| 물음표상자(1~8년) 시각 | `map.boxes[].apexAt` |
| 낭떠러지 / 거북이 / 계단 / 깃발 | `map.pits`, `map.turtle`, `map.stairs`, `map.flag` |
| 연도별 사진 목록·크기·위치 | `photos` |
| 그랜드 피아노 위치/크기 | `piano` |

수정 후 **`npm run check`** 를 돌리면 시간 초과/겹침/규정 위반(2분) 같은 실수를 잡아줍니다.

## 폴더 구조

```
src/
  config.js          ← 문구/타이밍/색 (여기만 주로 수정)
  App.jsx            ← 키보드 조작, 타임라인 연결
  components/        ← 화면 부품 (Stage, Scene, 캐릭터, 말풍선, 맵(World), HUD, 도트 ...)
  scenes/            ← 장면별 GSAP 연출 (opening / drop / hud / run / meet / closing / overlays)
  engine/            ← 타임라인 조립, 대사 타이핑, 포즈, 발걸음, 효과음, 시간 계산
  sprites/           ← 임시 도트 신랑/신부/소품/하트 (코드로 정의, PNG로 교체 가능)
scripts/check-config.mjs   ← 설정 검사
public/assets/
  audio/             ← intro.mp3 / inGame.mp3 / outro.mp3 / walk.mp3  (깃에 안 올라감 — 다른 PC에선 따로 복사)
  photos/            ← year1.jpg ~ year8.jpg  (1200px 리사이즈본, 깃에 올라감)
  images/            ← grandPiano.png + 사진 원본(1year.jpg~8year.jpg, 깃에서 제외)
  sprites/           ← 도트 PNG를 넣으면 코드 도트 대신 사용
docs/                      ← 지침, 예식장 규격, 시나리오, 결정 로그, 녹화 가이드, Claude Code 프롬프트
CLAUDE.md                  ← Claude Code가 가장 먼저 읽는 작업 규칙
```

## 깃허브에 올리기

```bash
git init
git add .
git commit -m "초기 프로젝트"
git branch -M main
git remote add origin https://github.com/<내아이디>/<저장소이름>.git
git push -u origin main
```

(`node_modules`, 녹화 파일, 음원은 `.gitignore` 로 제외되어 있어요.)

## 작업 방식 (3자 협업)

- **깜자(총괄)**: 테스트, 수정 요청, 기획 결정
- **Claude(채팅)**: 기획/아이디어 정리, 지침 문서 관리, Claude Code에게 줄 프롬프트 작성
- **Claude Code**: 실제 구현

작업 프롬프트는 `docs/prompts/` 에 있습니다. **현재 진행 상황은 `docs/PROGRESS.md`** 를 보세요.

## 넣어야 할 재료

| 파일 | 위치 | 없으면 |
|---|---|---|
| `intro.mp3`, `inGame.mp3`, `outro.mp3`, `walk.mp3` | `public/assets/audio/` | 소리 없이 재생되고 "PRESS SPACE" 안내가 늦게 뜸 |
| `year1.jpg` ~ `year8.jpg` | `public/assets/photos/` | "1 YEAR" 같은 **임시 동그라미**가 대신 나옴 (영상은 정상) |
| `grandPiano.png` | `public/assets/images/` | 피아노가 안 보임 |

사진 권장 규격: **jpg, 긴 변 1200px 이하**. 지름 280px 동그라미에 가운데를 맞춰 잘라 넣습니다
(세로 사진이면 `config.photos.objectPosition` 으로 보여줄 위치를 조절하세요. 기본 `center 38%`).
원본이 크면 그대로 두지 말고 꼭 줄여서 넣으세요 — 큰 jpg 8장은 재생이 끊기는 원인이 됩니다.
음원은 용량·저작권 때문에 깃에 올리지 않습니다 — **다른 PC에서 작업하려면 USB 등으로 따로 복사**하세요.

## 폰트

- 한글 도트 폰트 [Galmuri](https://github.com/quiple/galmuri) (SIL OFL 1.1)
- 영문 HUD 폰트 [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) (SIL OFL 1.1, `@fontsource/press-start-2p`)

둘 다 `npm install` 로 받아 빌드에 포함되므로 **오프라인에서도 글씨가 정상으로 보입니다.**
