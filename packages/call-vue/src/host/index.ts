import { createApp, defineComponent, h, isVNode, shallowRef } from 'vue'
import type { App, Component, ShallowRef, VNode } from 'vue'

export type HostRoot<Props extends object = Record<string, never>> = Component<Props> | VNode

export interface MountOptions<Props extends object = Record<string, never>> {
  /** Props passed when `root` is a Vue component. */
  props?: Props
  /** A Vue component that wraps the mounted Root through its default slot. */
  wrapper?: Component
  /** The element to mount into; defaults to a new body-level host element. */
  container?: HTMLElement
}

interface HostState {
  app: App
  container: HTMLElement
  view: ShallowRef<VNode>
}

const HOST_KEY = Symbol.for('call-vue.host')

function createHostContainer(): HTMLElement {
  const container = document.createElement('div')
  container.setAttribute('data-call-vue-host', '')
  document.body.appendChild(container)
  return container
}

function renderRoot<Props extends object>(
  root: HostRoot<Props>,
  options: MountOptions<Props>,
): VNode {
  const content = isVNode(root) ? root : h(root, options.props)
  return options.wrapper ? h(options.wrapper, null, { default: () => content }) : content
}

/**
 * Mount one Callable Root outside repeated preview subtrees such as Storybook
 * or Histoire. Repeated calls update the existing host instead of adding Roots.
 */
export function mount<Props extends object>(
  root: HostRoot<Props>,
  options: MountOptions<Props> = {},
): void {
  const globalStore = globalThis as { [HOST_KEY]?: HostState }
  const cached = globalStore[HOST_KEY]
  if (cached) {
    cached.view.value = renderRoot(root, options)
    return
  }

  const view = shallowRef(renderRoot(root, options))
  const HostRoot = defineComponent({
    name: 'CallVueHost',
    setup: () => () => view.value,
  })
  const container = options.container ?? createHostContainer()
  const app = createApp(HostRoot)
  globalStore[HOST_KEY] = { app, container, view }
  app.mount(container)
}
