export const locales = ['en', 'zh-cn', 'ja'] as const
export type Locale = (typeof locales)[number]

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  'zh-cn': '简体中文',
  ja: '日本語',
}

export function getLocaleFromPath(pathname: string): Locale {
  if (pathname === '/zh-cn' || pathname.startsWith('/zh-cn/')) return 'zh-cn'
  if (pathname === '/ja' || pathname.startsWith('/ja/')) return 'ja'
  return 'en'
}

export function stripLocale(pathname: string): string {
  const stripped = pathname.replace(/^\/(zh-cn|ja)(?=\/|$)/, '')
  return stripped || '/'
}

export function localizePath(pathname: string, locale: Locale): string {
  const base = stripLocale(pathname)
  if (locale === 'en') return base
  return base === '/' ? `/${locale}/` : `/${locale}${base}`
}

export const shellMessages = {
  en: {
    nav: {
      why: 'Why',
      examples: 'Examples',
      concepts: 'Concepts',
      troubleshooting: 'Troubleshooting',
      reference: 'Full reference ↗',
    },
    language: 'Language',
    star: 'Star ui-kit on GitHub',
    tagline: 'your component can await.',
    built: 'built with itself',
  },
  'zh-cn': {
    nav: {
      why: '为什么',
      examples: '示例',
      concepts: '核心概念',
      troubleshooting: '故障排查',
      reference: '完整参考 ↗',
    },
    language: '语言',
    star: '在 GitHub 上给 ui-kit 点个 Star',
    tagline: '让组件也可以被 await。',
    built: '由它自己构建',
  },
  ja: {
    nav: {
      why: 'なぜ',
      examples: 'サンプル',
      concepts: 'コンセプト',
      troubleshooting: 'トラブルシューティング',
      reference: '完全なリファレンス ↗',
    },
    language: '言語',
    star: 'GitHub で ui-kit にスター',
    tagline: 'コンポーネントを await する。',
    built: 'call-vue 自身で構築',
  },
} as const

