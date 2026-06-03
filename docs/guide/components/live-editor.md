# LiveEditor - 实时代码编辑器

`LiveEditor` 是一个支持 React 代码实时编辑和预览的核心组件，基于 `react-live` 实现，提供即时的代码编译和渲染能力。

## 基础用法

在 Markdown 文档中直接使用 `LiveEditor` 组件：

```md
<LiveEditor sourceCodePath="../../demo/example/button.jsx"></LiveEditor>
```

<LiveEditor sourceCodePath="../../demo/example/button.jsx"></LiveEditor>

::: tip
代码文件需要放在 `docs/demo/example/` 目录下，并使用相对路径引用。
:::

## API 参数

| 参数           | 说明                              | 类型      | 默认值  |
| -------------- | --------------------------------- | --------- | ------- |
| `sourceCode`   | 源代码字符串（与 sourceCodePath 二选一） | `string`  | -       |
| `sourceCodePath` | 代码文件路径（相对路径）          | `string`  | -       |
| `hideCode`     | 是否隐藏代码编辑器                | `boolean` | `false` |
| `noStyle`      | 是否移除默认样式（边框、内边距）  | `boolean` | `false` |
| `scope`        | 传递给代码的作用域对象            | `object`  | `{}`    |

### 参数详解

#### sourceCode vs sourceCodePath

有两种方式传递代码：

**方式 1：直接传递代码字符串**

```md
<LiveEditor sourceCode="
import { Button } from '@arco-design/web-react';
render(<Button type='primary'>点击我</Button>);
"></LiveEditor>
```

**方式 2：通过文件路径加载**（推荐）

```md
<LiveEditor sourceCodePath="../../demo/example/button.jsx"></LiveEditor>
```

::: tip 推荐使用 sourceCodePath
- 代码文件独立管理，便于维护
- 支持语法高亮和代码格式化
- 可以被多个文档复用
:::

#### hideCode

控制代码编辑区域的显示：

```md
<!-- 隐藏代码，只显示预览 -->
<LiveEditor sourceCodePath="../../demo/example/button.jsx" hideCode></LiveEditor>
```

适用场景：
- 只需要展示效果，不需要查看代码
- 简化文档页面，减少信息密度
- 作为纯演示组件使用

#### noStyle

移除组件默认的边框和内边距样式：

```md
<LiveEditor sourceCodePath="../../demo/example/button.jsx" noStyle></LiveEditor>
```

适用场景：
- 自定义外观样式
- 嵌入到其他容器中
- 需要更紧凑的布局

#### scope

向代码注入自定义作用域对象：

```md
<script setup>
const customScope = {
  customData: { name: 'VitePress' },
  customFunction: () => console.log('Hello!')
}
</script>

<LiveEditor 
  sourceCode="render(<div>{customData.name}</div>)"
  :scope="customScope"
></LiveEditor>
```

::: warning 注意
`scope` 属性需要在 Vue 的 `<script setup>` 中定义，并使用 `:scope` 动态绑定。
:::

## 核心特性

### 1. 实时编译预览

代码修改后立即编译并预览效果，无需刷新页面。

**技术实现：**

```vue{4-9}
<template>
  <div class="preview-bg vp-raw">
    <ReactLivePreview
      :scope="props.scope"
      :sourceCode="code || ''"
      :noStyle="props.noStyle"
    />
  </div>
</template>
```

::: info 实现原理
使用 `react-live` 库的实时编译能力，结合 `veaury` 的 React-Vue 桥接功能：
1. 监听代码变化 (`v-model="code"`)
2. 通过 `ReactLivePreview` 实时编译 React 代码
3. 在 Vue 组件中渲染 React 组件输出
:::

### 2. 代码折叠展开

使用 Naive UI 的 `NCollapse` 组件实现代码区域的折叠和展开：

```vue{11-32}
<template>
  <NCollapse :trigger-areas="['arrow', 'main']">
    <template #header-extra>
      <div style="padding: 5px 10px">
        <NSwitch v-model:value="showSvgBg">
          <!-- 背景切换开关 -->
        </NSwitch>
      </div>
    </template>
    <NCollapseItem title="Show Code" name="1">
      <CodeWrapper
        style="height: 500px"
        v-if="!props.hideCode"
        v-model="code"
        :originCode="props.sourceCode"
      />
    </NCollapseItem>
  </NCollapse>
</template>
```

特性：
- 点击标题区域或箭头都可以展开/折叠
- 折叠时只显示预览区域，节省页面空间
- 展开后显示 500px 高度的代码编辑器

### 3. 背景切换

支持纯色背景和网格背景切换，方便查看透明组件：

