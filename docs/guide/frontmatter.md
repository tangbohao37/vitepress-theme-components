---
hideRecord: true
---

# Markdown frontmatter 扩展

| 属性          | 说明                       | 类型    | 默认值 |
| ------------- | -------------------------- | ------- | ------ |
| coverage      | 是否显示组件 Coverage      | boolean | false  |
| hideRecord    | 是否隐藏当前组件的迭代记录 | boolean | false  |
| componentName | 组件名                     | string  | null   |

:::info 注意
`coverage`/`hideRecord` 需要配合 `componentName` 使用
:::

## 单测覆盖率

Coverage 自动根据组件名称获取，若没有单测则渲染 0%。 (需要配置 [coverage](/guide/config#coverage)路径)

```md
---
coverage: true
componentName: xxxx
---
```

## 迭代记录

根据组件名称迭代记录获取 (需要配置 [changelog](/guide/config#changelog)路径)

```md
---
hideRecord: true
componentName: xxxx
---
```

![coverage-record](/assets/images/coverage-record.png)
