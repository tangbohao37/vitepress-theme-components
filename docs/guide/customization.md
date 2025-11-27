---
hideRecord: true
---

# 主题定制指南

本指南将帮助你了解如何定制 `vitepress-theme-components` 主题，包括样式定制、布局修改和功能扩展。

## 主题架构

### 布局系统

主题采用分层布局架构：

```
DynamicLayout (动态布局)
├── BaseLayout (基础布局)
│   └── VitePress 默认布局
└── EmptyLayout (空布局)
    └── 自定义页面布局
```

### 组件层次

```typescript
// src/index.ts
const theme: Theme = {
  Layout: DynamicLayout,
  enhanceApp(ctx) {
    // 全局组件注册
    ctx.app.component('LiveEditor', LiveEditor);
    ctx.app.component('DrawerLiveEditor', DrawerLiveEditor);
    ctx.app.component('MobileIframe', MobileIframe);
    ctx.app.component('ApiTable', ApiTable);
    ctx.app.component('Mermaid', Mermaid);
  }
};
```

## 样式定制

### 1. CSS 变量覆盖

主题继承了 VitePress 的 CSS 变量系统，你可以通过覆盖这些变量来定制样式：

```css
/* .vitepress/theme/custom.css */
:root {
  /* 主色调 */
  --vp-c-brand-1: #646cff;
  --vp-c-brand-2: #747bff;
  --vp-c-brand-3: #535bf2;
  
  /* 背景色 */
  --vp-c-bg: #ffffff;
  --vp-c-bg-alt: #f6f6f7;
  --vp-c-bg-soft: #f6f6f7;
  
  /* 边框色 */
  --vp-c-border: #c2c2c4;
  --vp-c-divider: #e2e2e3;
  
  /* 文字色 */
  --vp-c-text-1: #213547;
  --vp-c-text-2: #476582;
  --vp-c-text-3: #7c7c7c;
}

/* 暗色主题 */
.dark {
  --vp-c-bg: #1b1b1f;
  --vp-c-bg-alt: #161618;
  --vp-c-bg-soft: #202127;
  
  --vp-c-border: #3c3f44;
  --vp-c-divider: #2e2e32;
  
  --vp-c-text-1: #ffffff;
  --vp-c-text-2: #a8a8a8;
  --vp-c-text-3: #8e8e8e;
}
```

### 2. 组件样式定制

#### LiveEditor 样式定制

```css
/* 自定义 LiveEditor 样式 */
.react-live-comp-wrapper {
  border-radius: 8px;
  overflow: hidden;
}

.react-live-comp-demo-wrapper {
  padding: 24px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-border);
}

/* 代码编辑器样式 */
.monaco-editor {
  border-radius: 0 0 8px 8px;
}

/* 预览背景切换 */
.svg-bg {
  background: repeating-linear-gradient(
    135deg,
    transparent 0px,
    transparent 32px,
    var(--vp-c-bg-soft) 32px,
    var(--vp-c-bg-soft) 64px
  );
}
```

#### ApiTable 样式定制

```css
/* API 表格样式 */
.api-table {
  margin: 16px 0;
}

.api-table table {
  width: 100%;
  border-collapse: collapse;
}

.api-table th,
.api-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--vp-c-border);
}

.api-table th {
  background: var(--vp-c-bg-soft);
  font-weight: 600;
}
```

### 3. 引入自定义样式

```typescript
// .vitepress/theme/index.ts
import theme from 'vitepress-theme-components';
import './custom.css';

export default theme;
```

## 布局定制

### 1. 自定义布局组件

创建自定义布局组件：

```vue
<!-- .vitepress/theme/CustomLayout.vue -->
<template>
  <div class="custom-layout">
    <header class="custom-header">
      <!-- 自定义头部 -->
    </header>
    
    <main class="custom-main">
      <Content />
    </main>
    
    <footer class="custom-footer">
      <!-- 自定义底部 -->
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Content } from 'vitepress';
</script>

<style scoped>
.custom-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.custom-main {
  flex: 1;
  padding: 20px;
}
</style>
```

### 2. 注册自定义布局

