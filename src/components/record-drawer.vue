<template>
  <el-drawer v-model="isActive" :size="500" title="更新记录" direction="rtl">
    <div class="container">
      <el-form ref="formRef" :model="formValue" :inline="true" label-placement="left" label-width="49"
        label-align="center">
        <el-form-item label="版本">
          <el-col :span="11">
            <el-select v-model="formValue.version1" style="width: 100%">
              <el-option v-for="opt in logsOptions" :key="opt.value" :value="opt.value" :label="opt.label"></el-option>
            </el-select>
          </el-col>
          <el-col :span="2" class="text-center">
            <span class="text-gray-500">-</span>
          </el-col>
          <el-col :span="11">
            <el-select v-model="formValue.version2" style="width: 100%">
              <el-option v-for="opt in logsOptions?.reverse()" :key="opt.value" :value="opt.value"
                :label="opt.label"></el-option>
            </el-select>
          </el-col>
        </el-form-item>
        <el-form-item label="类型" path="type">
          <el-select multiple v-model="formValue.type">
            <el-option v-for="log in logsTypeOptions" :label="log.label" :value="log.value" :key="log.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-scrollbar :noresize="true" style="flex: 1; overflow: hidden">
        <div style="margin-top: 10px" v-for="log in logContent" :key="log.version">
          <el-card v-show="filterVersions(log)">
            <template #header>
              <h3>
                {{ log.version + ' ' + log.date }}
              </h3>
            </template>
            <ul>
              <li v-for="change in log.changes" :key="change.description">
                <div v-show="filterLogsContent(change)">
                  <el-text size="large">
                    {{ change.category }}
                  </el-text>
                  <MarkdownIt :content="change.description"></MarkdownIt>
                </div>
              </li>
            </ul>
          </el-card>
        </div>
      </el-scrollbar>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { parseChangelog, type IChangelog, type IChange } from './tools'
import { useData } from 'vitepress'
import * as semver from 'semver'
import MarkdownIt from './markdown-it.vue'
import { type AdvThemeConfig } from '../types'

interface IRecordDrawer {
  active: boolean
  changelogContent: string
}

const logContent = ref<IChangelog[]>()
const formRef = ref()
const formValue = ref({
  version1: '',
  version2: '',
  type: [] as string[],
})

const { frontmatter } = useData<AdvThemeConfig>()

const logsOptions = computed(() => logContent.value?.map((log: any) => ({ label: log.version, value: log.version, })))

const logsTypeOptions = computed(() => {
  const type = logContent.value?.flatMap((log: any) => log.changes).flatMap((change: any) => change.category)
  const options = Array.from(new Set(type)).map((category: any) => ({
    label: category,
    value: category,
  }))
  return options
})

const filterVersions = (log: any) => {
  const [v1, v2] = [formValue.value.version1, formValue.value.version2].sort(
    // @ts-ignore
    semver.compare,
  )
  return semver.satisfies(log.version, `>=${v1} <=${v2}`)
}

const filterLogsContent = (change: IChange) => (
  formValue.value.type.includes(change.category) &&
  change.component.toUpperCase() === frontmatter.value['title']?.toUpperCase()
)


watchEffect(async () => {
  if (!props.changelogContent) {
    return
  }
  const result: IChangelog[] = parseChangelog(props.changelogContent)
  logContent.value = result
  formValue.value = {
    version1: logsOptions?.value?.[0].value,
    version2: logsOptions?.value?.reverse()?.[0].value,
    type: logsTypeOptions?.value?.map((o: any) => o.value) || [],
  }
})

const props = defineProps<IRecordDrawer>()
const emit = defineEmits<{
  'update:active': [active: IRecordDrawer['active']]
}>()
const isActive = computed({
  get() {
    return props.active
  },
  set(val) {
    emit('update:active', val)
  },
})
</script>

<style scoped lang="css">
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.text-center {
  text-align: center;
}
</style>
