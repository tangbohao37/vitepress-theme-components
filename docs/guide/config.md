---
hideRecord: true
---

<!-- # 配置项 -->

基于 vitepress,可以兼容使用所有 [vitepress](https://vitepress.dev/reference/site-config) 的配置项

:point_down::point_down: 以下是本站点新增的配置项

## changelog

配置 changelog 路径

```js
themeConfig: {
  // 获取public中的文件。 直接使用站点绝对路径
  changelog: {
    path: '/CHANGELOG-test.md';
  }
}
```

### changelog.path

- Type: `string`
- Default: `null`

changelog.md 一般是放在public中,使用 `/xxx`使用绝对路径配置 [public处理逻辑](https://vitepress.dev/guide/asset-handling#the-public-directory)

vitepress 会把目录下的`.md` 都编译成.vue 文件。为了防止changelog.md被编译，因此一般是放在 `public` 让其作为静态资源文件存在

### changelog.parse

- Type: `(content: string) => void`
- Default: `null`

自定义 changelog 解析函数，用于处理特殊格式的 changelog 文件：

```js
themeConfig: {
  changelog: {
    path: '/CHANGELOG.md',
    parse: (content) => {
      // 自定义解析逻辑
      return parseCustomChangelog(content);
    }
  }
}
```

## coverage

配置单测覆盖率路径和解析方式

```js
themeConfig: {
  // 获取public中的文件。 直接使用站点绝对路径
  coverage: {
    path: '/coverage-summary.json',
    parse: (content) => {
      // 自定义解析逻辑
      return JSON.parse(content);
    }
  },
}
```

### coverage.path

- Type: `string`
- Default: `null`

覆盖率文件放置在 public 中，`/xxx.json` 使用绝对路径配置。

支持的覆盖率文件格式：
- Jest 生成的 `coverage-summary.json`
- NYC 生成的覆盖率报告
- 自定义 JSON 格式

### coverage.parse

- Type: `(content: string) => CoverageData`
- Default: `JSON.parse`

自定义覆盖率数据解析函数：

```js
themeConfig: {
  coverage: {
    path: '/coverage-summary.json',
    parse: (content) => {
      const data = JSON.parse(content);
      // 转换为标准格式
      return {
        total: data.total,
        covered: data.covered,
        percentage: data.percentage
      };
    }
  }
}
```

## customPagePath

- Type: `string`
- Default: `null`

自定义页面路径，用于指定使用空布局的页面路径前缀：

```js
themeConfig: {
  customPagePath: '/mobile'
}
```

当页面路径包含指定前缀时，将使用 `EmptyLayout` 而不是默认的 `BaseLayout`。

## 完整配置示例

```ts
// .vitepress/config.ts
import { defineConfigWithTheme } from 'vitepress';
import { type AdvThemeConfig } from 'vitepress-theme-components';
import { baseConfig } from 'vitepress-theme-components/config';

export default defineConfigWithTheme<AdvThemeConfig>({
  extends: baseConfig,
  
  title: '我的组件库',
  description: '基于 VitePress 的组件库文档',
  
  themeConfig: {
    // VitePress 原生配置
    nav: [
      { text: '指南', link: '/guide/' },
      { text: '组件', link: '/components/' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '快速开始', link: '/guide/start' },
            { text: '配置', link: '/guide/config' }
          ]
        }
      ]
    },
    
    // 主题扩展配置
    changelog: {
      path: '/CHANGELOG.md',
      parse: (content) => {
        // 自定义解析逻辑
        return content;
      }
    },
    
    coverage: {
      path: '/coverage-summary.json',
      parse: (content) => {
        const data = JSON.parse(content);
        return data;
      }
    },
    
    customPagePath: '/mobile'
  }
});
```
