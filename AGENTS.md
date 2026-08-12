# Repository instructions for coding agents

These instructions apply to the entire repository. If a nested `AGENTS.md` is
added later, its rules take precedence within that subtree.

## Project overview

This is a Vite+ and pnpm monorepo for the `@retronew` frontend libraries.

- `packages/toast-core`: framework-agnostic toast state and behavior. Keep it
  free of Vue and other framework dependencies.
- `packages/toast-vue`: the Vue 3 adapter. Keep framework integration here and
  delegate shared behavior to `toast-core`.
- `apps/vue-demo`: the private playground used to exercise the public Vue API.

Preserve the separation between the headless core, framework adapters, and demo
applications. New shared behavior belongs in the core; presentation and
framework reactivity belong in the relevant adapter or app.

## Toolchain

- Use Node.js 24.18.0 or newer and pnpm 11.9.0.
- Use `vp install` to install dependencies and keep `pnpm-lock.yaml` committed.
- Vite+ built-ins use `vp <command>`; repository scripts and tasks use
  `vp run <name>`. Check `package.json` and `vite.config.ts` before choosing.
- Do not use npm or Yarn to change dependencies or generate lockfiles.
- Local Vite+ documentation is available at `node_modules/vite-plus/docs`.

Common commands:

```sh
vp install
vp run vue-demo#dev
pnpm run check
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run ready
```

Run the narrowest relevant checks while iterating. Run `pnpm run ready` before
handing off a change that affects behavior, public APIs, build configuration, or
multiple packages.

## Code and repository conventions

- Use strict TypeScript and ESM. Follow the root `.editorconfig` and let
  Vite+/Oxfmt handle formatting.
- Keep edits focused and preserve unrelated working-tree changes.
- Add or update tests when behavior changes. Tests live beside each package in
  its `tests` directory.
- Update package README files and public entry points when changing a public API.
- Comments explain non-obvious intent or constraints, not the code itself. Write
  all source-code comments in English.
- Do not edit or commit generated `dist`, `coverage`, `node_modules`,
  `*.tsbuildinfo`, or `.vite-hooks/_` content.
- Project-owned hook scripts such as `.vite-hooks/commit-msg` are source files
  and should be committed.
- Never commit dotenv files or local agent state. A sanitized `.env.example` is
  allowed.

Follow `CONTRIBUTING.md` for branches, Conventional Commit messages, comments,
and pull-request checks.
