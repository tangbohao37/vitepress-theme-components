<template>
  <div class="device-frame-wrapper">
    <!-- 设备切换器 -->
    <div class="device-switcher">
      <button
        v-for="device in devices"
        :key="device.value"
        :class="['device-btn', { active: modelValue === device.value }]"
        @click="$emit('update:modelValue', device.value)"
      >
        {{ device.label }}
      </button>
    </div>

    <!-- 统一的设备框架结构 -->
    <div :class="['device', deviceClass]">
      <div class="device-frame">
        <div class="device-screen">
          <slot></slot>
        </div>
      </div>
      <div class="device-stripe"></div>
      <div class="device-header"></div>
      <div class="device-sensors"></div>
      <div class="device-btns"></div>
      <div class="device-power"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import 'devices.css/docs/assets/css/devices.min.css';
import type { DeviceType } from '../types';

// Props
const props = defineProps<{
  modelValue?: DeviceType;
}>();

// Emits
defineEmits<{
  'update:modelValue': [value: DeviceType];
}>();

// 设备类型到 CSS class 的映射
const deviceClassMap: Record<DeviceType, string> = {
  'iphone': 'device-iphone-14-pro',
  'iphone-14': 'device-iphone-14',
  'samsung-s8': 'device-galaxy-s8',
  'android': 'device-google-pixel-6-pro'
};

// 动态计算设备 class
const deviceClass = computed(() => 
  deviceClassMap[props.modelValue || 'iphone']
);

// 设备列表
const devices = [
  { label: 'iPhone 14 Pro', value: 'iphone' as const },
  { label: 'iPhone 14', value: 'iphone-14' as const },
  { label: 'Galaxy S8', value: 'samsung-s8' as const },
  { label: 'Pixel 6 Pro', value: 'android' as const }
];
</script>

<style scoped>
.device-frame-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 16px;
  /* background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft) 0%,
    var(--vp-c-bg) 100%
  ); */
  border-radius: 12px;
  overflow-x: auto;
}

/* 设备切换器样式 */
.device-switcher {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: var(--vp-c-bg);
  border-radius: 10px;
  border: 1px solid var(--vp-c-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.device-btn {
  padding: 8px 20px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.device-btn:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  transform: translateY(-1px);
}

.device-btn.active {
  background: var(--vp-c-brand);
  color: #fff;
  box-shadow: 0 2px 8px rgba(var(--vp-c-brand-rgb), 0.3);
}

/* 设备框架容器 */
.device {
  margin: 0 auto;
  position: relative;
  /* filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15)); */
}

/* 自定义设备屏幕内容样式 */
:deep(.device-screen) {
  /* 确保内容填充整个屏幕区域 */
  display: flex;
  flex-direction: column;
  overflow: auto;
  background: #fff;

  /* 隐藏滚动条但保持可滚动 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

:deep(.device-screen::-webkit-scrollbar) {
  display: none;
}

/* 为 iframe 添加样式 */
:deep(.device-screen iframe) {
  width: 100% !important;
  height: 100% !important;
  border: none;
  display: block;
}

/* 响应式调整 - 平板设备 */
@media (max-width: 1024px) {
  .device {
    transform: scale(0.85);
  }

  /* .device-frame-wrapper {
    padding: 20px 15px;
  } */
}

/* 响应式调整 - 移动设备 */
@media (max-width: 768px) {
  .device {
    transform: scale(0.7);
  }

  /* .device-frame-wrapper {
    padding: 15px 10px;
    gap: 15px;
  } */
}

@media (max-width: 480px) {
  .device {
    transform: scale(0.5);
  }

  /* .device-frame-wrapper {
    padding: 10px 5px;
    gap: 10px;
  } */

  .device-switcher {
    flex-direction: column;
    width: 100%;
  }

  .device-btn {
    width: 100%;
    text-align: center;
  }
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .device-frame-wrapper {
    /* background: linear-gradient(
      135deg,
      var(--vp-c-bg-soft) 0%,
      rgba(0, 0, 0, 0.3) 100%
    ); */
  }

  .device {
    /* filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5)); */
  }
}
</style>
