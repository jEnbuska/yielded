# Contributing

Thank you for helping with Yielded. This page is for people who change the library. If you only use it, the [README](README.md) is for you.

Yielded has two long-lived branches:

- **`dev`** is the default branch. All work lands here.
- **`main`** holds what has been released to npm. It only ever receives `dev`.

## Setting up

You need Node.js 24 (the version in [`.nvmrc`](.nvmrc)) and pnpm, in the version pinned in `packageManager` in [`package.json`](package.json). With [Corepack](https://nodejs.org/api/corepack.html), `corepack enable` picks it up.

```bash
pnpm install --frozen-lockfile
```

Always run pnpm from the repository root. The root package is the library, and [`examples/node-ts`](examples/node-ts) and [`examples/react-vite`](examples/react-vite) are workspace packages that use the built library the way a project that installs it from npm would.

## Scripts

| Command              | What it does                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| `pnpm typecheck`     | TypeScript 7 type check                                                                            |
| `pnpm lint`          | [oxlint](https://oxc.rs/docs/guide/usage/linter)                                                   |
| `pnpm knip`          | Unused files, exports and dependencies ([knip](https://knip.dev)), with an explanation per finding |
| `pnpm format`        | Formats everything with [oxfmt](https://oxc.rs/docs/guide/usage/formatter); `format:check` checks  |
| `pnpm test`          | Vitest, once with the native Iterator helpers and once with the library's polyfills forced         |
| `pnpm test:coverage` | Tests with a coverage report in `coverage/`                                                        |
| `pnpm build`         | Builds `dist/` with tsdown and checks the package with publint and Are The Types Wrong             |
| `pnpm test:examples` | Builds the library and runs both examples                                                          |

The browser example needs Playwright's browsers once: `pnpm --filter react-vite-example exec playwright install chromium firefox webkit`.

### Before you push

Run `pnpm typecheck`, `pnpm lint`, `pnpm knip`, `pnpm format:check`, `pnpm test` and `pnpm build`, and `pnpm test:examples` when you change `src/` or the examples. CI runs the same checks on every PR.

## How the code is organised

[`src/CLAUDE.md`](src/CLAUDE.md) describes the three flows (sync, async and parallel), where each operator and resolver lives, and the rules they follow: the same behaviour in every flow, lazy evaluation, closing the source when stopping early, and native Iterator helpers with polyfills that behave the same. It's written for Claude Code sessions, and it's the reference for people too.

## The rules

|                                | Into `dev`                                                                                                                     | Into `main`                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| Allowed source                 | A PR that links an open issue, a `hotfix/*` branch in this repository, or a [Dependabot](#dependabot) update                   | `dev` of this repository                |
| Direct pushes                  | Refused, for everyone                                                                                                          | Refused, for everyone                   |
| Force-pushes and deletion      | Refused, for everyone                                                                                                          | Refused, for everyone                   |
| Must be up to date with target | Yes                                                                                                                            | Yes                                     |
| Checks that must pass          | `Lint, format, typecheck, test & build`, the `Node example` and `Browser example` jobs, `PR rules`, and CodeQL's code scanning | The same, and the full dependency audit |
| How it lands                   | Rebase and merge                                                                                                               | Fast-forward, by the Release workflow   |
| Who merges                     | The maintainer                                                                                                                 | The maintainer                          |

CI skips the work a PR's changes can't affect, and a skipped check counts as passing. Which checks run for which changed files is in [`.github/CLAUDE.md`](.github/CLAUDE.md), and the filter itself is the "Decide which jobs run" step in [`ci.yml`](.github/workflows/ci.yml).

## Opening a pull request

1. Find or open an issue, and start your branch from `dev`. Name it `<TICKET_NUMBER>-<name>`, for example `38-sync-reduce`.
2. Start each commit message with the ticket number and a space, without `#`: `38 Return the value from sync reduce`. Git deletes lines that start with `#` as comments whenever it opens a message in your editor, such as when a rebase stops on a conflict, so a `#N` subject would be lost. Commits on a `hotfix/*` branch have no ticket number.
3. If users can notice the change (a fix, a feature, a changed behaviour or type), add a line under `## [Unreleased]` in [`CHANGELOG.md`](CHANGELOG.md). A breaking change says how to migrate.
4. Open the PR against `dev`, with `Closes #N`, `Fixes #N` or `Resolves #N` in its description. The issue has to be open; it closes when the PR merges. Title the PR with its branch name, and add a colon and a few words when the name doesn't explain it: `38-sync-reduce: return the value, not a Promise`.
5. Keep the branch up to date by rebasing (see below).

A bug fix comes with a test that fails without it. A new operator or resolver works in all three flows, is tested in each, and has JSDoc with an example whose shown output is the real output.

When an issue is too big for one PR, split it. Pieces that can't be built on their own become [sub-issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues) of the original issue (`gh issue create --parent <N>`). Work that can be built on its own becomes a separate issue. The same goes for whatever a PR leaves undone: move it to a sub-issue or a separate issue before the PR merges.

## When a PR can merge

A PR merges only when it's up to date with its base branch and every required check has passed on its current head commit. This holds for the maintainer too: the rulesets have no bypass.

When a PR falls behind, rebase it onto its base and push:

```bash
git fetch origin
```

```bash
git rebase origin/dev
```

```bash
git push --force-with-lease
```

Or press "Update branch" on the PR and pick "Update with rebase", not "Update with merge commit". After GitHub rebases the branch, fetch and reset or rebase your local branch onto it before pushing again.

GitHub's rebase drops empty commits, but `git rebase` keeps them. So "Update branch" on a draft PR whose only commit is an empty "Start" commit moves the branch to the base's tip, and GitHub then closes the PR. Rebase such a PR with `git rebase` instead.

## Answering review comments

The maintainer reviews PRs on GitHub. Answer every comment on your PR on GitHub, in that comment's thread, so the PR records what was asked and what came of it. Reviews and plain PR comments have no threads, so answer them with a PR comment that quotes them. When the answer is about code, link the commit or a permalink to the line, not a branch, which moves.

Claude Code sessions follow the same rules, with the commands in the [`pull-requests` skill](.claude/skills/pull-requests/SKILL.md). The rules sessions follow are in [`CLAUDE.md`](CLAUDE.md).

## Rebasing PRs after a merge

Each merge leaves every other open PR behind. After merging, the maintainer catches them up with the [`rebase-prs`](.claude/skills/rebase-prs/SKILL.md) Claude Code skill, or its script from the repository root:

```bash
node .claude/skills/rebase-prs/rebase-prs.mts
```

It rebases each open, ready PR into `dev` that has fallen behind and doesn't conflict, the same as "Update with rebase". It skips drafts, PRs from forks and the release PR, comments once on a PR that conflicts, and asks Dependabot to rebase its own PRs. Add `main` for PRs into `main`, or `--dry-run` to only print what it would do. Its pushes come from whoever `gh` is signed in as, so CI runs on each rebased PR.

## Your email address

Everything you push stays public, including your commits' author and committer addresses. Commit with your [GitHub noreply address](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-email-preferences/setting-your-commit-email-address), and turn on "Keep my email addresses private" and "Block command line pushes that expose my email" in your [email settings](https://github.com/settings/emails).

## Reporting a security vulnerability

Don't open a public issue or pull request about a vulnerability. Report it privately with the [Report a vulnerability](https://github.com/jEnbuska/yielded/security/advisories/new) form. [`SECURITY.md`](SECURITY.md) says what to include and what happens next.

## Hotfixes

A hotfix is a `hotfix/*` branch into `dev` that doesn't need an issue. It's released like everything else, through `dev`. Only branches in this repository count, because a fork can name a branch anything, so a fix from a fork links an issue.

## Dependabot

Dependabot keeps the GitHub Actions in the workflows up to date and does nothing else. [`.github/dependabot.yml`](.github/dependabot.yml) checks `dev` weekly and opens one PR into `dev` with every action that has a release at least a week old. Every action is pinned to a commit SHA, with its version in a comment, and Dependabot updates both.

- Its PRs don't link an issue: `PR rules` lets a PR through without one when Dependabot opened it from a `dependabot/*` branch.
- To update one, comment `@dependabot rebase` rather than rebasing it yourself: once someone else pushes to its branch, Dependabot stops updating it.
- It doesn't update or audit the npm dependencies. `pnpm audit` in CI and the weekly [`audit.yml`](.github/workflows/audit.yml) check them, and they're updated by hand, in a PR that links an issue.

## Releases

Only the maintainer releases. A release publishes `dev`'s current commit to npm as the version in `package.json`.

1. In a PR into `dev`, set the new version in `package.json` and move the `## [Unreleased]` entries in `CHANGELOG.md` under a heading for it, following [Semantic Versioning](https://semver.org/).
2. Open the release PR from `dev` into `main`, titled `Release <version>`:

   ```bash
   gh pr create --base main --head dev --title "Release <version>"
   ```

3. When every check has passed on it, the full dependency audit included, publish from **Actions → Release → Run workflow**, with `dev` under "Use workflow from". Only the repository owner can run it. It checks the release PR, fast-forwards `main` to that exact commit, publishes it to npm with provenance and tags it `v<version>`.

The Release workflow is tracked in [#34](https://github.com/jEnbuska/yielded/issues/34). Until it's in place, release by hand: fast-forward `main` with `git push origin origin/dev:refs/heads/main` (GitHub accepts it because the release PR has that exact commit with passing checks, and marks the PR as merged), then publish from an up-to-date `main` with `pnpm publish --access public`, or `pnpm publish:beta` for a pre-release under the `beta` tag.

### Never press the merge button on a release PR

"Rebase and merge" always creates new commit hashes, so `main` would have commits that `dev` doesn't, and the next release PR would be behind `main`. With a fast-forward, `main` and `dev` are the same commit.

## Where the rules are enforced

| Rule                                     | Defined in                                                                                             | Enforced by                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| PRs only, no force-push or deletion      | The `dev` and `main` rulesets, under repository settings                                               | GitHub, with no bypass for admins        |
| Checks pass, branch up to date           | The same rulesets, as required checks and code scanning rule                                           | GitHub, with no bypass for admins        |
| Rebase only, no merge commits            | Repository merge settings and the same rulesets                                                        | GitHub                                   |
| Allowed source, open issue, no empty PRs | [`pr-rules.yml`](.github/workflows/pr-rules.yml)                                                       | GitHub, as the required `PR rules` check |
| Only the maintainer merges               | The repository's collaborators: the maintainer is the only one                                         | GitHub, as nobody else has write access  |
| Only the owner publishes                 | The Release workflow ([#34](https://github.com/jEnbuska/yielded/issues/34)) and npm trusted publishing | The workflow's owner check and npm       |

`PR rules` uses `pull_request_target`, so its code comes from `dev` and a PR can't change the check that judges it. It reads the PR's details and never runs the PR's code.
