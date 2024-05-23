<script setup>
import { useRoute } from 'vitepress'
import Theme from './base-layout.vue'
// the default layout we'll create next
import FrameDefaultLayout from './frame-default-layout.vue'

const route = useRoute()
</script>

<template>
  <!--
    replace with the layout entirely for `/frames/default`
    so we don't inherit from `Theme.Layout`
  -->
  <FrameDefaultLayout v-if="route.path.includes('/frames/default')" />
  <Theme v-else />
</template>