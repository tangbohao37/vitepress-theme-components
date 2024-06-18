<script setup lang="ts">
import { computed, ref } from 'vue';
import { NButton, NPopover, NQrCode } from 'naive-ui';
import { QrCode } from '@vicons/ionicons5';
const props = defineProps<{ src: string }>();
const iframe = ref();

const url = computed(() => {
  const baseUrl = new URL(location.href);
  return new URL(props.src, baseUrl);
});
</script>

<template>
  <ClientOnly>
    <div class="iframe-wrapper">
      <div class="iframe-tag">
        <NPopover trigger="hover" style="width: 150px">
          <template #trigger>
            <NButton quaternary type="primary">
              <template #icon>
                <QrCode />
              </template>
              iframe scope
            </NButton>
          </template>
          <NQrCode :value="url.href" color="#18a058"></NQrCode>
        </NPopover>
      </div>

      <iframe class="iframe-box" ref="iframe" data-why :src="src">
        <slot />
      </iframe>
    </div>
  </ClientOnly>
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
  height: 900px;
  border: none;
  /* border: 1px solid #b2b2b2;
  background-color: #a2a2a2;
  border-radius: 0.5rem; */
}

.dark iframe[data-why],
.dark {
  border-color: #303030;
}
</style>
