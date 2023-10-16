import { demoBlockPlugin } from './plugins/index.js';
import { defineConfig } from 'vitepress';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import IconsResolver from 'unplugin-icons/resolver';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Icons from 'unplugin-icons/vite';
import path from 'path';

const baseConfig = defineConfig({
  markdown: {
    config(md) {
      md.use(demoBlockPlugin);
    }
  },
  vite: {
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver(), IconsResolver()],
        dts: path.resolve('../auto-imports.d.ts')
      }),
      Components({
        resolvers: [ElementPlusResolver(), IconsResolver()],
        dts: path.resolve('../components.d.ts')
      }),
      Icons({
        autoInstall: true
      })
    ]
  }
});

export { baseConfig };
