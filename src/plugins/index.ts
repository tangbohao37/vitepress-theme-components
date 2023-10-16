
import { parse, type ParseResult } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import { baseParse, transform } from '@vue/compiler-core';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { type MarkdownRenderer } from 'vitepress';
/**
 * It runs in Node.js.
 */
import { importRegex, scriptClientRE, scriptRE, scriptRegex, scriptSetupRE } from '../constant/index.js'
import { type ILiveEditor } from '../types';

const DemoTag = 'LiveEditor';

const filterJSXComments = (code: string) => {
  const commentRegex = /{\/\*[\s\S]*?\*\/}|\/\/.*/g;
  return code.replace(commentRegex, '');
};

const importStatementObj = (code: string) => {
  const importRecord: Record<string, any> = {};
  const directImportRecord = [];
  // const importPattern = /import\s+(.*?)\s+from/gs
  const importPattern = /import\s+([\w*{}\s,]+)\s+from\s+['"]([^'"]+)['"]/gms;
  const modulePattern = /from\s+['"]([^'"]+)['"]/g;

  const regex = /import\s+["']([^"']+)["'](?!.*\bfrom\b)/g;
  let match;
  while ((match = regex.exec(code)) !== null) {
    const importStatement = match[0];
    directImportRecord.push(importStatement);
  }

  let importMatches;
  // 匹配 { xxxx , xxxx}
  while ((importMatches = importPattern.exec(code)) !== null) {
    if (importMatches.length > 1) {
      const importText = importMatches[1].trim();

      // Find the module using modulePattern
      let moduleMatches;
      if ((moduleMatches = modulePattern.exec(code)) !== null) {
        if (moduleMatches.length > 1) {
          //  from xxxxxx
          const moduleText = moduleMatches[1].trim();
          //  import xxxx ,{ xxxx }
          const pattern = /[{}]/;
          const hasBrace = pattern.test(importText);
          const _import = importText.split(',').map((i) => {
            // 处理 包含 { 或者 } 的import
            if (hasBrace) {
              const _n = `{ ${i.replace(/[{}]/g, '').trim()} }`;
              return _n;
            }
            return i.trim();
          });
          _import.forEach((_i) => {
            importRecord[_i] = moduleText;
          });
        }
      }
    }
  }

  return { importRecord, directImportRecord };
};

const getFileStatement = (mdFilePath: string, sourceCodePath: string) => {
  // TODO: 如何获取 vite 配置？ 方便使用 @ 别名路径
  const codeFilePath = path.resolve(mdFilePath, sourceCodePath); // 引入的 code 原文件路径
  const fileExists = fs.existsSync(codeFilePath);
  if (!fileExists) {
    console.log(`${sourceCodePath}  未找到原文件!`);
    return;
  }

  const sourceFileStr = fs.readFileSync(codeFilePath, 'utf-8');
  const demoImportCode = filterJSXComments(sourceFileStr)?.match(importRegex);
  const _demoImportCode = demoImportCode?.join(os.EOL);

  return {
    sourceFileStr: sourceFileStr.replaceAll('"', "'"),
    demoImportCodeArr: demoImportCode,
    demoImportCodeStr: _demoImportCode
  };
};

const getImportModules = (ast: ParseResult<any>) => {
  const importModules = new Set<string>();
  // FIXME： 等 @types/babel__traverse 更新 @7.22.5 后修复
  (traverse as any).default(ast, {
    Identifier(path: NodePath<any>) {
      if (
        path.parent.type === 'ImportDefaultSpecifier' ||
        path.parent.type === 'ImportSpecifier' ||
        path.parent.type === 'ImportNamespaceSpecifier'
      ) {
        importModules.add(path.node.name);
      }
    }
  });

  return Array.from(importModules.keys());
};

interface IPropsType extends ILiveEditor {
  sourceCodePath: string;
}

// TIP: 使用 eslint 进行 import 去重复更好，但是markdown-it 不支持异步方法
// const lintCode = (code: string) => {
//   const eslint = new ESLint({
//     fix: true,
//     fixTypes: ['problem', 'suggestion', 'layout'],
//     plugins: { unicorn },
//     useEslintrc: false,
//     overrideConfig: {
//       extends: ['standard', 'eslint:recommended', 'prettier'],
//       parser: '@typescript-eslint/parser',
//       parserOptions: {
//         sourceType: 'module',
//         ecmaVersion: 'latest'
//       },
//       rules: {
//         'no-duplicate-imports': 'warn',
//         'no-unused-vars': 'off'
//       },
//       env: {
//         es2022: true,
//         node: true
//       }
//     }
//   });
//   return eslint.lintText(code).then(([res]) => {
//     return res.output || '';
//   });
// };

