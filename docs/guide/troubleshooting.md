---
hideRecord: true
---

# 故障排除指南

本指南收集了使用 `vitepress-theme-components` 时可能遇到的常见问题及其解决方案。

## 安装问题

### 依赖安装失败

**问题**: 安装主题时出现依赖冲突或安装失败。

**解决方案**:

1. 清理缓存并重新安装：

```bash
# 删除 node_modules 和锁文件
rm -rf node_modules package-lock.json pnpm-lock.yaml yarn.lock

# 重新安装
pnpm install
```

2. 检查 Node.js 版本：

```bash
node --version  # 需要 >= 18.0.0
```

3. 手动安装必需依赖：

```bash
pnpm add veaury semver markdown-it sucrase
```

### 类型定义错误

**问题**: TypeScript 报告找不到类型定义。

```
Cannot find module 'vitepress-theme-components' or its corresponding type declarations.
```

**解决方案**:

1. 确保安装了类型定义：

```bash
pnpm add -D @types/node @types/react @types/react-dom
```

2. 在 `tsconfig.json` 中添加类型引用：

```json
{
  "compilerOptions": {
    "types": ["vitepress-theme-components"]
  }
}
```

## 配置问题

### 主题不生效

**问题**: 配置了主题但页面显示仍为默认样式。

**解决方案**:

1. 检查主题引入是否正确：

```typescript
// .vitepress/theme/index.ts
import theme from 'vitepress-theme-components';

export default theme; // 确保正确导出
```

2. 检查配置文件：

```typescript
// .vitepress/config.ts
import { baseConfig } from 'vitepress-theme-components/config';

export default defineConfig({
  extends: baseConfig, // 确保继承基础配置
  // ...
});
```

3. 重启开发服务器：

```bash
pnpm dev
```

### 基础配置冲突

**问题**: 与现有 VitePress 配置冲突。

**解决方案**:

1. 使用深度合并配置：

```typescript
import { mergeConfig } from 'vite';
import { baseConfig } from 'vitepress-theme-components/config';

export default defineConfig(
  mergeConfig(baseConfig, {
    // 你的自定义配置
    vite: {
      // 自定义 Vite 配置
    }
  })
);
```

2. 选择性继承配置：

```typescript
export default defineConfig({
  markdown: baseConfig.markdown,
  vite: {
    ...baseConfig.vite,
    // 你的自定义配置
  }
});
```

## 组件问题

### LiveEditor 不显示

**问题**: `<LiveEditor>` 组件不渲染或显示空白。

**解决方案**:

1. 检查文件路径是否正确：

```md
<!-- 确保路径相对于当前 Markdown 文件 -->
<LiveEditor sourceCodePath="../demo/example/button.jsx"></LiveEditor>
```

2. 检查演示文件是否存在：

```bash
ls docs/demo/example/button.jsx
```

3. 检查演示文件语法：

```jsx
// 确保文件以 render() 调用结尾
import { Button } from '@arco-design/web-react';

const Example = () => {
  return <Button>Hello</Button>;
};

render(<Example />); // 必需的
```

4. 检查控制台错误信息：

打开浏览器开发者工具，查看是否有 JavaScript 错误。

### 代码编辑器无法加载

**问题**: Monaco Editor 无法正常加载或显示。

**解决方案**:

1. 检查网络连接和 CDN 可用性。

2. 配置本地 Monaco Editor：

```typescript
// .vitepress/config.ts
export default defineConfig({
  vite: {
    optimizeDeps: {
      include: ['monaco-editor']
    }
  }
});
```

3. 如果使用代理，配置代理规则：

```typescript
export default defineConfig({
  vite: {
    server: {
      proxy: {
        '/monaco-editor': {
          target: 'https://cdn.jsdelivr.net',
          changeOrigin: true
        }
      }
    }
  }
});
```

### React 组件渲染错误

**问题**: React 组件在 Vue 环境中渲染失败。

**解决方案**:

1. 检查 React 版本兼容性：

```json
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

2. 确保正确的 JSX 语法：

```jsx
// 正确
const Component = () => {
  return <div>Hello</div>;
};

// 错误 - 缺少 JSX 转换
const Component = () => {
  return React.createElement('div', null, 'Hello');
};
```

3. 检查作用域注入：

```jsx
// 确保所有使用的组件都已导入
import { Button, Input } from '@arco-design/web-react';

