// npm run check — config.js 검사 (코드를 돌리지 않고도 타이밍 실수를 잡아줍니다)
import { config } from '../src/config.js';
import {
  lineTiming,
  fillTokens,
  lineLayout,
  maxCharsForLine,
  GROOM_HIT_W,
  totalDuration,
  mapStopAt,
  scrollMax,
  allBoxes,
  allPits,
  allObstacles,
  stairsInfo,
  flagInfo,
  gameEvents,
  heartsAt,
  timeText,
  healTimes,
  audioCues,
} from '../src/engine/timing.js';

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
else if (total > 110) warns.push(`총 길이 ${total}초 — 목표 상한(110초)을 넘었어요`);
else if (total < 90) warns.push(`총 길이 ${total}초 — 목표(100초 안팎)보다 짧아요`);

// 3) 멘트: 장면 안에 들어오는지 / 겹치지 않는지 / 말풍선에 들어가는지
const rows = [];
const byChannel = {};
for (const line of config.dialogue) {
  const t = lineTiming(line, config);
  const scene = config.scenes[line.scene];
  const text = fillTokens(line.text, config);
  const layout = lineLayout(line, config);
  rows.push({ id: line.id, scene: line.scene, at: line.at, typeEnd: t.typeEnd, end: t.end, chars: t.chars, text, layout });
  if (!scene) { errors.push(`멘트 ${line.id}: scene '${line.scene}' 이(가) 없습니다`); continue; }
  if (line.at < scene.start) errors.push(`멘트 ${line.id}: 시작(${line.at})이 ${line.scene} 장면 시작(${scene.start})보다 빨라요`);
  const lastShown = line.stay ? t.typeEnd : t.end;
  if (lastShown > scene.end) errors.push(`멘트 ${line.id}: 끝나는 시각(${lastShown.toFixed(2)})이 ${line.scene} 장면 끝(${scene.end})을 넘어요`);
  const maxChars = maxCharsForLine(line, config);
  const maxLines = layout === 'game' ? 2 : 3;
  if (t.chars > maxChars) warns.push(`멘트 ${line.id}: ${t.chars}자 — ${layout} 말풍선 ${maxLines}줄(약 ${maxChars}자)을 넘어요`);
  const ch = layout === 'game' ? 'game' : (line.who ?? 'groom');
  (byChannel[ch] ??= []).push({ id: line.id, at: line.at, end: t.end });
}
for (const [ch, list] of Object.entries(byChannel)) {
  list.sort((a, b) => a.at - b.at);
  for (let i = 1; i < list.length; i++) {
    if (list[i].at < list[i - 1].end) errors.push(`멘트 ${list[i - 1].id} 와 ${list[i].id} 가 겹쳐요 (${ch} 말풍선): ${list[i - 1].end.toFixed(2)} > ${list[i].at}`);
  }
}

// 4) 배너
for (const b of config.banners) {
  if (b.at + b.hold > total) errors.push(`배너 ${b.id}: 끝(${b.at + b.hold})이 영상 끝(${total})을 넘어요`);
}

// 5) 게임 구간: 물음표상자 / 낭떠러지 / 글자 장애물 / 계단 / 깃발
const G = config.scenes.game;
const M = config.map;
const boxes = allBoxes(config);
const pits = allPits(config);
const words = allObstacles(config);
const stairs = stairsInfo(config);
const flag = flagInfo(config);
const stopAt = mapStopAt(config);
const headTop = config.layout.groundY - config.layout.charH - M.jump.height; // 점프 최고점에서 머리 끝 y

