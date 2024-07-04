<template>
  <div class="iphone-frame" :class="{ 'svg-bg': active }">
    <div class="top-notch">
      <NSwitch v-model:value="active" size="small"> </NSwitch>
      <NButton type="primary" dashed @click="showCode = !showCode" size="tiny">
        <template #icon>
          <CodeWorkingOutline></CodeWorkingOutline>
        </template>
        Code
      </NButton>
    </div>
    <div class="screen">
      <!-- Your content here -->
      <slot name="default"></slot>
    </div>
    <div class="bottom-bar"></div>
  </div>
</template>
<script setup lang="ts">
import { NSwitch, NButton } from 'naive-ui';
import { defineModel } from 'vue';
import { CodeWorkingOutline } from '@vicons/ionicons5';

const active = defineModel<boolean>('active');
const showCode = defineModel<boolean>('showCode');
</script>

<style scoped>
.iphone-frame {
  width: 375px;
  height: 812px;
  border: 16px solid black;
  border-radius: 36px;
  position: relative;
  background-color: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  align-self: center;
}

.top-notch {
  width: 210px;
  height: 30px;
  background-color: black;
  border-radius: 0 0 12px 12px;
  position: absolute;
  top: 0;
  left: 50%;
  z-index: 1;
  transform: translateX(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}

.screen {
  width: 100%;
  height: 100%;
  padding: 30px 0 30px;
  border-radius: 36px;
  box-sizing: border-box;
}

.bottom-bar {
  width: 134px;
  height: 5px;
  background-color: #333;
  border-radius: 10px;
  position: absolute;
  overflow: auto;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
