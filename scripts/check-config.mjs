// npm run check — config.js 검사 (코드를 돌리지 않고도 타이밍 실수를 잡아줍니다)
import { config } from '../src/config.js';
import { lineTiming, fillTokens, GROOM_HIT_W, PIANO_SIZE, jumpWindow, totalDuration } from '../src/engine/timing.js';

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
  rows.push({ id: line.id, scene: line.scene, at: line.at, typeEnd: t.typeEnd, end: t.end, chars: t.chars, text });
  if (!scene) { errors.push(`멘트 ${line.id}: scene '${line.scene}' 이(가) 없습니다`); continue; }
  if (line.at < scene.start) errors.push(`멘트 ${line.id}: 시작(${line.at})이 ${line.scene} 장면 시작(${scene.start})보다 빨라요`);
  const lastShown = line.stay ? t.typeEnd : t.end;
  if (lastShown > scene.end) errors.push(`멘트 ${line.id}: 끝나는 시각(${lastShown.toFixed(2)})이 ${line.scene} 장면 끝(${scene.end})을 넘어요`);
  if (t.chars > 36) warns.push(`멘트 ${line.id}: ${t.chars}자 — 길어요(뒷자리 하객은 읽기 힘들 수 있음). 쪼개는 걸 추천`);
  (byWho[line.who ?? 'groom'] ??= []).push({ id: line.id, at: line.at, end: t.end });
}
for (const [who, list] of Object.entries(byWho)) {
  list.sort((a, b) => a.at - b.at);
  for (let i = 1; i < list.length; i++) {
    if (list[i].at < list[i - 1].end) errors.push(`멘트 ${list[i - 1].id} 와 ${list[i].id} 가 겹쳐요 (${who}): ${list[i - 1].end.toFixed(2)} > ${list[i].at}`);
  }
}

// 4) 배너 / 마지막 카드
for (const b of config.banners) {
  if (b.at + b.hold > total) errors.push(`배너 ${b.id}: 끝(${b.at + b.hold})이 영상 끝(${total})을 넘어요`);
}
if (config.finalCard.at >= total) errors.push(`finalCard.at(${config.finalCard.at})이 영상 끝(${total}) 이후예요`);
else if (total - config.finalCard.at < 3) warns.push(`마지막 고정 화면이 ${(total - config.finalCard.at).toFixed(1)}초뿐이에요 (하객이 읽으려면 4초 이상 추천)`);

// 5) 달리기: 점프 장애물 (지금은 피아노만 — D단계에서 글자 장애물 추가)
const run = config.scenes.run;
const M = config.map;
const jumps = [{ name: '피아노', apexAt: M.piano.apexAt, ...PIANO_SIZE }];
jumps.forEach((o) => {
  const j = jumpWindow(config, o.apexAt);
  if (j.takeoff < run.start + 0.2) errors.push(`${o.name}: 점프 시작(${j.takeoff.toFixed(2)})이 달리기 시작(${run.start}) 직후보다 빨라요 — apexAt 을 늦추세요`);
  if (j.land > run.end) errors.push(`${o.name}: 착지(${j.land.toFixed(2)})가 달리기 끝(${run.end})을 넘어요`);
  const needAir = (o.w + GROOM_HIT_W) / M.speed;
  if (M.jump.air < needAir) errors.push(`${o.name}: 체공 ${M.jump.air}초로는 못 넘어요 — 최소 ${needAir.toFixed(2)}초 필요 (map.jump.air 를 늘리거나 speed 를 줄이세요)`);
  if (M.jump.height < o.h + 20) errors.push(`${o.name}: 점프 높이 ${M.jump.height}px 가 장애물 높이 ${o.h}px 보다 낮아요`);
});
const obs = jumps.map((o) => ({ type: o.name, apexAt: o.apexAt }));
const air = M.jump.air;

// 6) 자리표시자(아직 안 채운 값)
if (/^O+$/i.test(config.couple.groom) || /^O+$/i.test(config.couple.bride)) warns.push('신랑/신부 이름이 아직 OOO 입니다 (config.couple)');
if (/00/.test(config.couple.date)) warns.push('날짜가 아직 2026.00.00 입니다 (config.couple.date)');

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
console.log('\n장애물 점프 (떠오름 / 최고점 / 착지)');
obs.forEach((ob, i) => console.log(`  #${i + 1} ${ob.type.padEnd(5)} ${f(ob.apexAt - air / 2)} / ${f(ob.apexAt)} / ${f(ob.apexAt + air / 2)}`));
console.log('\n음악 편집 메모');
for (const c of cues) console.log(`  ${f(c.t)}  ${c.label}`);

if (warns.length) { console.log('\n⚠ 주의'); warns.forEach((w) => console.log('  - ' + w)); }
if (errors.length) { console.log('\n✖ 오류'); errors.forEach((e) => console.log('  - ' + e)); console.log(''); process.exit(1); }
console.log('\n✔ 오류 없음\n');
