import type { UserComponent } from '@retronew/call-vue'
import type { Component } from 'vue'

/**
 * This app type-checks with oxlint/tsgo rather than `vue-tsc`, so the
 * ambient `declare module '*.vue'` shim in `env.d.ts` can only describe an
 * SFC's shape generically (`Record<string, unknown>` props) — it has no way
 * to see the precise props a `.vue` file declares via `defineProps`.
 * Assert the real shape once, at the `createCallable` boundary, instead of
 * loosening `UserComponent` itself (which would weaken the library's own
 * type for consumers who do run `vue-tsc`).
 */
export function asCallableComponent<Props, Response, RootProps extends Record<string, unknown>>(
  component: Component,
): UserComponent<Props, Response, RootProps> {
  return component as UserComponent<Props, Response, RootProps>
}