```vue{14-22,61-74}
<template>
  <div class="preview-bg vp-raw" :class="{ 'svg-bg': showSvgBg }">
    <ReactLivePreview />
  </div>
  <NSwitch v-model:value="showSvgBg">
    <template #checked>
      <NIcon :component="BarcodeOutline"></NIcon>
    </template>
    <template #unchecked>
      <NIcon :component="BarcodeOutline"></NIcon>
    </template>
  </NSwitch>
</template>

<style scoped>
.svg-bg {
  --bg-color: var(--vp-c-bg-soft);
  background: repeating-linear-gradient(
    135deg,
    transparent 0px,
    transparent 32px,
    var(--bg-color) 32px,
    var(--bg-color) 64px
  );
  color: initial;
}
</style>
```

::: tip 背景切换的作用
当组件使用透明背景或白色元素时，网格背景可以更清晰地显示组件边界。
:::

### 4. 语法高亮编辑器

集成 `CodeWrapper` 组件，提供专业的代码编辑体验：

```vue{26-31}
<CodeWrapper
  style="height: 500px"
  v-if="!props.hideCode"
  v-model="code"
  :originCode="props.sourceCode"
/>
```

特性：
- 基于 Monaco Editor 的语法高亮
- 支持代码折叠
- 支持代码搜索
- 自动缩进和格式化

### 5. 主题适配

自动适配 VitePress 的明暗主题：

```vue{75-82}
<style scoped>
.preview-bg {
  width: 100%;
  border-bottom: 1px solid var(--vp-c-border);
}
.editor-container {
  border-radius: 3px;
  border: 1px solid var(--vp-c-border);
}
</style>
```

使用 VitePress 的 CSS 变量，确保在明暗主题下都有良好的视觉效果。

## 代码文件规范

演示代码文件必须遵循以下格式：

```jsx
import { Button } from '@arco-design/web-react';

const Example = () => {
  return (
    <Button type="primary">
      点击我
    </Button>
  );
};

// 必须使用 render 函数 // [!code highlight]
render(<Example />); // [!code highlight]
```

::: danger 重要规范
1. **必须使用 `render()` 函数**  
   不要使用 `export default`，必须调用 `render(<Component />)`

2. **文件放在正确的目录**  
   代码文件必须放在 `docs/demo/example/` 目录下

3. **导入第三方库**  
   可以直接导入 npm 包，如 `@arco-design/web-react`、`react`、`react-dom` 等
:::

### 样式处理

**方式 1：内联样式**

```jsx
render(
  <Button style={{ margin: '10px', padding: '20px' }}>
    按钮
  </Button>
);
```

**方式 2：CSS-in-JS**

```jsx
const styles = {
  button: {
    margin: '10px',
    padding: '20px',
    backgroundColor: '#1890ff'
  }
};

render(<Button style={styles.button}>按钮</Button>);
```

**方式 3：全局样式文件**

在 `docs/demo/example/index.css` 中定义全局样式：

```css
/* docs/demo/example/index.css */
.custom-button {
  margin: 10px;
  padding: 20px;
  background-color: #1890ff;
}
```

```jsx
// 在代码中使用
render(<Button className="custom-button">按钮</Button>);
```

## 技术实现

### React-Vue 组件桥接

`LiveEditor` 的核心技术是将 React 组件嵌入到 Vue 组件中：

```ts{38-40,54}
import { ReactLive } from '../react-components/index';
import { applyReactInVue } from 'veaury';
import { ref } from 'vue';

const props = withDefaults(defineProps<ILiveEditor>(), {
  hideCode: false,
  noStyle: false
});

const code = ref(props.sourceCode);

// 使用 veaury 转换 React 组件为 Vue 组件 // [!code highlight]
const ReactLivePreview = applyReactInVue(ReactLive); // [!code highlight]
```

::: info veaury 桥接原理
`veaury` 是一个 React-Vue 互操作库，它能够：
1. 将 React 组件包装成 Vue 组件
2. 处理 props 数据传递
3. 同步组件的生命周期
4. 实现事件通信

这使得我们可以在 VitePress (基于 Vue) 中使用 `react-live` (React 库)。
:::

### 代码实时编译

```tsx
// src/react-components/react-live.tsx
import { LiveProvider, LivePreview, LiveError } from 'react-live';

export const ReactLive = ({ sourceCode, scope }) => {
  return (
    <LiveProvider code={sourceCode} scope={scope}>
      <LivePreview />
      <LiveError />
    </LiveProvider>
  );
};
```

::: warning 性能考虑
`react-live` 在每次代码变化时都会重新编译和渲染，对于复杂组件可能会有性能开销。建议：
- 避免在一个页面使用过多 LiveEditor
- 对于纯展示的场景使用 `hideCode` 属性
- 复杂示例考虑使用 `SandpackEditor`
:::

### 类型定义

```ts
// src/types/index.ts
export interface ILiveEditor {
  sourceCode?: string;      // 源代码字符串
  sourceCodePath?: string;  // 代码文件路径
  hideCode?: boolean;       // 隐藏代码编辑器
  noStyle?: boolean;        // 移除默认样式
  scope?: Record<string, any>; // 作用域对象
}
```

