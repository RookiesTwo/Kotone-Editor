# Editor UI Bilingual Design

## 概述

为当前项目的 `#/editor` 编辑器界面增加中英双语支持。此次变更只覆盖编辑器自身的 UI 文案，不改变展示页内容模型，不改变 `SiteConfig` 数据结构，也不改变导出 JSON 的格式。

目标是让用户可以通过一个手动切换控件，在中文和英文之间切换编辑器界面语言，同时保持编辑器的现有数据流、预览逻辑和持久化逻辑不受影响。

## 目标

- 为 `#/editor` 提供手动的中英语言切换能力
- 切换后立即更新编辑器 UI 文案
- 刷新页面后保持上次选择的编辑器语言
- 不影响右侧 showcase 预览的内容数据
- 不改动导出/导入 JSON 的 schema
- 为后续扩展全站 i18n 保留清晰的抽象边界，但本次不提前实现全站国际化

## 非目标

- 不给 `#/` 展示页增加双语切换
- 不为 `siteTitle`、`description`、`quote` 等内容字段引入中英双字段
- 不修改 `SiteConfig`、`SectionConfig`、`GlobalConfig` 类型定义
- 不引入重量级 i18n 库（如 i18next、react-intl）
- 不做自动浏览器语言检测

## 范围

本次只处理编辑器 UI 自身的固定文案，包括：

- 编辑器标题与说明文案
- 面板标题（如 Global、Sections、Selected section、Data）
- 表单字段标签
- 按钮文本
- 空标题 fallback 文案（如 `Untitled section`）
- 导入失败 alert 文案
- 语言切换控件自身的文案

不处理的文案：

- 右侧 preview 中由 `SiteConfig` 驱动的真实内容
- showcase 页导航中的站点标题与链接文本
- 默认示例数据里的英文内容

## 用户体验

### 入口位置

语言切换控件放在编辑器左栏顶部、`Editor` 标题附近。它应当是一个轻量的、明显可见的切换器，例如两个按钮或 segmented control：

- `中文`
- `EN`

### 切换行为

- 点击后立即切换编辑器 UI 文案
- 不刷新页面
- 不重置当前编辑状态
- 不改动右侧 preview 的内容数据
- 不影响当前选中的 section

### 默认语言

- 默认值：`zh-CN`

### 持久化行为

- 用户切换语言后，将编辑器语言单独保存到 `localStorage`
- 刷新后恢复最近一次选择
- 若读取失败或值非法，回退到 `zh-CN`

## 技术设计

### 方案选择

采用一个**editor 专用的轻量 locale 层**，而不是把双语逻辑直接塞进 `EditorPage.tsx`，也不把它并入 `SiteConfigContext`。

推荐结构：

- `src/i18n/editor-locale.ts`
  - 定义 `EditorLocale = "zh-CN" | "en"`
  - 定义 editor 专用文案字典
  - 提供默认 locale 与运行时安全校验
- `src/context/EditorLocaleContext.tsx`
  - 提供当前 locale
  - 提供 `setLocale()`
  - 负责 `localStorage` 读写
- `useEditorLocale()`
  - 供 `EditorPage` 获取当前 locale、切换函数和字典文案

这样可以确保：

- 编辑器 UI 国际化和内容编辑逻辑分离
- 不污染 `SiteConfigContext`
- 后续若要扩展至全站，有可复用的 locale 类型与字典组织方式

### 状态边界

编辑器语言属于**工具 UI 状态**，不是站点内容状态。

因此：

- 它不应存入 `SiteConfig`
- 它不应出现在导出 JSON 中
- 它不应影响 preview 读取的数据

建议单独使用一个 key，例如：

- `editable-showcase.editor-locale`

## 文案组织

文案字典应按 editor 结构分组，避免把所有字符串平铺在一个大对象里。推荐分组：

- `header`
- `global`
- `sections`
- `selectedSection`
- `data`
- `buttons`
- `alerts`
- `fallbacks`

