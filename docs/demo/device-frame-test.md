---
componentName: DeviceFrame
---

# DeviceFrame 设备框架组件

> 支持多种主流移动设备框架的预览组件，包括 iPhone 14 Pro、iPhone 14、Samsung Galaxy S8 和 Google Pixel 6 Pro，带有完整的安全区支持

## 基础用法

### 独立使用设备框架

<script setup>
import { ref } from 'vue';
import { DeviceFrame } from '../../src/components';

const device = ref('iphone');
</script>

<DeviceFrame v-model="device">
  <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px;">
    <h1 style="font-size: 32px; margin: 0;">Hello!</h1>
    <p style="margin-top: 10px;">这是一个设备框架预览</p>
  </div>
</DeviceFrame>

### 与 SandpackEditor 集成使用

SandpackEditor 组件已经内置了 DeviceFrame，预览会自动显示在设备框架中：

<SandpackEditor path="button.jsx"></SandpackEditor>

## API

### DeviceFrame Props

| 属性       | 类型                                                 | 默认值   | 说明           |
| ---------- | ---------------------------------------------------- | -------- | -------------- |
| modelValue | 'iphone' \| 'iphone-14' \| 'samsung-s8' \| 'android' | 'iphone' | 当前选中的设备 |

### DeviceFrame Events

| 事件              | 参数                                                        | 说明           |
| ----------------- | ----------------------------------------------------------- | -------------- |
| update:modelValue | value: 'iphone' \| 'iphone-14' \| 'samsung-s8' \| 'android' | 设备切换时触发 |

## 特性

- ✅ 支持 iPhone 14 Pro（带刘海屏/Dynamic Island）
- ✅ 支持 iPhone 14（标准刘海屏）
- ✅ 支持 Samsung Galaxy S8（曲面屏）
- ✅ 支持 Google Pixel 6 Pro（带打孔屏）
- ✅ 完整的安全区域支持
- ✅ 响应式布局，自适应不同屏幕尺寸
- ✅ 设备切换功能
- ✅ 优雅的动画效果
- ✅ 暗色模式支持

## 设备规格

### iPhone 14 Pro

- 尺寸：428px × 868px
- 特点：Dynamic Island、圆角屏幕、侧边按钮
- 安全区：支持顶部和底部安全区域

### iPhone 14

- 尺寸：390px × 844px
- 特点：标准刘海屏、圆角屏幕、侧边按钮
- 安全区：支持顶部和底部安全区域

### Samsung Galaxy S8

- 尺寸：360px × 740px
- 特点：曲面屏、实体 Home 键、侧边按钮
- 安全区：支持顶部状态栏区域

### Google Pixel 6 Pro

- 尺寸：404px × 862px
- 特点：打孔屏、曲面屏、侧边按钮
- 安全区：支持顶部摄像头区域和底部手势条
