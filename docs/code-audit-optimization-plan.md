# 全量代码审计与优化计划

> 审计日期：2026-08-12  
> 审计范围：仓库配置、`toast-core`、`toast-vue`、`vue-demo`、测试、文档、CI 与发布流程  
> 审计方式：全量静态阅读、现有检查/测试/构建、依赖公告扫描、关键边界场景复现  
> 本文保留原始审计计划，并在第 0 节记录后续实施结果。

## 0. 实施状态（2026-08-12）

本轮已完成已确认的正确性缺陷、主要 Vue/性能问题以及发布与依赖门禁修复，并补充 Changeset。逐项状态如下：

- `pnpm run ready` 全量通过：格式、lint、类型、93 个单元测试、coverage 阈值、三个 workspace 构建、bundle/performance budget、Playwright + axe、两个公共包 dry-run。
- `vp exec pnpm audit --prod --audit-level high`：无已知漏洞。
- core 测试由 28 个增至 46 个，Vue 测试由 27 个增至 42 个，Demo 新增 5 个测试；桌面/移动 Chromium 共执行 9 个浏览器用例并通过。
- 发布包已确认包含 JS、类型声明、README、LICENSE 和随包 skill。

状态约定：✅ 已完成；🟡 主体完成、仍有增强或浏览器验证项；⏳ 尚未实施。

### 0.1 逐项状态

| ID | 状态 | 当前结论 |
| --- | --- | --- |
| CORE-01 | ✅ | 清除旧移除计时器，补充竞态回归测试。 |
| CORE-02 | ✅ | 对快照和嵌套 `meta` 做隔离，补充不可变性测试。 |
| CORE-03 | ✅ | 按暂停原因分别追踪手动、交互和页面可见性暂停。 |
| CORE-04 | ✅ | 同步工厂异常和 resolver 异常均进入错误状态。 |
| CORE-05 | ✅ | 默认按位置去重、应用最新选项，并开放可配置 `errorDedupeKey`。 |
| PERF-01 | ✅ | 已完成按需 ticker、O(n) 快照/布局及 1/10/100/1000 条基准与 CI 门禁。 |
| DEMO-01 | ✅ | Promise、计时器和缓存生命周期已收敛，并有回归测试。 |
| REL-01 | ✅ | 发布前门禁已覆盖 ready、审计、体积和 pack dry-run。 |
| DEP-01 | ✅ | `nanoid` override 已安全升级，生产依赖审计无已知漏洞。 |
| CORE-06 | ✅ | 已支持字段清空、参数校验、完整 no-op 抑制，所有 mutator 返回 changed 标志。 |
| VUE-01 | ✅ | store/id 动态订阅已修复并有测试。 |
| VUE-02 | ✅ | 高度测量改为 `ResizeObserver` + rAF，并保留兼容回退。 |
| VUE-03 | ✅ | 布局偏移改为缓存后线性计算，避免渲染期排序。 |
| VUE-04 | ✅ | effect 按 id 缓存，`will-change` 仅在活动期启用，并提供真实 Chromium motion trace。 |
| VUE-05 | ✅ | 已处理速度过期、取消清理、`touch-action`，并覆盖移动 Chromium 与 `lostpointercapture`。 |
| UTIL-01 | ✅ | 逻辑解析、样式转换和边界输入均已覆盖。 |
| DEMO-02 | ✅ | demo 的定时器、Promise rejection 和 Map 清理已修复并测试。 |
| A11Y-01 | ✅ | 焦点态/恢复、热键、reduced-motion、live region 与 axe 均有浏览器回归。 |
| DOC-01 | ✅ | README、公开导出和行为语义已同步。 |
| REL-02 | ✅ | LICENSE、仓库元数据、Changeset 和发布包内容已补齐。 |
| P3-01 | ✅ | 已移除外部字体网络依赖。 |
| P3-02 | ✅ | 已提供 system/light/dark 三态入口、持久化、系统联动与 FOUC 处理。 |
| P3-03 | ✅ | storage 读写已增加异常保护。 |
| P3-04 | ✅ | 外链 `rel` 与基础 meta 已补齐。 |
| P3-05 | ✅ | `destroy()` 后禁止复用，并有测试。 |
| P3-06 | ✅ | 监听器异常已隔离，并有测试。 |
| P3-07 | ✅ | CI/release 已覆盖 build/audit/size/pack、coverage、浏览器 E2E 与性能基准。 |
| TEST-01 | ✅ | Playwright + axe 覆盖桌面/移动、键盘、触控、主题、reduced-motion 和 live region。 |
| TEST-02 | ✅ | 三个 workspace 均设置全源码 statements/branches/functions/lines 阈值。 |
| PERF-02 | ✅ | 已提交 1/10/100/1000 toast 的 CPU、分配和刷新频率基准。 |

