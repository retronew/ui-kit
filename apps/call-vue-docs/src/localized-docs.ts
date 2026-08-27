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
        '当界面需要把结果交回发起它的那段代码时，用一句 await 直接等结果，比隔着组件层层传 ref、emit 和回调更直接。',
      sections: [
        {
          heading: '命令式流程与声明式渲染',
          paragraphs: [
            '确认框、输入框和选择器的本质都是同一件事：“提问 → 等待 → 拿到答案 → 继续”。界面的渲染依然交给 Vue 声明式地完成；call-vue 补上的，是让调用方能够以命令式的方式拿到答案。',
          ],
          code: "const accepted = await Confirm.call({ message: '继续吗？' })\nif (accepted) await save()",
        },
        {
          heading: '状态能显示界面，却不能返回答案',
          paragraphs: [
            '用 ref 可以控制对话框显示与否，但用户给出的答案却很难直接传回调用处：结果往往要经 emit 抛给父组件，或靠事先存好的一个 resolve 函数接力。“提问”和“根据答案行事”就这样被拆到了不同的地方。而 call() 返回的 Promise 能把它们重新放回同一个函数里。',
          ],
        },
        {
          heading: '什么时候仍应使用普通状态',
          paragraphs: [
            '如果只是本地的显示/隐藏、不需要向调用方返回任何值，用 ref 更简单。只有当交互需要返回结果、要在多处复用，或者可能同时存在多个实例时，才轮到 Callable 登场。',
          ],
        },
      ],
    },
    examples: {
      title: '可运行示例',
      description:
        '首页内置了六种可运行的组件调用：命令面板、底部面板、多步骤向导、颜色选择器、上下文菜单和进度通知。',
      sections: [
        {
          heading: '先想清楚要返回什么',
          paragraphs: [
            '先确定界面最终要交还给调用方什么，再去定义 Props 和 Response：确认框返回 true/false，颜色选择器返回选中的色值，向导可以一次返回整份表单。',
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
            '上下文菜单：把点击位置的坐标作为 props 传入。',
            '进度通知：用 upsert 刷新同一个通知实例。',
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
            'createCallable 创建出来的 Callable，本身就是要挂载的根组件（Root）。每执行一次 call()，都会往它自己的调用堆叠（Stack）里压入一个独立条目。',
          ],
        },
        {
          heading: 'Call 与 End',
          paragraphs: [
            'call(props) 会立刻返回一个 Promise，等着被“结束”：组件内部可以用 call.end(response) 收尾，调用方也可以用 Callable.end(...) 直接替它收尾。',
          ],
        },
        {
          heading: 'Upsert 与 Update',
          paragraphs: [
            'upsert 用于那种全页只应存在一份的 UI（比如通知）；update 则可以把新的 props 定向合并到某一次调用，或广播给当前全部调用。',
          ],
        },
        {
          heading: '退出生命周期',
          paragraphs: [
            '调用 end 时，Promise 立即敲定、ended 标记立即置真；组件则会按 unmountingDelay 推迟一段时间再移除，给退出动画留足时间。',
          ],
        },
      ],
    },
    'concepts/root-and-stack': {
      title: 'Root 与 Stack',
      description:
        '一个根组件（Root）挂载一个 Callable；多次 Call 可以同时存在，并按先后顺序渲染。',
      sections: [
        {
          heading: '同一个值，两种角色',
          paragraphs: [
            'createCallable 返回的同一个对象身兼两职：作为 Vue 组件，它负责挂载和渲染；作为方法集合，它提供 call、upsert、end、update 这些用来发起和控制调用的入口。',
          ],
          code: '<RouterView />\n<Confirm /> <!-- 唯一 Root -->',
          lang: 'vue',
        },
        {
          heading: '并发是默认行为',
          paragraphs: [
            '普通的 call() 不会顶掉旧调用。每个条目都带有自己的 key、index、stackSize 和 end，关闭其中一个，其余照常工作。',
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
            'call(props) 会先确认 Root 已挂载，然后创建一个 Stack 条目并返回 Promise。你的组件既能拿到自己的 props，也能拿到注入的 call 上下文。',
          ],
          code: "const result = await Confirm.call({ message: '继续吗？' })",
        },
        {
          heading: '组件内部结束',
          paragraphs: [
            'call.end(response) 只结束当前这一次调用。当 Response 为 void（不需要返回值）时，直接调用无参数的 call.end() 即可。',
          ],
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
            'end 会立即敲定 Promise 并把 call.ended 置为 true；组件真正的移除会等到配置的 unmountingDelay 之后。退场动画因此有足够的时间播完，也不会拖慢调用方的异步流程。',
          ],
        },
      ],
    },
    'concepts/upsert-and-update': {
      title: 'Upsert 与 Update',
      description: '给全页只应存在一份的 UI，稳稳守住同一个 Promise 和组件状态。',
      sections: [
        {
          heading: '第一次创建，之后更新',
          paragraphs: [
            '第一次 upsert 会创建这条单例条目。在它结束之前，后续的 upsert 只会替换 props，并且返回的是同一个 Promise。',
          ],
          code: "const a = Toast.upsert({ text: '开始' })\nconst b = Toast.upsert({ text: '进行中' })\nconsole.log(a === b) // true",
        },
        {
          heading: 'Update',
          paragraphs: [
            'update(promise, partialProps) 只更新指定的一次调用；update(partialProps) 则广播给当前全部调用。更新只对 props 做浅合并，不会打乱组件的内部状态。',
          ],
        },
        {
          heading: '与普通 Call 共存',
          paragraphs: [
            'upsert 的单例条目不会顶替普通 call() 创建的条目。两种模型共享同一个 Root，但各自拥有独立的生命周期。',
          ],
        },
      ],
    },
    'concepts/mutation-flow': {
      title: 'Mutation flow（异步提交辅助）',
      description:
        '一个可选启用的组合式函数：为异步提交提供 pending 状态跟踪、防止重复提交，以及“成功才算结束”的明确语义。',
      sections: [
        {
          heading: 'pending 由组合式函数代管',
          paragraphs: [
            'useMutationFlow 替你跟踪 pending，并自动忽略同一次操作里的重复提交。模板里可以直接读 submit.pending 来展示加载状态。',
          ],
          code: "const submit = useMutationFlow(call, toRef(props, 'mutationFn'))",
        },
        {
          heading: '要不要关闭，由你的函数说了算',
          paragraphs: [
            '传入的 mutationFn 只会收到一个 { end }。只有调用了 end，当前的对话框才会真正关闭；如果函数正常返回或抛出了异常却始终没有调用 end，库只会清掉 pending、让对话框保持打开，方便用户就地重试——错误也原样抛出，不会被悄悄吞掉。',
          ],
        },
        {
          heading: '没提供 handler 时怎么办',
          paragraphs: [
            '如果你的处理函数是可选的，可以用 submit(payload).orEnd(value)：只在确实没传 handler 的情况下，才用 value 结束这一次调用。不写 orEnd、之后自己手动调用 end 也是完全受支持的做法。',
          ],
        },
      ],
    },
    'concepts/exit-lifecycle': {
      title: '退出生命周期',
      description: 'Promise 立即敲定，组件延迟卸载——前者服务于业务流程，后者服务于视觉过渡。',
      sections: [
        {
          heading: '配置卸载延迟',
          paragraphs: [
            'createCallable 的第二个参数是毫秒数。把它设成与 CSS 退出动画一致的时长，再把离场样式绑定到 call.ended 上即可。',
          ],
          code: 'const Toast = createCallable<Props, void>(ToastCard, 180)',
        },
        {
          heading: '结束时发生什么',
          paragraphs: [],
          bullets: [
            'Promise 立即敲定。',
            'call.ended 立即置为 true。',
            '延迟期间组件继续渲染。',
            '计时结束后，只移除触发这次计时的那一个条目。',
          ],
        },
        {
          heading: '竞态安全',
          paragraphs: [
            '广播 end 之后，即使在同一个 tick 里新建了 Call，也不会被旧的计时器误删；每次清理都只针对自己的那一次 Promise。',
          ],
        },
        {
          heading: 'Reduced motion（减弱动画）',
          paragraphs: [
            '视觉效果由你自己的组件掌控：在 prefers-reduced-motion 下禁用或缩短过渡即可。库的生命周期不受影响，仍按配置正常走完。',
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
            'key 是这一次调用的唯一标识；end() 用来结束当前这条调用；ended 在 Promise 已敲定、但组件还没移除时为 true；root 是挂在根组件上的属性；index 和 stackSize 则说明这次调用在 Stack 里的位置。',
          ],
        },
        {
          heading: '公开类型',
          paragraphs: [
            'CallFunction、UpsertFunction、CallContext、PropsWithCall、UserComponent 与 Callable 都从主入口直接具名导出。',
          ],
        },
      ],
    },
    'guides/typescript': {
      title: 'TypeScript 与 Vue SFC',
      description: '让 props、response、Root props 和异步组件从声明到 await 全程类型一致。',
      sections: [
        {
          heading: 'SFC 使用 PropsWithCall',
          paragraphs: [
            '在业务组件里，用 PropsWithCall<Props, Response, RootProps> 来声明 defineProps，vue-tsc 就能连模板里的 call.end 一起做类型校验。',
          ],
          code: 'defineProps<PropsWithCall<Props, Response, RootProps>>()',
        },
        {
          heading: '创建时保持同一组泛型',
          paragraphs: [
            'createCallable 的泛型必须和 SFC 的约定完全一致，这样 call() 的参数和 Promise 结果才能被端到端地推断出来。只要 Props 或 Response 对不上，类型检查阶段就会直接报错。',
          ],
          code: 'export const Confirm = createCallable<{ message: string }, boolean>(ConfirmDialog)',
        },
        {
          heading: 'Root props',
          paragraphs: [
            '第三个泛型用来声明挂载在根上的共享数据。这些值会以 call.root 的形式送达每一次调用，并且当根属性变化时会响应式地跟着更新。',
          ],
          code: 'type RootProps = { accent: string }\nexport const Toast = createCallable<ToastProps, void, RootProps>(ToastCard)',
        },
        {
          heading: 'Void 响应',
          paragraphs: [
            'Response 为 void 时，组件内部直接调用无参数的 call.end() 就行；在调用方广播结束则写 Toast.end()。若要从外部精确结束其中某一次（Promise<void>），写 Toast.end(promise, undefined)。',
          ],
        },
        {
          heading: '异步组件',
          paragraphs: [
            "把 defineAsyncComponent(() => import('./HeavyDialog.vue')) 的产物直接交给 createCallable 即可。加载函数只有在某次活跃的调用真正要把这个组件渲染出来时才会执行；loading 与 error 组件沿用 Vue 异步组件的原生选项来配置。",
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
            '把 Callable 挂得尽量靠外，确保用户点下按钮之前页面已经完成 hydration。在已完成水合的应用内部，由点击处理器发起的调用是安全的；而在模块顶层直接调用，或从更早完成水合的独立 island 中调用，都不安全。',
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
            '即使组件的代码包还在下载，你也可以照常从调用方结束这个 Promise。条目一旦离开 Stack，哪怕加载稍后才完成，它也不会再被渲染出来。',
          ],
        },
        {
          heading: '能力边界',
          paragraphs: [
            '目前发布的子路径入口只有 @retronew/call-vue/mutation-flow。Vite HMR transform 和多预览 host 等能力尚未发布，我们也不会把上游 React 版专有的东西包装成 Vue 的功能来介绍。',
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
            '第一次 call() 之前，必须先把 Callable 自身挂载出来——比如 <Confirm />。已废弃的 <Confirm.Root /> 写法不要再用了。SSR 场景下，请把调用挪到客户端事件里触发。',
          ],
        },
        {
          heading: 'Multiple instances of <Root> found!',
          codeHeading: true,
          paragraphs: [
            '同一个 Callable 被挂到了两棵活跃的 Vue 树（或两个预览环境）里。一个 Callable 只保留一个 Root；不同的 Callable 可以各自拥有自己的 Root。',
          ],
        },
        {
          heading: 'Promise 一直不结束',
          paragraphs: [
            '一次 Call 只能通过 call.end(response) 或 Callable.end(...) 结束。用本地状态或 CSS 把对话框藏起来并不会让 Promise 敲定。取消、遮罩点击、Escape 和成功路径，全都要显式调用 end。',
          ],
        },
        {
          heading: '定向 end 关错了对象',
          paragraphs: [
            '想精确结束哪一次调用，就把它当时返回的那个 Promise 存下来。如果只传 response，就会走到广播的分支。Response 为 void 时同理：Callable.end(promise, undefined) 是定点结束，Callable.end() 是广播。',
          ],
        },
        {
          heading: '组件里看不到声明的 Root props',
          paragraphs: [
            'Root 级别的数据要通过 call.root 才能读到，它不会混进普通的调用 props。请给 createCallable 加上第三个泛型，并把数据绑到已挂载的根组件上。',
          ],
        },
        {
          heading: '退场动画被截断',
          paragraphs: [
            '把 createCallable 的第二个参数设为不小于 CSS 退场动画时长的毫秒数，并把离场样式绑定到 call.ended。放心，Promise 仍会先于组件移除而敲定，不会因此变慢。',
          ],
        },
        {
          heading: '可以同时存在多个活跃的 call 吗？',
          paragraphs: [
            '可以。普通的 call() 会形成并发的 Stack；如果你想要的其实是“一个随进度不断变化的实例”，那就改用 upsert()。',
          ],
        },
        {
          heading: 'call-vue 会渲染 UI 吗？',
          paragraphs: [
            '不会。call-vue 只管两件事：调用的进出（Stack）和结果的交付（Promise）。至于可访问性语义、焦点管理、Teleport、样式和动画，仍然是你的 Vue 组件——或你选用的 headless UI 方案——的责任。',
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
