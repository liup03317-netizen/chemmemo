import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  // 配置 GitHub Pages 部署的基础路径 (对应您的仓库名 chemmem)
  base: '/chemmemo/',
  build: {
    sourcemap: 'hidden',
  },
  server: {
    watch: {
      ignored: ['**/.pnpm-store/**']
    }
  },
  plugins: [react({
    babel: {
      plugins: [
        'react-dev-locator',
      ],
    },
  }), traeBadgePlugin({
    variant: 'dark',
    position: 'bottom-right',
    prodOnly: true,
    clickable: true,
    clickUrl: 'https://www.trae.ai/solo?showJoin=1',
    autoTheme: true,
    autoThemeTarget: '#root'
  }), tsconfigPaths(), cloudflare()],
})