### 0.2 原剩余工作的完成记录

1. ✅ 错误去重开放可配置 `errorDedupeKey`，默认策略保持按 position 兼容。
2. ✅ 建立 1/10/100/1000 toast 的 CPU、临时堆分配和刷新频率基准，并纳入 CI/ready。
3. ✅ core mutator 统一 no-op 语义，空补丁不发射，并返回 `changed` 标志。
4. ✅ 提供可重复的 Chromium motion trace，覆盖静止合成属性、移动触控和 `lostpointercapture`。
5. ✅ Demo 提供 system/light/dark 三态主题入口。
6. ✅ 建立 Playwright + axe E2E，覆盖键盘、触控、reduced-motion、焦点恢复和 live region。
7. ✅ 三个 workspace 均设置全源码覆盖率阈值，并由 CI/ready 强制执行。

本轮计划中的 P1、P2、P3 与后续增强项均已完成；后续若增加源码或交互，应同步提高覆盖率阈值、更新性能基线并扩充浏览器矩阵。

## 1. 原始结论摘要（修复前）

项目的分层方向是合理的：状态与定时行为位于 `toast-core`，Vue 响应式和 DOM 行为位于 `toast-vue`，展示逻辑位于 Demo。当前代码可以通过 lint、类型检查、55 个单元测试和全部构建，但仍有数个现有测试未覆盖的确定性缺陷。

最优先需要处理的是：

1. 延迟删除回调会误删同 ID、已重新显示的 toast。
2. `getState()` 暴露了可修改的内部对象，与“不可变快照”契约不符。
3. 页面可见性恢复会覆盖 hover/手动暂停。
4. `toast.promise()` 的同步工厂异常会遗留永久 loading toast。
5. error 去重没有应用新调用的 duration、position、action 等选项，并且跨 position 合并。
6. 所有有限时长 toast 都会每 250ms 推送全量状态；核心快照和 Vue 布局路径中又存在二次复杂度。
7. 发布流程没有等待质量门禁，且当前完整 `check` 已失败。
8. Demo 的 promise 失败分支会产生未处理的 Promise rejection。
9. 生产依赖扫描报告 1 个 high 级别的 `nanoid` 间接依赖公告，需要升级并确认实际可达性。

建议先完成 P1 正确性和发布门禁，再做性能结构调整；否则性能重构会建立在不稳定的生命周期语义上。

## 2. 验证基线

| 检查 | 结果 | 备注 |
| --- | --- | --- |
| `pnpm run check` | 通过 | 格式、lint、类型检查均通过 |
| `pnpm run lint` | 通过 | 无 lint 错误 |
| `pnpm run typecheck` | 通过 | 46 个文件无类型错误 |
| `pnpm run test` | 通过 | core 43 个、Vue 40 个、Demo 4 个，共 87 个测试 |
| `pnpm run build` | 通过 | core、Vue、Demo 均成功构建 |
| `vp exec pnpm audit --prod --audit-level high` | 通过 | 无已知漏洞 |

构建时的当前体积基线：

- `toast-core`：JS 19.01 kB，gzip 4.99 kB，budget 22 KiB。
- `toast-vue`：JS 19.16 kB，gzip 6.11 kB，budget 22 KiB。
- `vue-demo`：JS 252.78 kB，gzip 88.96 kB；CSS 34.83 kB，gzip 6.73 kB。

已用本地构建产物复现以下结果：

```text
stale-removal-race: []
snapshot-mutation-leaks: mutated outside
dedup-applied-options: { duration: 1000, position: 'top-left' }
sync-factory-throw-state: [ { message: 'loading', type: 'loading' } ]
```

它们分别证明：重新显示的 toast 被旧删除回调移除、外部修改快照污染内部状态、新 error 的配置未生效、同步抛错后 loading 状态未收敛。

## 3. P1：优先修复项

### CORE-01：延迟删除存在竞态，且删除计时器未纳入生命周期管理

