import { demoBlockPlugin } from './plugins/index.js';
import { defineConfig } from 'vitepress';
import taskLists from 'markdown-it-task-lists';
import { whyframe } from '@whyframe/core';
import { whyframeVue } from '@whyframe/vue';

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
    plugins: [
      // Initialize core plugin
      whyframe({
        defaultSrc: 'frames/default', // provide our own html
      }) as any,
      // Initialize Vue integration plugin
      whyframeVue({
        include: /\.(?:vue|md)$/ // also scan in markdown files
      })
    ],
    ssr: {
      noExternal: deps
    }
  }
});

export { baseConfig };
