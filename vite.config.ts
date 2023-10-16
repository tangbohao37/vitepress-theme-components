import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: [
        resolve(__dirname, 'src/components/base-layout.vue'),
        resolve(__dirname, 'src/components/live-editor.vue'),
        resolve(__dirname, 'src/components/record-drawer.vue')
      ],
      name: 'vue-component'
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue']
    }
  }
});