**证据**：`packages/toast-core/src/store.ts:237-253` 使用未保存的 `setTimeout`；`update()` 或同 ID `create()` 可以在 `removeDelay` 内把 dismissed toast 恢复为 visible，但旧回调仍会调用 `remove(id)`。`destroy()` 也无法清理这些回调。

**影响**：toast 可能在重新显示后被无提示删除；测试、路由切换或 scoped store 销毁后仍残留异步工作。

**方案**：

- 新增 `removalTimers: Map<string, Timeout>`，在 update/create/remove/destroy 时统一取消。
- 或为每次 dismiss 记录 generation token，回调执行前同时校验 id、status 与 generation。
- 明确定义 dismissed toast 被 update/create 时是“恢复”还是“创建新生命周期”。

**验收**：增加“dismiss 后 update”“dismiss 后同 ID create”“remove 后重建”“destroy 清理回调”的 fake-timer 测试。

### CORE-02：状态快照并不不可变

**证据**：`store.ts:95-107` 对没有计时器的 toast 直接返回内部对象；`pause()`、`resume()`、`recomputeStacking()` 还会原地修改 toast。外部修改 `getState().toasts[0]` 会污染 store。

**影响**：消费者可以绕过 store 修改状态；历史快照会被后续操作反向改变；Vue/React 等适配器难以依赖引用相等和单向数据流。

**方案**：所有写操作生成新 record；`getState()` 始终返回与内部对象隔离的只读快照，并把公开类型改为 `Readonly`/`ReadonlyArray`。开发环境可选择冻结快照以尽早暴露误用。

**验收**：验证外部修改不影响内部状态、旧快照不随新操作变化、每次实际变更才产生新引用。

### CORE-03：暂停原因互相覆盖

**证据**：`store.ts:71-81` 的 visibility handler 调用全局 `pause()`/`resume()`；同一 `paused` 布尔值也被 hover/手动暂停使用。页面恢复可见会恢复仍在 hover 或被业务手动暂停的 toast。技能文档已把它记录为“已知限制”，但这是可观察的错误行为。

**影响**：用户正在阅读或操作 toast 时倒计时会意外恢复。

**方案**：按原因记录暂停状态，例如 `Set<'manual' | 'hover' | 'visibility'>`，只有所有原因解除才重启计时。公共 API 可保留 `pause/resume`，内部增加 reason。

**验收**：覆盖手动暂停 + visibility、hover + visibility、stacked + visibility 的组合测试。

### CORE-04：Promise 同步异常不会更新 toast

**证据**：`packages/toast-core/src/api.ts:63` 在 `try` 之前调用 promise factory。factory 同步抛错时，loading toast 保留，error message 永远不会写入。

**影响**：UI 永久显示 loading；调用方收到 rejection，但提示状态与真实结果不一致。

**方案**：把 factory 调用纳入 `try`，或用 `Promise.resolve().then(factory)` 统一同步/异步异常路径；补充 success/error message resolver 自身抛错时的契约。

**验收**：同步 throw、异步 reject、success resolver throw、error resolver throw 均有明确测试和最终状态。

### CORE-05：error 去重丢失新选项，并跨位置合并

**证据**：`store.ts:151-171` 只更新 message 与 `updatedAt`；新调用提供的 duration、position、meta、action、cancel 均被忽略。查找条件只看“任意 visible error”，所以 bottom-right error 可以替换 top-left error。

**影响**：API 调用参数与最终状态不一致；多 outlet/多 position 场景互相干扰；新 duration 不会重置为调用者预期值。

**方案**：先定义去重键和策略（建议默认同 position + 可配置 key），然后复用完整 `update()` 归一化路径；明确相同消息与不同消息是否都去重。

**验收**：覆盖不同 position、不同 duration、action/meta 更新、相同/不同消息及自定义 dedupe key。

### PERF-01：倒计时推送链路存在高频全量更新和二次复杂度

**证据**：

- `store.ts:381-395` 只要存在有限时长 toast，就每 250ms 向所有订阅者 emit，即使 UI 完全不展示 progress。
- `getState()` 对每个 toast 调 `getProgress()`，后者又 `find()` toast，单次快照最坏为 O(n²)。
- `useToaster.ts:87-119` 的 `calculateOffset()` 和 `getStackMetrics()` 每个 toast 都扫描全数组；Demo 又在 `useToasts.ts:120-214` 重复 filter/indexOf。
- 高频状态替换会令 Vue outlet 和所有 toast render function 重新求值；高度 MutationObserver 又可能触发额外 emit。

