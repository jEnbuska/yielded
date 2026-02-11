# Branch Deletion Settings

## Issue: Branches Automatically Deleted After PR Merge

When pull requests are merged in this repository, the source branches are automatically deleted from GitHub immediately after merging. This is caused by GitHub's **"Automatically delete head branches"** repository setting.

### What's Happening

After a PR is merged:
1. ✅ The PR is successfully merged into the target branch (e.g., `main`)
2. ❌ The source branch (e.g., `feature/my-feature`) is **immediately deleted** from the remote repository
3. ⚠️ The branch history becomes harder to track
4. ⚠️ References to the branch in commit messages or external tools may break

### Example

Recent merged PRs where branches were auto-deleted:
- PR #20: `copilot/add-npm-link-to-readme` - **branch deleted after merge**
- PR #19: `release/v1.1.0` - **branch deleted after merge**
- PR #18: `copilot/update-readme-node-compatibility` - **branch deleted after merge**

## Solution: Disable Automatic Branch Deletion

To prevent branches from being automatically deleted after merging PRs, follow these steps:

### Step 1: Navigate to Repository Settings

1. Go to https://github.com/jEnbuska/yielded
2. Click on **Settings** (requires admin access)
3. Scroll down to the **"Pull Requests"** section

### Step 2: Disable Automatic Deletion

1. Find the checkbox: **"Automatically delete head branches"**
2. **Uncheck** this box to disable automatic deletion
3. The setting is saved automatically (no "Save" button needed)

### Step 3: Verify the Change

After disabling this setting:
1. Create a test branch and PR
2. Merge the PR
3. Verify that the branch still exists after merge:
   ```bash
   git ls-remote --heads origin
   ```

## Alternative: Manual Branch Cleanup

If you prefer to keep automatic deletion disabled but want to clean up old branches occasionally, you can:

### Option 1: Delete Branches Manually via GitHub UI

1. Go to https://github.com/jEnbuska/yielded/branches
2. Click **"All branches"** tab
3. Review merged branches
4. Click the **trash icon** next to branches you want to delete

### Option 2: Delete Branches via Git Command Line

```bash
# List all remote branches
git ls-remote --heads origin

# Delete a specific branch
git push origin --delete branch-name

# Or delete multiple branches at once
git branch -r --merged main | grep -v main | sed 's/origin\///' | xargs -I {} git push origin --delete {}
```

## Best Practices

### When to Keep Branches

- **Release branches** - Keep for historical reference and potential hotfixes
- **Long-lived feature branches** - Keep if work might resume
- **Important milestones** - Keep branches that mark significant changes

### When to Delete Branches

- **Short-lived feature branches** - After successful merge and verification
- **Hotfix branches** - After merge and deployment verification
- **Experiment branches** - After extracting useful changes

## Current Status

✅ **Issue Identified**: Automatic branch deletion is currently **ENABLED**  
⚠️ **Action Required**: Repository owner needs to disable this setting in GitHub repository settings

## References

- [GitHub Docs: Managing the automatic deletion of branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-the-automatic-deletion-of-branches)
- [GitHub Docs: Viewing branches in your repository](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/viewing-branches-in-your-repository)
