<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue';
import { NButton, NPopover, NQrCode } from 'naive-ui';
import { QrCode } from '@vicons/ionicons5';
import MobileScreen from './mobile-screen.vue';

export type Message = {
  showSvgBg: boolean;
  showCode?: boolean;
};

const props = defineProps<{ src: string }>();
const iframe = ref();
const active = ref(true);
const showCode = ref();

const url = computed(() => {
  const baseUrl = new URL(location.href);
  return new URL(props.src, baseUrl);
});

const adjustIframeHeight = () => {
  if (
    iframe.value &&
    iframe.value.contentWindow &&
    iframe.value.contentDocument
  ) {
    iframe.value.style.height =
      iframe.value.contentDocument.body.scrollHeight + 'px';
  }
};

const receiveMessage = (event) => {
  if (event.origin !== location.origin) {
    return;
  }
  if (event.data.showCode !== undefined) {
    showCode.value = event.data.showCode;
  }
};

onMounted(() => {
  window.addEventListener('message', receiveMessage);
});

onUnmounted(() => {
  window.removeEventListener('message', receiveMessage);
});

const sendMessage = (message: Message) => {
  iframe.value?.contentWindow.postMessage(message, location.origin);
};

watchEffect(
  () => {
    sendMessage({ showSvgBg: active.value, showCode: showCode.value });
  },
  { flush: 'sync' }
);
</script>

<template>
  <div class="iframe-wrapper">
    <ClientOnly>
      <div class="iframe-tag">
        <NPopover trigger="hover" style="width: 150px">
          <template #trigger>
            <a :href="url.href + '?noStyle=true'" target="_blank">
              <NButton quaternary type="primary">
                <template #icon>
                  <QrCode />
                </template>
                iframe scope
              </NButton>
            </a>
          </template>
          <NQrCode
            :value="url.href + '?noStyle=true'"
            color="#18a058"
          ></NQrCode>
        </NPopover>
      </div>
      <MobileScreen
        class="vp-raw"
        v-model:active="active"
        v-model:show-code="showCode"
      >
        <iframe ref="iframe" data-why :src="src" allowtransparency="true">
          <slot />
        </iframe>
      </MobileScreen>
    </ClientOnly>
  </div>
</template>

<style scoped>
.iframe-wrapper {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #b2b2b2;
  border-radius: 0.5rem;
  margin: 10px auto;
}
.iframe-tag {
  background-color: #444444;
  padding: 5px 10px;
  color: #fff;
  margin-bottom: 10px;
}
iframe[data-why] {
  display: inline-block;
  width: 100%;
  height: 100%;
  border: none;
}

.dark iframe[data-why],
.dark {
  border-color: #303030;
}
</style>
