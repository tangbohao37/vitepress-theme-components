<script setup lang="ts">
import { useData, useRoute } from 'vitepress';
import Theme from './base-layout.vue';
// the default layout we'll create next
import EmptyLayout from './empty-layout.vue';
import { AdvThemeConfig } from '../types';
import { NConfigProvider, darkTheme, NMessageProvider } from 'naive-ui';

const { theme, isDark, frontmatter } = useData<AdvThemeConfig>();
const p = theme.value.customPagePath;

const route = useRoute();
</script>

<template>
  <NConfigProvider :theme="isDark ? darkTheme : null">
    <NMessageProvider>
      <EmptyLayout v-if="route.path.includes(p)" />
      <Theme v-else />
    </NMessageProvider>
  </NConfigProvider>
</template>

<style></style>
