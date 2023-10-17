<template>
  <Layout>
    <template #doc-before>
      <el-space alignment="space-between">
        <el-space v-if="isShowCoverage">
          <img alt="Static Badge" :src="`https://img.shields.io/badge/coverage%3Alines-${currentSummary?.lines?.pct || 0}%25-${getColorByCoverage(
            currentSummary?.lines?.pct || 0,
          )}`" />
          <img alt="Static Badge" :src="`https://img.shields.io/badge/coverage%3Astatements-${currentSummary?.statements?.pct || 0}%25-${getColorByCoverage(
            currentSummary?.statements?.pct || 0,
          )}`" />
          <img alt="Static Badge" :src="`https://img.shields.io/badge/coverage%3Afunctions-${currentSummary?.functions?.pct || 0}%25-${getColorByCoverage(
            currentSummary?.functions?.pct || 0,
          )}`" />
          <img alt="Static Badge" :src="`https://img.shields.io/badge/coverage%3Abranches-${currentSummary?.branches?.pct || 0}%25-${getColorByCoverage(
            currentSummary?.branches?.pct || 0,
          )}`" />
        </el-space>
        <el-button type="text" v-if="isShowChangeLog" @click="active = true">更新记录</el-button>
      </el-space>
      <el-divider v-if="isShowChangeLog || isShowCoverage" />
    </template>
  </Layout>
  <record-drawer :changelog-content="changelogContent" v-model:active="active"></record-drawer>
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import RecordDrawer from './record-drawer.vue'
import { useData, useRoute, withBase } from 'vitepress'
import { ref, onMounted, computed } from 'vue'
import { type AdvThemeConfig } from '../types'
import { readFileAsync } from './tools'

const coverageColorMap = {
  100: 'lime',
  80: 'limegreen',
  60: 'goldenrod',
  40: 'orange',
  20: 'orangered',
  10: 'deeppink',
  0: 'indianred',
}

const { Layout } = DefaultTheme
const active = ref(false)
const changelogContent = ref('')
const summaryContent = ref('')
const { theme, frontmatter, isDark, } = useData<AdvThemeConfig>()
const currentSummary = ref<any>()
const route = useRoute()

const isShowChangeLog = computed(() => {
  return changelogContent.value && !frontmatter.value.hideRecord
})

const isShowCoverage = computed(() => {
  return frontmatter.value.coverage
})

function getColorByCoverage(coverage) {
  // 首先按照数值降序对映射的键进行排序
  const sortedKeys = Object.keys(coverageColorMap).sort((a, b) => +b - +a)

  // 遍历排序后的键，找到第一个小于等于给定覆盖率的键，并返回相应的颜色
  for (const key of sortedKeys) {
    if (coverage >= parseFloat(key)) {
      return coverageColorMap[key]
    }
  }
  // 如果没有匹配的覆盖率范围，则返回默认颜色（可根据需要自定义）
  return coverageColorMap[sortedKeys[sortedKeys.length - 1]]
}

const readChangelog = async () => {
  const changelog = theme.value.changelog
  if (!changelog?.path) {
    return
  }
  const content = await readFileAsync(withBase(changelog?.path))
  const data = await content.text()
  changelogContent.value = data
}

const readCoverage = async () => {
  const coverage = theme.value.coverage
  if (!coverage?.path) {
    return
  }
  const content = await readFileAsync(withBase(coverage?.path))
  const data = await content.json()
  summaryContent.value = data
}

onMounted(() => {
  readChangelog()
  readCoverage()
})
</script>

<style scoped></style>
