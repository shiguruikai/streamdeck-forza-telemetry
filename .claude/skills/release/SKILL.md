---
name: release
description: Release a new version of this plugin (version bump, CHANGELOG, commit, tag, GitHub Release).
argument-hint: "[X.Y.Z]"
disable-model-invocation: true
---

# Release

Release a new version. Follow the steps in order. On any failure, stop and report; do not work around it.
Get the user's approval at each **[Approval]** point (AGENTS.md: never commit or push without approval).
`gh run watch` can take several minutes; use a long command timeout.

Paths:

- Manifest: `com.github.shiguruikai.streamdeck-forza-telemetry.sdPlugin/manifest.json`
- Repository URL: `https://github.com/shiguruikai/streamdeck-forza-telemetry`

## 1. Preflight

1. Must be on `main` with no changes to tracked files (`git status --porcelain --untracked-files=no` is empty). Otherwise stop.
2. `git pull --ff-only origin main`, `pnpm install --frozen-lockfile`, `gh auth status`.
3. Previous version: `git describe --tags --abbrev=0`. It must match the top-level `version` in `package.json`. Changes: `git log <previous tag>..HEAD --oneline`.
4. The `## [Unreleased]` section of `CHANGELOG.md` must have at least one entry. Otherwise stop.

## 2. Decide the version

- Requested version: `$ARGUMENTS` (empty = not given; strip a leading `v`). If empty, propose one by SemVer from the `[Unreleased]` entries: breaking changes → major, `Added`/`Changed` → minor, `Fixed` only → patch.
- The version must match `^[0-9]+\.[0-9]+\.[0-9]+$` and be greater than the previous version. Pre-release versions are not supported (the release workflow rejects them).
- The tag must not exist yet: `git tag -l vX.Y.Z` and `git ls-remote --tags origin vX.Y.Z` are both empty.
- **[Approval]** Confirm the version.

## 3. Update the files

1. `package.json`: the top-level `"version"` (not `devEngines.packageManager.version`) → `X.Y.Z`.
2. Manifest: the top-level `"Version"` (not `Nodejs.Version`) → `X.Y.Z.0`.
3. `CHANGELOG.md`:
   - Move the `[Unreleased]` entries into a new section `## [X.Y.Z] - YYYY-MM-DD` (today, local date) directly below an empty `## [Unreleased]`. This section becomes the GitHub Release body.
   - Link definitions at the bottom: set `[Unreleased]` to `<repo>/compare/vX.Y.Z...HEAD`, and add `[X.Y.Z]: <repo>/compare/v<previous>...vX.Y.Z` above the previous version's link.

## 4. Verify

Run, and require success: `pnpm lint --max-warnings=0`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm sd:validate`, `pnpm sd:pack`.
The generated `.streamDeckPlugin` is gitignored; do not commit it.

## 5. Commit and push `main`

1. `git add package.json CHANGELOG.md <manifest>`.
2. Show the version, the new CHANGELOG section, `git diff --cached --stat`, and the already-unpushed commits that this push will also publish (`git log origin/main..HEAD --oneline`).
3. **[Approval]** Ask to commit and push.
4. `git commit -m "release: vX.Y.Z"` → `git push origin main`.

## 6. Wait for CI

1. Get the pushed commit: `git rev-parse HEAD`.
2. Find its run: `gh run list --workflow ci.yml --commit <sha> --json databaseId,status,conclusion`. If empty, wait a few seconds and retry (up to about 1 minute). Never use a run for another commit.
3. `gh run watch <run-id> --exit-status`.
4. If CI fails, report the failure (`gh run view <run-id> --log-failed`) and do not tag. With approval, fix it on `main` with a new commit (no amend, no force-push), then resume from step 4.

## 7. Tag

1. **[Approval]** Confirm pushing the tag.
2. `git tag -a vX.Y.Z -m "release: vX.Y.Z"` → `git push origin vX.Y.Z`.

The tag push starts `.github/workflows/release.yml`. It runs CI, fails if the tag, `package.json`, manifest, and CHANGELOG heading disagree, then creates the GitHub Release.

## 8. Check the release

1. Find the run as in step 6, with `--workflow release.yml --commit <sha>`, then `gh run watch <run-id> --exit-status`.
2. `gh release view vX.Y.Z`: the `.streamDeckPlugin` is attached, and the body matches the CHANGELOG section.
3. If the workflow failed, report the failure (`gh run view <run-id> --log-failed`). No release is created in that case. Propose one of the following, and run it only with approval:
   - Transient error: `gh run rerun <run-id> --failed`.
   - Mismatch or other fix needed: fix on `main`, delete the tag (`git push origin --delete vX.Y.Z`, `git tag -d vX.Y.Z`), then redo steps 6 and 7.
