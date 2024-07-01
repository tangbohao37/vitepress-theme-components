<template>
  <ClientOnly>
    <div class="vp-raw">
      <template v-if="showStyle">
        <ReactLivePreview
          :scope="props.scope"
          :sourceCode="code || ''"
          :noStyle="props.noStyle"
        />
      </template>
      <template v-else>
        <div
          class="live-editor-mobile-wrapper"
          id="live-editor-mobile-wrapper"
          :class="{ 'svg-bg': showSvgBg }"
        >
          <ReactLivePreview
            :scope="props.scope"
            :sourceCode="code || ''"
            :noStyle="props.noStyle"
          />
          <NDrawer
            display-directive="show"
            v-model:show="showCode"
            placement="left"
            width="90%"
            :mask-closable="false"
            closable
            :trap-focus="false"
            :block-scroll="false"
            to="#live-editor-mobile-wrapper"
          >
            <NDrawerContent>
              <CodeWrapper
                class="code-wrapper"
                v-if="!props.hideCode"
                v-model="code"
                :originCode="props.sourceCode"
              />
            </NDrawerContent>
          </NDrawer>
        </div>
      </template>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ReactLive } from '../react-components/index';
import CodeWrapper from './code-wrapper.vue';
import { applyPureReactInVue } from 'veaury';
import { type ILiveEditor } from '../types';
import { computed, onMounted, ref, watchEffect } from 'vue';
import { NDrawer, NDrawerContent } from 'naive-ui';

const props = withDefaults(defineProps<ILiveEditor>(), {
  hideCode: false,
  noStyle: false
});

const showSvgBg = ref(true);
const showCode = ref(false);
const code = ref(props.sourceCode);

// 转换为 Vue 组件
const ReactLivePreview = applyPureReactInVue(ReactLive);

const showStyle = computed(() => {
  const queryString = window.location.search;
  // 创建 URLSearchParams 对象
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get('noStyle') === 'true';
});

// const isMobile = () => {
//   if (window) {
//     const userAgent =
//       navigator.userAgent || navigator.vendor || (window as any).opera;
//     const isMobileDevice =
//       /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
//         userAgent
//       );
//     const isSmallScreen = window.innerWidth <= 800 && window.innerHeight <= 600;
//     return isMobileDevice || isSmallScreen;
//   }
//   return false;
// };

const receiveMessage = (event) => {
  if (event.origin !== location.origin) {
    return;
  }
  if (event.data.showSvgBg !== undefined) {
    showSvgBg.value = event.data.showSvgBg;
  }
  if (event.data.showCode !== undefined) {
    showCode.value = event.data.showCode;
  }
};

// const sendMessage = (message: any) => {
//   window.parent.postMessage(message, location.origin);
// };

// FIXME: 会引发其余组件的重渲染  showCode 更新
// watchEffect(
//   () => {
//     sendMessage({ showCode: showCode.value });
//   },
//   { flush: 'sync' }
// );

onMounted(() => {
  window.addEventListener('message', receiveMessage);
});
</script>

<style scoped>
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
.live-editor-mobile-wrapper {
  position: relative;
  overflow: auto;
  min-height: 100vh;
}
.code-wrapper {
  width: 100%;
  height: 100%;
}
</style>