export const landingMessages = {
  en: {
    hero: {
      install: 'Install',
      skill: '🤖 AI skill',
      title: 'Your component can',
      description:
        'turns any Vue component into something you can await. Confirmations, dialogs, toasts, pickers, menus — any UI that conceptually returns a value.',
      browser: 'The browser',
      component: 'Your component',
      run: 'Run it',
      awaiting: 'awaiting click…',
      same: 'Same await. Your design.',
      cancel: 'Cancel',
      continue: 'Continue',
    },
    showcase: {
      eyebrow: 'But not only confirmations',
      title: 'Any component you can await.',
      description:
        'Every interaction below calls a real workspace Callable. The badge shows exactly what its Promise resolved with.',
      try: 'Try it →',
      code: 'See code ↗',
      browse: 'Browse the examples',
      cards: [
        ['Menu', 'Command palette', '⌘K-style search. Choose a command and await the result.'],
        ['Drawer', 'Bottom sheet', 'Slides up from the bottom — resolves with the action you tap.'],
        ['Flow', 'Multi-step wizard', 'A signup flow — one await resolves with the whole form.'],
        ['Picker', 'Color picker', 'Click a swatch — resolves with the hex value.'],
        ['Menu', 'Context menu', 'Forwards the cursor position to a positioned Callable.'],
        [
          'Notification',
          'Progress toast',
          'A singleton that updates itself via upsert() as work progresses.',
        ],
      ],
    },
    flow: {
      eyebrow: 'How it lives in your app',
      title: 'Declared once. Called from anywhere.',
      description:
        'The <Confirm /> mount lives in your Vue tree — like any other component. Confirm.call(…) happens in imperative code, from anywhere. One Root, many calls.',
      tree: 'Your Vue tree',
      anywhere: 'Anywhere in your code',
      treeNote:
        'Mount it once, anywhere visible. The Root listens for calls and renders the active ones as a stack.',
      codeNote: 'The async logic owns the flow — UI is pulled in only when the logic asks.',
      pause: 'Pause',
      play: 'Play',
    },
    stack: {
      eyebrow: 'The Stack',
      title: 'Many calls. One Root. No conflict.',
      first: 'Each .call() adds an active call to the stack. The Root renders all of them at once.',
      second: "Closing one doesn't affect the others. The model is concurrent by default.",
      open: 'Open another',
      close: 'Close all',
      empty: 'click "Open another" to start a call',
    },
    advanced: {
      eyebrow: 'Mutation flow',
      title: 'Stay open on failure. Close on success.',
      first:
        'The hook tracks pending for you. Your mutationFn decides — by calling call.end() or not — whether the dialog closes.',
      second:
        'On a handled failure, pending clears and the Call stays open so the user can retry without losing their place.',
      broadcast: 'Make it fail',
      run: 'Open Save dialog',
      running: 'Dialog open…',
      code: 'See code ↗',
      empty: 'the Save dialog will appear here',
      log: 'Lifecycle log',
      logEmpty: 'open the dialog and click Save…',
    },
    cta: {
      title: 'Ready to make your components await?',
      description: 'Headless. Vue-native. SSR. No runtime dependencies beyond Vue.',
      ai: '🤖 Building with an AI assistant?',
      skill: 'What the skill does ↗',
      examples: 'Browse examples',
      star: 'Star on GitHub',
    },
  },
  'zh-cn': {
    hero: {
      install: '安装',
      skill: '🤖 AI 技能',
      title: '你的组件也可以',
      description:
        '把任意 Vue 组件变成能用 await 等到结果的交互。确认框、对话框、通知、选择器、菜单——只要界面需要向调用方返回结果，就适合用它。',
      browser: '浏览器',
      component: '你的组件',
      run: '运行',
      awaiting: '等待点击…',
      same: '同样的 await，设计完全由你决定。',
      cancel: '取消',
      continue: '继续',
    },
    showcase: {
      eyebrow: '不只适用于确认框',
      title: '任何组件都可以被 await。',
      description: '下面的每个交互都是一次真实运行的组件调用，旁边的徽标会显示它最终返回了什么。',
      try: '试一试 →',
      code: '查看代码 ↗',
      browse: '浏览全部示例',
      cards: [
        ['菜单', '命令面板', '⌘K 式的命令搜索，选择一条命令并等待结果返回。'],
        ['抽屉', '底部面板', '从屏幕底部滑出，以你点按的操作作为返回值。'],
        ['流程', '多步骤向导', '多步填写，一次 await 返回整份表单。'],
        ['选择器', '颜色选择器', '点击色块，返回对应的十六进制颜色。'],
        ['菜单', '上下文菜单', '在点击处弹出，并把鼠标位置传给负责定位的组件。'],
        ['通知', '进度 Toast', '任务推进时，用 upsert() 持续刷新同一条通知。'],
      ],
    },
    flow: {
      eyebrow: '在你的应用中如何运作',
      title: '声明一次，随处调用。',
      description:
        '<Confirm /> 像普通组件一样挂在 Vue 树中；Confirm.call(…) 则可以在任意位置的命令式代码里触发。一个 Root，承载多次调用。',
      tree: '你的 Vue 组件树',
      anywhere: '代码中的任意位置',
      treeNote: '只需挂载一次。Root 监听所有调用，并把活跃项渲染成 Stack。',
      codeNote: '流程由异步逻辑主导，UI 只在被需要时才被拉起。',
      pause: '暂停',
      play: '播放',
    },
    stack: {
      eyebrow: 'Stack',
      title: '多次调用，一个 Root，互不冲突。',
      first: '.call() 每执行一次，都会向 Stack 添加一个活动项，Root 会同时渲染它们。',
      second: '关闭其中一个不会影响其他项——并发就是默认行为。',
      open: '再打开一个',
      close: '全部关闭',
      empty: '点击“再打开一个”开始调用',
    },
    advanced: {
      eyebrow: 'Mutation flow',
      title: '失败时保持打开，成功时关闭。',
      first:
        '组合式函数会帮你维护 pending 状态；对话框是否关闭，取决于 mutationFn 有没有调用 call.end()。',
      second: '失败被妥善处理后，pending 随之清除，对话框保持打开，用户可以就地重试。',
      broadcast: '模拟失败',
      run: '打开保存对话框',
      running: '对话框已打开…',
      code: '查看代码 ↗',
      empty: '保存对话框会显示在这里',
      log: '生命周期日志',
      logEmpty: '打开对话框并点击“保存”…',
    },
    cta: {
      title: '准备好让组件也能被 await 了吗？',
      description: '不捆绑任何 UI、为 Vue 而生、支持 SSR——除 Vue 以外没有任何运行时依赖。',
      ai: '🤖 正在使用 AI 助手开发？',
      skill: '了解这个技能 ↗',
      examples: '浏览示例',
      star: '到 GitHub 点个 Star',
    },
  },
  ja: {
    hero: {
      install: 'インストール',
      skill: '🤖 AI スキル',
      title: 'コンポーネントを',
      description:
        'あらゆる Vue コンポーネントを await できる操作に変えます。確認、ダイアログ、トースト、ピッカー、メニューなど、呼び出し元へ値を返す UI に使えます。',
      browser: 'ブラウザー',
      component: 'あなたのコンポーネント',
      run: '実行',
      awaiting: 'クリック待ち…',
      same: '同じ await。デザインは自由。',
      cancel: 'キャンセル',
      continue: '続ける',
    },
    showcase: {
      eyebrow: '確認ダイアログだけではありません',
      title: 'どんなコンポーネントでも await。',
      description:
        '以下はすべて workspace の実際の Callable を呼び出します。Promise が解決した値もその場で確認できます。',
      try: '試す →',
      code: 'コードを見る ↗',
      browse: 'サンプルを見る',
      cards: [
        ['メニュー', 'コマンドパレット', '⌘K のようにコマンドを選び、結果を待ちます。'],
        ['ドロワー', 'ボトムシート', '下から開き、タップした操作を返します。'],
        ['フロー', 'マルチステップウィザード', '複数ステップの入力を一度の await で返します。'],
        ['ピッカー', 'カラーピッカー', 'スウォッチを選び、16 進カラーを返します。'],
        ['メニュー', 'コンテキストメニュー', 'ポインター座標を Callable に渡します。'],
        ['通知', '進捗トースト', 'upsert() で同じ通知を更新し続けます。'],
      ],
    },
    flow: {
      eyebrow: 'アプリ内での仕組み',
      title: '一度宣言し、どこからでも呼ぶ。',
      description:
        '<Confirm /> は通常のコンポーネントとして Vue ツリーに置き、Confirm.call(…) は任意の命令的コードから実行します。Root は一つ、Call は複数です。',
      tree: 'Vue コンポーネントツリー',
      anywhere: 'コードのどこからでも',
      treeNote: '一度だけマウントします。Root は Call を監視し、Stack として描画します。',
      codeNote: '非同期ロジックがフローを所有し、必要な時だけ UI を呼び出します。',
      pause: '一時停止',
      play: '再生',
    },
    stack: {
      eyebrow: 'Stack',
      title: '複数の Call。一つの Root。衝突なし。',
      first: '.call() ごとに Stack へ項目が追加され、Root がすべて描画します。',
      second: '一つを閉じても他には影響しません。並行動作が標準です。',
      open: 'もう一つ開く',
      close: 'すべて閉じる',
      empty: '「もう一つ開く」で Call を開始',
    },
    advanced: {
      eyebrow: 'Mutation flow',
      title: '失敗時は開いたまま。成功時に閉じる。',
      first:
        'この composable は pending を管理します。mutationFn が call.end() を呼ぶかどうかで、ダイアログを閉じるか決まります。',
      second:
        '失敗を自分で処理すると pending は解除され、Call は開いたままなのでその場で再試行できます。',
      broadcast: '失敗させる',
      run: '保存ダイアログを開く',
      running: 'ダイアログを表示中…',
      code: 'コードを見る ↗',
      empty: '保存ダイアログはここに表示されます',
      log: 'ライフサイクルログ',
      logEmpty: 'ダイアログを開き、保存を押してください…',
    },
    cta: {
      title: 'コンポーネントを await してみませんか？',
      description: 'ヘッドレス、Vue ネイティブ、SSR 対応。Vue 以外のランタイム依存はありません。',
      ai: '🤖 AI アシスタントで開発していますか？',
      skill: 'スキルの内容 ↗',
      examples: 'サンプルを見る',
      star: 'GitHub でスター',
    },
  },
} as const

