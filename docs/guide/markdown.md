---
hideRecord: true
---

# Markdown 扩展

- `<LiveEditor></LiveEditor>` : 实时渲染组件Demo
- `<ApiTable></ApiTable>` : 根据Ts类型生成对应文档
- 支持 task list

## Demo 渲染

在 markdown文件中，使用 **vue** 语法([为什么用vue语法](https://vitepress.dev/guide/using-vue))引入扩展组件`LiveEditor`，并传入`sourceCodePath`(**使用相对路径**)属性，即可渲染出演示代码。

```md
<!-- 引入演示源码使用相对路径 -->

<LiveEditor sourceCodePath="../demo/example/index.jsx"></LiveEditor>
```

#### LiveEditor 属性:

| 属性           | 说明                              | 类型    | 默认值 |
| -------------- | --------------------------------- | ------- | ------ |
| noStyle        | 是否显示边框样式(目前仅有padding) | boolean | false  |
| hideCode       | 是否显示源码                      | boolean | false  |
| sourceCodePath | 代码路径(相对路径)                | string  | null   |

<<< ../demo/example/index.jsx

> 渲染如下: :point_down: :point_down: 可以试试编辑，会实时编译渲染
> <LiveEditor sourceCodePath="../demo/example/index.jsx"></LiveEditor>

## API 生成

在 markdown 文件中 使用 `ApiTable` 组件，并传入`path`属性，即可自动渲染出API文档

::: danger 暂定的方案
目前ts文档生成使用的`react-docgen-typescript`，对于多层级引用无法正确渲染,后续可能会更改方案
:::

```md
<!-- 引入演示源码使用相对路径 -->

<ApiTable path="../demo/example/index.jsx"></ApiTable>
```

<<< ../demo/example/index.jsx

> 渲染如下： :point_down: :point_down:
> <ApiTable path="../demo/example/index.jsx"></ApiTable>

## Task list 使用

使用 `- [ ] something`or `- [x] something`

> 渲染如下： :point_down: :point_down:
>
> - [ ] something
> - [x] something
