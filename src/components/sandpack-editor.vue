<template>
  <div class="sandpack-editor-wrapper">
    <!-- 加载状态 - 使用 Naive UI NSpin -->
    <div v-if="loading" class="loading">
      <NSpin size="large" description="正在加载示例代码..." />
    </div>

    <!-- 错误状态 - 使用 Naive UI NResult -->
    <div v-else-if="error" class="error-container">
      <NResult status="error" title="加载失败" :description="error">
        <template #footer>
          <NSpace vertical>
            <div class="error-path">
              文件路径：<code>{{ props.path }}</code>
            </div>
            <NButton type="primary" @click="loadCode"> 重试加载 </NButton>
          </NSpace>
        </template>
      </NResult>
    </div>

    <!-- Sandpack 编辑器 -->
    <div v-else class="sandpack-container">
      <SandpackProvider template="react" :files="files" :custom-setup="setup">
        <!-- 预览区域包装器 -->
        <PreviewSectionWrapper
          :is-resizing="isResizing"
          :preview-height="previewHeight"
          :selected-device="selectedDevice"
          @update:selected-device="selectedDevice = $event"
        />

        <!-- 可拖动的分隔条 -->
        <div
          class="resize-handle"
          @mousedown="startResize"
          @dblclick="resetPreviewHeight"
          :title="'拖动调整预览区域高度，双击重置'"
        >
          <div class="resize-handle-bar">
            <NIcon :size="16">
              <ReorderIcon />
            </NIcon>
          </div>
        </div>

        <!-- 代码编辑器区域 -->
        <div class="editor-section">
          <div class="editor-header" @click="toggleEditor">
            <div class="editor-title">
              <NIcon :size="16" class="icon-code">
                <CodeIcon />
              </NIcon>
              <span>{{ props.readOnly ? '查看代码' : '编辑代码' }}</span>
            </div>
            <div class="editor-actions">
              <NButton
                text
                :type="isEditorExpanded ? 'primary' : 'default'"
                @click.stop
              >
                <template #icon>
                  <NIcon
                    :size="16"
                    class="icon-chevron"
                    :class="{ expanded: isEditorExpanded }"
                  >
                    <ChevronDownIcon />
                  </NIcon>
                </template>
              </NButton>
            </div>
          </div>
          <Transition name="editor-slide">
            <div v-show="isEditorExpanded" class="editor-content">
              <!-- 只读模式：使用 SandpackCodeViewer -->
              <SandpackCodeViewer
                v-if="props.readOnly"
                :show-line-numbers="true"
                :show-tabs="false"
              />
              <!-- 编辑模式：使用 SandpackCodeEditor -->
              <SandpackCodeEditor v-else :show-line-numbers="true" />
            </div>
          </Transition>
        </div>
      </SandpackProvider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackCodeViewer
} from 'sandpack-vue3';
import { NSpin, NButton, NResult, NSpace, NIcon } from 'naive-ui';
import {
  ReorderThreeOutline as ReorderIcon,
  CodeSlashOutline as CodeIcon,
  ChevronDownOutline as ChevronDownIcon
} from '@vicons/ionicons5';
import PreviewSectionWrapper from './preview-section-wrapper.vue';
import type { DeviceType } from '../types';
import { useData } from 'vitepress';
import { basename, join, resolve, dirname, extname, normalize } from 'pathe';

// 获取主题配置
const { theme } = useData();

// 从配置中获取 exampleDir，默认为 '/example/'
const exampleDir = computed(() => {
  const dir = theme.value.exampleDir || '/example/';
  // 使用 pathe 的 normalize 标准化路径，并确保以 / 开头和结尾
  let normalized = normalize(dir);
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }
  if (!normalized.endsWith('/')) {
    normalized = `${normalized}/`;
  }
  return normalized;
});

// Props
const props = defineProps<{
  path: string; // 相对于 exampleDir 的文件路径，如 "button.jsx" 或 "components/button.jsx"
  defaultExpanded?: boolean; // 默认是否展开编辑器
  readOnly?: boolean; // 是否为只读模式，使用 SandpackCodeViewer
}>();

