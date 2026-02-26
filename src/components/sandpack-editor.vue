<template>
  <div class="sandpack-editor-wrapper">
    <!-- Sandpack 编辑器 -->
    <div ref="containerRef" class="sandpack-container">
      <div v-if="!shouldMountSandpack" class="sandpack-placeholder">
        <div class="placeholder-text">
          {{ placeholderText }}
        </div>
        <NButton
          v-if="props.manualStart || activationState === 'error'"
          size="small"
          type="primary"
          :loading="activationState === 'starting'"
          :disabled="activationState === 'starting' || activationState === 'running'"
          @click="activateSandpack"
        >
          {{ activationState === 'error' ? '重试运行' : '运行示例' }}
        </NButton>
      </div>
      <SandpackProvider
        v-else
        :template="resolvedTemplate"
        :files="files"
        :custom-setup="setup"
      >
        <!-- 预览区域包装器 -->
        <PreviewSectionWrapper
          :is-resizing="isResizing"
          :preview-height="previewHeight"
          :selected-device="selectedDevice"
          :show-refresh-button="props.showRefreshButton"
          :show-restart-button="props.showRestartButton"
          :show-sandpack-error-overlay="props.showSandpackErrorOverlay"
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
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackCodeViewer,
  SandpackPredefinedTemplate
} from 'sandpack-vue3';
import { NButton, NIcon } from 'naive-ui';
import {
  ReorderThreeOutline as ReorderIcon,
  CodeSlashOutline as CodeIcon,
  ChevronDownOutline as ChevronDownIcon
} from '@vicons/ionicons5';
import PreviewSectionWrapper from './preview-section-wrapper.vue';
import type { DeviceType } from '../types';

const sandpackActivationQueue: Array<() => void> = [];
let isActivatingSandpack = false;
const warmedUrls = new Set<string>();
const inflightWarmups = new Map<string, Promise<void>>();
const metadataWarmupCache = new Map<string, { expiresAt: number; promise: Promise<void> }>();
const METADATA_CACHE_TTL_MS = 10 * 60 * 1000;
const CRITICAL_RUNTIME_URLS = [
  'https://2-19-8-sandpack.codesandbox.io/static/browserfs12/browserfs.min.js',
  'https://2-19-8-sandpack.codesandbox.io/static/js/vendors~sandbox-startup.ca8a95b40.chunk.js',
  'https://2-19-8-sandpack.codesandbox.io/static/js/sandbox-startup.a0ea8d1cb.js'
];
let hasScheduledCriticalRuntimePrefetch = false;
let criticalRuntimePrefetchPromise: Promise<void> | null = null;

const processActivationQueue = () => {
  if (isActivatingSandpack) {
    return;
  }

  const nextTask = sandpackActivationQueue.shift();
  if (!nextTask) {
    return;
  }

  isActivatingSandpack = true;
  nextTask();
};

const enqueueActivation = () => new Promise<void>((resolve) => {
  sandpackActivationQueue.push(resolve);
  processActivationQueue();
});

const releaseActivation = () => {
  isActivatingSandpack = false;
  processActivationQueue();
};

const runWarmupRequest = (url: string) => {
  if (warmedUrls.has(url)) {
    return Promise.resolve();
  }

  const currentInflight = inflightWarmups.get(url);
  if (currentInflight) {
    return currentInflight;
  }

  const warmupPromise = fetch(url, {
    mode: 'no-cors',
    cache: 'force-cache'
  }).then(() => {
    warmedUrls.add(url);
  }).catch((err) => {
    console.warn(`[Sandpack] warmup 请求失败: ${url}`, err);
    throw err;
  }).finally(() => {
    inflightWarmups.delete(url);
  });

  inflightWarmups.set(url, warmupPromise);
  return warmupPromise;
};

const isMetadataUrl = (url: string) => {
  return url.includes('data.jsdelivr.com/v1/package/npm/') ||
    url.includes('prod-packager-packages.codesandbox.io/v2/packages/');
};

const runMetadataWarmupRequest = (url: string) => {
  const now = Date.now();
  const cachedRecord = metadataWarmupCache.get(url);
  if (cachedRecord && cachedRecord.expiresAt > now) {
    return cachedRecord.promise;
  }

  if (cachedRecord) {
    metadataWarmupCache.delete(url);
  }

  const metadataPromise = fetch(url, {
    mode: 'cors',
    cache: 'force-cache'
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`metadata warmup 响应异常: ${response.status}`);
    }
    return response.json();
  }).then(() => {
    metadataWarmupCache.set(url, {
      expiresAt: Date.now() + METADATA_CACHE_TTL_MS,
      promise: Promise.resolve()
    });
  }).catch((err) => {
    metadataWarmupCache.delete(url);
    console.warn(`[Sandpack] metadata warmup 失败: ${url}`, err);
    throw err;
  });

  metadataWarmupCache.set(url, {
    expiresAt: now + METADATA_CACHE_TTL_MS,
    promise: metadataPromise
  });

  return metadataPromise;
};

