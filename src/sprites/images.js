// PNG 도트 교체: public/assets/sprites/<캐릭터>/<포즈>_<번호>.png 가 있으면 그 프레임은 PNG로 그림.
//  - 목록은 vite.config.js 의 sprite-manifest 플러그인이 만들어 줌 (없는 파일은 요청하지 않음 → 404 없음)
//  - PNG 크기는 코드 도트와 같은 칸 수(24×32)로 만들기. 크기가 다르면 캔버스에 맞춰 늘려 그림.
//  - 옆모습 PNG도 "오른쪽을 보는 방향"으로 그리기 (왼쪽은 자동 좌우 반전)
import manifest from 'virtual:sprite-manifest';

const cache = new Map(); // 'groom/walk_1' → { img, ready, waiters[] }
const base = import.meta.env.BASE_URL;

for (const file of manifest) {
  const key = file.replace(/\.png$/, '');
  const img = new Image();
  const entry = { img, ready: false, waiters: [] };
  img.onload = () => {
    entry.ready = true;
    entry.waiters.splice(0).forEach((fn) => fn());
  };
  img.src = `${base}assets/sprites/${file}`;
  cache.set(key, entry);
}

/** 이 프레임에 PNG가 있으면 entry, 없으면 null */
export function spriteImage(spriteId, frame) {
  return cache.get(`${spriteId}/${frame}`) ?? null;
}

/** 지금 PNG가 쓰이는 프레임 목록 (갤러리 표시용) */
export const pngFrames = manifest.map((f) => f.replace(/\.png$/, ''));