// 状态
const loading = ref(true);
const error = ref('');
const code = ref('');
const additionalFiles = ref<Record<string, string>>({}); // 额外的文件（CSS、其他 JS 等）
const selectedDevice = ref<DeviceType>('iphone');
const isEditorExpanded = ref(props.defaultExpanded ?? false);
const previewHeight = ref(600); // 默认预览区域高度
const isResizing = ref(false);

// 切换编辑器展开/收起
function toggleEditor() {
  isEditorExpanded.value = !isEditorExpanded.value;
}

// 开始调整大小
function startResize(event: MouseEvent) {
  event.preventDefault();
  isResizing.value = true;

  const startY = event.clientY;
  const startHeight = previewHeight.value;
  let animationFrameId: number | null = null;
  let latestMouseEvent: MouseEvent | null = null;

  const updateHeight = () => {
    if (!latestMouseEvent || !isResizing.value) {
      animationFrameId = null;
      return;
    }

    const deltaY = latestMouseEvent.clientY - startY;
    const newHeight = Math.max(200, Math.min(1000, startHeight + deltaY));
    previewHeight.value = newHeight;

    latestMouseEvent = null;
    animationFrameId = null;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isResizing.value) return;

    latestMouseEvent = e;

    // 使用 requestAnimationFrame 优化性能
    if (animationFrameId === null) {
      animationFrameId = requestAnimationFrame(updateHeight);
    }
  };

  const onMouseUp = () => {
    isResizing.value = false;

    // 取消未完成的动画帧
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    document.removeEventListener('mousemove', onMouseMove, {
      passive: true
    } as any);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.body.classList.remove('is-resizing-sandpack');
  };

  // 使用 passive 事件监听器提升性能
  document.addEventListener('mousemove', onMouseMove, { passive: true } as any);
  document.addEventListener('mouseup', onMouseUp);
  document.body.style.cursor = 'ns-resize';
  document.body.style.userSelect = 'none';
  document.body.classList.add('is-resizing-sandpack');
}

// 重置预览高度
function resetPreviewHeight() {
  previewHeight.value = 600; // 重置为默认高度
}

// 计算属性
const files = computed(() => {
  if (!code.value) {
    return {};
  }

  const result: Record<string, string> = {
    '/App.js': code.value,
    // 合并所有额外加载的文件（CSS、其他 JS 等）
    ...additionalFiles.value
  };

  return result;
});

const setup = computed(() => ({
  dependencies: {
    '@arco-design/web-react': '^2.63.0',
    react: '^18.2.0',
    'react-dom': '^18.2.0'
  }
}));

/**
 * 构建完整的文件 URL，使用 pathe 的 basename 和 join API
 * @param relativePath - 相对于 exampleDir 的文件路径
 * @returns 完整的可访问 URL 路径
 */
function buildFileUrl(relativePath: string): string {
  const base = import.meta.env.BASE_URL || '/';
  // 使用 pathe 的 basename 提取目录名
  const name = basename(exampleDir.value);
  // 使用 pathe 的 join 拼接路径（自动处理多余的斜杠）
  const fullPath = join(base, name, relativePath);

  return fullPath;
}

