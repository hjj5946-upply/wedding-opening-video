// 시간 계산용 순수 함수 모음 (React/GSAP/DOM 사용 금지 — check-config.mjs 에서도 그대로 씁니다)
//  ▶ 화면(components/) · 타임라인(scenes/) · 검사(scripts/check-config.mjs) 가 모두 이 함수들을 써야
//    "config 의 시각" 과 "맵 위 위치" 가 항상 같은 값으로 계산됩니다.

/** 신랑 충돌 폭(px) — 장애물을 넘는 데 필요한 체공 시간 계산용 (도트 몸통 폭 정도) */
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

// ── 맵 스크롤 ────────────────────────────────────────────────

/** 계단 꼭대기에 올라서는 시각 = 맵이 멈추는 시각 */
export function mapStopAt(config) {
  const S = config.map.stairs;
  return S.atTime + (S.steps * S.stepW) / config.map.speed;
}

/** 맵 스크롤 거리(px): 게임 시작부터 지난 시간 × 속도 (시작 전 0, 맵이 멈춘 뒤 최대값) */
export function scrollAt(config, t) {
  const g = config.scenes.game;
  return config.map.speed * Math.max(0, Math.min(t, mapStopAt(config)) - g.start);
}

/** 맵이 끝까지 흐른 총 거리(px) */
export function scrollMax(config) {
  return scrollAt(config, mapStopAt(config));
}

/** 맵 전체 폭(px) — 신부가 서 있는 자리까지 넉넉하게 */
export function worldWidth(config) {
  return scrollMax(config) + config.canvas.width + 800;
}

// ── 점프 / 위치 계산 ──────────────────────────────────────────

/** 점프 설정 ('jump' = 보통 점프 / 'pit' = 낭떠러지 건너뛰기) */
export function jumpCfg(config, kind = 'jump') {
  return kind === 'pit' ? config.map.pitJump : config.map.jump;
}

/** 점프 구간 { takeoff, apex, land } */
export function jumpWindow(config, apexAt, kind = 'jump') {
  const half = jumpCfg(config, kind).air / 2;
  return { takeoff: apexAt - half, apex: apexAt, land: apexAt + half };
}

/** apexAt 시각에 신랑(화면 x = map.groomX) 바로 위/아래에 오도록 하는 물체의 맵 x좌표(왼쪽 끝) */
export function leftForApex(config, apexAt, w) {
  return config.map.groomX + scrollAt(config, apexAt) - w / 2;
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
    end: recoverStart + F.recover,
    blinkEnd: hitAt + F.blink,
    toppleEnd: hitAt + F.topple,
  };
}

// ── 물음표상자 / 낭떠러지 / 글자 장애물 ─────────────────────────────

/** 물음표상자 1개의 위치/시간 */
export function boxInfo(config, box) {
  const size = config.map.boxSize;
  return {
    ...box,
    id: `box${box.year}`,
    w: size,
    h: size,
    left: leftForApex(config, box.apexAt, size),
    top: config.map.boxY,
    jump: jumpWindow(config, box.apexAt),
  };
}

export function allBoxes(config) {
  return (config.map.boxes ?? []).map((b) => boxInfo(config, b));
}

/** 낭떠러지 1개의 위치/시간 */
export function pitInfo(config, pit, i = 0) {
  return {
    ...pit,
    id: `pit${i + 1}`,
    left: leftForApex(config, pit.apexAt, pit.w),
    jump: jumpWindow(config, pit.apexAt, 'pit'),
  };
}

export function allPits(config) {
  return (config.map.pits ?? []).map((p, i) => pitInfo(config, p, i));
}

/** 글자 장애물 안의 글자 크기(px): 상자 안에 꽉 차되 넘치지 않게 */
export function obstacleFontSize(o) {
  const chars = [...o.text].length;
  return Math.floor(Math.min(o.h * 0.52, (o.w - 36) / chars));
}

/** 글자 장애물 1개의 위치/크기/타이밍 */
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

export function allObstacles(config) {
  return (config.map.obstacles ?? []).map((o) => obstacleInfo(config, o));
}

// ── 계단 + 깃발 ──────────────────────────────────────────────

/** 계단 위치/시간 — atTime 에 첫 칸이 신랑 발밑에 오도록 자동 배치 */
export function stairsInfo(config) {
  const S = config.map.stairs;
  const left = scrollAt(config, S.atTime) + config.map.groomX + S.stepW / 2;
  const climbDur = (S.steps * S.stepW) / config.map.speed;
  return {
    ...S,
    left,
    width: S.steps * S.stepW,
    climbStart: S.atTime,
    climbEnd: S.atTime + climbDur,
    climbDur,
    topY: S.steps * S.stepH, // 꼭대기 발 높이 (바닥선에서 위로 px)
  };
}

/** 깃대 위치/시간 — 맵이 멈췄을 때 화면 flag.screenX 에 오도록 자동 배치 */
export function flagInfo(config) {
  const F = config.map.flag;
  return {
    ...F,
    left: F.screenX + scrollMax(config), // 맵 좌표
    slideEnd: F.touchAt + F.slideDur,
  };
}

// ── HUD ────────────────────────────────────────────────────

