# SandpackEditor - Sandpack 代码编辑器

`SandpackEditor` 是基于 [Sandpack](https://sandpack.codesandbox.io/) 的在线代码编辑器组件，专为演示 React 代码设计。它支持移动设备预览、自定义 npm 依赖、外部资源加载，以及通过虚拟文件系统处理私有仓库依赖。

:::info 组件特性
- ✅ 基于 Sandpack Vue3 封装，提供完整的 React 代码编辑和预览
- ✅ 支持移动设备预览框架（iPhone/Android）
- ✅ 灵活的依赖管理：支持自定义 npm 依赖和外部资源
- ✅ 虚拟文件系统：支持多文件项目和私有仓库处理
- ✅ 可编辑/只读双模式，支持代码查看和在线编辑
- ✅ 可调节的预览区域高度，优化用户体验
:::

## 基础引入

```vue
<script setup>
import { SandpackEditor } from 'vitepress-theme-components' // [!code focus]

const code = `
import { Button } from '@arco-design/web-react'

const App = () => {
  return (
    <div style={{ padding: 20 }}>
      <Button type="primary">Click Me</Button>
    </div>
  )
}

render(<App />)
`
</script>

<template>
  <SandpackEditor :code="code" /> // [!code focus]
</template>
```

## 组件结构

SandpackEditor 的 DOM 结构如下：

```
┌─────────────────────────────────────┐
│  SandpackEditor                     │
│  ┌───────────────────────────────┐  │
│  │  PreviewSectionWrapper        │  │ ← 预览区域（含设备框架）
│  │  - 设备选择器                  │  │
│  │  - SandpackPreview           │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Resize Handle                │  │ ← 可拖动的分隔条
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Editor Section               │  │ ← 代码编辑器区域
│  │  ├─ Editor Header (可点击)     │  │
│  │  └─ Editor Content            │  │
│  │     ├─ SandpackCodeEditor     │  │   (编辑模式)
│  │     └─ SandpackCodeViewer     │  │   (只读模式)
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 示例代码渲染逻辑

### 核心渲染流程

SandpackEditor 使用 Sandpack 的 Vue3 封装来渲染代码，核心流程如下：

```vue
<template>
  <SandpackProvider template="react" :files="files" :custom-setup="setup">
    <!-- 预览区域 -->
    <PreviewSectionWrapper 
      :preview-height="previewHeight"
      :selected-device="selectedDevice"
    />
    
    <!-- 代码编辑器 -->
    <SandpackCodeEditor v-if="!readOnly" />
    <SandpackCodeViewer v-else />
  </SandpackProvider>
</template>
```

**渲染步骤：**

1. **接收代码内容**：通过 `code` prop 接收主文件代码
2. **构建文件对象**：将代码和额外文件组织为 Sandpack 文件格式
3. **配置依赖**：通过 `dependencies` 和 `externalResources` 配置项目依赖
4. **渲染预览**：Sandpack 在浏览器中编译并渲染代码
5. **设备框架**：PreviewSectionWrapper 将预览包裹在移动设备框架中

### 文件对象构建

组件通过计算属性 `files` 构建 Sandpack 文件对象：

```vue:196-209:src/components/sandpack-editor.vue
const files = computed(() => {
  if (!code.value) {
    return {};
  }

  const result: Record<string, string> = {
    '/App.js': code.value,
    // 合并所有文件（包括示例文件、node_modules 虚拟包等）
    ...additionalFiles.value,
  };

  return result;
});
```

**文件路径规范：**
- 主文件固定为 `/App.js`
- 额外文件可以是任意路径，如 `/components/Button.js`
- node_modules 虚拟包使用 `/node_modules/@scope/package/index.js` 格式

### 代码加载逻辑

组件在 `onMounted` 时调用 `loadCode` 加载代码：

```vue:229-280:src/components/sandpack-editor.vue
async function loadCode() {
  try {
    loading.value = true;
    error.value = '';
    additionalFiles.value = {};

    // 检查 code 是否存在
    if (!props.code) {
      throw new Error('代码内容不能为空，请检查 :code prop 是否正确传递')
    }

    // 直接使用传入的代码
    code.value = props.code.trim();

    // 如果提供了额外文件，直接使用
    if (props.files) {
      additionalFiles.value = props.files;
      
      // 统计文件类型
      const fileTypes = {
        nodeModules: 0,
        examples: 0,
        others: 0
      }
      
      Object.keys(props.files).forEach(path => {
        if (path.startsWith('/node_modules/')) {
          fileTypes.nodeModules++
        } else if (path.startsWith('/')) {
          fileTypes.examples++
        } else {
          fileTypes.others++
        }
      })
      
      console.log('✅ Sandpack 文件加载成功:', {
        总文件数: Object.keys(props.files).length,
        虚拟包文件: fileTypes.nodeModules,
        示例文件: fileTypes.examples,
        其他文件: fileTypes.others
      });
    } else {
      console.log('✅ 代码加载成功（无额外文件）');
    }
  } catch (err) {
    console.error('❌ 加载代码失败:', err);
    error.value = err instanceof Error ? err.message : '未知错误';
  } finally {
    loading.value = false;
  }
}
```

**关键点：**
- `code` prop 是必需的，包含主文件代码
- `files` prop 是可选的，包含所有额外文件
- 加载过程会统计并打印文件类型（调试用）
- 错误会被捕获并显示友好的错误提示

## 外部依赖处理逻辑

### 依赖配置

SandpackEditor 通过 `setup` 计算属性配置项目依赖：

```vue:211-227:src/components/sandpack-editor.vue
const setup = computed(() => {
  const config: Record<string, any> = {
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      // 合并用户自定义依赖
      ...props.dependencies
    }
  };

  // 添加外部资源支持
  if (props.externalResources && props.externalResources.length > 0) {
    config.externalResources = props.externalResources;
  }

  return config;
});
```

**依赖类型：**

1. **默认依赖**：React 和 ReactDOM（固定版本）
2. **自定义依赖**：通过 `dependencies` prop 传入的 npm 包
3. **外部资源**：通过 `externalResources` prop 传入的 CSS/JS 文件 URL

### 使用自定义依赖

通过 `dependencies` prop 添加 npm 依赖：

```vue
<script setup>
const code = `
import { Button } from '@arco-design/web-react'
import { format } from 'date-fns'

const App = () => {
  const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
  return (
    <div style={{ padding: 20 }}>
      <Button type="primary">{now}</Button>
    </div>
  )
}

render(<App />)
`

