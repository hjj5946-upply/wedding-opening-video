// 캐릭터 포즈 트랙: "몇 초~몇 초는 걷기/점프/손흔들기"를 등록해 두면
// 현재 시각(t)만으로 어떤 도트 프레임을 보여줄지 계산합니다. (시간으로만 결정 → 건너뛰기/되감기에도 안전)

const POSES = {
  stand: { frames: ['stand'], fps: 1 },
  walk: { frames: ['walkA', 'walkB'], fps: 5.5 }, // 초당 5.5번 프레임 교체
  jump: { frames: ['jump'], fps: 1 },
  wave: { frames: ['wave1', 'wave2'], fps: 3.5 },
};

export function createPoseTrack() {
  const segs = { groom: [], bride: [] };
  return {
    /** who: 'groom'|'bride', pose: 'stand'|'walk'|'jump'|'wave' */
    add(who, start, end, pose) {
      if (!POSES[pose]) throw new Error(`알 수 없는 포즈: ${pose}`);
      segs[who].push({ start, end, pose });
    },
    frameAt(who, t) {
      for (let i = segs[who].length - 1; i >= 0; i--) {
        const s = segs[who][i];
        if (t >= s.start && t < s.end) {
          const p = POSES[s.pose];
          return p.frames[Math.floor((t - s.start) * p.fps) % p.frames.length];
        }
      }
      return 'stand';
    },
  };
}
