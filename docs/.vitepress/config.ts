import { defineConfigWithTheme } from 'vitepress';
import { baseConfig } from '../../src/base-config';
import { type AdvThemeConfig } from '../../src';
import pkg from '../../package.json';

// https://vitepress.dev/reference/site-config
export default defineConfigWithTheme<AdvThemeConfig>({
  title: 'Vitepress theme components',
  description: 'A vitepress theme for components site',
  extends: baseConfig,
  // base: '/vitepress-theme-components/',
  themeConfig: {
    // 获取public中的文件。 直接使用站点绝对路径
    changelog: {
      path: '/CHANGELOG-test.md'
    },
    coverage: {
      path: '/coverage-summary.json'
    },
    customPagePath: '/mobile/example',
    nav: [
      {
        text: `v${pkg.version}`,
        link: 'https://github.com/tangbohao37/vitepress-theme-components'
      },
      { text: '指南', link: '/guide/start' },
      { text: 'Demo', link: '/demo/' }
    ],
    sidebar: {
      '/guide/': {
        base: '/guide/',
        items: [
          {
            text: '指南',
            items: [
              { text: '动机', link: 'why' },
              { text: '开始', link: 'start' }
            ]
          },
          {
            text: '使用',
            items: [
              { text: '配置项', link: 'config' },
              { text: 'Markdown 扩展', link: 'markdown' },
              { text: 'Frontmatter 扩展', link: 'frontmatter' }
            ]
          }
        ]
      },
      '/demo/': {
        base: '/demo/',
        items: [
          {
            text: 'Demo Components',
            items: [
              { text: 'Button', link: 'button' },
              { text: 'Icons', link: 'icons' },
              { text: 'Custom Component', link: 'custom-component' }
            ]
          }
        ]
      }
    }
  },
  vite: {
    ssr: {
      noExternal: ['@arco-design/web-react']
    }
  }
});
