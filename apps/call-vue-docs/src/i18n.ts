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
    nav: { why: '为什么', examples: '示例', concepts: '核心概念', reference: 'API 参考' },
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
      browser: '浏览器原生',
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
