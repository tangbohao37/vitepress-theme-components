<template>
  <SandpackLayout
    ref="previewSectionRef"
    class="preview-section"
    :class="{
      'is-resizing': isResizing,
      'is-loading': shouldDisableScroll
    }"
    :style="{ height: `${previewHeight}px` }"
  >
    <div class="preview-content">
      <!-- 设备预览框架 -->
      <DeviceFramePreview
        :model-value="selectedDevice"
        @update:model-value="handleDeviceChange"
      >
        <SandpackPreview style="width: 100%; height: 100%" />
      </DeviceFramePreview>
    </div>
  </SandpackLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  useSandpack,
  SandpackPreview,
  useSandpackShell,
  SandpackLayout
} from 'sandpack-vue3';
import DeviceFramePreview from './device-frame-preview.vue';
import type { DeviceType } from '../types';

// Props
const props = defineProps<{
  isResizing: boolean;
  previewHeight: number;
  selectedDevice: DeviceType;
}>();

// Emits
const emit = defineEmits<{
  'update:selected-device': [value: DeviceType];
  'set-ref': [el: HTMLElement | null];
}>();

// Sandpack 状态
const { sandpack } = useSandpack();
const { restart } = useSandpackShell();

// Ref
const previewSectionRef = ref<HTMLElement | null>(null);

// 计算状态
const status = computed(() => sandpack.status);

// 监听 status 变化并打印
watch(
  status,
  (newStatus, oldStatus) => {
    console.log('Sandpack status 更新:', {
      旧值: oldStatus,
      新值: newStatus,
      时间: new Date().toLocaleTimeString()
    });
  },
  { immediate: true }
);

// 📌 重要说明：Sandpack 在实时预览场景的状态流转
// 正常流程：initial → idle → running → idle (循环)
// 'done' 状态通常不会出现在实时预览中，它主要用于：
//   - SandpackTests 测试完成
//   - 一次性构建任务完成
// 实时预览编译完成后会直接回到 'idle' 状态，而不是 'done'
const isLoading = computed(() => status.value === 'initial');
const isTimeout = computed(() => status.value === 'timeout');
const isIdle = computed(() => status.value === 'idle');

const shouldDisableScroll = computed(() => isLoading.value || isTimeout.value);

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

/* 加载状态时禁用滚动 */
.preview-section.is-loading {
  overflow: hidden;
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
