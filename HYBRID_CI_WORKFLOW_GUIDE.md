# Hybrid CI Workflow Guide

## Overview

The repository uses a **hybrid CI workflow** that combines automatic and manual triggers:
- ✅ **Automatic** runs after merging to protected branches (post-merge verification)
- ✅ **Manual** runs for pull request validation (pre-merge verification)

This provides strong quality assurance while optimizing costs.

## How It Works

### For Pull Requests → Manual Trigger Required

When creating a PR to `main` or `release/*` branches:

1. **You create the PR**
   - Push your branch and open a PR to a protected branch
   - The PR will show no status checks initially

2. **You manually trigger CI**
   - Open the PR on GitHub
   - Go to the **Checks** tab
   - Find the CI workflow
   - Click **"Run workflow"** or **"Re-run jobs"**
   - Only repository owner (you) can do this

3. **CI runs all checks**
   - TypeScript Validation
   - ESLint
   - Prettier Format Check
   - Test Suite
   - All run in parallel for speed

4. **You verify results**
   - Wait for green checkmarks on all 4 checks
   - If any fail, fix the issues and trigger CI again

5. **You approve the PR**
   - Only you (repository owner) can approve
   - Branch protection enforces this restriction

6. **You merge the PR**
   - Merge button only enables after:
     - All status checks pass
     - You have approved the PR
   - Click "Merge pull request"

7. **CI runs automatically after merge**
   - Post-merge verification happens automatically
   - Ensures the integrated code is still healthy
   - No manual trigger needed

### For Direct Pushes → Automatic Trigger

When code is merged to protected branches:

1. **PR is merged**
   - Code is integrated into `main` or `release/*`

2. **CI triggers automatically**
   - Workflow runs immediately on push
   - No manual intervention required

3. **All checks run**
   - Same 4 checks as manual runs
   - Verifies the merged code

4. **Results are recorded**
   - Check the Actions tab for results
   - You'll be notified if anything fails

## Step-by-Step PR Workflow

### Step 1: Create Your Branch and Push
```bash
git checkout -b feature/my-feature
# Make your changes
git commit -am "Add my feature"
git push origin feature/my-feature
```

### Step 2: Open Pull Request
1. Go to GitHub repository
2. Click "Compare & pull request" or "New pull request"
3. Select base: `main` (or `release/*`)
4. Select compare: your feature branch
5. Fill in PR details
6. Click "Create pull request"

### Step 3: Trigger CI Manually
1. In your PR, click the **Checks** tab
2. You'll see "CI" workflow
3. Click **"Run workflow"** button
4. Confirm the run

**Alternative:** From Actions tab
- Go to Actions → CI → Run workflow
- Select your branch
- Click "Run workflow"

### Step 4: Wait for Checks
Monitor the Checks tab:
- ✅ Green checkmark = Passed
- ❌ Red X = Failed
- 🟡 Yellow circle = Running

If checks fail:
1. Review the error logs (click on failed check)
2. Fix the issues in your code
3. Push the fixes
4. Trigger CI again (repeat Step 3)

### Step 5: Approve the PR
1. After all checks pass, approve the PR
2. Click "Review changes"
3. Select "Approve"
4. Submit review

**Only you (repository owner) can approve PRs to protected branches.**

### Step 6: Merge
1. Click "Merge pull request"
2. Confirm the merge
3. CI will run automatically after merge

### If You Make Changes After Approval

**What happens:**
- Your approval is **automatically dismissed** (stale approval dismissal)
- Status checks are **cleared**
- Merge button is **disabled again**

**What you need to do:**
1. Manually trigger CI again (Step 3)
2. Wait for all checks to pass (Step 4)
3. Re-approve the PR (Step 5)
4. Then merge (Step 6)

## Triggering CI from PR Checks Tab

The easiest way to trigger CI for a PR:

1. **Open the PR** on GitHub
2. **Click the "Checks" tab** (next to "Conversation", "Commits", "Files changed")
3. **Find the CI workflow** in the left sidebar
4. **Click "Run workflow"** or "Re-run jobs" button
5. **Wait for completion** - all 4 checks must pass

