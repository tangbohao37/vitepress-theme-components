---
hideRecord: true
---

<!-- # 配置项 -->

基于 vitepress,可以兼容使用所有 [vitepress](https://vitepress.dev/reference/site-config) 的配置项

:point_down::point_down: 以下是本站点新增的配置项

## changelog

配置 changelog 路径

```js
themeConfig: {
  // 获取public中的文件。 直接使用站点绝对路径
  changelog: {
    path: '/CHANGELOG-test.md';
  }
}
```

### changelog.path

- Type: `string`
- Default: `null`

changelog.md 一般是放在public中,使用 `/xxx`使用绝对路径配置 [public处理逻辑](https://vitepress.dev/guide/asset-handling#the-public-directory)

vitepress 会把目录下的`.md` 都编译成.vue 文件。为了防止changelog.md被编译，因此一般是放在 `public` 让其作为静态资源文件存在

### changelog.parse

TODO: 待补充

## coverage

配置 coverage 路径

```js
themeConfig: {
  // 获取public中的文件。 直接使用站点绝对路径
  coverage: {
    path: '/coverage-summary.json'
  },
}
```

### coverage.path

- Type: `string`
- Default: `null`

覆盖率文件放置在 public 中，`/xxx.json` 使用绝对路径配置

### coverage.parse

TODO: 待补充
