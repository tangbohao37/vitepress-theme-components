<script setup lang="ts">
import { useData, useRoute } from 'vitepress';
import Theme from './base-layout.vue';
// the default layout we'll create next
// import FrameDefaultLayout from './frame-default-layout.vue';
import EmptyLayout from './empty-layout.vue';
import { AdvThemeConfig } from '../types';

const { theme } = useData<AdvThemeConfig>();
const p = theme.value.customPagePath;
const route = useRoute();
</script>

<template>
  <!--
    replace with the layout entirely for `/frames/default`
    so we don't inherit from `Theme.Layout`
  -->
  <!-- <FrameDefaultLayout v-if="route.path.includes('/frames/default')" /> -->
  <empty-layout v-if="route.path.includes(p)" />
  <Theme v-else />
</template>
