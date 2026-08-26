---
name: ship-pr
description: Ship a change to this repo through the full branch → PR → CI → squash-merge flow this repo requires (main is protected, no direct pushes). Use whenever the user asks to "commit and push", "open a PR", "ship this", or after finishing a code change that needs to land on main.
disable-model-invocation: false
---

# Shipping a change on `ui-kit`

`main` is protected by a repository ruleset: no direct pushes, and 5 required status checks (Lint, Typecheck, Test, Build, Browser E2E) must pass before merge. Every change — including infra/CI fixes — goes through this flow.

## Steps

1. **Branch off `main`.** Prefix per `CONTRIBUTING.md`: `feat/`, `fix/`, `docs/`, `refactor/`, `chore/`, `ci/`, `release/`.
   ```
   git checkout main && git pull
   git checkout -b <prefix>/<short-description>
   ```
   If you're already mid-work on `main` with uncommitted or committed changes that shouldn't be there, move them: `git branch <new-branch>` (captures current HEAD), then `git branch -f main origin/main` and `git checkout <new-branch>` — never `git reset --hard` on a branch that might hold unpushed work.

2. **Make the change, then validate locally before committing:**
   ```
   vp check --fix
   vp run -r test        # or: vp run -r test:coverage
   vp run -r build
   ```
   Use `vp run -r <script>` (per-workspace `package.json` scripts), not the bare `vp test`/`vp check` built-ins — the built-ins skip each workspace's own `vite.config.ts` test/coverage settings (env, thresholds, includes), which silently changes behavior (e.g. `window` becomes undefined, unrelated specs get picked up).

3. **Add a changeset if the change touches published package behavior** (`packages/toast-core` or `packages/toast-vue` public API/behavior — not internal-only fixes, not docs/CI/tests):
   ```
   cat > .changeset/<slug>.md <<'EOF'
   ---
   '@retronew/toast-core': patch
   ---

   <one-line summary of the user-visible change>
   EOF
   ```
   Bump level: `patch` for fixes, `minor` for new backward-compatible features, `major` for breaking changes.

4. **Commit** with a Conventional Commits message (enforced by commitlint). Do not add `Co-Authored-By` or `Claude-Session` trailers — this repo's history stays agent-neutral so it doesn't matter which agent/tool made the commit:
   ```
   git add <files>          # never `git add -A` — review `git status` first
   git commit -m "$(cat <<'EOF'
   <type>(<scope>): <summary>

   <body explaining why>
   EOF
   )"
   ```
   Note: this repo's `pre-commit` hook runs `vp check --fix` on staged files and may touch other files for line-ending normalization only (CRLF/LF) — these show as `git diff` with a warning but *no* content diff; don't stage or commit them.

5. **Push and open the PR:**
   ```
   git push -u origin <branch>
   gh pr create --title "<same style as commit summary>" --body "$(cat <<'EOF'
   ## Summary
   - ...

   ## Test plan
   - [x] vp check
   - [x] vp run -r test
   - [x] vp run -r build
   EOF
   )"
   ```

