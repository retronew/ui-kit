---
'@retronew/toast-vue': major
---

**Breaking:** the renderless outlet `<Toaster>` is renamed to `<ToasterProvider>` (its `ToasterSlotProps` type is now `ToasterProviderSlotProps`). Update your imports/templates: `import { Toaster } from '@retronew/toast-vue'` → `import { ToasterProvider } from '@retronew/toast-vue'`, and `<Toaster v-slot="...">` → `<ToasterProvider v-slot="...">`. No behavior change otherwise — this is purely a rename, freeing up the `Toaster` name for a possible future batteries-included component.