const customDeps = { // [!code focus]
  '@arco-design/web-react': '^2.63.0', // [!code focus]
  'date-fns': '^2.30.0' // [!code focus]
} // [!code focus]
</script>

<template>
  <SandpackEditor :code="code" :dependencies="customDeps" /> // [!code focus]
</template>
```

### 使用外部资源

通过 `externalResources` prop 加载外部 CSS 和 JS：

```vue
<script setup>
const code = `
const App = () => {
  return (
    <div style={{ padding: 20 }}>
      <h1 className="custom-title">标题使用外部 CSS 样式</h1>
      <button className="external-button">外部样式按钮</button>
    </div>
  )
}

render(<App />)
`

const externalResources = [ // [!code focus]
  'https://cdn.example.com/custom-styles.css', // [!code focus]
  'https://cdn.example.com/utils.js' // [!code focus]
] // [!code focus]
</script>

<template>
  <SandpackEditor :code="code" :externalResources="externalResources" /> // [!code focus]
</template>
```

**外部资源说明：**
- 可以是 CDN 上的 CSS 样式文件
- 可以是 CDN 上的 JavaScript 库
- 资源会被注入到 Sandpack 的预览 iframe 中
- 适用于需要全局样式或脚本的场景

### 依赖版本管理

:::warning 依赖版本注意事项
- Sandpack 使用 npm 在线解析依赖，版本需要在 npm registry 中存在
- 建议使用固定版本号（如 `2.63.0`）而不是范围（如 `^2.0.0`）以确保稳定性
- React 版本默认为 18.2.0，如果自定义依赖需要其他 React 版本，需要显式指定
:::

## 私有仓库处理逻辑

### 虚拟文件系统

SandpackEditor 支持通过 `files` prop 传入虚拟文件，模拟 `node_modules` 中的私有包。这对于演示私有组件库特别有用。

### 虚拟包的路径规范

虚拟包文件必须使用 `/node_modules/` 开头的路径：

```
/node_modules/@atome/design/index.js         ← 包入口文件
/node_modules/@atome/design/Button.js        ← 组件文件
/node_modules/@atome/design/style.css        ← 样式文件
/node_modules/@atome/design/package.json     ← 包描述文件（可选）
```

### 创建虚拟私有包

**步骤 1：准备私有包文件**

```javascript
// /node_modules/@atome/design/Button.js
export const Button = ({ children, type = 'primary' }) => {
  const styles = {
    primary: { backgroundColor: '#1890ff', color: 'white' },
    default: { backgroundColor: '#f0f0f0', color: '#333' }
  }
  
  return (
    <button style={{ 
      padding: '8px 16px', 
      border: 'none', 
      borderRadius: '4px',
      cursor: 'pointer',
      ...styles[type]
    }}>
      {children}
    </button>
  )
}
```

```javascript
// /node_modules/@atome/design/index.js
export { Button } from './Button'
export { Input } from './Input'
```

**步骤 2：在 VitePress 中使用**

```vue
<script setup>
const code = `
import { Button } from '@atome/design' // [!code focus]

const App = () => {
  return (
    <div style={{ padding: 20 }}>
      <Button type="primary">私有包按钮</Button> // [!code focus]
    </div>
  )
}

render(<App />)
`

