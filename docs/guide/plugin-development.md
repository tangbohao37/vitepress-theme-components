---
hideRecord: true
---

# 插件开发指南

本指南将详细介绍如何为 `vitepress-theme-components` 开发自定义插件和扩展功能。

## 插件架构

### 核心插件系统

主题的插件系统基于 VitePress 的 Markdown 渲染器扩展：

```typescript
// src/plugins/index.ts
export function demoBlockPlugin(md: MarkdownRenderer) {
  const addRenderRule = (type: string) => {
    const defaultRender = md.renderer.rules[type];
    
    md.renderer.rules[type] = (tokens, idx, options, env, self) => {
      // 自定义渲染逻辑
      return defaultRender(tokens, idx, options, env, self);
    };
  };
  
  addRenderRule('html_inline');
}
```

### 插件注册

插件在 `base-config.ts` 中注册：

```typescript
// src/base-config.ts
const baseConfig = defineConfig({
  markdown: {
    config(md) {
      md.use(demoBlockPlugin).use(taskLists);
    }
  }
});
```

## 自定义组件插件

### 1. 创建组件解析器

```typescript
const CustomComponentTag = 'CustomComponent';

const customComponentRender = (tokens, idx, options, env, self, content) => {
  // 解析组件属性
  const props = parseProps<CustomProps>(content);
  
  // 处理组件逻辑
  const processedData = processCustomComponent(props, env);
  
  // 返回渲染结果
  return `<${CustomComponentTag} :data="${processedData}"></${CustomComponentTag}>`;
};
```

### 2. 注册渲染规则

```typescript
export function customComponentPlugin(md: MarkdownRenderer) {
  const addRenderRule = (type: string) => {
    const defaultRender = md.renderer.rules[type];

    md.renderer.rules[type] = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      const content = token.content.trim();
      
      const customComponentReg = new RegExp(`^<${CustomComponentTag}\\s`);
      if (customComponentReg.test(content)) {
        try {
          return customComponentRender(tokens, idx, options, env, self, content);
        } catch (error) {
          console.error('Custom component render error:', error);
          return defaultRender(tokens, idx, options, env, self);
        }
      }
      
      return defaultRender(tokens, idx, options, env, self);
    };
  };
  
  addRenderRule('html_inline');
}
```

## LiveEditor 插件详解

### 核心功能

LiveEditor 插件是主题的核心功能，它实现了：

1. **代码文件解析**：从指定路径读取 React 代码
2. **Import 语句处理**：提取和重组 import 语句
3. **作用域注入**：将依赖注入到 Vue 组件中
4. **实时编译**：支持代码的实时编辑和预览

### 实现原理

#### 1. 文件读取和解析

```typescript
const getFileStatement = (mdFilePath: string, sourceCodePath: string) => {
  const codeFilePath = path.resolve(mdFilePath, sourceCodePath);
  const fileExists = fs.existsSync(codeFilePath);
  
  if (!fileExists) {
    console.log(`${sourceCodePath} 未找到原文件!`);
    return;
  }

  const sourceFileStr = fs.readFileSync(codeFilePath, 'utf-8');
  const demoImportCode = filterJSXComments(sourceFileStr)?.match(importRegex);
  
  return {
    sourceFileStr: sourceFileStr.replaceAll('"', "'"),
    demoImportCodeArr: demoImportCode,
    demoImportCodeStr: demoImportCode?.join(os.EOL)
  };
};
```

#### 2. Import 语句重组

```typescript
const importStatementObj = (code: string) => {
  const importRecord: Record<string, any> = {};
  const directImportRecord = [];
  
  const importPattern = /import\s+([\w*{}\s,]+)\s+from\s+['"]([^'"]+)['"]/gms;
  
  let importMatches;
  while ((importMatches = importPattern.exec(code)) !== null) {
    const importText = importMatches[1].trim();
    const moduleText = importMatches[2].trim();
    
    // 处理不同类型的 import 语句
    const pattern = /[{}]/;
    const hasBrace = pattern.test(importText);
    const _import = importText.split(',').map((i) => {
      if (hasBrace) {
        return `{ ${i.replace(/[{}]/g, '').trim()} }`;
      }
      return i.trim();
    });
    
    _import.forEach((_i) => {
      importRecord[_i] = moduleText;
    });
  }
  
  return { importRecord, directImportRecord };
};
```

#### 3. 作用域提取

```typescript
const getImportModules = (ast: ParseResult<any>) => {
  const importModules = new Set<string>();
  
  traverse.default(ast, {
    Identifier(path: NodePath<any>) {
      if (
        path.parent.type === 'ImportDefaultSpecifier' ||
        path.parent.type === 'ImportSpecifier' ||
        path.parent.type === 'ImportNamespaceSpecifier'
      ) {
        importModules.add(path.node.name);
      }
    }
  });

  return Array.from(importModules.keys());
};
```

## Mermaid 插件详解

### 图表渲染

