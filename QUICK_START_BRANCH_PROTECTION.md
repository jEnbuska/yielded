# Quick Start: Branch Protection Setup

## Current Status

✅ **Pull Request Created**
- PR #1: "Merge 3 cleanup commits from data-pipes repository"
- From: `copilot/copy-main-data-pipes`
- To: `main`
- Status: Ready for your review
- URL: https://github.com/jEnbuska/yielded/pull/1

✅ **Documentation Created**
- Complete setup guide in `BRANCH_PROTECTION_SETUP.md`
- PR template in `.github/PULL_REQUEST_TEMPLATE.md`

## What You Need to Do

### Step 1: Review and Approve PR #1

1. Go to https://github.com/jEnbuska/yielded/pull/1
2. Review the changes
3. Approve the PR (if you want branch protection to apply to this PR, enable it first)
4. Merge the PR to main

### Step 2: Enable Branch Protection (5-10 minutes)

**Quick Steps:**

1. Go to https://github.com/jEnbuska/yielded/settings/branches
2. Click "Add branch protection rule"
3. For `main` branch:
   - Branch name pattern: `main`
   - ✅ Require a pull request before merging
   - ✅ Require approvals: **1**
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Do not allow bypassing the above settings
   - Click "Create" or "Save changes"

4. Click "Add branch protection rule" again
5. For `release-*` branches:
   - Branch name pattern: `release-*`
   - Apply the same settings as above
   - Click "Create" or "Save changes"

**Detailed Instructions:** See `BRANCH_PROTECTION_SETUP.md` for complete guide with screenshots descriptions.

## What This Achieves

Once branch protection is enabled:

✅ **main branch:**
- Cannot be pushed to directly
- All changes must go through a Pull Request
- You must approve PRs before they can be merged
- If new commits are pushed after approval, you must re-approve

✅ **release-* branches:**
- Same protection as main
- Applies to: release-v1.0.0, release-2024-02-10, etc.

❌ **What won't work anymore:**
```bash
git push origin main  # ← Will be rejected
```

✅ **What will work:**
1. Create a feature branch
2. Push to feature branch
3. Open PR to main
4. Get your approval
5. Merge through PR

## Testing Branch Protection

After enabling, test it:

```bash
# This should fail:
git checkout main
echo "test" >> README.md
git commit -am "test"
git push origin main
# Expected: remote: error: GH006: Protected branch update failed

# This should work:
git checkout -b test-protection
echo "test" >> README.md
git commit -am "test"
git push origin test-protection
# Then create PR and approve it
```

## Support

- Full guide: `BRANCH_PROTECTION_SETUP.md`
- GitHub Docs: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
- Questions: Open an issue in this repository

---

**Time Estimate:** 5-10 minutes to complete branch protection setup