const files = { // [!code focus]
  '/node_modules/@atome/design/index.js': ` // [!code focus]
    export { Button } from './Button' // [!code focus]
  `, // [!code focus]
  '/node_modules/@atome/design/Button.js': ` // [!code focus]
    export const Button = ({ children, type = 'primary' }) => { // [!code focus]
      const styles = { // [!code focus]
        primary: { backgroundColor: '#1890ff', color: 'white' }, // [!code focus]
        default: { backgroundColor: '#f0f0f0', color: '#333' } // [!code focus]
      } // [!code focus]
      return ( // [!code focus]
        <button style={{ // [!code focus]
          padding: '8px 16px', // [!code focus]
          border: 'none', // [!code focus]
          borderRadius: '4px', // [!code focus]
          cursor: 'pointer', // [!code focus]
          ...styles[type] // [!code focus]
        }}> // [!code focus]
          {children} // [!code focus]
        </button> // [!code focus]
      ) // [!code focus]
    } // [!code focus]
  ` // [!code focus]
} // [!code focus]
</script>

<template>
  <SandpackEditor :code="code" :files="files" /> // [!code focus]
</template>
```

### 完整的多文件私有包示例

```vue
<script setup>
const code = `
import { Button, Input, Card } from '@atome/design'
import '@atome/design/style.css'

const App = () => {
  return (
    <div style={{ padding: 20 }}>
      <Card>
        <h2>贷款申请</h2>
        <Input placeholder="请输入姓名" />
        <Input placeholder="请输入身份证号" />
        <Button type="primary">提交申请</Button>
      </Card>
    </div>
  )
}

render(<App />)
`

