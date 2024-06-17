<script setup lang="ts">
import { useData, useRoute } from 'vitepress';
import Theme from './base-layout.vue';
// the default layout we'll create next
// import FrameDefaultLayout from './frame-default-layout.vue';
import EmptyLayout from './empty-layout.vue';
import { AdvThemeConfig } from '../types';
import { NConfigProvider, darkTheme, NMessageProvider } from 'naive-ui';

const { theme, isDark } = useData<AdvThemeConfig>();
const p = theme.value.customPagePath;
const route = useRoute();
</script>

<template>
  <NConfigProvider :theme="isDark ? darkTheme : null">
    <NMessageProvider>
      <!-- <FrameDefaultLayout v-if="route.path.includes('frames/default')" /> -->
      <empty-layout v-if="route.path.includes(p)" />
      <Theme v-else />
    </NMessageProvider>
  </NConfigProvider>
</template>

<style></style>