const runWarmupWithCache = (url: string) => {
  if (isMetadataUrl(url)) {
    return runMetadataWarmupRequest(url);
  }

  return runWarmupRequest(url);
};

const prefetchCriticalRuntime = () => {
  if (criticalRuntimePrefetchPromise) {
    return criticalRuntimePrefetchPromise;
  }

  criticalRuntimePrefetchPromise = Promise.allSettled(
    CRITICAL_RUNTIME_URLS.map((url) => runWarmupRequest(url))
  ).then((results) => {
    const successCount = results.filter((result) => result.status === 'fulfilled').length;
    console.info('[Sandpack] 关键运行时预取完成', {
      total: CRITICAL_RUNTIME_URLS.length,
      success: successCount
    });
  }).finally(() => {
    criticalRuntimePrefetchPromise = null;
  });

  return criticalRuntimePrefetchPromise;
};

interface SandpackDemoLoaderResult {
  code: string
  files?: Record<string, string>
  dependencies?: Record<string, string>
  externalResources?: string[]
  template?: SandpackPredefinedTemplate
}

// Props
const props = withDefaults(
  defineProps<{
    code?: string; // 主文件代码内容
    files?: Record<string, string>; // 所有文件，包括示例代码、node_modules 虚拟文件等
    defaultExpanded?: boolean; // 默认是否展开编辑器
    readOnly?: boolean; // 是否为只读模式，使用 SandpackCodeViewer
    // 自定义依赖配置
    dependencies?: Record<string, string>;
    // 外部资源（CSS、JS 等）
    externalResources?: string[];
    template?: SandpackPredefinedTemplate;
    // 预览控制按钮
    showRefreshButton?: boolean; // 显示刷新按钮
    showRestartButton?: boolean; // 显示重启按钮
    showSandpackErrorOverlay?: boolean; // 显示错误覆盖层
    lazy?: boolean; // 是否启用懒加载
    manualStart?: boolean; // 是否手动启动示例
    warmup?: boolean; // 手动模式下是否开启预热
    prefetchRuntime?: boolean; // 自动示例是否预取关键运行时
    demoLoader?: () => Promise<SandpackDemoLoaderResult> | SandpackDemoLoaderResult; // 懒加载 demo 数据
    demoLoaderMaxRetries?: number; // demoLoader 最大重试次数
  }>(),
  {
    showRefreshButton: true,
    showRestartButton: true,
    showSandpackErrorOverlay: true,
    lazy: true,
    manualStart: false,
    warmup: true,
    prefetchRuntime: true,
    demoLoaderMaxRetries: 1
  }
);

const DEFAULT_TEMPLATE: SandpackPredefinedTemplate = 'react';
type ActivationState = 'idle' | 'starting' | 'running' | 'error'
// 状态
const containerRef = ref<HTMLElement | null>(null);
const code = ref('');
const additionalFiles = ref<Record<string, string>>({}); // 额外的文件（CSS、其他 JS 等）
const runtimeDependencies = ref<Record<string, string>>({});
const runtimeExternalResources = ref<string[]>([]);
const resolvedTemplate = ref<SandpackPredefinedTemplate>(props.template || DEFAULT_TEMPLATE);
const selectedDevice = ref<DeviceType>('iphone');
const isEditorExpanded = ref(props.defaultExpanded ?? false);
const previewHeight = ref(600); // 默认预览区域高度
const isResizing = ref(false);
const isSandpackActivated = ref(false);
const hasLoadedCode = ref(false);
const isUnmounted = ref(false);
const activationState = ref<ActivationState>('idle');
const activationErrorMessage = ref('');
const hasStartedWarmup = ref(false);
let lazyObserver: IntersectionObserver | null = null;
let activationPromise: Promise<void> | null = null;
let warmupAbortController: AbortController | null = null;
let warmupIdleId: number | null = null;
let warmupTimeoutId: number | null = null;

