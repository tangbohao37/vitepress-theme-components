#!/usr/bin/env node

import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取源类型文件
const srcTypesPath = resolve(__dirname, '../src/types/index.ts');
const libTypesDir = resolve(__dirname, '../lib/types');
const libTypesJs = resolve(libTypesDir, 'index.js');
const libTypesDts = resolve(libTypesDir, 'index.d.ts');

// 确保目录存在
mkdirSync(libTypesDir, { recursive: true });

// 创建 .js 文件（运行时空导出）
writeFileSync(libTypesJs, `// 类型定义文件，运行时为空导出
export {};
`);

// 读取源类型文件内容并转换为 .d.ts
const srcContent = readFileSync(srcTypesPath, 'utf8');

// 简单的转换：将 import 语句和 export 语句保持不变
// 因为这些都是类型定义，在 .d.ts 中是有效的
writeFileSync(libTypesDts, srcContent);

console.log('✅ Types built successfully!');
console.log(`   - ${libTypesJs}`);
console.log(`   - ${libTypesDts}`);