// 使用 fetch 加载文件内容
async function fetchFileContent(relativePath: string): Promise<string> {
  const url = buildFileUrl(relativePath);

  console.log(`尝试加载文件: ${relativePath} -> ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const content = await response.text();
    console.log(`✓ 文件加载成功: ${relativePath}`);
    return content;
  } catch (err) {
    throw new Error(
      `无法加载文件 ${relativePath}: ${
        err instanceof Error ? err.message : '未知错误'
      }`
    );
  }
}

// 解析代码中的 import 语句，提取相对路径的文件
function parseImports(code: string): string[] {
  const imports: string[] = [];

  // 匹配 import 语句：import xxx from './xxx' 或 import './xxx'
  // 支持单引号、双引号
  const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"](.+?)['"]/g;

  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const importPath = match[1];

    // 只处理相对路径（以 ./ 或 ../ 开头）
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      imports.push(importPath);
    }
  }

  return imports;
}

/**
 * 解析相对路径，使用 pathe 的 resolve 和 dirname API
 * @param basePath - 基准文件路径
 * @param relativePath - 相对路径（如 './file.js' 或 '../utils/helper.js'）
 * @returns 解析后的绝对路径
 */
function resolveRelativePath(basePath: string, relativePath: string): string {
  // 使用 pathe 的 dirname 获取基准路径的目录部分
  const baseDir = dirname(basePath);
  // 使用 pathe 的 resolve 解析相对路径（会自动处理 . 和 ..）
  return resolve(baseDir, relativePath);
}

/**
 * 尝试解析文件扩展名，使用 pathe 的 extname API
 * @param filePath - 文件路径
 * @returns 解析后的完整文件路径，如果无法解析返回 null
 */
async function tryResolveExtension(filePath: string): Promise<string | null> {
  // 使用 pathe 的 extname 检查是否已经有扩展名
  if (extname(filePath)) {
    try {
      await fetchFileContent(filePath);
      return filePath;
    } catch {
      return null;
    }
  }

  // 尝试常见扩展名
  const extensions = ['.js', '.jsx', '.ts', '.tsx', '.css'];

  for (const ext of extensions) {
    try {
      const pathWithExt = `${filePath}${ext}`;
      await fetchFileContent(pathWithExt);
      return pathWithExt;
    } catch {
      continue;
    }
  }

  return null;
}

// 递归加载文件及其依赖
async function loadFileWithDependencies(
  filePath: string,
  basePath: string,
  loadedFiles: Record<string, string> = {},
  visited: Set<string> = new Set()
): Promise<Record<string, string>> {
  const resolvedPath = resolveRelativePath(basePath, filePath);

  // 避免循环依赖
  if (visited.has(resolvedPath)) {
    return loadedFiles;
  }
  visited.add(resolvedPath);

  try {
    const resolvedFile = await tryResolveExtension(resolvedPath);

    if (!resolvedFile) {
      console.warn(`文件不存在: ${resolvedPath}`);
      return loadedFiles;
    }
    const content = await fetchFileContent(resolvedFile);

    // 使用 pathe 的 basename 提取文件名作为 Sandpack 路径
    const fileName = basename(resolvedFile);
    const sandpackPath = `/${fileName}`;

    loadedFiles[sandpackPath] = content;
    console.log(`✓ 已加载依赖: ${sandpackPath}`);

    // 使用 pathe 的 extname 获取文件扩展名（包含点号）
    const ext = extname(fileName).slice(1).toLowerCase(); // 去掉开头的点号
    if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
      const imports = parseImports(content);

      // 递归加载所有依赖
      for (const importPath of imports) {
        await loadFileWithDependencies(
          importPath,
          resolvedFile,
          loadedFiles,
          visited
        );
      }
    }
  } catch (err) {
    console.error(`加载文件失败: ${filePath}`, err);
  }

  return loadedFiles;
}

// 加载代码文件（使用 fetch 动态加载）
async function loadCode() {
  try {
    loading.value = true;
    error.value = '';
    additionalFiles.value = {};

    console.log('========================================');
    console.log('开始加载文件:', props.path);

    // 加载主文件内容
    const fileContent = await fetchFileContent(props.path);
    code.value = fileContent.trim();
    console.log('✓ 主文件加载成功');

    // 解析并递归加载所有依赖文件
    console.log('开始解析依赖文件...');
    const imports = parseImports(code.value);
    console.log('发现导入语句:', imports);

    if (imports.length > 0) {
      const loadedFiles: Record<string, string> = {};

      for (const importPath of imports) {
        await loadFileWithDependencies(importPath, props.path, loadedFiles);
      }

      additionalFiles.value = loadedFiles;
      console.log('✓ 所有依赖文件加载完成:', Object.keys(loadedFiles));
    } else {
      console.log('未发现依赖文件');
    }

    console.log('========================================');
  } catch (err) {
    console.error('加载代码失败:', err);
    error.value = err instanceof Error ? err.message : '未知错误';
  } finally {
    loading.value = false;
  }
}

// 组件挂载时加载代码
onMounted(loadCode);
</script>

<style scoped>
.sandpack-editor-wrapper {
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
}

/* 使用 Naive UI 的加载和错误组件 */
.loading {
  padding: 60px 40px;
  text-align: center;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-container {
  padding: 40px 20px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-path {
  font-size: 14px;
  color: var(--vp-c-text-2);
  margin-top: 8px;
}

.error-path code {
  background: var(--vp-c-bg-mute);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
}

/* 容器样式 */
.sandpack-container {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

/* 可拖动的分隔条 */
.resize-handle {
  position: relative;
  height: 16px;
  background: var(--vp-c-bg);
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
  cursor: ns-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, border-color 0.2s;
  user-select: none;
  z-index: 10;
  flex-shrink: 0;
}

.resize-handle::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--vp-c-divider) 50%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.2s;
}

.resize-handle:hover {
  background: var(--vp-c-bg-soft);
  border-top-color: var(--vp-c-brand);
  border-bottom-color: var(--vp-c-brand);
}

.resize-handle:hover::before {
  opacity: 0.1;
}

.resize-handle:hover .resize-handle-bar {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
  transform: scale(1.05);
}

.resize-handle:active {
  background: var(--vp-c-brand-soft);
}

.resize-handle:active .resize-handle-bar {
  transform: scale(0.98);
}

.resize-handle-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 16px;
  border-radius: 6px;
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-3);
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.resize-handle-bar :deep(.n-icon) {
  opacity: 0.6;
  transition: opacity 0.2s;
}

.resize-handle:hover .resize-handle-bar :deep(.n-icon) {
  opacity: 1;
}

/* 编辑器区域 */
.editor-section {
  background: var(--vp-c-bg);
}

/* 编辑器头部 */
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--vp-c-bg);
  border-bottom: 1px solid var(--vp-c-divider);
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.editor-header:hover {
  background: var(--vp-c-bg-soft);
}

.editor-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.icon-code {
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 展开/收起按钮图标动画 */

.icon-chevron {
  transition: transform 0.2s;
  flex-shrink: 0;
}

.icon-chevron.expanded {
  transform: rotate(180deg);
}

/* 编辑器内容 */
.editor-content {
  overflow: hidden;
}

/* Vue Transition 动画 */
.editor-slide-enter-active,
.editor-slide-leave-active {
  transition: all 0.3s ease;
  max-height: 600px;
  opacity: 1;
}

.editor-slide-enter-from,
.editor-slide-leave-to {
  max-height: 0;
  opacity: 0;
}

/* 自定义 Sandpack 样式 */
:deep(.sp-code-editor) {
  border: none;
  border-radius: 0;
  max-height: 500px;
  overflow: auto;
}

:deep(.sp-preview-container) {
  border: none;
  background: transparent;
  padding: 0;
}

:deep(.sp-preview-iframe) {
  width: 100%;
  height: 100%;
  border: none;
}

/* Sandpack 代码编辑器内部样式 */
:deep(.cm-editor) {
  outline: none !important;
}

:deep(.cm-scroller) {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}

:deep(.cm-gutters) {
  background: var(--vp-c-bg-soft);
  border-right: 1px solid var(--vp-c-divider);
}

:deep(.cm-lineNumbers) {
  color: var(--vp-c-text-3);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .editor-header {
    padding: 10px 12px;
  }

  .editor-title {
    font-size: 13px;
  }

  :deep(.sp-code-editor) {
    max-height: 400px;
  }

  .resize-handle {
    height: 20px;
  }

  .resize-handle-bar {
    padding: 3px 20px;
  }
}
</style>

<style>
/* 全局样式：拖动时禁用所有过渡和交互 */
body.is-resizing-sandpack * {
  cursor: ns-resize !important;
}
</style>
