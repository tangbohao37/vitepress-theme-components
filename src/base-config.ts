import { demoBlockPlugin } from './plugins/index.js';
import { defineConfig } from 'vitepress';
import taskLists from 'markdown-it-task-lists';
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
  '@braintree/sanitize-url',
  'sandpack-vue3'
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
      include: [
        ...deps,
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-live'
      ]
    },
    resolve: {
      alias: {
        // 强制使用 dayjs 的 ESM 版本，但保留插件路径
        dayjs$: 'dayjs/esm/index.js',
        // 确保 React 使用正确的版本
        react: 'react',
        'react-dom': 'react-dom'
      },
      dedupe: ['react', 'react-dom']
    },
    plugins: [
      react({
        jsxRuntime: 'automatic',
        jsxImportSource: 'react'
      })
    ],
    ssr: {
      noExternal: deps
    }
  }
});

export { baseConfig };