const shouldMountSandpack = computed(() => {
  return isSandpackActivated.value;
});
const placeholderText = computed(() => {
  if (activationState.value === 'starting') {
    return '示例启动中，请稍候...';
  }
  if (activationState.value === 'error') {
    return `示例启动失败：${activationErrorMessage.value || '请稍后重试'}`;
  }
  return props.manualStart ? '点击运行示例' : '示例即将加载...';
});

// 切换编辑器展开/收起
function toggleEditor() {
  isEditorExpanded.value = !isEditorExpanded.value;
}

const getMainFilePath = (template?: SandpackPredefinedTemplate): string => {
  const templateType = template || DEFAULT_TEMPLATE;

  const mainFileMap: Record<string, string> = {
    react: '/App.js',
    'react-ts': '/App.tsx',
    'vite-react': '/App.jsx',
    'vite-react-ts': '/App.tsx'
  };

  return mainFileMap[templateType] || '/App.jsx';
};

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

  const mainFilePath = getMainFilePath(resolvedTemplate.value);

  const result: Record<string, string> = {
    [mainFilePath]: code.value,
    // 合并所有文件（包括示例文件、node_modules 虚拟包等）
    ...additionalFiles.value
  };

  return result;
});

const setup = computed(() => {
  const config: Record<string, any> = {
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      // 合并用户自定义依赖
      ...runtimeDependencies.value
    }
  };

  // 添加外部资源支持
  if (runtimeExternalResources.value.length > 0) {
    config.externalResources = runtimeExternalResources.value;
  }

  return config;
});

// 加载代码
async function loadCode() {
  if (hasLoadedCode.value) {
    return;
  }

  let sourceCode = props.code || '';
  let sourceFiles: Record<string, string> = props.files || {};
  let sourceDependencies: Record<string, string> = props.dependencies || {};
  let sourceExternalResources: string[] = props.externalResources || [];
  let sourceTemplate: SandpackPredefinedTemplate = props.template || DEFAULT_TEMPLATE;

  if (props.demoLoader) {
    const maxRetries = Math.max(0, props.demoLoaderMaxRetries ?? 1);
    const maxAttempts = maxRetries + 1;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const demoConfig = await props.demoLoader();
        sourceCode = demoConfig.code;
        sourceFiles = demoConfig.files || {};
        sourceDependencies = demoConfig.dependencies || {};
        sourceExternalResources = demoConfig.externalResources || [];
        sourceTemplate = demoConfig.template || sourceTemplate;
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        console.warn(
          `[Sandpack] demoLoader 失败(${attempt}/${maxAttempts})，将${attempt < maxAttempts ? '重试' : '停止重试'}`,
          err
        );
        if (attempt >= maxAttempts) {
          throw err;
        }
      }
    }

    if (lastError) {
      throw lastError;
    }
  }

  additionalFiles.value = {};
  runtimeDependencies.value = sourceDependencies;
  runtimeExternalResources.value = sourceExternalResources;
  resolvedTemplate.value = sourceTemplate;

  // 检查 code 是否存在
  if (!sourceCode) {
    throw new Error('代码内容不能为空，请检查 :code prop 或 :demo-loader 是否正确传递');
  }

  // 直接使用传入的代码
  code.value = sourceCode.trim();

  // 如果提供了额外文件，直接使用
  if (Object.keys(sourceFiles).length > 0) {
    additionalFiles.value = sourceFiles;

    // 统计文件类型
    const fileTypes = {
      nodeModules: 0,
      examples: 0,
      others: 0
    };

    Object.keys(sourceFiles).forEach((path) => {
      if (path.startsWith('/node_modules/')) {
        fileTypes.nodeModules++;
      } else if (path.startsWith('/')) {
        fileTypes.examples++;
      } else {
        fileTypes.others++;
      }
    });

    console.log('✅ Sandpack 文件加载成功:', {
      总文件数: Object.keys(sourceFiles).length,
      虚拟包文件: fileTypes.nodeModules,
      示例文件: fileTypes.examples,
      其他文件: fileTypes.others
    });
  } else {
    console.log('✅ 代码加载成功（无额外文件）');
  }

  hasLoadedCode.value = true;
}