const files = {
  // 包入口
  '/node_modules/@atome/design/index.js': `
    export { Button } from './Button'
    export { Input } from './Input'
    export { Card } from './Card'
  `,
  
  // Button 组件
  '/node_modules/@atome/design/Button.js': `
    export const Button = ({ children, type = 'primary', onClick }) => {
      const styles = {
        primary: { backgroundColor: '#1890ff', color: 'white' },
        default: { backgroundColor: '#f0f0f0', color: '#333' }
      }
      
      return (
        <button 
          className="atome-button"
          style={{ 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            ...styles[type]
          }}
          onClick={onClick}
        >
          {children}
        </button>
      )
    }
  `,
  
  // Input 组件
  '/node_modules/@atome/design/Input.js': `
    export const Input = ({ placeholder, value, onChange }) => {
      return (
        <input
          className="atome-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            fontSize: '14px',
            marginBottom: '12px'
          }}
        />
      )
    }
  `,
  
  // Card 组件
  '/node_modules/@atome/design/Card.js': `
    export const Card = ({ children }) => {
      return (
        <div className="atome-card" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {children}
        </div>
      )
    }
  `,
  
  // 样式文件
  '/node_modules/@atome/design/style.css': `
    .atome-button:hover {
      opacity: 0.8;
      transform: translateY(-1px);
    }
    
    .atome-button:active {
      transform: translateY(0);
    }
    
    .atome-input:focus {
      outline: none;
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
    
    .atome-card {
      transition: box-shadow 0.3s;
    }
    
    .atome-card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
  `
}
</script>

<template>
  <SandpackEditor :code="code" :files="files" />
</template>
```

### 虚拟包与外部依赖的组合使用

可以同时使用虚拟私有包和外部 npm 依赖：

```vue
<script setup>
const code = `
import { Button } from '@atome/design'          // 虚拟私有包
import { format } from 'date-fns'                 // npm 公共包
import { Message } from '@arco-design/web-react' // npm 公共包

const App = () => {
  const handleClick = () => {
    const time = format(new Date(), 'HH:mm:ss')
    Message.success('点击时间：' + time)
  }
  
  return (
    <div style={{ padding: 20 }}>
      <Button type="primary" onClick={handleClick}>
        查看当前时间
      </Button>
    </div>
  )
}

render(<App />)
`

// 虚拟私有包
const files = {
  '/node_modules/@atome/design/index.js': `export { Button } from './Button'`,
  '/node_modules/@atome/design/Button.js': `
    export const Button = ({ children, type = 'primary', onClick }) => {
      const styles = {
        primary: { backgroundColor: '#1890ff', color: 'white' },
      }
      return (
        <button 
          style={{ 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            ...styles[type]
          }}
          onClick={onClick}
        >
          {children}
        </button>
      )
    }
  `
}

// 外部 npm 依赖
const dependencies = {
  '@arco-design/web-react': '^2.63.0',
  'date-fns': '^2.30.0'
}
</script>

<template>
  <SandpackEditor 
    :code="code" 
    :files="files" 
    :dependencies="dependencies" 
  />
</template>
```

### 文件统计和调试

组件会在控制台打印详细的文件加载信息：

```javascript
✅ Sandpack 文件加载成功: {
  总文件数: 5,
  虚拟包文件: 3,      // /node_modules/ 开头的文件
  示例文件: 2,        // 其他 / 开头的文件
  其他文件: 0
}
```

**文件分类规则：**
- `path.startsWith('/node_modules/')` → 虚拟包文件
- `path.startsWith('/')` → 示例文件
- 其他 → 其他文件

## API 参数

### Props

| 参数 | 说明 | 类型 | 默认值 | 是否必需 |
|------|------|------|--------|---------|
| `code` | 主文件代码内容 | `string` | - | ✅ 必需 |
| `files` | 额外文件对象，支持多文件和 node_modules 虚拟包 | `Record<string, string>` | `{}` | 可选 |
| `defaultExpanded` | 是否默认展开代码编辑器 | `boolean` | `false` | 可选 |
| `readOnly` | 是否为只读模式（使用 SandpackCodeViewer） | `boolean` | `false` | 可选 |
| `dependencies` | 自定义 npm 依赖 | `Record<string, string>` | `{}` | 可选 |
| `externalResources` | 外部资源 URL 列表（CSS/JS） | `string[]` | `[]` | 可选 |

### Props 详细说明

#### code（必需）

主文件的代码内容，必须以 `render()` 结尾：

```javascript
// ✅ 正确格式
const App = () => {
  return <div>Hello World</div>
}

