# call-vue docs

**Live:** https://call-vue-docs.vercel.app

The public Astro documentation site for `@retronew/call-vue`. Its information architecture and visual baseline follow the MIT-licensed [react-call site](https://react-call.desko.dev), adapted to Vue and restricted to capabilities that call-vue actually ships.

## Develop

Manage dependencies from the monorepo root. Package versions belong in the root `pnpm-workspace.yaml` catalog; this app consumes them through `catalog:` entries.

```sh
vp install
vp run call-vue-docs#dev
vp run call-vue-docs#check
vp run call-vue-docs#build
```

The site is static. English lives at the root, with Simplified Chinese under `/zh-cn/` and Japanese under `/ja/`.

## Deploy to Vercel

Configure the Vercel project Root Directory as `apps/call-vue-docs`. Leave the install, build, and output settings at their framework defaults: pnpm resolves the workspace root, `pnpm run build` runs Astro, and output is written to `dist`.