示例（结构示意，不是最终逐字内容）：

```ts
const editorMessages = {
  "zh-CN": {
    header: {
      title: "编辑器",
      description: "调整展示页并实时查看预览。",
    },
    global: {
      title: "全局",
      siteTitle: "站点标题",
      subtitle: "副标题",
      accent: "强调色",
      accentSoft: "柔和强调色",
    },
    // ...
  },
  en: {
    header: {
      title: "Editor",
      description: "Adjust the showcase and watch the preview update in real time.",
    },
    global: {
      title: "Global",
      siteTitle: "Site title",
      subtitle: "Subtitle",
      accent: "Accent",
      accentSoft: "Accent soft",
    },
    // ...
  },
} as const;
```

## 组件改动范围

### `EditorPage.tsx`

`EditorPage` 将从“直接写死英文文案”改为“从 locale context 读取文案”。

需要改的点：

- 顶部标题与说明
- Global 面板与字段名
- Sections 面板标题与 Add section / Up / Down / Delete
- Selected section 面板与字段名
- Data 面板与 Export / Import / Reset
- `Untitled section`
- `window.alert(...)`

不需要改的点：

- `sectionTypes` 枚举值本身（仍使用内部类型值）
- section 数据的内容字段
- preview 的渲染逻辑

### 新的 locale provider 挂载位置

建议只在 editor 路由相关层使用，但为减少未来改动，可以直接在 app 壳层挂载，让 `EditorPage` 随时可用。

更稳妥的方式是：

- 在 `App.tsx` 里，将 `EditorLocaleProvider` 与 `SiteConfigProvider` 并列包裹 router

这样无需在 `EditorPage` 局部重复创建 provider，也方便未来若 editor 子组件增多时共享 locale。

## 错误处理

- 若 `localStorage` 读取 locale 失败：回退到 `zh-CN`
- 若存储值不是 `zh-CN` / `en`：回退到 `zh-CN`
- 若写入 locale 失败：允许静默失败，不阻塞切换本身
- 若缺少某个字典 key：实现时应通过 TypeScript 约束保证双语言 key 完整一致，而不是运行时兜底

## 测试策略

至少应覆盖：

1. 默认 locale 为 `zh-CN`
2. 切换到 `en` 后，关键 UI 文案更新
3. 刷新后恢复已保存 locale
4. 非法 locale 存储值回退为 `zh-CN`
5. `EditorPage` 的 alert 文案随 locale 切换

推荐优先做组件级 smoke / interaction test，而不是上来做全量 snapshot。

## 实现边界与后续扩展

本次设计刻意不做全站 i18n，但保留以下可扩展点：

- `EditorLocale` 类型可以未来升级为全站 `Locale`
- 文案字典组织方式可以未来迁移到 `src/i18n/messages/*`
- 若后续要让 showcase 页也跟随 locale，可在不破坏 editor 设计的前提下扩展 provider 的消费范围

## 风险与权衡

### 为什么不直接把文案写成中英并列？

因为会让 editor UI 变得拥挤，且不符合“手动切换”的目标。

### 为什么不引入现成 i18n 库？

因为当前范围只限 editor，使用完整 i18n 框架会增加不必要复杂度。

### 为什么不把 locale 放进 `SiteConfig`？

因为 locale 是编辑器 UI 偏好，不是展示内容数据。把它放进 `SiteConfig` 会污染导出结构，并模糊“内容”和“工具状态”的边界。

## 验收标准

当以下条件全部满足时，认为该功能完成：

- `#/editor` 顶部可见中英切换控件
- 点击切换后，编辑器界面文案即时切换
- 右侧 preview 内容不因切换而改变
- 刷新页面后保持上次所选语言
- 导出 JSON 内容结构不新增 locale 字段
- 已有 editor 行为（编辑、增删、导入导出、reset）不被破坏