// 5-1) 물음표상자
if (!boxes.length) errors.push('map.boxes 가 비어 있어요');
boxes.forEach((b, i) => {
  if (b.jump.takeoff < G.start + 0.2) errors.push(`${b.year}년 상자: 점프 시작(${b.jump.takeoff.toFixed(2)})이 게임 시작(${G.start}) 직후보다 빨라요`);
  if (b.jump.land > stopAt) errors.push(`${b.year}년 상자: 착지(${b.jump.land.toFixed(2)})가 맵이 멈추는 시각(${stopAt.toFixed(2)})을 넘어요`);
  if (i > 0 && b.year <= boxes[i - 1].year) errors.push(`상자 순서: ${boxes[i - 1].year}년 다음에 ${b.year}년 이 와요 (year 를 1,2,3... 순서로)`);
});
const boxBottom = M.boxY + M.boxSize;
if (headTop > boxBottom) errors.push(`점프 높이 ${M.jump.height}px 로는 상자(아래쪽 y=${boxBottom})에 머리가 안 닿아요 — map.jump.height 를 늘리거나 map.boxY 를 키우세요`);
else if (boxBottom - headTop > 45) warns.push(`상자를 ${(boxBottom - headTop).toFixed(0)}px 뚫고 올라가요 — map.boxY 를 ${Math.round(headTop - M.boxSize + 20)} 쯤으로 내리면 자연스러움`);
if (config.photos.list.length < boxes.length) errors.push(`사진이 ${config.photos.list.length}장인데 상자는 ${boxes.length}개예요 (photos.list 를 맞춰 주세요)`);

// 5-2) 낭떠러지
for (const p of pits) {
  const need = (p.w + GROOM_HIT_W) / M.speed;
  if (M.pitJump.air < need) errors.push(`${p.id}: 체공 ${M.pitJump.air}초로는 폭 ${p.w}px 를 못 건너요 — 최소 ${need.toFixed(2)}초 필요`);
  if (p.jump.land > stopAt) errors.push(`${p.id}: 착지(${p.jump.land.toFixed(2)})가 맵이 멈추는 시각을 넘어요`);
}

// 5-3) 글자 장애물
if (words.length > 3) warns.push(`글자 장애물이 ${words.length}개예요 (시간 예산상 3개 이하 권장)`);
for (const o of words) {
  if (o.hit) {
    if (o.hitAt < G.start + 0.5) errors.push(`'${o.text}': 부딪히는 시각(${o.hitAt})이 게임 시작 직후예요`);
    if (o.hitFx.blinkEnd > stopAt) errors.push(`'${o.text}': 충돌 연출 끝(${o.hitFx.blinkEnd.toFixed(2)})이 맵이 멈추는 시각을 넘어요`);
    if (M.hitFx.knockback > M.groomX - 120) errors.push(`hitFx.knockback(${M.hitFx.knockback}px)이 너무 커요 — 신랑이 화면 왼쪽으로 밀려 나갑니다`);
  } else {
    const need = (o.w + GROOM_HIT_W) / M.speed;
    if (M.jump.air < need) errors.push(`'${o.text}': 체공 ${M.jump.air}초로는 못 넘어요 — 최소 ${need.toFixed(2)}초 필요`);
    if (M.jump.height < o.h + 20) errors.push(`'${o.text}': 점프 높이 ${M.jump.height}px 가 장애물 높이 ${o.h}px 보다 낮아요`);
  }
}
const hitCount = words.filter((o) => o.hit).length;
if (hitCount !== 2) warns.push(`부딪히는 장애물이 ${hitCount}개예요 (요청 기준은 2개 — 하트 3→1)`);

