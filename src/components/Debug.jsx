// 디버그 표시(녹화 때는 꺼두세요). D 키로 켜고 끄기, 주소 끝에 ?debug=1 을 붙이면 처음부터 켜짐.
// React 상태 대신 DOM을 직접 갱신 → 영상 재생에 영향 없음
import { useEffect, useRef } from 'react';
import { sceneAt, totalDuration } from '../engine/timing.js';

export default function Debug({ api, config }) {
  const ref = useRef(null);

  useEffect(() => {
    let raf;
    const loop = () => {
      const el = ref.current;
      if (el) {
        el.style.display = api.debug ? 'block' : 'none';
        if (api.debug && api.tl) {
          const t = api.tl.time();
          const total = totalDuration(config);
          const next = config.audioCues.find((c) => c.t > t);
          const state = !api.started ? 'READY (Space)' : api.tl.paused() ? 'PAUSED' : t >= total ? 'DONE (고정)' : 'PLAYING';
          el.textContent =
            `t = ${t.toFixed(2)} / ${total.toFixed(2)} s   [${state}]   scene: ${sceneAt(config, t)}\n` +
            `next cue: ${next ? `${next.t.toFixed(1)}s ${next.label}` : '-'}\n` +
            `발걸음 이벤트: ${api.steps?.count ?? 0}회 (소리 ${config.sfx.step.enabled ? '켜짐' : '꺼짐 — sfx.step.enabled'})\n` +
            'Space 시작 · R 처음부터 · D 디버그 · P 일시정지 · ←/→ ±5초 · [ / ] ±1초 · 0~8 장면 점프';
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [api, config]);

  return <div className="debug" ref={ref} />;
}
