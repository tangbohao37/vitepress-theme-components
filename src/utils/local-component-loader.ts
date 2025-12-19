/**
 * 通用的本地组件加载器
 * 用于将本地编译后的组件库注入到 Sandpack 虚拟文件系统
 * 不硬编码任何组件库路径，完全由使用方配置
 */

export interface LocalComponentLoaderConfig {
  /**
   * 组件库的 Vite alias 名称
   * 例如：'~atome-design' 或 '@local/my-components'
   * 该 alias 需要在 VitePress 配置中定义
   */
  componentLibraryAlias: string

  /**
   * 组件库的包名（用于生成虚拟 node_modules 路径）
   * 例如：'@atome/design' 或 'my-component-library'
   */
  packageName: string

  /**
   * 需要加载的文件模式（glob pattern）
   * 默认：['**\/*.{js,jsx,ts,tsx,css}']
   */
  includePatterns?: string[]

  /**
   * 排除的文件模式
   * 默认：['**\/__test__/**', '**\/*.spec.{js,ts}', '**\/*.test.{js,ts}']
   */
  excludePatterns?: string[]

  /**
   * 入口文件导出配置
   * 用于生成虚拟的 node_modules/package-name/index.js
   */
  exports?: {
    componentName: string
    importPath: string
  }[]

  /**
   * CSS 样式文件路径（相对于组件库根目录）
   * 例如：['/_style/index.css', '/_style/dist.css']
   */
  styleFiles?: string[]

  /**
   * 实际路径前缀（可选）
   * 当 Vite 解析 alias 后，import.meta.glob 返回的路径可能是相对路径
   * 例如：'../es/' 或 '../../dist/'
   * 如果提供，transformPath 会将此前缀替换为 node_modules 路径
   */
  resolvedPathPrefix?: string
}

/**
 * 通用的本地组件加载器类
 */
export class LocalComponentLoader {
  private config: LocalComponentLoaderConfig

  constructor(config: LocalComponentLoaderConfig) {
    this.config = config
  }

  /**
   * 获取 import.meta.glob 的模式数组
   * 使用方需要在自己的项目中调用 import.meta.glob
   */
  getGlobPatterns(): string[] {
    const { componentLibraryAlias, includePatterns } = this.config
    const patterns = includePatterns || ['**/*.{js,jsx,ts,tsx,css}']

    return patterns.map(pattern =>
      `${componentLibraryAlias}/${pattern}`,
    )
  }

  /**
   * 获取排除模式
   */
  getExcludePatterns(): string[] {
    return this.config.excludePatterns || [
      '**/__test__/**',
      '**/*.spec.{js,ts}',
      '**/*.test.{js,ts}',
    ]
  }

  /**
   * 转换路径到虚拟 node_modules 路径
   * 例如：~atome-design/button/index.js -> /node_modules/@atome/design/button/index.js
   * 或：  ../es/button/index.js -> /node_modules/@atome/design/button/index.js
   */
  transformPath(originalPath: string): string {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/9c8568a4-454b-4585-a3c0-629497234be0', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'transformPath:CALLED', message: 'transformPath called', data: { originalPath, resolvedPathPrefix: this.config.resolvedPathPrefix }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'TRANSFORM_CALL' }) }).catch(() => {})
    // #endregion
    
    const { componentLibraryAlias, packageName, resolvedPathPrefix } = this.config

    // 如果提供了解析后的路径前缀（Vite 解析 alias 后的实际路径）
    if (resolvedPathPrefix && originalPath.includes(resolvedPathPrefix)) {
      const result = originalPath.replace(
        resolvedPathPrefix,
        `/node_modules/${packageName}/`,
      )
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/9c8568a4-454b-4585-a3c0-629497234be0', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'transformPath:PREFIX_MATCH', message: 'prefix matched and transformed', data: { originalPath, result, prefix: resolvedPathPrefix }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'TRANSFORM_SUCCESS' }) }).catch(() => {})
      // #endregion
      
      return result
    }

    // 否则尝试替换 alias（兼容旧行为）
    if (originalPath.includes(componentLibraryAlias)) {
      const result = originalPath.replace(
        componentLibraryAlias,
        `/node_modules/${packageName}`,
      )
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/9c8568a4-454b-4585-a3c0-629497234be0', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'transformPath:ALIAS_MATCH', message: 'alias matched and transformed', data: { originalPath, result, alias: componentLibraryAlias }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'TRANSFORM_SUCCESS' }) }).catch(() => {})
      // #endregion
      
      return result
    }

    // 如果都不匹配，返回原路径（可能需要在调试时添加警告）
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/9c8568a4-454b-4585-a3c0-629497234be0', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'transformPath:NO_MATCH', message: 'no match, returning original', data: { originalPath, resolvedPathPrefix, componentLibraryAlias }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'TRANSFORM_FAIL' }) }).catch(() => {})
    // #endregion
    
    return originalPath
  }

  /**
   * 生成虚拟入口文件内容
   * 模拟 node_modules/package-name/index.js
   */
  generateEntryFile(): string {
    const { exports = [], packageName } = this.config

    if (exports.length === 0) {
      return `// No exports configured for ${packageName}\nexport {}`
    }

    const exportStatements = exports.map(({ componentName, importPath }) => {
      // 确保 importPath 以 / 开头
      const normalizedPath = importPath.startsWith('/')
        ? importPath
        : `/${importPath}`

      return `export { ${componentName} } from '/node_modules/${packageName}${normalizedPath}'`
    })

    return [
      `// Auto-generated entry file for ${packageName}`,
      ...exportStatements,
    ].join('\n')
  }

