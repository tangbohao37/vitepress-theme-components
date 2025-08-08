import { parse, type ParseResult } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import { baseParse, transform } from '@vue/compiler-core';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as docgen from 'react-docgen-typescript';
import { markdownRender } from 'react-docgen-typescript-markdown-render';
import { type MarkdownRenderer } from 'vitepress';
/**
 * It runs in Node.js.
 */
import {
  importRegex,
  scriptClientRE,
  scriptRE,
  scriptRegex,
  scriptSetupRE
} from '../constant/index.js';
import { type ILiveEditor } from '../types';

const LiveEditorTag = 'LiveEditor';
const DrawerLiveEditorTag = 'DrawerLiveEditor';
const ApiTag = 'ApiTable';

const filterJSXComments = (code: string) => {
  const commentRegex = /{\/\*[\s\S]*?\*\/}|\/\/.*/g;
  return code.replace(commentRegex, '');
};

// 处理重新组合后的代码片段
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

// 根据原文件路径获取 react 源码,并分离出 import 语句代码片段
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

//  重新构建 import 语句
const buildImportStatement = (obj: Record<string, string>) => {
  return Object.entries(obj).map(([k, v]) => {
    return `import ${k} from '${v}';`;
  });
};

export function demoBlockPlugin(md: MarkdownRenderer) {
  const addRenderRule = (type: string) => {
    const defaultRender = md.renderer.rules[type];

    // 覆盖渲染规则
    md.renderer.rules[type] = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      const content = token.content.trim();
      const liveEditorReg = new RegExp(`^<${LiveEditorTag}\\s`);
      if (liveEditorReg.test(content)) {
        try {
          return liveEditorRender(
            tokens,
            idx,
            options,
            env,
            self,
            content,
            LiveEditorTag
          );
        } catch (error) {
          return defaultRender(tokens, idx, options, env, self);
        }
      }
      const DrawerLiveEditorTagReg = new RegExp(`^<${DrawerLiveEditorTag}\\s`);
      if (DrawerLiveEditorTagReg.test(content)) {
        try {
          return liveEditorRender(
            tokens,
            idx,
            options,
            env,
            self,
            content,
            DrawerLiveEditorTag
          );
        } catch (error) {
          return defaultRender(tokens, idx, options, env, self);
        }
      }
      const ApiTableTag = new RegExp(`^<${ApiTag}\\s`);
      if (ApiTableTag.test(content)) {
        try {
          return ApiTableRender(tokens, idx, options, env, self, content);
        } catch (error) {
          return defaultRender(tokens, idx, options, env, self);
        }
      }
      return defaultRender(tokens, idx, options, env, self);
    };
  };
  // addRenderRule('html_block');
  addRenderRule('html_inline');
  
  // 添加这一行来启用 Mermaid 支持
  MermaidExample(md);
}

const liveEditorTemplate = ({
  sourceCode,
  hideCode,
  noStyle,
  scope,
  tag
}: ILiveEditor & { tag: string }) => {
  return `<${tag} :scope="{ ${scope} }" sourceCode="${sourceCode}" :hideCode="${hideCode}" :noStyle="${noStyle}" ></${tag}>`;
};

