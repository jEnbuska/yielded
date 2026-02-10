# CI Setup Complete - Hybrid Trigger Mode

## ✅ What Has Been Done

GitHub Actions CI workflow has been successfully configured with a **hybrid trigger model**:

1. **Runs AUTOMATICALLY** after merging to `main` or `release-*` branches (post-merge verification)
2. **Runs MANUALLY** for pull request verification (pre-merge validation)
3. **Executes 4 quality checks** in parallel when triggered:
   - ✅ TypeScript Validation (`npm run validate`)
   - ✅ ESLint (`npm run lint`)
   - ✅ Prettier Format Check (`npm run prettier`)
   - ✅ Test Suite (`npm run test`)

## 🎮 How to Trigger CI for Pull Requests

**Only you (repository owner) can manually trigger the workflow for PRs:**

### Option 1: From Pull Request (Recommended)
1. Open the Pull Request on GitHub
2. Go to the **Checks** tab
3. Find the **CI** workflow
4. Click **"Run workflow"** or **"Re-run jobs"**
5. Wait for all checks to complete

### Option 2: From Actions Tab
1. Go to **Actions** tab: https://github.com/jEnbuska/yielded/actions
2. Click on **CI** workflow in the left sidebar
3. Click **Run workflow** button (top right)
4. Select the PR branch to test
5. Optionally add a reason
6. Click **Run workflow**

## 📋 Complete PR Workflow

### For Pull Requests to Protected Branches:

1. ✅ **Create PR** to `main` or `release-*` branch
2. ✅ **Manually trigger CI** from the PR Checks tab
3. ✅ **Wait for all 4 checks** to pass (green checkmarks)
4. ✅ **Repository owner approves** the PR (only you can approve)
5. ✅ **Merge** the PR
6. ✅ **CI runs automatically** after merge for verification

### If Changes Are Made After Approval:
- ⚠️ **Approval is automatically dismissed** (stale approval dismissal)
- ⚠️ **Manually trigger CI again** from PR Checks tab
- ⚠️ **Wait for all checks to pass** again
- ⚠️ **Re-approve the PR** before merging

## 🔄 Automatic Runs

CI runs **automatically without manual trigger** when:
- Code is pushed to `main` branch (after PR merge)
- Code is pushed to `release-*` branches (after PR merge)

This provides post-merge verification to ensure the integrated code is healthy.

## ⚠️ Important Notes

### Branch Protection Required
To enforce the workflow:
1. **Require pull request approvals** (only repository owner)
2. **Dismiss stale approvals** on new commits
3. **Require status checks** to pass before merging
4. **Restrict who can approve PRs** (repository owner only)

See branch protection setup guide for detailed configuration.

### Cost Optimization
- ✅ Manual triggering for PRs reduces unnecessary runs
- ✅ Automatic runs only after merges (not on every commit)
- ✅ You control when CI runs for PRs
- ✅ Balanced approach: security + cost savings

## 🔧 Running Checks Locally (Recommended)

Since the workflow is manual, **always run checks locally first:**

```bash
# Run individual checks
npm run validate  # TypeScript
npm run lint      # ESLint
npm run prettier  # Prettier
npm run test      # Tests

# Or run all at once
npm run validate && npm run lint && npm run prettier && npm run test
```

## 📚 Documentation

All CI details are documented in:
- `.github/workflows/README.md` - Workflow documentation with manual trigger instructions
- `.github/workflows/ci.yml` - The actual workflow definition
- `BRANCH_PROTECTION_SETUP.md` - Complete branch protection guide
- `QUICK_START_BRANCH_PROTECTION.md` - Quick reference guide

## ✅ Success Criteria

CI is properly configured when:
- [x] CI workflow exists (`.github/workflows/ci.yml`)
- [x] Workflow uses manual trigger (`workflow_dispatch`)
- [ ] You can trigger workflow from Actions tab
- [ ] All 4 checks run successfully when triggered
- [ ] You verify checks before merging PRs

---

**Cost Optimization:** Manual triggers ensure you only pay for CI runs you explicitly need!
npm run lint      # ESLint
npm run prettier  # Prettier
npm run test      # Tests

# Or run all at once
npm run validate && npm run lint && npm run prettier && npm run test
```

## ⚠️ Important Notes

1. **First Run Required**: Status checks only appear in branch protection settings after the workflow runs at least once
2. **No Bypass**: With "Do not allow bypassing" enabled, even admins must pass all checks
3. **Parallel Execution**: All 4 checks run in parallel for faster feedback
4. **Clear Failure Messages**: Each check provides detailed error output in the Actions tab

## 🎉 Success Criteria

Branch protection is fully configured when:
- [x] CI workflow file exists (`.github/workflows/ci.yml`)
- [ ] PR is merged to `main`
- [ ] CI workflow has run at least once
- [ ] Status checks are enabled in branch protection for `main`
- [ ] Status checks are enabled in branch protection for `release-*`
- [ ] Test PR successfully blocked by failing check
- [ ] Test PR successfully merged after all checks pass

---

**Time Estimate:** 5-10 minutes after PR merge to complete branch protection setup
