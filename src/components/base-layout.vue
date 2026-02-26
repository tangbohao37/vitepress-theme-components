<template>
  <Layout>
    <template #doc-before>
      <NSpace justify="space-between" align="center">
        <NSpace v-if="isShowCoverage">
          <img
            alt="Static Badge"
            class="coverage-badge"
            height="20"
            decoding="async"
            :src="`https://img.shields.io/badge/lines-${currentSummary?.lines?.pct || 0}%25-${getColorByCoverage(
              currentSummary?.lines?.pct || 0
            )}`"
          />
          <img
            alt="Static Badge"
            class="coverage-badge"
            height="20"
            decoding="async"
            :src="`https://img.shields.io/badge/statements-${currentSummary?.statements?.pct || 0}%25-${getColorByCoverage(
              currentSummary?.statements?.pct || 0
            )}`"
          />
          <img
            alt="Static Badge"
            class="coverage-badge"
            height="20"
            decoding="async"
            :src="`https://img.shields.io/badge/functions-${currentSummary?.functions?.pct || 0}%25-${getColorByCoverage(
              currentSummary?.functions?.pct || 0
            )}`"
          />
          <img
            alt="Static Badge"
            class="coverage-badge"
            height="20"
            decoding="async"
            :src="`https://img.shields.io/badge/branches-${currentSummary?.branches?.pct || 0}%25-${getColorByCoverage(
              currentSummary?.branches?.pct || 0
            )}`"
          />
        </NSpace>
        <div v-else></div>
        <NButton
          text
          type="primary"
          v-if="canShowChangeLogButton"
          @click="handleOpenChangeLog"
          >更新记录</NButton
        >
      </NSpace>
      <NDivider v-if="isShowChangeLog || isShowCoverage" />
    </template>
  </Layout>
  <record-drawer
    :changelog-content="changelogContent"
    v-model:active="active"
  ></record-drawer>
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme-without-fonts';
import RecordDrawer from './record-drawer.vue';
import { NSpace, NButton, NDivider } from 'naive-ui';
import { useData, useRoute, withBase } from 'vitepress';
import { ref, computed, watch, watchEffect } from 'vue';
import { type AdvThemeConfig } from '../types';
import { readFileAsync } from './tools';

const coverageColorMap = {
  100: 'lime',
  80: 'limegreen',
  60: 'goldenrod',
  40: 'orange',
  20: 'orangered',
  10: 'deeppink',
  0: 'indianred'
};

const route = useRoute();
const { Layout } = DefaultTheme;
const active = ref(false);
const changelogContent = ref('');
const summaryContent = ref('');
const hasLoadedChangelog = ref(false);
const hasLoadedCoverage = ref(false);
const { theme, frontmatter } = useData<AdvThemeConfig>();
const currentSummary = ref<any>();

const canShowChangeLogButton = computed(() => {
  return !frontmatter.value.hideRecord && Boolean(theme.value.changelog?.path);
});

const isShowChangeLog = computed(() => {
  return canShowChangeLogButton.value && Boolean(changelogContent.value);
});

const isShowCoverage = computed(() => {
  return frontmatter.value.coverage;
});

function getColorByCoverage(coverage) {
  // 首先按照数值降序对映射的键进行排序
  const sortedKeys = Object.keys(coverageColorMap).sort((a, b) => +b - +a);

  // 遍历排序后的键，找到第一个小于等于给定覆盖率的键，并返回相应的颜色
  for (const key of sortedKeys) {
    if (coverage >= parseFloat(key)) {
      return coverageColorMap[key];
    }
  }
  // 如果没有匹配的覆盖率范围，则返回默认颜色（可根据需要自定义）
  return coverageColorMap[sortedKeys[sortedKeys.length - 1]];
}

const readChangelog = async () => {
  if (hasLoadedChangelog.value) {
    return;
  }
  const changelog = theme.value.changelog;
  if (!changelog?.path) {
    return;
  }
  try {
    const content = await readFileAsync(withBase(changelog.path));
    if (!content.ok) {
      return;
    }
    const data = await content.text();
    changelogContent.value = data;
    hasLoadedChangelog.value = true;
  } catch (error) {
    console.warn('[base-layout] failed to load changelog', error);
  }
};

watchEffect(() => {
  const componentName =
    frontmatter.value.componentName || route.data.filePath.split('.')[0];
  const summary = summaryContent.value;
  const [key] = Object.keys(summary).filter((k) =>
    k.toLowerCase().includes(componentName.toLowerCase())
  );
  // TODO: 容错
  currentSummary.value = summary[key];
});

const readCoverage = async () => {
  if (hasLoadedCoverage.value) {
    return;
  }
  const coverage = theme.value.coverage;
  if (!coverage?.path) {
    return;
  }
  try {
    const content = await readFileAsync(withBase(coverage.path));
    if (!content.ok) {
      return;
    }
    const data = await content.json();
    summaryContent.value = data;
    hasLoadedCoverage.value = true;
  } catch (error) {
    console.warn('[base-layout] failed to load coverage summary', error);
  }
};

const handleOpenChangeLog = async () => {
  active.value = true;
  await readChangelog();
};

watch(() => frontmatter.value.coverage, (shouldLoadCoverage) => {
  if (shouldLoadCoverage) {
    void readCoverage();
  }
}, { immediate: true });

watch(() => route.path, () => {
  if (!frontmatter.value.coverage) {
    return;
  }
  hasLoadedCoverage.value = false;
  void readCoverage();
});
</script>

<style scoped>
.coverage-badge {
  display: block;
  height: 20px;
  width: auto;
}
</style>
