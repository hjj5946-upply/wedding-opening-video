// 앱 본체: 화면(Scene) + 타임라인 연결 + 키보드 조작
//
//  Space : 영상 시작 (소리 허용도 이때 풀림)        R : 처음 상태로 (페이지 새로고침)
//  D     : 디버그 표시 켜기/끄기                   P : 일시정지/재개
//  ← →   : ±5초   [ ] : ±1초   0~8 : 장면 시작으로 점프  (디버그 켜진 상태에서만)
//
//  주소 옵션:  ?debug=1   처음부터 디버그 표시
//              ?t=62      62초 지점에서 멈춘 채로 열기 (화면 확인/캡처용)
//              ?autostart=1  스페이스 없이 바로 재생 (개발 테스트용, 소리는 안 남)
import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import config from './config.js';
import Stage from './components/Stage.jsx';
import Scene from './components/Scene.jsx';
import Debug from './components/Debug.jsx';
import { buildTimeline } from './engine/buildTimeline.js';
import { totalDuration } from './engine/timing.js';
import { unlockAudio } from './engine/audio.js';

const JUMP_ORDER = Object.keys(config.scenes); // 숫자키 0~8 = 장면 순서대로

export default function App() {
  const refs = useRef({ banners: {}, hearts: [], hudHearts: [], obstacles: {}, closingLines: [] }).current;
  const flags = useRef({ silent: false }).current;
  const api = useRef({ tl: null, update: null, started: false, pausedByUser: false, debug: false }).current;

  // 타임라인 만들기 (첫 화면이 그려지기 전에)
  useLayoutEffect(() => {
    gsap.ticker.lagSmoothing(0); // 버벅여도 시간이 늘어지지 않게: 영상 길이를 실제 시간에 정확히 맞춤
    const params = new URLSearchParams(window.location.search);
    api.debug = params.has('debug');

    const gctx = gsap.context(() => {
      const built = buildTimeline({ refs, config, flags });
      api.tl = built.tl;
      api.update = built.update;
      api.steps = built.steps;
    });
    api.update();

    const seek = (t, { play = true } = {}) => {
      const total = totalDuration(config);
      flags.silent = true;
      api.steps.reset();
      api.tl.time(Math.max(0, Math.min(total, t)), false);
      api.update();
      setTimeout(() => (flags.silent = false), 100);
      if (play && !api.pausedByUser) api.tl.play();
      api.started = true;
    };
    api.seek = seek;

    api.start = () => {
      if (api.started || !api.tl) return;
      api.started = true;
      unlockAudio();
      api.tl.play(0);
    };

    if (params.has('t')) {
      api.pausedByUser = true;
      api.tl.pause();
      seek(Number(params.get('t')) || 0, { play: false });
    }
    if (params.has('autostart')) api.start();

    document.fonts?.ready.then(() => {
      document.title = '▶ READY — Space로 시작';
    });
    return () => gctx.revert();
  }, [refs, flags, api]);

  // 키보드
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        api.start();
        return;
      }
      if (e.code === 'KeyR') return window.location.reload();
      if (e.code === 'KeyD') {
        api.debug = !api.debug;
        return;
      }
      if (e.code === 'KeyP' && api.tl) {
        api.pausedByUser = !api.pausedByUser;
        api.tl.paused(api.pausedByUser);
        return;
      }
      if (!api.debug || !api.tl) return;
      const t = api.tl.time();
      if (e.code === 'ArrowRight') api.seek(t + 5);
      else if (e.code === 'ArrowLeft') api.seek(t - 5);
      else if (e.code === 'BracketRight') api.seek(t + 1);
      else if (e.code === 'BracketLeft') api.seek(t - 1);
      else if (/^Digit[0-9]$/.test(e.code)) {
        const name = JUMP_ORDER[Number(e.code.slice(5))];
        if (name) api.seek(config.scenes[name].start);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [api]);

  return (
    <>
      <Stage width={config.canvas.width} height={config.canvas.height}>
        <Scene refs={refs} config={config} />
      </Stage>
      <Debug api={api} config={config} />
    </>
  );
}