```typescript
const renderMermaid = (md: MarkdownRenderer) => {
  const defaultRenderer = md.renderer.rules.fence;

  md.renderer.rules.fence = (tokens, index, options, env, slf) => {
    const token = tokens[index];
    const language = token.info.trim();
    
    if (language.startsWith('mermaid')) {
      const key = index;
      return `
        <Suspense> 
          <template #default>
            <Mermaid 
              id="mermaid-${key}" 
              :showCode="${language === 'mermaid-example'}" 
              graph="${encodeURIComponent(token.content)}"
            ></Mermaid>
          </template>
          <template #fallback>
            Loading...
          </template>
        </Suspense>
      `;
    }
    
    return defaultRenderer(tokens, index, options, env, slf);
  };
};
```

## 开发自定义插件

### 1. 创建插件文件

```typescript
// plugins/my-custom-plugin.ts
import { type MarkdownRenderer } from 'vitepress';

export function myCustomPlugin(md: MarkdownRenderer) {
  // 插件实现
}
```

### 2. 实现插件逻辑

```typescript
export function myCustomPlugin(md: MarkdownRenderer) {
  const defaultRenderer = md.renderer.rules.fence;

  md.renderer.rules.fence = (tokens, index, options, env, slf) => {
    const token = tokens[index];
    const language = token.info.trim();
    
    if (language === 'my-custom-lang') {
      // 自定义处理逻辑
      return `<div class="my-custom-block">${token.content}</div>`;
    }
    
    return defaultRenderer(tokens, index, options, env, slf);
  };
}
```

### 3. 注册插件

```typescript
// .vitepress/config.ts
import { myCustomPlugin } from './plugins/my-custom-plugin';

export default defineConfig({
  markdown: {
    config(md) {
      md.use(myCustomPlugin);
    }
  }
});
```

## 高级插件开发

### 1. 状态管理

```typescript
interface PluginState {
  cache: Map<string, any>;
  config: PluginConfig;
}

const pluginState: PluginState = {
  cache: new Map(),
  config: {}
};

export function statefulPlugin(md: MarkdownRenderer) {
  // 使用状态
  const getCachedData = (key: string) => {
    return pluginState.cache.get(key);
  };
  
  const setCachedData = (key: string, value: any) => {
    pluginState.cache.set(key, value);
  };
}
```

### 2. 异步处理

```typescript
export function asyncPlugin(md: MarkdownRenderer) {
  // 注意：markdown-it 不支持异步渲染
  // 需要在构建时预处理异步数据
  
  const preProcessAsync = async (content: string) => {
    // 异步处理逻辑
    const result = await someAsyncOperation(content);
    return result;
  };
}
```

### 3. 错误处理

```typescript
export function robustPlugin(md: MarkdownRenderer) {
  const safeRender = (renderFn: Function) => {
    return (...args: any[]) => {
      try {
        return renderFn(...args);
      } catch (error) {
        console.error('Plugin render error:', error);
        return `<div class="plugin-error">渲染错误: ${error.message}</div>`;
      }
    };
  };
  
  md.renderer.rules.html_inline = safeRender(customRenderFunction);
}
```

## 插件测试

### 1. 单元测试

```typescript
// __tests__/plugin.test.ts
import { describe, it, expect } from 'vitest';
import MarkdownIt from 'markdown-it';
import { myCustomPlugin } from '../plugins/my-custom-plugin';

describe('MyCustomPlugin', () => {
  it('should render custom blocks correctly', () => {
    const md = new MarkdownIt();
    md.use(myCustomPlugin);
    
    const result = md.render('```my-custom-lang\ntest content\n```');
    expect(result).toContain('my-custom-block');
  });
});
```

### 2. 集成测试

```typescript
// __tests__/integration.test.ts
import { createVitePress } from 'vitepress';

describe('Plugin Integration', () => {
  it('should work with VitePress', async () => {
    const app = await createVitePress({
      markdown: {
        config(md) {
          md.use(myCustomPlugin);
        }
      }
    });
    
    // 测试集成功能
  });
});
```

## 最佳实践

### 1. 性能优化

- **缓存机制**：对重复计算的结果进行缓存
- **懒加载**：大型资源使用懒加载
- **错误边界**：添加适当的错误处理

### 2. 兼容性

- **向后兼容**：保持 API 的向后兼容性
- **渐进增强**：功能应该是渐进增强的
- **降级处理**：在不支持的环境中提供降级方案

### 3. 文档

- **API 文档**：详细的 API 文档
- **示例代码**：提供完整的示例
- **迁移指南**：版本升级的迁移指南

## 插件生态

### 官方插件

- **demoBlockPlugin**: 核心演示插件
- **taskListPlugin**: 任务列表支持
- **mermaidPlugin**: 图表渲染支持

### 社区插件

欢迎社区贡献更多插件：

- 代码高亮插件
- 数学公式插件
- 图片优化插件
- SEO 优化插件

## 贡献插件

### 1. 插件规范

- 遵循命名约定
- 提供完整的类型定义
- 包含测试用例
- 提供使用文档

### 2. 提交流程

1. Fork 项目
2. 创建插件分支
3. 实现插件功能
4. 添加测试和文档
5. 提交 Pull Request

### 3. 插件发布

```bash
# 构建插件
pnpm build:plugins

# 发布到 npm
npm publish --access public
```

通过这个插件开发指南，你可以创建强大的自定义插件来扩展主题的功能。