```typescript
// .vitepress/theme/index.ts
import theme from 'vitepress-theme-components';
import CustomLayout from './CustomLayout.vue';

export default {
  extends: theme,
  Layout: CustomLayout,
  enhanceApp(ctx) {
    // 继承原有的组件注册
    theme.enhanceApp?.(ctx);
    
    // 注册自定义组件
    ctx.app.component('CustomComponent', CustomComponent);
  }
};
```

### 3. 条件布局

基于页面路径使用不同布局：

```vue
<!-- .vitepress/theme/ConditionalLayout.vue -->
<template>
  <CustomLayout v-if="isCustomPage" />
  <DynamicLayout v-else />
</template>

<script setup lang="ts">
import { useRoute } from 'vitepress';
import { computed } from 'vue';
import DynamicLayout from 'vitepress-theme-components/lib/components/dynamic-layout.vue';
import CustomLayout from './CustomLayout.vue';

const route = useRoute();
const isCustomPage = computed(() => {
  return route.path.startsWith('/custom/');
});
</script>
```

## 组件扩展

### 1. 扩展现有组件

```vue
<!-- .vitepress/theme/ExtendedLiveEditor.vue -->
<template>
  <div class="extended-live-editor">
    <div class="editor-toolbar">
      <button @click="resetCode">重置代码</button>
      <button @click="copyCode">复制代码</button>
    </div>
    
    <LiveEditor v-bind="$attrs" :sourceCode="currentCode" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import LiveEditor from 'vitepress-theme-components/lib/components/live-editor.vue';

const props = defineProps<{
  sourceCode?: string;
}>();

const currentCode = ref(props.sourceCode);

const resetCode = () => {
  currentCode.value = props.sourceCode;
};

const copyCode = async () => {
  await navigator.clipboard.writeText(currentCode.value || '');
};

watch(() => props.sourceCode, (newCode) => {
  currentCode.value = newCode;
});
</script>
```

### 2. 创建新组件

```vue
<!-- .vitepress/theme/CodeComparison.vue -->
<template>
  <div class="code-comparison">
    <div class="comparison-header">
      <h3>代码对比</h3>
    </div>
    
    <div class="comparison-content">
      <div class="before-section">
        <h4>修改前</h4>
        <LiveEditor :sourceCode="beforeCode" hideCode />
      </div>
      
      <div class="after-section">
        <h4>修改后</h4>
        <LiveEditor :sourceCode="afterCode" hideCode />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LiveEditor from 'vitepress-theme-components/lib/components/live-editor.vue';

defineProps<{
  beforeCode: string;
  afterCode: string;
}>();
</script>

<style scoped>
.code-comparison {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  overflow: hidden;
  margin: 20px 0;
}

.comparison-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--vp-c-border);
}

.before-section,
.after-section {
  background: var(--vp-c-bg);
  padding: 16px;
}
</style>
```

## 配置扩展

### 1. 扩展主题配置

```typescript
// types/theme.ts
import { AdvThemeConfig } from 'vitepress-theme-components';

export interface ExtendedThemeConfig extends AdvThemeConfig {
  // 自定义配置
  customFeatures?: {
    enableCodeComparison?: boolean;
    enableAdvancedSearch?: boolean;
    analytics?: {
      provider: 'google' | 'baidu';
      id: string;
    };
  };
  
  // 社交链接
  socialLinks?: {
    github?: string;
    twitter?: string;
    discord?: string;
  };
}
```

### 2. 使用扩展配置

```typescript
// .vitepress/config.ts
import { defineConfigWithTheme } from 'vitepress';
import { baseConfig } from 'vitepress-theme-components/config';
import { ExtendedThemeConfig } from './types/theme';

export default defineConfigWithTheme<ExtendedThemeConfig>({
  extends: baseConfig,
  
  themeConfig: {
    // 原有配置
    changelog: {
      path: '/CHANGELOG.md'
    },
    coverage: {
      path: '/coverage-summary.json'
    },
    
    // 扩展配置
    customFeatures: {
      enableCodeComparison: true,
      enableAdvancedSearch: true,
      analytics: {
        provider: 'google',
        id: 'GA_MEASUREMENT_ID'
      }
    },
    
    socialLinks: {
      github: 'https://github.com/your-username/your-repo',
      twitter: 'https://twitter.com/your-username'
    }
  }
});
```

