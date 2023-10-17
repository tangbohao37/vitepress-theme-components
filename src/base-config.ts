import { demoBlockPlugin } from './plugins/index.js';
import { defineConfig } from 'vitepress';
import { esbuildCommonjs } from '@originjs/vite-plugin-commonjs';

const baseConfig = defineConfig({
  markdown: {
    config(md) {
      md.use(demoBlockPlugin);
    }
  },
  vite: {
    optimizeDeps: {
      // FIXME: vite bugs: https://github.com/vitejs/vite/issues/14545 不能预编译子依赖.
      include: ['veaury', 'semver', 'markdown-it', 'sucrase']
    },

    ssr: {
      noExternal: ['element-plus', 'veaury']
    }
  }
});

export { baseConfig };
