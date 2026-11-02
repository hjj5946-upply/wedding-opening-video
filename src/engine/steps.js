// 발걸음 이벤트 (걷기/달리기에서 발이 땅에 닿는 프레임으로 바뀔 때 1번)
//  - 정상 재생 중에만 발생. ?t= 이동 / 디버그 건너뛰기 / 되감기 중에는 발생하지 않음
//  - 소리는 config.sfx.step.enabled 가 true 일 때만 (지금은 false = 훅만 준비)
//  - 나중에 음원/합성음을 붙이려면 engine/audio.js 의 stepSound() 를 고치거나
//    createStepTracker({ onStep }) 에 원하는 함수를 넘기면 됩니다.
//
// 이벤트 내용: { who: 'groom'|'bride', pose: 'walk'|'run', frame: 'walk_1', t: 초 }

export function createStepTracker({ flags, onStep }) {
  const last = {};
  const tracker = {
    count: 0, // 지금까지 발생한 발걸음 수 (디버그 표시용)
    lastEvent: null,
    /** 매 프레임: 캐릭터별 poses.at() 결과를 넘겨줌 */
    update(who, info, t) {
      const prev = last[who];
      last[who] = info;
      if (!info.steps || !prev || flags.silent) return;
      // 같은 구간이면 지난 프레임 다음부터, 방금 새 걷기/달리기 구간에 들어왔으면 0번 프레임부터 검사
      const from = prev.seg === info.seg ? prev.tick + 1 : 0;
      const d = info.tick - from;
      if (d < 0 || d > 1) return; // 같은 프레임이거나, 크게 건너뛴 경우(시간 이동) → 무시
      // 이번에 지나간 프레임들 중 "발 닿는 프레임"이 있었는지
      for (let k = from; k <= info.tick; k++) {
        if (info.steps.includes(k % info.frameCount)) {
          tracker.count++;
          tracker.lastEvent = { who, pose: info.pose, frame: info.frame, t };
          onStep?.(tracker.lastEvent);
          break;
        }
      }
    },
    /** 시간 이동 직후 호출: 이전 기록을 지워서 다음 프레임에 이벤트가 튀지 않게 */
    reset() {
      for (const k of Object.keys(last)) delete last[k];
    },
  };
  return tracker;
}
