# Contributing

Thanks for contributing to `ui-kit`. This repository follows GitHub Flow and
Conventional Commits so changes remain easy to review and release.

## Prerequisites

- Node.js 24.18.0 or newer
- pnpm 11.9.0

Install dependencies from the repository root:

```sh
vp install
```

The install lifecycle runs `vp config`, which installs the repository-owned Git
hooks from `.vite-hooks`.

## Branch workflow

Create a short-lived branch from `master`. Do not push changes directly to
`master`; open a pull request and merge only after CI and review pass.

Use a branch prefix that describes the change:

- `feat/` for new behavior
- `fix/` for bug fixes
- `docs/` for documentation
- `refactor/` for code restructuring
- `chore/` for maintenance
- `ci/` for automation
- `release/` for release preparation

Use squash merge for pull requests and delete the branch after merging.

## Commit messages

Commit messages must follow this shape:

```text
type(optional-scope): short description
```

The allowed types are:

- `feat`: a new feature
- `fix`: a bug fix
- `docs`: documentation only
- `style`: formatting with no behavior change
- `refactor`: code changes that neither fix a bug nor add a feature
- `perf`: a performance improvement
- `test`: tests or test infrastructure
- `build`: build system or dependency changes
- `ci`: continuous integration changes
- `chore`: maintenance work
- `revert`: revert an earlier commit

Examples:

```text
feat(toast-vue): add promise state rendering
fix(core): pause timers while the page is hidden
docs: explain adapter authoring
```

The `commit-msg` hook runs commitlint and rejects invalid messages. Headers may
be up to 120 characters; body and footer lines are unrestricted so detailed
explanations and `BREAKING CHANGE` notes remain possible.

## Staged-file checks

The `pre-commit` hook runs `vp staged`. This is Vite+'s built-in equivalent of
lint-staged and applies `vp check --fix` only to staged files, as configured in
`vite.config.ts`.

## Code comments

Comments explain *why*, not *what*. Well-named identifiers and small functions
should make the "what" self-evident; a comment is only worth adding when the
code cannot express the reason on its own. This follows the convention used by
most large TypeScript/JS codebases (Google TypeScript Style Guide, Vue, React,
Rust's API guidelines).

**Write comments for:**

- A non-obvious constraint or invariant (e.g. why an array must stay sorted).
- A workaround for a specific bug, browser quirk, or library limitation.
- Behavior that would surprise a reader (e.g. an intentional off-by-one, a
  deliberately swallowed error).
- Public API documentation (exported functions/types) using JSDoc/TSDoc.

**Do not write comments for:**

- Restating what the next line already says (`// increment i` above `i++`).
- Narrating the history of a change, a fixed issue, or "who asked for this."
  That belongs in the commit message or PR description, not the source.
- Explaining language/framework basics.
- Commented-out code. Delete it; git history keeps it.

**Single-line comments** (`//`) — use for a short aside directly above (or, if
very short, at the end of) the line it applies to. Keep to one line; if it
takes two, either shorten it or it belongs as a block comment.

```ts
// Safari doesn't fire `transitionend` for zero-duration transitions.
if (duration === 0) return resolve();
```

**Multi-line/block comments** (`/* */`) — reserve for a short paragraph (2-4
lines) explaining a genuinely non-obvious design decision at the top of a
function or module. Avoid ASCII banners, decorative separators, or restating
the file name.

```ts
/**
 * Timers pause while `document.hidden` is true so a backgrounded tab
 * doesn't dismiss toasts the user never had a chance to read.
 */
```

**Function/API-level comments** — exported functions, composables, and public
types use JSDoc (`/** ... */`) with a one-line summary. Add `@param`/`@returns`
only when the name/type doesn't already make it obvious (e.g. units, valid
ranges, side effects) — do not add boilerplate tags that just repeat the
parameter name.

```ts
/** Dismisses a toast by id; no-op if it no longer exists. */
export function dismiss(id: string): void {}

/**
 * Computes the vertical offset for a stacked toast.
 * @param index Position in the stack, 0 = topmost.
 */
export function getStackOffset(index: number): number {}
```

Internal (non-exported) helpers rarely need a doc comment — a short `//` above
the function is enough if the name doesn't already say it all.

All comments are written in English, regardless of the language used
elsewhere in discussion or commit messages.

## Before opening a pull request

Run the full local verification suite:

```sh
pnpm run ready
```

You can also run individual checks:

```sh
pnpm run check
pnpm run typecheck
pnpm run test
pnpm run build
```

Pull requests to `master` run independent lint, typecheck, and test jobs in
GitHub Actions. Keep the lockfile committed and make sure each job passes before
merging.
