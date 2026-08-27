export type Category = 'dialog' | 'picker' | 'notification' | 'menu' | 'drawer' | 'overlay' | 'flow'

export type Behavior =
  | 'update'
  | 'upsert'
  | 'mutation-flow'
  | 'stacking'
  | 'nested'
  | 'exit-animation'
  | 'root-props'
  | 'end-from-caller'

export interface ExampleMeta {
  title: string
  description: string
  category: Category
  behaviors: readonly Behavior[]
  tags?: readonly string[]
  files: { callable: string; caller: string }
  /**
   * Attribute string spliced into the Root mount shown in the detail page's
   * "The Root" code block, e.g. `userName="Ada Lovelace"`. Set this on
   * examples that read `call.root` so the snippet shows where those Root
   * props come from.
   */
  rootProps?: string
}
