# CLAUDE.md

`@jenbuska/yielded` is a TypeScript library, published to npm, for lazy pipelines over iterables: `Yielded.from(source)` gives a sync pipeline, `.awaited()` an async one and `.parallel(n)` one that runs up to `n` items concurrently. See [README.md](README.md) for what it does and [CONTRIBUTING.md](CONTRIBUTING.md) for the branch, PR and release rules and their reasons.

## Where the rules are

This file holds the rules that apply whatever the task. Each area's own rules are in a `CLAUDE.md` in its folder, which Claude Code loads once it reads, writes or edits a file there:

- [`src/CLAUDE.md`](src/CLAUDE.md): the library's code, its public API and its docs.
- [`.github/CLAUDE.md`](.github/CLAUDE.md): CI, workflows and repository settings.

Before opening, updating, rebasing or marking ready a PR, or answering its comments or CI failures, use the `pull-requests` skill (`.claude/skills/pull-requests`). It has the steps and commands; the rules it follows are all in this file.

## Installing dependencies

- The package manager is pnpm (version pinned in `packageManager` in `package.json`). Never use npm or yarn, and don't create `package-lock.json` or `yarn.lock`.
- The repository is a pnpm workspace (`pnpm-workspace.yaml`): the root package is the library, and `examples/node-ts` and `examples/react-vite` are packages that depend on it with `"workspace:*"`, so they import the built `dist/` through `package.json`'s `exports`, the way an installed copy would.
- Always run pnpm from the repository root, and install with `pnpm install --frozen-lockfile`. Plain `pnpm install` would quietly rewrite `pnpm-lock.yaml`, the only lockfile.
- The lockfile changes only through `pnpm add`, `pnpm remove` and `pnpm update` (or `pnpm install` right after editing a `package.json` by hand). Commit `package.json` and `pnpm-lock.yaml` together.
- The library has **no runtime dependencies**, and gets none without the user's OK. Tooling is a root dev dependency: `pnpm add -D -w <tool>`. An example's dependency: `pnpm add <dep> --filter <example>`.
- Install scripts only run when allowed under `allowBuilds` in `pnpm-workspace.yaml`. On `ERR_PNPM_IGNORED_BUILDS`, ask before allowing one.
- Updating `@playwright/test` means updating CI's Playwright image in the same PR (see `.github/CLAUDE.md`).
- Don't install anything else yourself, such as Playwright browsers, system packages or command-line tools. Ask the user, saying what is needed and why.

## Commands (from the root)

- `pnpm typecheck`: TypeScript 7 (`tsc --noEmit`) over `src/`, `tests/`, `scripts/` and the configs.
- `pnpm lint`: oxlint (`.oxlintrc.json`).
- `pnpm knip`: unused files, exports and dependencies. After knip's table, `scripts/knip-explain.mts` explains each finding and how to fix it.
- `pnpm format` / `pnpm format:check`: oxfmt over the whole repository, Markdown included.
- `pnpm test`: Vitest, twice: with the native Iterator helpers and with the polyfills forced (`USE_POLYFILLS=true`). `pnpm test:coverage` for coverage, `pnpm test:watch` while working.
- `pnpm build`: tsdown builds `dist/index.js` and `dist/index.d.ts`, then runs publint and Are The Types Wrong on the result.
- `pnpm test:examples`: builds the library and runs both examples. The browser example needs Playwright's browsers installed (`pnpm --filter react-vite-example exec playwright install chromium firefox webkit`), which you ask the user to do.

Before finishing a change, run `pnpm typecheck`, `pnpm lint`, `pnpm knip`, `pnpm format:check` (or `pnpm format` to fix it), `pnpm test` and `pnpm build`, and `pnpm test:examples` for changes to `src/` or the examples. CI runs these too (see `.github/CLAUDE.md`).

## Tooling

- Node.js 24 for development (`.nvmrc`). The library itself supports what `engines` in `package.json` says (Node.js 20.4.0 and newer, and browsers with ES2022), and CI runs the Node example on the oldest of them.
- TypeScript 7 is the native `tsgo` compiler, run as `tsc`. Tools that need the JavaScript TypeScript API (typescript-eslint and similar) don't work with it. The examples keep TypeScript 5 on purpose, to check that the published types work for consumers who haven't moved to 7.
- Source files are plain type-strippable TypeScript (`erasableSyntaxOnly`, `verbatimModuleSyntax`): relative imports with the `.ts` extension, `import type` for types, no enums, namespaces or constructor parameter properties.
- Linting is oxlint, formatting oxfmt (80 columns). There is no ESLint or Prettier. Unused names starting with `_` are allowed.
- Dead code is found by knip (`knip.json`). Delete what it reports rather than ignoring it, and give any ignore in `knip.json` a comment saying why.

## Secrets

The repository is public. No secret or token is ever committed, in any file, branch or commit, including tests, fixtures, examples and docs. npm publishing uses trusted publishing (OIDC) from the Release workflow, so there is no npm token anywhere. Write placeholders such as `<your-token>` in docs, never a realistic-looking value. CI's gitleaks scan and GitHub's secret scanning with push protection are the backstops. Sessions never ask for, read or handle a real token.

