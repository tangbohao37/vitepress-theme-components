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

### 1. 引入主题

```ts
// .vitepress/theme/index.ts
import theme from 'vitepress-theme-components';

export default theme;
```

### 2. 基础配置

```ts
// .vitepress/config.ts
import { defineConfigWithTheme } from 'vitepress';
import { type AdvThemeConfig } from 'vitepress-theme-components';
import { baseConfig } from 'vitepress-theme-components/config';

export default defineConfigWithTheme<AdvThemeConfig>({
  extends: baseConfig,
  themeConfig: {
    // changelog: {
    //   path: '/CHANGELOG.md'
    // },
    // coverage: {
    //   path: '/coverage-summary.json'
    // },
  },
});
```

### 3. 安装必需的依赖

由于 Vite 的限制，需要手动安装以下依赖：

::: code-group

```bash [pnpm]
pnpm add veaury semver markdown-it sucrase
```

```bash [npm]
npm install veaury semver markdown-it sucrase
```

```bash [yarn]
yarn add veaury semver markdown-it sucrase
```

:::

### 4. 创建演示文件

创建演示代码文件：

```jsx
// docs/demo/example/button.jsx
import { Button } from '@arco-design/web-react';

const Example = () => {
  return (
    <Button type="primary">
      Hello World
    </Button>
  );
};

render(<Example />);
```

### 5. 在 Markdown 中使用

```md
<!-- docs/demo/button.md -->
# 按钮组件

<LiveEditor sourceCodePath="../demo/example/button.jsx"></LiveEditor>
```

## 快速开始模板

你可以使用以下模板快速开始：

```bash
# 克隆模板项目
git clone https://github.com/tangbohao37/vitepress-theme-components-template.git
cd vitepress-theme-components-template

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 下一步

- 📖 阅读 [组件使用指南](/guide/components) 了解所有可用组件
- 🎨 查看 [主题定制指南](/guide/customization) 学习如何定制主题
- 🔧 参考 [开发指南](/guide/development) 了解开发流程
- 📝 查看 [Markdown 扩展](/guide/markdown) 了解扩展语法
