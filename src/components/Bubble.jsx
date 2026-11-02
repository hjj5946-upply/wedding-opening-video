// 말풍선. setParts(보이는글자, 아직안나온글자) 로 글자를 채우고, setLayout('side'|'above'|'game') 으로 배치를 바꿉니다.
//  - side : 캐릭터 오른쪽에 크게, 꼬리는 왼쪽(캐릭터 쪽)
//  - above: 머리 위, 꼬리는 아래
//  - game : 게임 구간 전용 자막칸 (캐릭터와 떨어진 화면 아래쪽 고정 위치, 꼬리 없음)
// 아직 안 나온 글자도 투명하게 자리를 차지해서, 글자가 늘어나도 풍선 크기가 흔들리지 않아요.
// 구조: .bubbleAnchor(위치 담당, CSS) > .bubble(톡 튀어나오기/사라지기, GSAP)
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const Bubble = forwardRef(function Bubble({ bubble }, ref) {
  const anchorRef = useRef(null);
  const elRef = useRef(null);
  const shownRef = useRef(null);
  const restRef = useRef(null);
  const layoutRef = useRef(null);
  const fillRef = useRef(null);

  // 글자가 여러 줄로 접히면 CSS만으로는 풍선이 maxWidth까지 넓어져 오른쪽이 비어 보임
  // → 접힌 줄 중 가장 긴 줄 폭에 맞춰 풍선 폭을 줄임 (멘트가 바뀔 때 1번)
  const fit = () => {
    const bub = elRef.current;
    const fill = fillRef.current;
    if (!bub || !fill) return;
    bub.style.width = '';
    const ratio = bub.getBoundingClientRect().width / bub.offsetWidth || 1; // 화면 배율 + 톡 튀는 scale
    const range = document.createRange();
    range.selectNodeContents(fill);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0);
    if (!rects.length) return;
    const textW = (Math.max(...rects.map((r) => r.right)) - Math.min(...rects.map((r) => r.left))) / ratio;
    const cs = getComputedStyle(fill);
    const extra = bub.offsetWidth - fill.clientWidth + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight); // 테두리 + 안쪽 여백
    bub.style.width = `${Math.ceil(textW + extra + 2)}px`;
  };
  // 폰트가 늦게 로드되면 다시 맞춤 (?t= 로 바로 열었을 때)
  useEffect(() => {
    document.fonts?.ready.then(fit);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setLayout = (layout) => {
    if (layoutRef.current === layout || !anchorRef.current) return;
    layoutRef.current = layout;
    anchorRef.current.className = `bubbleAnchor ${layout}`;
    const b = bubble[layout] ?? {};
    elRef.current.style.maxWidth = `${b.maxWidth ?? 1100}px`;
    elRef.current.style.fontSize = `${b.fontSize ?? bubble.fontSize}px`;
  };

  useImperativeHandle(ref, () => ({
    get el() {
      return elRef.current;
    },
    setParts(shown, rest) {
      if (shownRef.current) shownRef.current.textContent = shown;
      if (restRef.current) restRef.current.textContent = rest;
    },
    setLayout,
    fit,
  }));

  const vars = {
    '--gapSide': `${bubble.side.gap}px`,
    '--gapAbove': `${bubble.above.gap}px`,
    '--tailX': `${bubble.above.tailX}px`,
    '--centerY': bubble.side.centerY,
  };

  return (
    <div className={`bubbleAnchor ${bubble.layout}`} ref={anchorRef} style={vars}>
      <div className="bubble" ref={elRef} style={{ fontSize: bubble.fontSize, maxWidth: bubble[bubble.layout].maxWidth }}>
        <div className="bubbleBox">
          <div className="bubbleFill" ref={fillRef}>
            <span ref={shownRef} />
            <span ref={restRef} className="bubbleRest" />
          </div>
        </div>
        <div className="tailOuter" />
        <div className="tailInner" />
      </div>
    </div>
  );
});

export default Bubble;
