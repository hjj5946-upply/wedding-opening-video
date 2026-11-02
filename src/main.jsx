import { createRoot } from 'react-dom/client';
import './styles.css'; // 한글 도트 폰트(Galmuri, OFL 라이선스)는 styles.css 의 @font-face 에서 불러옴
import App from './App.jsx';

// StrictMode는 일부러 쓰지 않음: 개발 모드에서 타임라인이 두 번 만들어지는 걸 막기 위해
createRoot(document.getElementById('root')).render(<App />);
