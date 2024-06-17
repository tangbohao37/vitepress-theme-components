import { type Theme } from 'vitepress';
import DynamicLayout from './components/dynamic-layout.vue';
import LiveEditor from './components/live-editor.vue';
import LiveEditorMobile from './components/live-editor-mobile.vue';
import Iframe from './components/iframe.vue';
import ApiTable from './components/api-table.vue';
import { type AdvThemeConfig } from './types';
// 通用字体
import 'vfonts/Lato.css';
// 等宽字体
import 'vfonts/FiraCode.css';

const theme: Theme = {
  Layout: DynamicLayout,
  enhanceApp(ctx) {
    ctx.app.component('LiveEditor', LiveEditor);
    ctx.app.component('LiveEditorMobile', LiveEditorMobile);
    ctx.app.component('Iframe', Iframe);
    ctx.app.component('ApiTable', ApiTable);
  }
};

export { AdvThemeConfig };

export default theme;
