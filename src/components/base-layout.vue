<template>
  <Layout>
    <template #doc-before>
      <NSpace justify="space-between" align="center">
        <NSpace v-if="isShowCoveragePanel" align="center">
          <NButton
            text
            type="primary"
            @click="handleToggleCoverage"
          >
            {{ isCoverageExpanded ? '隐藏覆盖率' : '显示覆盖率' }}
          </NButton>
          <NSpace v-if="isCoverageExpanded && currentSummary" size="small">
            <span class="coverage-badge" :style="getBadgeStyle(currentSummary?.lines?.pct || 0)">
              lines {{ currentSummary?.lines?.pct || 0 }}%
            </span>
            <span class="coverage-badge" :style="getBadgeStyle(currentSummary?.statements?.pct || 0)">
              statements {{ currentSummary?.statements?.pct || 0 }}%
            </span>
            <span class="coverage-badge" :style="getBadgeStyle(currentSummary?.functions?.pct || 0)">
              functions {{ currentSummary?.functions?.pct || 0 }}%
            </span>
            <span class="coverage-badge" :style="getBadgeStyle(currentSummary?.branches?.pct || 0)">
              branches {{ currentSummary?.branches?.pct || 0 }}%
            </span>
          </NSpace>
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
      <NDivider v-if="isShowChangeLog || isShowCoveragePanel" />
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
import { getCoverageSummary } from './coverage-store';

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
const isCoverageExpanded = ref(false);

const canShowChangeLogButton = computed(() => {
  return !frontmatter.value.hideRecord && Boolean(theme.value.changelog?.path);
});

const isShowChangeLog = computed(() => {
  return canShowChangeLogButton.value && Boolean(changelogContent.value);
});

const coverageMode = computed(() => {
  return theme.value.coverage?.mode || 'eager';
});

const isShowCoveragePanel = computed(() => {
  return frontmatter.value.coverage && coverageMode.value !== 'off';
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

function getBadgeStyle(coverage: number) {
  const color = getColorByCoverage(coverage);
  return {
    '--coverage-badge-color': color,
  };
}

const readChangelog = async () => {
  if (import.meta.env.SSR) {
    return;
  }
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
  if (import.meta.env.SSR) {
    return;
  }
  if (hasLoadedCoverage.value) {
    return;
  }
  const coverage = theme.value.coverage;
  if (!coverage?.path) {
    return;
  }
  try {
    const data = await getCoverageSummary(withBase(coverage.path), coverage.cacheTtlMs);
    if (!data) return;
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

const handleToggleCoverage = async () => {
  isCoverageExpanded.value = !isCoverageExpanded.value;
  if (!isCoverageExpanded.value || hasLoadedCoverage.value) {
    return;
  }
  await readCoverage();
};

watch(() => frontmatter.value.coverage, (shouldLoadCoverage) => {
  if (!shouldLoadCoverage || coverageMode.value === 'off') {
    return;
  }
  if (coverageMode.value === 'eager') {
    void readCoverage();
    isCoverageExpanded.value = true;
    return;
  }
  isCoverageExpanded.value = false;
}, { immediate: true });

watch(() => route.path, () => {
  if (!frontmatter.value.coverage || coverageMode.value === 'off') {
    return;
  }
  hasLoadedCoverage.value = false;
  if (coverageMode.value === 'eager') {
    void readCoverage();
    isCoverageExpanded.value = true;
    return;
  }
  isCoverageExpanded.value = false;
});
</script>

<style scoped>
.coverage-badge {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--coverage-badge-color);
  color: var(--coverage-badge-color);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 12px;
  line-height: 16px;
  height: 20px;
  width: fit-content;
}
</style>
