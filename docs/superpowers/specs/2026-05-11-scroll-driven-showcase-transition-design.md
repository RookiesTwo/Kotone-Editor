# Scroll-Driven 连续过渡展示系统设计

## 概述

当前 showcase 展示页和 editor 预览已经在功能上可工作，但其区块（section）切换机制仍依赖“阈值触发 active section + 瞬时切换视觉类”，导致：

- 背景在区块边界附近瞬切
- 前景内容（标题、描述、tags、按钮、图片区块）同样是到阈值后瞬间变化
- 滚动到两个区块之间时，看感上不够连续自然

本次设计的目标，不是重写现有 editor 功能和数据模型，而是在**保持现有已实现功能不退化**的前提下，把 showcase 的切换机制升级为 **scroll-driven 连续过渡系统**，让背景与前景都跟随滚动位置渐进变化。

## 目标

- 将 showcase 的区块过渡从“阈值 + 瞬切”升级为“滚动驱动的连续过渡”
- 背景图与背景渐变在相邻 section 之间连续混合
- 前景元素（标题、描述、tags、按钮、图片展示区域）跟随滚动连续调整透明度与位移
- hero 区块继续保持背景化呈现，但在过渡中平滑退出
- 公开展示页 `#/` 和 editor 预览 `#/editor` 共用同一套 scroll-driven 核心机制
- 不破坏现有 editor 功能（双语、tag 编辑、单图构图编辑、拖动定位）
- 不破坏现有数据模型的核心结构

## 非目标

- 不重做整个 editor 或数据模型
- 不把前景过渡做成全量 layout engine
- 不引入重型动画或第三方拖拽库
- 不为 gallery 每张图做独立的 scroll-driven 裁切编辑
- 不把公开展示页变成可交互编辑器

## 问题定义

### 1. 当前切换模型是阈值驱动的

当前 `useActiveSection` 基于 `IntersectionObserver` 回调中的 intersectionRatio 阈值来判定 active 区块。一旦判定切换，唯一 active 就发生变化，导致：

- 背景完全换图
- 前景 class 瞬间从 `is-idle` 变为 `is-active`（或反之）

这种模型在区块边界处天然会产生“跳变感”。

### 2. 背景与前景没有分离的过渡节奏

当前背景、标题、描述、tags、按钮都在同一个 `activeSection` 的影响下同步变化。没有“背景先开始过渡，文字再跟上”的层次感，也没有“两个区块之间的视觉效果是混合而来”的中间态。

### 3. 编辑器和公开页的过渡体验应一致

当前 editor 预览和公开页在 active 判定、滚动根节点等方面已经有了一致的视口根，但过渡本身还不是统一的 scroll-driven 系统。升级后，两者应在视觉过渡上保持相同观感。

## 设计方向

### 核心机制

引入一个 **scroll-driven 连续过渡模型**，它的核心是：

- 在任意时刻，系统知道“当前主导区块”、“参与过渡的下一区块”，以及两者之间的 `progress`（0 → 1）
- 背景与前景都不再只认一个 active section
- 而是根据 `progress` 连续计算各项视觉参数

### 与现有功能的关系

- 现有 editor 功能**保持不动**
- 现有数据模型字段**尽量不动**
- 现有 CSS 结构与 class 名**可保留作为基础层**
- 连续过渡逻辑作为一个**新增层**，叠加在现有渲染逻辑之上

## 过渡模型设计

### from / to / progress

在任何滚动位置：

- `from` = 当前区块（用户刚离开或正离开的那个）
- `to` = 下一区块（用户正进入的那个）
- `progress` = 在 from 和 to 之间的滚动进度，值域 [0, 1]

当 `progress` = 0 时：
- from 的视觉完全占主导
- to 的视觉被完全抑制

当 `progress` = 1 时：
- to 的视觉完全占主导
- from 的视觉退出

当 `progress` 在中间时：
- 两个区块的视觉处于连续混合状态

### progress 的计算

progress 应由区块在视口中的相对位置决定，而不是仅由 intersectionRatio 阈值决定。

推荐方式：
- 仍保留 `IntersectionObserver` 识别可见区块
- 但 `progress` 由区块的顶部/底部与视口中心的距离计算得出
- 当区块进入主视口区域时，progress 从 0 向 1 变化

这种方式的优点：
- 不与阈值绑定
- 能产生真正连续的视觉体验
- 仍然保持性能可控

### 同时参与过渡的区块数量

第一版建议只同时参与 **两个区块**（from 和 to）的过渡。

不引入三个及以上区块同时参与混合，以保持实现可控、性能稳定。

## 背景设计

### 背景层连续混合

当前背景视觉主要通过以下元素构成：

- `.showcase-shell` 的背景色
- `.showcase-active-background` 背景图层（hero 背景图 + 渐变遮罩）
- `.showcase-backdrop` 装饰氛围层

升级后，背景层不再只显示一个 active section 的背景，而是：

1. 识别 from 和 to 两个区块
2. 根据 `progress` 计算混合结果
3. 将混合结果应用到独立的背景视觉层

### hero 背景图的过渡行为

当 hero 是 from，profile 是 to 时：

- hero 背景图在 progress 0→1 的过程中逐渐淡出
- profile 的背景风格/渐变逐渐淡入
- 不再出现“hero 图瞬时消失”的跳变

### 实现方式

推荐使用**双背景视觉层**或**单一可混合的背景层**：

- 两个相邻区块的背景信息同时可用
- 通过 opacity / visibility / CSS custom property 方式连续混合