const buildImportStatement = (obj: Record<string, string>) => {
  return Object.entries(obj).map(([k, v]) => {
    return `import ${k} from '${v}';`;
  });
};

export function demoBlockPlugin(md: MarkdownRenderer) {
  const addRenderRule = (type: string) => {
    const defaultRender = md.renderer.rules[type];

    md.renderer.rules[type] = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      const content = token.content.trim();

      if (!content.match(new RegExp(`^<${DemoTag}\\s`))) {
        return defaultRender!(tokens, idx, options, env, self);
      }
      const props = parseProps<IPropsType>(content);

      if (!props.sourceCodePath) {
        return defaultRender!(tokens, idx, options, env, self);
      }
      const mdFilePath = path.dirname(env.path); // md 原文件路径
      const statement = getFileStatement(mdFilePath, props.sourceCodePath);
      if (!statement) {
        // TODO: 改为错误提示
        return defaultRender!(tokens, idx, options, env, self);
      }
      const { sourceFileStr, demoImportCodeArr, demoImportCodeStr } = statement;
      if (demoImportCodeStr) {
        if (!env.sfcBlocks.scripts) {
          env.sfcBlocks.scripts = [];
        }
        const tags = env.sfcBlocks.scripts as { content: string }[];
        const existingSetupScriptIndex = tags?.findIndex(
          (tag) =>
            scriptRE.test(tag.content) &&
            scriptSetupRE.test(tag.content) &&
            !scriptClientRE.test(tag.content)
        );
        let _code = demoImportCodeStr;
        if (existingSetupScriptIndex > -1) {
          const tagSrc = tags[existingSetupScriptIndex];
          const [, c] = tagSrc.content.match(scriptRegex);
          const componentRegisStatement = demoImportCodeArr.join(os.EOL).trim();
          _code = [c, componentRegisStatement].join(os.EOL);
        }
        const { importRecord: statementObj, directImportRecord } =
          importStatementObj(_code);
        const importStatementCode = buildImportStatement(statementObj)
          .join(os.EOL)
          .trim();
        const finalCode = [importStatementCode, ...directImportRecord]
          .join(os.EOL)
          .trim();
        const ast = parse(finalCode, {
          sourceType: 'module',
          plugins: ['typescript']
        });

        // 分离 import 语句的 module。 获取需要引入的 scope 传给 LiveEditor
        const _modules = getImportModules(ast);
        if (existingSetupScriptIndex > -1) {
          tags[existingSetupScriptIndex].content =
            `<script lang="ts" setup >${finalCode}</script>`.trim();
        } else {
          tags.unshift({
            content: `<script lang="ts" setup >${finalCode}</script>`.trim()
          });
        }
        return liveEditorTemplate({
          sourceCode: sourceFileStr,
          hideCode: props.hideCode,
          noStyle: props.noStyle,
          scope: _modules.toString() as any
        });
      }
      return liveEditorTemplate({
        sourceCode: sourceFileStr,
        hideCode: props.hideCode,
        noStyle: props.noStyle
      });
    };
  };
  // addRenderRule('html_block');
  addRenderRule('html_inline');
}

const liveEditorTemplate = ({
  sourceCode,
  hideCode,
  noStyle,
  scope
}: ILiveEditor) => {
  return `<LiveEditor :scope="{ ${scope} }" sourceCode="${sourceCode}" :hideCode="${hideCode}" :noStyle="${noStyle}" ></LiveEditor>`;
};

export const parseProps = <T extends Record<string, any> = any>(
  content: string
) => {
  const ast = baseParse(content);
  const propsMap: any = {};
  transform(ast, {
    nodeTransforms: [
      (node) => {
        if (node.type === 1 && node.tag === 'LiveEditor') {
          // 元素节点且标签为 LiveEditor
          // 提取参数
          if (node.props.length) {
            node.props.forEach((prop) => {
              if (prop.type === 6) {
                // 属性节点
                propsMap[prop.name] = prop.value?.content;
              }
              if (prop.type === 7) {
                const propName = prop.arg?.loc.source;
                const propVal = prop.exp?.loc.source;
                let v = false;
                try {
                  v = JSON.parse(propVal || '');
                } catch (error) {
                  v = false;
                }
                propName && (propsMap[propName] = v);
              }
            });
          }
        }
      }
    ]
  });

  return propsMap as T;
};
