---
componentName: SandpackEditor
---

# SandpackEditor

> 带移动设备预览的 Sandpack React 代码编辑器组件，从 public/example 目录加载代码文件并渲染

## 特性

- ✨ 实时代码编辑和预览
- 📱 移动设备外观（iPhone / Android）
- 🔄 设备切换功能
- 📏 自动适配安全区域（刘海、Home Indicator）
- 🎨 支持暗色模式
- 📝 可折叠的代码编辑器
- 👁️ 支持只读代码查看器（使用 SandpackCodeViewer）
- 🎯 上下结构布局（预览在上，代码在下）
- ↕️ 可拖动调整预览区域高度（保持手机框架完整，使用滚动条查看）

## 基础用法

### 移动应用示例（推荐）

展示完整的移动端 UI，支持设备切换。默认收起代码编辑器，点击"代码示例"可展开查看和编辑。

### 默认展开编辑器

设置 `defaultExpanded` 为 `true` 可以让编辑器默认展开
<SandpackEditor path="button.jsx" defaultExpanded></SandpackEditor>

### 只读代码查看器

设置 `readOnly` 为 `true` 使用只读的代码查看器，用户无法编辑代码，适合展示参考代码
<SandpackEditor path="button.jsx" readOnly defaultExpanded></SandpackEditor>

### 其他示例

#### 按钮图标示例

<SandpackEditor path="icons.jsx"></SandpackEditor>

#### 按钮状态示例

<SandpackEditor path="button-status.jsx"></SandpackEditor>

#### 自定义组件示例（井字游戏）

<SandpackEditor path="custom-component.jsx"></SandpackEditor>

## API

| 属性            | 类型    | 默认值  | 说明                                         |
| --------------- | ------- | ------- | -------------------------------------------- |
| path            | string  | -       | example 目录下的文件路径，如 "button.jsx"    |
| defaultExpanded | boolean | `false` | 是否默认展开代码编辑器                       |
| readOnly        | boolean | `false` | 是否为只读模式，使用 SandpackCodeViewer 组件 |

## 设备预览

SandpackEditor 内置了移动设备预览框架：

### 设备外观

- **iPhone**: 包含刘海、状态栏、Home Indicator
- **Android**: 标准 Android 设备外观

### 安全区域

- 顶部安全区域：包含状态栏（时间、信号、电池等）
- 底部安全区域：iPhone 显示 Home Indicator

### 设备切换

点击预览区域顶部的设备切换按钮，可以在 iPhone 和 Android 之间切换

## 使用说明

1. 将 React 代码文件放在 `docs/public/example/` 目录下
2. 在 markdown 中使用 `<SandpackEditor path="文件名.jsx"></SandpackEditor>`
3. 组件会自动加载文件并渲染为可编辑的 Sandpack 编辑器

### 编辑器交互

- **查看代码**: 点击底部的"查看代码"/"编辑代码"栏可以展开/收起代码区域
- **编辑代码**: 在展开的编辑器中直接修改代码，预览会实时更新（非只读模式）
- **只读模式**: 添加 `readOnly` 属性后，代码区域将变为只读查看器，用户无法编辑代码
- **切换设备**: 点击预览区域右上角的设备图标切换 iPhone/Android 外观
- **调整预览高度**: 拖动预览区域和代码区域之间的分隔条，可以调整预览区域的高度
  - 手机框架保持完整尺寸，不会被压缩
  - 当预览区域小于手机高度时，会出现滚动条
  - 高度范围限制在 200px 到 1000px 之间
  - 双击分隔条可以重置为默认高度（600px）
  - 分隔条 hover 时会高亮显示，便于识别
- **默认展开**: 添加 `defaultExpanded` 属性可以让编辑器默认展开

## 支持的代码格式

组件会自动处理以下格式：

1. **标准格式**（已有 export default）

```jsx
const MyComponent = () => <div>Hello</div>;
export default MyComponent;
```

