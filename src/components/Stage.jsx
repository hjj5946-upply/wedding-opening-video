// 1920×1080 고정 캔버스를 창 크기에 맞춰 축소/확대(transform: scale)해서 가운데에 보여줍니다.
// F11 전체화면 + 모니터 1920×1080 + 배율 100% 이면 scale = 1 (가장 선명)
import { useEffect, useState } from 'react';

export default function Stage({ width, height, children }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / width, window.innerHeight / height));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [width, height]);

  return (
    <div className="viewport">
      <div className="canvas" style={{ width, height, transform: `translate(-50%, -50%) scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
