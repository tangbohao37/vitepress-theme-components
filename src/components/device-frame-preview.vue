<template>
  <DeviceFrame v-model="device">
    <!-- 设备屏幕内容 -->
    <div class="device-screen-content">
      <!-- 顶部安全区域 + 状态栏 -->
      <div :class="['device-safe-area-top', `safe-${device}`]"></div>

      <!-- 内容区域 -->
      <div class="device-content">
        <slot />
      </div>

      <!-- 底部安全区域 -->
      <div :class="['device-safe-area-bottom', `safe-${device}`]">
        <div
          v-if="device === 'iphone' || device === 'iphone-14'"
          class="home-indicator"
        />
      </div>
    </div>
  </DeviceFrame>
</template>

<script setup lang="ts">
import DeviceFrame from './device-frame.vue';
import type { DeviceType } from '../types';

// 设备类型 - 与 DeviceFrame 保持一致
const device = defineModel<DeviceType>({ default: 'iphone' });
</script>

<style scoped>
/* ==================== 设备屏幕内容容器 ==================== */

.device-screen-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
}

/* ==================== 顶部安全区域 ==================== */

/* 顶部安全区域基础样式 */
.device-safe-area-top {
  flex-shrink: 0;
  background: transparent;
  position: relative;
}

/* iPhone 14 Pro - Dynamic Island 刘海 */
.device-safe-area-top.safe-iphone {
  height: 59px;
}

/* iPhone 14 - 标准刘海 */
.device-safe-area-top.safe-iphone-14 {
  height: 47px;
}

/* Samsung Galaxy S8 - 曲面屏，上边框较窄 */
.device-safe-area-top.safe-samsung-s8 {
  height: 30px;
}

/* Google Pixel 6 Pro - 打孔屏 */
.device-safe-area-top.safe-android {
  height: 44px;
}

/* 内容区域 */
.device-content {
  flex: 1;
  overflow: auto;
  background: #fff;
  position: relative;
}

/* 确保 SandpackPreview 填充整个内容区域 */
.device-content :deep(.sp-preview-container),
.device-content :deep(.sp-preview-iframe) {
  width: 100% !important;
  height: 100% !important;
  border: none !important;
}

/* ==================== 底部安全区域 ==================== */

.device-safe-area-bottom {
  flex-shrink: 0;
  background: #fff;
}

/* iPhone 14 Pro - 底部安全区域 + Home 指示器 */
.device-safe-area-bottom.safe-iphone {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 8px;
}

/* iPhone 14 - 底部安全区域 + Home 指示器 */
.device-safe-area-bottom.safe-iphone-14 {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 8px;
}

/* Samsung Galaxy S8 - 实体 Home 键，无底部安全区 */
.device-safe-area-bottom.safe-samsung-s8 {
  height: 0;
  padding-bottom: 0;
}

/* Google Pixel 6 Pro - 手势导航，无底部安全区 */
.device-safe-area-bottom.safe-android {
  height: 0;
  padding-bottom: 0;
}

/* iPhone Home 指示器 */
.home-indicator {
  width: 134px;
  height: 5px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 100px;
  transition: all 0.2s;
}

.home-indicator:hover {
  background: rgba(0, 0, 0, 0.5);
}

/* ==================== 暗色模式适配 ==================== */

.dark .device-screen-content {
  background: #1a1a1a;
}

.dark .device-safe-area-top {
  background: transparent;
}

.dark .device-safe-area-bottom {
  background: #1a1a1a;
}

.dark .device-content {
  background: #1a1a1a;
}

.dark .home-indicator {
  background: rgba(255, 255, 255, 0.3);
}

.dark .home-indicator:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
