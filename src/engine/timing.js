// 시간 계산용 순수 함수 모음 (React/GSAP/DOM 사용 금지 — check-config.mjs에서도 사용)

/** 신랑 충돌 폭(px) — 장애물을 넘는 데 필요한 체공 시간 계산용 (도트 몸통 폭 정도) */
export const GROOM_HIT_W = 64;

/** 피아노 크기(px) = sprites/props.js 의 피아노 도트(28×26칸) × 8 */
export const PIANO_SIZE = { w: 28 * 8, h: 26 * 8 };

/** {groom} {bride} {date} 치환 */
export function fillTokens(text, config) {
  return text
    .replaceAll('{groom}', config.couple.groom)
    .replaceAll('{bride}', config.couple.bride)
    .replaceAll('{date}', config.couple.date);
}

/** 멘트 한 줄의 시간 계산 */
export function lineTiming(line, config) {
  const { popIn, popOut, cps, hold } = config.bubble;
  const text = fillTokens(line.text, config);
  const chars = [...text].length;
  const typeDur = chars / (line.cps ?? cps);
  const typeStart = line.at + popIn;
  const typeEnd = typeStart + typeDur;
  const hideAt = typeEnd + (line.hold ?? hold);
  const end = line.stay ? Infinity : hideAt + popOut;
  return { chars, typeStart, typeDur, typeEnd, hideAt, end };
}

/** 맵 스크롤 거리(px): 달리기 시작부터 지난 시간 × 속도 (시작 전 0, 끝난 뒤 최대값) */
export function scrollAt(config, t) {
  const r = config.scenes.run;
  return config.map.speed * Math.max(0, Math.min(t, r.end) - r.start);
}

/** 달리기 동안 맵이 흐르는 총 거리(px) */
export function runDistance(config) {
  const r = config.scenes.run;
  return config.map.speed * (r.end - r.start);
}

/** apexAt 시각에 신랑(화면 x = map.groomX) 바로 위에 오도록 하는 물체의 맵 x좌표(왼쪽 끝) */
export function leftForApex(config, apexAt, w) {
  return config.map.groomX + scrollAt(config, apexAt) - w / 2;
}

/** 점프 구간 { takeoff, apex, land } */
export function jumpWindow(config, apexAt) {
  const half = config.map.jump.air / 2;
  return { takeoff: apexAt - half, apex: apexAt, land: apexAt + half };
}

/** hitAt 시각에 신랑의 앞면이 닿도록 하는 장애물의 맵 x좌표(왼쪽 끝) */
export function leftForHit(config, hitAt) {
  return config.map.groomX + GROOM_HIT_W / 2 + scrollAt(config, hitAt);
}

/** 충돌 연출 구간 { start, backEnd, recoverStart, end, blinkEnd, toppleEnd } */
export function hitWindow(config, hitAt) {
  const F = config.map.hitFx;
  const backEnd = hitAt + F.back;
  const recoverStart = backEnd + F.pause;
  return {
    start: hitAt,
    backEnd,
    recoverStart,
    end: recoverStart + F.recover, // 피격 포즈가 끝나는 시각
    blinkEnd: hitAt + F.blink,
    toppleEnd: hitAt + F.topple,
  };
}

/** 장애물 1개의 위치/크기/타이밍을 한 번에 계산 (화면 그리기 · 타임라인 · check 가 모두 이 값을 씀) */
export function obstacleInfo(config, o) {
  const left = o.hit ? leftForHit(config, o.hitAt) : leftForApex(config, o.apexAt, o.w);
  return {
    ...o,
    left,
    at: o.hit ? o.hitAt : o.apexAt,
    fontSize: obstacleFontSize(o),
    jump: o.hit ? null : jumpWindow(config, o.apexAt),
    hitFx: o.hit ? hitWindow(config, o.hitAt) : null,
  };
}

/** 글자 장애물 안의 글자 크기(px): 상자 안에 꽉 차되 넘치지 않게 */
export function obstacleFontSize(o) {
  const chars = [...o.text].length;
  return Math.floor(Math.min(o.h * 0.52, (o.w - 36) / chars));
}

/** 장애물 목록(피아노 + 글자 장애물)을 시각 순서로 */
export function allObstacles(config) {
  const piano = { id: 'piano', text: '피아노', hit: false, apexAt: config.map.piano.apexAt, ...PIANO_SIZE };
  const words = (config.map.obstacles ?? []).map((o) => obstacleInfo(config, o));
  return [{ ...piano, left: leftForApex(config, piano.apexAt, piano.w), at: piano.apexAt, jump: jumpWindow(config, piano.apexAt), hitFx: null }, ...words].sort(
    (a, b) => a.at - b.at,
  );
}

/** 시각 t에 남아 있는 하트 개수 (부딪힌 횟수만큼 줄어듦 — 현재 시각으로만 결정) */
export function heartsAt(config, t) {
  const hits = (config.map.obstacles ?? []).filter((o) => o.hit && t >= o.hitAt).length;
  return Math.max(0, config.hud.hearts.count - hits);
}

/** 시각 t의 TIME 값 (from → to, 달리기 진행도에 비례. fullAt 에서 to 도달) */
export function timeYears(config, t) {
  const T = config.hud.time;
  const r = config.scenes.run;
  const endAt = T.fullAt ?? r.end;
  const span = endAt - r.start;
  const p = span > 0 ? Math.max(0, Math.min(1, (t - r.start) / span)) : 1;
  return T.from + Math.round((T.to - T.from) * p);
}

/** 영상 전체 길이 = 마지막 장면의 end */
export function totalDuration(config) {
  return Math.max(...Object.values(config.scenes).map((s) => s.end));
}

/** 시각 t가 속한 장면 이름 */
export function sceneAt(config, t) {
  for (const [name, s] of Object.entries(config.scenes)) {
    if (t >= s.start && t < s.end) return name;
  }
  return t >= totalDuration(config) ? '끝(고정)' : '-';
}

/** 멘트의 말풍선 배치 ('side' | 'above') */
export function lineLayout(line, config) {
  return line.layout ?? config.bubble.layout ?? 'above';
}

/** 말풍선 한 줄에 들어가는 글자 수 (한글 기준: 글자 폭 ≈ fontSize) */
export function charsPerBubbleLine(config, layout) {
  const { fontSize } = config.bubble;
  const maxWidth = config.bubble[layout]?.maxWidth ?? 1100;
  const padding = fontSize * 1.3; // 풍선 안쪽 여백 + 테두리
  return Math.max(1, Math.floor((maxWidth - padding) / fontSize));
}

/** 그 멘트가 말풍선 3줄 안에 들어가는 최대 글자 수 (check 가 "너무 길다" 경고에 사용) */
export function maxCharsForLine(line, config, maxLines = 3) {
  return charsPerBubbleLine(config, lineLayout(line, config)) * maxLines;
}
