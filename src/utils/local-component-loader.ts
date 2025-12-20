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
    const { componentLibraryAlias, packageName, resolvedPathPrefix } = this.config

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/9c8568a4-454b-4585-a3c0-629497234be0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'local-component-loader.ts:96',message:'transformPath called',data:{originalPath,resolvedPathPrefix,componentLibraryAlias,packageName},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,E'})}).catch(()=>{});
    // #endregion

    // 如果提供了解析后的路径前缀（Vite 解析 alias 后的实际路径）
    if (resolvedPathPrefix && originalPath.includes(resolvedPathPrefix)) {
      const transformed = originalPath.replace(
        resolvedPathPrefix,
        `/node_modules/${packageName}/`,
      )
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/9c8568a4-454b-4585-a3c0-629497234be0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'local-component-loader.ts:108',message:'transformPath - resolvedPathPrefix matched',data:{originalPath,transformed},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return transformed
    }

    // 否则尝试替换 alias（兼容旧行为）
    if (originalPath.includes(componentLibraryAlias)) {
      const transformed = originalPath.replace(
        componentLibraryAlias,
        `/node_modules/${packageName}`,
      )
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/9c8568a4-454b-4585-a3c0-629497234be0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'local-component-loader.ts:121',message:'transformPath - componentLibraryAlias matched',data:{originalPath,transformed},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return transformed
    }

    // 如果都不匹配，返回原路径
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/9c8568a4-454b-4585-a3c0-629497234be0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'local-component-loader.ts:130',message:'transformPath - no match, returning original',data:{originalPath},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
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

    // 按 importPath 分组，同一个文件的多个导出一起处理
    const pathToComponents = new Map<string, string[]>()
    
    for (const { componentName, importPath } of exports) {
      const normalizedPath = importPath.startsWith('/')
        ? importPath
        : `/${importPath}`
      const fullPath = `/node_modules/${packageName}${normalizedPath}`
      
      if (!pathToComponents.has(fullPath)) {
        pathToComponents.set(fullPath, [])
      }
      pathToComponents.get(fullPath)!.push(componentName)
    }

    // 使用 import + export 的两步策略来保持对象完整性
    // 这确保运行时添加的属性（如 Form.useRhForm）能被正确保留
    const importStatements: string[] = []
    const exportStatements: string[] = []
    
    // 创建去重的路径集合
    const uniquePaths = new Set(pathToComponents.keys())
    
    let importIndex = 0
    for (const path of uniquePaths) {
      const components = pathToComponents.get(path) || []
      if (components.length > 0) {
        // 为每个组件生成独立的 import 和 export
        for (const componentName of components) {
          const varName = `_${componentName}_${importIndex}`
          importStatements.push(`import { ${componentName} as ${varName} } from '${path}'`)
          exportStatements.push(`export const ${componentName} = ${varName}`)
          importIndex++
        }
      }
    }

    return [
      `// Auto-generated entry file for ${packageName}`,
      `// Using import + export strategy to preserve runtime-added properties (e.g., Form.useRhForm)`,
      ...importStatements,
      '',
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
   * 生成 package.json 文件内容
   * 为虚拟包创建必要的 package.json，让 Sandpack 能够正确解析包
   */
  generatePackageJson(): string {
    const { packageName, exports = [], styleFiles = [] } = this.config
    
    const packageJsonObj: Record<string, any> = {
      name: packageName,
      version: '0.0.0-local',
    }

    // 如果没有配置 exports，说明是预打包的库（如 @atome/icons）
    // 使用默认的 index.js
    if (exports.length === 0) {
      packageJsonObj.main = './index.js'
      packageJsonObj.module = './index.js'
      packageJsonObj.type = 'module'
    } else {
      // 有 exports 配置，使用我们生成的 index.js 入口文件
      packageJsonObj.main = './index.js'
      packageJsonObj.module = './index.js'
      packageJsonObj.type = 'module'
    }

    // 设置样式入口
    if (styleFiles.length > 0) {
      const styleExport = styleFiles[0]
      const stylePath = styleExport.startsWith('/') ? styleExport : `/${styleExport}`
      packageJsonObj.style = `.${stylePath}`
    }

    return JSON.stringify(packageJsonObj, null, 2)
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
  const files: Record<string, string> = {}

  for (const [path, content] of Object.entries(modules)) {
    const virtualPath = loader.transformPath(path)
    files[virtualPath] = content as string
  }

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
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/9c8568a4-454b-4585-a3c0-629497234be0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'local-component-loader.ts:271',message:'createVirtualFileSystem entry',data:{packageName,moduleCount:Object.keys(modules).length,hasExports:config.exports?.length>0},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,D,E'})}).catch(()=>{});
  // #endregion
  
  const processedModules = processGlobModules(modules, loader)
  const hasExports = config.exports && config.exports.length > 0

  // 生成虚拟 package.json
  const packageJson = loader.generatePackageJson()
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/9c8568a4-454b-4585-a3c0-629497234be0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'local-component-loader.ts:283',message:'processedModules created',data:{processedModuleCount:Object.keys(processedModules).length,samplePaths:Object.keys(processedModules).slice(0,10),hasLoadingModule:Object.keys(processedModules).some(k=>k.includes('loading')),hasIconsModule:Object.keys(processedModules).some(k=>k.includes('icons'))},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,B,E'})}).catch(()=>{});
  // #endregion

  const result: Record<string, string> = {
    // package.json (Sandpack 需要这个来识别包)
    [`/node_modules/${packageName}/package.json`]: packageJson,
    // 所有组件文件
    ...processedModules,
  }
  
  // 只有当配置了 exports 时才生成自定义的入口文件
  if (hasExports) {
    const entryFile = loader.generateEntryFile()
    const styleFile = loader.generateStyleFile()
    result[`/node_modules/${packageName}/index.js`] = entryFile
    result[`/node_modules/${packageName}/style.js`] = styleFile
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/9c8568a4-454b-4585-a3c0-629497234be0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'local-component-loader.ts:296',message:'generated entry files',data:{entryFileLength:entryFile.length,entryFilePreview:entryFile.substring(0,500),packageJsonContent:packageJson},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C,D'})}).catch(()=>{});
    // #endregion
  } else {
    // 对于预打包的库，将 index.esm.js 重命名为 index.js
    const esmIndexPath = `/node_modules/${packageName}/index.esm.js`
    if (processedModules[esmIndexPath]) {
      result[`/node_modules/${packageName}/index.js`] = processedModules[esmIndexPath]
    }
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/9c8568a4-454b-4585-a3c0-629497234be0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'local-component-loader.ts:310',message:'final result files',data:{totalFiles:Object.keys(result).length,allFilePaths:Object.keys(result),loadingRelatedFiles:Object.keys(result).filter(k=>k.includes('loading')),iconsRelatedFiles:Object.keys(result).filter(k=>k.includes('icons')).slice(0,20)},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,B'})}).catch(()=>{});
  // #endregion
  
  return result
}