2. **LiveEditor 格式**（自动转换）

```jsx
const MyComponent = () => <div>Hello</div>;
render(<MyComponent />);
```

3. **函数声明**（自动添加 export）

```jsx
function MyComponent() {
  return <div>Hello</div>;
}
```

## 错误处理

### 文件不存在示例

<SandpackEditor path="non-existent.jsx"></SandpackEditor>

## 详细说明

### 文件加载机制

SandpackEditor 支持自动解析和加载代码文件的依赖关系。当你在代码中使用相对路径导入其他文件时，组件会递归加载所有依赖文件。

#### 支持的导入格式

```js
// 相对路径导入 - 会被自动加载
import MyComponent from './my-component';
import { helper } from './utils';
import './styles.css';

// npm 包导入 - 由 Sandpack 处理
import { Button } from '@arco-design/web-react';
```

::: tip 自动依赖解析
组件会自动：

1. 解析主文件中的 `import` 语句
2. 识别相对路径导入（以 `./` 或 `../` 开头）
3. 递归加载所有依赖文件（支持 `.js`, `.jsx`, `.ts`, `.tsx`, `.css`, `.scss`, `.less`）
4. 自动补全文件扩展名（如果 `import` 语句中未指定）
5. 避免循环依赖
   :::

#### 示例：多文件项目结构

假设你有如下文件结构：

```
docs/public/example/
  ├── app.jsx          # 主文件
  ├── components.jsx   # 组件文件
  └── styles.css       # 样式文件
```

**app.jsx**:

```jsx
import MyButton from './components'; // [!code highlight]
import './styles.css'; // [!code highlight]

const App = () => {
  return <MyButton>Click Me</MyButton>;
};

render(<App />);
```

只需在文档中引用主文件：

```md
<SandpackEditor path="app.jsx"></SandpackEditor>
```

组件会自动加载 `components.jsx` 和 `styles.css`。

::: warning 路径注意事项

- 只支持相对路径导入（`./` 或 `../`）
- 文件必须位于 `docs/public/example/` 目录下
- 如果导入路径没有扩展名，组件会尝试常见扩展名（`.js`, `.jsx`, `.ts`, `.tsx`, `.css` 等）
  :::

### 预览区域高度调整

预览区域支持拖动调整高度，使用了高性能的实现方式：

::: details 性能优化实现
组件使用 `requestAnimationFrame` 优化拖动性能，避免在快速拖动时造成卡顿：

```js
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

const onMouseMove = (e: MouseEvent) => {
  if (!isResizing.value) return;

  latestMouseEvent = e;

  // 使用 requestAnimationFrame 优化性能 // [!code highlight]
  if (animationFrameId === null) {
    // [!code highlight]
    animationFrameId = requestAnimationFrame(updateHeight); // [!code highlight]
  } // [!code highlight]
};
```

这种方式确保：

- 高度更新与浏览器刷新率同步（通常 60fps）
- 避免过度渲染
- 提供流畅的拖动体验
  :::

拖动特性：

- **高度范围**: `200px` - `1000px`
- **手机框架保持完整**: 不会被压缩，超出部分显示滚动条
- **双击重置**: 双击分隔条恢复默认高度 `600px`
- **视觉反馈**: hover 时高亮显示，拖动时全局光标变为 `ns-resize`

### 只读模式 vs 编辑模式

组件根据 `readOnly` 属性决定使用哪个 Sandpack 组件：

```vue
<!-- 只读模式：使用 SandpackCodeViewer -->
<SandpackCodeViewer
  v-if="props.readOnly"
  :show-line-numbers="true"
  :show-tabs="false"
/>

<!-- 编辑模式：使用 SandpackCodeEditor -->
<SandpackCodeEditor v-else :show-line-numbers="true" />
```

::: tip 使用建议