// 5-4) 모든 사건이 시간/위치에서 겹치지 않는지
const ev = gameEvents(config);
for (let i = 1; i < ev.length; i++) {
  if (ev[i].from < ev[i - 1].to) errors.push(`'${ev[i - 1].name}' 와 '${ev[i].name}' 연출이 겹쳐요 (${ev[i - 1].to.toFixed(2)} > ${ev[i].from.toFixed(2)})`);
  else if (ev[i].from - ev[i - 1].to < 0.3) warns.push(`'${ev[i - 1].name}' → '${ev[i].name}' 간격이 ${(ev[i].from - ev[i - 1].to).toFixed(2)}초뿐이에요`);
}
// 땅 위 물체(장애물/계단)가 낭떠러지에 걸치지 않는지
for (const p of pits) {
  for (const o of words) {
    if (o.left < p.left + p.w && o.left + o.w > p.left) errors.push(`'${o.text}' 장애물이 낭떠러지(${p.id}) 위에 떠 있어요`);
  }
  if (stairs.left < p.left + p.w && stairs.left + stairs.width > p.left) errors.push(`계단이 낭떠러지(${p.id}) 위에 걸쳐 있어요`);
  for (const pipe of M.pipes) {
    if (pipe.x < p.left + p.w && pipe.x + 144 > p.left) errors.push(`파이프(x=${pipe.x})가 낭떠러지(${p.id}: ${Math.round(p.left)}~${Math.round(p.left + p.w)}) 위에 떠 있어요`);
  }
}
// 계단 → 깃발 → 신부 순서
const lastGround = Math.max(stairs.left + stairs.width, ...words.map((o) => o.left + o.w), ...pits.map((p) => p.left + p.w));
if (flag.left < stairs.left + stairs.width) errors.push(`깃대(맵 x=${Math.round(flag.left)})가 계단 끝(${Math.round(stairs.left + stairs.width)})보다 왼쪽이에요 — flag.screenX 를 키우세요`);
if (flag.left < lastGround) errors.push('깃대가 마지막 장애물보다 왼쪽이에요');
const brideX = scrollMax(config) + config.meet.brideScreenX;
if (brideX < flag.left) warns.push('신부가 깃대보다 왼쪽에 서 있어요 (meet.brideScreenX 를 키우면 깃대 오른쪽)');

// 5-5) 계단 / 깃발 타이밍
if (stairs.climbStart <= G.start) errors.push('계단 시작(stairs.atTime)이 게임 시작보다 빨라요');
if (flag.jumpAt < stairs.climbEnd) errors.push(`flag.jumpAt(${flag.jumpAt})이 계단을 다 오르기 전(${stairs.climbEnd.toFixed(2)})이에요`);
if (flag.touchAt <= flag.jumpAt) errors.push('flag.touchAt 은 flag.jumpAt 보다 뒤여야 합니다');
if (flag.slideEnd > G.end) errors.push(`깃발 연출 끝(${flag.slideEnd.toFixed(2)})이 game 장면 끝(${G.end})을 넘어요`);
if (flag.grabY > flag.poleH - 60) errors.push('flag.grabY 가 깃대 높이(poleH)보다 너무 높아요');

// 5-6) 하트 / TIME
if (heartsAt(config, stopAt) < 1) errors.push(`게임이 끝날 때 하트가 ${heartsAt(config, stopAt)}개입니다 (1개 이상 남아야 함)`);
if (heartsAt(config, total) < config.hud.hearts.count) warns.push('영상 끝에 하트가 가득 차 있지 않아요 (meet.healAt / healGap 확인)');
if (timeText(config, stopAt - 0.1) !== `${boxes[boxes.length - 1].year} ${config.hud.time.unit}`) warns.push('마지막 상자를 친 뒤 TIME 표시가 예상과 달라요');

// 6) 신부 만남 (meet)
{
  const S = config.scenes.meet;
  const E = config.meet;
  if (E.walkFrom < flag.slideEnd) errors.push(`meet.walkFrom(${E.walkFrom})이 깃발에서 내려오기 전(${flag.slideEnd.toFixed(2)})이에요`);
  if (E.walkEnd <= E.walkFrom) errors.push('meet.walkEnd 는 walkFrom 보다 뒤여야 합니다');
  if (E.waveAt < E.walkEnd) errors.push(`meet.waveAt(${E.waveAt})이 만나기 전이에요`);
  if (E.flashAt + E.flashDur > S.end) errors.push('meet 번쩍임이 meet 장면 끝을 넘어요');
  const meetX = E.brideScreenX - E.gap;
  const fromX = flag.screenX - 56;
  if (meetX <= fromX) errors.push(`meet: 신랑이 설 자리(${meetX})가 깃대 자리(${fromX})보다 왼쪽이에요`);
  const walkSpeed = (meetX - fromX) / (E.walkEnd - E.walkFrom);
  if (walkSpeed > 320) warns.push(`meet: 걸어가는 속도가 ${walkSpeed.toFixed(0)}px/초 — 걷기 동작치고 빨라요`);
  const heals = healTimes(config);
  if (heals.length) {
    const lastHeal = heals[heals.length - 1].at + 0.4;
    if (lastHeal > E.waveAt) warns.push(`하트가 다 채워지는 시각(${lastHeal.toFixed(2)})이 인사 시작(${E.waveAt})보다 늦어요`);
  }
  const clear = config.banners.find((b) => b.id === 'clear');
  if (clear && (clear.at < S.start || clear.at > S.end)) warns.push(`배너 clear(${clear.at}초)가 meet 장면(${S.start}~${S.end}) 밖이에요`);
}

