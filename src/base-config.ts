import { demoBlockPlugin } from './plugins/index.js';
import { defineConfig } from 'vitepress';
import taskLists from 'markdown-it-task-lists';
import { whyframe } from '@whyframe/core';
import { whyframeVue } from '@whyframe/vue';
import react from '@vitejs/plugin-react';

const deps = [
  'vitepress-theme-components',
  'veaury',
  'semver',
  'markdown-it',
  'sucrase',
  'date-fns-tz/formatInTimeZone',
  'vueuc',
  'naive-ui',
  'date-fns',
  '@mermaid-js/mermaid-zenuml',
  'mermaid',
  'dayjs',
  '@braintree/sanitize-url'
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
    resolve: {
      alias: {
        // 强制使用 dayjs 的 ESM 版本，但保留插件路径
        'dayjs$': 'dayjs/esm/index.js',
      },
    },
    plugins: [
      react(),
      // Initialize core plugin
      whyframe({
        defaultSrc: 'frames/default' // provide our own html
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
