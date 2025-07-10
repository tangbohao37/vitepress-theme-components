<template>
  <div class="editor-wrapper">
    <VueMonacoEditor
      v-model:value="tempCode"
      language="javascript"
      :theme="isDark ? 'vs-dark' : 'vs'"
      :options="MONACO_EDITOR_OPTIONS"
      @mount="handleMount"
    />
    <NSpace class="editor-tool">
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
      <NPopover :delay="500" :show-arrow="false">
        <template #trigger>
          <NButton size="tiny" text @click="runCode">
            <template #icon>
              <NIcon>
                <CaretForwardCircleOutline />
              </NIcon>
            </template>
            run
          </NButton>
        </template>
        run code
      </NPopover>
    </NSpace>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, defineModel } from 'vue';
import { useData } from 'vitepress';
import { NIcon, NSpace, NButton, NPopover, useMessage } from 'naive-ui';
import VueMonacoEditor, { type EditorProps } from '@guolao/vue-monaco-editor';
import {
  Refresh,
  CopyOutline,
  CaretForwardCircleOutline
} from '@vicons/ionicons5';

const props = defineProps<{ originCode: string }>();
const message = useMessage();
const tempCode = ref(props.originCode);
const model = defineModel();

const { isDark } = useData();
const editorRef = shallowRef();

const MONACO_EDITOR_OPTIONS: EditorProps['options'] = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
  minimap: {
    autohide: true
  }
};
const handleMount = (editor: any) => (editorRef.value = editor);

const refresh = () => {
  tempCode.value = props.originCode;
  message.success('重置成功');
};

const runCode = () => {
  model.value = tempCode.value;
};

const copy = () => {
  navigator.clipboard.writeText(tempCode.value || '');
  message.success('复制成功');
};
</script>

<style scoped>
.editor-wrapper {
  min-height: 200px;
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
    left: 0;
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
