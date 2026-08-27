/// <reference types="vite/client" />

// Vite+/tsgo uses this declaration only to resolve SFC imports. The app's
// authoritative cross-file SFC checks run through vue-tsc (tsconfig.vue.json),
// which excludes this fallback and reads each component's generated types.
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // oxlint-disable-next-line typescript/no-explicit-any
  const component: DefineComponent<any, any, any>
  export default component
}
