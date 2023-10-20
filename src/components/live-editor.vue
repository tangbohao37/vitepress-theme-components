<template>
  <div class="editor-container">
    <ReactLivePreview :scope="props.scope" :sourceCode="code || ''" :noStyle="props.noStyle" />
    <div v-if="!props.hideCode" class="editor-wrapper">
      <vue-monaco-editor v-model:value="code" language="javascript" :theme="isDark ? 'vs-dark' : 'vs'"
        :options="MONACO_EDITOR_OPTIONS" @mount="handleMount" :on-change="onChange" />
      <div class="editor-tool">
        <NIcon size="18" @click="refresh" class="pointer">
          <Refresh></Refresh>
        </NIcon>
        <NIcon size="18" @click="copy" class="pointer">
          <CopyOutline />
        </NIcon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ReactLive } from '../react-components/index'
import { useData } from 'vitepress'
import { NIcon } from "naive-ui";
import { Refresh, CopyOutline } from '@vicons/ionicons5'
import { applyReactInVue } from 'veaury'
import VueMonacoEditor from '@guolao/vue-monaco-editor'
import { ref, shallowRef } from 'vue'
// import { type ILiveEditor } from "../types";

// FIXME: 无法引入外部的类型 ILiveEditor
type IProps = {
  sourceCodePath?: string
  hideCode?: boolean
  noStyle?: boolean
  sourceCode?: string
  scope?: Record<string, any>
}

const ReactLivePreview = applyReactInVue(ReactLive)

const props = withDefaults(defineProps<IProps>(), {
  hideCode: false,
  noStyle: false,
})

// const props = withDefaults(defineProps<ILiveEditor>(), {
//   hideCode: false,
//   noStyle: false,
// });
const { isDark } = useData()
const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
  minimap: {
    autohide: true,
  },
}
const code = ref(props.sourceCode)
const editorRef = shallowRef()
const handleMount = (editor: any) => (editorRef.value = editor)
const onChange = (newValue: any) => {
  code.value = newValue
}

const refresh = () => {
  code.value = props.sourceCode
}

const copy = () => {
  navigator.clipboard.writeText(code.value || '')
}
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
    display: flex;
    visibility: hidden;
    justify-content: space-around;
    align-items: center;
    width: 60px;
    height: 30px;
    background-color: var(--vp-c-bg-alt);
    position: absolute;
    right: 15px;
    bottom: 0;
  }
}

.pointer {
  cursor: pointer;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