## 使用示例

### 示例 1：基础按钮

```md
<LiveEditor sourceCodePath="../../demo/example/button.jsx"></LiveEditor>
```

### 示例 2：隐藏代码的纯展示

```md
<LiveEditor sourceCodePath="../../demo/example/button-status.jsx" hideCode></LiveEditor>
```

### 示例 3：自定义作用域

```md
<script setup>
const customScope = {
  userName: 'Alice',
  colors: ['red', 'blue', 'green']
}
</script>

<LiveEditor 
  :scope="customScope"
  sourceCode="
    render(
      <div>
        <h3>Hello, {userName}!</h3>
        <ul>
          {colors.map(color => <li key={color}>{color}</li>)}
        </ul>
      </div>
    );
  "
></LiveEditor>
```

### 示例 4：复杂组件演示

```jsx
// docs/demo/example/button-icons.jsx
import { Button, Space } from '@arco-design/web-react';
import { IconPlus, IconDelete, IconEdit } from '@arco-design/web-react/icon';

const Example = () => {
  return (
    <Space size="large">
      <Button type="primary" icon={<IconPlus />}>
        新增
      </Button>
      <Button type="primary" status="warning" icon={<IconEdit />}>
        编辑
      </Button>
      <Button type="primary" status="danger" icon={<IconDelete />}>
        删除
      </Button>
    </Space>
  );
};

render(<Example />);
```

```md
<LiveEditor sourceCodePath="../../demo/example/button-icons.jsx"></LiveEditor>
```

## 最佳实践

### 1. 文件组织

```
docs/
├── demo/
│   ├── example/
│   │   ├── button.jsx           # 基础示例
│   │   ├── button-status.jsx    # 状态示例
│   │   ├── button-icons.jsx     # 图标示例
│   │   └── index.css            # 全局样式
│   └── button.md                # 文档页面
```

### 2. 代码复用

将常用的组件提取到单独的文件，在多个示例中复用：

```jsx
// docs/demo/example/common/demo-container.jsx
export const DemoContainer = ({ children }) => (
  <div style={{ padding: 20, border: '1px solid #eee' }}>
    {children}
  </div>
);
```

```jsx
// docs/demo/example/button.jsx
import { DemoContainer } from './common/demo-container';
import { Button } from '@arco-design/web-react';

render(
  <DemoContainer>
    <Button>示例按钮</Button>
  </DemoContainer>
);
```

### 3. 错误处理

在示例代码中添加适当的错误处理：

```jsx
import { Button, Message } from '@arco-design/web-react';

const Example = () => {
  const handleClick = () => {
    try {
      // 业务逻辑
      Message.success('操作成功');
    } catch (error) {
      Message.error('操作失败：' + error.message);
    }
  };

  return <Button onClick={handleClick}>点击测试</Button>;
};

render(<Example />);
```

### 4. 性能优化

- 避免在 `render()` 函数中进行复杂计算
- 使用 React 的 `useMemo` 和 `useCallback` 优化性能
- 对于大量数据渲染，考虑使用虚拟列表

```jsx
import { useMemo } from 'react';
import { Table } from '@arco-design/web-react';

const Example = () => {
  // 使用 useMemo 缓存计算结果 // [!code highlight]
  const data = useMemo(() => { // [!code highlight]
    return Array.from({ length: 100 }, (_, i) => ({
      key: i,
      name: `Item ${i}`,
      value: Math.random()
    }));
  }, []); // [!code highlight]

  return <Table data={data} />;
};

render(<Example />);
```

## 常见问题

### Q: 为什么我的代码无法运行？

检查以下几点：
1. 是否使用了 `render()` 函数
2. 导入的包是否已安装
3. 代码语法是否正确
4. 是否有循环引用

### Q: 如何调试代码？

可以在代码中使用 `console.log()` 调试，输出会显示在浏览器控制台：

```jsx
const Example = () => {
  console.log('Component rendered'); // [!code highlight]
  return <Button>Test</Button>;
};

render(<Example />);
```

### Q: 可以使用 TypeScript 吗？

目前 `LiveEditor` 主要支持 JSX 格式。如需 TypeScript 支持，建议使用 `SandpackEditor` 组件。

### Q: 如何在示例中使用 Hooks？

直接使用 React Hooks：

```jsx
import { useState } from 'react';
import { Button, Input, Space } from '@arco-design/web-react';

const Example = () => {
  const [value, setValue] = useState(''); // [!code highlight]

  return (
    <Space>
      <Input 
        value={value} 
        onChange={setValue} // [!code highlight]
        placeholder="输入内容" 
      />
      <Button onClick={() => alert(value)}>
        显示输入
      </Button>
    </Space>
  );
};

render(<Example />);
```

## 相关组件

- [SandpackEditor](./sandpack-editor.md) - 在线代码编辑器