export const exampleCategoryLabels: Record<Locale, Record<string, string>> = {
  en: {
    dialog: 'Dialog',
    picker: 'Picker',
    notification: 'Notification',
    menu: 'Menu',
    drawer: 'Drawer',
    overlay: 'Overlay',
    flow: 'Flow',
  },
  'zh-cn': {
    dialog: '对话框',
    picker: '选择器',
    notification: '通知',
    menu: '菜单',
    drawer: '抽屉',
    overlay: '覆盖层',
    flow: '流程',
  },
  ja: {
    dialog: 'ダイアログ',
    picker: 'ピッカー',
    notification: '通知',
    menu: 'メニュー',
    drawer: 'ドロワー',
    overlay: 'オーバーレイ',
    flow: 'フロー',
  },
}

export const exampleBehaviorLabels: Record<Locale, Record<string, string>> = {
  en: {
    update: 'Update',
    upsert: 'Upsert',
    'mutation-flow': 'Mutation flow',
    stacking: 'Stacking',
    nested: 'Nested',
    'exit-animation': 'Exit animation',
    'root-props': 'Root props',
    'end-from-caller': 'End from caller',
  },
  'zh-cn': {
    update: '更新',
    upsert: 'Upsert',
    'mutation-flow': 'Mutation flow',
    stacking: '堆叠',
    nested: '嵌套',
    'exit-animation': '退出动画',
    'root-props': 'Root 属性',
    'end-from-caller': '由调用方结束',
  },
  ja: {
    update: '更新',
    upsert: 'Upsert',
    'mutation-flow': 'Mutation flow',
    stacking: 'スタック',
    nested: 'ネスト',
    'exit-animation': '終了アニメーション',
    'root-props': 'Root props',
    'end-from-caller': '呼び出し側で終了',
  },
}

