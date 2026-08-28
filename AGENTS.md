# Repository instructions for coding agents

These instructions apply to the entire repository. If a nested `AGENTS.md` is
added later, its rules take precedence within that subtree.

## Project overview

This is a Vite+ and pnpm monorepo for the `@retronew` frontend libraries.

- `packages/toast-core`: framework-agnostic toast state and behavior. Keep it
  free of Vue and other framework dependencies.
- `packages/toast-vue`: the Vue 3 adapter. Keep framework integration here and
  delegate shared behavior to `toast-core`.
- `apps/toast-vue-demo`: the private playground used to exercise the public Vue API.

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
vp run toast-vue-demo#dev
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

<!--VITE PLUS START-->

## Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

### Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

### Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

### Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