async function activateSandpack() {
  if (isSandpackActivated.value) {
    return;
  }
  if (activationPromise) {
    await activationPromise;
    return;
  }

  activationState.value = 'starting';
  activationErrorMessage.value = '';
  activationPromise = (async () => {
    await enqueueActivation();

    try {
      if (isUnmounted.value) {
        return;
      }

      await loadCode();
      if (!isUnmounted.value) {
        isSandpackActivated.value = true;
        activationState.value = 'running';
      }
    } catch (err) {
      hasLoadedCode.value = false;
      activationState.value = 'error';
      activationErrorMessage.value = err instanceof Error ? err.message : '未知错误';
      console.error('❌ 激活 Sandpack 失败:', err);
    } finally {
      if (isUnmounted.value) {
        activationState.value = 'idle';
      }
      releaseActivation();
      activationPromise = null;
    }
  })();

  await activationPromise;
}

function cancelWarmup() {
  warmupAbortController?.abort();
  warmupAbortController = null;
  if (warmupIdleId !== null && typeof cancelIdleCallback !== 'undefined') {
    cancelIdleCallback(warmupIdleId);
    warmupIdleId = null;
  }
  if (warmupTimeoutId !== null) {
    window.clearTimeout(warmupTimeoutId);
    warmupTimeoutId = null;
  }
}

function executeWarmupRequests() {
  if (isUnmounted.value || hasStartedWarmup.value) {
    return;
  }

  hasStartedWarmup.value = true;
  warmupAbortController = new AbortController();
  const warmupSignal = warmupAbortController.signal;
  const warmupTargets = [
    'https://2-19-8-sandpack.codesandbox.io/',
    'https://data.jsdelivr.com/v1/package/npm/react',
    'https://prod-packager-packages.codesandbox.io/v2/packages/react/19.2.4.json'
  ];

  void Promise.allSettled(
    warmupTargets.map((url) => {
      if (warmupSignal.aborted) {
        return Promise.reject(new DOMException('Aborted', 'AbortError'));
      }

      return runWarmupWithCache(url);
    })
  ).then((results) => {
    if (isUnmounted.value) {
      return;
    }

    const fulfilledCount = results.filter((result) => result.status === 'fulfilled').length;
    console.info('[Sandpack] warmup 完成', {
      total: warmupTargets.length,
      fulfilled: fulfilledCount,
      deduped: warmupTargets.filter((url) => warmedUrls.has(url)).length,
      metadataCacheSize: metadataWarmupCache.size
    });
  }).catch((err) => {
    if (!warmupSignal.aborted) {
      console.warn('[Sandpack] warmup 异常', err);
    }
  });
}

function scheduleWarmup() {
  if (!props.manualStart || !props.warmup || hasStartedWarmup.value) {
    return;
  }
  if (typeof requestIdleCallback !== 'undefined') {
    warmupIdleId = requestIdleCallback(() => {
      warmupIdleId = null;
      executeWarmupRequests();
    }, { timeout: 1500 });
    return;
  }

  warmupTimeoutId = window.setTimeout(() => {
    warmupTimeoutId = null;
    executeWarmupRequests();
  }, 200);
}

function scheduleCriticalRuntimePrefetch() {
  if (props.manualStart || !props.prefetchRuntime || hasScheduledCriticalRuntimePrefetch) {
    return;
  }

  hasScheduledCriticalRuntimePrefetch = true;
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
      void prefetchCriticalRuntime();
    }, { timeout: 1200 });
    return;
  }

  window.setTimeout(() => {
    void prefetchCriticalRuntime();
  }, 200);
}

function setupLazyMount() {
  scheduleCriticalRuntimePrefetch();

  if (!props.lazy) {
    if (props.manualStart) {
      scheduleWarmup();
      return;
    }
    void activateSandpack();
    return;
  }

  if (!containerRef.value || typeof IntersectionObserver === 'undefined') {
    if (props.manualStart) {
      scheduleWarmup();
      return;
    }
    void activateSandpack();
    return;
  }

  lazyObserver = new IntersectionObserver((entries) => {
    const [entry] = entries;
    if (!entry?.isIntersecting) {
      return;
    }

    if (props.manualStart) {
      scheduleWarmup();
      lazyObserver?.disconnect();
      lazyObserver = null;
      return;
    }

    void activateSandpack();
    lazyObserver?.disconnect();
    lazyObserver = null;
  }, {
    rootMargin: '280px 0px',
  });

  lazyObserver.observe(containerRef.value);
}

// 组件挂载时加载代码
onMounted(setupLazyMount);

onBeforeUnmount(() => {
  isUnmounted.value = true;
  cancelWarmup();
  lazyObserver?.disconnect();
  lazyObserver = null;
});
</script>

<style scoped>
.sandpack-editor-wrapper {
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
}

/* 容器样式 */
.sandpack-container {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.sandpack-placeholder {
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
}

.placeholder-text {
  font-size: 13px;
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