  /**
   * 生成样式导入文件内容
   * 模拟 node_modules/package-name/style.js
   */
  generateStyleFile(): string {
    const { styleFiles = [], packageName } = this.config

    if (styleFiles.length === 0) {
      return `// No styles configured for ${packageName}`
    }

    const importStatements = styleFiles.map((file) => {
      // 确保文件路径以 / 开头
      const normalizedPath = file.startsWith('/') ? file : `/${file}`
      return `import '/node_modules/${packageName}${normalizedPath}'`
    })

    return [
      `// Auto-generated style file for ${packageName}`,
      ...importStatements,
    ].join('\n')
  }

  /**
   * 获取包名
   */
  getPackageName(): string {
    return this.config.packageName
  }

  /**
   * 获取 alias 名称
   */
  getAlias(): string {
    return this.config.componentLibraryAlias
  }
}

/**
 * 处理 import.meta.glob 返回的模块对象
 * 将真实路径转换为虚拟 node_modules 路径
 */
export function processGlobModules(
  modules: Record<string, any>,
  loader: LocalComponentLoader,
): Record<string, string> {
  // #region agent log - 记录函数被调用
  fetch('http://127.0.0.1:7243/ingest/9c8568a4-454b-4585-a3c0-629497234be0', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'processGlobModules:START', message: 'processGlobModules called', data: { moduleCount: Object.keys(modules).length, firstKey: Object.keys(modules)[0] }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'PROCESS' }) }).catch(() => {})
  // #endregion
  
  const files: Record<string, string> = {}

  let count = 0
  for (const [path, content] of Object.entries(modules)) {
    count++
    
    // #region agent log - 记录转换前
    if (count <= 3) {
      fetch('http://127.0.0.1:7243/ingest/9c8568a4-454b-4585-a3c0-629497234be0', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: `processGlobModules:BEFORE-${count}`, message: 'before transform', data: { originalPath: path }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'TRANSFORM' }) }).catch(() => {})
    }
    // #endregion
    
    const virtualPath = loader.transformPath(path)
    files[virtualPath] = content as string
    
    // #region agent log - 记录转换后
    if (count <= 3) {
      fetch('http://127.0.0.1:7243/ingest/9c8568a4-454b-4585-a3c0-629497234be0', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: `processGlobModules:AFTER-${count}`, message: 'after transform', data: { originalPath: path, transformedPath: virtualPath }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'TRANSFORM' }) }).catch(() => {})
    }
    // #endregion
  }

  // #region agent log - 记录函数结束
  fetch('http://127.0.0.1:7243/ingest/9c8568a4-454b-4585-a3c0-629497234be0', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'processGlobModules:END', message: 'processGlobModules done', data: { filesCount: Object.keys(files).length, first3Keys: Object.keys(files).slice(0, 3) }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'PROCESS' }) }).catch(() => {})
  // #endregion
  
  return files
}

/**
 * 创建完整的虚拟文件系统
 * 包括入口文件、样式文件和所有组件文件
 */
export function createVirtualFileSystem(
  modules: Record<string, any>,
  loader: LocalComponentLoader,
): Record<string, string> {
  const packageName = loader.getPackageName()
  const config = (loader as any).config
  const firstThreeModules = Object.keys(modules).slice(0, 3)
  
  console.log('[DEBUG] createVirtualFileSystem START')
  console.log('[DEBUG] packageName:', packageName)
  console.log('[DEBUG] moduleCount:', Object.keys(modules).length)
  console.log('[DEBUG] first 3 modules:', firstThreeModules)
  console.log('[DEBUG] config.resolvedPathPrefix:', config.resolvedPathPrefix)
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/9c8568a4-454b-4585-a3c0-629497234be0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'local-component-loader.ts:186',message:'createVirtualFileSystem called',data:{packageName,moduleCount:Object.keys(modules).length,firstModulePath:Object.keys(modules)[0],resolvedPathPrefix:config.resolvedPathPrefix},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,D'})}).catch(()=>{});
  // #endregion
  
  const entryFile = loader.generateEntryFile()
  const styleFile = loader.generateStyleFile()
  const processedModules = processGlobModules(modules, loader)
  
  console.log('[DEBUG] processedModules keys (first 3):', Object.keys(processedModules).slice(0, 3))
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/9c8568a4-454b-4585-a3c0-629497234be0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'local-component-loader.ts:196',message:'generated files',data:{entryFileLength:entryFile.length,entryFilePreview:entryFile.substring(0,500),processedModuleCount:Object.keys(processedModules).length,firstProcessedPath:Object.keys(processedModules)[0],processedSample:Object.keys(processedModules).slice(0,5)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,D'})}).catch(()=>{});
  // #endregion

  const result = {
    // 入口文件
    [`/node_modules/${packageName}/index.js`]: entryFile,
    // 样式文件
    [`/node_modules/${packageName}/style.js`]: styleFile,
    // 所有组件文件
    ...processedModules,
  }
  
  console.log('[DEBUG] createVirtualFileSystem RESULT keys (first 5):', Object.keys(result).slice(0, 5))
  
  return result
}

