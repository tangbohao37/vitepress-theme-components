---
hideRecord: true
---

# 开始

## 安装

::: code-group

```bash [pnpm]
pnpm add vitepress-theme-components
```

```bash [npm]
npm i vitepress-theme-components
```

```bash [yarn]
yarn add vitepress-theme-components
```

:::

## 使用

1. 引入主题

```ts
// .vitepress/theme/index.ts
import theme from 'vitepress-theme-components';

export default theme;
```

2. 基础配置

```ts
// .vitepress/config.ts
import { type AdvThemeConfig } from 'vitepress-theme-components'
import { baseConfig } from 'vitepress-theme-components/config'

export default defineConfigWithTheme<AdvThemeConfig>({
  extends: baseConfig,
  themeConfig: {
    // changelog: {
    //   path: '/xxx.md'
    // },
    // coverage: {
    //   path: '/xxxx.json'
    // },
  },
})
```
