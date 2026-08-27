# call-vue / react-call parity plan

This document tracks framework-adapted parity with `desko27/react-call`.
The goal is equivalent user-facing behavior where Vue has a direct analogue,
not a copy of React-only implementation details.

| Stage | Scope | Status | Evidence / boundary |
| --- | --- | --- | --- |
| M1 | Core Callable parity | Complete | `createCallable`, concurrent Stack, `call` / `upsert` / `end` / `update`, Root lifecycle, async components, SSR safety, and the removed `.Root` alias shipped in #44. |
| M2 | Localized documentation and live demos | Complete | Astro docs site, English / Simplified Chinese / Japanese routes, Why-page semantic parity, and interactive homepage demos shipped in #46. |
| M3 | `mutation-flow` subpath | Complete | Vue-native `useMutationFlow`, types, dual package entry, package tests, a live retry demo, concept pages, and localized documentation shipped in #47. |
| M4 | Vite HMR persistence | Complete | `@retronew/call-vue/vite` injects stable development names for supported declarations; core adopts the existing Stack by that name so active Calls survive consumer-module HMR. Package tests, exports, README, and localized documentation are complete on `feat/call-vue-vite-host`. |
| M5 | Multi-preview Host | Complete | `@retronew/call-vue/host` mounts one idempotent, isolated Vue Root for Storybook / Histoire-style repeated previews. Package tests, exports, README, and localized documentation are complete on `feat/call-vue-vite-host`. |
| M6 | Final parity and release audit | Planned | Compare every exported subpath, public type, README section, docs route, example, package artifact, and test against the upstream contract; then prepare changeset / changelog and release verification. |

## M3 contract

`@retronew/call-vue/mutation-flow` remains an opt-in subpath so the core
Callable entry stays unchanged. It provides `useMutationFlow`, `MutationCall`,
`MutationFn`, `Trigger`, and `ChainTrigger`.

- `pending` is reactive and blocks duplicate in-flight submits.
- A mutation closes a Call only by explicitly calling `call.end(value)`.
- A handled failure clears pending and leaves the Call open for retry.
- Errors are not swallowed by the helper.
- An optional mutation can use `submit(payload).orEnd(value)` as a per-callsite
  fallback, or intentionally omit it for a manual-close path.

## Deliberate boundaries

The following remain unsupported until their own stages are complete:

- `@retronew/call-vue/vite`
- `@retronew/call-vue/host`

No React-specific subpath is exposed under a Vue name before its Vue contract,
tests, documentation, package artifact, and demo are in place.