export const exampleDetailMessages: Record<
  Locale,
  {
    theCallable: string
    declaredOnce: string
    theRoot: string
    mountedOnce: string
    theCaller: string
    anywhereImperative: string
    relatedExamples: string
  }
> = {
  en: {
    theCallable: 'The Callable',
    declaredOnce: 'declared once, mounted in the Vue tree',
    theRoot: 'The Root',
    mountedOnce: 'mounted in your app tree, once',
    theCaller: 'The caller',
    anywhereImperative: 'anywhere in your app, imperative',
    relatedExamples: 'Related examples',
  },
  'zh-cn': {
    theCallable: 'Callable',
    declaredOnce: '只声明一次，挂载在 Vue 组件树中',
    theRoot: 'Root',
    mountedOnce: '在应用树中挂载一次',
    theCaller: '调用方',
    anywhereImperative: '在应用任意位置，以命令式方式调用',
    relatedExamples: '相关示例',
  },
  ja: {
    theCallable: 'Callable',
    declaredOnce: '一度だけ宣言し、Vue ツリーにマウント',
    theRoot: 'Root',
    mountedOnce: 'アプリのツリーに一度だけマウント',
    theCaller: '呼び出し側',
    anywhereImperative: 'アプリのどこからでも、命令的に呼び出す',
    relatedExamples: '関連サンプル',
  },
}

export interface ExampleTranslation {
  title: string
  description: string
}

export const exampleTranslations: Record<
  Exclude<Locale, 'en'>,
  Record<string, ExampleTranslation>
