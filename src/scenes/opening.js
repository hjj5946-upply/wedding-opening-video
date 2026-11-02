// 0~23초: 완전 검정 → 신랑이 오른쪽에서 왼쪽으로 걸어 들어옴(옆모습, 왼쪽 방향) → 멈춰서 앞모습으로 손 흔들며 인사
//  배경/바닥 없음 (순수 검정). 멘트(큰 말풍선)는 config.dialogue 의 greet 장면 줄들이 자동으로 들어감.
import { lineTiming } from '../engine/timing.js';

const TURN_PAUSE = 0.25; // 멈춘 뒤 옆모습으로 잠깐 서 있다가 앞으로 도는 시간(초)

export function buildOpening({ tl, refs, config, poses }) {
  const { scenes: S, intro: I, layout: L } = config;

  // 신랑: 화면 오른쪽 바깥에서 출발. 이 구간에선 발 높이를 feetY 로 (맵의 바닥선보다 위)
  tl.set(refs.groomWrap, { xPercent: -50, x: I.fromX, y: I.feetY - L.groundY }, 0);
  tl.to(refs.groomWrap, { x: I.groomX, duration: S.intro.end - S.intro.start, ease: 'none' }, S.intro.start);
  poses.add('groom', S.intro.start, S.intro.end, 'walk', 'left');
  poses.add('groom', S.intro.end, S.intro.end + TURN_PAUSE, 'sideStand', 'left');

  // 첫 문장(waveLine)이 끝날 때까지 손 흔들기 → 이후 앞모습 서기 (말할 때 통통 튀는 건 dialogue.js)
  const waveLine = config.dialogue.find((d) => d.id === I.waveLine);
  const waveEnd = waveLine ? lineTiming(waveLine, config).hideAt : S.intro.end + 3;
  poses.add('groom', S.intro.end + TURN_PAUSE, waveEnd, 'wave');
  poses.add('groom', waveEnd, S.greet.end, 'frontStand');
}
