# call-vue-demo

**Live:** https://call-vue-demo.vercel.app

A Vite + Vue playground exercising `@retronew/call-vue`'s public API — confirmations, toasts, and other imperative, awaitable components built with `createCallable`.

## Develop

Manage dependencies from the monorepo root. Package versions belong in the root `pnpm-workspace.yaml` catalog; this app consumes them through `catalog:` entries.

```sh
vp install
vp run call-vue-demo#dev
vp run call-vue-demo#check
vp run call-vue-demo#build
```

## Deploy to Vercel

Configure the Vercel project Root Directory as `apps/call-vue-demo`. Leave the install, build, and output settings at their framework defaults: pnpm resolves the workspace root, `pnpm run build` runs Vite, and output is written to `dist`.
