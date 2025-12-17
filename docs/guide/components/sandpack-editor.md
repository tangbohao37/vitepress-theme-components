# SandpackEditor - 在线代码编辑器

`SandpackEditor` 是基于 [Sandpack](https://sandpack.codesandbox.io/) 的在线代码编辑器，专为移动端应用演示设计。它提供真实的设备预览框架、完整的 npm 依赖支持，以及自动化的多文件项目管理能力。

## 基础用法

将 React 代码文件放在 `docs/public/example/` 目录下，然后在文档中引用：

```md
<SandpackEditor path="button.jsx"></SandpackEditor>
```

::: tip 文件路径要求
- 代码文件必须放在 `docs/public/example/` 目录（默认）
- `path` 属性只需提供文件名，不需要完整路径
- 支持的文件类型：`.js`、`.jsx`、`.ts`、`.tsx`
- 可通过配置 `exampleDir` 自定义示例文件目录
:::

## 配置示例目录

在 VitePress 配置文件中，可以自定义示例文件的目录：

```ts
// docs/.vitepress/config.ts
import { defineConfig } from 'vitepress';
import { type AdvThemeConfig } from 'vitepress-theme-components';

export default defineConfig<AdvThemeConfig>({
  themeConfig: {
    // 配置示例文件目录（相对于 public 目录）
    exampleDir: '/example/',  // 默认值
    // 或者使用其他目录
    // exampleDir: '/demos/',
    // exampleDir: '/code-samples/',
  }
});
```

::: info 目录说明
- `exampleDir` 配置相对于 `docs/public/` 目录
- 默认值为 `/example/`
- 路径会自动标准化（确保以 `/` 开头和结尾）
- 示例文件实际位置：`docs/public/{exampleDir}/`
:::

### 自定义目录示例

如果配置了 `exampleDir: '/demos/'`：

```
docs/
├── public/
│   └── demos/              # 自定义的示例目录
│       ├── button.jsx
│       └── counter.jsx
└── demo/
    └── button.md           # 文档文件
```

在文档中使用：

```md
<!-- 会从 docs/public/demos/ 目录加载 -->
<SandpackEditor path="button.jsx"></SandpackEditor>
```

## API 参数

| 参数            | 说明                                      | 类型      | 默认值  |
| --------------- | ----------------------------------------- | --------- | ------- |
| `path`          | example 目录下的文件路径，如 `"button.jsx"` | `string`  | **必填** |
| `defaultExpanded` | 是否默认展开代码编辑器                       | `boolean` | `false` |
| `readOnly`      | 是否为只读模式，使用 SandpackCodeViewer 组件 | `boolean` | `false` |

### 参数详解

#### path（必填）

指定要加载的代码文件名：

```md
<!-- ✅ 正确：只需文件名 -->
<SandpackEditor path="button.jsx"></SandpackEditor>

<!-- ❌ 错误：不要包含路径 -->
<SandpackEditor path="/public/example/button.jsx"></SandpackEditor>
<SandpackEditor path="../public/example/button.jsx"></SandpackEditor>
```

#### defaultExpanded

控制编辑器的初始状态：

```md
<!-- 默认收起编辑器，只显示预览 -->
<SandpackEditor path="button.jsx"></SandpackEditor>

<!-- 默认展开编辑器，同时显示代码和预览 -->
<SandpackEditor path="button.jsx" defaultExpanded></SandpackEditor>
```

::: tip 性能建议
默认收起编辑器可以减少页面加载时的计算量，提升性能。只在需要让用户立即看到代码时才使用 `defaultExpanded`。
:::

#### readOnly

切换编辑器为只读查看模式：

```md
<!-- 可编辑模式：使用 SandpackCodeEditor -->
<SandpackEditor path="button.jsx"></SandpackEditor>

<!-- 只读模式：使用 SandpackCodeViewer -->
<SandpackEditor path="button.jsx" readOnly></SandpackEditor>
```

只读模式适用场景：
- 展示最佳实践代码
- 参考实现示例
- 教程中的标准答案
- 防止用户误修改示例

## 核心特性

### 1. 移动设备预览框架

内置 iPhone 和 Android 设备框架，提供真实的设备外观：

```vue{30-38}
<template>
  <div class="sandpack-container">
    <SandpackProvider template="react" :files="files" :custom-setup="setup">
      <!-- 预览区域包装器 -->
      <PreviewSectionWrapper
        :is-resizing="isResizing"
        :preview-height="previewHeight"
        :selected-device="selectedDevice"
        @update:selected-device="selectedDevice = $event"
        @set-ref="previewSectionRef = $event"
      />
    </SandpackProvider>
  </div>
</template>
```

设备框架特性：
- **iPhone 框架**：375×812px，包含刘海、状态栏、Home Indicator
- **Android 框架**：360×740px，包含状态栏和虚拟按键区域
- **设备切换**：点击预览区右上角图标切换设备
- **安全区域**：自动为内容添加安全区域内边距
- **真实外观**：设备外壳、屏幕圆角、摄像头等细节

::: info 安全区域适配
预览框架自动处理移动设备的安全区域：
- 顶部避开刘海和状态栏
- 底部避开 Home Indicator
- 内容区域自动添加 `env(safe-area-inset-*)`
:::

### 2. 可调节预览高度

拖动分隔条调整预览区域高度：

```vue{40-52,135-193}
<template>
  <!-- 可拖动的分隔条 -->
  <div
    class="resize-handle"
    @mousedown="startResize"
    @dblclick="resetPreviewHeight"
    :title="'拖动调整预览区域高度，双击重置'"
  >
    <div class="resize-handle-bar">
      <NIcon :size="16">
        <ReorderIcon />
      </NIcon>
    </div>
  </div>
</template>

<script setup>
// 开始调整大小
function startResize(event) {
  event.preventDefault();
  isResizing.value = true;

  const startY = event.clientY;
  const startHeight = previewHeight.value;
  let animationFrameId = null;
  let latestMouseEvent = null;

  const updateHeight = () => {
    if (!latestMouseEvent || !isResizing.value) {
      animationFrameId = null;
      return;
    }

    const deltaY = latestMouseEvent.clientY - startY;
    const newHeight = Math.max(200, Math.min(1000, startHeight + deltaY));
    previewHeight.value = newHeight;

    latestMouseEvent = null;
    animationFrameId = null;
  };

  const onMouseMove = (e) => {
    if (!isResizing.value) return;
    latestMouseEvent = e;

    // 使用 requestAnimationFrame 优化性能 // [!code highlight]
    if (animationFrameId === null) { // [!code highlight]
      animationFrameId = requestAnimationFrame(updateHeight); // [!code highlight]
    } // [!code highlight]
  };

  const onMouseUp = () => {
    isResizing.value = false;
    // ... 清理工作
  };

  document.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseup', onMouseUp);
}

// 重置预览高度
function resetPreviewHeight() {
  previewHeight.value = 600; // 重置为默认高度
}
</script>
```

拖动特性：
- **高度范围**：200px - 1000px
- **双击重置**：双击分隔条恢复默认高度（600px）
- **性能优化**：使用 `requestAnimationFrame` 节流，避免频繁更新
- **视觉反馈**：拖动时显示高亮效果，光标变为 `ns-resize`

::: info 性能优化
拖动调整高度时使用了两项优化技术：
1. **requestAnimationFrame**：确保更新与屏幕刷新同步，避免丢帧
2. **Passive 事件监听**：提升滚动性能，避免阻塞主线程
:::

### 3. 自动依赖加载

智能解析和递归加载相对路径的依赖文件：

```ts{223-242,254-333}
// 解析代码中的 import 语句，提取相对路径的文件
function parseImports(code: string): string[] {
  const imports: string[] = [];
  
  // 匹配 import 语句：import xxx from './xxx' 或 import './xxx'
  const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"](.+?)['"]/g;
  
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const importPath = match[1];
    
    // 只处理相对路径（以 ./ 或 ../ 开头）// [!code highlight]
    if (importPath.startsWith('./') || importPath.startsWith('../')) { // [!code highlight]
      imports.push(importPath); // [!code highlight]
    } // [!code highlight]
  }
  
  return imports;
}

// 递归加载文件及其依赖
async function loadFileWithDependencies(
  filePath: string,
  loadedFiles: Record<string, string> = {},
  visited: Set<string> = new Set()
): Promise<Record<string, string>> {
  const normalizedPath = normalizePath(filePath);
  
  // 避免循环依赖 // [!code highlight]
  if (visited.has(normalizedPath)) { // [!code highlight]
    return loadedFiles; // [!code highlight]
  } // [!code highlight]
  visited.add(normalizedPath);
  
  try {
    const fullPath = `/vitepress-theme-components/example/${normalizedPath}`;
    const response = await fetch(fullPath);
    
    if (!response.ok) {
      console.log(`文件不存在: ${normalizedPath}`);
      return loadedFiles;
    }
    
    const content = await response.text();
    const sandpackPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
    loadedFiles[sandpackPath] = content;
    
    // 只对 JS/JSX/TS/TSX 文件解析依赖
    const ext = normalizedPath.split('.').pop()?.toLowerCase();
    if (ext && ['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
      const imports = parseImports(content);
      
      // 递归加载所有依赖 // [!code highlight]
      for (const importPath of imports) { // [!code highlight]
        let resolvedPath = normalizePath(importPath);
        
        // 如果 import 路径没有扩展名，尝试添加常见扩展名 // [!code highlight]
        if (!resolvedPath.match(/\.\w+$/)) { // [!code highlight]
          const possibleExts = ['js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'less']; // [!code highlight]
          for (const ext of possibleExts) {
            const pathWithExt = `${resolvedPath}.${ext}`;
            // 尝试加载文件
          }
        } // [!code highlight]
        
        // 递归加载依赖文件
        await loadFileWithDependencies(resolvedPath, loadedFiles, visited);
      }
    }
  } catch (err) {
    console.error(`加载文件失败: ${filePath}`, err);
  }
  
  return loadedFiles;
}
```

依赖加载特性：
- **相对路径识别**：只处理 `./` 或 `../` 开头的导入
- **递归加载**：自动加载依赖的依赖
- **扩展名推断**：自动尝试 `.js`、`.jsx`、`.ts`、`.tsx`、`.css` 等扩展名
- **循环依赖检测**：避免无限递归加载
- **详细日志**：控制台输出完整的加载过程

::: info 加载日志示例
```
========================================
开始加载主文件: /vitepress-theme-components/example/mobile-app.jsx
✓ 主文件加载成功
开始解析依赖文件...
发现导入语句: ["./components/header", "./styles.css"]
正在加载文件: /vitepress-theme-components/example/components/header.jsx
✓ 已加载: /components/header.jsx
正在加载文件: /vitepress-theme-components/example/styles.css
✓ 已加载: /styles.css
✓ 所有依赖文件加载完成: ["/components/header.jsx", "/styles.css"]
========================================
```
:::

### 4. 编辑器展开/收起

可折叠的代码编辑器，节省页面空间：

```vue{54-89,129-132}
<template>
  <!-- 代码编辑器区域 -->
  <div class="editor-section">
    <div class="editor-header" @click="toggleEditor">
      <div class="editor-title">
        <NIcon :size="16" class="icon-code">
          <CodeIcon />
        </NIcon>
        <span>{{ props.readOnly ? '查看代码' : '编辑代码' }}</span>
      </div>
      <div class="editor-actions">
        <NButton text>
          <template #icon>
            <NIcon 
              :size="16" 
              class="icon-chevron" 
              :class="{ expanded: isEditorExpanded }"
            >
              <ChevronDownIcon />
            </NIcon>
          </template>
        </NButton>
      </div>
    </div>
    <Transition name="editor-slide">
      <div v-show="isEditorExpanded" class="editor-content">
        <!-- 只读模式：使用 SandpackCodeViewer -->
        <SandpackCodeViewer
          v-if="props.readOnly"
          :show-line-numbers="true"
          :show-tabs="false"
        />
        <!-- 编辑模式：使用 SandpackCodeEditor -->
        <SandpackCodeEditor v-else :show-line-numbers="true" />
      </div>
    </Transition>
  </div>
</template>

<script setup>
// 切换编辑器展开/收起
function toggleEditor() {
  isEditorExpanded.value = !isEditorExpanded.value;
}
</script>

<style scoped>
/* Vue Transition 动画 */
.editor-slide-enter-active,
.editor-slide-leave-active {
  transition: all 0.3s ease;
  max-height: 600px;
  opacity: 1;
}

.editor-slide-enter-from,
.editor-slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
```

交互特性：
- **点击头部切换**：点击编辑器头部任意位置展开/收起
- **平滑动画**：使用 Vue Transition 实现流畅的展开收起效果
- **图标旋转**：箭头图标旋转 180° 指示展开状态
- **悬停反馈**：头部悬停时背景色变化

### 5. 加载和错误状态

使用 Naive UI 组件提供友好的用户反馈：

```vue{3-26}
<template>
  <!-- 加载状态 - 使用 Naive UI NSpin -->
  <div v-if="loading" class="loading">
    <NSpin size="large" description="正在加载示例代码..." />
  </div>

  <!-- 错误状态 - 使用 Naive UI NResult -->
  <div v-else-if="error" class="error-container">
    <NResult
      status="error"
      title="加载失败"
      :description="error"
    >
      <template #footer>
        <NSpace vertical>
          <div class="error-path">
            文件路径：<code>{{ props.path }}</code>
          </div>
          <NButton type="primary" @click="loadCode">
            重试加载
          </NButton>
        </NSpace>
      </template>
    </NResult>
  </div>
</template>
```

状态管理：
- **加载中**：显示 Spin 加载动画和提示文本
- **加载失败**：显示错误信息、文件路径和重试按钮
- **加载成功**：显示 Sandpack 编辑器

::: tip 错误处理
组件会捕获以下错误：
- 文件不存在（404）
- 网络请求失败
- 文件内容解析错误
- 依赖加载失败

所有错误都会显示友好的提示信息。
:::

## 代码文件规范

### 主文件格式

代码文件必须以 `render()` 结尾：

```jsx
import { Button } from '@arco-design/web-react';

const App = () => {
  return (
    <div style={{ padding: 20 }}>
      <Button type="primary">点击我</Button>
    </div>
  );
};

render(<App />);  // 必须以 render() 结尾 // [!code highlight]
```

::: danger 重要
- **不要使用** `export default Component`
- **必须使用** `render(<Component />)`
- 只有被导入的子文件才使用 `export default`
:::

### 多文件项目

支持通过相对路径导入其他文件：

```jsx
// mobile-app.jsx (主文件)
import MyButton from './components/button'   // 自动加载 // [!code highlight]
import './styles/app.css'                    // 自动加载 // [!code highlight]

const App = () => {
  return (
    <div className="app">
      <MyButton>Click Me</MyButton>
    </div>
  );
};

render(<App />);
```

```jsx
// components/button.jsx (依赖文件)
import { Button } from '@arco-design/web-react';

const MyButton = ({ children }) => {
  return <Button type="primary">{children}</Button>;
};

export default MyButton; // 子文件使用 export // [!code highlight]
```

文件组织建议：

```
docs/public/example/
├── mobile-app.jsx        # 主文件
├── components/           # 组件目录
│   ├── header.jsx
│   ├── content.jsx
│   └── footer.jsx
└── styles/              # 样式目录
    ├── app.css
    └── theme.css
```

## 技术实现

### Sandpack 配置

组件使用 Sandpack 的 React 模板，并配置了依赖项：

```ts{200-222}
// 计算属性：生成 Sandpack 文件配置
const files = computed(() => {
  if (!code.value) {
    return {};
  }

  const result: Record<string, string> = {
    '/App.js': code.value,
    // 合并所有额外加载的文件（CSS、其他 JS 等）// [!code highlight]
    ...additionalFiles.value // [!code highlight]
  };
  
  return result;
});

// 计算属性：npm 依赖配置
const setup = computed(() => ({
  dependencies: {
    '@arco-design/web-react': '^2.63.0',
    'react': '^18.2.0',
    'react-dom': '^18.2.0'
  }
}));
```

::: warning npm 依赖限制
当前版本硬编码了以下依赖：
- `@arco-design/web-react`: ^2.63.0
- `react`: ^18.2.0
- `react-dom`: ^18.2.0

如需使用其他 npm 包，需要修改 `setup` 配置。
:::

### 主题适配

自动适配 VitePress 的明暗主题：

```vue{622-630}
<style scoped>
:deep(.cm-gutters) {
  background: var(--vp-c-bg-soft);
  border-right: 1px solid var(--vp-c-divider);
}

:deep(.cm-lineNumbers) {
  color: var(--vp-c-text-3);
}
</style>
```

使用 VitePress 的 CSS 变量确保在主题切换时自动更新样式。

### 设备预览组件

`PreviewSectionWrapper` 组件负责渲染设备框架：

```vue{30-38}
<template>
  <PreviewSectionWrapper
    :is-resizing="isResizing"
    :preview-height="previewHeight"
    :selected-device="selectedDevice"
    @update:selected-device="selectedDevice = $event"
    @set-ref="previewSectionRef = $event"
  />
</template>
```

组件职责：
- 渲染 iPhone 或 Android 设备框架
- 处理设备切换交互
- 管理预览区域的尺寸
- 在设备框架内嵌入 Sandpack 预览

## 使用示例

### 示例 1：简单按钮组件

```jsx
// docs/public/example/button.jsx
import { Button } from '@arco-design/web-react';

const App = () => {
  return (
    <div style={{ padding: 20 }}>
      <Button type="primary">点击我</Button>
    </div>
  );
};

render(<App />);
```

```md
<SandpackEditor path="button.jsx"></SandpackEditor>
```

### 示例 2：带状态的交互组件

```jsx
// docs/public/example/counter.jsx
import { useState } from 'react';
import { Button, Space, Typography } from '@arco-design/web-react';

const App = () => {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: 20 }}>
      <Space direction="vertical" size="large">
        <Typography.Title heading={3}>
          计数器: {count}
        </Typography.Title>
        <Space>
          <Button onClick={() => setCount(count + 1)}>
            增加
          </Button>
          <Button onClick={() => setCount(count - 1)}>
            减少
          </Button>
          <Button onClick={() => setCount(0)}>
            重置
          </Button>
        </Space>
      </Space>
    </div>
  );
};

render(<App />);
```

```md
<SandpackEditor path="counter.jsx" defaultExpanded></SandpackEditor>
```

### 示例 3：多文件移动应用

```jsx
// docs/public/example/mobile-app.jsx
import Header from './components/header'
import Content from './components/content'
import Footer from './components/footer'
import './styles/app.css'

const App = () => {
  return (
    <div className="mobile-app">
      <Header />
      <Content />
      <Footer />
    </div>
  );
};

render(<App />);
```

```jsx
// docs/public/example/components/header.jsx
import { Typography } from '@arco-design/web-react';

const Header = () => {
  return (
    <header className="header">
      <Typography.Title heading={4}>
        我的应用
      </Typography.Title>
    </header>
  );
};

export default Header;
```

```css
/* docs/public/example/styles/app.css */
.mobile-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 16px;
  background: var(--primary-color, #165DFF);
  color: white;
}
```

```md
<SandpackEditor path="mobile-app.jsx"></SandpackEditor>
```

### 示例 4：只读代码查看

```md
<!-- 展示最佳实践代码，不允许编辑 -->
<SandpackEditor path="best-practice.jsx" readOnly defaultExpanded></SandpackEditor>
```

## 最佳实践

### 1. 文件组织

```
docs/public/example/
├── simple-examples/      # 简单示例
│   ├── button.jsx
│   └── input.jsx
├── complex-examples/     # 复杂示例
│   ├── mobile-app.jsx
│   ├── components/
│   │   ├── header.jsx
│   │   └── footer.jsx
│   └── styles/
│       └── app.css
└── shared/              # 共享资源
    ├── utils.js
    └── constants.js
```

### 2. 性能优化

#### 限制组件数量

```md
<!-- ✅ 推荐：一个页面 3-5 个 SandpackEditor -->
# 按钮组件

## 基础用法
<SandpackEditor path="button-basic.jsx"></SandpackEditor>

## 按钮状态
<SandpackEditor path="button-status.jsx"></SandpackEditor>

## 按钮尺寸
<SandpackEditor path="button-size.jsx"></SandpackEditor>
```

```md
<!-- ❌ 避免：一个页面过多实例 -->
# 按钮组件

<!-- 10 个 SandpackEditor... 性能差 -->
```

#### 默认收起编辑器

```md
<!-- ✅ 推荐：默认收起 -->
<SandpackEditor path="complex-app.jsx"></SandpackEditor>

<!-- ⚠️ 谨慎：只在必要时展开 -->
<SandpackEditor path="simple-button.jsx" defaultExpanded></SandpackEditor>
```

#### 拆分大型文件

```jsx
// ❌ 避免：500 行的大文件
// app.jsx (500 lines)

// ✅ 推荐：拆分为多个小文件
// app.jsx (50 lines) - 主文件
// components/header.jsx (100 lines)
// components/content.jsx (150 lines)
// components/footer.jsx (100 lines)
// utils/helpers.js (100 lines)
```

### 3. 移动端适配

```jsx
// 使用安全区域和响应式单位
const App = () => {
  return (
    <div style={{
      padding: '16px',
      paddingTop: 'max(16px, env(safe-area-inset-top))', // 安全区域 // [!code highlight]
      paddingBottom: 'max(16px, env(safe-area-inset-bottom))', // [!code highlight]
      minHeight: '100vh'
    }}>
      <h1 style={{ fontSize: '1.5rem' }}> {/* 响应式单位 */}
        移动应用
      </h1>
    </div>
  );
};

render(<App />);
```

### 4. 错误处理

```jsx
import { useState, useEffect } from 'react';
import { Button, Message } from '@arco-design/web-react';

const App = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('请求失败');
      }
      const result = await response.json();
      setData(result);
      Message.success('加载成功');
    } catch (err) {
      setError(err.message); // [!code highlight]
      Message.error('加载失败：' + err.message); // [!code highlight]
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Button onClick={fetchData}>加载数据</Button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
};

render(<App />);
```

## 常见问题

### Q: 为什么我的文件加载失败？

检查以下几点：

1. **文件位置是否正确**

```
✅ 正确位置：docs/public/example/button.jsx
❌ 错误位置：docs/demo/example/button.jsx
```

2. **path 属性是否正确**

```md
✅ 正确：<SandpackEditor path="button.jsx"></SandpackEditor>
❌ 错误：<SandpackEditor path="/example/button.jsx"></SandpackEditor>
```

3. **文件扩展名是否正确**

支持的扩展名：`.js`, `.jsx`, `.ts`, `.tsx`

4. **查看浏览器控制台**

打开控制台查看详细的加载日志和错误信息。

### Q: 如何添加自定义 npm 依赖？

修改组件源码中的 `setup` 配置：

```ts
// src/components/sandpack-editor.vue
const setup = computed(() => ({
  dependencies: {
    '@arco-design/web-react': '^2.63.0',
    'react': '^18.2.0',
    'react-dom': '^18.2.0',
    'lodash': '^4.17.21',           // 添加 lodash // [!code highlight]
    'dayjs': '^1.11.10'             // 添加 dayjs // [!code highlight]
  }
}));
```

### Q: 如何调整预览区域大小？

三种方式：

1. **拖动分隔条**：鼠标拖动预览区和编辑器之间的分隔条
2. **双击重置**：双击分隔条恢复默认高度（600px）
3. **修改默认值**：修改组件源码中的 `previewHeight` 初始值

```ts
const previewHeight = ref(600); // 修改这里调整默认高度
```

### Q: 可以自定义设备尺寸吗？

设备尺寸基于真实设备固定：
- iPhone: 375×812px
- Android: 360×740px

如需自定义，需要修改 `PreviewSectionWrapper` 组件源码。

### Q: 相对路径导入不工作怎么办？

检查以下几点：

1. **导入路径必须以 `./` 或 `../` 开头**

```jsx
✅ 正确：import Button from './components/button'
❌ 错误：import Button from 'components/button'
```

2. **文件必须在 example 目录内**

```
✅ 可以导入：docs/public/example/components/button.jsx
❌ 无法导入：docs/src/components/button.jsx
```

3. **检查文件扩展名**

```jsx
✅ 自动推断：import './styles'  (会尝试 styles.js, styles.jsx, styles.css 等)
✅ 明确指定：import './styles.css'
```

4. **查看控制台日志**

控制台会输出完整的依赖加载过程，帮助定位问题。

### Q: 如何调试代码？

使用 `console.log()` 在浏览器控制台查看输出：

```jsx
const App = () => {
  console.log('App component rendered'); // [!code highlight]

  const handleClick = () => {
    console.log('Button clicked'); // [!code highlight]
  };

  return <Button onClick={handleClick}>Test</Button>;
};

render(<App />);
```

打开浏览器开发者工具的 Console 面板查看输出。

## 与其他组件的对比

| 特性             | LiveEditor      | SandpackEditor       |
| ---------------- | --------------- | -------------------- |
| 编译方式         | 浏览器端编译    | Sandpack 在线编译    |
| 移动设备预览     | ❌              | ✅ 内置设备框架      |
| 依赖管理         | 需手动配置      | 自动加载相对路径依赖 |
| npm 包支持       | 有限            | ✅ 完整支持          |
| 多文件项目       | ❌              | ✅ 自动解析          |
| 性能             | 轻量快速        | 相对较重             |
| 代码文件位置     | `demo/example/` | `public/example/`    |
| 适用场景         | 简单组件示例    | 移动端应用演示       |

::: tip 选择建议
- **简单的 UI 组件示例**：使用 `LiveEditor`，轻量快速
- **移动端应用演示**：使用 `SandpackEditor`，真实设备预览
- **需要 npm 包的完整项目**：使用 `SandpackEditor`
- **多文件组织的复杂项目**：使用 `SandpackEditor`
:::

## 相关组件

- [LiveEditor](./live-editor.md) - 标准代码编辑器
- [DeviceFrame](./device-frame.md) - 设备框架组件（由 PreviewSectionWrapper 内部使用）

