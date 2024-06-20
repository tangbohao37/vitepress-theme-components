<template>
  <div class="vp-raw wrapper" :class="{ 'editor-container': !props.noStyle }">
    <ClientOnly>
      <div class="preview-bg" :class="{ 'svg-bg': showSvgBg }">
        <ReactLivePreview
          :scope="props.scope"
          :sourceCode="code || ''"
          :noStyle="props.noStyle"
        />
      </div>
      <NCollapse :trigger-areas="['arrow', 'main']">
        <template #header-extra>
          <div style="padding: 5px 10px">
            <NSwitch v-model:value="showSvgBg">
              <template #checked>
                <NIcon :component="BarcodeOutline"></NIcon>
              </template>
              <template #unchecked>
                <NIcon :component="BarcodeOutline"></NIcon>
              </template>
            </NSwitch>
          </div>
        </template>
        <NCollapseItem title="Show Code" name="1">
          <CodeWrapper
            style="height: 500px"
            v-if="!props.hideCode"
            v-model="code"
            :originCode="props.sourceCode"
          />
        </NCollapseItem>
      </NCollapse>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ReactLive } from '../react-components/index';
import CodeWrapper from './code-wrapper.vue';
import { applyReactInVue } from 'veaury';
import { ref } from 'vue';
import { type ILiveEditor } from '../types';
import { NCollapse, NCollapseItem, NIcon, NSwitch } from 'naive-ui';
import { BarcodeOutline } from '@vicons/ionicons5';

const props = withDefaults(defineProps<ILiveEditor>(), {
  hideCode: false,
  noStyle: false
});

const code = ref(props.sourceCode);
const showSvgBg = ref(false);
// 转换为 Vue 组件
const ReactLivePreview = applyReactInVue(ReactLive);
</script>

<style scoped>
.wrapper {
  margin: 20px 0;
}
.svg-bg {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%239e9e9e' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
.preview-bg {
  border-bottom: 1px solid var(--vp-c-border);
}
.editor-container {
  border-radius: 3px;
  border: 1px solid var(--vp-c-border);
}
</style>
