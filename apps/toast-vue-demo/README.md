# toast-vue-demo

**Live:** https://toast-vue-demo.vercel.app

A Vite + Vue playground exercising `@retronew/toast-vue`'s public API — a styled, reference `ToastOutlet`/`ToastBar` implementation (icons, dark mode, action/cancel/dismiss buttons, stack-vs-queue modes) that `packages/toast-vue` intentionally ships without, since the package stays unstyled by design.

## Develop

Manage dependencies from the monorepo root. Package versions belong in the root `pnpm-workspace.yaml` catalog; this app consumes them through `catalog:` entries.

```sh
vp install
vp run toast-vue-demo#dev
vp run toast-vue-demo#check
vp run toast-vue-demo#build
```

## Deploy to Vercel

Configure the Vercel project Root Directory as `apps/toast-vue-demo`. Leave the install, build, and output settings at their framework defaults: pnpm resolves the workspace root, `pnpm run build` runs Vite, and output is written to `dist`.
