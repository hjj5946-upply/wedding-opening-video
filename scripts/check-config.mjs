// npm run check — config.js 검사 (코드를 돌리지 않고도 타이밍 실수를 잡아줍니다)
import { config } from '../src/config.js';
import { lineTiming, fillTokens, lineLayout, maxCharsForLine, GROOM_HIT_W, jumpWindow, totalDuration, allObstacles, hitWindow, heartsAt, timeYears } from '../src/engine/timing.js';

const errors = [];
const warns = [];
const f = (n) => n.toFixed(2).padStart(6);

// 1) 장면 구간이 이어지는지
const order = Object.keys(config.scenes);
for (let i = 0; i < order.length; i++) {
  const s = config.scenes[order[i]];
  if (!s) { errors.push(`scenes.${order[i]} 가 없습니다`); continue; }
  if (s.end <= s.start) errors.push(`scenes.${order[i]}: end(${s.end})가 start(${s.start})보다 커야 합니다`);
  if (i > 0) {
    const prev = config.scenes[order[i - 1]];
    if (prev && prev.end !== s.start) errors.push(`장면이 끊겼어요: ${order[i - 1]}.end(${prev.end}) ≠ ${order[i]}.start(${s.start})`);
  }
}

// 2) 총 길이
const total = totalDuration(config);
const mm = Math.floor(total / 60);
const ss = (total % 60).toFixed(1);
if (total >= 120) errors.push(`총 길이 ${total}초 — 예식장 규정(2분 이내) 초과!`);
else if (total > 115) warns.push(`총 길이 ${total}초 — 편집 여유가 거의 없어요 (목표 100~110초)`);
else if (total < 100) warns.push(`총 길이 ${total}초 — 목표(100~110초)보다 짧아요`);

// 3) 멘트: 장면 안에 들어오는지 / 겹치지 않는지
const rows = [];
const byWho = {};
for (const line of config.dialogue) {
  const t = lineTiming(line, config);
  const scene = config.scenes[line.scene];
  const text = fillTokens(line.text, config);
  rows.push({ id: line.id, scene: line.scene, at: line.at, typeEnd: t.typeEnd, end: t.end, chars: t.chars, text, layout: lineLayout(line, config) });
  if (!scene) { errors.push(`멘트 ${line.id}: scene '${line.scene}' 이(가) 없습니다`); continue; }
  if (line.at < scene.start) errors.push(`멘트 ${line.id}: 시작(${line.at})이 ${line.scene} 장면 시작(${scene.start})보다 빨라요`);
  const lastShown = line.stay ? t.typeEnd : t.end;
  if (lastShown > scene.end) errors.push(`멘트 ${line.id}: 끝나는 시각(${lastShown.toFixed(2)})이 ${line.scene} 장면 끝(${scene.end})을 넘어요`);
  const maxChars = maxCharsForLine(line, config);
  if (t.chars > maxChars)
    warns.push(`멘트 ${line.id}: ${t.chars}자 — ${lineLayout(line, config)} 말풍선 3줄(약 ${maxChars}자)을 넘어요. 쪼개거나 bubble.${lineLayout(line, config)}.maxWidth 를 늘리세요`);
  (byWho[line.who ?? 'groom'] ??= []).push({ id: line.id, at: line.at, end: t.end });
}
for (const [who, list] of Object.entries(byWho)) {
  list.sort((a, b) => a.at - b.at);
  for (let i = 1; i < list.length; i++) {
    if (list[i].at < list[i - 1].end) errors.push(`멘트 ${list[i - 1].id} 와 ${list[i].id} 가 겹쳐요 (${who}): ${list[i - 1].end.toFixed(2)} > ${list[i].at}`);
  }
}

// 4) 배너 / 만남 / 마무리 감사 인사
for (const b of config.banners) {
  if (b.at + b.hold > total) errors.push(`배너 ${b.id}: 끝(${b.at + b.hold})이 영상 끝(${total})을 넘어요`);
}

