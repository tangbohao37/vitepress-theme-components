---
componentName: SandpackEditor
---

<!--
LiveEditor：智能组件，自动处理一切，会自动注入/合并 <script setup>
SandpackEditor：传统组件，需要手动在 <script setup> 中导入代码
同时使用两者：必须在文件开头提供一个 <script setup>，LiveEditor 会将它的依赖合并进去
 -->
<script setup>
import buttonCode from './example/sandpack-button.tsx?raw'
import  customComponentCode from './example/sandpack-custom-component.tsx?raw'
import  customComponentStylesCode from './example/index.css?raw'
</script>


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

<SandpackEditor :code="buttonCode" defaultExpanded :dependencies="{ '@arco-design/web-react': '^2.63.0', }"></SandpackEditor>

<LiveEditor sourceCodePath="./example/index.jsx"></LiveEditor>


<SandpackEditor :code="customComponentCode" :files="{'/index.css': customComponentStylesCode}" defaultExpanded readOnly></SandpackEditor>

### 只读代码查看器

设置 `readOnly` 为 `true` 使用只读的代码查看器，用户无法编辑代码，适合展示参考代码

```vue
<script setup>
import buttonCode from './example/button.jsx?raw';
</script>

<SandpackEditor :code="buttonCode" readOnly defaultExpanded />
```

## API

| 属性            | 类型                   | 默认值  | 说明                                                                     |
| --------------- | ---------------------- | ------- | ------------------------------------------------------------------------ |
| code            | string                 | -       | 主文件代码内容（必需）                                                   |
| files           | Record<string, string> | -       | 可选的额外文件，如 `{ '/styles.css': 'css内容', '/utils.js': 'js内容' }` |
| defaultExpanded | boolean                | `false` | 是否默认展开代码编辑器                                                   |
| readOnly        | boolean                | `false` | 是否为只读模式，使用 SandpackCodeViewer 组件                             |

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

### 基础用法

1. 在 markdown 文件的 `<script setup>` 中导入代码文件（使用 `?raw` 后缀）
2. 将代码字符串传递给 `<SandpackEditor>` 组件的 `code` 属性

```vue
<script setup>
import buttonCode from './example/sandpack-button.jsx?raw';
</script>

<SandpackEditor :code="buttonCode" />
```

### 多文件用法

如果你的代码需要额外的文件（如样式文件、工具函数等），可以使用 `files` 属性：

```vue
<script setup>
import mainCode from './example/app.jsx?raw';
import stylesCode from './example/styles.css?raw';
import utilsCode from './example/utils.js?raw';

const additionalFiles = {
  '/styles.css': stylesCode,
  '/utils.js': utilsCode
};
</script>

<SandpackEditor :code="mainCode" :files="additionalFiles" />
```

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

如果传入的代码有语法错误或运行时错误，Sandpack 会在预览区域显示错误信息。

## 详细说明

### 代码导入机制

SandpackEditor 使用 Vite 的 `?raw` 导入功能来加载代码文件内容。这是一种静态导入方式，在构建时就会将文件内容作为字符串打包进来。

#### 支持的导入格式

```vue
<script setup>
// 导入单个文件
import buttonCode from './example/button.jsx?raw';

// 导入多个文件
import mainCode from './example/app.jsx?raw';
import stylesCode from './example/styles.css?raw';
import utilsCode from './example/utils.js?raw';
</script>
```

::: tip ?raw 后缀的作用
`?raw` 后缀告诉 Vite 将文件内容作为字符串导入，而不是执行或解析文件。这对于代码编辑器组件非常有用。
:::

#### 示例：多文件项目

如果你的示例代码需要多个文件，可以这样组织：

**文件结构：**

```
docs/demo/example/
  ├── app.jsx          # 主文件
  ├── components.jsx   # 组件文件
  └── styles.css       # 样式文件
```

**在 markdown 中使用：**

