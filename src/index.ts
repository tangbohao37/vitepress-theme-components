import { type Theme } from 'vitepress';
// import BaseLayout from './components/base-layout.vue';
import BaseLayout from './components/dynamic-layout.vue';
import LiveEditor from './components/live-editor.vue';
import ApiTable from './components/api-table.vue';
import { type AdvThemeConfig } from './types';
// 通用字体
import 'vfonts/Lato.css';
// 等宽字体
import 'vfonts/FiraCode.css';

const theme: Theme = {
  Layout: BaseLayout,
  enhanceApp(ctx) {
    ctx.app.component('LiveEditor', LiveEditor);
    ctx.app.component('ApiTable', ApiTable);
  }
};

export { AdvThemeConfig };

export default theme;
