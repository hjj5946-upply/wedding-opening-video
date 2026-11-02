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
