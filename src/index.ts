import { type Theme } from 'vitepress';
import BaseLayout from './components/base-layout.vue';
// import Test from './components/test.vue';
import LiveEditor from './components/live-editor.vue';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import { type AdvThemeConfig } from './types';

const theme: Theme = {
  Layout: BaseLayout,
  enhanceApp(ctx) {
    ctx.app.component('LiveEditor', LiveEditor);
  }
};

export { AdvThemeConfig };

export default theme;
