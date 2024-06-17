<script setup>
import { NTag } from 'naive-ui';
import { ref } from 'vue';

defineProps({
  src: {
    type: String,
    default: ''
  }
});

const iframe = ref();
</script>

<template>
  <div class="iframe-wrapper">
    <div class="iframe-tag">iframe scope</div>
    <iframe class="iframe-box" ref="iframe" data-why :src="src">
      <slot />
    </iframe>
  </div>
</template>

<style scoped>
.iframe-wrapper {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #b2b2b2;
  border-radius: 0.5rem;
  margin: 10px auto;
}
.iframe-tag {
  background-color: #444444;
  padding: 5px 10px;
  color: #fff;
  margin-bottom: 10px;
}
iframe[data-why] {
  display: inline-block;
  width: 100%;
  height: 900px;
  border: none;
  /* border: 1px solid #b2b2b2;
  background-color: #a2a2a2;
  border-radius: 0.5rem; */
}

.dark iframe[data-why],
.dark {
  border-color: #303030;
}
</style>