- **编辑模式**（默认）：适合教程、示例演示，用户可以修改代码看效果
- **只读模式**（`readOnly`）：适合展示参考代码、最佳实践，防止误操作
  :::

## 技术实现

### 核心架构

SandpackEditor 基于以下技术栈：

- **Sandpack-vue3**: Sandpack 的 Vue 3 绑定库，提供在线代码编辑和预览能力
- **Naive UI**: 提供加载状态（`NSpin`）、错误提示（`NResult`）、按钮等 UI 组件
- **PreviewSectionWrapper**: 自定义预览区域组件，集成设备框架和预览功能

### 文件加载流程

::: info 加载流程

1. **组件挂载** → 触发 `loadCode()` 函数
2. **加载主文件** → 从 `/vitepress-theme-components/example/` 路径获取
3. **解析 import** → 使用正则表达式提取相对路径导入
4. **递归加载依赖** → `loadFileWithDependencies()` 递归加载所有依赖
5. **扩展名补全** → 自动尝试 `.js`, `.jsx`, `.ts`, `.tsx`, `.css` 等扩展名
6. **避免循环依赖** → 使用 `visited` Set 记录已加载文件
7. **组装文件对象** → 将所有文件传递给 Sandpack
   :::

**核心代码实现**：

```ts
// 解析代码中的 import 语句，提取相对路径的文件
function parseImports(code: string): string[] {
  const imports: string[] = [];

  // 匹配 import 语句：import xxx from './xxx' 或 import './xxx'
  // 支持单引号、双引号
  const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"](.+?)['"]/g; // [!code highlight]

  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const importPath = match[1];

    // 只处理相对路径（以 ./ 或 ../ 开头） // [!code highlight]
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      // [!code highlight]
      imports.push(importPath);
    }
  }

  return imports;
}
```

::: warning 循环依赖检测
递归加载时使用 `visited` Set 避免循环依赖：

```ts
async function loadFileWithDependencies(
  filePath: string,
  loadedFiles: Record<string, string> = {},
  visited: Set<string> = new Set() // [!code highlight]
): Promise<Record<string, string>> {
  const normalizedPath = normalizePath(filePath);

  // 避免循环依赖 // [!code highlight]
  if (visited.has(normalizedPath)) {
    // [!code highlight]
    return loadedFiles; // [!code highlight]
  } // [!code highlight]
  visited.add(normalizedPath);

  // ... 加载文件逻辑
}
```

:::

### 扩展名智能补全

当 `import` 语句没有指定文件扩展名时，组件会自动尝试常见扩展名：

```ts{7-17}
// 如果 import 路径没有扩展名，尝试添加常见扩展名
if (!resolvedPath.match(/\.\w+$/)) {
  // 尝试常见的扩展名
  const possibleExts = ['js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'less']
  let found = false

  for (const ext of possibleExts) {
    const pathWithExt = `${resolvedPath}.${ext}`
    try {
      const testPath = `/vitepress-theme-components/example/${pathWithExt}`
      const testResponse = await fetch(testPath, { method: 'HEAD' })
      if (testResponse.ok) {
        resolvedPath = pathWithExt
        found = true
        break
      }
    } catch {
      // 继续尝试下一个扩展名
    }
  }
}
```

::: tip HEAD 请求优化
使用 `fetch` 的 `HEAD` 方法检测文件是否存在，避免下载完整文件内容，提升性能。
:::

### Sandpack 配置

组件自动配置 Sandpack 环境：

```ts
const setup = computed(() => ({
  dependencies: {
    '@arco-design/web-react': '^2.63.0',
    react: '^18.2.0',
    'react-dom': '^18.2.0'
  }
}));
```

所有加载的文件会被组装成 Sandpack 的文件对象：

```ts
const files = computed(() => {
  if (!code.value) {
    return {};
  }

  const result: Record<string, string> = {
    '/App.js': code.value, // 主文件
    // 合并所有额外加载的文件（CSS、其他 JS 等）
    ...additionalFiles.value
  };

  return result;
});
```