// 7) 검정 페이드 + 마무리 감사 인사
{
  const F = config.scenes.fade;
  const SC = config.scenes.closing;
  const C = config.closing;
  if (F.start + C.blackoutDur > F.end) errors.push(`closing.blackoutDur(${C.blackoutDur}초)가 fade 장면(${F.start}~${F.end})보다 길어요`);
  if (!C.lines.length) errors.push('closing.lines 가 비어 있어요');
  let prevOut = -Infinity;
  C.lines.forEach((l, i) => {
    const n = i + 1;
    if (l.at < F.start + C.blackoutDur) errors.push(`마무리 ${n}번째 줄(${l.at}초)이 화면이 완전히 검어지기 전이에요`);
    if (l.at < SC.start) warns.push(`마무리 ${n}번째 줄(${l.at}초)이 closing 장면 시작(${SC.start})보다 빨라요`);
    if (l.out === undefined) { errors.push(`마무리 ${n}번째 줄에 out(사라지는 시각)이 없어요`); return; }
    if (l.out < l.at + C.fadeIn) errors.push(`마무리 ${n}번째 줄: out(${l.out})이 다 나타나기 전이에요`);
    if (l.out + C.fadeOut > total) errors.push(`마무리 ${n}번째 줄이 영상 끝(${total}) 안에 다 사라지지 못해요`);
    const readable = l.out - (l.at + C.fadeIn);
    if (readable < 1.8) warns.push(`마무리 ${n}번째 줄이 ${readable.toFixed(1)}초만 온전히 보여요 (2초 이상 추천)`);
    if (l.at < prevOut) errors.push(`마무리 ${n}번째 줄(${l.at}초)이 앞 줄이 사라지기(${prevOut}초) 전에 나와요`);
    prevOut = l.out;
  });
  const last = C.lines[C.lines.length - 1];
  const blackTail = total - (last.out + C.fadeOut);
  if (blackTail < 0.3) warns.push('마지막 줄이 사라지자마자 영상이 끝나요 (검정 여유를 0.5초 이상 두면 안전)');
}

// 8) 음악 큐
const cues = audioCues(config);
for (const c of cues) {
  if (!config.audio.tracks[c.track]) errors.push(`음악 큐 '${c.id}': 트랙 '${c.track}' 이 audio.tracks 에 없어요`);
  if (c.stop <= c.start) errors.push(`음악 큐 '${c.id}': stop 이 start 보다 뒤여야 합니다`);
  if (c.stop > total + 0.01) errors.push(`음악 큐 '${c.id}': stop(${c.stop})이 영상 끝(${total})을 넘어요`);
  if (c.fadeIn + c.fadeOut > c.stop - c.start) warns.push(`음악 큐 '${c.id}': 페이드 인/아웃 합이 재생 구간보다 길어요`);
  if (c.offset < 0) errors.push(`음악 큐 '${c.id}': offset 은 0 이상이어야 합니다`);
}
const sorted = [...cues].sort((a, b) => a.start - b.start);
for (let i = 1; i < sorted.length; i++) {
  if (sorted[i].start < sorted[i - 1].stop) warns.push(`음악 '${sorted[i - 1].id}' 와 '${sorted[i].id}' 가 ${(sorted[i - 1].stop - sorted[i].start).toFixed(2)}초 겹쳐요 (의도한 거면 괜찮아요)`);
}

