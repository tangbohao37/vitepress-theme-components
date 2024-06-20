<template>
  <ClientOnly>
    <template v-if="showStyle">
      <ReactLivePreview
        :scope="props.scope"
        :sourceCode="code || ''"
        :noStyle="props.noStyle"
      />
    </template>
    <template v-else>
      <div
        class="vp-raw live-editor-mobile-wrapper"
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
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%239e9e9e' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
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
