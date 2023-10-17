import { demoBlockPlugin } from './plugins/index.js';
import { defineConfig } from 'vitepress';

const baseConfig = defineConfig({
  markdown: {
    config(md) {
      md.use(demoBlockPlugin);
    }
  },
  vite: {
    ssr: {
      noExternal: ['element-plus', 'veaury']
    }
  }
});

export { baseConfig };
