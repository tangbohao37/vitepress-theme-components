import { type Theme } from 'vitepress';
import DynamicLayout from './components/dynamic-layout.vue';
import LiveEditor from './components/live-editor.vue';
import Mermaid from './components/mermaid.vue';
import SandpackEditor from './components/sandpack-editor.vue';
import { setVeauryOptions } from 'veaury';
import { createRoot } from 'react-dom/client';
// 通用字体
import 'vfonts/Lato.css';
// 等宽字体
import 'vfonts/FiraCode.css';

// 在应用初始化之前配置 veaury，确保支持 React 19
setVeauryOptions({
  react: {
    createRoot
  }
});

const theme: Theme = {
  Layout: DynamicLayout,
  enhanceApp(ctx) {
    ctx.app.component('LiveEditor', LiveEditor);
    ctx.app.component('Mermaid', Mermaid);
    ctx.app.component('SandpackEditor', SandpackEditor);
  }
};

export type { ISandpackEditor, AdvThemeConfig } from './types';

export default theme;
