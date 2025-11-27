import { defineConfigWithTheme } from 'vitepress';
// import { baseConfig } from '../../src/base-config';
// import { type AdvThemeConfig } from '../../src';
import { baseConfig } from '../../lib/base-config';
import { type AdvThemeConfig } from '../../lib';
import pkg from '../../package.json';

// https://vitepress.dev/reference/site-config
export default defineConfigWithTheme<AdvThemeConfig>({
  title: 'Vitepress theme components',
  description: 'A vitepress theme for components site',
  extends: baseConfig,
  base: '/vitepress-theme-components/',
  themeConfig: {
    search: {
      provider: 'local'
    },
    // 获取public中的文件。 直接使用站点绝对路径
    changelog: {
      path: '/CHANGELOG-test.md'
    },
    coverage: {
      path: '/coverage-summary.json'
    },
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
            text: '开始',
            items: [
              { text: '为什么选择', link: 'why' },
              { text: '快速开始', link: 'start' }
            ]
          },
          {
            text: '基础使用',
            items: [
              { text: '组件使用指南', link: 'components' },
              { text: 'Markdown 扩展', link: 'markdown' },
              { text: '配置选项', link: 'config' },
              { text: 'Frontmatter 扩展', link: 'frontmatter' }
            ]
          },
          {
            text: '高级功能',
            items: [
              { text: '主题定制', link: 'customization' },
              { text: '插件开发', link: 'plugin-development' }
            ]
          },
          {
            text: '开发指南',
            items: [
              { text: '开发环境', link: 'development' },
              { text: 'API 参考', link: 'api-reference' },
              { text: '故障排除', link: 'troubleshooting' }
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
              { text: 'Custom Component', link: 'custom-component' },
              { text: 'Mermaid', link: 'mermaid' }
            ]
          }
        ]
      }
    }
  },
  vite: {
    server: {
      port: 5174,
    },
    ssr: {
      noExternal: ['@arco-design/web-react']
    }
  }
});
