import { onMounted, onUnmounted } from 'vue'

export interface UseToastHotkeyOptions {
  /** Modifier + key combo that focuses the frontmost toast. Modifiers: `'Alt' | 'Control' | 'Meta' | 'Shift'`; the last entry is the plain key (case-insensitive). Default `['Alt', 't']`. */
  keys?: string[]
}

const MODIFIERS = new Set(['Alt', 'Control', 'Meta', 'Shift'])

/**
 * Global keyboard shortcut that focuses the frontmost toast (first
 * `[data-toast-wrapper]` in DOM order). Call once, e.g. alongside
 * `<ToastOutlet>`'s setup.
 */
export function useToastHotkey(options: UseToastHotkeyOptions = {}): void {
  const keys = options.keys ?? ['Alt', 't']
  const modifiers = keys.filter((k) => MODIFIERS.has(k))
  const key = keys.find((k) => !MODIFIERS.has(k))?.toLowerCase()

  function handleKeydown(event: KeyboardEvent): void {
    if (event.repeat || key === undefined || event.key.toLowerCase() !== key) {
      return
    }
    const target = event.target
    if (
      target instanceof HTMLElement &&
      (target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName))
    ) {
      return
    }
    const modifierState: Record<string, boolean> = {
      Alt: event.altKey,
      Control: event.ctrlKey,
      Meta: event.metaKey,
      Shift: event.shiftKey,
    }
    const modifiersMatch = [...MODIFIERS].every((m) => modifierState[m] === modifiers.includes(m))
    if (!modifiersMatch) {
      return
    }
    const toast = document.querySelector<HTMLElement>(
      '[data-toast-wrapper][data-toast-status="visible"]',
    )
    if (toast) {
      event.preventDefault()
      toast.focus()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
