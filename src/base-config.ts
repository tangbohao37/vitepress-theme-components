import { demoBlockPlugin } from './plugins/index.js';
import { defineConfig } from 'vitepress';
import taskLists from 'markdown-it-task-lists';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import type { Plugin } from 'vite';

const deps = [
  'vitepress-theme-components',
  'veaury',
  'semver',
  'markdown-it',
  'sucrase',
  'date-fns-tz/formatInTimeZone',
  'vueuc',
  'naive-ui',
  'date-fns',
  '@mermaid-js/mermaid-zenuml',
  'mermaid',
  'dayjs',
  '@braintree/sanitize-url',
  'sandpack-vue3'
];

/**
 * 清理路径字符串，去除前后的斜杠
 * @param path - 路径字符串，如 '/example1/' 或 'example1'
 * @returns 清理后的路径，如 'example1'
 */
function cleanPath(path: string): string {
  return path.replaceAll(/^\/+|\/+$/g, '');
}

/**
 * 创建示例文件复制插件
 *
 * Vite 插件：自动复制示例文件目录到 public 目录
 * 在开发和构建时自动执行，确保示例文件可通过 HTTP 访问
 *
 * 插件会从 Vite 配置的 `vitepress.exampleDir` 字段读取配置
 * 如果未配置，则使用默认值 '/example/'
 *
 * @returns Vite 插件对象
 */
export function createCopyExamplePlugin(): Plugin {
  // 获取当前文件所在目录（用于计算相对路径）
  const __dirname = dirname(fileURLToPath(import.meta.url));

  return {
    name: 'vitepress-copy-example-to-public',

    // 在 Vite 配置解析后执行
    configResolved(config) {
      // 从 Vite 配置中读取 exampleDir
      const exampleDir =
        // @ts-ignore - vitepress 是自定义配置字段
        config?.vitepress?.exampleDir ||
        config.define?.VITEPRESS_EXAMPLE_DIR ||
        '/example/';

      // 如果未启用，则跳过
      // @ts-ignore
      if (config.vitepress?.disableCopyExample === true) {
        console.log('ℹ️  示例文件复制已禁用');
        return;
      }

      // 清理路径并构建源目录和目标目录
      const cleanedPath = cleanPath(exampleDir);

      // 尝试多个可能的路径位置
      const possibleBasePaths = [
        process.cwd(), // 当前工作目录
        join(__dirname, '..', '..'), // 从 lib 向上两级
        join(__dirname, '..') // 从 lib 向上一级
      ];

      let srcDir = '';
      let destDir = '';

      // 查找存在的源目录
      for (const base of possibleBasePaths) {
        const testSrc = join(base, 'docs', cleanedPath);
        if (existsSync(testSrc)) {
          srcDir = testSrc;
          const cleanedPathFilename = basename(srcDir);
          destDir = join(base, 'docs', 'public', cleanedPathFilename);
          break;
        }
      }

      // 如果源目录不存在，给出警告
      if (!srcDir || !existsSync(srcDir)) {
        console.warn(`⚠️  警告: 示例文件源目录不存在`);
        console.warn(`   配置的 exampleDir: "${exampleDir}"`);
        console.warn(
          `   尝试的路径: ${possibleBasePaths
            .map((p) => join(p, 'docs', cleanedPath))
            .join(', ')}`
        );
        console.warn(
          `   请确保源目录存在，或设置 vitepress.disableCopyExample = true 禁用复制`
        );
        return;
      }

      /**
       * 递归复制目录
       */
      function copyDir(src: string, dest: string) {
        // 创建目标目录
        mkdirSync(dest, { recursive: true });

        // 读取源目录中的所有条目
        const entries = readdirSync(src);

        for (const entry of entries) {
          const srcPath = join(src, entry);
          const destPath = join(dest, entry);

          // 判断是目录还是文件
          if (statSync(srcPath).isDirectory()) {
            // 递归复制子目录
            copyDir(srcPath, destPath);
          } else {
            // 复制文件
            copyFileSync(srcPath, destPath);
          }
        }
      }

      try {
        console.log('📦 正在复制示例文件...');
        console.log(`   配置: exampleDir = "${exampleDir}"`);
        console.log(`   源目录: ${srcDir}`);
        console.log(`   目标目录: ${destDir}`);

        copyDir(srcDir, destDir);

        console.log(`✓ 示例文件已成功复制到 public/${cleanedPath}`);
      } catch (err) {
        console.error('❌ 复制示例文件失败:', err);
      }
    }
  };
}

/**
 * @description
 * HACK: vite bugs: https://github.com/vitejs/vite/issues/14545 不能预编译子依赖.
 * 因此使用方必需手动安装下面的依赖
 * 'veaury', 'semver', 'markdown-it', 'sucrase'
 */
const baseConfig = defineConfig({
  markdown: {
    config(md) {
      md.use(demoBlockPlugin).use(taskLists);
    }
  },
  vite: {
    optimizeDeps: {
      include: [
        ...deps,
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-live'
      ]
    },
    resolve: {
      alias: {
        // 强制使用 dayjs 的 ESM 版本，但保留插件路径
        dayjs$: 'dayjs/esm/index.js',
        // 确保 React 使用正确的版本
        'react': 'react',
        'react-dom': 'react-dom'
      },
      dedupe: ['react', 'react-dom']
    },
    plugins: [
      react({
        jsxRuntime: 'automatic',
        jsxImportSource: 'react'
      }),
      // 自动复制示例文件到 public 目录
      createCopyExamplePlugin()
    ],
    ssr: {
      noExternal: deps
    }
  }
});

export { baseConfig };