render(<App />)  // 必须以 render() 结尾
```

```javascript
// ❌ 错误格式
export default App  // 不要使用 export default
```

#### files（可选）

包含所有额外文件的对象，键为文件路径，值为文件内容：

```javascript
const files = {
  // 普通文件
  '/components/Button.js': 'export const Button = ...',
  '/styles/app.css': '.app { ... }',
  
  // node_modules 虚拟包
  '/node_modules/@atome/design/index.js': 'export { Button } from "./Button"',
  '/node_modules/@atome/design/Button.js': 'export const Button = ...'
}
```

#### dependencies（可选）

自定义 npm 依赖，会与默认依赖合并：

```javascript
const dependencies = {
  '@arco-design/web-react': '^2.63.0',
  'lodash': '^4.17.21',
  'dayjs': '^1.11.10'
}
```

:::tip 默认依赖
组件默认包含以下依赖，无需额外配置：
- `react`: `^18.2.0`
- `react-dom`: `^18.2.0`
:::

#### externalResources（可选）

外部资源 URL 数组，用于加载 CDN 上的样式或脚本：

```javascript
const externalResources = [
  'https://unpkg.com/@arco-design/web-react@2.63.0/dist/css/arco.css',
  'https://cdn.example.com/custom-theme.css'
]
```

## 高级特性

### 可调节的预览高度

拖动分隔条调整预览区域高度：

```vue:131-189:src/components/sandpack-editor.vue
// 开始调整大小
function startResize(event: MouseEvent) {
  event.preventDefault();
  isResizing.value = true;

  const startY = event.clientY;
  const startHeight = previewHeight.value;
  let animationFrameId: number | null = null;
  let latestMouseEvent: MouseEvent | null = null;

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

    // 使用 requestAnimationFrame 优化性能
    if (animationFrameId === null) {
      animationFrameId = requestAnimationFrame(updateHeight);
    }
  };

  const onMouseUp = () => {
    isResizing.value = false;

    // 取消未完成的动画帧
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    document.removeEventListener('mousemove', onMouseMove, {
      passive: true
    } as any);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.body.classList.remove('is-resizing-sandpack');
  };

  // 使用 passive 事件监听器提升性能
  document.addEventListener('mousemove', onMouseMove, { passive: true } as any);
  document.addEventListener('mouseup', onMouseUp);
  document.body.style.cursor = 'ns-resize';
  document.body.style.userSelect = 'none';
  document.body.classList.add('is-resizing-sandpack');
}
```

**特性：**
- 高度范围：200px - 1000px
- 双击分隔条重置为默认高度（600px）
- 使用 `requestAnimationFrame` 优化性能
- 使用 `passive` 事件监听器避免阻塞主线程

### 移动设备预览框架

PreviewSectionWrapper 提供真实的设备预览效果：

```vue:20-26:src/components/sandpack-editor.vue
<PreviewSectionWrapper
  :is-resizing="isResizing"
  :preview-height="previewHeight"
  :selected-device="selectedDevice"
  @update:selected-device="selectedDevice = $event"
/>
```

**支持的设备：**
- iPhone：375×812px，包含刘海、状态栏、Home Indicator
- Android：360×740px，包含状态栏和虚拟按键

### 编辑器展开/收起

点击编辑器头部切换展开状态：

```vue:69-81:src/components/sandpack-editor.vue
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
```

**交互：**
- 点击头部切换展开/收起
- 使用 Vue Transition 实现平滑动画
- 箭头图标旋转 180° 指示状态

### 加载和错误状态

使用 Naive UI 组件提供友好的用户反馈：

```vue:3-15:src/components/sandpack-editor.vue
<!-- 加载状态 - 使用 Naive UI NSpin -->
<div v-if="loading" class="loading">
  <NSpin size="large" description="正在加载示例代码..." />
