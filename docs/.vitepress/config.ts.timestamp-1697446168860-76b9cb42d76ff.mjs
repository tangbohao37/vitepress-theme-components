// docs/.vitepress/config.ts
import { defineConfigWithTheme } from "file:///Users/tangbohao/PrivateProject/vitepress-theme-components/node_modules/.pnpm/vitepress@1.0.0-rc.20_@algolia+client-search@4.20.0_@types+node@20.7.0_@types+react@18.2.23_p_syppvz2yfzb7622fn2emauld4q/node_modules/vitepress/dist/node/index.js";

// lib/plugins/index.js
import { parse } from "file:///Users/tangbohao/PrivateProject/vitepress-theme-components/node_modules/.pnpm/@babel+parser@7.23.0/node_modules/@babel/parser/lib/index.js";
import traverse from "file:///Users/tangbohao/PrivateProject/vitepress-theme-components/node_modules/.pnpm/@babel+traverse@7.23.0/node_modules/@babel/traverse/lib/index.js";
import { baseParse, transform } from "file:///Users/tangbohao/PrivateProject/vitepress-theme-components/node_modules/.pnpm/@vue+compiler-core@3.3.4/node_modules/@vue/compiler-core/index.js";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

// lib/constant/index.js
var importRegex = /import\s+[\w*{}\s,]+\s+from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g;
var scriptRE = /<\/script>/;
var scriptSetupRE = /<\s*script[^>]*\bsetup\b[^>]*/;
var scriptClientRE = /<\s*script[^>]*\bclient\b[^>]*/;
var scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/;