// 4-1) 신부 만남 (meet)
{
  const S = config.scenes.meet;
  const E = config.meet;
  if (E.walkEnd <= S.start) errors.push(`meet.walkEnd(${E.walkEnd})는 meet 장면 시작(${S.start})보다 뒤여야 합니다`);
  if (E.waveAt < E.walkEnd) errors.push(`meet.waveAt(${E.waveAt})이 도착 시각(${E.walkEnd})보다 빨라요 — 만나기도 전에 손을 흔듭니다`);
  if (E.flashAt + E.flashDur > S.end) errors.push(`meet.flashAt(${E.flashAt}) + 번쩍임(${E.flashDur})이 meet 장면 끝(${S.end})을 넘어요`);
  if (E.heartsAt < E.walkEnd - 0.5) warns.push(`meet.heartsAt(${E.heartsAt})이 만나기 전이에요 (도착 ${E.walkEnd}초)`);
  const meetX = E.brideScreenX - E.gap;
  if (meetX <= config.map.groomX) errors.push(`meet: 신랑이 설 자리(${meetX})가 지금 위치(${config.map.groomX})보다 왼쪽이에요 — brideScreenX 를 늘리거나 gap 을 줄이세요`);
  const walkSpeed = (meetX - config.map.groomX) / (E.walkEnd - S.start);
  if (walkSpeed > 320) warns.push(`meet: 걸어가는 속도가 ${walkSpeed.toFixed(0)}px/초 — 걷기 동작치고 빨라요 (walkEnd 를 늦추면 자연스러움)`);
  const clear = config.banners.find((b) => b.id === 'clear');
  if (clear && (clear.at < S.start || clear.at > S.end)) warns.push(`배너 clear(${clear.at}초)가 meet 장면(${S.start}~${S.end}) 밖이에요`);
}

// 4-2) 검정 페이드 + 마무리 감사 인사 (closing)
{
  const F = config.scenes.fade;
  const SC = config.scenes.closing;
  const C = config.closing;
  if (F.start + C.blackoutDur > F.end) errors.push(`closing.blackoutDur(${C.blackoutDur}초)가 fade 장면(${F.start}~${F.end})보다 길어요`);
  if (!C.lines.length) errors.push('closing.lines 가 비어 있어요');
  let prev = -Infinity;
  C.lines.forEach((l, i) => {
    const n = i + 1;
    if (l.at < F.start + C.blackoutDur) errors.push(`마무리 ${n}번째 줄(${l.at}초)이 화면이 완전히 검어지기(${(F.start + C.blackoutDur).toFixed(1)}초) 전이에요`);
    if (l.at < SC.start) warns.push(`마무리 ${n}번째 줄(${l.at}초)이 closing 장면 시작(${SC.start})보다 빨라요`);
    if (l.at + C.fadeIn > total) errors.push(`마무리 ${n}번째 줄(${l.at}초)이 영상 끝(${total}) 안에 다 나타나지 못해요`);
    if (l.at <= prev) errors.push(`마무리 ${n}번째 줄(${l.at}초)이 앞 줄(${prev}초)보다 빠르거나 같아요`);
    prev = l.at;
  });
  const last = C.lines[C.lines.length - 1];
  const stay = total - (last.at + C.fadeIn);
  if (stay < 3) errors.push(`마지막 줄이 ${stay.toFixed(1)}초만 보여요 — 하객이 읽으려면 4초 이상 필요`);
  else if (stay < 4) warns.push(`마지막 줄이 ${stay.toFixed(1)}초만 보여요 (4초 이상 추천)`);
}

// 5) 달리기: 장애물(점프 / 충돌) · 하트 · TIME
const run = config.scenes.run;
const M = config.map;
const obs = allObstacles(config); // 피아노 + 글자 장애물, 시각 순서
const air = M.jump.air;