// 9) 자리표시자(아직 안 채운 값) — 화면에 실제로 쓰이는 값만
const screenText = [...config.dialogue, ...config.closing.lines, ...config.banners.flatMap((b) => [{ text: b.text }, { text: b.sub ?? '' }])]
  .map((l) => l.text)
  .join(' ');
if (/^O+$/i.test(config.couple.groom) || /^O+$/i.test(config.couple.bride)) warns.push('신랑/신부 이름이 아직 OOO 입니다 (config.couple)');
if (screenText.includes('{date}') && /00/.test(config.couple.date)) warns.push('날짜가 아직 2026.00.00 입니다 (config.couple.date)');

// ── 출력 ──
console.log('\n=== 결혼식 오프닝 영상 설정 검사 ===\n');
console.log(`총 길이: ${total}초 (${mm}분 ${ss}초)   규정: 2분 이내 / 목표 100초 안팎(상한 110초)\n`);
console.log('장면');
for (const name of order) {
  const s = config.scenes[name];
  console.log(`  ${name.padEnd(8)} ${f(s.start)} ~ ${f(s.end)}  (${(s.end - s.start).toFixed(1)}초)`);
}
console.log(`\n게임 구간: ${f(G.start)} ~ ${f(flag.touchAt)} (GAME START ~ 깃발 터치 = ${(flag.touchAt - G.start).toFixed(1)}초)   맵 정지 ${stopAt.toFixed(2)}초 · 스크롤 ${Math.round(scrollMax(config))}px`);

console.log('\n멘트 (시작 → 글자 다 나옴 → 풍선 사라짐)');
for (const r of rows) {
  const endStr = Number.isFinite(r.end) ? f(r.end) : ' stay ';
  console.log(`  #${String(r.id).padStart(2)} [${r.scene.padEnd(7)}|${r.layout.padEnd(5)}] ${f(r.at)} → ${f(r.typeEnd)} → ${endStr}  ${String(r.chars).padStart(2)}자  ${r.text}`);
}

console.log('\n게임 사건 (시작 / 기준시각 / 끝)                 맵 x');
for (const e of ev) console.log(`  ${e.name.padEnd(15)} ${f(e.from)} / ${f(e.at)} / ${f(e.to)}   x=${String(Math.round(e.left)).padStart(6)}`);

console.log('\n하트 / TIME');
console.log(`  하트 ${config.hud.hearts.count}개 → 부딪힘 ${hitCount}번 → ${heartsAt(config, stopAt)}개 → 신부 만난 뒤 ${heartsAt(config, total)}개`);
console.log(`  TIME  ${boxes.map((b) => `${b.apexAt.toFixed(1)}s→${b.year}`).join('  ')}  → ${flag.touchAt.toFixed(1)}s→${config.hud.time.finalText}`);

console.log('\n마무리 감사 인사 (나타남 → 사라짐)');
console.log(`  ${f(config.scenes.fade.start)}  (검정 페이드 시작 — ${config.closing.blackoutDur}초 동안)`);
for (const l of config.closing.lines) console.log(`  ${f(l.at)} → ${f(l.out)}  ${fillTokens(l.text, config)}`);

console.log('\n음악 (웹에서 직접 재생 → OBS 데스크톱 오디오로 함께 녹음)');
for (const c of sorted) console.log(`  ${f(c.start)} ~ ${f(c.stop)}  ${c.track.padEnd(6)} (${c.src})  볼륨 ${c.volume}  시작위치 ${c.offset}s  페이드 ${c.fadeIn}/${c.fadeOut}s${c.loop ? '  반복' : ''}`);

if (warns.length) { console.log('\n⚠ 주의'); warns.forEach((w) => console.log('  - ' + w)); }
if (errors.length) { console.log('\n✖ 오류'); errors.forEach((e) => console.log('  - ' + e)); console.log(''); process.exit(1); }
console.log('\n✔ 오류 없음\n');