const Example = () => {
  return (
    <div>
      <Button>按钮</Button>
      <Input placeholder="输入框" />
    </div>
  );
};
```

## API 文档问题

### ApiTable 无法生成文档

**问题**: `<ApiTable>` 组件不显示或显示错误。

**解决方案**:

1. 检查 TypeScript 文件路径：

```md
<!-- 确保路径正确 -->
<ApiTable path="../demo/example/button.tsx"></ApiTable>
```

2. 确保 TypeScript 文件有正确的类型导出：

```typescript
// button.tsx
export interface ButtonProps {
  /** 按钮类型 */
  type?: 'primary' | 'secondary';
  /** 按钮大小 */
  size?: 'small' | 'medium' | 'large';
  /** 点击事件 */
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = (props) => {
  // 组件实现
};
```

3. 检查 `react-docgen-typescript` 配置：

```typescript
// 如果需要自定义解析选项
const opts: docgen.ParserOptions = {
  savePropValueAsString: true,
  skipChildrenPropWithoutDoc: false
};
```

### 类型解析不完整

**问题**: 复杂类型无法正确解析。

**解决方案**:

1. 简化类型定义：

```typescript
// 避免过于复杂的类型
type ComplexType = {
  [K in keyof SomeInterface]: SomeInterface[K] extends string ? boolean : never;
};

// 使用更直接的类型定义
interface SimpleType {
  prop1: string;
  prop2: boolean;
}
```

2. 添加 JSDoc 注释：

```typescript
export interface ButtonProps {
  /**
   * 按钮类型
   * @default 'primary'
   */
  type?: 'primary' | 'secondary';
}
```

## 构建问题

### 构建失败

**问题**: 执行 `pnpm build` 时出现错误。

**解决方案**:

1. 检查 TypeScript 错误：

```bash
pnpm build:tsc
```

2. 检查插件构建：

```bash
pnpm build:plugins
```

3. 清理构建缓存：

```bash
rm -rf lib/ .vitepress/cache/
pnpm build
```

### 类型生成失败

**问题**: 类型定义文件生成失败。

**解决方案**:

1. 检查 `tsconfig.json` 配置：

```json
{
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "lib"]
}
```

2. 手动运行类型生成：

```bash
node scripts/build-types.js
```

## 性能问题

### 页面加载缓慢

**问题**: 文档页面加载速度慢。

**解决方案**:

1. 启用代码分割：

```typescript
export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'monaco-editor': ['monaco-editor'],
            'react-live': ['react-live']
          }
        }
      }
    }
  }
});
```

2. 使用 CDN 加载大型依赖：

```typescript
export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        external: ['react', 'react-dom'],
        output: {
          globals: {
            'react': 'React',
            'react-dom': 'ReactDOM'
          }
        }
      }
    }
  }
});
```

3. 启用 Gzip 压缩：

```typescript
import { defineConfig } from 'vitepress';
import { compression } from 'vite-plugin-compression';

export default defineConfig({
  vite: {
    plugins: [compression()]
  }
});
```

### 内存占用过高

**问题**: 开发或构建时内存占用过高。

**解决方案**:

1. 增加 Node.js 内存限制：

```bash
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm dev
```

2. 减少并发构建任务：

```json
{
  "scripts": {
    "build": "run-s build:plugins build:types build:tsc"
  }
}
```

## 样式问题

### 样式冲突

**问题**: 主题样式与自定义样式冲突。

**解决方案**:

1. 使用 CSS 变量覆盖：

```css
:root {
  --vp-c-brand-1: #your-color;
}
```

2. 提高样式优先级：

```css
.vp-doc .your-component {
  /* 你的样式 */
}
```

3. 使用 `!important`（谨慎使用）：

```css
.your-component {
  color: red !important;
}
```

### 暗色主题问题

**问题**: 暗色主题下样式异常。

**解决方案**:

1. 为暗色主题添加专门的样式：

```css
.dark .your-component {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}
```

2. 使用主题感知的 CSS 变量：

```css
.your-component {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
}
```

## 移动端问题

### 移动端适配问题

**问题**: 在移动设备上显示异常。

**解决方案**:

1. 添加响应式样式：

```css
@media (max-width: 768px) {
  .live-editor {
    padding: 12px;
  }
  
  .monaco-editor {
    height: 300px;
  }
}
```

2. 配置视口：

```typescript
export default defineConfig({
  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }]
  ]
});
```

## 调试技巧

### 启用调试模式

```bash
DEBUG=vitepress:* pnpm dev
```

### 查看构建详情

```bash
pnpm build --debug
```

### 分析包大小

```bash
pnpm add -D rollup-plugin-visualizer

# 在 vite 配置中添加
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  vite: {
    plugins: [
      visualizer({
        filename: 'dist/stats.html',
        open: true
      })
    ]
  }
});
```

## 获取帮助

如果以上解决方案都无法解决你的问题，可以通过以下方式获取帮助：

1. **GitHub Issues**: [提交问题](https://github.com/tangbohao37/vitepress-theme-components/issues)
2. **讨论区**: [GitHub Discussions](https://github.com/tangbohao37/vitepress-theme-components/discussions)
3. **查看示例**: [在线演示](https://tangbohao37.github.io/vitepress-theme-components/)

### 提交问题时请包含

- 操作系统和版本
- Node.js 版本
- 包管理器版本（pnpm/npm/yarn）
- 主题版本
- 完整的错误信息
- 最小复现代码

这将帮助我们更快地定位和解决问题。
