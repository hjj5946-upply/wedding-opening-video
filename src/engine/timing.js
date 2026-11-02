// 시간 계산용 순수 함수 모음 (React/GSAP/DOM 사용 금지 — check-config.mjs에서도 사용)

/** 장애물 종류별 크기(px) */
export const OBSTACLE_TYPES = {
  crate: { w: 128, h: 128 },
  spike: { w: 128, h: 56 },
};

/** 신랑 충돌 폭 (장애물을 넘는 데 필요한 체공 시간 계산용) */
export const GROOM_HIT_W = 64;

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

/** 장애물의 맵상 x좌표(왼쪽 끝). apexAt 시각에 신랑 바로 위에 오도록 계산 */
export function obstacleX(config, ob) {
  const { speed, groomScreenX } = config.stage2;
  const def = OBSTACLE_TYPES[ob.type];
  return groomScreenX + speed * (ob.apexAt - config.scenes.stage2.start) - def.w / 2;
}

/** 맵이 스크롤되는 총 거리(px) */
export function stage2Distance(config) {
  const s = config.scenes.stage2;
  return config.stage2.speed * (s.end - s.start);
}

/** 시각 t가 속한 장면 이름 */
export function sceneAt(config, t) {
  for (const [name, s] of Object.entries(config.scenes)) {
    if (t >= s.start && t < s.end) return name;
  }
  return t >= config.scenes.ending.end ? 'ending(hold)' : '-';
}
