# Quick Start: Branch Protection Setup with Hybrid CI

## Current Status

✅ **CI Workflow Configured**
- Hybrid trigger mode: Automatic after merge + Manual for PRs
- 4 quality checks: TypeScript, ESLint, Prettier, Tests
- Post-merge verification automatic
- Pre-merge verification manual

## What You Need to Do

### Step 1: Enable Branch Protection (5-10 minutes)

**Configure for both `main` and `release-*` branches:**

1. Go to https://github.com/jEnbuska/yielded/settings/branches
2. Click "Add branch protection rule"
3. For `main` branch:
   - Branch name pattern: `main`
   - ✅ **Require a pull request before merging**
   - ✅ **Require approvals: 1** (only you can approve)
   - ✅ **Dismiss stale pull request approvals when new commits are pushed**
   - ✅ **Require status checks to pass before merging**
     - Must manually trigger CI from PR first
     - Then select: `TypeScript Validation`, `ESLint`, `Prettier Format Check`, `Test Suite`
   - ✅ **Restrict who can dismiss pull request reviews** (Repository administrators only)
   - ✅ **Do not allow bypassing the above settings**
   - ✅ **Restrict who can push to matching branches** (Leave empty for PR-only)
   - Click "Create" or "Save changes"

4. Repeat for `release-*` branches:
   - Branch name pattern: `release-*`
   - Apply the exact same settings
   - Click "Create" or "Save changes"

### Step 2: Understand the Workflow

**For Pull Requests to Protected Branches:**

1. ✅ Create PR to `main` or `release-*`
2. ✅ **Manually trigger CI** from PR Checks tab
3. ✅ Wait for all 4 checks to pass
4. ✅ **Only you can approve** the PR
5. ✅ Merge the PR
6. ✅ **CI runs automatically** after merge

**If PR is changed after approval:**
- ⚠️ Approval automatically dismissed
- ⚠️ Manually trigger CI again
- ⚠️ All checks must pass again
- ⚠️ Re-approve before merging

### How to Trigger CI from a PR:

**Option 1: From PR Checks Tab (Recommended)**
1. Open the Pull Request
2. Go to **Checks** tab
3. Find the CI workflow
4. Click "Run workflow" or "Re-run jobs"

**Option 2: From Actions Tab**
1. Go to Actions → CI → Run workflow
2. Select PR branch
3. Click "Run workflow"

## What This Achieves

✅ **Protected Branches (main & release-*):**
- Cannot push directly - must use PRs
- Only you can approve PRs
- Approval dismissed on new commits (automatic re-approval required)
- Status checks must pass (after manual trigger)
- CI runs automatically after merge for verification

✅ **Quality Assurance:**
- TypeScript Validation
- ESLint
- Prettier Format Check
- Test Suite
- All must pass before merge

✅ **Security:**
- Only you control PR approvals
- Only you can trigger CI checks
- No bypassing the rules (even for admins)

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
