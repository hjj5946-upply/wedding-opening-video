// 시작 화면 — 검은 바탕에 "GAME START" + 누를 것(스페이스바 키캡 / 터치 표시) 안내.
//  스페이스바를 누르거나 화면을 터치하면 사라지고 영상이 시작됩니다 (App.jsx).
//  문구는 config.startScreen. 소리(mp3) 준비가 끝나기 전에는 "소리 준비 중..." 만 보입니다.
export default function StartScreen({ config, ready, touch }) {
  const S = config.startScreen;

  return (
    <div className="startScreen">
      <div className="startTitle">{S.title}</div>

      {!ready ? (
        <div className="startLoading">{S.loading}</div>
      ) : touch ? (
        <>
          <div className="startTouch">
            <div className="startTouchRing" />
            <div className="startTouchDot">{S.touchLabel}</div>
          </div>
          <div className="startHintText">{S.touchHint}</div>
          <div className="startRotate">{S.rotateHint}</div>
        </>
      ) : (
        <>
          <div className="startKeyWrap">
            <div className="startKey">{S.keyLabel}</div>
          </div>
          <div className="startHintText">{S.keyHint}</div>
        </>
      )}
    </div>
  );
}
