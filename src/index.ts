import { type Theme } from 'vitepress';
import DynamicLayout from './components/dynamic-layout.vue';
import LiveEditor from './components/live-editor.vue';
import DrawerLiveEditor from './components/drawer-live-editor.vue';
import MobileIframe from './components/mobile-iframe.vue';
import ApiTable from './components/api-table.vue';
import Mermaid from './components/mermaid.vue';
import { type AdvThemeConfig } from './types';
// 通用字体
import 'vfonts/Lato.css';
// 等宽字体
import 'vfonts/FiraCode.css';

const theme: Theme = {
  Layout: DynamicLayout,
  enhanceApp(ctx) {
    ctx.app.component('LiveEditor', LiveEditor);
    ctx.app.component('DrawerLiveEditor', DrawerLiveEditor);
    ctx.app.component('MobileIframe', MobileIframe);
    ctx.app.component('ApiTable', ApiTable);
    ctx.app.component('Mermaid', Mermaid);
  }
};

export { AdvThemeConfig };

export default theme;
