<template>
  <NDrawer v-model:show="isActive" :width="500">
    <NDrawerContent title="更新记录" class="record-container">
      <NForm :model="formValue" label-placement="left">
        <NGrid :cols="24" :x-gap="24">
          <NFormItemGi label="版本" :span="10" path="formValue.version1">
            <NSelect
              key="version1"
              v-model:value="formValue.version1"
              filterable
              clearable
              :options="logsOptions"
            />
          </NFormItemGi>
          <NFormItemGi label="至" :span="10" path="formValue.version2">
            <NSelect
              key="version2"
              v-model:value="formValue.version2"
              filterable
              clearable
              :options="reversedLogsOptions"
            />
          </NFormItemGi>
        </NGrid>
        <NFormItem label="类型" path="type">
          <NSelect
            multiple
            v-model:value="formValue.type"
            :options="logsTypeOptions"
          />
        </NFormItem>
      </NForm>
      <NEmpty
        v-if="!canSearch"
        style="margin-top: 16px"
        description="请选择版本区间和类型后再搜索"
      />
      <NEmpty
        v-else-if="searchedLogs.length === 0"
        style="margin-top: 16px"
        description="当前筛选条件下暂无更新记录"
      />
      <div style="margin-top: 10px" v-for="log in searchedLogs" :key="log.version">
        <NCard>
          <NH3 prefix="bar">
            <NGradientText>
              {{ log.version }}
            </NGradientText>
          </NH3>
          <NUl align-text>
            <NLi v-for="(value, category) in log.changes" :key="value + ''">
              <div>
                <NGradientText type="info">
                  {{ category }}
                </NGradientText>
                <MarkdownIt :content="value.join('- \n\r')"></MarkdownIt>
              </div>
            </NLi>
          </NUl>
        </NCard>
      </div>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import {
  getChangelogMeta,
  searchChangelogByRange,
  type IChangelog,
  type IChangelogBlock,
  type IChangelogSearchParams
} from './tools';
import { useData } from 'vitepress';
import {
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NSelect,
  NCard,
  NFormItemGi,
  NGrid,
  NGradientText,
  NH3,
  NUl,
  NLi,
  NEmpty
} from 'naive-ui';
import MarkdownIt from './markdown-it.vue';
import { type MdFormat } from '../types';

interface IRecordDrawer {
  active: boolean;
  changelogContent: string;
}

const selectedLogContent = ref<IChangelog[]>([]);
const changelogBlocks = ref<IChangelogBlock[]>([]);
const allSections = ref<string[]>([]);

const formValue = ref({
  version1: '',
  version2: '',
  type: [] as string[]
});

const { frontmatter } = useData<MdFormat>();

const logsOptions = computed(() =>
  changelogBlocks.value.map((block) => ({
    label: block.version,
    value: block.version
  }))
);

const logsTypeOptions = computed(() => {
  const options = allSections.value.map((category) => ({
    label: category,
    value: category
  }));
  return options;
});

const reversedLogsOptions = computed(() => [...logsOptions.value].reverse());

const toCamelCase = (str) => {
  if (!str) {
    return '';
  }
  return str
    .split('-') // 按照破折号拆分字符串
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // 将每个单词的首字母大写
    .join(''); // 合并单词
};

const canSearch = computed(() => {
  return Boolean(
    formValue.value.version1 &&
      formValue.value.version2 &&
      formValue.value.type.length
  );
});

const componentKeyword = computed(() => {
  return toCamelCase(frontmatter.value?.componentName).toUpperCase();
});

const searchedLogs = computed(() => selectedLogContent.value);

const props = defineProps<IRecordDrawer>();

watchEffect(async () => {
  if (!props.changelogContent) {
    return;
  }
  const { blocks, sections } = getChangelogMeta(props.changelogContent);
  changelogBlocks.value = blocks;
  allSections.value = sections;
  formValue.value = {
    version1: logsOptions.value[0]?.value || '',
    version2: reversedLogsOptions.value[0]?.value || '',
    type: []
  };
  selectedLogContent.value = [];
});

watchEffect(() => {
  if (!props.changelogContent || !canSearch.value) {
    selectedLogContent.value = [];
    return;
  }
  const params: IChangelogSearchParams = {
    versionFrom: formValue.value.version1,
    versionTo: formValue.value.version2,
    sections: formValue.value.type,
    componentKeyword: componentKeyword.value
  };
  selectedLogContent.value = searchChangelogByRange(props.changelogContent, params);
});

const emit = defineEmits<{
  'update:active': [active: IRecordDrawer['active']];
}>();
const isActive = computed({
  get() {
    return props.active;
  },
  set(val) {
    emit('update:active', val);
  }
});
</script>

<style scoped lang="css">
.record-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
</style>
