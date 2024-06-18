<template>
  <div class="live-editor-mobile-wrapper" id="live-editor-mobile-wrapper">
    <template v-if="isMobile()">
      <ReactLivePreview
        :scope="props.scope"
        :sourceCode="code || ''"
        :noStyle="props.noStyle"
      />
    </template>
    <template v-else>
      <MobileScreen class="vp-raw">
        <ReactLivePreview
          :scope="props.scope"
          :sourceCode="code || ''"
          :noStyle="props.noStyle"
        />
      </MobileScreen>
      <NButton @click="showDrawer = !showDrawer">
        <template #icon>
          <NIcon><LogInOutline /></NIcon>
        </template>
        Show Code
      </NButton>
      <NDrawer
        v-model:show="showDrawer"
        placement="left"
        width="90%"
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
    </template>
  </div>
</template>

<script setup lang="ts">
import { ReactLive } from '../react-components/index';
import CodeWrapper from './code-wrapper.vue';
import { applyReactInVue } from 'veaury';
import { type ILiveEditor } from '../types';
import MobileScreen from './mobile-screen.vue';
import { ref } from 'vue';
import { NButton, NDrawer, NDrawerContent, NIcon } from 'naive-ui';
import { LogInOutline } from '@vicons/ionicons5';

const props = withDefaults(defineProps<ILiveEditor>(), {
  hideCode: false,
  noStyle: false
});
const showDrawer = ref(false);
const code = ref(props.sourceCode);

// 转换为 Vue 组件
const ReactLivePreview = applyReactInVue(ReactLive);

const isMobile = () => {
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera;
  const isMobileDevice =
    /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );
  const isSmallScreen = window.innerWidth <= 800 && window.innerHeight <= 600;
  return isMobileDevice || isSmallScreen;
};
</script>

<style scoped>
.live-editor-mobile-wrapper {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.code-wrapper {
  width: 100%;
  height: 100%;
}
</style>