const liveEditorRender = (tokens, idx, options, env, self, content, tag) => {
  // 提取参数
  const props = parseProps<IPropsType>(content);

  const mdFilePath = path.dirname(env.path); // md 原文件路径

  // 根据 sourceCodePath 获取 react 源码，并分离出 import语句代码片段
  const statement = getFileStatement(mdFilePath, props.sourceCodePath);
  if (!props.sourceCodePath) {
    // 容错机制-如果没有 sourceCodePath 则报错提示
    throw new Error(`${mdFilePath} LiveEditor 缺少 sourceCodePath 属性!`);
  }
  if (!statement) {
    throw new Error(`${mdFilePath} 语句解析错误`);
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
    // FIXME： 切换文件后需要清空缓存的 import 语句
    if (existingSetupScriptIndex > -1) {
      // 如果 script 中还有其他引入
      const tagSrc = tags[existingSetupScriptIndex];
      const [, c] = tagSrc.content.match(scriptRegex);
      const componentRegisStatement = demoImportCodeArr.join(os.EOL).trim();
      // 将 react-live 所需 scope 添加在script 之中
      _code = [c, componentRegisStatement].join(os.EOL);
    }
    /**
     * 重新处理添加 scope 之后的代码片段，以obj形式输出所需依赖的scope
     * 这里没用直接用 babel 等工具来提取，是因为很有可能这里的code语句语法是错误的
     * 如 import a from 'b'
     *    import a from 'c'
     * 这种类似的重复命名，或者重复引用
     */
    const { importRecord: statementObj, directImportRecord } =
      importStatementObj(_code);
    const importStatementCode = buildImportStatement(statementObj)
      .join(os.EOL)
      .trim();
    const finalCode = [importStatementCode, ...directImportRecord]
      .join(os.EOL)
      .trim();

    // babel 重新编译,形成正确的 import 语句片段
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
      scope: _modules.toString() as any,
      tag
    });
  }
  return liveEditorTemplate({
    sourceCode: sourceFileStr,
    hideCode: props.hideCode,
    noStyle: props.noStyle,
    tag
  });
};

const ApiTableRender = (tokens, idx, options, env, self, content) => {
  const props = parseProps<{ path: string }>(content);
  const mdFilePath = path.dirname(env.path); // md 原文件路径
  const p = path.resolve(mdFilePath, props.path); // 引入的 code 原文件路径
  console.log('ApiTable file path:', p);
  const opts: docgen.ParserOptions = {
    savePropValueAsString: false,
    skipChildrenPropWithoutDoc: false,
    shouldRemoveUndefinedFromOptional: false,
    shouldExtractValuesFromUnion: false
  };

  const res = docgen.parse(p, opts);
  const str = markdownRender(res);
  return `<ApiTable content='${str}'></ApiTable>`;
};

export const parseProps = <T extends Record<string, any> = any>(
  content: string
) => {
  const ast = baseParse(content);
  const propsMap: any = {};
  transform(ast, {
    nodeTransforms: [
      (node) => {
        if (node.type === 1 && content.includes(node.tag)) {
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

const MermaidExample = (md: MarkdownRenderer) => {
  const defaultRenderer = md.renderer.rules.fence;

  if (!defaultRenderer) {
    throw new Error('defaultRenderer is undefined');
  }

  md.renderer.rules.fence = (tokens, index, options, env, slf) => {
    const token = tokens[index];
    const language = token.info.trim();
    if (language.startsWith('mermaid')) {
      const key = index;
      return `
      <Suspense> 
      <template #default>
      <Mermaid id="mermaid-${key}" :showCode="${
        language === 'mermaid-example'
      }" graph="${encodeURIComponent(token.content)}"></Mermaid>
      </template>
        <!-- loading state via #fallback slot -->
        <template #fallback>
          Loading...
        </template>
      </Suspense>
`;
    } else if (language === 'warning') {
      return `<div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>${token.content}}</p></div>`;
    } else if (language === 'note') {
      return `<div class="tip custom-block"><p class="custom-block-title">NOTE</p><p>${token.content}}</p></div>`;
    } else if (language === 'regexp') {
      // shiki doesn't yet support regexp code blocks, but the javascript
      // one still makes RegExes look good
      token.info = 'javascript';
      // use trimEnd to move trailing `\n` outside if the JavaScript regex `/` block
      token.content = `/${token.content.trimEnd()}/\n`;
      return defaultRenderer(tokens, index, options, env, slf);
    } else if (language === 'jison') {
      return `<div class="language-">
      <button class="copy"></button>
      <span class="lang">jison</span>
      <pre>
      <code>${token.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
      </pre>
      </div>`;
    }

    return defaultRenderer(tokens, index, options, env, slf);
  };
};