### 与现有 background layer 的关系

- `.showcase-active-background` 仍保留其职责
- 但其内容不再只来源于一个 section
- 而是根据 `progress` 在两个 section 间插值

## 前景设计

### 前景过渡目标

不改变现有的前景内容结构，只改变其**出现与淡出的程度**。

仍保留的现有能力：
- 标题、描述、tags、按钮、图片区块的排版结构
- 每个 section 的内容字段不变
- editor 编辑控件不变

连续过渡的目标是：
- 不再通过 `is-active` / `is-idle` 做硬切
- 而是根据 `progress` 连续驱动各项参数

### 主要内容组件的过渡方式

#### 标题

- **opacity**: 在 from 区块中从 1 向 0 过渡，在 to 区块中从 0 向 1 过渡
- **位移**: 轻微的上/下位移，越远离中心位移越大
- **scale**: 保持现有 scale 感，但绑定到 progress

#### 描述文字

- **opacity**: 随 progress 连续变化，略微慢于标题
- **位移**: 轻微滞后于标题

#### tags

- **opacity**: 整体跟随区块进度
- 每个 tag 不做独立过渡

#### 按钮

- **opacity**: 跟随区块进度
- 按钮本身不重定义过渡方式

#### 图片展示区域

- **opacity**: 随区块进度连续变化
- 图片区块的透明度不与裁切/缩放冲突
- 编辑拖动功能保持独立

### 基本原则

- **不引入复杂的分层编排**
- **不把每个文字、每个 tag 单独做进度**
- 以区块为基本单位进行前景过渡
- 允许内部有轻微的视觉层级差异

## 技术架构

### 不改动的部分

以下部分保持不动（除非为了接入 scroll-driven 需要极少量防御性调整）：

- `src/types/site-config.ts`（核心类型定义）
- `src/data/default-config.ts`（默认数据）
- `src/lib/config-utils.ts`（归一化逻辑）
- `src/lib/persistence.ts`（持久化）
- `src/context/SiteConfigContext.tsx`（站点配置状态）
- `src/context/EditorLocaleContext.tsx`（编辑器语言状态）
- `src/pages/EditorPage.tsx`（编辑器页面逻辑）
- `src/pages/EditorPage.test.tsx`（编辑器测试）
- `src/pages/ShowcasePage.tsx`（展示页路由壳）

### 主要改动区域

#### `src/hooks/useActiveSection.ts`

从“返回单一 activeId”升级为“返回当前主导区块 + 参与过渡组合 + progress”。

建议新增或修改：
- 增加 from/to/progress 的计算能力
- 保持现有 observer 架构，但不再简单取最高值
- 让 progress 基于区块在视口中的相对位置

#### `src/components/ShowcaseCanvas.tsx`

这是本轮最核心的改动文件。

新版必须：
- 接收新的连续过渡状态
- 根据 progress 计算背景混合结果
- 根据 progress 计算前景透明度/位移
- 同时渲染 from 和 to 的内容层（或通过混合 visual layer 间接实现）
- 仍保持 editor 里 `embedded` 模式的兼容性

#### `src/components/ShowcaseCanvas.test.tsx`

新增或更新测试，以覆盖：
- 连续过渡状态下背景层的行为
- 连续过渡状态下前景元素的透明度/位移
- 公开页和嵌入模式的兼容性

#### `src/index.css`

- 可能需要新增少量过渡相关 CSS（如双背景层样式）
- 减少对 `is-active` / `is-idle` 硬切的依赖
- 保持 editor 侧边栏和布局样式不退化

### 不改动的测试文件

以下测试文件不需要改动（除非实现过程中发现回归）：

- `src/lib/config-utils.test.ts`
- `src/lib/persistence.test.ts`
- `src/context/EditorLocaleContext.test.tsx`
- `src/App.test.tsx`
- `src/pages/EditorPage.test.tsx`

## 编辑器一致性

你选择了 `#/` 和 `#/editor` 右侧预览都应尽量使用同一套过渡机制。

因此：

- `ShowcaseCanvas` 在 `embedded=true` 和 `embedded=false` 两种模式下共享核心过渡逻辑
- 只有额外的编辑控件、拖动交互、画框/缩放/遮罩 slider 属于 editor 专有
- 过渡本身的视觉结果在两种模式下保持一致

## 错误处理与边界

- 当只有一个可见区块时，不进行 from/to 混合（直接单区块渲染）
- 如果滚动位置完全不在任何区块范围内，回退到第一个可见区块
- progress 值应始终被限制在 [0, 1]
- 不因为 progress 计算出现 NaN 或极端值导致渲染崩溃

## 测试策略

建议覆盖的重点：

1. 连续过渡状态 hook 的核心逻辑（from/to/progress 计算）
2. 背景混合渲染在公开页与嵌入模式下的正确性
3. 前景元素在 progress=0/0.5/1 时的透明度与位移
4. 单区块场景下连续过渡不降级为错误状态
5. 已有 editor 功能和现有测试不被破坏

对于真正的滚动驱动视觉体验，仍需在浏览器中手测确认。

## 验收标准

当以下全部满足时，认为本轮完成：

- 滚动时区块背景不再瞬切，呈现连续混合
- 前景内容（标题、描述、tags、按钮等）随滚动连续变化
- hero 仍然保持背景化呈现，但过渡更平滑
- 公开展示页和 editor 预览的过渡观感一致
- 现有 editor 功能（双语、tag 编辑、单图构图编辑、拖动定位）不受影响
- 自动化测试全部通过
- 生产构建成功