</div>

<!-- 错误状态 - 使用 Naive UI NResult -->
<div v-else-if="error" class="error-container">
  <NResult status="error" title="加载失败" :description="error">
    <template #footer>
      <NButton type="primary" @click="loadCode"> 重试 </NButton>
    </template>
  </NResult>
</div>
```

## 使用示例

### 示例 1：基础按钮

```vue
<script setup>
const code = `
import { Button } from '@arco-design/web-react'

const App = () => {
  return (
    <div style={{ padding: 20 }}>
      <Button type="primary">Primary Button</Button>
      <Button style={{ marginLeft: 10 }}>Default Button</Button>
    </div>
  )
}

render(<App />)
`

const dependencies = {
  '@arco-design/web-react': '^2.63.0'
}

const externalResources = [
  'https://unpkg.com/@arco-design/web-react@2.63.0/dist/css/arco.css'
]
</script>

<template>
  <SandpackEditor 
    :code="code" 
    :dependencies="dependencies"
    :externalResources="externalResources"
  />
</template>
```

### 示例 2：私有组件库演示

```vue
<script setup>
const code = `
import { LoanForm, ApplyButton } from '@atome/loan-components'

const App = () => {
  const handleSubmit = (data) => {
    console.log('提交贷款申请:', data)
  }
  
  return (
    <div style={{ padding: 20 }}>
      <LoanForm onSubmit={handleSubmit}>
        <ApplyButton type="primary">
          立即申请
        </ApplyButton>
      </LoanForm>
    </div>
  )
}

render(<App />)
`

// 模拟私有组件库
const files = {
  '/node_modules/@atome/loan-components/index.js': `
    export { LoanForm } from './LoanForm'
    export { ApplyButton } from './ApplyButton'
  `,
  '/node_modules/@atome/loan-components/LoanForm.js': `
    import { useState } from 'react'
    
    export const LoanForm = ({ children, onSubmit }) => {
      const [amount, setAmount] = useState('')
      const [period, setPeriod] = useState('12')
      
      const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit({ amount, period })
      }
      
      return (
        <form onSubmit={handleSubmit} style={{
          maxWidth: 400,
          padding: 20,
          backgroundColor: 'white',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0 }}>Loan Application (贷款申请)</h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>
              Amount (金额):
            </label>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: 4
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>
              Period (期限):
            </label>
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: 4
              }}
            >
              <option value="6">6 months</option>
              <option value="12">12 months</option>
              <option value="24">24 months</option>
            </select>
          </div>
          {children}
        </form>
      )
    }
  `,
  '/node_modules/@atome/loan-components/ApplyButton.js': `
    export const ApplyButton = ({ children, type = 'primary' }) => {
      const styles = {
        primary: { backgroundColor: '#1890ff', color: 'white' },
        default: { backgroundColor: '#f0f0f0', color: '#333' }
      }
      
      return (
        <button 
          type="submit"
          style={{
            width: '100%',
            padding: '10px 20px',
            border: 'none',
            borderRadius: 4,
            fontSize: 16,
            cursor: 'pointer',
            ...styles[type]
          }}
        >
          {children}
        </button>
      )
    }
  `
}
</script>

<template>
  <SandpackEditor :code="code" :files="files" />
</template>
```

### 示例 3：多文件项目

```vue
<script setup>
const code = `
import Header from './components/Header'
import ProductList from './components/ProductList'
import './styles.css'

const App = () => {
  return (
    <div className="app">
      <Header title="Loan Products (贷款产品)" />
      <ProductList />
    </div>
  )
}

render(<App />)
`

