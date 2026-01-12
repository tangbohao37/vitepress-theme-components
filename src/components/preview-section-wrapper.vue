<template>
  <SandpackLayout
    ref="previewSectionRef"
    class="preview-section"
    :class="{
      'is-resizing': isResizing
    }"
    :style="{ height: `${previewHeight}px` }"
  >
    <div class="preview-content">
      <!-- 设备预览框架 -->
      <DeviceFramePreview
        :model-value="selectedDevice"
        @update:model-value="handleDeviceChange"
      >
        <SandpackPreview
          style="width: 100%; height: 100%"
          :show-refresh-button="props.showRefreshButton"
          :show-restart-button="props.showRestartButton"
          :show-sandpack-error-overlay="props.showSandpackErrorOverlay"
        />
      </DeviceFramePreview>
    </div>
  </SandpackLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { SandpackPreview, SandpackLayout } from 'sandpack-vue3';
import DeviceFramePreview from './device-frame-preview.vue';
import type { DeviceType } from '../types';

// Props
const props = withDefaults(
  defineProps<{
    isResizing: boolean;
    previewHeight: number;
    selectedDevice: DeviceType;
    showRefreshButton?: boolean;
    showRestartButton?: boolean;
    showSandpackErrorOverlay?: boolean;
  }>(),
  {
    showRefreshButton: true,
    showRestartButton: true,
    showSandpackErrorOverlay: true
  }
);

// Emits
const emit = defineEmits<{
  'update:selected-device': [value: DeviceType];
  'set-ref': [el: HTMLElement | null];
}>();

// Ref
const previewSectionRef = ref<HTMLElement | null>(null);

// 处理设备切换
const handleDeviceChange = (val: DeviceType) => {
  emit('update:selected-device', val);
};

// 监听 ref 变化并通知父组件
watch(
  previewSectionRef,
  (el) => {
    emit('set-ref', el);
  },
  { immediate: true }
);
</script>

<style scoped>
/* 预览区域 */
.preview-section {
  position: relative;
  background: var(--vp-c-bg-soft);
  overflow: auto;
  transition: height 0.15s ease-out;
  scrollbar-width: thin;
  scrollbar-color: var(--vp-c-divider) transparent;
}

/* 拖动时禁用transition，确保丝滑体验 */
.preview-section.is-resizing {
  transition: none;
}

/* 拖动时防止iframe和其他元素干扰 */
.preview-section.is-resizing * {
  pointer-events: none !important;
}

.preview-section::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.preview-section::-webkit-scrollbar-track {
  background: transparent;
}

.preview-section::-webkit-scrollbar-thumb {
  background: var(--vp-c-divider);
  border-radius: 4px;
}

.preview-section::-webkit-scrollbar-thumb:hover {
  background: var(--vp-c-text-3);
}

.preview-content {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  min-height: 100%;
  padding: 24px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .preview-content {
    padding: 16px;
  }
}
</style>
