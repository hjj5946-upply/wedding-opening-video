// 말풍선. setParts(보이는글자, 아직안나온글자) 로 글자를 채웁니다.
// 아직 안 나온 글자도 투명하게 자리를 차지해서, 글자가 늘어나도 풍선 크기가 흔들리지 않아요.
import { forwardRef, useImperativeHandle, useRef } from 'react';

const Bubble = forwardRef(function Bubble({ fontSize, maxWidth }, ref) {
  const elRef = useRef(null);
  const shownRef = useRef(null);
  const restRef = useRef(null);

  useImperativeHandle(ref, () => ({
    get el() {
      return elRef.current;
    },
    setParts(shown, rest) {
      if (shownRef.current) shownRef.current.textContent = shown;
      if (restRef.current) restRef.current.textContent = rest;
    },
  }));

  return (
    <div className="bubble" ref={elRef} style={{ fontSize, maxWidth }}>
      <div className="bubbleBox">
        <div className="bubbleFill">
          <span ref={shownRef} />
          <span ref={restRef} className="bubbleRest" />
        </div>
      </div>
      <div className="tailOuter" />
      <div className="tailInner" />
    </div>
  );
});

export default Bubble;
