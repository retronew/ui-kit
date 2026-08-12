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

4. **Commit** with a Conventional Commits message (enforced by commitlint) ending in the standard trailer:
   ```
   git add <files>          # never `git add -A` — review `git status` first
   git commit -m "$(cat <<'EOF'
   <type>(<scope>): <summary>

   <body explaining why>

   Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
   Claude-Session: https://claude.ai/code/session_01Jn5oLAfUg3BJ7CgswwHyGs
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

   Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
   Claude-Session: https://claude.ai/code/session_01Jn5oLAfUg3BJ7CgswwHyGs
   EOF
   )"
   ```

6. **Watch CI** (use the Monitor tool, not manual polling):
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
   **Known gap:** if the PR's HEAD commit was pushed by `github-actions[bot]` (e.g. a changesets "Version Packages" PR), GitHub does *not* auto-run workflows triggered off a `GITHUB_TOKEN`-authored push — `gh pr checks` will show `no checks reported` / `action_required` forever. Fix by manually dispatching CI on that branch: `gh workflow run ci.yml --ref <branch>`, then poll `gh run view <run-id>` the same way. The checks eventually attach to the PR's head commit once that run completes.

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
