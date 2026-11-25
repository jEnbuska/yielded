# CI, workflows and repository settings

Rules for `.github/`, on top of the root [CLAUDE.md](../CLAUDE.md), which has what a session does about a CI failure, an audit finding or a CodeQL alert on its PR.

## CI

CI (`.github/workflows/ci.yml`) has a `changes` job and three that do the work:

- **`Lint, format, typecheck, test & build`**: the gitleaks secret scan over the commits the PR or push adds, then `pnpm lint`, `pnpm knip`, `pnpm format:check`, `pnpm typecheck`, `pnpm test` and `pnpm build`, and the dependency check last.
- **`Node example (20.4.0)`, `(22)` and `(24)`**: builds the library and `examples/node-ts` with the Node.js in `.nvmrc`, then runs the example with the matrix version. 20.4.0 is the oldest version `engines` promises; keep the matrix in step with `engines`.
- **`Browser example (chromium)`, `(firefox)` and `(webkit)`**: `examples/react-vite`'s Playwright tests, one browser per job.

What runs when:

- Pushes to `main` and `dev`, and manual runs (`workflow_dispatch`), run everything. On a PR, the `changes` job decides from the changed files, and a PR with no changed files (a draft's empty first commit) skips the work jobs.
  - Docs (`**/*.md`, `LICENSE`) run only the format check, because oxfmt formats Markdown, and the secret scan.
  - The example jobs run for changes to `src/`, `examples/`, the root `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.json`, `tsdown.config.ts` and `.nvmrc`.
  - A change to `ci.yml` runs everything.
- The dependency check runs `pnpm audit --audit-level=high` with `scripts/audit-report.mts`. A PR into `dev` that changes a `package.json` or `pnpm-lock.yaml` fails only on what it adds, compared with its base. Every PR into `main` and push to it audits the whole tree, so a finding blocks the release. `audit.yml` audits the whole tree weekly and from `workflow_dispatch`, and opens or updates one issue labeled `bug` and `todo` instead of failing PRs.
- Skip a matrix job's steps, never the job: a skipped matrix job reports one check under its unexpanded name, such as `Browser example (${{ matrix.browser }})`, so the required `Browser example (chromium)` would wait forever. A non-matrix job can skip with `if:`, which counts as passing.
- The browser job runs in Playwright's container image (`mcr.microsoft.com/playwright`), which has the browsers and their system packages, so nothing runs `apt`. The image is pinned by digest with its tag in a comment, and must be the same version as `@playwright/test` in `pnpm-lock.yaml`: the "Check the image's browsers" step fails if it isn't, so updating Playwright means updating the image in the same PR.
- Dependabot (`.github/dependabot.yml`) only keeps the actions current, in one weekly PR into `dev`, with a 7-day cooldown. Keep every action pinned to a commit SHA with its `# vX.Y.Z` comment, which is what Dependabot updates. npm dependencies are checked by `pnpm audit` and updated by hand, in a PR that links an issue.
- CodeQL code scanning runs as GitHub's default setup (turned on in the repository's settings, so there's no workflow file), on PRs into `dev` and `main`, pushes to them and weekly, for TypeScript/JavaScript and the workflows. The rulesets' code scanning rule blocks a merge on an alert of High or above, or an error.
- A new CI job has to be added as a required check in the `dev` and `main` rulesets, with the user's OK.

## Workflows

- Workflows declare top-level `permissions: contents: read` and grant write scopes only on the job that needs them.
- Pass PR and issue data (body, title, branch names) to scripts through `env:`, never as `${{ }}` inside `run:`.
- Pin actions to a commit SHA with the version in a comment.
- `pr-rules.yml` uses `pull_request_target`, so its code comes from `dev` and a PR can't change the check that judges it. It must never check out or run the PR's code.

## Repository settings

These are set in GitHub, not in files. They're listed here so a change to the workflows can be checked against them, and CONTRIBUTING.md's "Where the rules are enforced" explains them. Sessions change them only when the user asks.

- Default branch `dev`. Merge method: "Rebase and merge" only; merged branches are deleted.
- Rulesets `dev` and `main`, with no bypass: no deletion, no force-push, linear history, changes only through PRs (rebase), the code scanning rule (CodeQL), and the required checks `Lint, format, typecheck, test & build`, `Node example (20.4.0)`, `(22)`, `(24)`, `Browser example (chromium)`, `(firefox)`, `(webkit)` and `PR rules`, with branches up to date before merging.
- Secret scanning with push protection, Dependabot alerts, private vulnerability reporting and CodeQL default setup are on.
