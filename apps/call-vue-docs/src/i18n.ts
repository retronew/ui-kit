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
    nav: { why: 'Why', examples: 'Examples', concepts: 'Concepts', reference: 'Full reference' },
    language: 'Language',
    star: 'Star ui-kit on GitHub',
    tagline: 'your component can await.',
    built: 'built with itself',
  },
  'zh-cn': {
    nav: { why: '为什么', examples: '示例', concepts: '核心概念', reference: '完整参考' },
    language: '语言',
    star: '在 GitHub 为 ui-kit 点赞',
    tagline: '让组件也可以被 await。',
    built: '由它自己构建',
  },
  ja: {
    nav: {
      why: 'なぜ',
      examples: 'サンプル',
      concepts: 'コンセプト',
      reference: 'API リファレンス',
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
      eyebrow: 'Upsert & update',
      title: 'Create once. Keep the same call current.',
      first:
        'upsert() creates a singleton call, then returns the same Promise while it stays active. update() changes its props without replacing component state.',
      second:
        "This occupies the same advanced slot as react-call's mutation-flow demo, but documents a capability call-vue actually ships today.",
      broadcast: 'Use broadcast update',
      run: 'Run progress call',
      running: 'Running…',
      code: 'See code ↗',
      empty: 'the progress call will appear here',
      log: 'Lifecycle log',
      logEmpty: 'run the demo to inspect its lifecycle…',
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
        '把任意 Vue 组件变成可以 await 的交互。确认框、对话框、通知、选择器、菜单——只要 UI 会向调用方返回结果，都可以这样使用。',
      browser: '浏览器原生',
      component: '你的组件',
      run: '运行',
      awaiting: '等待点击…',
      same: '同样的 await，由你掌控设计。',
      cancel: '取消',
      continue: '继续',
    },
    showcase: {
      eyebrow: '不只适用于确认框',
      title: '任何组件都可以被 await。',
      description:
        '下面每个交互都调用 workspace 中真实的 Callable，按钮下方会显示 Promise 的实际返回值。',
      try: '试一试 →',
      code: '查看代码 ↗',
      browse: '浏览全部示例',
      cards: [
        ['菜单', '命令面板', '像 ⌘K 一样搜索命令，并等待用户选择。'],
        ['抽屉', '底部面板', '从底部滑出，并返回用户点击的操作。'],
        ['流程', '多步骤向导', '经过多个步骤后，用一次 await 返回整份表单。'],
        ['选择器', '颜色选择器', '点击色块，返回对应的十六进制颜色。'],
        ['菜单', '上下文菜单', '把光标坐标作为参数传给 Callable。'],
        ['通知', '进度 Toast', '使用 upsert() 持续更新同一个通知。'],
      ],
    },
    flow: {
      eyebrow: '它如何存在于应用中',
      title: '声明一次，随处调用。',
      description:
        '<Confirm /> 像普通组件一样挂在 Vue 树中；Confirm.call(…) 可以在任意命令式代码里触发。一个 Root，承载多次调用。',
      tree: '你的 Vue 组件树',
      anywhere: '代码中的任意位置',
      treeNote: '只挂载一次。Root 监听调用，并把活动项按 Stack 渲染。',
      codeNote: '异步业务逻辑掌控流程，只有在需要时才拉起 UI。',
      pause: '暂停',
      play: '播放',
    },
    stack: {
      eyebrow: '调用栈',
      title: '多次调用，一个 Root，互不冲突。',
      first: '每次 .call() 都向 Stack 添加一个活动项，Root 会同时渲染它们。',
      second: '关闭其中一个不会影响其他项；并发是默认模型。',
      open: '再打开一个',
      close: '全部关闭',
      empty: '点击“再打开一个”开始调用',
    },
    advanced: {
      eyebrow: 'Upsert 与 Update',
      title: '只创建一次，让同一个调用保持最新。',
      first:
        'upsert() 创建单例调用，并在活动期间返回同一个 Promise；update() 只修改 props，不替换组件状态。',
      second:
        '上游此处展示 mutation flow；call-vue 尚未发布该 helper，因此这里展示当前真实支持的高级能力。',
      broadcast: '使用广播更新',
      run: '运行进度调用',
      running: '运行中…',
      code: '查看代码 ↗',
      empty: '进度调用会显示在这里',
      log: '生命周期日志',
      logEmpty: '运行示例以查看生命周期…',
    },
    cta: {
      title: '准备好让组件也能被 await 了吗？',
      description: 'Headless、Vue 原生、支持 SSR，除 Vue 外无运行时依赖。',
      ai: '🤖 正在使用 AI 助手开发？',
      skill: '了解这个技能 ↗',
      examples: '浏览示例',
      star: '在 GitHub 点赞',
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
        ['フロー', 'マルチステップ', '複数ステップの入力を一度の await で返します。'],
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
      eyebrow: 'Upsert と Update',
      title: '一度作り、同じ Call を最新に保つ。',
      first:
        'upsert() は単一の Call を作り、アクティブな間は同じ Promise を返します。update() はコンポーネント状態を保ったまま props を変更します。',
      second:
        '上流の同位置は mutation flow ですが、call-vue では未公開のため、現在実際に使える高度な機能を示します。',
      broadcast: '一括更新を使う',
      run: '進捗 Call を実行',
      running: '実行中…',
      code: 'コードを見る ↗',
      empty: '進捗 Call はここに表示されます',
      log: 'ライフサイクルログ',
      logEmpty: '実行してライフサイクルを確認…',
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