/** 시각 t의 TIME 숫자 (물음표상자를 칠 때마다 그 해로) */
export function timeYears(config, t) {
  let v = config.hud.time.start ?? 0;
  for (const b of config.map.boxes ?? []) if (t >= b.apexAt) v = b.year;
  return v;
}

/** 시각 t에 HUD 에 쓸 글자 ('3 YEAR' / 깃발 뒤에는 '8 YEAR 6 MONTH') */
export function timeText(config, t) {
  const T = config.hud.time;
  if (T.finalText && t >= config.map.flag.touchAt) return T.finalText;
  return `${timeYears(config, t)} ${T.unit}`;
}

/** 시각 t에 남아 있는 하트 개수 (부딪히면 줄고, 신부를 만나면 하나씩 다시 채워짐) */
export function heartsAt(config, t) {
  const total = config.hud.hearts.count;
  const hits = (config.map.obstacles ?? []).filter((o) => o.hit && t >= o.hitAt).length;
  const M = config.meet;
  const healed = t >= M.healAt ? Math.min(hits, Math.floor((t - M.healAt) / M.healGap) + 1) : 0;
  return Math.max(0, Math.min(total, total - hits + healed));
}

/** 하트 i번(0부터)이 다시 채워지는 시각 (없으면 null) — 깎인 순서의 역순으로 채워짐 */
export function healTimes(config) {
  const total = config.hud.hearts.count;
  const hits = (config.map.obstacles ?? []).filter((o) => o.hit).sort((a, b) => a.hitAt - b.hitAt);
  const M = config.meet;
  // 깎일 때는 오른쪽부터(total-1, total-2 ...) → 채울 때는 그 역순
  return hits
    .map((_, k) => ({ index: total - hits.length + k, at: M.healAt + k * M.healGap }))
    .sort((a, b) => a.at - b.at);
}

// ── 전체 ────────────────────────────────────────────────────

/** 게임 구간의 모든 사건(점프/충돌/계단/깃발)을 시각 순서로 — 겹침 검사·디버그용 */
export function gameEvents(config) {
  const ev = [];
  for (const b of allBoxes(config)) ev.push({ name: `${b.year}년 상자`, kind: 'box', from: b.jump.takeoff, to: b.jump.land, at: b.apexAt, left: b.left, w: b.w });
  for (const p of allPits(config)) ev.push({ name: `낭떠러지 ${p.id}`, kind: 'pit', from: p.jump.takeoff, to: p.jump.land, at: p.apexAt, left: p.left, w: p.w });
  for (const o of allObstacles(config)) {
    if (o.hit) ev.push({ name: `'${o.text}' 충돌`, kind: 'hit', from: o.hitFx.start, to: o.hitFx.blinkEnd, at: o.hitAt, left: o.left, w: o.w });
    else ev.push({ name: `'${o.text}' 점프`, kind: 'jump', from: o.jump.takeoff, to: o.jump.land, at: o.apexAt, left: o.left, w: o.w });
  }
  const st = stairsInfo(config);
  ev.push({ name: '계단 오르기', kind: 'stairs', from: st.climbStart, to: st.climbEnd, at: st.climbStart, left: st.left, w: st.width });
  const fl = flagInfo(config);
  ev.push({ name: '깃발', kind: 'flag', from: fl.jumpAt, to: fl.slideEnd, at: fl.touchAt, left: fl.left, w: 24 });
  return ev.sort((a, b) => a.from - b.from);
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

/** 멘트의 말풍선 배치 ('side' | 'above' | 'game') */
export function lineLayout(line, config) {
  return line.layout ?? config.bubble.layout ?? 'above';
}

/** 말풍선 한 줄에 들어가는 글자 수 (한글 기준: 글자 폭 ≈ fontSize) */
export function charsPerBubbleLine(config, layout) {
  const b = config.bubble[layout] ?? {};
  const fontSize = b.fontSize ?? config.bubble.fontSize;
  const maxWidth = b.maxWidth ?? 1100;
  return Math.max(1, Math.floor((maxWidth - fontSize * 1.3) / fontSize));
}

/** 그 멘트가 말풍선 몇 줄 안에 들어가는지 검사할 때 쓰는 최대 글자 수 */
export function maxCharsForLine(line, config, maxLines) {
  const layout = lineLayout(line, config);
  const lines = maxLines ?? (layout === 'game' ? 2 : 3); // 게임 자막칸은 2줄까지
  return charsPerBubbleLine(config, layout) * lines;
}

/** 오디오 큐 1개의 실제 구간 (enabled: false 면 null) */
export function audioCue(config, cue) {
  if (cue.enabled === false) return null;
  const track = config.audio.tracks[cue.track];
  if (!track) return null;
  return {
    ...cue,
    volume: cue.volume ?? track.volume,
    offset: cue.offset ?? track.offset ?? 0,
    loop: cue.loop ?? track.loop ?? false,
    src: track.src,
    fadeIn: cue.fadeIn ?? 0,
    fadeOut: cue.fadeOut ?? 0,
  };
}

/** 켜져 있는 오디오 큐 전부 */
export function audioCues(config) {
  if (!config.audio?.enabled) return [];
  return (config.audio.cues ?? []).map((c) => audioCue(config, c)).filter(Boolean);
}
