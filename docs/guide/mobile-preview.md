# 移动设备预览

> SandpackEditor 内置移动设备预览功能，支持 iPhone 和 Android 设备外观

## 功能特性

### 📱 设备类型
- **iPhone**: 现代 iPhone 外观，包含刘海、圆角、Home Indicator
- **Android**: 标准 Android 设备外观

### 🎯 安全区域
组件自动处理移动端安全区域：
- **顶部安全区域**: 显示状态栏（时间、信号、WiFi、电池）
- **底部安全区域**: iPhone 显示 Home Indicator

### 🔄 设备切换
点击预览区域顶部的按钮，可以在 iPhone 和 Android 之间切换

## 快速开始

### 基础示例

```vue
<SandpackEditor path="mobile-app.jsx"></SandpackEditor>
```

### 创建移动应用示例

1. 在 `docs/public/example/` 创建 JSX 文件：

```jsx
import { Button, Card } from '@arco-design/web-react';

const MobileApp = () => {
  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card title="移动应用">
        <p>这是移动端内容</p>
        <Button type="primary" long>点击按钮</Button>
      </Card>
    </div>
  );
};

render(<MobileApp />);
```

2. 在 Markdown 中引用：

```md
<SandpackEditor path="your-app.jsx"></SandpackEditor>
```

## 设计建议

### 移动端适配
考虑到安全区域，建议：
1. 主要内容避开顶部状态栏区域
2. 底部按钮留出 Home Indicator 空间
3. 使用全宽布局（100%）
4. 设置合适的内边距（padding: 20px）

### 颜色方案
- 使用浅色背景（`#f5f5f5`）区分内容区
- 卡片使用白色背景
- 支持暗色模式

### 响应式设计
组件会自动缩放以适应不同屏幕：
- 桌面端：原始尺寸
- 平板端：缩放到 85%
- 移动端：缩放到 70%

## 技术细节

### 设备尺寸
- **iPhone**: 393 × 852 px
- **Android**: 412 × 915 px

### 安全区域尺寸
- iPhone 顶部：54px（含刘海）
- iPhone 底部：34px（含 Home Indicator）
- Android 顶部：44px
- Android 底部：24px

## 示例

### 完整移动应用
<SandpackEditor path="button-status.jsx"></SandpackEditor>

### 按钮组件
<SandpackEditor path="button.jsx"></SandpackEditor>