## Branch Protection Settings

Required settings for `main` and `release/*` branches:

✅ **Require a pull request before merging**
- Required approvals: 1
- Restrict reviewers to repository administrators

✅ **Dismiss stale pull request approvals when new commits are pushed**
- Automatic re-approval required after changes

✅ **Require status checks to pass before merging**
- Select: TypeScript Validation, ESLint, Prettier Format Check, Test Suite
- Require branches to be up to date before merging

✅ **Do not allow bypassing the above settings**
- Even admins must follow the rules

✅ **Restrict who can push to matching branches**
- Leave empty to only allow PR merges

## Cost Optimization

The hybrid model optimizes costs by:

✅ **No automatic runs on every push**
- PRs require manual trigger
- You control when to run CI for PRs
- Saves minutes on work-in-progress commits

✅ **Automatic verification after merge**
- Only runs once after PR is merged
- Not on every commit during PR development
- Ensures integrated code is verified

✅ **Strategic triggering**
- Trigger only when PR is ready for review
- Not during experimental or draft work
- Maximum quality with minimum cost

## Common Scenarios

### Scenario 1: Simple PR
1. Create PR
2. Trigger CI manually
3. All checks pass
4. Approve and merge
5. CI runs automatically after merge

### Scenario 2: PR with Failing Checks
1. Create PR
2. Trigger CI manually
3. Some checks fail
4. Fix issues and push
5. Trigger CI manually again
6. All checks pass
7. Approve and merge

### Scenario 3: Changes After Approval
1. Create PR
2. Trigger CI manually, checks pass
3. Approve PR
4. Make additional changes and push
5. Approval dismissed automatically
6. Trigger CI manually again
7. All checks pass
8. Re-approve PR
9. Merge

### Scenario 4: Emergency Hotfix
1. Create hotfix branch
2. Create PR to `main` or `release/*`
3. Trigger CI manually
4. Verify all checks pass
5. Approve and merge quickly
6. CI verifies after merge

## Troubleshooting

### "Can't find Run workflow button"
**Problem:** The button doesn't appear in the Checks tab.

**Solution:**
- Ensure the PR targets `main` or `release/*` branch
- Try refreshing the page
- Use Actions tab → CI → Run workflow as alternative
- Only repository owner can see/use this button

### "Merge button is disabled"
**Problem:** Can't merge even though checks passed.

**Solution:**
- Ensure all 4 checks show green checkmarks
- Verify you've approved the PR
- Check if approval was dismissed (new commits)
- Ensure branch protection is properly configured

### "Checks don't appear in settings"
**Problem:** Can't select status checks in branch protection.

**Solution:**
- Trigger CI workflow at least once first
- Wait for it to complete
- Then the checks will appear in settings
- Select all 4 checks

### "Approval keeps getting dismissed"
**Problem:** Approval disappears after pushing changes.

**Solution:**
- This is intentional (stale approval dismissal)
- Trigger CI again after changes
- Wait for checks to pass
- Re-approve the PR

## Best Practices

1. **Run checks locally first**
   ```bash
   npm run validate && npm run lint && npm run prettier && npm run test
   ```

2. **Trigger CI when PR is ready**
   - Not during draft/WIP stage
   - When you think it's ready for review

3. **Review CI results carefully**
   - Click on failed checks to see details
   - Fix all issues before re-triggering

4. **Use meaningful commit messages**
   - Helps understand what changed
   - Useful when approval is dismissed

5. **Keep PRs focused and small**
   - Easier to review
   - Faster to verify
   - Less likely to have issues

## Summary

✅ **For PRs:** Manual trigger required (you control when)
✅ **After merge:** Automatic run (verification)
✅ **Only you:** Can trigger CI and approve PRs
✅ **Stale dismissal:** Re-approval required after changes
✅ **Quality guaranteed:** All checks must pass before merge
✅ **Cost optimized:** Strategic triggering reduces waste

This workflow provides maximum security and quality assurance while minimizing unnecessary CI costs.