### 拖动性能优化

::: details 拖动优化的关键点

1. **使用 requestAnimationFrame**

```ts
// 缓存最新的鼠标事件，避免频繁更新
let latestMouseEvent: MouseEvent | null = null;

const onMouseMove = (e: MouseEvent) => {
  if (!isResizing.value) return;

  latestMouseEvent = e; // 只缓存事件 // [!code highlight]

  // 使用 RAF 确保与浏览器刷新率同步
  if (animationFrameId === null) {
    animationFrameId = requestAnimationFrame(updateHeight);
  }
};
```

2. **Passive 事件监听**

```ts
// 使用 passive 事件监听器提升性能 // [!code highlight]
document.addEventListener('mousemove', onMouseMove, { passive: true } as any); // [!code highlight]
```

这告诉浏览器事件处理函数不会调用 `preventDefault()`，允许浏览器优化滚动性能。

3. **清理动画帧**

```ts
const onMouseUp = () => {
  isResizing.value = false;

  // 取消未完成的动画帧 // [!code highlight]
  if (animationFrameId !== null) {
    // [!code highlight]
    cancelAnimationFrame(animationFrameId); // [!code highlight]
    animationFrameId = null; // [!code highlight]
  } // [!code highlight]

  // 清理事件监听和样式
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
};
```

:::

### 组件通信

SandpackEditor 使用 `PreviewSectionWrapper` 子组件处理预览逻辑：

```vue
<PreviewSectionWrapper
  :is-resizing="isResizing"
  :preview-height="previewHeight"
  :selected-device="selectedDevice"
  @update:selected-device="selectedDevice = $event"
  @set-ref="previewSectionRef = $event"
/>
```

**Props 传递**：

- `isResizing`: 拖动状态，用于禁用预览区域的某些交互
- `previewHeight`: 预览区域高度
- `selectedDevice`: 当前选中的设备类型

**事件监听**：

- `update:selected-device`: 设备切换事件
- `set-ref`: 获取预览区域 DOM 引用

### 状态管理

组件使用 Vue 3 Composition API 管理状态：

```ts
// 文件加载状态
const loading = ref(true);
const error = ref('');
const code = ref('');
const additionalFiles = ref<Record<string, string>>({});

// UI 交互状态
const selectedDevice = ref<DeviceType>('iphone');
const isEditorExpanded = ref(props.defaultExpanded ?? false);
const previewHeight = ref(600);
const isResizing = ref(false);

// DOM 引用
const previewSectionRef = ref<HTMLElement | null>(null);
```

::: tip 响应式设计

- 所有状态使用 `ref` 包裹，确保响应式更新
- 计算属性（`files`, `setup`）自动根据依赖变化重新计算
- 使用 Vue Transition 实现平滑的展开/收起动画
  :::

## 常见问题

### 如何加载多个依赖文件？

只需在主文件中使用相对路径导入，组件会自动递归加载：

```jsx
// main.jsx
import Button from './components/button';
import Input from './components/input';
import './styles/main.css';
import './styles/theme.css';
```

### 为什么我的导入没有被加载？

检查以下几点：

1. 导入路径必须是相对路径（以 `./` 或 `../` 开头）
2. 文件必须存在于 `docs/public/example/` 目录
3. 检查浏览器控制台的加载日志
4. 如果未指定扩展名，确保文件扩展名在支持列表中（`.js`, `.jsx`, `.ts`, `.tsx`, `.css`, `.scss`, `.less`）

### 如何自定义 Sandpack 依赖？

目前组件硬编码了依赖配置（React 18 + Arco Design），如需自定义，需要修改源码中的 `setup` 计算属性。

### 预览区域可以自定义尺寸吗？

预览区域的高度可以通过拖动分隔条调整（`200px` - `1000px`），设备框架尺寸是固定的（基于真实设备尺寸）。