const files = {
  '/components/Header.js': `
    export default function Header({ title }) {
      return (
        <header className="header">
          <h1>{title}</h1>
        </header>
      )
    }
  `,
  '/components/ProductList.js': `
    const products = [
      { id: 1, name: 'Personal Loan (个人贷款)', rate: '3.5%' },
      { id: 2, name: 'Car Loan (汽车贷款)', rate: '4.2%' },
      { id: 3, name: 'Home Loan (住房贷款)', rate: '3.8%' }
    ]
    
    export default function ProductList() {
      return (
        <div className="product-list">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p>Interest Rate (利率): {product.rate}</p>
            </div>
          ))}
        </div>
      )
    }
  `,
  '/styles.css': `
    .app {
      min-height: 100vh;
      background: #f5f5f5;
    }
    
    .header {
      background: #1890ff;
      color: white;
      padding: 20px;
      text-align: center;
    }
    
    .product-list {
      padding: 20px;
      display: grid;
      gap: 16px;
    }
    
    .product-card {
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .product-card h3 {
      margin: 0 0 8px 0;
    }
    
    .product-card p {
      margin: 0;
      color: #666;
    }
  `
}
</script>

<template>
  <SandpackEditor :code="code" :files="files" />
</template>
```

## 最佳实践

### 1. 代码组织

**推荐做法：**

```vue
<script setup>
// ✅ 使用模板字符串，保持代码缩进
const code = `
import { Button } from '@arco-design/web-react'

const App = () => {
  return (
    <div style={{ padding: 20 }}>
      <Button type="primary">Click Me</Button>
    </div>
  )
}

render(<App />)
`
</script>
```

**避免做法：**

```vue
<script setup>
// ❌ 字符串拼接，难以维护
const code = "import { Button } from '@arco-design/web-react'\n" +
  "const App = () => {\n" +
  "  return <Button>Click Me</Button>\n" +
  "}\n" +
  "render(<App />)"
</script>
```

### 2. 性能优化

**限制实例数量：**

```md
<!-- ✅ 推荐：一个页面 3-5 个 SandpackEditor -->
## 基础用法
<SandpackEditor :code="code1" />

## 高级用法
<SandpackEditor :code="code2" />

## 完整示例
<SandpackEditor :code="code3" />
```

**默认收起编辑器：**

```vue
<!-- ✅ 推荐：默认收起 -->
<SandpackEditor :code="code" />

<!-- ⚠️ 谨慎：只在必要时展开 -->
<SandpackEditor :code="code" defaultExpanded />
```

### 3. 依赖管理

**明确指定版本：**

```javascript
// ✅ 推荐：使用明确的版本号
const dependencies = {
  '@arco-design/web-react': '2.63.0',
  'lodash': '4.17.21'
}
```

```javascript
// ⚠️ 避免：使用范围版本可能导致不稳定
const dependencies = {
  '@arco-design/web-react': '^2.0.0',  // 可能会变化
  'lodash': 'latest'                    // 非常不稳定
}
```

### 4. 私有包组织

**推荐的文件结构：**

```javascript
const files = {
  // 包入口
  '/node_modules/@company/package/index.js': `...`,
  
  // 组件分类
  '/node_modules/@company/package/components/Button.js': `...`,
  '/node_modules/@company/package/components/Input.js': `...`,
  
  // 工具函数
  '/node_modules/@company/package/utils/helpers.js': `...`,
  
  // 样式
  '/node_modules/@company/package/styles/index.css': `...`
}
```

### 5. 错误处理

在代码中添加友好的错误提示：

```javascript
const code = `
import { Button } from '@arco-design/web-react'

const App = () => {
  const handleClick = () => {
    try {
      // 业务逻辑
      console.log('操作成功')
    } catch (error) {
      console.error('操作失败:', error.message)
      alert('操作失败，请重试')
    }
  }
  
  return (
    <div style={{ padding: 20 }}>
      <Button onClick={handleClick}>Click Me</Button>
    </div>
  )
}

render(<App />)
`
```

## 常见问题

### Q1: 为什么我的代码不显示？

**检查清单：**

1. 确保 `code` prop 已正确传递且不为空
2. 代码必须以 `render(<App />)` 结尾
3. 检查浏览器控制台是否有错误信息
4. 确认所有依赖已正确配置

### Q2: 如何调试虚拟私有包？

**调试方法：**

1. 打开浏览器控制台，查看文件加载统计
2. 检查文件路径是否以 `/node_modules/` 开头
3. 验证包入口文件（index.js）的导出是否正确
4. 使用 `console.log` 在虚拟包代码中打印调试信息

```javascript
// 在虚拟包中添加调试日志
'/node_modules/@atome/design/Button.js': `
  console.log('[Debug] Button 组件加载')
  
  export const Button = ({ children }) => {
    console.log('[Debug] Button 渲染:', children)
    return <button>{children}</button>
  }
`
```

### Q3: 可以使用 TypeScript 吗？

可以！Sandpack 支持 TypeScript：

```vue
<script setup>
const code = `
import { Button } from '@arco-design/web-react'
import type { ButtonProps } from '@arco-design/web-react'

const App = () => {
  const buttonProps: ButtonProps = {
    type: 'primary',
    size: 'large'
  }
  
  return (
    <div style={{ padding: 20 }}>
      <Button {...buttonProps}>TypeScript Button</Button>
    </div>
  )
}

render(<App />)
`
</script>

