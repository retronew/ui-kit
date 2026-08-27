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
  files: { callable: string; caller: string }
}