// 5-1) 장애물 하나하나
for (const o of obs) {
  if (o.hit) {
    const h = hitWindow(config, o.hitAt);
    if (o.hitAt < run.start + 0.5) errors.push(`${o.text}: 부딪히는 시각(${o.hitAt})이 달리기 시작(${run.start}) 직후예요 — hitAt 을 늦추세요`);
    if (h.blinkEnd > run.end) errors.push(`${o.text}: 충돌 연출 끝(${h.blinkEnd.toFixed(2)})이 달리기 끝(${run.end})을 넘어요`);
    if (M.hitFx.knockback > M.groomX - 120) errors.push(`hitFx.knockback(${M.hitFx.knockback}px)이 너무 커요 — 신랑이 화면 왼쪽으로 밀려 나갑니다`);
    continue;
  }
  const j = jumpWindow(config, o.apexAt);
  if (j.takeoff < run.start + 0.2) errors.push(`${o.text}: 점프 시작(${j.takeoff.toFixed(2)})이 달리기 시작(${run.start}) 직후보다 빨라요 — apexAt 을 늦추세요`);
  if (j.land > run.end) errors.push(`${o.text}: 착지(${j.land.toFixed(2)})가 달리기 끝(${run.end})을 넘어요`);
  const needAir = (o.w + GROOM_HIT_W) / M.speed;
  if (air < needAir) errors.push(`${o.text}: 체공 ${air}초로는 못 넘어요 — 최소 ${needAir.toFixed(2)}초 필요 (map.jump.air 를 늘리거나 speed·w 를 줄이세요)`);
  if (M.jump.height < o.h + 20) errors.push(`${o.text}: 점프 높이 ${M.jump.height}px 가 장애물 높이 ${o.h}px 보다 낮아요`);
}

// 5-2) 장애물끼리 연출 시간이 겹치는지
const spans = obs.map((o) =>
  o.hit
    ? { name: o.text, from: o.hitAt, to: hitWindow(config, o.hitAt).blinkEnd }
    : { name: o.text, from: jumpWindow(config, o.apexAt).takeoff, to: jumpWindow(config, o.apexAt).land },
);
for (let i = 1; i < spans.length; i++) {
  if (spans[i].from < spans[i - 1].to)
    errors.push(`장애물 '${spans[i - 1].name}' 와 '${spans[i].name}' 연출이 겹쳐요 (${spans[i - 1].to.toFixed(2)} > ${spans[i].from})`);
  else if (spans[i].from - spans[i - 1].to < 0.6)
    warns.push(`장애물 '${spans[i - 1].name}' → '${spans[i].name}' 간격이 ${(spans[i].from - spans[i - 1].to).toFixed(2)}초뿐이에요 (0.6초 이상 추천)`);
}

// 5-3) 장애물이 맵 위에서 겹치지 않는지 (순서가 뒤바뀌지 않게)
for (let i = 1; i < obs.length; i++) {
  const prev = obs[i - 1];
  if (obs[i].left < prev.left + prev.w) errors.push(`장애물 '${prev.text}' 와 '${obs[i].text}' 가 맵 위에서 겹쳐요 — 시각을 더 벌리세요`);
}

// 5-4) 하트: 절대 0이 되면 안 됨
const hitCount = (M.obstacles ?? []).filter((o) => o.hit).length;
const heartsLeft = config.hud.hearts.count - hitCount;
if (heartsLeft < 1) errors.push(`하트가 ${config.hud.hearts.count}개인데 부딪히는 장애물이 ${hitCount}개 — 하트가 ${heartsLeft}개가 됩니다 (1개 이상 남아야 함)`);
if (heartsAt(config, totalDuration(config)) < 1) errors.push('영상 끝에 하트가 0개입니다');

// 5-5) TIME
const T = config.hud.time;
if (T.to <= T.from) errors.push(`hud.time: to(${T.to})가 from(${T.from})보다 커야 합니다`);
const fullAt = T.fullAt ?? run.end;
if (fullAt <= run.start || fullAt > run.end) errors.push(`hud.time.fullAt(${fullAt})은 달리기 구간(${run.start}~${run.end}) 안이어야 합니다`);
const hitTimes = (M.obstacles ?? []).filter((o) => o.hit).map((o) => o.hitAt);
const lastHit = hitTimes.length ? Math.max(...hitTimes) : run.start;
if (timeYears(config, lastHit) < T.to)
  warns.push(`마지막 장애물(${lastHit}초)에서 TIME 이 아직 ${timeYears(config, lastHit)} ${T.unit} 예요 — hud.time.fullAt 을 ${lastHit}초 이하로 당기면 "8년" 멘트와 맞습니다`);

