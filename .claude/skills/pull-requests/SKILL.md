---
name: pull-requests
description: Steps and gh commands for working a ticket's PR in this repository, from the draft to ready. Use when opening a PR, pushing to or updating one, turning on Auto-fix, answering a review comment, review or PR comment, handling a CI failure or merge conflict on it, rebasing it onto dev, marking it ready, or after the user merges it.
---

# Working a PR

The rules are in the root `CLAUDE.md`, under "Tickets and sessions", "Branches, commits and PRs" and "Merging and releasing". This skill has the steps and commands for following them. Where the two seem to differ, `CLAUDE.md` wins.

## 1. Start

1. Rename the session so its title starts with the ticket number, for example `#38 Sync reduce returns a Promise`.
2. Set the ticket's status label: `gh issue edit <N> --add-label "in progress" --remove-label todo`.
3. Open a draft PR into `dev` as soon as work starts, so the PR list shows what's being worked on. If there's nothing to commit yet, start with an empty commit:

   ```bash
   git commit --allow-empty -m "<N> Start"
   git push -u origin <branch>
   gh pr create --draft --base dev --title "<branch>" --body-file <file>
   ```

   - The title is the branch name, with a colon and a few words when the branch name doesn't explain the PR.
   - The body links the ticket with `Closes #N` from the start, and says what's planned and what's done so far.

## 2. Turn on PR monitoring

Right after opening the PR, turn on PR monitoring if the environment has it. Only the session itself can, so don't wait to be asked.

- In the Claude desktop app it's the PR's Auto-fix switch: the `set_monitor` tool with `auto_fix: true` and `address_comments: true`. It wakes the session on review comments, CI failures and merge conflicts. If the tool is refused, say so.
- Without PR monitoring, check the PR's comments and reviews whenever the session is resumed and before marking the PR ready (section 4 has the commands).
- `gh event listen` is a GitHub preview, so don't rely on it.

## 3. While working

- Push often and keep the PR body current, as the root says.
- Commit subjects follow the root's commit format. If git opens a `#N` message in the editor, for example when a rebase stops on a conflict, restore its subject before saving, because git drops lines that start with `#`.

## 4. Answering comments

The root's rule says which comments to answer, when, and what to link. The commands:

1. List review comments and their ids: `gh api repos/{owner}/{repo}/pulls/<PR>/comments`.
2. Reply to a review comment in its thread: `gh api repos/{owner}/{repo}/pulls/<PR>/comments/<ID>/replies -f body='...'`. `<ID>` is the thread's first comment, because GitHub doesn't take replies to replies, so for a reply use its `in_reply_to_id`.
3. Reviews and plain PR comments have no threads: `gh pr view <PR> --comments` shows them, and `gh pr comment <PR> --body '...'` answers them, quoting the comment being answered.
4. Push the commit before linking it. Link it as `https://github.com/<owner>/<repo>/commit/<sha>`, or a line as `https://github.com/<owner>/<repo>/blob/<sha>/<path>#L<n>` (`#L<n>-L<m>` for a range).
5. List the replies in the session's chat, linking each one.

## 5. CI failures

What to do about each kind of failure is in the root's "Branches, commits and PRs": one the PR caused, one it didn't, the dependency check, the full audit and CodeQL. `.github/CLAUDE.md` says what CI runs for which changes, and what the audits and CodeQL check. The commands:

- See why a run failed: `gh pr checks <PR>`, then `gh run view <run-id> --log-failed`. The dependency check's log and job summary name the package, the advisory and the fixed version.
- List the PR's open CodeQL alerts: `gh api "repos/{owner}/{repo}/code-scanning/alerts?ref=refs/pull/<PR>/merge&state=open"`.
- Dismiss an alert, only with the user's OK: `gh api -X PATCH repos/{owner}/{repo}/code-scanning/alerts/<number> -f state=dismissed -f dismissed_reason='false positive' -f dismissed_comment='...'` (or `won't fix`), and put the reason in the PR.

## 6. Rebasing

Keep the branch up to date by rebasing onto `origin/dev`, never merging `dev` into it:

```bash
git fetch origin
git rebase origin/dev
git push --force-with-lease
```

The `rebase-prs` skill rewrites a ready PR's branch on GitHub under its session, so the next `git push --force-with-lease` is rejected. Never force it. Put the local commits on top of the rebased branch and push again:

```bash
git fetch origin
git rebase origin/<branch>
git push --force-with-lease
```

With no local commits that aren't pushed, `git reset --hard origin/<branch>` replaces the rebase.

A PR that conflicts gets one comment from `rebase-prs`. Its session then rebases it itself.

## 7. Marking it ready

1. Rebase onto `origin/dev` (section 6).
2. Check what the root requires before `gh pr ready`: the ticket's definition of done, CI, and, without PR monitoring, every comment answered.
3. Run `gh pr ready`. List the checks that can only run after merging in the PR body.
4. Move any work the PR leaves undone to a sub-issue or a separate ticket, as the root says, before the PR merges (the sub-issue command is in the root's "Tickets and sessions").

## 8. After the user merges

Only the user merges (the root's "Merging and releasing"). After they do:

1. Run the `rebase-prs` skill, so the other ready PRs catch up.
2. Check that the ticket is closed, and close it with `gh issue close <N>` if it isn't, for example when a different PR resolved it or no PR was needed.
