# Sandpack 本地组件支持

本文档说明 `vitepress-theme-components` 如何支持在 Sandpack 中使用本地编译后的组件库。

## 概述

`vitepress-theme-components` 是一个通用的 VitePress 主题框架，提供了在文档中展示交互式代码示例的能力。通过 Sandpack 集成，用户可以在文档中直接运行和编辑代码。

本次更新增加了**本地组件库支持**，允许使用方（如 `@atome/design`）在 Sandpack 中使用本地编译后的组件，而无需发布到 npm。

## 设计原则

1. **通用性**: 不硬编码任何特定组件库的配置
2. **可配置**: 所有路径和配置由使用方提供
3. **灵活性**: 支持多种使用方式和场景
4. **类型安全**: 提供完整的 TypeScript 类型定义

## 核心功能

### 1. SandpackEditor 组件增强

位置：`src/components/sandpack-editor.vue`

新增 Props：

```typescript
interface SandpackEditorProps {
  code: string;
  files?: Record<string, string>;
  defaultExpanded?: boolean;
  readOnly?: boolean;
  
  // 新增
  virtualFiles?: Record<string, string>;      // 虚拟文件系统
  dependencies?: Record<string, string>;      // 自定义依赖
  externalResources?: string[];               // 外部资源
}
```

### 2. LocalComponentLoader 工具类

位置：`src/utils/local-component-loader.ts`

提供本地组件加载和路径转换功能：

```typescript
export interface LocalComponentLoaderConfig {
  componentLibraryAlias: string;    // Vite alias 名称
  packageName: string;               // npm 包名
  includePatterns?: string[];        // 包含的文件模式
  excludePatterns?: string[];        // 排除的文件模式
  exports?: Array<{                  // 导出配置
    componentName: string;
    importPath: string;
  }>;
  styleFiles?: string[];             // 样式文件
}

export class LocalComponentLoader {
  constructor(config: LocalComponentLoaderConfig);
  
  getGlobPatterns(): string[];
  transformPath(originalPath: string): string;
  generateEntryFile(): string;
  generateStyleFile(): string;
}
```

### 3. 辅助函数

```typescript
// 处理 import.meta.glob 返回的模块
export function processGlobModules(
  modules: Record<string, any>,
  loader: LocalComponentLoader
): Record<string, string>;

// 创建完整的虚拟文件系统
export function createVirtualFileSystem(
  modules: Record<string, any>,
  loader: LocalComponentLoader
): Record<string, string>;
```

## 使用方式

### 在组件库项目中配置

以 `@atome/design` 为例：

#### 1. 配置 Vite Alias

```typescript
// .vitepress/config/index.ts
export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '~atome-design': path.resolve(__dirname, '../../es'),
      },
    },
  },
});
```

#### 2. 创建 Sandpack 配置

```typescript
// .vitepress/sandpack-config.ts
import { LocalComponentLoader } from 'vitepress-theme-components';

export const atomeDesignConfig = {
  componentLibraryAlias: '~atome-design',
  packageName: '@atome/design',
  includePatterns: ['**/*.js', '**/*.css'],
  exports: [
    { componentName: 'Button', importPath: '/button/index.js' },
    // ...
  ],
  styleFiles: ['/_style/index.css'],
};

export const atomeLoader = new LocalComponentLoader(atomeDesignConfig);
```

#### 3. 在文档中使用

```vue
<script setup>
import { createVirtualFileSystem } from 'vitepress-theme-components';
import { atomeLoader } from '../../.vitepress/sandpack-config';

// 加载本地组件
const modules = import.meta.glob('~atome-design/**/*.{js,css}', { 
  as: 'raw', 
  eager: true 
});

// 创建虚拟文件系统
const virtualFiles = createVirtualFileSystem(modules, atomeLoader);

const code = `
import { Button } from '@atome/design';
import '@atome/design/style';

const App = () => <Button>Click Me</Button>;
export default App;
`;
</script>

<SandpackEditor 
  :code="code"
  :virtual-files="virtualFiles"
  :dependencies="{ 'ahooks': '^3.7.8' }"
/>
```

## 技术实现

### 路径映射流程

1. **开发时**: `~atome-design/button/index.js` (Vite alias)
2. **加载时**: `import.meta.glob('~atome-design/**/*.js')` 获取文件内容
3. **转换时**: `LocalComponentLoader.transformPath()` 转换为 `/node_modules/@atome/design/button/index.js`
4. **运行时**: Sandpack 将其视为 npm 包中的文件

### 虚拟文件系统结构

```
/node_modules/@atome/design/
  ├── index.js              # 自动生成的入口文件
  ├── style.js              # 自动生成的样式文件
  ├── button/
  │   ├── index.js
  │   └── style/
  │       └── index.module.css
  ├── input/
  │   └── index.js
  └── _style/
      ├── index.css
      └── dist.css
```

## API 文档

### SandpackEditor Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| code | string | - | 主文件代码（必需） |
| files | Record<string, string> | - | 额外文件 |
| virtualFiles | Record<string, string> | - | 虚拟文件系统（本地组件） |
| dependencies | Record<string, string> | - | 自定义依赖 |
| externalResources | string[] | - | 外部资源 |
| defaultExpanded | boolean | false | 默认展开编辑器 |
| readOnly | boolean | false | 只读模式 |

### LocalComponentLoader 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| getGlobPatterns | - | string[] | 获取 glob 模式数组 |
| transformPath | originalPath: string | string | 转换路径到虚拟路径 |
| generateEntryFile | - | string | 生成入口文件内容 |
| generateStyleFile | - | string | 生成样式文件内容 |

## 优势

1. ✅ **无需发布**: 直接使用本地编译产物
2. ✅ **实时更新**: 修改组件后重新编译即可
3. ✅ **完全离线**: 不依赖网络和 npm
4. ✅ **类型安全**: 保留 TypeScript 类型
5. ✅ **通用方案**: 适用于任何组件库

## 限制

1. `import.meta.glob` 必须在使用方调用（Vite 限制）
2. 路径必须是静态字符串（不能动态拼接）
3. 需要在 VitePress 配置中定义 Vite alias

## 示例项目

参考 `@atome/design` 项目的实现：

- 配置文件：`.vitepress/config/index.ts`
- Sandpack 配置：`.vitepress/sandpack-config.ts`
- 辅助函数：`.vitepress/utils/create-sandpack-demo.ts`
- 示例文档：`docs/components/button/sandpack-demo.md`

## 版本历史

- v0.0.2-beta.36: 添加本地组件支持
  - 新增 `LocalComponentLoader` 工具类
  - 增强 `SandpackEditor` 组件
  - 导出辅助函数

## 贡献

欢迎提交 Issue 和 Pull Request！