<template>
  <SandpackEditor :code="code" />
</template>
```

### Q4: 如何加载 Arco Design 的样式？

通过 `externalResources` 加载 CSS：

```vue
<script setup>
const code = `
import { Button, Message } from '@arco-design/web-react'

const App = () => {
  return (
    <div style={{ padding: 20 }}>
      <Button 
        type="primary" 
        onClick={() => Message.success('成功！')}
      >
        显示消息
      </Button>
    </div>
  )
}

render(<App />)
`

const dependencies = {
  '@arco-design/web-react': '^2.63.0'
}

const externalResources = [
  'https://unpkg.com/@arco-design/web-react@2.63.0/dist/css/arco.css'
]
</script>

<template>
  <SandpackEditor 
    :code="code"
    :dependencies="dependencies"
    :externalResources="externalResources"
  />
</template>
```

### Q5: 预览区域太小，如何调整？

三种方式：

1. **拖动分隔条**：鼠标拖动预览区和编辑器之间的分隔条
2. **双击重置**：双击分隔条恢复默认高度（600px）
3. **修改默认高度**：如果需要全局调整，可以修改组件源码中的 `previewHeight` 初始值

## 技术实现细节

### Sandpack Provider 配置

组件使用 `sandpack-vue3` 的 Provider 模式：

```vue:19-82:src/components/sandpack-editor.vue
<SandpackProvider template="react" :files="files" :custom-setup="setup">
  <!-- 预览区域包装器 -->
  <PreviewSectionWrapper
    :is-resizing="isResizing"
    :preview-height="previewHeight"
    :selected-device="selectedDevice"
    @update:selected-device="selectedDevice = $event"
  />

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
        <NButton
          text
          :type="isEditorExpanded ? 'primary' : 'default'"
          @click.stop
        >
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
</SandpackProvider>
```

### 主题适配

使用 VitePress CSS 变量确保主题切换时样式自动更新：

```css:519-526:src/components/sandpack-editor.vue
:deep(.cm-gutters) {
  background: var(--vp-c-bg-soft);
  border-right: 1px solid var(--vp-c-divider);
}

:deep(.cm-lineNumbers) {
  color: var(--vp-c-text-3);
}
```

## 相关组件

- [LiveEditor](./live-editor.md) - 轻量级代码编辑器，适用于简单示例
- DeviceFrame - 设备预览框架（由 PreviewSectionWrapper 内部使用）

## 参考资源

- [Sandpack 官方文档](https://sandpack.codesandbox.io/)
- [Sandpack Vue3](https://github.com/jerrywu001/sandpack-vue3)
- [VitePress 主题开发](https://vitepress.dev/guide/custom-theme)