// 6) 자리표시자(아직 안 채운 값) — 화면에 실제로 쓰이는 값만 검사
const screenText = [...config.dialogue, ...config.closing.lines, ...config.banners.flatMap((b) => [{ text: b.text }, { text: b.sub ?? '' }])]
  .map((l) => l.text)
  .join(' ');
if (/^O+$/i.test(config.couple.groom) || /^O+$/i.test(config.couple.bride)) warns.push('신랑/신부 이름이 아직 OOO 입니다 (config.couple)');
if (screenText.includes('{date}') && /00/.test(config.couple.date)) warns.push('날짜가 아직 2026.00.00 입니다 (config.couple.date)');

// 7) 음악 큐
const cues = config.audioCues;
for (let i = 1; i < cues.length; i++) if (cues[i].t < cues[i - 1].t) errors.push('audioCues 시간이 순서대로가 아니에요');

// ── 출력 ──
console.log('\n=== 결혼식 오프닝 영상 설정 검사 ===\n');
console.log(`총 길이: ${total}초 (${mm}분 ${ss}초)   규정: 2분 이내 / 목표 100~110초\n`);
console.log('장면');
for (const name of order) {
  const s = config.scenes[name];
  console.log(`  ${name.padEnd(7)} ${f(s.start)} ~ ${f(s.end)}  (${(s.end - s.start).toFixed(1)}초)`);
}
console.log('\n멘트 (시작 → 글자 다 나옴 → 풍선 사라짐)');
for (const r of rows) {
  const endStr = Number.isFinite(r.end) ? f(r.end) : ' stay ';
  console.log(`  #${String(r.id).padStart(2)} [${r.scene.padEnd(6)}] ${f(r.at)} → ${f(r.typeEnd)} → ${endStr}  ${String(r.chars).padStart(2)}자  ${r.text}`);
}
console.log('\n장애물 (점프: 떠오름/최고점/착지 · 충돌: 부딪힘/복귀/깜빡임끝)    맵 x / 크기');
obs.forEach((o, i) => {
  const w = o.hit ? hitWindow(config, o.hitAt) : jumpWindow(config, o.apexAt);
  const times = o.hit ? `${f(w.start)} / ${f(w.end)} / ${f(w.blinkEnd)}` : `${f(w.takeoff)} / ${f(w.apex)} / ${f(w.land)}`;
  console.log(`  #${i + 1} ${o.hit ? '충돌' : '점프'} ${String(o.text).padEnd(5)} ${times}   x=${String(Math.round(o.left)).padStart(5)}  ${o.w}×${o.h}`);
});
console.log('\n하트 / TIME');
console.log(`  하트 ${config.hud.hearts.count}개 → 부딪힘 ${hitCount}번 → ${heartsLeft}개 남음 (0개가 되면 오류)`);
{
  const marks = [];
  for (let v = T.from; v <= T.to; v++) {
    const at = v === T.from ? run.start : run.start + ((fullAt - run.start) * (v - T.from - 0.5)) / (T.to - T.from);
    marks.push(`${at.toFixed(1)}s→${v}`);
  }
  console.log(`  TIME  ${marks.join('  ')}  ${T.unit}`);
}
console.log('\n마무리 감사 인사 (나타나는 시각)');
for (const l of config.closing.lines) console.log(`  ${f(l.at)}  ${fillTokens(l.text, config)}`);
console.log(`  ${f(config.scenes.fade.start)}  (검정 페이드 시작 — ${config.closing.blackoutDur}초 동안)`);
console.log('\n음악 편집 메모');
for (const c of cues) console.log(`  ${f(c.t)}  ${c.label}`);

if (warns.length) { console.log('\n⚠ 주의'); warns.forEach((w) => console.log('  - ' + w)); }
if (errors.length) { console.log('\n✖ 오류'); errors.forEach((e) => console.log('  - ' + e)); console.log(''); process.exit(1); }
console.log('\n✔ 오류 없음\n');