## 插件集成

### 1. 集成第三方插件

```typescript
// .vitepress/config.ts
import { defineConfig } from 'vitepress';
import { baseConfig } from 'vitepress-theme-components/config';
import { searchPlugin } from 'vitepress-plugin-search';
import { pwaPlugin } from 'vitepress-plugin-pwa';

export default defineConfig({
  extends: baseConfig,
  
  vite: {
    plugins: [
      searchPlugin({
        // 搜索配置
      }),
      pwaPlugin({
        // PWA 配置
      })
    ]
  }
});
```

### 2. 自定义 Markdown 插件

```typescript
// plugins/custom-markdown.ts
import { MarkdownRenderer } from 'vitepress';

export function customMarkdownPlugin(md: MarkdownRenderer) {
  // 自定义容器
  md.use(require('markdown-it-container'), 'custom-tip', {
    render: function (tokens, idx) {
      const token = tokens[idx];
      if (token.nesting === 1) {
        return '<div class="custom-tip">\n';
      } else {
        return '</div>\n';
      }
    }
  });
  
  // 自定义渲染规则
  md.renderer.rules.strong_open = () => '<strong class="custom-strong">';
  md.renderer.rules.strong_close = () => '</strong>';
}
```

## 国际化支持

### 1. 多语言配置

```typescript
// .vitepress/config.ts
export default defineConfig({
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '指南', link: '/guide/' },
          { text: '组件', link: '/components/' }
        ]
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/' },
          { text: 'Components', link: '/en/components/' }
        ]
      }
    }
  }
});
```

### 2. 组件国际化

```vue
<!-- components/I18nComponent.vue -->
<template>
  <div>
    <h2>{{ t('component.title') }}</h2>
    <p>{{ t('component.description') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();
</script>
```

## 性能优化

### 1. 代码分割

```typescript
// .vitepress/theme/index.ts
import { defineAsyncComponent } from 'vue';

export default {
  extends: theme,
  enhanceApp(ctx) {
    // 异步加载大型组件
    ctx.app.component('HeavyComponent', defineAsyncComponent(
      () => import('./components/HeavyComponent.vue')
    ));
  }
};
```

### 2. 资源优化

```typescript
// .vitepress/config.ts
export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'monaco-editor': ['monaco-editor'],
            'react-live': ['react-live'],
            'mermaid': ['mermaid']
          }
        }
      }
    }
  }
});
```

## 部署定制

### 1. 构建优化

```typescript
// .vitepress/config.ts
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  // 静态资源处理
  assetsDir: 'static',
  
  // 基础路径
  base: '/your-project/'
});
```

### 2. CDN 配置

```typescript
// .vitepress/config.ts
export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        external: ['react', 'react-dom', 'vue'],
        output: {
          globals: {
            'react': 'React',
            'react-dom': 'ReactDOM',
            'vue': 'Vue'
          }
        }
      }
    }
  },
  
  head: [
    ['script', { src: 'https://unpkg.com/react@18/umd/react.production.min.js' }],
    ['script', { src: 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js' }],
    ['script', { src: 'https://unpkg.com/vue@3/dist/vue.global.prod.js' }]
  ]
});
```

## 最佳实践

### 1. 组件设计原则

- **单一职责**：每个组件只负责一个功能
- **可复用性**：设计通用的、可配置的组件
- **可访问性**：遵循 WCAG 无障碍指南
- **性能优先**：避免不必要的重渲染

### 2. 样式管理

- **CSS 变量**：使用 CSS 变量实现主题切换
- **作用域样式**：使用 scoped 样式避免污染
- **响应式设计**：确保在各种设备上的良好体验

### 3. 文档维护

- **版本控制**：记录每次定制的变更
- **文档同步**：保持定制文档与代码同步
- **示例完整**：提供完整的使用示例

通过这个定制指南，你可以根据项目需求灵活地定制主题的各个方面，创建独特的文档体验。
