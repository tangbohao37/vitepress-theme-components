<template>
  <NDrawer v-model:show="isActive" :width="500">
    <NDrawerContent title="更新记录" class="container">
      <NForm :model="formValue" label-placement="left">
        <NGrid :cols="24" :x-gap="24">
          <NFormItemGi label="版本" :span="10" path="formValue.version1">
            <NSelect key="version1" v-model:value="formValue.version1" :options="logsOptions" />
          </NFormItemGi>
          <NFormItemGi label="至" :span="10" path="formValue.version2">
            <NSelect key="version2" v-model:value="formValue.version2" :options="logsOptions?.reverse()" />
          </NFormItemGi>
        </NGrid>
        <NFormItem label="类型" path="type">
          <NSelect multiple v-model:value="formValue.type" :options="logsTypeOptions" />
        </NFormItem>
      </NForm>
      <div style="margin-top: 10px" v-for="log in logContent" :key="log.version">
        <NCard v-show="filterVersions(log)">
          <NH3 prefix="bar">
            <NGradientText>
              {{ log.version + ' ' + log.date }}
            </NGradientText>
          </NH3>
          <NUl align-text>
            <NLi v-for="change in log.changes" :key="change.description">
              <div v-show="filterLogsContent(change)">
                <NGradientText type="info">
                  {{ change.category }}
                </NGradientText>
                <MarkdownIt :content="change.description"></MarkdownIt>
              </div>
            </NLi>
          </NUl>
        </NCard>
      </div>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { parseChangelog, type IChangelog, type IChange } from './tools'
import { useData } from 'vitepress'
import { NDrawer, NDrawerContent, NForm, NFormItem, NSelect, NCard, NFormItemGi, NGrid, NGradientText, NH3, NUl, NLi, } from 'naive-ui'
import * as semver from 'semver'
import MarkdownIt from './markdown-it.vue'
import { type AdvThemeConfig } from '../types'

interface IRecordDrawer {
  active: boolean
  changelogContent: string
}

const logContent = ref<IChangelog[]>()
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

const props = defineProps<IRecordDrawer>()

watchEffect(async () => {
  if (!props.changelogContent) {
    return
  }
  const result: IChangelog[] = parseChangelog(props.changelogContent)
  logContent.value = result
  formValue.value = {
    version1: logsOptions?.value?.[0]?.value,
    version2: logsOptions?.value?.reverse()?.[0]?.value,
    type: logsTypeOptions?.value?.map((o: any) => o.value) || [],
  }
})

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
  overflow: hidden;
}
</style>
