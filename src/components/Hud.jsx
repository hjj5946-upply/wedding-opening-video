// HUD: 왼쪽 위 하트(라이프) + 오른쪽 위 TIME n YEAR.  위치/크기는 config.hud
//  하트가 깎이는 연출과 TIME 숫자 변화는 scenes/hud.js (현재 시각으로 결정)
import Heart from './Heart.jsx';

export default function Hud({ refs, config }) {
  const { hearts: H, time: T } = config.hud;
  return (
    <div className="layer hud" ref={(el) => (refs.hud = el)}>
      <div className="hudHearts" style={{ left: H.x, top: H.y, gap: H.gap }}>
        {Array.from({ length: H.count }, (_, i) => (
          <Heart key={i} palette={config.palette} scale={H.scale} className="hudHeart" innerRef={(el) => (refs.hudHearts[i] = el)} />
        ))}
      </div>
      <div className="hudTime" style={{ right: T.right, top: T.y }}>
        <div className="hudLabel" style={{ fontSize: T.labelSize }}>
          {T.label}
        </div>
        <div className="hudValue" style={{ fontSize: T.valueSize }} ref={(el) => (refs.hudTime = el)}>
          {T.from} {T.unit}
        </div>
      </div>
    </div>
  );
}
