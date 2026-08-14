import { createI18n } from 'vue-i18n'

export type Locale = 'en' | 'zh-CN'

const LOCALE_STORAGE_KEY = 'vue-hot-toast:locale'

const messages = {
  en: {
    codeBlock: {
      copyCode: 'Copy code',
      copied: 'Copied',
    },
    toastBar: {
      dismiss: 'Dismiss',
    },
    topbar: {
      theme: 'Theme preference',
      themeCycle: 'Current theme: {current}. Switch to {next}.',
      themeDark: 'Dark',
      themeLight: 'Light',
      themeSystem: 'System',
      toggleTheme: 'Toggle theme',
      switchLanguage: 'Switch language',
      easterEgg: 'Click for a surprise',
    },
    hero: {
      subtitle: 'Headless notifications for Vue.js',
      renderToast: 'Render a toast',
      documentation: 'Documentation',
    },
    sections: {
      install: {
        title: 'Installation',
        desc: 'Get the package from npm.',
      },
      usage: {
        title: 'Usage',
        desc: 'Render the headless toaster outlet in your app root, then fire toasts from anywhere.',
      },
      types: {
        title: 'Types',
        desc: 'Every toast type ships with its own icon and semantics. Click a button to render it live.',
      },
      position: {
        title: 'Position',
        desc: 'Toasts can be anchored to any corner or edge. Swipe direction adapts to the position.',
      },
      stacking: {
        title: 'Stacking',
        desc: 'Beyond the active limit, toasts queue up or fold into a pile. Hover the stack to expand it.',
      },
      duration: {
        title: 'Duration',
        desc: 'How long a toast stays on screen before auto-dismissing. Applies to the next toasts.',
      },
      animation: {
        title: 'Animation speed',
        desc: 'How fast toasts slide, stack, and fade — set via a single CSS custom property.',
      },
      pop: {
        title: 'Pop motion',
        desc: 'A more pronounced entrance/exit with a bigger scale pop and its own easing curves — still driven by the animation speed above.',
        on: 'On',
        off: 'Off',
        perToast: 'per-toast override',
        perToastDemo: 'Fire a toast with the opposite pop setting',
      },
      dismiss: {
        title: 'Dismiss gestures',
        desc: 'Swipe-to-dismiss and Escape-to-dismiss are both on by default — turn either off globally below, or lock an individual toast via meta.',
        swipe: 'Swipe (global default)',
        escape: 'Escape (global default)',
        perToast: 'per-toast override',
        perToastDemo: 'Fire an undismissable toast',
        on: 'On',
        off: 'Off',
      },
      offset: {
        title: 'Viewport offset',
        desc: 'The core-managed gap between the toast stack and the screen edge.',
      },
      dedup: {
        title: 'Deduplication',
        desc: 'Identical errors shake and reset instead of stacking; distinct ones replace in place.',
      },
    },
    types: {
      success: 'Success',
      error: 'Error',
      info: 'Info',
      warning: 'Warning',
      loading: 'Loading',
      promise: 'Promise',
      custom: 'Custom',
      persistent: 'Persistent',
      countdown: 'Countdown',
      action: 'Action',
      batch: 'Batch (3×)',
    },
    stacking: {
      queue: 'Queue',
      stack: 'Stack',
      max: 'max',
      align: 'align',
      centerAlign: 'Center',
      centerAlignHint:
        'Requires all toasts to share one width — otherwise cards still look misaligned.',
      direction: 'direction',
    },
    position: {
      useGlobal: 'Use Global',
      override: 'per-toast override',
    },
    dedup: {
      sameError: 'Same Error ×5',
      differentErrors: 'Different Errors',
      singleError: 'Single Error',
      actions: 'actions',
      dismissAll: 'Dismiss All',
    },
    positions: {
      'top-left': 'Top Left',
      'top-center': 'Top Center',
      'top-right': 'Top Right',
      'bottom-left': 'Bottom Left',
      'bottom-center': 'Bottom Center',
      'bottom-right': 'Bottom Right',
    },
    footer: {
      builtWith: 'Built with Vue',
    },
  },
  'zh-CN': {
    codeBlock: {
      copyCode: '复制代码',
      copied: '已复制',
    },
    toastBar: {
      dismiss: '关闭',
    },
    topbar: {
      theme: '主题偏好',
      themeCycle: '当前主题：{current}。切换到{next}。',
      themeDark: '深色',
      themeLight: '浅色',
      themeSystem: '跟随系统',
      toggleTheme: '切换主题',
      switchLanguage: '切换语言',
      easterEgg: '点击有惊喜',
    },
    hero: {
      subtitle: '为 Vue.js 打造的无头通知',
      renderToast: '渲染一个 Toast',
      documentation: '文档',
    },
    sections: {
      install: {
        title: '安装',
        desc: '从 npm 获取本包。',
      },
      usage: {
        title: '用法',
        desc: '在应用根部渲染无头 ToasterProvider 出口，然后随处触发 Toast。',
      },
      types: {
        title: '类型',
        desc: '每种 Toast 类型都带有自己的图标与语义，点击按钮即可实时渲染。',
      },
      position: {
        title: '位置',
        desc: 'Toast 可以锚定到任意角落或边缘，滑出方向随位置自适应。',
      },
      stacking: {
        title: '堆叠',
        desc: '超出活跃上限的 Toast 会排队等待或折叠成一摞，悬停即可展开。',
      },
      duration: {
        title: '时长',
        desc: 'Toast 自动关闭前的停留时间，作用于下一个 Toast。',
      },
      animation: {
        title: '动画速度',
        desc: 'Toast 滑入、堆叠与淡出的快慢，通过一个 CSS 自定义属性统一控制。',
      },
      pop: {
        title: '弹入效果',
        desc: '更明显的进/离场：缩放幅度更大、进出场缓动曲线不同，节奏仍然由上面的动画速度控制。',
        on: '开启',
        off: '关闭',
        perToast: '单条覆盖',
        perToastDemo: '发一条弹入效果相反的 toast',
      },
      dismiss: {
        title: '关闭手势',
        desc: '滑动关闭与 Escape 关闭默认都是开启的，下面是全局开关；也可以通过 meta 单独锁定某一条 toast。',
        swipe: '滑动关闭（全局默认）',
        escape: 'Escape 关闭（全局默认）',
        perToast: '单条覆盖',
        perToastDemo: '发一条无法关闭的 toast',
        on: '开启',
        off: '关闭',
      },
      offset: {
        title: '边距偏移',
        desc: '由 core 管理的 Toast 堆叠区域与屏幕边缘间距。',
      },
      dedup: {
        title: '去重',
        desc: '相同错误会震动并重置计时，而非重复堆叠；不同错误则原地替换。',
      },
    },
    types: {
      success: '成功',
      error: '错误',
      info: '信息',
      warning: '警告',
      loading: '加载中',
      promise: 'Promise',
      custom: 'Custom',
      persistent: '常驻',
      countdown: '倒计时',
      action: '操作按钮',
      batch: '批量 (3×)',
    },
    stacking: {
      queue: '排队',
      stack: '堆叠',
      max: '上限',
      align: '对齐',
      centerAlign: '居中',
      centerAlignHint: '需要所有 toast 宽度一致，否则宽度不同仍会错位。',
      direction: '方向',
    },
    position: {
      useGlobal: '使用全局',
      override: '单条覆盖',
    },
    dedup: {
      sameError: '相同错误 ×5',
      differentErrors: '不同错误',
      singleError: '单个错误',
      actions: '操作',
      dismissAll: '全部关闭',
    },
    positions: {
      'top-left': '左上',
      'top-center': '顶部居中',
      'top-right': '右上',
      'bottom-left': '左下',
      'bottom-center': '底部居中',
      'bottom-right': '右下',
    },
    footer: {
      builtWith: '使用 Vue 构建',
    },
  },
}

function initialLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY) === 'zh-CN' ? 'zh-CN' : 'en'
  } catch {
    return 'en'
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale(),
  fallbackLocale: 'en',
  messages,
})

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLocale()
}

/** Switch locale, persisting the choice and syncing the `<html lang>` attr. */
export function setLocale(locale: Locale) {
  i18n.global.locale.value = locale
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // Locale switching still works when persistence is unavailable.
  }
  document.documentElement.lang = locale
}
