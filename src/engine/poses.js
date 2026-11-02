// 캐릭터 포즈 트랙: "몇 초~몇 초는 왼쪽을 보고 걷기" 처럼 구간을 등록해 두면
// 현재 시각(t)만으로 어떤 도트 프레임 + 어느 방향인지 계산합니다.
// (시간으로만 결정 → ?t= 이동, 되감기, 건너뛰기에도 항상 같은 화면)
//
//   poses.add('groom', 1, 5.5, 'walk', 'left')         // 1~5.5초: 왼쪽을 보고 걷기
//   poses.add('groom', 5.5, 9, 'wave')                 // 앞모습 포즈는 방향 무시
//   poses.add('groom', 38, 80, 'run', { facing: 'right', fps: 14 })
//   겹치는 구간은 "나중에 등록한 것"이 우선 (예: 달리기 전체 등록 후 점프 구간을 덮어씀)
//
// 옆모습(view: 'side')은 오른쪽을 보는 그림만 있고, facing:'left' 면 화면에서 좌우 반전합니다.

/** 포즈 정의. frames = 프레임 이름(= PNG 파일 이름), fps 는 config.sprites.fps[포즈] 로 조절 */
export const POSES = {
  // 옆모습
  sideStand: { view: 'side', frames: ['sideStand_1'] },
  walk: { view: 'side', frames: ['walk_1', 'walk_2', 'walk_3', 'walk_4'], steps: [0, 2] }, // steps: 발이 땅에 닿는 프레임 → 발걸음 이벤트
  run: { view: 'side', frames: ['run_1', 'run_2', 'run_3', 'run_4'], steps: [0, 2] },
  jump: { view: 'side', frames: ['jump_1'] },
  hit: { view: 'side', frames: ['hit_1'] },
  // 앞모습
  frontStand: { view: 'front', frames: ['frontStand_1'] },
  wave: { view: 'front', frames: ['wave_1', 'wave_2'] },
  fall: { view: 'front', frames: ['fall_1'] },
};

const DEFAULT_FPS = { walk: 8, run: 12, wave: 4 };

export function createPoseTrack(fpsConfig = {}) {
  const fpsOf = (pose) => fpsConfig[pose] ?? DEFAULT_FPS[pose] ?? 1;
  const segs = {};
  const defaults = {};

  const track = {
    /**
     * who: 'groom' | 'bride', pose: POSES 의 키
     * opts: 'left' | 'right' (방향만) 또는 { facing, fps }
     */
    add(who, start, end, pose, opts = {}) {
      if (!POSES[pose]) throw new Error(`알 수 없는 포즈: ${pose} (가능: ${Object.keys(POSES).join(', ')})`);
      const o = typeof opts === 'string' ? { facing: opts } : opts;
      (segs[who] ??= []).push({ start, end, pose, facing: o.facing ?? 'right', fps: o.fps ?? fpsOf(pose), index: (segs[who] ?? []).length });
      return track;
    },
    /** 아무 구간에도 속하지 않을 때의 포즈 (기본: 앞모습 서기) */
    setDefault(who, pose, facing = 'right') {
      defaults[who] = { pose, facing };
      return track;
    },
    /**
     * 시각 t의 상태: { pose, frame, facing, seg, tick, steps, frameCount }
     *  - tick: 구간 시작부터 지난 프레임 수 (발걸음 이벤트 계산용)
     */
    at(who, t) {
      const list = segs[who] ?? [];
      for (let i = list.length - 1; i >= 0; i--) {
        const s = list[i];
        if (t >= s.start && t < s.end) {
          const p = POSES[s.pose];
          const tick = Math.floor((t - s.start) * s.fps);
          return {
            pose: s.pose,
            frame: p.frames[tick % p.frames.length],
            facing: s.facing,
            seg: s.index,
            tick,
            steps: p.steps,
            frameCount: p.frames.length,
          };
        }
      }
      const d = defaults[who] ?? { pose: 'frontStand', facing: 'right' };
      return { pose: d.pose, frame: POSES[d.pose].frames[0], facing: d.facing, seg: -1, tick: 0 };
    },
    /** (이전 버전 호환) 프레임 이름만 */
    frameAt(who, t) {
      return track.at(who, t).frame;
    },
    segments(who) {
      return [...(segs[who] ?? [])];
    },
  };
  return track;
}
