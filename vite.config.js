import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const SPRITE_DIR = path.join(root, 'public/assets/sprites');

// 도트 PNG 목록 자동 생성: public/assets/sprites/<캐릭터>/<포즈>_<번호>.png 가 있으면
// import list from 'virtual:sprite-manifest' 로 ['groom/walk_1.png', ...] 를 받음.
// → 없는 파일은 아예 요청하지 않으므로 콘솔 404 없음. 없으면 코드 도트를 그림.
function spriteManifest() {
  const ID = 'virtual:sprite-manifest';
  const RID = '\0' + ID;
  const list = () => {
    if (!fs.existsSync(SPRITE_DIR)) return [];
    return fs
      .readdirSync(SPRITE_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .flatMap((d) =>
        fs
          .readdirSync(path.join(SPRITE_DIR, d.name))
          .filter((f) => /^[A-Za-z]+_\d+\.png$/.test(f))
          .map((f) => `${d.name}/${f}`),
      );
  };
  return {
    name: 'sprite-manifest',
    resolveId: (id) => (id === ID ? RID : undefined),
    load: (id) => (id === RID ? `export default ${JSON.stringify(list())};` : undefined),
    configureServer(server) {
      // 개발 중 PNG를 넣거나 지우면 목록 갱신 + 페이지 새로고침
      const onChange = (file) => {
        if (!path.resolve(file).startsWith(SPRITE_DIR) || !file.endsWith('.png')) return;
        const mod = server.moduleGraph.getModuleById(RID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.add(SPRITE_DIR);
      server.watcher.on('add', onChange);
      server.watcher.on('unlink', onChange);
    },
  };
}

export default defineConfig({
  plugins: [react(), spriteManifest()],
  base: './',
  server: { port: 5173, open: false },
});