6. **Watch CI** (use the Monitor tool, not manual polling). Use `gh`'s **built-in** `--jq` flag (bundled, no external binary) for every JSON query below — do **not** pipe `gh`/`jq` output to a standalone `jq` command. This environment (Windows/Git Bash) does not have `jq` on PATH, and piping to a missing `jq` fails silently inside `$(...)` (empty string, no error), which makes a polling loop's exit condition never become true and hangs the Monitor forever instead of erroring:
   ```
   prev=""
   while true; do
     cur=$(gh pr checks <N> --json name,bucket --jq '.[] | select(.bucket!="pending") | "\(.name): \(.bucket)"' 2>/dev/null | sort)
     comm -13 <(echo "$prev") <(echo "$cur")
     prev="$cur"
     pending=$(gh pr checks <N> --json bucket --jq '[.[] | select(.bucket=="pending")] | length' 2>/dev/null)
     [ "$pending" = "0" ] && [ -n "$cur" ] && { echo "ALL_DONE"; break; }
     sleep 30
   done
   ```
   If you ever need `gh run view <id> --json ...` processed further, chain another `gh ... --jq` / `--json` call, or use plain shell (`grep`/`cut`/`case`) — never `| jq`. Before writing any ad-hoc one-off check (e.g. inspecting a single run's jobs), first confirm the command has no bare `jq` in it.

   **Known gap #1:** if the PR's HEAD commit was pushed by `github-actions[bot]` (e.g. a changesets "Version Packages" PR), GitHub does *not* auto-run workflows triggered off a `GITHUB_TOKEN`-authored push — `gh pr checks` will show `no checks reported` / `action_required` forever. Fix by manually dispatching CI on that branch: `gh workflow run ci.yml --ref <branch>`.

   **Known gap #2 (also seen from a normal, non-bot push):** a `pull_request`-triggered CI run can simply fail to fire at all for a given push — not only for bot-authored commits — leaving `gh run list --branch <branch>` with no run for that HEAD SHA. Manually dispatching with `gh workflow run ci.yml --ref <branch>` (gap #1's fix) does *not* reliably resolve this: the resulting `workflow_dispatch` run can show every job green via `gh run view <id>` and even via `gh api repos/<owner>/<repo>/commits/<sha>/check-runs` (with its check-suite's `pull_requests` field correctly listing the PR), while `gh pr checks`, `gh pr view --json statusCheckRollup`, and `mergeStateStatus` (`BLOCKED`) still don't reflect it — evaluated separately, on a real, minutes-plus delay for `workflow_dispatch`-originated suites, if it clears at all in a reasonable window. Prefer getting a genuine `pull_request`-event run instead of trusting the dispatch: push a trivial follow-up commit (or re-push the same tree with `git commit --amend --no-edit && git push --force-with-lease`, if the branch is solely yours) to generate a fresh `pull_request` event, then confirm with `gh run list --branch <branch> --json event,headSha,conclusion` that a `pull_request`-event run (not `workflow_dispatch`) exists for the current HEAD SHA before treating checks as satisfied.

7. **Never merge without asking.** Use `AskUserQuestion` to confirm once all required checks pass — even if you're confident, even for infra-only changes. Then:
   ```
   gh pr merge <N> --squash --delete-branch
   git checkout main && git pull
   ```

8. **If the merge triggers `release.yml`** (any push to `main`) and there's a pending changeset, `changesets/action` opens/updates a "Version Packages" PR automatically. That PR needs the same manual CI dispatch (step 6's known gap) before it can be merged — merging it is what actually publishes to npm, so confirm with the user before merging it too.

## Things that bit us before (don't repeat)

- `vp exec pnpm audit ...` as a raw CI step fails with `vp: command not found` — CI only has `pnpm`/`node` on PATH via `pnpm/setup@v1`, not the global `vp` CLI. Either drop `vp exec` (plain `pnpm audit` works since the workflow's pnpm version already matches) or route through `pnpm exec vp exec ...`.
- A repo's default "Allow GitHub Actions to create and approve pull requests" setting can silently block `changesets/action` from opening its release PR (`HttpError: GitHub Actions is not permitted to create or approve pull requests`). Check `gh api repos/<owner>/<repo>/actions/permissions/workflow`; fix with `gh api -X PUT repos/<owner>/<repo>/actions/permissions/workflow -f default_workflow_permissions=read -F can_approve_pull_request_reviews=true`.
- Don't assume a "checks pass" result from a `workflow_dispatch` rerun means the PR is mergeable — check `gh pr checks <N>` directly; the PR's required-status-check state is tied to check runs on its exact HEAD commit, not to any run you happened to trigger.
- If a fix touches uncovered branches, re-run `vp run -r test:coverage` — this repo enforces per-package coverage thresholds in each `vite.config.ts`, and a purely-defensive `if` you add can drop coverage below the gate even when all assertions still pass.
- Never pipe to a bare `jq` in a polling/Monitor command on this machine — it isn't installed (Windows/Git Bash), and `cmd | jq ...` inside `$(...)` fails silently (empty output, exit captured but unchecked), so a loop's exit condition never flips true and the Monitor hangs indefinitely instead of erroring visibly. Use `gh ... --jq '...'` (bundled in the `gh` binary itself) for every JSON query instead.
- Two apps' `vite.config.ts` (`toast-vue-demo`, `call-vue-demo`) route their `defineConfig(...)` argument through `as unknown as Parameters<typeof defineConfig>[0]` — this is not stylistic. The workspace has two structurally-similar `Plugin`/`UserConfig` types in scope (vite-plus's aliased `vite` vs. the real `vite` pulled in transitively by unocss/@vitejs/plugin-vue), and `tsgo` times out ("Excessive stack depth") comparing them once `plugins` is populated directly. Don't "clean up" that cast without re-running `vp -C <app> check` first.
