# Branch Protection Setup Guide

This document provides step-by-step instructions for configuring branch protection rules for the `yielded` repository.

## Overview

The following branches require protection:
- `main` - The primary branch
- `release-*` - Any branch starting with "release-"

## Protection Rules Required

All protected branches must:
1. **Require pull requests** - Direct pushes are blocked
2. **Require approval** - PRs must be approved by @jEnbuska before merging
3. **Dismiss stale approvals** - If new commits are pushed after approval, re-approval is required
4. **Prevent bypass** - Even admins must follow these rules

---

## Step-by-Step Setup Instructions

### Part 1: Protect the `main` Branch

1. **Navigate to Repository Settings**
   - Go to https://github.com/jEnbuska/yielded
   - Click on **Settings** (requires admin access)
   - In the left sidebar, click **Branches** under "Code and automation"

2. **Add Branch Protection Rule**
   - Click **Add branch protection rule** (or **Add rule**)
   - In the "Branch name pattern" field, enter: `main`

3. **Configure Protection Settings**
   
   ✅ **Enable these settings:**
   
   - [ ] ☑️ **Require a pull request before merging**
     - [ ] ☑️ **Require approvals** 
       - Set "Required number of approvals before merging" to: **1**
     - [ ] ☑️ **Dismiss stale pull request approvals when new commits are pushed**
     - [ ] ☑️ **Require review from Code Owners** (optional, if you set up CODEOWNERS file)
   
   - [ ] ⚠️ **Require status checks to pass before merging** - **OPTIONAL WITH MANUAL CI**
     - **Note:** Since CI uses manual triggers, status checks won't automatically block PRs
     - You can still enable this if you manually trigger CI before merging
     - [ ] ☑️ **Require branches to be up to date before merging** (recommended)
     - To enable automatic blocking:
       1. Manually trigger CI workflow for each branch: Actions → CI → Run workflow
       2. After checks complete, the status checks will appear here
       3. Search for and select: `TypeScript Validation`, `ESLint`, `Prettier Format Check`, `Test Suite`
     - **Important:** With manual triggers, YOU must remember to run CI before merging
     - These checks run only when manually triggered via GitHub Actions (see `.github/workflows/ci.yml`)
   
   - [ ] ☑️ **Require conversation resolution before merging** (optional but recommended)
   
   - [ ] ☑️ **Do not allow bypassing the above settings**
     - This ensures even repository admins must follow the rules
   
   - [ ] ☑️ **Restrict who can push to matching branches** (optional)
     - If enabled, you can specify which users/teams can push
     - For strictest security, leave empty to block all direct pushes

4. **Save the Rule**
   - Scroll to the bottom
   - Click **Create** or **Save changes**

### Part 2: Protect `release-*` Branches

1. **Add Another Branch Protection Rule**
   - Still in Settings → Branches
   - Click **Add branch protection rule** again
   - In the "Branch name pattern" field, enter: `release-*`
   - The asterisk `*` is a wildcard that matches any characters

2. **Configure the Same Settings**
   - Apply the **exact same settings** as for the `main` branch:
     - ☑️ Require a pull request before merging
     - ☑️ Require approvals: **1**
     - ☑️ Dismiss stale pull request approvals when new commits are pushed
     - ☑️ Do not allow bypassing the above settings

3. **Save the Rule**
   - Click **Create** or **Save changes**

---

## Verification

After setting up branch protection, verify it works:

1. **Test Direct Push Protection**
   ```bash
   # Try to push directly to main (should fail)
   git checkout main
   git commit --allow-empty -m "test"
   git push origin main
   # Expected: Error message about branch protection
   ```

2. **Test PR Workflow**
   - Create a new branch
   - Make changes and push
   - Open a PR to `main`
   - Verify you cannot merge without approval
   - Approve the PR as @jEnbuska
   - Verify you can now merge
   - Push another commit to the PR branch
   - Verify the merge button is disabled again (requires re-approval)

---

## Current Pull Request

**PR #1** is ready for your review:
- **Title:** Merge 3 cleanup commits from data-pipes repository
- **From:** `copilot/copy-main-data-pipes`
- **To:** `main`
- **Status:** Ready for review
- **URL:** https://github.com/jEnbuska/yielded/pull/1

Once branch protection is enabled, this PR will require your approval before it can be merged.

---

## Additional Recommendations

### 1. Enable Required Status Checks (Optional)
If you add CI/CD workflows (GitHub Actions), you can require them to pass:
- Go to branch protection settings
- Enable "Require status checks to pass before merging"
- Select which checks must pass (e.g., "build", "test", "lint")

### 2. Create a CODEOWNERS File (Optional)
Create `.github/CODEOWNERS` to automatically request reviews:
```
# Default owner for everything
* @jEnbuska

# Specific paths
/src/** @jEnbuska
/tests/** @jEnbuska
```

### 3. Set Up Branch Naming Convention
For release branches, consider using:
- `release-v1.0.0`
- `release-2024-02-10`
- `release-feature-name`

All these will be protected by the `release-*` pattern.

---

## Troubleshooting

**Problem:** Cannot enable branch protection (settings grayed out)
- **Solution:** Ensure you have admin permissions on the repository

**Problem:** "Do not allow bypassing" is not available
- **Solution:** This option requires a GitHub Pro, Team, or Enterprise account

**Problem:** Merge button still available without approval
- **Solution:** 
  1. Check that the rule is saved and active
  2. Ensure "Required number of approvals" is set to at least 1
  3. Verify you're not testing as the PR author (authors cannot approve their own PRs)

---

## Summary Checklist

- [ ] Branch protection rule created for `main`
- [ ] Branch protection rule created for `release-*`
- [ ] Require pull request before merging: **Enabled**
- [ ] Required approvals: **1** (by @jEnbuska)
- [ ] Dismiss stale approvals: **Enabled**
- [ ] Cannot bypass settings: **Enabled**
- [ ] Tested with a sample PR
- [ ] PR #1 reviewed and approved
- [ ] PR #1 merged to main

---

## References

- [GitHub Docs: About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Docs: Managing a branch protection rule](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)