```vue
<script setup>
import appCode from './example/app.jsx?raw';
import componentsCode from './example/components.jsx?raw';
import stylesCode from './example/styles.css?raw';

const files = {
  '/components.jsx': componentsCode,
  '/styles.css': stylesCode
};
</script>

<SandpackEditor :code="appCode" :files="files" />
```

**app.jsx 中的导入：**

```jsx
// 使用绝对路径导入（相对于 Sandpack 虚拟文件系统根目录）
import MyButton from '/components.jsx';
import '/styles.css';

const App = () => {
  return <MyButton>Click Me</MyButton>;
};

render(<App />);
```

::: warning 导入路径注意事项

- 在 `files` 对象中，文件路径必须以 `/` 开头（Sandpack 虚拟文件系统的绝对路径）
- 在代码中导入这些文件时，也要使用相同的路径（如 `import X from '/components.jsx'`）
- npm 包导入（如 `import { Button } from '@arco-design/web-react'`）由 Sandpack 自动处理
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

### 代码加载流程

::: info 加载流程

1. **静态导入** → 使用 `import code from './file.jsx?raw'` 在构建时导入代码
2. **传递给组件** → 将代码字符串通过 `code` 属性传递给 `<SandpackEditor>`
3. **组件挂载** → 组件接收代码并初始化 Sandpack
4. **渲染预览** → Sandpack 在虚拟环境中执行代码并显示结果
   :::

**核心实现**：

```ts
// 加载代码
async function loadCode() {
  try {
    loading.value = true;
    error.value = '';
    additionalFiles.value = {};

    // 直接使用传入的代码
    code.value = props.code.trim();

    // 如果提供了额外文件，直接使用
    if (props.files) {
      additionalFiles.value = props.files;
      console.log('✓ 代码加载成功，包含额外文件:', Object.keys(props.files));
    } else {
      console.log('✓ 代码加载成功');
    }
  } catch (err) {
    console.error('加载代码失败:', err);
    error.value = err instanceof Error ? err.message : '未知错误';
  } finally {
    loading.value = false;
  }
}
```

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

使用 `files` 属性传入额外的文件：

```vue
<script setup>
import mainCode from './example/main.jsx?raw';
import buttonCode from './example/button.jsx?raw';
import inputCode from './example/input.jsx?raw';
import mainCss from './example/main.css?raw';
import themeCss from './example/theme.css?raw';

const files = {
  '/button.jsx': buttonCode,
  '/input.jsx': inputCode,
  '/main.css': mainCss,
  '/theme.css': themeCss
};
</script>

<SandpackEditor :code="mainCode" :files="files" />
```

然后在主文件中使用绝对路径导入：

```jsx
// main.jsx
import Button from '/button.jsx';
import Input from '/input.jsx';
import '/main.css';
import '/theme.css';
```

### 为什么我的导入没有生效？

检查以下几点：

1. **在 `<script setup>` 中**：确保使用 `?raw` 后缀导入文件
2. **在 `files` 对象中**：文件路径必须以 `/` 开头
3. **在代码中导入时**：使用与 `files` 对象中相同的路径（如 `import X from '/file.jsx'`）
4. **npm 包导入**：直接使用包名即可（如 `import { Button } from '@arco-design/web-react'`）

### 如何自定义 Sandpack 依赖？

目前组件硬编码了依赖配置（React 18 + Arco Design），如需自定义，需要修改源码中的 `setup` 计算属性。

### 预览区域可以自定义尺寸吗？

预览区域的高度可以通过拖动分隔条调整（`200px` - `1000px`），设备框架尺寸是固定的（基于真实设备尺寸）。

### ?raw 导入和普通导入有什么区别？

- **普通导入** (`import X from './file.jsx'`)：Vite 会解析并执行文件
- **?raw 导入** (`import X from './file.jsx?raw'`)：Vite 将文件内容作为字符串导入，不进行解析

对于代码编辑器组件，我们需要原始的代码字符串，所以必须使用 `?raw` 后缀。
