import { defineConfigWithTheme } from 'vitepress';
import { baseConfig } from '../../lib/base-config';
import { type AdvThemeConfig } from '../../lib';

// https://vitepress.dev/reference/site-config
export default defineConfigWithTheme<AdvThemeConfig>({
  title: 'My Awesome Project',
  description: 'A VitePress Site',
  extends: baseConfig,
  base: '/vitepress-theme-components/',
  themeConfig: {
    // 获取public中的文件。 直接使用站点绝对路径
    changelog: {
      path: '/CHANGELOG-test.md'
    },
    coverage: {
      path: '/coverage-summary.json'
    },
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Demo', link: '/demo/' }
    ],
    sidebar: {
      '/guide/': {
        base: '/guide/',
        items: [
          {
            text: 'Guide',
            items: [{ text: 'Start', link: '/' }]
          }
        ]
      },
      '/demo/': {
        base: '/demo/',
        items: [
          {
            text: 'Demo Components',
            items: [
              { text: 'Button', link: '/button' },
              { text: 'Icon', link: '/icon' }
            ]
          }
        ]
      }
    }
  },
  vite: {
    ssr: {
      noExternal: ['element-plus', 'veaury']
    }
  }
});