// lib/plugins/index.js
function _array_like_to_array(arr, len) {
  if (len == null || len > arr.length)
    len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++)
    arr2[i] = arr[i];
  return arr2;
}
function _array_with_holes(arr) {
  if (Array.isArray(arr))
    return arr;
}
function _array_without_holes(arr) {
  if (Array.isArray(arr))
    return _array_like_to_array(arr);
}
function _iterable_to_array(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
    return Array.from(iter);
}
function _iterable_to_array_limit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
  if (_i == null)
    return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _s, _e;
  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i && _arr.length === i)
        break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null)
        _i["return"]();
    } finally {
      if (_d)
        throw _e;
    }
  }
  return _arr;
}
function _non_iterable_rest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _non_iterable_spread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _sliced_to_array(arr, i) {
  return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _to_consumable_array(arr) {
  return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _unsupported_iterable_to_array(o, minLen) {
  if (!o)
    return;
  if (typeof o === "string")
    return _array_like_to_array(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor)
    n = o.constructor.name;
  if (n === "Map" || n === "Set")
    return Array.from(n);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _array_like_to_array(o, minLen);
}
var DemoTag = "LiveEditor";
var filterJSXComments = function(code) {
  var commentRegex = /{\/\*[\s\S]*?\*\/}|\/\/.*/g;
  return code.replace(commentRegex, "");
};
var importStatementObj = function(code) {
  var _loop = function() {
    if (importMatches.length > 1) {
      var importText = importMatches[1].trim();
      var moduleMatches = void 0;
      if ((moduleMatches = modulePattern.exec(code)) !== null) {
        if (moduleMatches.length > 1) {
          var moduleText = moduleMatches[1].trim();
          var pattern = /[{}]/;
          var hasBrace = pattern.test(importText);
          var _import = importText.split(",").map(function(i) {
            if (hasBrace) {
              var _n = "{ ".concat(i.replace(/[{}]/g, "").trim(), " }");
              return _n;
            }
            return i.trim();
          });
          _import.forEach(function(_i) {
            importRecord[_i] = moduleText;
          });
        }
      }
    }
  };
  var importRecord = {};
  var directImportRecord = [];
  var importPattern = RegExp(`import\\s+([\\w*{}\\s,]+)\\s+from\\s+['"]([^'"]+)['"]`, "gms");
  var modulePattern = /from\s+['"]([^'"]+)['"]/g;
  var regex = /import\s+["']([^"']+)["'](?!.*\bfrom\b)/g;
  var match;
  while ((match = regex.exec(code)) !== null) {
    var importStatement = match[0];
    directImportRecord.push(importStatement);
  }
  var importMatches;
  while ((importMatches = importPattern.exec(code)) !== null)
    _loop();
  return {
    importRecord,
    directImportRecord
  };
};
var getFileStatement = function(mdFilePath, sourceCodePath) {
  var _filterJSXComments;
  var codeFilePath = path.resolve(mdFilePath, sourceCodePath);
  var fileExists = fs.existsSync(codeFilePath);
  if (!fileExists) {
    console.log("".concat(sourceCodePath, "  \u672A\u627E\u5230\u539F\u6587\u4EF6!"));
    return;
  }
  var sourceFileStr = fs.readFileSync(codeFilePath, "utf-8");
  var demoImportCode = (_filterJSXComments = filterJSXComments(sourceFileStr)) === null || _filterJSXComments === void 0 ? void 0 : _filterJSXComments.match(importRegex);
  var _demoImportCode = demoImportCode === null || demoImportCode === void 0 ? void 0 : demoImportCode.join(os.EOL);
  return {
    sourceFileStr: sourceFileStr.replaceAll('"', "'"),
    demoImportCodeArr: demoImportCode,
    demoImportCodeStr: _demoImportCode
  };
};
var getImportModules = function(ast) {
  var importModules = /* @__PURE__ */ new Set();
  traverse.default(ast, {
    Identifier: function Identifier(path4) {
      if (path4.parent.type === "ImportDefaultSpecifier" || path4.parent.type === "ImportSpecifier" || path4.parent.type === "ImportNamespaceSpecifier") {
        importModules.add(path4.node.name);
      }
    }
  });
  return Array.from(importModules.keys());
};
var buildImportStatement = function(obj) {
  return Object.entries(obj).map(function(param) {
    var _param = _sliced_to_array(param, 2), k = _param[0], v = _param[1];
    return "import ".concat(k, " from '").concat(v, "';");
  });
};
function demoBlockPlugin(md) {
  var addRenderRule = function(type) {
    var defaultRender = md.renderer.rules[type];
    md.renderer.rules[type] = function(tokens, idx, options, env, self) {
      var token = tokens[idx];
      var content = token.content.trim();
      if (!content.match(new RegExp("^<".concat(DemoTag, "\\s")))) {
        return defaultRender(tokens, idx, options, env, self);
      }
      var props = parseProps(content);
      if (!props.sourceCodePath) {
        return defaultRender(tokens, idx, options, env, self);
      }
      var mdFilePath = path.dirname(env.path);
      var statement = getFileStatement(mdFilePath, props.sourceCodePath);
      if (!statement) {
        return defaultRender(tokens, idx, options, env, self);
      }
      var sourceFileStr = statement.sourceFileStr, demoImportCodeArr = statement.demoImportCodeArr, demoImportCodeStr = statement.demoImportCodeStr;
      if (demoImportCodeStr) {
        if (!env.sfcBlocks.scripts) {
          env.sfcBlocks.scripts = [];
        }
        var tags = env.sfcBlocks.scripts;
        var existingSetupScriptIndex = tags === null || tags === void 0 ? void 0 : tags.findIndex(function(tag) {
          return scriptRE.test(tag.content) && scriptSetupRE.test(tag.content) && !scriptClientRE.test(tag.content);
        });
        var _code = demoImportCodeStr;
        if (existingSetupScriptIndex > -1) {
          var tagSrc = tags[existingSetupScriptIndex];
          var _tagSrc_content_match = _sliced_to_array(tagSrc.content.match(scriptRegex), 2), c = _tagSrc_content_match[1];
          var componentRegisStatement = demoImportCodeArr.join(os.EOL).trim();
          _code = [
            c,
            componentRegisStatement
          ].join(os.EOL);
        }
        var _importStatementObj = importStatementObj(_code), statementObj = _importStatementObj.importRecord, directImportRecord = _importStatementObj.directImportRecord;
        var importStatementCode = buildImportStatement(statementObj).join(os.EOL).trim();
        var finalCode = [
          importStatementCode
        ].concat(_to_consumable_array(directImportRecord)).join(os.EOL).trim();
        var ast = parse(finalCode, {
          sourceType: "module",
          plugins: [
            "typescript"
          ]
        });
        var _modules = getImportModules(ast);
        if (existingSetupScriptIndex > -1) {
          tags[existingSetupScriptIndex].content = '<script lang="ts" setup >'.concat(finalCode, "</script>").trim();
        } else {
          tags.unshift({
            content: '<script lang="ts" setup >'.concat(finalCode, "</script>").trim()
          });
        }
        return liveEditorTemplate({
          sourceCode: sourceFileStr,
          hideCode: props.hideCode,
          noStyle: props.noStyle,
          scope: _modules.toString()
        });
      }
      return liveEditorTemplate({
        sourceCode: sourceFileStr,
        hideCode: props.hideCode,
        noStyle: props.noStyle
      });
    };
  };
  addRenderRule("html_inline");
}
var liveEditorTemplate = function(param) {
  var sourceCode = param.sourceCode, hideCode = param.hideCode, noStyle = param.noStyle, scope = param.scope;
  return '<LiveEditor :scope="{ '.concat(scope, ' }" sourceCode="').concat(sourceCode, '" :hideCode="').concat(hideCode, '" :noStyle="').concat(noStyle, '" ></LiveEditor>');
};
var parseProps = function(content) {
  var ast = baseParse(content);
  var propsMap = {};
  transform(ast, {
    nodeTransforms: [
      function(node) {
        if (node.type === 1 && node.tag === "LiveEditor") {
          if (node.props.length) {
            node.props.forEach(function(prop) {
              if (prop.type === 6) {
                var _prop_value;
                propsMap[prop.name] = (_prop_value = prop.value) === null || _prop_value === void 0 ? void 0 : _prop_value.content;
              }
              if (prop.type === 7) {
                var _prop_arg, _prop_exp;
                var propName = (_prop_arg = prop.arg) === null || _prop_arg === void 0 ? void 0 : _prop_arg.loc.source;
                var propVal = (_prop_exp = prop.exp) === null || _prop_exp === void 0 ? void 0 : _prop_exp.loc.source;
                var v = false;
                try {
                  v = JSON.parse(propVal || "");
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
  return propsMap;
};

// lib/base-config.js
import { defineConfig } from "file:///Users/tangbohao/PrivateProject/vitepress-theme-components/node_modules/.pnpm/vitepress@1.0.0-rc.20_@algolia+client-search@4.20.0_@types+node@20.7.0_@types+react@18.2.23_p_syppvz2yfzb7622fn2emauld4q/node_modules/vitepress/dist/node/index.js";
import AutoImport from "file:///Users/tangbohao/PrivateProject/vitepress-theme-components/node_modules/.pnpm/unplugin-auto-import@0.16.6/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///Users/tangbohao/PrivateProject/vitepress-theme-components/node_modules/.pnpm/unplugin-vue-components@0.25.2_@babel+parser@7.23.0_vue@3.3.4/node_modules/unplugin-vue-components/dist/vite.mjs";
import IconsResolver from "file:///Users/tangbohao/PrivateProject/vitepress-theme-components/node_modules/.pnpm/unplugin-icons@0.17.0_vue-template-compiler@2.7.14/node_modules/unplugin-icons/dist/resolver.mjs";
import { ElementPlusResolver } from "file:///Users/tangbohao/PrivateProject/vitepress-theme-components/node_modules/.pnpm/unplugin-vue-components@0.25.2_@babel+parser@7.23.0_vue@3.3.4/node_modules/unplugin-vue-components/dist/resolvers.mjs";
import Icons from "file:///Users/tangbohao/PrivateProject/vitepress-theme-components/node_modules/.pnpm/unplugin-icons@0.17.0_vue-template-compiler@2.7.14/node_modules/unplugin-icons/dist/vite.mjs";
import path2 from "path";
var baseConfig = defineConfig({
  markdown: {
    config: function config(md) {
      md.use(demoBlockPlugin);
    }
  },
  vite: {
    plugins: [
      AutoImport({
        resolvers: [
          ElementPlusResolver(),
          IconsResolver()
        ],
        dts: path2.resolve("../auto-imports.d.ts")
      }),
      Components({
        resolvers: [
          ElementPlusResolver(),
          IconsResolver()
        ],
        dts: path2.resolve("../components.d.ts")
      }),
      Icons({
        autoInstall: true
      })
    ]
  }
});

// docs/.vitepress/config.ts
import path3 from "path";
var __vite_injected_original_dirname = "/Users/tangbohao/PrivateProject/vitepress-theme-components/docs/.vitepress";
var root = path3.resolve(__vite_injected_original_dirname, "../../docs");
var config_default = defineConfigWithTheme({
  title: "My Awesome Project",
  description: "A VitePress Site",
  extends: baseConfig,
  base: "/vitepress-theme-components/",
  themeConfig: {
    changelog: {
      path: "/CHANGELOG-test.md"
    },
    coverage: {
      path: "/coverage-summary.json"
    },
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "Demo", link: "/demo/" }
    ],
    sidebar: {
      "/guide/": {
        base: "/guide/",
        items: [
          {
            text: "Guide",
            items: [{ text: "Start", link: "/" }]
          }
        ]
      },
      "/demo/": {
        base: "/demo/",
        items: [
          {
            text: "Demo Components",
            items: [
              { text: "Button", link: "/button" },
              { text: "Icon", link: "/icon" }
            ]
          }
        ]
      }
    }
  },
  vite: {
    ssr: {
      noExternal: ["element-plus", "veaury"]
    }
  }
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiZG9jcy8udml0ZXByZXNzL2NvbmZpZy50cyIsICJsaWIvcGx1Z2lucy9pbmRleC5qcyIsICJsaWIvY29uc3RhbnQvaW5kZXguanMiLCAibGliL2Jhc2UtY29uZmlnLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3Rhbmdib2hhby9Qcml2YXRlUHJvamVjdC92aXRlcHJlc3MtdGhlbWUtY29tcG9uZW50cy9kb2NzLy52aXRlcHJlc3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy90YW5nYm9oYW8vUHJpdmF0ZVByb2plY3Qvdml0ZXByZXNzLXRoZW1lLWNvbXBvbmVudHMvZG9jcy8udml0ZXByZXNzL2NvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvdGFuZ2JvaGFvL1ByaXZhdGVQcm9qZWN0L3ZpdGVwcmVzcy10aGVtZS1jb21wb25lbnRzL2RvY3MvLnZpdGVwcmVzcy9jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWdXaXRoVGhlbWUgfSBmcm9tICd2aXRlcHJlc3MnO1xuaW1wb3J0IHsgYmFzZUNvbmZpZyB9IGZyb20gJy4uLy4uL2xpYi9iYXNlLWNvbmZpZyc7XG5pbXBvcnQgeyB0eXBlIEFkdlRoZW1lQ29uZmlnIH0gZnJvbSAnLi4vLi4vbGliJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5jb25zdCByb290ID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL2RvY3MnKTtcblxuLy8gaHR0cHM6Ly92aXRlcHJlc3MuZGV2L3JlZmVyZW5jZS9zaXRlLWNvbmZpZ1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnV2l0aFRoZW1lPEFkdlRoZW1lQ29uZmlnPih7XG4gIHRpdGxlOiAnTXkgQXdlc29tZSBQcm9qZWN0JyxcbiAgZGVzY3JpcHRpb246ICdBIFZpdGVQcmVzcyBTaXRlJyxcbiAgZXh0ZW5kczogYmFzZUNvbmZpZyxcbiAgYmFzZTogJy92aXRlcHJlc3MtdGhlbWUtY29tcG9uZW50cy8nLFxuICB0aGVtZUNvbmZpZzoge1xuICAgIGNoYW5nZWxvZzoge1xuICAgICAgcGF0aDogJy9DSEFOR0VMT0ctdGVzdC5tZCdcbiAgICB9LFxuICAgIGNvdmVyYWdlOiB7XG4gICAgICBwYXRoOiAnL2NvdmVyYWdlLXN1bW1hcnkuanNvbidcbiAgICB9LFxuICAgIG5hdjogW1xuICAgICAgeyB0ZXh0OiAnR3VpZGUnLCBsaW5rOiAnL2d1aWRlLycgfSxcbiAgICAgIHsgdGV4dDogJ0RlbW8nLCBsaW5rOiAnL2RlbW8vJyB9XG4gICAgXSxcbiAgICBzaWRlYmFyOiB7XG4gICAgICAnL2d1aWRlLyc6IHtcbiAgICAgICAgYmFzZTogJy9ndWlkZS8nLFxuICAgICAgICBpdGVtczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRleHQ6ICdHdWlkZScsXG4gICAgICAgICAgICBpdGVtczogW3sgdGV4dDogJ1N0YXJ0JywgbGluazogJy8nIH1dXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAgJy9kZW1vLyc6IHtcbiAgICAgICAgYmFzZTogJy9kZW1vLycsXG4gICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgdGV4dDogJ0RlbW8gQ29tcG9uZW50cycsXG4gICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICB7IHRleHQ6ICdCdXR0b24nLCBsaW5rOiAnL2J1dHRvbicgfSxcbiAgICAgICAgICAgICAgeyB0ZXh0OiAnSWNvbicsIGxpbms6ICcvaWNvbicgfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgdml0ZToge1xuICAgIHNzcjoge1xuICAgICAgbm9FeHRlcm5hbDogWydlbGVtZW50LXBsdXMnLCAndmVhdXJ5J11cbiAgICB9XG4gIH1cbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvdGFuZ2JvaGFvL1ByaXZhdGVQcm9qZWN0L3ZpdGVwcmVzcy10aGVtZS1jb21wb25lbnRzL2xpYi9wbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvdGFuZ2JvaGFvL1ByaXZhdGVQcm9qZWN0L3ZpdGVwcmVzcy10aGVtZS1jb21wb25lbnRzL2xpYi9wbHVnaW5zL2luZGV4LmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy90YW5nYm9oYW8vUHJpdmF0ZVByb2plY3Qvdml0ZXByZXNzLXRoZW1lLWNvbXBvbmVudHMvbGliL3BsdWdpbnMvaW5kZXguanNcIjtmdW5jdGlvbiBfYXJyYXlfbGlrZV90b19hcnJheShhcnIsIGxlbikge1xuICAgIGlmIChsZW4gPT0gbnVsbCB8fCBsZW4gPiBhcnIubGVuZ3RoKSBsZW4gPSBhcnIubGVuZ3RoO1xuICAgIGZvcih2YXIgaSA9IDAsIGFycjIgPSBuZXcgQXJyYXkobGVuKTsgaSA8IGxlbjsgaSsrKWFycjJbaV0gPSBhcnJbaV07XG4gICAgcmV0dXJuIGFycjI7XG59XG5mdW5jdGlvbiBfYXJyYXlfd2l0aF9ob2xlcyhhcnIpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSByZXR1cm4gYXJyO1xufVxuZnVuY3Rpb24gX2FycmF5X3dpdGhvdXRfaG9sZXMoYXJyKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgcmV0dXJuIF9hcnJheV9saWtlX3RvX2FycmF5KGFycik7XG59XG5mdW5jdGlvbiBfaXRlcmFibGVfdG9fYXJyYXkoaXRlcikge1xuICAgIGlmICh0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIGl0ZXJbU3ltYm9sLml0ZXJhdG9yXSAhPSBudWxsIHx8IGl0ZXJbXCJAQGl0ZXJhdG9yXCJdICE9IG51bGwpIHJldHVybiBBcnJheS5mcm9tKGl0ZXIpO1xufVxuZnVuY3Rpb24gX2l0ZXJhYmxlX3RvX2FycmF5X2xpbWl0KGFyciwgaSkge1xuICAgIHZhciBfaSA9IGFyciA9PSBudWxsID8gbnVsbCA6IHR5cGVvZiBTeW1ib2wgIT09IFwidW5kZWZpbmVkXCIgJiYgYXJyW1N5bWJvbC5pdGVyYXRvcl0gfHwgYXJyW1wiQEBpdGVyYXRvclwiXTtcbiAgICBpZiAoX2kgPT0gbnVsbCkgcmV0dXJuO1xuICAgIHZhciBfYXJyID0gW107XG4gICAgdmFyIF9uID0gdHJ1ZTtcbiAgICB2YXIgX2QgPSBmYWxzZTtcbiAgICB2YXIgX3MsIF9lO1xuICAgIHRyeSB7XG4gICAgICAgIGZvcihfaSA9IF9pLmNhbGwoYXJyKTsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSl7XG4gICAgICAgICAgICBfYXJyLnB1c2goX3MudmFsdWUpO1xuICAgICAgICAgICAgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIF9kID0gdHJ1ZTtcbiAgICAgICAgX2UgPSBlcnI7XG4gICAgfSBmaW5hbGx5e1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSAhPSBudWxsKSBfaVtcInJldHVyblwiXSgpO1xuICAgICAgICB9IGZpbmFsbHl7XG4gICAgICAgICAgICBpZiAoX2QpIHRocm93IF9lO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBfYXJyO1xufVxuZnVuY3Rpb24gX25vbl9pdGVyYWJsZV9yZXN0KCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKTtcbn1cbmZ1bmN0aW9uIF9ub25faXRlcmFibGVfc3ByZWFkKCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gc3ByZWFkIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXFxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIik7XG59XG5mdW5jdGlvbiBfc2xpY2VkX3RvX2FycmF5KGFyciwgaSkge1xuICAgIHJldHVybiBfYXJyYXlfd2l0aF9ob2xlcyhhcnIpIHx8IF9pdGVyYWJsZV90b19hcnJheV9saW1pdChhcnIsIGkpIHx8IF91bnN1cHBvcnRlZF9pdGVyYWJsZV90b19hcnJheShhcnIsIGkpIHx8IF9ub25faXRlcmFibGVfcmVzdCgpO1xufVxuZnVuY3Rpb24gX3RvX2NvbnN1bWFibGVfYXJyYXkoYXJyKSB7XG4gICAgcmV0dXJuIF9hcnJheV93aXRob3V0X2hvbGVzKGFycikgfHwgX2l0ZXJhYmxlX3RvX2FycmF5KGFycikgfHwgX3Vuc3VwcG9ydGVkX2l0ZXJhYmxlX3RvX2FycmF5KGFycikgfHwgX25vbl9pdGVyYWJsZV9zcHJlYWQoKTtcbn1cbmZ1bmN0aW9uIF91bnN1cHBvcnRlZF9pdGVyYWJsZV90b19hcnJheShvLCBtaW5MZW4pIHtcbiAgICBpZiAoIW8pIHJldHVybjtcbiAgICBpZiAodHlwZW9mIG8gPT09IFwic3RyaW5nXCIpIHJldHVybiBfYXJyYXlfbGlrZV90b19hcnJheShvLCBtaW5MZW4pO1xuICAgIHZhciBuID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLnNsaWNlKDgsIC0xKTtcbiAgICBpZiAobiA9PT0gXCJPYmplY3RcIiAmJiBvLmNvbnN0cnVjdG9yKSBuID0gby5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIGlmIChuID09PSBcIk1hcFwiIHx8IG4gPT09IFwiU2V0XCIpIHJldHVybiBBcnJheS5mcm9tKG4pO1xuICAgIGlmIChuID09PSBcIkFyZ3VtZW50c1wiIHx8IC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pKSByZXR1cm4gX2FycmF5X2xpa2VfdG9fYXJyYXkobywgbWluTGVuKTtcbn1cbmltcG9ydCB7IHBhcnNlIH0gZnJvbSBcIkBiYWJlbC9wYXJzZXJcIjtcbmltcG9ydCB0cmF2ZXJzZSBmcm9tIFwiQGJhYmVsL3RyYXZlcnNlXCI7XG5pbXBvcnQgeyBiYXNlUGFyc2UsIHRyYW5zZm9ybSB9IGZyb20gXCJAdnVlL2NvbXBpbGVyLWNvcmVcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0ICogYXMgb3MgZnJvbSBcIm9zXCI7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG4vKipcbiAqIEl0IHJ1bnMgaW4gTm9kZS5qcy5cbiAqLyBpbXBvcnQgeyBpbXBvcnRSZWdleCwgc2NyaXB0Q2xpZW50UkUsIHNjcmlwdFJFLCBzY3JpcHRSZWdleCwgc2NyaXB0U2V0dXBSRSB9IGZyb20gXCIuLi9jb25zdGFudC9pbmRleC5qc1wiO1xudmFyIERlbW9UYWcgPSBcIkxpdmVFZGl0b3JcIjtcbnZhciBmaWx0ZXJKU1hDb21tZW50cyA9IGZ1bmN0aW9uKGNvZGUpIHtcbiAgICB2YXIgY29tbWVudFJlZ2V4ID0gL3tcXC9cXCpbXFxzXFxTXSo/XFwqXFwvfXxcXC9cXC8uKi9nO1xuICAgIHJldHVybiBjb2RlLnJlcGxhY2UoY29tbWVudFJlZ2V4LCBcIlwiKTtcbn07XG52YXIgaW1wb3J0U3RhdGVtZW50T2JqID0gZnVuY3Rpb24oY29kZSkge1xuICAgIHZhciBfbG9vcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoaW1wb3J0TWF0Y2hlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICB2YXIgaW1wb3J0VGV4dCA9IGltcG9ydE1hdGNoZXNbMV0udHJpbSgpO1xuICAgICAgICAgICAgLy8gRmluZCB0aGUgbW9kdWxlIHVzaW5nIG1vZHVsZVBhdHRlcm5cbiAgICAgICAgICAgIHZhciBtb2R1bGVNYXRjaGVzID0gdm9pZCAwO1xuICAgICAgICAgICAgaWYgKChtb2R1bGVNYXRjaGVzID0gbW9kdWxlUGF0dGVybi5leGVjKGNvZGUpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmIChtb2R1bGVNYXRjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gIGZyb20geHh4eHh4XG4gICAgICAgICAgICAgICAgICAgIHZhciBtb2R1bGVUZXh0ID0gbW9kdWxlTWF0Y2hlc1sxXS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vICBpbXBvcnQgeHh4eCAseyB4eHh4IH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhdHRlcm4gPSAvW3t9XS87XG4gICAgICAgICAgICAgICAgICAgIHZhciBoYXNCcmFjZSA9IHBhdHRlcm4udGVzdChpbXBvcnRUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9pbXBvcnQgPSBpbXBvcnRUZXh0LnNwbGl0KFwiLFwiKS5tYXAoZnVuY3Rpb24oaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gXHU1OTA0XHU3NDA2IFx1NTMwNVx1NTQyQiB7IFx1NjIxNlx1ODAwNSB9IFx1NzY4NGltcG9ydFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhc0JyYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF9uID0gXCJ7IFwiLmNvbmNhdChpLnJlcGxhY2UoL1t7fV0vZywgXCJcIikudHJpbSgpLCBcIiB9XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIF9pbXBvcnQuZm9yRWFjaChmdW5jdGlvbihfaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1wb3J0UmVjb3JkW19pXSA9IG1vZHVsZVRleHQ7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgdmFyIGltcG9ydFJlY29yZCA9IHt9O1xuICAgIHZhciBkaXJlY3RJbXBvcnRSZWNvcmQgPSBbXTtcbiAgICAvLyBjb25zdCBpbXBvcnRQYXR0ZXJuID0gL2ltcG9ydFxccysoLio/KVxccytmcm9tL2dzXG4gICAgdmFyIGltcG9ydFBhdHRlcm4gPSBSZWdFeHAoXCJpbXBvcnRcXFxccysoW1xcXFx3Knt9XFxcXHMsXSspXFxcXHMrZnJvbVxcXFxzK1snXFxcIl0oW14nXFxcIl0rKVsnXFxcIl1cIiwgXCJnbXNcIik7XG4gICAgdmFyIG1vZHVsZVBhdHRlcm4gPSAvZnJvbVxccytbJ1wiXShbXidcIl0rKVsnXCJdL2c7XG4gICAgdmFyIHJlZ2V4ID0gL2ltcG9ydFxccytbXCInXShbXlwiJ10rKVtcIiddKD8hLipcXGJmcm9tXFxiKS9nO1xuICAgIHZhciBtYXRjaDtcbiAgICB3aGlsZSgobWF0Y2ggPSByZWdleC5leGVjKGNvZGUpKSAhPT0gbnVsbCl7XG4gICAgICAgIHZhciBpbXBvcnRTdGF0ZW1lbnQgPSBtYXRjaFswXTtcbiAgICAgICAgZGlyZWN0SW1wb3J0UmVjb3JkLnB1c2goaW1wb3J0U3RhdGVtZW50KTtcbiAgICB9XG4gICAgdmFyIGltcG9ydE1hdGNoZXM7XG4gICAgLy8gXHU1MzM5XHU5MTREIHsgeHh4eCAsIHh4eHh9XG4gICAgd2hpbGUoKGltcG9ydE1hdGNoZXMgPSBpbXBvcnRQYXR0ZXJuLmV4ZWMoY29kZSkpICE9PSBudWxsKV9sb29wKCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW1wb3J0UmVjb3JkOiBpbXBvcnRSZWNvcmQsXG4gICAgICAgIGRpcmVjdEltcG9ydFJlY29yZDogZGlyZWN0SW1wb3J0UmVjb3JkXG4gICAgfTtcbn07XG52YXIgZ2V0RmlsZVN0YXRlbWVudCA9IGZ1bmN0aW9uKG1kRmlsZVBhdGgsIHNvdXJjZUNvZGVQYXRoKSB7XG4gICAgdmFyIF9maWx0ZXJKU1hDb21tZW50cztcbiAgICAvLyBUT0RPOiBcdTU5ODJcdTRGNTVcdTgzQjdcdTUzRDYgdml0ZSBcdTkxNERcdTdGNkVcdUZGMUYgXHU2NUI5XHU0RkJGXHU0RjdGXHU3NTI4IEAgXHU1MjJCXHU1NDBEXHU4REVGXHU1Rjg0XG4gICAgdmFyIGNvZGVGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShtZEZpbGVQYXRoLCBzb3VyY2VDb2RlUGF0aCk7IC8vIFx1NUYxNVx1NTE2NVx1NzY4NCBjb2RlIFx1NTM5Rlx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFxuICAgIHZhciBmaWxlRXhpc3RzID0gZnMuZXhpc3RzU3luYyhjb2RlRmlsZVBhdGgpO1xuICAgIGlmICghZmlsZUV4aXN0cykge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlwiLmNvbmNhdChzb3VyY2VDb2RlUGF0aCwgXCIgIFx1NjcyQVx1NjI3RVx1NTIzMFx1NTM5Rlx1NjU4N1x1NEVGNiFcIikpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBzb3VyY2VGaWxlU3RyID0gZnMucmVhZEZpbGVTeW5jKGNvZGVGaWxlUGF0aCwgXCJ1dGYtOFwiKTtcbiAgICB2YXIgZGVtb0ltcG9ydENvZGUgPSAoX2ZpbHRlckpTWENvbW1lbnRzID0gZmlsdGVySlNYQ29tbWVudHMoc291cmNlRmlsZVN0cikpID09PSBudWxsIHx8IF9maWx0ZXJKU1hDb21tZW50cyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2ZpbHRlckpTWENvbW1lbnRzLm1hdGNoKGltcG9ydFJlZ2V4KTtcbiAgICB2YXIgX2RlbW9JbXBvcnRDb2RlID0gZGVtb0ltcG9ydENvZGUgPT09IG51bGwgfHwgZGVtb0ltcG9ydENvZGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGRlbW9JbXBvcnRDb2RlLmpvaW4ob3MuRU9MKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBzb3VyY2VGaWxlU3RyOiBzb3VyY2VGaWxlU3RyLnJlcGxhY2VBbGwoJ1wiJywgXCInXCIpLFxuICAgICAgICBkZW1vSW1wb3J0Q29kZUFycjogZGVtb0ltcG9ydENvZGUsXG4gICAgICAgIGRlbW9JbXBvcnRDb2RlU3RyOiBfZGVtb0ltcG9ydENvZGVcbiAgICB9O1xufTtcbnZhciBnZXRJbXBvcnRNb2R1bGVzID0gZnVuY3Rpb24oYXN0KSB7XG4gICAgdmFyIGltcG9ydE1vZHVsZXMgPSBuZXcgU2V0KCk7XG4gICAgLy8gRklYTUVcdUZGMUEgXHU3QjQ5IEB0eXBlcy9iYWJlbF9fdHJhdmVyc2UgXHU2NkY0XHU2NUIwIEA3LjIyLjUgXHU1NDBFXHU0RkVFXHU1OTBEXG4gICAgdHJhdmVyc2UuZGVmYXVsdChhc3QsIHtcbiAgICAgICAgSWRlbnRpZmllcjogZnVuY3Rpb24gSWRlbnRpZmllcihwYXRoKSB7XG4gICAgICAgICAgICBpZiAocGF0aC5wYXJlbnQudHlwZSA9PT0gXCJJbXBvcnREZWZhdWx0U3BlY2lmaWVyXCIgfHwgcGF0aC5wYXJlbnQudHlwZSA9PT0gXCJJbXBvcnRTcGVjaWZpZXJcIiB8fCBwYXRoLnBhcmVudC50eXBlID09PSBcIkltcG9ydE5hbWVzcGFjZVNwZWNpZmllclwiKSB7XG4gICAgICAgICAgICAgICAgaW1wb3J0TW9kdWxlcy5hZGQocGF0aC5ub2RlLm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oaW1wb3J0TW9kdWxlcy5rZXlzKCkpO1xufTtcbi8vIFRJUDogXHU0RjdGXHU3NTI4IGVzbGludCBcdThGREJcdTg4NEMgaW1wb3J0IFx1NTNCQlx1OTFDRFx1NTkwRFx1NjZGNFx1NTk3RFx1RkYwQ1x1NEY0Nlx1NjYyRm1hcmtkb3duLWl0IFx1NEUwRFx1NjUyRlx1NjMwMVx1NUYwMlx1NkI2NVx1NjVCOVx1NkNENVxuLy8gY29uc3QgbGludENvZGUgPSAoY29kZTogc3RyaW5nKSA9PiB7XG4vLyAgIGNvbnN0IGVzbGludCA9IG5ldyBFU0xpbnQoe1xuLy8gICAgIGZpeDogdHJ1ZSxcbi8vICAgICBmaXhUeXBlczogWydwcm9ibGVtJywgJ3N1Z2dlc3Rpb24nLCAnbGF5b3V0J10sXG4vLyAgICAgcGx1Z2luczogeyB1bmljb3JuIH0sXG4vLyAgICAgdXNlRXNsaW50cmM6IGZhbHNlLFxuLy8gICAgIG92ZXJyaWRlQ29uZmlnOiB7XG4vLyAgICAgICBleHRlbmRzOiBbJ3N0YW5kYXJkJywgJ2VzbGludDpyZWNvbW1lbmRlZCcsICdwcmV0dGllciddLFxuLy8gICAgICAgcGFyc2VyOiAnQHR5cGVzY3JpcHQtZXNsaW50L3BhcnNlcicsXG4vLyAgICAgICBwYXJzZXJPcHRpb25zOiB7XG4vLyAgICAgICAgIHNvdXJjZVR5cGU6ICdtb2R1bGUnLFxuLy8gICAgICAgICBlY21hVmVyc2lvbjogJ2xhdGVzdCdcbi8vICAgICAgIH0sXG4vLyAgICAgICBydWxlczoge1xuLy8gICAgICAgICAnbm8tZHVwbGljYXRlLWltcG9ydHMnOiAnd2FybicsXG4vLyAgICAgICAgICduby11bnVzZWQtdmFycyc6ICdvZmYnXG4vLyAgICAgICB9LFxuLy8gICAgICAgZW52OiB7XG4vLyAgICAgICAgIGVzMjAyMjogdHJ1ZSxcbi8vICAgICAgICAgbm9kZTogdHJ1ZVxuLy8gICAgICAgfVxuLy8gICAgIH1cbi8vICAgfSk7XG4vLyAgIHJldHVybiBlc2xpbnQubGludFRleHQoY29kZSkudGhlbigoW3Jlc10pID0+IHtcbi8vICAgICByZXR1cm4gcmVzLm91dHB1dCB8fCAnJztcbi8vICAgfSk7XG4vLyB9O1xudmFyIGJ1aWxkSW1wb3J0U3RhdGVtZW50ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKG9iaikubWFwKGZ1bmN0aW9uKHBhcmFtKSB7XG4gICAgICAgIHZhciBfcGFyYW0gPSBfc2xpY2VkX3RvX2FycmF5KHBhcmFtLCAyKSwgayA9IF9wYXJhbVswXSwgdiA9IF9wYXJhbVsxXTtcbiAgICAgICAgcmV0dXJuIFwiaW1wb3J0IFwiLmNvbmNhdChrLCBcIiBmcm9tICdcIikuY29uY2F0KHYsIFwiJztcIik7XG4gICAgfSk7XG59O1xuZXhwb3J0IGZ1bmN0aW9uIGRlbW9CbG9ja1BsdWdpbihtZCkge1xuICAgIHZhciBhZGRSZW5kZXJSdWxlID0gZnVuY3Rpb24odHlwZSkge1xuICAgICAgICB2YXIgZGVmYXVsdFJlbmRlciA9IG1kLnJlbmRlcmVyLnJ1bGVzW3R5cGVdO1xuICAgICAgICBtZC5yZW5kZXJlci5ydWxlc1t0eXBlXSA9IGZ1bmN0aW9uKHRva2VucywgaWR4LCBvcHRpb25zLCBlbnYsIHNlbGYpIHtcbiAgICAgICAgICAgIHZhciB0b2tlbiA9IHRva2Vuc1tpZHhdO1xuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSB0b2tlbi5jb250ZW50LnRyaW0oKTtcbiAgICAgICAgICAgIGlmICghY29udGVudC5tYXRjaChuZXcgUmVnRXhwKFwiXjxcIi5jb25jYXQoRGVtb1RhZywgXCJcXFxcc1wiKSkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRSZW5kZXIodG9rZW5zLCBpZHgsIG9wdGlvbnMsIGVudiwgc2VsZik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcHJvcHMgPSBwYXJzZVByb3BzKGNvbnRlbnQpO1xuICAgICAgICAgICAgaWYgKCFwcm9wcy5zb3VyY2VDb2RlUGF0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0UmVuZGVyKHRva2VucywgaWR4LCBvcHRpb25zLCBlbnYsIHNlbGYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG1kRmlsZVBhdGggPSBwYXRoLmRpcm5hbWUoZW52LnBhdGgpOyAvLyBtZCBcdTUzOUZcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcbiAgICAgICAgICAgIHZhciBzdGF0ZW1lbnQgPSBnZXRGaWxlU3RhdGVtZW50KG1kRmlsZVBhdGgsIHByb3BzLnNvdXJjZUNvZGVQYXRoKTtcbiAgICAgICAgICAgIGlmICghc3RhdGVtZW50KSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogXHU2NTM5XHU0RTNBXHU5NTE5XHU4QkVGXHU2M0QwXHU3OTNBXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRSZW5kZXIodG9rZW5zLCBpZHgsIG9wdGlvbnMsIGVudiwgc2VsZik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc291cmNlRmlsZVN0ciA9IHN0YXRlbWVudC5zb3VyY2VGaWxlU3RyLCBkZW1vSW1wb3J0Q29kZUFyciA9IHN0YXRlbWVudC5kZW1vSW1wb3J0Q29kZUFyciwgZGVtb0ltcG9ydENvZGVTdHIgPSBzdGF0ZW1lbnQuZGVtb0ltcG9ydENvZGVTdHI7XG4gICAgICAgICAgICBpZiAoZGVtb0ltcG9ydENvZGVTdHIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVudi5zZmNCbG9ja3Muc2NyaXB0cykge1xuICAgICAgICAgICAgICAgICAgICBlbnYuc2ZjQmxvY2tzLnNjcmlwdHMgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHRhZ3MgPSBlbnYuc2ZjQmxvY2tzLnNjcmlwdHM7XG4gICAgICAgICAgICAgICAgdmFyIGV4aXN0aW5nU2V0dXBTY3JpcHRJbmRleCA9IHRhZ3MgPT09IG51bGwgfHwgdGFncyA9PT0gdm9pZCAwID8gdm9pZCAwIDogdGFncy5maW5kSW5kZXgoZnVuY3Rpb24odGFnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzY3JpcHRSRS50ZXN0KHRhZy5jb250ZW50KSAmJiBzY3JpcHRTZXR1cFJFLnRlc3QodGFnLmNvbnRlbnQpICYmICFzY3JpcHRDbGllbnRSRS50ZXN0KHRhZy5jb250ZW50KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB2YXIgX2NvZGUgPSBkZW1vSW1wb3J0Q29kZVN0cjtcbiAgICAgICAgICAgICAgICBpZiAoZXhpc3RpbmdTZXR1cFNjcmlwdEluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhZ1NyYyA9IHRhZ3NbZXhpc3RpbmdTZXR1cFNjcmlwdEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF90YWdTcmNfY29udGVudF9tYXRjaCA9IF9zbGljZWRfdG9fYXJyYXkodGFnU3JjLmNvbnRlbnQubWF0Y2goc2NyaXB0UmVnZXgpLCAyKSwgYyA9IF90YWdTcmNfY29udGVudF9tYXRjaFsxXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudFJlZ2lzU3RhdGVtZW50ID0gZGVtb0ltcG9ydENvZGVBcnIuam9pbihvcy5FT0wpLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgX2NvZGUgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICBjLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50UmVnaXNTdGF0ZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgXS5qb2luKG9zLkVPTCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBfaW1wb3J0U3RhdGVtZW50T2JqID0gaW1wb3J0U3RhdGVtZW50T2JqKF9jb2RlKSwgc3RhdGVtZW50T2JqID0gX2ltcG9ydFN0YXRlbWVudE9iai5pbXBvcnRSZWNvcmQsIGRpcmVjdEltcG9ydFJlY29yZCA9IF9pbXBvcnRTdGF0ZW1lbnRPYmouZGlyZWN0SW1wb3J0UmVjb3JkO1xuICAgICAgICAgICAgICAgIHZhciBpbXBvcnRTdGF0ZW1lbnRDb2RlID0gYnVpbGRJbXBvcnRTdGF0ZW1lbnQoc3RhdGVtZW50T2JqKS5qb2luKG9zLkVPTCkudHJpbSgpO1xuICAgICAgICAgICAgICAgIHZhciBmaW5hbENvZGUgPSBbXG4gICAgICAgICAgICAgICAgICAgIGltcG9ydFN0YXRlbWVudENvZGVcbiAgICAgICAgICAgICAgICBdLmNvbmNhdChfdG9fY29uc3VtYWJsZV9hcnJheShkaXJlY3RJbXBvcnRSZWNvcmQpKS5qb2luKG9zLkVPTCkudHJpbSgpO1xuICAgICAgICAgICAgICAgIHZhciBhc3QgPSBwYXJzZShmaW5hbENvZGUsIHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlVHlwZTogXCJtb2R1bGVcIixcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlc2NyaXB0XCJcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIFx1NTIwNlx1NzlCQiBpbXBvcnQgXHU4QkVEXHU1M0U1XHU3Njg0IG1vZHVsZVx1MzAwMiBcdTgzQjdcdTUzRDZcdTk3MDBcdTg5ODFcdTVGMTVcdTUxNjVcdTc2ODQgc2NvcGUgXHU0RjIwXHU3RUQ5IExpdmVFZGl0b3JcbiAgICAgICAgICAgICAgICB2YXIgX21vZHVsZXMgPSBnZXRJbXBvcnRNb2R1bGVzKGFzdCk7XG4gICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nU2V0dXBTY3JpcHRJbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhZ3NbZXhpc3RpbmdTZXR1cFNjcmlwdEluZGV4XS5jb250ZW50ID0gJzxzY3JpcHQgbGFuZz1cInRzXCIgc2V0dXAgPicuY29uY2F0KGZpbmFsQ29kZSwgXCI8L3NjcmlwdD5cIikudHJpbSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhZ3MudW5zaGlmdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiAnPHNjcmlwdCBsYW5nPVwidHNcIiBzZXR1cCA+Jy5jb25jYXQoZmluYWxDb2RlLCBcIjwvc2NyaXB0PlwiKS50cmltKClcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBsaXZlRWRpdG9yVGVtcGxhdGUoe1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzb3VyY2VGaWxlU3RyLFxuICAgICAgICAgICAgICAgICAgICBoaWRlQ29kZTogcHJvcHMuaGlkZUNvZGUsXG4gICAgICAgICAgICAgICAgICAgIG5vU3R5bGU6IHByb3BzLm5vU3R5bGUsXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlOiBfbW9kdWxlcy50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbGl2ZUVkaXRvclRlbXBsYXRlKHtcbiAgICAgICAgICAgICAgICBzb3VyY2VDb2RlOiBzb3VyY2VGaWxlU3RyLFxuICAgICAgICAgICAgICAgIGhpZGVDb2RlOiBwcm9wcy5oaWRlQ29kZSxcbiAgICAgICAgICAgICAgICBub1N0eWxlOiBwcm9wcy5ub1N0eWxlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIC8vIGFkZFJlbmRlclJ1bGUoJ2h0bWxfYmxvY2snKTtcbiAgICBhZGRSZW5kZXJSdWxlKFwiaHRtbF9pbmxpbmVcIik7XG59XG52YXIgbGl2ZUVkaXRvclRlbXBsYXRlID0gZnVuY3Rpb24ocGFyYW0pIHtcbiAgICB2YXIgc291cmNlQ29kZSA9IHBhcmFtLnNvdXJjZUNvZGUsIGhpZGVDb2RlID0gcGFyYW0uaGlkZUNvZGUsIG5vU3R5bGUgPSBwYXJhbS5ub1N0eWxlLCBzY29wZSA9IHBhcmFtLnNjb3BlO1xuICAgIHJldHVybiAnPExpdmVFZGl0b3IgOnNjb3BlPVwieyAnLmNvbmNhdChzY29wZSwgJyB9XCIgc291cmNlQ29kZT1cIicpLmNvbmNhdChzb3VyY2VDb2RlLCAnXCIgOmhpZGVDb2RlPVwiJykuY29uY2F0KGhpZGVDb2RlLCAnXCIgOm5vU3R5bGU9XCInKS5jb25jYXQobm9TdHlsZSwgJ1wiID48L0xpdmVFZGl0b3I+Jyk7XG59O1xuZXhwb3J0IHZhciBwYXJzZVByb3BzID0gZnVuY3Rpb24oY29udGVudCkge1xuICAgIHZhciBhc3QgPSBiYXNlUGFyc2UoY29udGVudCk7XG4gICAgdmFyIHByb3BzTWFwID0ge307XG4gICAgdHJhbnNmb3JtKGFzdCwge1xuICAgICAgICBub2RlVHJhbnNmb3JtczogW1xuICAgICAgICAgICAgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLnR5cGUgPT09IDEgJiYgbm9kZS50YWcgPT09IFwiTGl2ZUVkaXRvclwiKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFx1NTE0M1x1N0QyMFx1ODI4Mlx1NzBCOVx1NEUxNFx1NjgwN1x1N0I3RVx1NEUzQSBMaXZlRWRpdG9yXG4gICAgICAgICAgICAgICAgICAgIC8vIFx1NjNEMFx1NTNENlx1NTNDMlx1NjU3MFxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5wcm9wcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUucHJvcHMuZm9yRWFjaChmdW5jdGlvbihwcm9wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3AudHlwZSA9PT0gNikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgX3Byb3BfdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFx1NUM1RVx1NjAyN1x1ODI4Mlx1NzBCOVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wc01hcFtwcm9wLm5hbWVdID0gKF9wcm9wX3ZhbHVlID0gcHJvcC52YWx1ZSkgPT09IG51bGwgfHwgX3Byb3BfdmFsdWUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9wcm9wX3ZhbHVlLmNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wLnR5cGUgPT09IDcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF9wcm9wX2FyZywgX3Byb3BfZXhwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcE5hbWUgPSAoX3Byb3BfYXJnID0gcHJvcC5hcmcpID09PSBudWxsIHx8IF9wcm9wX2FyZyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX3Byb3BfYXJnLmxvYy5zb3VyY2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcm9wVmFsID0gKF9wcm9wX2V4cCA9IHByb3AuZXhwKSA9PT0gbnVsbCB8fCBfcHJvcF9leHAgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9wcm9wX2V4cC5sb2Muc291cmNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdiA9IEpTT04ucGFyc2UocHJvcFZhbCB8fCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHYgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wTmFtZSAmJiAocHJvcHNNYXBbcHJvcE5hbWVdID0gdik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9KTtcbiAgICByZXR1cm4gcHJvcHNNYXA7XG59O1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvdGFuZ2JvaGFvL1ByaXZhdGVQcm9qZWN0L3ZpdGVwcmVzcy10aGVtZS1jb21wb25lbnRzL2xpYi9jb25zdGFudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3Rhbmdib2hhby9Qcml2YXRlUHJvamVjdC92aXRlcHJlc3MtdGhlbWUtY29tcG9uZW50cy9saWIvY29uc3RhbnQvaW5kZXguanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3Rhbmdib2hhby9Qcml2YXRlUHJvamVjdC92aXRlcHJlc3MtdGhlbWUtY29tcG9uZW50cy9saWIvY29uc3RhbnQvaW5kZXguanNcIjsvKipcbiAqIFJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgbWF0Y2hpbmcgaW1wb3J0IHN0YXRlbWVudHMgaW4gYSBzdHJpbmcgb2YgY29kZS5cbiAqLyAvLyBleHBvcnQgY29uc3QgaW1wb3J0UmVnZXggPSAvaW1wb3J0W1xcc1xcU10qP1xcbiokL2dcbmV4cG9ydCB2YXIgaW1wb3J0UmVnZXggPSAvaW1wb3J0XFxzK1tcXHcqe31cXHMsXStcXHMrZnJvbVxccytbJ1wiXShbXidcIl0rKVsnXCJdfGltcG9ydFxccytbJ1wiXShbXidcIl0rKVsnXCJdL2c7XG4vKipcbiAqIFJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgbWF0Y2hpbmcgdGhlIGNsb3Npbmcgc2NyaXB0IHRhZyBcIjwvc2NyaXB0PlwiLlxuICovIGV4cG9ydCB2YXIgc2NyaXB0UkUgPSAvPFxcL3NjcmlwdD4vO1xuLyoqXG4gKiBSZWd1bGFyIGV4cHJlc3Npb24gZm9yIGRldGVjdGluZyBUeXBlU2NyaXB0IHNjcmlwdCB0YWdzIGluIEhUTUwuXG4gKiBNYXRjaGVzIHNjcmlwdCB0YWdzIHdpdGggYSBcImxhbmdcIiBhdHRyaWJ1dGUgc2V0IHRvIFwidHNcIi5cbiAqLyBleHBvcnQgdmFyIHNjcmlwdExhbmdUc1JFID0gLzxcXHMqc2NyaXB0W14+XSpcXGJsYW5nPVsnXCJddHNbJ1wiXVtePl0qLztcbi8qKlxuICogUmVndWxhciBleHByZXNzaW9uIGZvciBkZXRlY3RpbmcgdGhlIHByZXNlbmNlIG9mIGEgYHNldHVwYCBhdHRyaWJ1dGUgaW4gYSBgc2NyaXB0YCB0YWcuXG4gKi8gZXhwb3J0IHZhciBzY3JpcHRTZXR1cFJFID0gLzxcXHMqc2NyaXB0W14+XSpcXGJzZXR1cFxcYltePl0qLztcbi8qKlxuICogUmVndWxhciBleHByZXNzaW9uIGZvciBtYXRjaGluZyBhIHNjcmlwdCB0YWcgd2l0aCB0aGUgXCJjbGllbnRcIiBhdHRyaWJ1dGUuXG4gKi8gZXhwb3J0IHZhciBzY3JpcHRDbGllbnRSRSA9IC88XFxzKnNjcmlwdFtePl0qXFxiY2xpZW50XFxiW14+XSovO1xuLyoqXG4gKiBSZWd1bGFyIGV4cHJlc3Npb24gZm9yIG1hdGNoaW5nIHNjcmlwdCB0YWdzIGluIEhUTUwuXG4gKiBNYXRjaGVzIHRoZSBvcGVuaW5nIGFuZCBjbG9zaW5nIHNjcmlwdCB0YWdzLCBhcyB3ZWxsIGFzIGFueSBjb250ZW50IGluIGJldHdlZW4uXG4gKi8gZXhwb3J0IHZhciBzY3JpcHRSZWdleCA9IC88c2NyaXB0W14+XSo+KFtcXHNcXFNdKj8pPFxcL3NjcmlwdD4vO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvdGFuZ2JvaGFvL1ByaXZhdGVQcm9qZWN0L3ZpdGVwcmVzcy10aGVtZS1jb21wb25lbnRzL2xpYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3Rhbmdib2hhby9Qcml2YXRlUHJvamVjdC92aXRlcHJlc3MtdGhlbWUtY29tcG9uZW50cy9saWIvYmFzZS1jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3Rhbmdib2hhby9Qcml2YXRlUHJvamVjdC92aXRlcHJlc3MtdGhlbWUtY29tcG9uZW50cy9saWIvYmFzZS1jb25maWcuanNcIjtpbXBvcnQgeyBkZW1vQmxvY2tQbHVnaW4gfSBmcm9tIFwiLi9wbHVnaW5zL2luZGV4LmpzXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZXByZXNzXCI7XG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tIFwidW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZVwiO1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSBcInVucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGVcIjtcbmltcG9ydCBJY29uc1Jlc29sdmVyIGZyb20gXCJ1bnBsdWdpbi1pY29ucy9yZXNvbHZlclwiO1xuaW1wb3J0IHsgRWxlbWVudFBsdXNSZXNvbHZlciB9IGZyb20gXCJ1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnNcIjtcbmltcG9ydCBJY29ucyBmcm9tIFwidW5wbHVnaW4taWNvbnMvdml0ZVwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbnZhciBiYXNlQ29uZmlnID0gZGVmaW5lQ29uZmlnKHtcbiAgICBtYXJrZG93bjoge1xuICAgICAgICBjb25maWc6IGZ1bmN0aW9uIGNvbmZpZyhtZCkge1xuICAgICAgICAgICAgbWQudXNlKGRlbW9CbG9ja1BsdWdpbik7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHZpdGU6IHtcbiAgICAgICAgcGx1Z2luczogW1xuICAgICAgICAgICAgQXV0b0ltcG9ydCh7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZXJzOiBbXG4gICAgICAgICAgICAgICAgICAgIEVsZW1lbnRQbHVzUmVzb2x2ZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgSWNvbnNSZXNvbHZlcigpXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBkdHM6IHBhdGgucmVzb2x2ZShcIi4uL2F1dG8taW1wb3J0cy5kLnRzXCIpXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIENvbXBvbmVudHMoe1xuICAgICAgICAgICAgICAgIHJlc29sdmVyczogW1xuICAgICAgICAgICAgICAgICAgICBFbGVtZW50UGx1c1Jlc29sdmVyKCksXG4gICAgICAgICAgICAgICAgICAgIEljb25zUmVzb2x2ZXIoKVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgZHRzOiBwYXRoLnJlc29sdmUoXCIuLi9jb21wb25lbnRzLmQudHNcIilcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgSWNvbnMoe1xuICAgICAgICAgICAgICAgIGF1dG9JbnN0YWxsOiB0cnVlXG4gICAgICAgICAgICB9KVxuICAgICAgICBdXG4gICAgfVxufSk7XG5leHBvcnQgeyBiYXNlQ29uZmlnIH07XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNZLFNBQVMsNkJBQTZCOzs7QUMwRDVhLFNBQVMsYUFBYTtBQUN0QixPQUFPLGNBQWM7QUFDckIsU0FBUyxXQUFXLGlCQUFpQjtBQUNyQyxZQUFZLFFBQVE7QUFDcEIsWUFBWSxRQUFRO0FBQ3BCLFlBQVksVUFBVTs7O0FDNURmLElBQUksY0FBYztBQUdkLElBQUksV0FBVztBQU9mLElBQUksZ0JBQWdCO0FBR3BCLElBQUksaUJBQWlCO0FBSXJCLElBQUksY0FBYzs7O0FEcEIyVixTQUFTLHFCQUFxQixLQUFLLEtBQUs7QUFDNVosTUFBSSxPQUFPLFFBQVEsTUFBTSxJQUFJO0FBQVEsVUFBTSxJQUFJO0FBQy9DLFdBQVEsSUFBSSxHQUFHLE9BQU8sSUFBSSxNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUs7QUFBSSxTQUFLLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDbEUsU0FBTztBQUNYO0FBQ0EsU0FBUyxrQkFBa0IsS0FBSztBQUM1QixNQUFJLE1BQU0sUUFBUSxHQUFHO0FBQUcsV0FBTztBQUNuQztBQUNBLFNBQVMscUJBQXFCLEtBQUs7QUFDL0IsTUFBSSxNQUFNLFFBQVEsR0FBRztBQUFHLFdBQU8scUJBQXFCLEdBQUc7QUFDM0Q7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SUFDTixRQUFRLFNBQVMsT0FBTyxJQUFJO0FBQ3hCLFNBQUcsSUFBSSxlQUFlO0FBQUEsSUFDMUI7QUFBQSxFQUNKO0FBQUEsRUFDQSxNQUFNO0FBQUEsSUFDRixTQUFTO0FBQUEsTUFDTCxXQUFXO0FBQUEsUUFDUCxXQUFXO0FBQUEsVUFDUCxvQkFBb0I7QUFBQSxVQUNwQixjQUFjO0FBQUEsUUFDbEI7QUFBQSxRQUNBLEtBQUtDLE1BQUssUUFBUSxzQkFBc0I7QUFBQSxNQUM1QyxDQUFDO0FBQUEsTUFDRCxXQUFXO0FBQUEsUUFDUCxXQUFXO0FBQUEsVUFDUCxvQkFBb0I7QUFBQSxVQUNwQixjQUFjO0FBQUEsUUFDbEI7QUFBQSxRQUNBLEtBQUtBLE1BQUssUUFBUSxvQkFBb0I7QUFBQSxNQUMxQyxDQUFDO0FBQUEsTUFDRCxNQUFNO0FBQUEsUUFDRixhQUFhO0FBQUEsTUFDakIsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKO0FBQ0osQ0FBQzs7O0FIaENELE9BQU9DLFdBQVU7QUFIakIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTSxPQUFPQyxNQUFLLFFBQVEsa0NBQVcsWUFBWTtBQUdqRCxJQUFPLGlCQUFRLHNCQUFzQztBQUFBLEVBQ25ELE9BQU87QUFBQSxFQUNQLGFBQWE7QUFBQSxFQUNiLFNBQVM7QUFBQSxFQUNULE1BQU07QUFBQSxFQUNOLGFBQWE7QUFBQSxJQUNYLFdBQVc7QUFBQSxNQUNULE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQSxVQUFVO0FBQUEsTUFDUixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0EsS0FBSztBQUFBLE1BQ0gsRUFBRSxNQUFNLFNBQVMsTUFBTSxVQUFVO0FBQUEsTUFDakMsRUFBRSxNQUFNLFFBQVEsTUFBTSxTQUFTO0FBQUEsSUFDakM7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLFdBQVc7QUFBQSxRQUNULE1BQU07QUFBQSxRQUNOLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixPQUFPLENBQUMsRUFBRSxNQUFNLFNBQVMsTUFBTSxJQUFJLENBQUM7QUFBQSxVQUN0QztBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQSxVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixPQUFPO0FBQUEsVUFDTDtBQUFBLFlBQ0UsTUFBTTtBQUFBLFlBQ04sT0FBTztBQUFBLGNBQ0wsRUFBRSxNQUFNLFVBQVUsTUFBTSxVQUFVO0FBQUEsY0FDbEMsRUFBRSxNQUFNLFFBQVEsTUFBTSxRQUFRO0FBQUEsWUFDaEM7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0osS0FBSztBQUFBLE1BQ0gsWUFBWSxDQUFDLGdCQUFnQixRQUFRO0FBQUEsSUFDdkM7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsicGF0aCIsICJwYXRoIiwgInBhdGgiLCAicGF0aCIsICJwYXRoIl0KfQo=
