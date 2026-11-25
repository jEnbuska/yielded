---
name: rebase-prs
description: Rebase every open, ready PR into dev (or main) that has fallen behind its base, unless it conflicts, and comment once on each PR that conflicts. Use right after the user merges a PR, or when the user asks to update, rebase or catch up the open PRs.
---

# Rebase PRs that are behind

The rulesets only let a PR merge when it's up to date with its base, so every merge leaves the other open PRs behind. This skill catches them up, the same as "Update with rebase" on each PR, so the user can merge the next one without waiting for a manual rebase.

## Run it

From the repository root, in the background, because it waits for GitHub after each rebase and can take a few minutes:

```bash
node .claude/skills/rebase-prs/rebase-prs.mts
```

- PRs into `dev` by default. After a release, add `main` for PRs into `main`.
- `--dry-run` only prints what it would do. Use it when the user asks what's behind, without asking for a rebase.

It acts as the signed-in `gh` user, so the pushes start CI on the rebased PRs.

## What it does with each PR

- **Draft, from a fork, or the release PR from `dev`:** skipped. A session is still pushing to a draft, and it rebases the draft itself before `gh pr ready`.
- **Behind `dev` and rebases cleanly:** rebased with GraphQL `updatePullRequestBranch` and `updateMethod: REBASE`, never the REST `update-branch`, which merges. `expectedHeadOid` makes it lose to a push that lands at the same moment.
- **Conflicts:** left unchanged, with one comment telling the author to rebase onto `origin/<base>`. A later run doesn't repeat the comment while it still conflicts, and edits it once the conflict is gone.
- **Up to date:** left alone, whatever its checks say.
- **Dependabot's PRs** (author `dependabot`, branch `dependabot/*`), behind or conflicting: never rebased by the script. It comments `@dependabot rebase`, because Dependabot stops updating a PR once someone else pushes to its branch. Report them as asked, not rebased.

## Afterwards

1. Tell the user, with a markdown link for each PR, which ones were rebased, which conflict, and which were skipped and why. If the script exits non-zero, report the PRs it couldn't handle and its error output.
2. A rebased PR's branch has moved on GitHub. If a session in this session's family owns that PR, send it a message: its next `git push --force-with-lease` will be rejected, so it has to `git fetch origin`, rebase its local commits onto `origin/<branch>`, and push again.
3. Never resolve another PR's conflict, merge `dev` into a branch or merge a PR as part of this. Conflicts are for that PR's session or author.
