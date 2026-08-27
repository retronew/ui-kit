import type { Locale } from './i18n'

export interface LocalizedSection {
  heading: string
  /** Wrap the heading in `<code>` — used for literal API/error-message headings like `No <Root> found!`. */
  codeHeading?: boolean
  paragraphs: string[]
  bullets?: string[]
  code?: string
  /** Syntax-highlighting language for `code`. Defaults to `'ts'`. */
  lang?: 'ts' | 'vue'
}

export interface LocalizedDoc {
  title: string
  description: string
  sections: LocalizedSection[]
}

type TranslatedLocale = Exclude<Locale, 'en'>

export const localizedDocs: Record<TranslatedLocale, Record<string, LocalizedDoc>> = {
  'zh-cn': {
    why: {
      title: '为什么选择 call-vue？',
      description:
        '当 UI 需要把答案交回发起调用的代码时，比起跨组件传递 ref、emit 和回调，await 更贴合问题本身。',
      sections: [
        {
          heading: '命令式流程与声明式渲染',
          paragraphs: [
            '确认框、输入框和选择器本质上都是“提问、等待、得到答案、继续”。Vue 仍然负责声明式渲染，call-vue 只为调用方提供与问题一致的命令式边界。',
          ],
          code: "const accepted = await Confirm.call({ message: '继续吗？' })\nif (accepted) await save()",
        },
        {
          heading: '状态能显示界面，却不能返回答案',
          paragraphs: [
            'ref 可以控制可见性，但结果往往要通过 emit、回调或保存在上层的 resolver 传回去。提问与后续业务因此被拆散。call() 的 Promise 让两者回到同一个处理函数。',
          ],
        },
        {
          heading: '什么时候仍应使用普通状态',
          paragraphs: [
            '如果只是本地显示/隐藏，且不需要向调用方返回值，ref 就是更直接的选择。需要复用、返回结果或同时存在多次调用时，Callable 才开始体现价值。',
          ],
        },
      ],
    },
    examples: {
      title: '可运行示例',
      description:
        '首页内置了六种可运行的 Callable：命令面板、底部面板、多步骤向导、颜色选择器、上下文菜单和进度通知。',
      sections: [
        {
          heading: '从返回值开始建模',
          paragraphs: [
            '先决定 UI 最终要向调用方返回什么，再定义 Props 与 Response。确认框返回 boolean，选择器返回选中项，向导可以返回整份表单。',
          ],
        },
        {
          heading: '六种模式',
          paragraphs: [],
          bullets: [
            '命令面板：返回命令 ID。',
            '底部面板：返回用户选择的操作。',
            '多步骤向导：一次 await 返回完整数据。',
            '颜色选择器：返回十六进制颜色。',
            '上下文菜单：把触发坐标作为 Call props。',
            '进度通知：用 upsert 更新同一个实例。',
          ],
        },
      ],
    },
    concepts: {
      title: '核心概念',
      description:
        '用五个视角理解 call-vue：Root 与 Stack、Call 与 End、Upsert 与 Update、Mutation flow，以及退出生命周期。',
      sections: [
        {
          heading: 'Root 与 Stack',
          paragraphs: [
            'Callable 本身就是要挂载的 Root。每次 call 都会向它拥有的 Stack 添加一个独立活动项。',
          ],
        },
        {
          heading: 'Call 与 End',
          paragraphs: [
            'call(props) 返回 Promise；组件内的 call.end(response) 或调用方的 Callable.end(...) 负责解析它。',
          ],
        },
        {
          heading: 'Upsert 与 Update',
          paragraphs: ['upsert 适合只应存在一个的 UI；update 可以定向或广播地合并 props。'],
        },
        {
          heading: '退出生命周期',
          paragraphs: [
            'end 先解析 Promise 并设置 ended，再按 unmountingDelay 延迟移除，让退出动画有时间完成。',
          ],
        },
      ],
    },
    'concepts/root-and-stack': {
      title: 'Root 与 Stack',
      description: '一个 Root 挂载一个 Callable；多次 Call 可以同时存在，并按插入顺序渲染。',
      sections: [
        {
          heading: '同一个值，两种角色',
          paragraphs: [
            'createCallable 的返回值既是 Vue 组件，也是 call、upsert、end、update 方法的命名空间。组件角色负责监听与渲染，方法负责发送调用。',
          ],
          code: '<RouterView />\n<Confirm /> <!-- 唯一 Root -->',
          lang: 'vue',
        },
        {
          heading: '并发是默认行为',
          paragraphs: [
            '普通 call 不会替换旧调用。每一项都有自己的 key、index、stackSize 和 end，关闭其中一项不会影响其他项。',
          ],
        },
        {
          heading: '唯一 Root 规则',
          paragraphs: [
            '同一个 Callable 必须恰好挂载一次。未挂载会抛出 No <Root> found!；重复挂载会在调用时抛出 Multiple instances of <Root> found!。',
          ],
        },
        {
          heading: '可以拥有任意多个 Callable',
          paragraphs: [
            '规则是每个 Callable 一个 Root，而不是整个应用一个。Confirm、Toast、Drawer、Picker 可以各自拥有独立的 Stack，并排挂载。',
          ],
        },
      ],
    },
    'concepts/call-and-end': {
      title: 'Call 与 End',
      description: 'Props 进入 Stack，Response 通过 Promise 回到调用方。',
      sections: [
        {
          heading: 'Props 进入，Response 返回',
          paragraphs: [
            'call(props) 在验证 Root 后创建 Stack 项并返回 Promise。用户组件收到自己的 props 以及注入的 call 上下文。',
          ],
          code: "const result = await Confirm.call({ message: '继续吗？' })",
        },
        {
          heading: '组件内部结束',
          paragraphs: ['call.end(response) 只结束当前项。Response 为 void 时直接调用 call.end()。'],
        },
        {
          heading: '定向与广播',
          paragraphs: [
            '把 call 返回的 Promise 作为第一个参数传入，即可精确 end/update 某一项；省略 Promise 则作用于当前全部活动项。',
          ],
          code: 'Confirm.end(firstPromise, false) // 定向\nConfirm.end(false)               // 广播',
        },
        {
          heading: '解析与移除是两回事',
          paragraphs: [
            'end 会立即解析 Promise 并把 call.ended 置为 true；真正的物理移除会等到配置的 unmountingDelay，让退出动画有时间播放，而不会拖慢调用方的异步流程。',
          ],
        },
      ],
    },
    'concepts/upsert-and-update': {
      title: 'Upsert 与 Update',
      description: '为只应存在一个的 UI 保持稳定 Promise 与组件状态。',
      sections: [
        {
          heading: '第一次创建，之后更新',
          paragraphs: [
            '第一次 upsert 创建单例项。它结束前的后续 upsert 只替换 props，并返回完全相同的 Promise。',
          ],
          code: "const a = Toast.upsert({ text: '开始' })\nconst b = Toast.upsert({ text: '进行中' })\nconsole.log(a === b) // true",
        },
        {
          heading: 'Update',
          paragraphs: [
            'update(promise, partialProps) 定向更新；update(partialProps) 广播更新。更新只浅合并 props，不重置组件内部状态。',
          ],
        },
        {
          heading: '与普通 Call 共存',
          paragraphs: [
            'upsert 单例不会替换普通 call 创建的项。两种模型共享 Root，但拥有独立生命周期。',
          ],
        },
      ],
    },
    'concepts/mutation-flow': {
      title: 'Mutation flow',
      description: '为异步提交提供 pending、重入保护与显式成功结束的可选 composable。',
      sections: [
        {
          heading: '由 composable 管理 pending',
          paragraphs: [
            'useMutationFlow 管理 pending，并在同一次异步操作中忽略重复提交。模板可以直接读取 submit.pending。',
          ],
          code: "const submit = useMutationFlow(call, toRef(props, 'mutationFn'))",
        },
        {
          heading: '由 handler 决定结果',
          paragraphs: [
            'MutationFn 只会收到 { end }：只有调用了 end，当前的 Call 才会关闭；若正常返回或抛出异常时都没有调用 end，则只清除 pending，Call 保持打开以供重试。错误不会被吞掉。',
          ],
        },
        {
          heading: '可选 handler 的兜底',
          paragraphs: [
            'handler 可选时，submit(payload).orEnd(value) 仅在没有提供 handler 时使用 value 结束。省略 orEnd 是受支持的手动关闭路径。',
          ],
        },
      ],
    },
    'concepts/exit-lifecycle': {
      title: '退出生命周期',
      description: 'Promise 立即解析，组件延迟卸载，两者各自服务于业务流程与视觉过渡。',
      sections: [
        {
          heading: '配置卸载延迟',
          paragraphs: [
            'createCallable 的第二个参数是毫秒数。让它与 CSS 退出动画时长一致，并根据 call.ended 应用离场样式。',
          ],
          code: 'const Toast = createCallable<Props, void>(ToastCard, 180)',
        },
        {
          heading: '结束时发生什么',
          paragraphs: [],
          bullets: [
            '立即解析 Promise。',
            '立即把 call.ended 设为 true。',
            '在延迟期间继续渲染组件。',
            '计时结束后只移除本次捕获的 Call。',
          ],
        },
        {
          heading: '竞态安全',
          paragraphs: [
            '广播 end 之后，即使同一个 tick 内新建了 Call，也不会被旧的计时器误删；清理始终以单个 Promise 的生命周期为边界。',
          ],
        },
        {
          heading: 'Reduced motion',
          paragraphs: [
            '呈现效果由你的组件掌控。在 prefers-reduced-motion 下禁用或缩短过渡即可，库本身仍会遵循已配置的生命周期约定。',
          ],
        },
      ],
    },
    api: {
      title: 'API 参考',
      description: '@retronew/call-vue 的全部公开方法、上下文字段、泛型与类型。',
      sections: [
        {
          heading: 'createCallable',
          paragraphs: [
            '三个泛型依次是 Call Props、Response 和 RootProps；第二个参数 unmountingDelay 默认为 0。',
          ],
          code: 'createCallable<Props, Response, RootProps>(component, unmountingDelay?)',
        },
        {
          heading: 'Callable 方法',
          paragraphs: [],
          bullets: [
            'call(props)：添加普通 Call，返回 Promise<Response>。',
            'upsert(props)：创建或更新单例 Call，返回稳定 Promise。',
            'end(...)：定向或广播结束。',
            'update(...)：定向或广播浅合并 props。',
          ],
        },
        {
          heading: 'CallContext',
          paragraphs: [
            'key 是稳定身份；end 结束当前项；ended 表示已解析但可能尚未卸载；root 是 Root props；index 与 stackSize 描述 Stack 位置。',
          ],
        },
        {
          heading: '公开类型',
          paragraphs: [
            'CallFunction、UpsertFunction、CallContext、PropsWithCall、UserComponent 与 Callable 都从主入口以具名类型导出。',
          ],
        },
      ],
    },
    'guides/typescript': {
      title: 'TypeScript 与 Vue SFC',
      description: '让 props、response、Root props 和异步组件从声明到 await 保持类型一致。',
      sections: [
        {
          heading: 'SFC 使用 PropsWithCall',
          paragraphs: [
            '在用户组件中用 PropsWithCall<Props, Response, RootProps> 声明 defineProps，vue-tsc 就能校验模板里的 call.end 返回值。',
          ],
          code: 'defineProps<PropsWithCall<Props, Response, RootProps>>()',
        },
        {
          heading: '创建时保持同一组泛型',
          paragraphs: [
            'createCallable 的泛型必须与 SFC 契约一致，这样 call 的参数和 Promise 结果会被端到端推断。传入的 Props 或 Response 一旦不匹配，都会在类型检查阶段直接失败。',
          ],
          code: 'export const Confirm = createCallable<{ message: string }, boolean>(ConfirmDialog)',
        },
        {
          heading: 'Root props',
          paragraphs: [
            '用第三个泛型声明由已挂载 Root 持有的值。它们会通过 call.root 到达每一次 Call，并随 Root 属性变化保持响应式。',
          ],
          code: 'type RootProps = { accent: string }\nexport const Toast = createCallable<ToastProps, void, RootProps>(ToastCard)',
        },
        {
          heading: 'Void 响应',
          paragraphs: [
            'void 组件内部使用 call.end() 即可，无需参数；广播结束是 Toast.end()。要从调用方定向结束某个 Promise<void>，使用 Toast.end(promise, undefined)。',
          ],
        },
        {
          heading: '异步组件',
          paragraphs: [
            "把 defineAsyncComponent(() => import('./HeavyDialog.vue')) 传给 createCallable。加载器在被某次活跃 Call 触发渲染前保持空闲；loading 与 error 组件按 Vue 原生异步组件选项提供即可。",
          ],
        },
      ],
    },
    'guides/ssr-and-async': {
      title: 'SSR、Hydration 与异步组件',
      description: '哪些操作可在服务端执行，哪些必须等到客户端 Root 挂载。',
      sections: [
        {
          heading: '创建与渲染支持 SSR',
          paragraphs: [
            'createCallable 和空 Stack 的 Root 可以安全参与 SSR。Root 计数只在客户端 onMounted 注册，不会跨请求泄漏。',
          ],
        },
        {
          heading: 'Call 是客户端行为',
          paragraphs: [
            '不要在 SSR 期间运行 call 或 upsert。它们用于响应用户交互，并要求恰好一个已经挂载的客户端 Root。',
          ],
        },
        {
          heading: 'Hydration 顺序',
          paragraphs: [
            '把 Callable 挂载在足够高的位置，确保事件处理器触发它之前 hydration 已经完成。同一个已 hydrate 应用内的点击处理器是安全的；模块级调用或更早、独立 hydrate 的 island 则不是。',
          ],
        },
        {
          heading: '懒加载',
          paragraphs: [
            '空 Stack 不会渲染异步组件，因此不会触发 loader。第一次 Call 才开始加载；后续 Call 复用 Vue 缓存的异步组件。',
          ],
          code: "const HeavyDialog = defineAsyncComponent({\n  loader: () => import('./HeavyDialog.vue'),\n  loadingComponent: LoadingDialog,\n  errorComponent: FailedDialog,\n  delay: 0,\n})\n\nexport const Editor = createCallable<EditorProps, EditorResult>(HeavyDialog)",
        },
        {
          heading: '加载期间结束',
          paragraphs: [
            '组件 chunk 仍在加载时，也可以从调用方作用域结束这个 Promise。一旦从 Stack 移除，之后姗姗来迟的 loader resolve 不会让这一项复活。',
          ],
        },
        {
          heading: '能力边界',
          paragraphs: [
            '已发布的子路径只有 @retronew/call-vue/mutation-flow；Vite HMR transform 与多预览 host 子路径尚未提供，文档也不会把上游 React 专有的入口包装成 Vue 能力。',
          ],
        },
      ],
    },
    troubleshooting: {
      title: '故障排查与 FAQ',
      description: '定位 Root 错误、未结束 Promise、更新范围和动画时序问题。',
      sections: [
        {
          heading: 'No <Root> found!',
          codeHeading: true,
          paragraphs: [
            '在首次 call 前挂载 Callable 本身——比如 <Confirm />。不要使用已经移除的 <Confirm.Root /> 别名。SSR 期间，把调用移到客户端事件中。',
          ],
        },
        {
          heading: 'Multiple instances of <Root> found!',
          codeHeading: true,
          paragraphs: [
            '同一个 Callable 出现在两个活动 Vue 树或预览中。为它保留一个 Root；不同 Callable 可以各自挂载。',
          ],
        },
        {
          heading: 'Promise 一直不结束',
          paragraphs: [
            '一个 Call 只能通过 call.end(response) 或 Callable.end(...) 结束。用本地状态或 CSS 隐藏对话框并不会解析 Promise。取消、遮罩点击、Escape 和成功路径都必须显式调用 end。',
          ],
        },
        {
          heading: '定向 end 关错了对象',
          paragraphs: [
            '保留住你想定向的那次 call 返回的 Promise。只传入 response 会触发广播重载。对于 void，用 Callable.end(promise, undefined) 定向结束，用 Callable.end() 广播。',
          ],
        },
        {
          heading: '组件里看不到声明的 Root props',
          paragraphs: [
            'Root props 通过 call.root 到达，而不是作为顶层 Call props。提供 createCallable 的第三个泛型，并把值传给已挂载的 Root。',
          ],
        },
        {
          heading: '退场动画被截断',
          paragraphs: [
            '把 createCallable 的第二个参数设置为不小于 CSS 退场时长的值，并把离场样式绑定到 call.ended。Promise 会按设计先于组件移除完成 resolve。',
          ],
        },
        {
          heading: '可以同时存在多个活跃的 call 吗？',
          paragraphs: [
            '可以。普通 call 会形成并发的 Stack；如果需要的是一个持续演进的单一实例，改用 upsert()。',
          ],
        },
        {
          heading: 'call-vue 会渲染 UI 吗？',
          paragraphs: [
            '不会。它只负责 Stack 与 Promise 的生命周期。语义、焦点管理、Teleport、样式与动画仍是你的 Vue 组件或 headless UI 层的职责。',
          ],
        },
      ],
    },
  },
  ja: {
    why: {
      title: 'なぜ call-vue？',
      description:
        'UI が呼び出し元へ答えを返すなら、ref・emit・コールバックをまたぐより await が問題の形に合います。',
      sections: [
        {
          heading: '命令的なフローと宣言的な描画',
          paragraphs: [
            '確認、入力、選択は「問い、待ち、答えを受け、続ける」という命令的な流れです。Vue は Root 内で宣言的な描画を続け、call-vue は呼び出し側だけに命令的な境界を与えます。',
          ],
          code: "const accepted = await Confirm.call({ message: '続けますか？' })\nif (accepted) await save()",
        },
        {
          heading: 'state は表示できても答えを返せない',
          paragraphs: [
            'ref は可視性を管理できますが、結果を返すには emit、コールバック、上位に保存した resolver が必要になり、質問と後続処理が離れます。call() の Promise は両方を同じハンドラーに戻します。',
          ],
        },
        {
          heading: '通常の state が適切な場合',
          paragraphs: [
            '結果を返さない局所的な表示切替なら ref が最も直接的です。再利用、戻り値、同時 Call が必要になった時に Callable が役立ちます。',
          ],
        },
      ],
    },
    examples: {
      title: '実行できるサンプル',
      description:
        'ホームにはコマンドパレット、ボトムシート、ウィザード、カラーピッカー、コンテキストメニュー、進捗トーストがあります。',
      sections: [
        {
          heading: '戻り値から設計する',
          paragraphs: [
            'まず UI が何を返すかを決め、Props と Response を定義します。確認は boolean、ピッカーは選択項目、ウィザードはフォーム全体を返せます。',
          ],
        },
        {
          heading: '六つのパターン',
          paragraphs: [],
          bullets: [
            'コマンド ID を返すメニュー。',
            '操作を返すボトムシート。',
            '一度の await で完了する複数ステップ。',
            '色を返すピッカー。',
            '座標を Props として渡すメニュー。',
            'upsert で更新する進捗通知。',
          ],
        },
      ],
    },
    concepts: {
      title: 'コアコンセプト',
      description:
        'Root と Stack、Call と End、Upsert と Update、Mutation flow、終了ライフサイクルの五つで理解します。',
      sections: [
        {
          heading: 'Root と Stack',
          paragraphs: [
            'Callable 自身がマウントする Root です。call ごとに独立した項目が Stack へ追加されます。',
          ],
        },
        {
          heading: 'Call と End',
          paragraphs: [
            'call(props) は Promise を返し、call.end(response) または Callable.end(...) が解決します。',
          ],
        },
        {
          heading: 'Upsert と Update',
          paragraphs: [
            'upsert は単一インスタンス向け、update は Props の対象指定または一括更新です。',
          ],
        },
        {
          heading: '終了ライフサイクル',
          paragraphs: [
            'end は Promise と ended を先に更新し、unmountingDelay 後に項目を削除します。',
          ],
        },
      ],
    },
    'concepts/root-and-stack': {
      title: 'Root と Stack',
      description: '一つの Root が Callable をマウントし、複数の Call を挿入順に描画します。',
      sections: [
        {
          heading: '一つの値、二つの役割',
          paragraphs: [
            'createCallable の戻り値は Vue コンポーネントであり、call・upsert・end・update の名前空間でもあります。',
          ],
          code: '<RouterView />\n<Confirm /> <!-- 唯一の Root -->',
          lang: 'vue',
        },
        {
          heading: '並行動作が標準',
          paragraphs: [
            '通常の call は既存 Call を置換しません。各項目は独自の key、index、stackSize、end を持ちます。',
          ],
        },
        {
          heading: 'Root は一つ',
          paragraphs: [
            '同じ Callable は一度だけマウントします。未マウントと複数マウントは call 時に明確なエラーになります。',
          ],
        },
        {
          heading: 'Callable はいくつでも持てる',
          paragraphs: [
            'ルールはアプリ全体に一つではなく、Callable ごとに Root が一つというものです。Confirm、Toast、Drawer、Picker はそれぞれ独立した Stack を持ち、並べてマウントできます。',
          ],
        },
      ],
    },
    'concepts/call-and-end': {
      title: 'Call と End',
      description: 'Props が Stack に入り、Response が Promise で呼び出し元へ戻ります。',
      sections: [
        {
          heading: 'Props を渡し、Response を受け取る',
          paragraphs: ['call(props) は Root を検証し、Stack 項目と型付き Promise を作ります。'],
          code: "const result = await Confirm.call({ message: '続けますか？' })",
        },
        {
          heading: 'コンポーネント内で終了',
          paragraphs: [
            'call.end(response) は現在の項目だけを終了します。Response が void なら call.end() です。',
          ],
        },
        {
          heading: '対象指定と一括処理',
          paragraphs: [
            'Promise を渡すと一つだけ、Response だけを渡すと現在の全 Call を終了します。',
          ],
          code: 'Confirm.end(firstPromise, false) // 対象指定\nConfirm.end(false)               // 一括',
        },
        {
          heading: '解決と削除は別のタイミング',
          paragraphs: [
            'end は即座に Promise を解決し call.ended を true にします。実際の削除は設定した unmountingDelay まで待つため、呼び出し元の非同期フローを遅らせずに終了アニメーションの時間を確保できます。',
          ],
        },
      ],
    },
    'concepts/upsert-and-update': {
      title: 'Upsert と Update',
      description: '単一 UI の Promise とコンポーネント状態を安定させます。',
      sections: [
        {
          heading: '最初は作成、以降は更新',
          paragraphs: [
            '最初の upsert が単一項目を作り、終了までの upsert は Props を更新して同じ Promise を返します。',
          ],
          code: "const a = Toast.upsert({ text: '開始' })\nconst b = Toast.upsert({ text: '進行中' })\nconsole.log(a === b) // true",
        },
        {
          heading: 'Update',
          paragraphs: [
            'update(promise, partialProps) は対象指定、update(partialProps) は一括です。内部状態は保持されます。',
          ],
        },
        {
          heading: '通常の Call と共存',
          paragraphs: ['upsert の単一項目は通常の call が作った項目を置換しません。'],
        },
      ],
    },
    'concepts/mutation-flow': {
      title: 'Mutation flow',
      description: '非同期送信の pending、再入防止、成功時の明示的な終了を扱う opt-in composable。',
      sections: [
        {
          heading: 'composable が pending を管理',
          paragraphs: [
            'useMutationFlow は pending を管理し、同じ非同期処理中の重複送信を無視します。テンプレートから submit.pending を直接読めます。',
          ],
          code: "const submit = useMutationFlow(call, toRef(props, 'mutationFn'))",
        },
        {
          heading: 'handler が結果を決める',
          paragraphs: [
            'MutationFn が受け取るのは { end } だけです。end を呼んだ時だけ現在の Call が閉じ、end に到達せず戻るか throw した場合は pending が解除され、再試行のために開いたままになります。エラーは握りつぶしません。',
          ],
        },
        {
          heading: 'optional handler のフォールバック',
          paragraphs: [
            'handler が optional のとき、submit(payload).orEnd(value) は handler がない場合だけ value で閉じます。orEnd を省略するのはサポートされた手動クローズ経路です。',
          ],
        },
      ],
    },
    'concepts/exit-lifecycle': {
      title: '終了ライフサイクル',
      description: 'Promise はすぐ解決し、コンポーネントはアニメーションのため遅れて削除されます。',
      sections: [
        {
          heading: '削除遅延を設定',
          paragraphs: [
            'createCallable の第二引数を CSS の終了時間に合わせ、call.ended で終了スタイルを適用します。',
          ],
          code: 'const Toast = createCallable<Props, void>(ToastCard, 180)',
        },
        {
          heading: 'end() の順序',
          paragraphs: [],
          bullets: [
            'Promise をすぐ解決。',
            'call.ended を true にする。',
            '遅延中は描画を続ける。',
            '終了対象だけをタイマー後に削除。',
          ],
        },
        {
          heading: '競合を防ぐ',
          paragraphs: [
            '一括 end と同じ tick で作られた新しい Call は、古い削除タイマーの対象になりません。',
          ],
        },
        {
          heading: 'Reduced motion',
          paragraphs: [
            '見た目はコンポーネント側が管理します。prefers-reduced-motion では遷移を無効化または短縮してください。ライブラリ自体は設定されたライフサイクル契約に従い続けます。',
          ],
        },
      ],
    },
    api: {
      title: 'API リファレンス',
      description: '@retronew/call-vue の公開メソッド、コンテキスト、ジェネリクス、型。',
      sections: [
        {
          heading: 'createCallable',
          paragraphs: [
            'ジェネリクスは Props、Response、RootProps の順です。unmountingDelay は既定で 0。',
          ],
          code: 'createCallable<Props, Response, RootProps>(component, unmountingDelay?)',
        },
        {
          heading: 'Callable メソッド',
          paragraphs: [],
          bullets: [
            'call(props)：通常 Call を追加。',
            'upsert(props)：単一 Call を作成または更新。',
            'end(...)：対象指定または一括終了。',
            'update(...)：対象指定または一括で Props を浅くマージ。',
          ],
        },
        {
          heading: 'CallContext',
          paragraphs: [
            'key、end、ended、root、index、stackSize が各 Call の公開コンテキストです。',
          ],
        },
        {
          heading: '公開型',
          paragraphs: [
            'CallFunction、UpsertFunction、CallContext、PropsWithCall、UserComponent、Callable を名前付きでエクスポートします。',
          ],
        },
      ],
    },
    'guides/typescript': {
      title: 'TypeScript と Vue SFC',
      description: 'Props、Response、RootProps、非同期コンポーネントの型を await まで保ちます。',
      sections: [
        {
          heading: 'PropsWithCall を使う',
          paragraphs: [
            'ユーザー SFC の defineProps に PropsWithCall<Props, Response, RootProps> を指定すると、vue-tsc がテンプレートの call.end まで検証します。',
          ],
          code: 'defineProps<PropsWithCall<Props, Response, RootProps>>()',
        },
        {
          heading: '作成時も同じジェネリクス',
          paragraphs: [
            'createCallable と SFC の契約を揃えると、call 引数と Promise 結果が一貫して推論されます。Props や Response が一致しなければ型チェックの時点で失敗します。',
          ],
          code: 'export const Confirm = createCallable<{ message: string }, boolean>(ConfirmDialog)',
        },
        {
          heading: 'Root props',
          paragraphs: [
            '第三のジェネリクスで、マウントされた Root が持つ値を宣言します。各 Call には call.root として渡され、Root の属性が変わると反応的に更新されます。',
          ],
          code: 'type RootProps = { accent: string }\nexport const Toast = createCallable<ToastProps, void, RootProps>(ToastCard)',
        },
        {
          heading: 'Void の戻り値',
          paragraphs: [
            'void な Callable の内部では call.end() に引数は不要です。一括終了は Toast.end()。呼び出し元から特定の Promise<void> を対象にするには Toast.end(promise, undefined) を使います。',
          ],
        },
        {
          heading: '非同期コンポーネント',
          paragraphs: [
            "defineAsyncComponent(() => import('./HeavyDialog.vue')) を createCallable に渡します。ローダーはアクティブな Call が Root に描画されるまで待機し、loading・error コンポーネントは Vue 標準の非同期コンポーネントオプションで指定します。",
          ],
        },
      ],
    },
    'guides/ssr-and-async': {
      title: 'SSR、Hydration、非同期コンポーネント',
      description: 'サーバーで安全な操作と、クライアント Root のマウントを待つ操作。',
      sections: [
        {
          heading: '作成と描画は SSR 対応',
          paragraphs: [
            'createCallable と空 Stack の Root は SSR できます。Root 登録はクライアント onMounted だけで行われ、リクエスト間で漏れません。',
          ],
        },
        {
          heading: 'Call はクライアント専用',
          paragraphs: [
            'SSR 中に call/upsert を実行しないでください。ユーザー操作から、マウント済み Root に対して呼びます。',
          ],
        },
        {
          heading: 'Hydration の順序',
          paragraphs: [
            'イベントハンドラーから呼ばれる前に hydration が完了する高さに Callable をマウントしてください。同じ hydrate 済みアプリ内のクリックハンドラーは安全です。モジュールレベルの呼び出しや、先に独立して hydrate された island からの呼び出しは安全ではありません。',
          ],
        },
        {
          heading: '遅延読み込み',
          paragraphs: [
            '空 Stack は非同期コンポーネントを描画しないため、最初の Call まで loader は動きません。以降の Call は Vue がキャッシュした非同期コンポーネントを再利用します。',
          ],
          code: "const HeavyDialog = defineAsyncComponent({\n  loader: () => import('./HeavyDialog.vue'),\n  loadingComponent: LoadingDialog,\n  errorComponent: FailedDialog,\n  delay: 0,\n})\n\nexport const Editor = createCallable<EditorProps, EditorResult>(HeavyDialog)",
        },
        {
          heading: '読み込み中の終了',
          paragraphs: [
            'コンポーネントの chunk が読み込み中でも、呼び出し元のスコープから Promise を終了できます。Stack から削除された後に loader が遅れて解決しても、その Call は復活しません。',
          ],
        },
        {
          heading: '機能境界',
          paragraphs: [
            '@retronew/call-vue/mutation-flow は公開済みです。Vite HMR transform と複数プレビュー host はまだ公開していません。React のサブパスを Vue の機能として案内しません。',
          ],
        },
      ],
    },
    troubleshooting: {
      title: 'トラブルシューティングと FAQ',
      description: 'Root エラー、未解決 Promise、更新範囲、終了アニメーションを確認します。',
      sections: [
        {
          heading: 'No <Root> found!',
          codeHeading: true,
          paragraphs: [
            '最初の call より前に、戻り値の Callable 自身（例: <Confirm />）をマウントします。削除済みの <Confirm.Root /> エイリアスは使いません。SSR 中はクライアントのイベントに呼び出しを移してください。',
          ],
        },
        {
          heading: 'Multiple instances of <Root> found!',
          codeHeading: true,
          paragraphs: [
            '同じ Callable が二つの有効な Vue ツリーやプレビューにマウントされています。一つの Callable につき Root は一つだけ残してください。別の Callable はそれぞれ独自の Root を持てます。',
          ],
        },
        {
          heading: 'Promise が解決しない',
          paragraphs: [
            'Call は call.end(response) または Callable.end(...) を通じてのみ終了します。ローカル state や CSS でダイアログを隠しても解決しません。キャンセル、背景クリック、Escape、成功の各経路ですべて明示的に end を呼んでください。',
          ],
        },
        {
          heading: '対象指定の end が違う項目を閉じる',
          paragraphs: [
            '対象にしたい call が返した Promise をそのまま保持してください。response だけを渡すと一括終了のオーバーロードが呼ばれます。void の場合、対象指定は Callable.end(promise, undefined)、一括終了は Callable.end() です。',
          ],
        },
        {
          heading: 'コンポーネントで Root props が宣言されていないように見える',
          paragraphs: [
            'Root props は call.root として届き、トップレベルの Call props ではありません。createCallable の第三ジェネリクスを指定し、その値をマウント済みの Root に渡してください。',
          ],
        },
        {
          heading: '終了アニメーションが途中で切れる',
          paragraphs: [
            'createCallable の第二引数を、CSS の終了アニメーション時間以上に設定し、離脱用のクラスを call.ended に紐づけてください。Promise は仕様どおり削除より先に解決します。',
          ],
        },
        {
          heading: '複数の Call を同時にアクティブにできますか？',
          paragraphs: [
            'できます。通常の call は並行な Stack を形成します。代わりに一つの進化するインスタンスが必要なら upsert() を使ってください。',
          ],
        },
        {
          heading: 'call-vue は UI を描画しますか？',
          paragraphs: [
            'いいえ。Stack と Promise のライフサイクルだけを管理します。意味付け、フォーカス管理、Teleport、スタイル、アニメーションはあなたの Vue コンポーネントまたは headless UI 層の責務のままです。',
          ],
        },
      ],
    },
  },
}
