<template>
  <div v-html="markdown.render(props.content)"></div>
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it'

interface IProps {
  content: string
}

const props = defineProps<IProps>()

const markdown = new MarkdownIt()
</script>