> = {
  'zh-cn': {
    'confirm-dialog': {
      title: '确认对话框',
      description: '在执行破坏性操作前请用户确认。向调用方返回一个布尔值。',
    },
    'alert-dialog': {
      title: '提示对话框',
      description:
        '只有一个按钮的通知。调用方等待用户确认；响应类型是 void——关闭这个动作本身就是返回值。',
    },
    'prompt-input': {
      title: '输入提示框',
      description:
        '就是 window.prompt()，但换成了你自己的组件。返回输入的字符串，取消则返回 null。',
    },
    'nested-dialog': {
      title: '嵌套对话框',
      description:
        '一个会打开自身的 Callable。每个打开的实例都可以在自己的模板里再次生成同一个 Callable——库会追踪整个 Stack，并独立解析每个 promise。',
    },
    'save-form': {
      title: '带 mutation flow 的保存表单',
      description:
        '一个带异步提交的对话框。useMutationFlow 负责跟踪 pending；一旦抛出异常，调用会保持打开，方便用户重试而不丢失已填内容。',
    },
    'root-context': {
      title: '感知账号信息的对话框',
      description:
        '向已登录用户问好，而调用方从不需要传递用户名。用户信息挂在 Root prop 上，每个调用通过 call.root 读取——与逐次传递的 props 完全分开。',
    },
    'optional-mutation': {
      title: '可选异步的确认框',
      description:
        '同一个 Callable，两种调用方。不传 mutationFn 时，submit().orEnd(true) 立即用兜底响应关闭；传了则由异步处理函数决定何时关闭——同一个 Confirm 同时服务两种场景。',
    },
    'progress-toast': {
      title: '进度 Toast',
      description:
        '一个会随任务进度自我更新的单例 Toast。使用 upsert()，让连续调用作用于同一个实例。',
    },
    'error-banner': {
      title: '自动消失的错误提示',
      description: '通过 setTimeout 自行关闭的短暂横幅。多次调用会堆叠——每个错误都拥有自己的横幅。',
    },
    'live-status': {
      title: '实时状态更新',
      description:
        '一个固定的状态胶囊。随着任务推进，调用方持续向这个已打开的调用推送新的 props——同一个实例，通过 promise 引用从外部更新。',
    },
    'broadcast-update': {
      title: '向所有调用广播',
      description:
        '同时堆叠着多个上传胶囊。一次不带 promise 的 Upload.update(props) 会合并进每一个打开的调用，一次连接状态变化就能同时翻转它们——同时各自保留自己的文件名。',
    },
    'item-picker': {
      title: '列表选择器',
      description: '展示一个列表并返回所选项。调用方取消返回 null；选中某一项则返回该对象本身。',
    },
    'color-picker': {
      title: '颜色选择器',
      description:
        '一个色块网格。当前值作为 prop 传入，选择器据此渲染选中态；返回所选十六进制颜色或 null。',
    },
    'context-menu': {
      title: '上下文菜单',
      description:
        '右键点击时打开的定位菜单。调用方把光标坐标传递过去，让 Callable 精确渲染在点击处。',
    },
    'command-palette': {
      title: '命令面板（⌘K）',
      description: '一个可搜索的操作列表。键盘驱动：方向键导航，Enter 执行，Esc 关闭。',
    },
    'bottom-sheet': {
      title: '底部面板',
      description: '从底部滑出、关闭时再滑回去——移动端原生的操作菜单与快捷选择模式。',
    },
    wizard: {
      title: '多步骤向导',
      description:
        '一个三步的注册流程，支持前进/后退导航。状态保存在 Callable 内部；调用方只需 await 一次即可拿到结构化的完整结果。',
    },
    'permission-prompt': {
      title: '权限授权',
      description:
        'OAuth 风格的“是否允许 X？”提示。返回 allow 或 deny——一个带标签的响应，而不是布尔值。',
    },
    'caller-resolve': {
      title: '由调用方结束',
      description:
        'call() 返回的 promise 就是这次调用的身份标识。调用方内的超时逻辑可以从外部通过 Approval.end(promise, false) 结束那个具体的调用——无需在对话框内点击任何按钮即可给出响应。',
    },
    'side-drawer': {
      title: '设置抽屉',
      description:
        '从边缘滑入、关闭时再滑出的面板。初始设置以纯数据形式通过 props 传入；Callable 自己管理表单状态，并返回保存后的值，用户关闭则返回 null。',
    },
    'image-lightbox': {
      title: '图片灯箱',
      description: '点击缩略图，以覆盖层形式打开原图。点击背景或按 Escape 可关闭 Callable。',
    },
  },
  ja: {
    'confirm-dialog': {
      title: '確認ダイアログ',
      description:
        '破壊的な操作を実行する前にユーザーへ確認します。呼び出し側には真偽値が返ります。',
    },
    'alert-dialog': {
      title: 'アラートダイアログ',
      description:
        'ボタンが一つだけの通知です。呼び出し側は確認を待ちます。レスポンスの型は void——閉じるという行為自体が値になります。',
    },
    'prompt-input': {
      title: '入力プロンプト',
      description:
        'window.prompt() を自分のコンポーネントに置き換えたものです。入力された文字列を返し、キャンセル時は null を返します。',
    },
    'nested-dialog': {
      title: 'ネストしたダイアログ',
      description:
        '自分自身を開く Callable です。開いている各インスタンスは自身のテンプレートの中から同じ Callable を生成でき、ライブラリが Stack を追跡してそれぞれの promise を独立して解決します。',
    },
    'save-form': {
      title: 'Mutation flow を使った保存フォーム',
      description:
        '非同期送信を伴うダイアログです。useMutationFlow が pending を管理し、例外が投げられると Call は開いたままになるので、ユーザーは入力を失わずに再試行できます。',
    },
    'root-context': {
      title: 'アカウント情報を反映するダイアログ',
      description:
        '呼び出し側がユーザー名を渡さなくても、ログイン中のユーザーに挨拶するダイアログです。ユーザー情報は Root prop に置かれ、各 Call は call.root から参照します——毎回渡す props とは別の仕組みです。',
    },
    'optional-mutation': {
      title: '任意の非同期処理を持つ確認',
      description:
        '一つの Callable を二種類の呼び出し側が使います。mutationFn を省略すると submit().orEnd(true) が即座にフォールバック値で閉じ、渡した場合は非同期ハンドラーが閉じるタイミングを決めます——同じ Confirm が両方に対応します。',
    },
    'progress-toast': {
      title: '進捗トースト',
      description:
        '作業の進行に合わせて自身を更新する単一のトーストです。upsert() を使い、連続した呼び出しが同じインスタンスを更新します。',
    },
    'error-banner': {
      title: '自動的に消えるエラー',
      description:
        'setTimeout で自ら閉じる一時的なバナーです。複数回呼び出すと積み重なり、エラーごとに専用のバナーが表示されます。',
    },
    'live-status': {
      title: 'ライブステータス更新',
      description:
        '固定表示のステータスピルです。作業が進むたびに、呼び出し側が開いている Call へ新しい props を送り込みます——同じインスタンスが、promise の参照を通じて外部から更新されます。',
    },
    'broadcast-update': {
      title: 'すべての Call へブロードキャスト',
      description:
        '複数のアップロードピルが同時に積み重なっています。promise を渡さない Upload.update(props) は開いているすべての Call にマージされるので、一つの接続状態の変化ですべてを同時に切り替えられます——それぞれが自分のファイル名は保持します。',
    },
    'item-picker': {
      title: 'アイテムピッカー',
      description:
        'リストを表示し、選ばれたアイテムを返します。呼び出し側でのキャンセルは null を返し、選択時はそのオブジェクト自体を返します。',
    },
    'color-picker': {
      title: 'カラーピッカー',
      description:
        'スウォッチのグリッドです。現在の値が prop として渡され、ピッカーはそれを選択状態として表示します。選ばれた 16 進カラー、または null を返します。',
    },
    'context-menu': {
      title: 'コンテキストメニュー',
      description:
        '右クリックで開く、位置指定されたメニューです。呼び出し側がカーソル座標を渡すことで、Callable がクリックした位置にレンダリングされます。',
    },
    'command-palette': {
      title: 'コマンドパレット（⌘K）',
      description:
        '検索可能な操作リストです。キーボード操作に対応：矢印キーで移動、Enter で実行、Esc で閉じます。',
    },
    'bottom-sheet': {
      title: 'ボトムシート',
      description:
        '下から現れ、閉じるときは下へ滑って戻ります——モバイルネイティブなアクションメニューやクイック選択のパターンです。',
    },
    wizard: {
      title: 'マルチステップウィザード',
      description:
        '前後のナビゲーションを備えた 3 ステップのサインアップフローです。状態は Callable の内部で保持され、呼び出し側は一度の await で構造化されたレスポンスを受け取ります。',
    },
    'permission-prompt': {
      title: '権限の同意',
      description:
        'OAuth 風の「X を許可しますか？」というプロンプトです。真偽値ではなく、allow か deny というタグ付きレスポンスを返します。',
    },
    'caller-resolve': {
      title: '呼び出し側からの解決',
      description:
        'call() が返す promise がその Call の識別子そのものです。呼び出し側のタイムアウト処理は、Approval.end(promise, false) によって外部からその特定の Call を確定できます——ダイアログ内でクリックすることなくレスポンスを届けられます。',
    },
    'side-drawer': {
      title: '設定ドロワー',
      description:
        '端から現れ、閉じるときはまた端へ戻るパネルです。初期設定はただのデータとして props で渡され、Callable 自身がフォームの状態を管理し、保存された値を返します。ユーザーが閉じた場合は null を返します。',
    },
    'image-lightbox': {
      title: '画像ライトボックス',
      description:
        'サムネイルをクリックすると、元の画像がオーバーレイとして開きます。背景クリックまたは Escape キーで Callable が閉じます。',
    },
  },
}
