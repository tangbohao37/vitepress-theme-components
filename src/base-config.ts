import { demoBlockPlugin } from './plugins/index.js';
import { defineConfig } from 'vitepress';
import react from '@vitejs/plugin-react';
import taskLists from 'markdown-it-task-lists';

const deps = [
  'vitepress-theme-components',
  'veaury',
  'semver',
  'markdown-it',
  'sucrase',
  'date-fns-tz/formatInTimeZone',
  'vueuc',
  'naive-ui',
  'date-fns'
];

/**
 * @description
 * HACK: vite bugs: https://github.com/vitejs/vite/issues/14545 不能预编译子依赖.
 * 因此使用方必需手动安装下面的依赖
 * 'veaury', 'semver', 'markdown-it', 'sucrase'
 */
const baseConfig = defineConfig({
  markdown: {
    config(md) {
      md.use(demoBlockPlugin).use(taskLists);
    }
  },
  vite: {
    optimizeDeps: {
      include: deps
    },
    plugins: [react()],
    ssr: {
      noExternal: deps
    }
  }
});

export { baseConfig };