**影响**：toast 数量增加或使用富内容时，CPU、分配和渲染次数快速上升；后台交互和低端设备更明显。

**方案**：

- 把 live progress 改为显式订阅/按需开启；不使用进度时只依赖每个 toast 的 dismiss timeout。
- 单次线性遍历同时计算 remaining/progress，移除 `find()`。
- 每个 state version 预计算 position 分组、index、z-index 和累计高度，使整次 outlet 布局保持 O(n)。
- 相同 height、无效 id、无实际状态变化时不 emit。
- 为 1、10、100、1000 个 toast 建立 CPU/分配/emit 次数基准后设回归阈值。

**验收**：无 progress 消费者时 0 次 ticker emit；启用 progress 时单 tick 为 O(n)；布局辅助函数不再为每个 toast 重扫数组。

### DEMO-01：Promise 演示的失败分支会产生未处理 rejection

**证据**：`apps/vue-demo/src/composables/useToasts.ts:315-337` 使用 `void toast.promise(...)`，而 core 会重新抛出 reject；随机失败时没有 `.catch()`。

**影响**：Demo 控制台出现未处理异常，可能被监控误报，也让用户复制到错误示例。

**方案**：示例显式 `await/catch`，或为仅展示通知的场景提供清晰的处理模式；不要改变 core 的“返回原 promise”语义来隐藏调用方错误。

**验收**：强制 resolve/reject 两条浏览器测试，控制台无未处理异常。

### REL-01：发布未受完整质量门禁保护

**证据**：`.github/workflows/release.yml` 在 main push 上独立执行 changesets publish，没有等待 CI，也没有先跑 `ready`；当前 `pnpm run check` 已因该文件格式失败。

**影响**：发布任务可能在 lint/typecheck/test 失败前先发布；主分支当前无法满足仓库定义的交付标准。

**方案**：发布 job 显式依赖可复用的 ready job，或改为 CI 成功后的 `workflow_run`；发布前执行冻结安装、check、test、build 和 pack smoke test。先用 Oxfmt 修正 workflow 格式。

**验收**：故意制造任一门禁失败时 publish 不运行；`pnpm run ready` 通过。

### DEP-01：生产依赖树含 high 级别公告

**证据**：`vp exec pnpm audit --prod` 报告 `nanoid < 3.3.17`，公告为 `GHSA-2v37-7h3g-55p8`，路径经 `vue -> @vue/compiler-sfc -> postcss -> nanoid`。

**影响**：公告描述自定义 generator 在 size 为 0 时可能无限循环。当前路径看起来主要属于编译工具链，不等于 Demo 存在直接可利用入口，但 high 告警会阻断严格供应链门禁。

**方案**：升级/覆盖到 patched 版本并重新生成 lockfile；检查最终浏览器产物是否包含该依赖；把 audit 加入定期或发布前门禁，并记录允许例外的时限和理由。

**验收**：`vp exec pnpm audit --prod` 无 high/critical；构建和测试保持通过。

## 4. P2：功能完整性与结构优化

### CORE-06：更新 API 不能清空可选字段，也缺少配置校验

- `update()` 只在值不为 `undefined` 时写 position/meta/action/cancel，调用者无法恢复默认 position 或移除 action/cancel/meta。
- `max`、`removeDelay`、duration、height 接受 NaN、负数和小数等未定义输入；负 max 实际表现为 unlimited，但文档只声明 0。
- 对不存在 id 的 update/remove/setHeight 和无变化 dismiss 仍可能 emit，制造无效渲染。

计划：为可清空字段引入 `null` 或专用 unset 语义；集中 normalize/validate；所有 mutator 返回是否变化或在无变化时静默。

### VUE-01：公开 prop/slot 契约未完整实现

- `Toaster` 声明了 `store` prop，但 setup 只订阅初始 `props.store`；运行时切换 store 不会重新订阅。
- `useToaster()` 已提供 `getProgress`，`ToasterSlotProps` 和 slot 实际值却没有暴露它。

计划：用 `watch`/effect scope 管理 store 切换和退订；补齐 `getProgress` slot，或明确只通过 toast snapshot 读取并删除重复 API。

### VUE-02：布局顺序依赖时间戳，且重复扫描数组

