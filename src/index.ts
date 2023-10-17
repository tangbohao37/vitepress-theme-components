import { type Theme } from 'vitepress';
import BaseLayout from './components/base-layout.vue';
import LiveEditor from './components/live-editor.vue';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import { type AdvThemeConfig } from './types';
import ElementPlus from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const theme: Theme = {
  Layout: BaseLayout,
  enhanceApp(ctx) {
    ctx.app.component('LiveEditor', LiveEditor);
    ctx.app.use(ElementPlus);
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      ctx.app.component(key, component);
    }
  }
};

export { AdvThemeConfig };

export default theme;