## Security vulnerabilities

Vulnerabilities are reported privately, through the repository's "Report a vulnerability" form (see [SECURITY.md](SECURITY.md)). A report becomes a draft security advisory.

- Never discuss a private report, its details or its fix in public before the advisory is published: no issue, PR, commit message, comment, branch name or label.
- A session that finds a vulnerability itself tells the user in its chat, writes nothing about it on GitHub, and the user decides whether to open a draft advisory.
- The fix is made in the advisory's temporary private fork, never in a branch or PR of this repository. Actions don't run there, so run the checks from "Commands" locally.
- The user merges the fix and publishes the advisory. Sessions never publish, close or change an advisory, and never request a CVE.

## Tickets and sessions

- Every change starts from a GitHub issue. Work found along the way that isn't the ticket's gets its own ticket, not a place in the current PR.
- Every open issue has a status label: `todo` when it isn't started (add it when creating the issue) and `in progress` from the moment work starts. Swap them with `gh issue edit <N> --add-label "in progress" --remove-label todo`. `remove-status-labels.yml` removes both when an issue closes.
- Bugs are labeled `bug`, and each has a minimal reproduction, the expected and the actual result. Its fix comes with a regression test that fails without it.
- Split a ticket as CONTRIBUTING.md's "Opening a pull request" says: pieces that can't be built on their own become sub-issues (`gh issue create --parent <N>`), and work that can becomes a separate ticket.
- The Planning session (the one that writes tickets) starts ticket sessions. A ticket session may start a session only for a sub-issue of its own ticket, in its own worktree on its own branch. For any other work it finds, it writes a ticket or tells the Planning session.
- Session titles start with the ticket number, for example `#38 Sync reduce returns a Promise`.

## Branches, commits and PRs

PRs go into `dev`, except the release PR from `dev` into `main`.

- Branch names are `<TICKET_NUMBER>-<name>`, for example `38-sync-reduce`. `hotfix/*` branches have no ticket.
- Commit subjects are `<N> <subject>`, with no `#`, for example `38 Return the value from sync reduce`. Git drops lines that start with `#` when it opens a message in the editor, so a `#N` subject would be lost. `hotfix/*` commits have no ticket number, and Dependabot's start with `Dependabot:`.
- Commit with the GitHub noreply address (`git config user.email`), never a private one: GitHub refuses pushes that expose a private address.
- Sessions commit and push without asking first.
- A PR's title is its branch name, with a colon and a few words when the name doesn't explain it: `38-sync-reduce: return the value, not a Promise`. The release PR is titled `Release <version>`.
- Every PR into `dev` links an open issue with `Closes #N`, `Fixes #N` or `Resolves #N`, unless it's a hotfix or Dependabot PR; the `PR rules` check fails otherwise.
- Open a draft PR as soon as work on a ticket starts, with an empty commit if there's nothing to commit yet, saying what's planned and what's done. Push often and keep the body current.
- A change users can notice (a fix, a new feature, a changed behaviour or type) adds a line under `## [Unreleased]` in `CHANGELOG.md`. A breaking change says so there and in the PR, and needs the user's OK before it's made.
- Right after opening its PR, a session turns on PR monitoring if its environment has it (in the Claude desktop app, the PR's Auto-fix switch). Without it, the session checks its PR's comments and reviews whenever it's resumed and before marking the PR ready.
- A session answers every comment a developer leaves on its PR on GitHub, in that comment's own thread, without asking first: questions right away, a requested change once it's solved. Answers about code link a pushed commit or a permalink with its SHA, never a branch.
- A session fixes a CI failure its PR caused. One in something the PR didn't touch, such as a flaky test or the CI setup, it reports first, in a PR comment and to the developer, and works on it only once they say so.
- A PR that adds a known vulnerability of high severity or worse fixes it itself, by updating to the fixed version. An audit finding not caused by a PR is fixed in its own PR into `dev`.
- A new CodeQL alert on a PR is fixed in that PR. Dismiss an alert only with the user's OK, with the reason in the PR.
- Keep PR branches up to date by rebasing onto `origin/dev` and pushing with `--force-with-lease`, never forcing a push that was rejected. PRs land with "Rebase and merge"; merge commits are refused.
- Run `gh pr ready` only when the ticket's definition of done is met and CI passes. Work a PR leaves undone moves to a sub-issue or a separate ticket before it merges.
- After the user merges a PR, the session that made it runs the `rebase-prs` skill and checks that the ticket closed (`gh issue close` if not).

## Merging and releasing

- Only the user merges. A session never merges a PR or turns on auto-merge unless the user tells it to for that specific PR, and approval for one PR doesn't carry over to another. Sessions use the user's GitHub login, so GitHub can't enforce this for them.
- Only the user releases and publishes to npm, from Actions → Release. Sessions never run the Release workflow, never run `npm publish` or `pnpm publish`, and never push to `main` or create tags. The one exception is a `dry_run` run of the Release workflow, only when the user asks for one.
