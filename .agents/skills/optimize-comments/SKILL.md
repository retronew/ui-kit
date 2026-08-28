---
name: optimize-comments
description: Review and rewrite code comments in this TypeScript/Vue monorepo against big-tech style guides (Google TypeScript Style Guide, TSDoc, Vue core style guide) — distinguishing published-API doc comments (need full TSDoc) from internal comments (need WHY, not WHAT). Use whenever the user asks to 优化注释、审查注释、补充 JSDoc/TSDoc、清理无用注释、写注释规范, mentions comment quality/style/regret ("这段注释是不是没用"、"帮我补一下这个函数的文档注释"), or when reviewing/finishing a diff that touches comments on exported symbols under `packages/*/src`. Prefer this over ad-hoc commenting whenever comments are being added, reviewed, or cleaned up in this repo.
disable-model-invocation: false
---

# 优化代码注释

这个 skill 用于按照大厂（Google / Microsoft TypeScript / Vue 官方）的注释规范，审查并改写本仓库（`packages/toast-core`、`packages/toast-vue`、`packages/call-vue`，均为发布到 npm 的库）中的注释。目标是让公开 API 的文档注释对**库的使用者**有用，同时清除对代码维护没有价值的噪音注释。

## 判断标准：什么值得写注释

先判断注释的对象是**公开 API**还是**内部实现**，标准不同：

### 公开 API（导出的函数/类型/组件 props/组合式函数）→ 必须写 TSDoc

`packages/*/src` 下任何会被外部消费者导入的符号（`export` 的函数、interface、type、Vue 组件的 `defineProps`/`defineEmits`、组合式函数的返回值）都要有 TSDoc 注释，因为这些注释会直接进入用户的 IDE 悬浮提示和生成的类型声明文件。参考 [TSDoc](https://tsdoc.org/) 规范：

```ts
/**
 * Push a toast onto the queue and return its id.
 *
 * @param options - Content and behavior for the toast; `id` is auto-generated if omitted.
 * @returns The toast's id, usable with {@link dismiss}.
 */
export function toast(options: ToastOptions): string
```

要点（对齐 Google TypeScript Style Guide + TSDoc）：
- 第一句是独立的概括句（summary），能脱离上下文单独理解，出现在 IDE 悬浮提示里。
- 用 `@param` / `@returns` 描述"做什么"和"为什么"，不要重复参数名本身能表达的信息（例如 `options - The options` 是噪音）。
- 有非显而易见的边界行为（副作用、抛出条件、默认值来源）时用一句话补充，不要省略。
- 跨符号引用用 `{@link Name}`，不要写自然语言描述让读者自己去找。
- 已废弃但仍导出的 API 用 `@deprecated 原因 + 替代方案`。

### 内部实现（非导出的函数、组件内部逻辑）→ 遵循项目 CLAUDE.md 的"WHY not WHAT"

本仓库 `CLAUDE.md` 已经定义了内部注释的默认规则，此 skill 在其基础上给出可执行的检查项：

- **默认不写注释。** 标识符命名良好时，注释描述"做了什么"是纯噪音，删除。
- **只在 WHY 不明显时写一行注释**，包括：
  - 隐藏约束（例如"这里必须在 `nextTick` 之后执行，因为 X 组件的 ref 还没挂载"）
  - 非直觉的不变量
  - 针对具体 bug 的 workaround（最好带 issue/PR 号或引擎版本号，例如 `// Safari <17 fires transitionend twice for transform — dedupe by property name.`)
  - 会让读者感到意外的行为
- **不要引用当前任务、调用方或 issue 号**（"used by X flow"、"fix for #123"）——这些属于 PR 描述，会随代码演进而腐烂。
- **不要写块注释重复函数签名已经表达的信息**：`// 遍历数组` 加在 `for` 循环上方是噪音。
- **删除注释掉的代码**，不要留作"参考"。

## Vue SFC（`.vue`）文件的注释约定

- `<script setup>` 里，导出给模板使用的响应式状态/方法遵循上面"内部实现"规则——大多数不需要注释。
- 面向消费者的 `defineProps<Props>()` 中，若 `Props` interface 定义在同文件内，interface 字段用 TSDoc 单行注释（会被 vue-tsc / Volar 提取到组件的 props 文档提示中）：
  ```ts
  interface Props {
    /** Duration in ms before the toast auto-dismisses; `0` disables auto-dismiss. */
    duration?: number
  }
  ```
- `<template>` 里避免逐行注释 HTML 结构；仅在条件渲染的分支逻辑非显而易见时，在 `<!-- -->` 中补一句 WHY。

## 执行方式

被要求"优化注释"时：

1. 用 `git diff` 或 `Read` 定位目标文件；若未指定范围，默认只处理当前分支相对 `main` 有改动的文件（跑 `rtk git diff main...HEAD --name-only` 或等价命令）。
2. 对每个改动/新增的注释，按上面两类标准分类判断，输出前后对比：
   - 公开 API 缺 TSDoc → 补全 `@param`/`@returns`/`@deprecated`
   - 公开 API 的 TSDoc 措辞冗余或复述签名 → 精简为概括句 + 非显而易见信息
   - 内部实现的"WHAT"注释 → 直接删除
   - 内部实现里确实有 WHY 但没写 → 建议补充一行
   - 死代码注释 → 删除
3. 用 `Edit` 直接应用改动，不要只列建议不落地（除非用户明确要求先给 diff 预览）。
4. 改完后跑 `vp check --fix`（本仓库统一用 `vp`，不要用裸 `pnpm`/`eslint`）确认没有引入 lint/格式问题。
5. 若改动量大、涉及多个 package，简要汇总改了哪些文件、新增/删除了多少条注释，不需要逐条列出。

## 反模式检查清单（发现即改）

- [ ] 注释复述代码本身（`// increment i` 加在 `i++` 上）
- [ ] 公开函数的 TSDoc 参数描述和参数名同义反复
- [ ] 注释引用了具体调用方/PR号/任务名而不是可复用的 WHY
- [ ] 大段被注释掉的旧代码
- [ ] TODO 注释没有说明触发条件或负责人，长期搁置
- [ ] 类型已经能表达的信息又在注释里重复一遍（例如 `@param id - string`）
- [ ] 中英文混排不一致（本仓库注释统一用英文，参考 `packages/toast-core/src/utils.ts` 现有风格）
