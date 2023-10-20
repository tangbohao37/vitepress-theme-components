import { type Theme } from 'vitepress';
import BaseLayout from './components/base-layout.vue';
import LiveEditor from './components/live-editor.vue';
import { type AdvThemeConfig } from './types';
// 通用字体
import 'vfonts/Lato.css';
// 等宽字体
import 'vfonts/FiraCode.css';

const theme: Theme = {
  Layout: BaseLayout,
  enhanceApp(ctx) {
    ctx.app.component('LiveEditor', LiveEditor);
  }
};

export { AdvThemeConfig };

export default theme;
