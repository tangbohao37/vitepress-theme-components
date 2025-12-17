---
componentName: DeviceFramePreview
---

# DeviceFramePreview 设备框架预览组件

> 带有状态栏和安全区域的移动设备框架预览组件，基于 `DeviceFrame` 构建

## 基础用法

### 简单示例

`DeviceFramePreview` 组件会自动添加状态栏、时间显示和 Home 指示器等 UI 元素：

<script setup>
import { ref } from 'vue';
import { DeviceFramePreview } from '../../src/components';

const device = ref('iphone');
</script>

<DeviceFramePreview v-model="device">
  <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px;">
    <h1 style="font-size: 32px; margin: 0;">Hello!</h1>
    <p style="margin-top: 10px;">这是带状态栏的设备预览</p>
    <p style="margin-top: 5px; font-size: 12px; opacity: 0.8;">切换设备查看不同效果</p>
  </div>
</DeviceFramePreview>

### 与 Sandpack 集成

可以在 `DeviceFramePreview` 中嵌入任何内容，包括 Sandpack 编辑器的预览：

```vue
<DeviceFramePreview v-model="device">
  <SandpackPreview />
</DeviceFramePreview>
```

## API

### DeviceFramePreview Props

| 属性       | 类型                                                      | 默认值   | 说明                 |
| ---------- | --------------------------------------------------------- | -------- | -------------------- |
| modelValue | 'iphone' \| 'iphone-14' \| 'samsung-s8' \| 'android'     | 'iphone' | 当前选中的设备类型   |

### DeviceFramePreview Events

| 事件              | 参数                                                        | 说明             |
| ----------------- | ----------------------------------------------------------- | ---------------- |
| update:modelValue | value: 'iphone' \| 'iphone-14' \| 'samsung-s8' \| 'android' | 设备切换时触发   |

### DeviceFramePreview Slots

| 插槽    | 说明                     |
| ------- | ------------------------ |
| default | 设备屏幕中显示的内容     |

## 特性

- ✅ 自动显示状态栏（时间、信号、WiFi、电池）
- ✅ 支持不同设备的安全区域
- ✅ iPhone 设备显示 Home 指示器
- ✅ 实时更新时间显示
- ✅ 继承 DeviceFrame 的所有设备支持
- ✅ 暗色模式自动适配

## 与 DeviceFrame 的区别

| 特性         | DeviceFrame | DeviceFramePreview |
| ------------ | ----------- | ------------------ |
| 设备外壳     | ✅          | ✅                 |
| 设备切换器   | ✅          | ✅                 |
| 状态栏       | ❌          | ✅                 |
| Home 指示器  | ❌          | ✅                 |
| 实时时间     | ❌          | ✅                 |
| 使用场景     | 纯内容展示  | 模拟真实设备界面   |

## 使用建议

- 如果只需要设备外壳和自定义内容，使用 `DeviceFrame`
- 如果需要模拟真实的设备界面（带状态栏等），使用 `DeviceFramePreview`
- 在演示应用界面时，推荐使用 `DeviceFramePreview` 以获得更真实的效果
