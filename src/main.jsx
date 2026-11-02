import { createRoot } from 'react-dom/client';
import './styles.css'; // 한글 도트 폰트(Galmuri, OFL 라이선스)는 styles.css 의 @font-face 에서 불러옴
import App from './App.jsx';
import SpriteGallery from './components/SpriteGallery.jsx';

// StrictMode는 일부러 쓰지 않음: 개발 모드에서 타임라인이 두 번 만들어지는 걸 막기 위해
// ?sprites 로 열면 영상 대신 도트 확인 화면 (모든 포즈/방향 + 움직이는 포즈 + 발걸음 이벤트)
const gallery = new URLSearchParams(window.location.search).has('sprites');
createRoot(document.getElementById('root')).render(gallery ? <SpriteGallery /> : <App />);