`calculateOffset()` 使用 `createdAt` 比较前后关系。同一毫秒创建多个 toast 时会出现相等时间戳，偏移可能重叠。应使用稳定数组序号/id index，并与 PERF-01 一起改为按 snapshot 预计算布局索引。

### VUE-03：高度监听方式既不完整又可能触发布局抖动

`ToastWrapper` 为每个 toast 创建 MutationObserver，并在 DOM 变化时同步读取 `offsetHeight`。字体加载、容器宽度变化、CSS 改变等没有 DOM mutation 的尺寸变化不会被捕获；文本倒计时变化又可能产生频繁强制布局。

计划：改用 ResizeObserver，合并到 requestAnimationFrame，height 相同则不写 store；为无 ResizeObserver 环境提供降级路径。

### VUE-04：每个 wrapper 订阅所有 effect，并长期占用合成资源

- 每个 `ToastWrapper` 都订阅全局 effect Set，单个 effect 会广播到所有 wrapper。
- `will-change: transform, opacity, filter` 永久存在，可能为每个 toast 保留合成层。
- blur filter 在高频 opacity/位置变化时成本较高。

计划：按 toast id 订阅 effect；只在 enter/exit/drag 时设置 will-change；用性能录制确认 blur 的成本并提供低成本模式。

### VUE-05：滑动手势会阻止原生滚动，释放速度判断也不稳健

`touchAction: none` 在手势识别前就禁用了原生滚动，与“unsupported direction 不劫持”的注释不一致。提交判断只取最后一次 pointermove 速度，用户停顿后松手仍可能因陈旧速度触发 fling。

计划：根据位置设置更精确的 touch-action，或只在确认拖动后阻止默认行为；加入速度时间窗口/低通计算；补齐 pointercancel、lostpointercapture 和点击抑制清理测试。

### UTIL-01：reduced-motion 只缓存首次结果

`prefersReducedMotion()` 不监听媒体查询变化，系统设置改变后不会更新；同时使用全局 `matchMedia` 而不是检查 `window.matchMedia`。Demo 的图标旋转/弹入、主题和复制动画也没有统一 reduced-motion 兜底。

计划：提供响应式/可订阅的 media query helper，Vue 层在变化时更新；为 Demo 加统一 `@media (prefers-reduced-motion: reduce)`。

### DEMO-02：Demo 堆叠计算和缓存会累积成本

- `stackedOffsets` 只在仍存在的非 stacked toast 被遍历时删除；已经移除的 id 永久留在 Map。
- `positionGroup()`、`group.indexOf()`、`calculateOffset()`、`getStackMetrics()` 在每次渲染中叠加为 O(n²)。
- burst、batch、loading 演示的 timeout 没有统一清理，热更新/卸载时仍可触发。

计划：按当前 toast id 集合清扫 Map 或将缓存绑定生命周期；复用 Vue 层预计算指标；集中管理 Demo timers。

### A11Y-01：键盘和动效可访问性需要补齐

- ToastBar 关闭按钮默认 `opacity-0`，仅 group-hover 显示；键盘聚焦时可能仍不可见。
- success/error/loading 图标动画未尊重 reduced motion。
- 建议补充 live region 行为、热键冲突、焦点恢复和 swipe 替代操作的浏览器测试。

计划：加入 `focus-visible`/`group-focus-within` 可见态；统一 reduced-motion；用 axe + Playwright 覆盖关键流程。

### DOC-01：公开文档与实现存在偏差

- 公共 README 使用仓库专用的 `vp install` 作为消费者安装命令，应提供 pnpm/npm/yarn/bun 的正常安装方式。
- Demo Usage 示例只 import `Toaster` 与 `toast`，却使用了未 import 的 `ToastWrapper`。
- Vue README/skill 提到已不存在的 `HeadlessToastBar`。
- `Toast<T>` 对 remaining/progress 的注释说 paused/stacked 时为 undefined，实际返回冻结值。
- `custom` 类型注释说没有隐式 duration，实际默认 4000ms。
- `CONTRIBUTING.md` 仍要求从 `master` 创建分支，而 CI/changesets/git 当前使用 `main`。

计划：在 API 语义确定后统一 README、TSDoc、skills 和 Demo snippet，并增加文档代码片段的类型检查。

### REL-02：包发布元数据和法律文件不完整

仓库未见 LICENSE 文件，两个公共包虽然声明 MIT，但发布内容没有明确许可证正文；package metadata 也缺少 repository/homepage/bugs/funding 等常用字段。

