---
hideRecord: true
---

# 开发指南

本指南将帮助你了解如何参与 `vitepress-theme-components` 的开发，包括项目结构、开发流程和贡献方式。

## 项目结构

```
vitepress-theme-components/
├── src/                          # 源代码目录
│   ├── components/              # Vue 组件
│   │   ├── live-editor.vue     # 实时代码编辑器
│   │   ├── dynamic-layout.vue  # 动态布局组件
│   │   ├── api-table.vue       # API 文档表格
│   │   └── ...
│   ├── react-components/        # React 组件
│   │   ├── react-live.tsx      # React Live 封装
│   │   └── index.tsx
│   ├── plugins/                 # VitePress 插件
│   │   └── index.ts            # Markdown 插件
│   ├── types/                   # TypeScript 类型定义
│   │   └── index.ts
│   ├── constant/                # 常量定义
│   │   └── index.ts
│   ├── base-config.ts          # 基础配置
│   └── index.ts                # 主入口文件
├── lib/                         # 构建输出目录
├── docs/                        # 文档站点
│   ├── demo/                   # 演示页面
│   │   ├── example/            # 演示代码
│   │   └── *.md               # 组件演示页面
│   ├── guide/                  # 使用指南
│   └── .vitepress/            # VitePress 配置
├── scripts/                     # 构建脚本
└── package.json
```

## 技术栈

### 核心技术

- **VitePress**: 文档站点生成器
- **Vue 3**: 主题组件框架
- **React**: 演示组件支持
- **TypeScript**: 类型安全
- **Vite**: 构建工具

### 关键依赖

- **veaury**: React 与 Vue 组件互操作
- **react-live**: React 代码实时编辑
- **naive-ui**: Vue UI 组件库
- **@guolao/vue-monaco-editor**: 代码编辑器
- **mermaid**: 图表渲染
- **react-docgen-typescript**: TypeScript API 文档生成

## 开发环境搭建

### 1. 克隆项目

```bash
git clone https://github.com/tangbohao37/vitepress-theme-components.git
cd vitepress-theme-components
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm dev
```

这个命令会同时启动：
- 库文件构建监听 (`pnpm dev:plugins`, `pnpm dev:tsc`, `pnpm dev:types`)
- 文档站点开发服务器 (`pnpm dev:site`)

### 4. 访问开发站点

打开浏览器访问 `http://localhost:5173`

## 构建流程

### 开发构建

```bash
# 启动所有开发任务
pnpm dev

# 单独启动某个任务
pnpm dev:plugins  # 插件构建监听
pnpm dev:tsc      # TypeScript 编译监听
pnpm dev:types    # 类型定义生成监听
pnpm dev:site     # 文档站点开发服务器
```

### 生产构建

```bash
# 构建库文件
pnpm build:lib

# 构建文档站点
pnpm build:site

# 构建所有
pnpm build
```

### 构建详解

1. **插件构建** (`build:plugins`): 使用 SWC 编译 TypeScript/JSX 代码
2. **类型生成** (`build:types`): 使用自定义脚本生成类型定义文件
3. **TypeScript 编译** (`build:tsc`): 使用 vue-tsc 进行类型检查和编译

## 核心架构

### 主题系统

主题基于 VitePress 的主题系统构建：

```typescript
// src/index.ts
const theme: Theme = {
  Layout: DynamicLayout,  // 动态布局组件
  enhanceApp(ctx) {
    // 注册全局组件
    ctx.app.component('LiveEditor', LiveEditor);
    ctx.app.component('DrawerLiveEditor', DrawerLiveEditor);
    ctx.app.component('MobileIframe', MobileIframe);
    ctx.app.component('ApiTable', ApiTable);
    ctx.app.component('Mermaid', Mermaid);
  }
};
```

### 插件系统

Markdown 插件负责解析自定义组件：

```typescript
// src/plugins/index.ts
export function demoBlockPlugin(md: MarkdownRenderer) {
  // 处理 LiveEditor 组件
  // 处理 ApiTable 组件
  // 处理 Mermaid 图表
}
```

### React 集成

通过 `veaury` 实现 React 组件在 Vue 中的使用：

```typescript
// src/components/live-editor.vue
import { applyReactInVue } from 'veaury';
const ReactLivePreview = applyReactInVue(ReactLive);
```

## 开发规范

### 代码风格

项目使用 ESLint 和 Prettier 进行代码规范化：

```bash
# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

### 提交规范

使用 Conventional Commits 规范：

```bash
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 组件开发

#### Vue 组件开发

```vue
<template>
  <div class="component-wrapper">
    <!-- 组件内容 -->
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

interface Props {
  // 定义属性类型
}

const props = defineProps<Props>();
</script>

<style scoped>
.component-wrapper {
  /* 组件样式 */
}
</style>
```

#### React 组件开发

```tsx
import { FC } from 'react';

interface Props {
  // 定义属性类型
}

export const Component: FC<Props> = ({ ...props }) => {
  return (
    <div className="component-wrapper">
      {/* 组件内容 */}
    </div>
  );
};
```

### 类型定义

所有类型定义统一放在 `src/types/index.ts`：

```typescript
export interface ComponentProps {
  // 属性定义
}

export type ThemeConfig = {
  // 配置类型
}
```

## 测试

### 单元测试

```bash
# 运行测试
pnpm test

# 测试覆盖率
pnpm test:coverage
```

### 集成测试

```bash
# 构建测试
pnpm build

# 预览测试
pnpm preview
```

## 发布流程

### 版本管理

项目使用 `standard-version` 进行版本管理：

```bash
# 发布 beta 版本
pnpm version

# 手动指定版本
pnpm dlx standard-version --release-as 1.0.0
```

### 发布到 npm

```bash
# 构建生产版本
pnpm build:lib

# 发布
npm publish
```

## 贡献指南

### 1. Fork 项目

在 GitHub 上 Fork 项目到你的账户下。

### 2. 创建分支

```bash
git checkout -b feature/your-feature-name
```

### 3. 开发功能

- 遵循代码规范
- 添加必要的测试
- 更新相关文档

### 4. 提交代码

```bash
git add .
git commit -m "feat: add your feature"
```

### 5. 推送分支

```bash
git push origin feature/your-feature-name
```

### 6. 创建 Pull Request

在 GitHub 上创建 Pull Request，描述你的更改。

## 常见问题

### 1. 依赖问题

由于 Vite 的限制，某些依赖需要手动安装：

```bash
pnpm add veaury semver markdown-it sucrase
```

### 2. 类型错误

确保安装了正确的类型定义：

```bash
pnpm add -D @types/node @types/react @types/react-dom
```

### 3. 构建失败

检查 TypeScript 配置和依赖版本：

```bash
pnpm build:tsc
```

### 4. 热更新问题

重启开发服务器：

```bash
pnpm dev
```

## 路线图

### 短期目标

- [ ] 完善 API 文档生成
- [ ] 优化移动端适配
- [ ] 增加更多图表类型支持

### 长期目标

- [ ] 支持 Vue 组件演示
- [ ] 增加主题定制功能
- [ ] 支持多语言文档
- [ ] 集成 Storybook

## 获取帮助

- **GitHub Issues**: [提交问题](https://github.com/tangbohao37/vitepress-theme-components/issues)
- **讨论区**: [GitHub Discussions](https://github.com/tangbohao37/vitepress-theme-components/discussions)
- **文档**: [在线文档](https://tangbohao37.github.io/vitepress-theme-components/)
