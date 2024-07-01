<template>
  <div class="wrapper" :class="{ 'editor-container': !props.noStyle }">
    <ClientOnly>
      <div class="preview-bg vp-raw" :class="{ 'svg-bg': showSvgBg }">
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
  --bg-color: var(
    --vp-c-bg-soft
  ); /* Define the custom property for background color */
  background: repeating-linear-gradient(
    135deg,
    transparent 0px,
    transparent 32px,
    var(--bg-color) 32px,
    var(--bg-color) 64px
  );
  /* Set the color property separately if needed */
  color: initial; /* Reset the color so it does not inherit the parent color */
}
.preview-bg {
  width: 100%;
  border-bottom: 1px solid var(--vp-c-border);
}
.editor-container {
  border-radius: 3px;
  border: 1px solid var(--vp-c-border);
}
</style>