计划：确认项目授权后补 LICENSE；完善 package metadata；对两个包运行 pack dry-run 并自动检查必需文件、exports 和类型入口。

## 5. P3：后续体验与工程改进

1. Demo 的 Google Fonts 使用 CSS `@import`，会增加关键渲染链和第三方请求；改为自托管/预加载，或只使用系统字体。
2. 主题切换不持久化，系统主题变化会覆盖用户手动选择；定义 `system/light/dark` 三态并避免首屏闪烁。
3. i18n 的 localStorage 读写没有处理 SecurityError；在受限环境中应降级。
4. 对外链接统一补 `rel="noopener noreferrer"`，并补充 Demo 的 description、主题色等基础 metadata。
5. 为 ToastStore 明确定义 destroy 后是否允许复用；建议禁止并在开发环境抛出清晰错误。
6. 订阅者回调异常当前可能中断后续 listener；定义传播策略并测试。
7. CI 缺少浏览器 E2E、覆盖率阈值、性能基准、bundle size budget 和 pack/install smoke test。

## 6. 分阶段实施路线

### 阶段 0：恢复质量门禁（约 0.5-1 天）

- 修复 release workflow 格式。
- 让 release 等待完整 ready 检查。
- 升级 high 风险依赖并复跑 audit。
- 建立当前 bundle size 记录。

完成条件：`pnpm run ready` 与生产依赖门禁通过，失败的 CI 不可能触发 publish。

### 阶段 1：稳定核心生命周期（约 2-4 天）

- 修复 removal timer 竞态。
- 改为不可变内部更新和只读快照。
- 引入 pause reasons。
- 修复 promise 同步异常与 dedup 配置语义。
- 定义 update 清空字段和非法配置行为。

完成条件：CORE-01 至 CORE-06 的回归测试全部落地，公开 API 变更附 changeset 与文档。

### 阶段 2：重构高频性能路径（约 3-5 天）

- progress ticker 改为按需。
- core snapshot 和 Vue layout 改为单次 O(n) 预计算。
- ResizeObserver + rAF 合批，高度不变不 emit。
- effect 按 id 分发，减少长期 will-change/filter 成本。
- 建立可重复 benchmark。

完成条件：无 progress 使用时没有周期性 render；100/1000 toast 基准相对改造前有记录且无复杂度退化。

### 阶段 3：补齐 Vue、Demo 与可访问性（约 2-4 天）

- 支持 Toaster store 动态切换并补齐 slot API。
- 修复 swipe/touch-action、reduced-motion、焦点可见性。
- 清理 Demo Map/timer，处理 promise rejection。
- 添加关键 Playwright + axe 流程。

完成条件：鼠标、触控、键盘和 reduced-motion 四类路径均有自动化验证。

### 阶段 4：文档与发布收尾（约 1-2 天）

- 同步 README、TSDoc、skills、Demo snippets。
- 补 LICENSE 与 package metadata。
- 增加 pack/install smoke test、size budget 和覆盖率报告。

完成条件：从全新临时项目安装 tarball 后，类型解析、ESM import、Vue 渲染和文档示例均通过。

## 7. 建议新增的测试矩阵

| 层级 | 必补场景 |
| --- | --- |
| core unit | stale removal、destroy 清理、不可变快照、pause reason 组合、同步 factory throw、dedup 全选项、非法配置、no-op 不 emit |
| Vue unit | 动态 store prop、getProgress slot、同毫秒顺序、ResizeObserver 合批、effect 定向订阅、pointercancel/lost capture |
| Demo/browser | promise resolve/reject、六个位置、queue/stack、主题/语言、键盘热键与 Escape、触控滑动、reduced motion |
| performance | ticker 开/关、snapshot 1/10/100/1000、布局 1/10/100、DOM observer 回调数、长任务与内存 |
| release | pack 内容、tarball 安装、exports/types、audit、bundle size、CI 失败阻断 publish |

## 8. 实施约束

- 共享状态、计时、去重和生命周期行为继续放在 `toast-core`；不要把修复下沉到 Vue workaround。
- DOM 测量、动画、手势和响应式订阅只放在 `toast-vue`。
- Demo 只负责展示和样式，不成为公共行为的唯一实现。
- 每个行为变更都需要测试；公共 API/语义变更需要 README、entry point、skill 和 changeset 同步更新。
- 每个阶段优先运行最窄检查，合并前统一运行 `pnpm run ready`。
