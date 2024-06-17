<template>
  <MarkdownIt :content="content"></MarkdownIt>
</template>

<script lang="ts" setup>
import MarkdownIt from './markdown-it.vue';

interface IApiTableProps {
  path: string;
  content: string;
}
const { content } = defineProps<IApiTableProps>();
</script>
