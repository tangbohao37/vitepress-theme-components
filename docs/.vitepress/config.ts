import { defineConfigWithTheme } from 'vitepress';
import { baseConfig } from '../../lib/base-config';
import { type AdvThemeConfig } from '../../lib';
import path from 'path';

// https://vitepress.dev/reference/site-config
export default defineConfigWithTheme<AdvThemeConfig>({
  title: 'My Awesome Project',
  description: 'A VitePress Site',
  extends: baseConfig,
  base: '/docs/',
  themeConfig: {
    changelog: {
      path: path.resolve(__dirname, '../assets/CHANGELOG-test.md')
    },
    coverage: {
      path: path.resolve(__dirname, '../assets/coverage-summary.json')
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
