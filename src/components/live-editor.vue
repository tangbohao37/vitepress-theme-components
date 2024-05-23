<template>
  <div class="editor-container vp-raw">
    <ClientOnly>
      <ReactLivePreview
        :scope="props.scope"
        :sourceCode="code || ''"
        :noStyle="props.noStyle"
      />
      <div v-if="!props.hideCode" class="editor-wrapper">
        <vue-monaco-editor
          v-model:value="code"
          language="javascript"
          :theme="isDark ? 'vs-dark' : 'vs'"
          :options="MONACO_EDITOR_OPTIONS"
          @mount="handleMount"
          :on-change="onChange"
        />
        <NSpace class="editor-tool">
          <NP :depth="3"> 可实时编辑 </NP>
          <NPopover :delay="500" :show-arrow="false">
            <template #trigger>
              <NIcon :depth="3" size="18" @click="refresh" class="pointer">
                <Refresh></Refresh>
              </NIcon>
            </template>
            重置
          </NPopover>
          <NPopover :delay="500" :show-arrow="false">
            <template #trigger>
              <NIcon :depth="3" size="18" @click="copy" class="pointer">
                <CopyOutline />
              </NIcon>
            </template>
            复制
          </NPopover>
        </NSpace>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ReactLive } from '../react-components/index';
import { useData } from 'vitepress';
import { NIcon, NSpace, NP, NPopover, useMessage } from 'naive-ui';
import { Refresh, CopyOutline } from '@vicons/ionicons5';
import { applyReactInVue } from 'veaury';
import VueMonacoEditor from '@guolao/vue-monaco-editor';
import { ref, shallowRef } from 'vue';
import { type ILiveEditor } from '../types';

const message = useMessage();
// 转换为 Vue 组件
const ReactLivePreview = applyReactInVue(ReactLive);
const props = withDefaults(defineProps<ILiveEditor>(), {
  hideCode: false,
  noStyle: false
});
const { isDark } = useData();

const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
  minimap: {
    autohide: true
  }
};
const code = ref(props.sourceCode);
const editorRef = shallowRef();
const handleMount = (editor: any) => (editorRef.value = editor);
const onChange = (newValue: any) => {
  code.value = newValue;
};

const refresh = () => {
  code.value = props.sourceCode;
  message.success('重置成功');
};

const copy = () => {
  navigator.clipboard.writeText(code.value || '');
  message.success('复制成功');
};
</script>

<style scoped>
.editor-container {
  margin: 10px 0;
  border-radius: 3px;
  border: 1px solid var(--vp-c-border);
}

.editor-wrapper {
  border-top: 1px solid var(--vp-c-border);
  min-height: 200px;
  height: 30vh;
  position: relative;

  &:hover .editor-tool {
    visibility: visible;
  }

  .editor-tool {
    visibility: hidden;
    border-radius: 3px;
    padding: 0px 5px;
    height: 25px;
    background-color: var(--vp-c-bg-alt);
    position: absolute;
    right: 15px;
    bottom: 0;
  }
}

.pointer {
  cursor: pointer;
  vertical-align: middle;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
