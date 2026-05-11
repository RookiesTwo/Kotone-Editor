# Phase-Model Background Transition Design

## 概述

当前 showcase 的滚动驱动过渡已经从“阈值瞬切”升级为基于滚动的连续插值，但背景层仍然存在一个结构性问题：

- 当 section 身份切换时，背景层既要承担“显示哪张图/哪种背景”，又要承担“当前透明度是多少”
- 由于这两个职责耦合在同一层上，滚轮滚动是离散跳变时，容易出现：
  - 向上滚动时 hero 背景短暂闪现
  - 向下滚动时 hero 背景突然消失
  - 氛围光与背景图的阶段切换不同步
  - CSS 过渡时机和 React 渲染结果互相干扰

本次设计的目标，是把背景过渡改成一个**分层、分职责的阶段模型**，让背景层的“身份”和“透明度”彻底解耦，避免继续通过补丁式参数调节来修复闪现问题。

## 目标

- 保留当前已经实现好的 scroll-driven showcase 大方向
- 不回退到阈值瞬切
- 保留已有 300ms opacity 平滑过渡
- 彻底消除背景层在 zone / gap 边界时的闪现与突变
- 让背景图、氛围光、背景色都遵循同一套阶段模型
- 不破坏现有 editor、单图拖动、tag 编辑、双语 editor 等功能

## 非目标

- 不重做 editor 功能
- 不重做数据模型中与图片编辑无关的部分
- 不引入重型动画库
- 不把前景与背景改成完全不同的两套时间轴系统
- 不做 gallery 多图的逐图独立动画系统

## 问题定义

### 当前问题的本质

当前背景层的 bug，不是简单的“动画时间太长/太短”，也不是单纯的“opacity 数值不对”。

真正的问题是：

> **背景层在 section 身份切换时，没有一个稳定、正确的“阶段起始透明度”。**

例如：
- 旧层刚刚还是 zone 模式下的高 opacity
- 下一帧它已经被赋予了新 section 的背景内容
- CSS transition 再从旧值过渡到新值
- 结果就会看到错误的图片在错误的透明度上闪一下

这种问题说明背景层的“内容身份切换”和“透明度变化”发生得太耦合。

## 核心设计

### 背景层拆分原则

背景系统拆成两类信息：

1. **层身份（Identity）**
   - 当前这层在展示哪个 section 的视觉内容
   - 包括背景图、氛围光、背景渐变/背景色

2. **层透明度（Opacity / Weight）**
   - 当前这层在整个过渡中占多少权重

设计要求：

- **身份切换**不应直接依赖上一帧的透明度残值
- **透明度变化**应只依赖明确的阶段模型（zone/gap + progress）

## 阶段模型

### 1. zone

当视口中心位于某个 chunk 的视觉中心区间内时，进入 `zone` 模式。

该模式下：

- `current = 该 chunk`
- `from` / `to` 不参与混合
- 当前 chunk 的背景层权重 = 1
- 其它背景层权重 = 0
- 前景同样全亮静止

### 2. gap

当视口中心位于两个 chunk 的视觉中心区间之间时，进入 `gap` 模式。

该模式下：

- `from = 正在退出的 chunk`
- `to = 正在进入的 chunk`
- `progress ∈ [0, 1]`

权重规则：

- `fromWeight = 1 - progress`
- `toWeight = progress`

无论背景图、背景色还是氛围光，都只使用这个统一的权重模型。

## 背景系统结构

### 不再临时创建/销毁背景层

当前问题的关键之一，是背景层身份切换时存在临时挂载、重新赋值或 residual opacity 的问题。

新设计中：

- 固定存在两层背景槽：
  - `fromLayer`
  - `toLayer`
- 它们长期存在，不因 section 切换而临时创建/删除
- 切换发生时，只更新：
  - 每个槽对应的 section 身份
  - 每个槽对应的透明度

也就是说：

- **层是固定的**
- **槽里的内容是可替换的**
- **透明度是阶段驱动的**

## 应用于三种背景元素

### 1. 背景图

- hero 或未来的背景图型 section 的图片内容装入 `fromLayer` / `toLayer`
- 图像本身不直接依赖当前 active 的单一 section
- 切换时只通过 `fromWeight` / `toWeight` 混合

### 2. 氛围光（backdrop）

- 也采用双槽结构
- `fromBackdrop` 对应离开的 section 风格
- `toBackdrop` 对应进入的 section 风格
- 同样按 `fromWeight` / `toWeight` 过渡

### 3. 背景色 / 渐变

- 壳层背景不能再只认一个 `activeSection.background`
- 同样需要 from/to 双槽思维
- 可以通过额外一层 shell background overlay，或者把 shell 的背景色渐变独立为一对 overlay layers 来实现

## 实现边界

### 可以保留的部分

以下内容不应被推倒重做：

- `SectionConfig` 已经新增的图片构图字段
- hero 背景化方向
- editor 中的 slider / 拖动 / tag 编辑
- editor locale / persistence / config normalization 体系

### 需要重构的重点

#### `useActiveSection`

继续保留它作为 scroll-driven transition 的“阶段输出器”，但职责只到：

- `mode`: `zone` | `gap`
- `current`
- `from`
- `to`
- `progress`

它不负责背景层本身的挂载逻辑。

#### `ShowcaseCanvas`

需要重构背景相关实现：

- 固定两个背景图层槽
- 固定两个氛围光层槽
- 固定 shell background 的过渡槽
- section 切换时更新“槽内身份”而不是直接让单层吃新图

## 前景系统

前景内容（标题、描述、tags、按钮、单图容器）继续使用和当前一致的 zone/gap 规则：

- zone：全亮静止
- gap：`from = 1-progress`, `to = progress`

但前景本身不需要像背景那样拆成双槽。因为前景内容按 section 结构存在天然隔离，问题主要出在背景层的“共享画布”特性。

## 为什么这比补丁式修法更正确

### 不再依赖魔法数字

- 不再靠 `progress * 1.8`
- 不再靠 `--no-fade`
- 不再靠“改 CSS 默认 opacity 凑效果”

### 不再依赖渲染时机侥幸正确

- 不要求浏览器在 React 更新与 CSS 过渡之间“刚好按我们希望的顺序工作”
- 新身份内容进入时，就已经有明确的独立槽位和明确的权重来源

### 更容易推导和测试

只要验证：
- 当前 mode 是什么
- from/to 是谁
- progress 是多少
- 两个固定槽拿到的 identity 和 opacity 是否正确

就能判断系统对不对。

## 测试策略

建议增加或强化以下测试：

1. `zone` 模式下：
   - 当前背景层权重 = 1
   - 另一层 = 0

2. `gap` 模式下：
   - `fromWeight = 1-progress`
   - `toWeight = progress`

3. section 身份切换时：
   - 背景槽 identity 更新正确
   - 不会复用上一层的不透明度残值

4. editor 预览与公开页：
   - 两者都遵循相同阶段模型
   - editor 右栏仍只影响右侧区域

## 验收标准

当以下条件成立时，认为本次修复完成：

- 向下滚动进入 gap 时，旧背景不会突然消失
- 向上滚动回 zone 时，新背景不会突然闪现
- 氛围光与背景图的过渡同步
- 背景色 / 渐变与背景图的过渡同步
- 公开页与 editor 预览都没有“残值闪现”问题
- 现有 editor 能力全部保持正常
- 自动化测试和构建通过
