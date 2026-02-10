# GitHub Actions Workflows

## CI Workflow (`ci.yml`)

This workflow runs automated quality checks **automatically** for all pull requests and merges:
- **Automatic** when PR is opened or marked as ready for review
- **Automatic** after merging to protected branches
- **Manual** trigger available as backup option

### Checks Performed

The workflow runs four parallel jobs:

1. **TypeScript Validation** - Runs `npm run validate`
   - Ensures TypeScript compiles without errors
   - Checks type correctness across the codebase

2. **ESLint** - Runs `npm run lint`
   - Enforces code quality standards
   - Checks for potential bugs and anti-patterns
   - Configured with zero warnings tolerance

3. **Prettier Format Check** - Runs `npm run prettier`
   - Verifies code formatting consistency
   - Ensures all code follows the project's formatting standards

4. **Test Suite** - Runs `npm run test`
   - Executes all unit and integration tests
   - Ensures no regressions are introduced

### When CI Runs

#### Automatic Runs for Pull Requests
CI runs **automatically** for anyone who creates or updates a PR to `main` or `release/*` branches:
- ✅ When PR is **opened** (created)
- ✅ When draft PR is marked as **ready for review**
- ✅ When new **commits are pushed** to the PR branch
- ✅ When a closed PR is **reopened**

**No manual trigger needed** - CI starts automatically for all PRs!

#### Automatic Runs After Merge
CI runs **automatically** when code is pushed to:
- `main` branch
- `release/*` branches

This happens after PRs are merged to verify the integrated code.

#### Manual Runs (Backup Option)
CI can still be **manually triggered** if needed:

**To run CI from the Actions tab:**
1. Go to **Actions** tab: https://github.com/jEnbuska/yielded/actions
2. Click **CI** workflow in the left sidebar
3. Click **"Run workflow"** button (top right)
4. Select the branch you want to test
5. Optionally add a reason
6. Click **"Run workflow"**

### PR Workflow

For pull requests to `main` or `release/` branches:

1. ✅ **Create PR** to protected branch
2. ✅ **CI runs automatically** - no manual trigger needed!
3. ✅ **Wait for all checks** to pass (green checkmarks)
4. ✅ **Get PR approval** (from repository owner if branch protection is configured)
5. ✅ **Merge** the PR
6. ✅ **CI runs automatically** after merge to verify integration

If changes are made to the PR after approval:
- ⚠️ Approval may be automatically dismissed (if stale approval dismissal is enabled)
- ✅ **CI runs automatically** on the new commits
- ⚠️ All checks must pass again
- ⚠️ May need re-approval before merging (depends on branch protection settings)

### Local Testing (Recommended)

**Run checks locally before pushing to catch issues early:**

```bash
npm run validate  # TypeScript check
npm run lint      # ESLint
npm run prettier  # Prettier format check
npm run test      # Run tests
```

Or run them all at once:

```bash
npm run validate && npm run lint && npm run prettier && npm run test
```

### Branch Protection Requirements

**Configure these settings in GitHub Settings → Branches:**

For both `main` and `release/*` branch patterns:

1. ✅ **Require a pull request before merging**
   - Required number of approvals: **1**
   - Restrict who can approve: **Repository owner only** (optional)

2. ✅ **Dismiss stale pull request approvals when new commits are pushed**
   - This ensures re-approval after any changes

3. ✅ **Require status checks to pass before merging**
   - Select all 4 checks: `TypeScript Validation`, `ESLint`, `Prettier Format Check`, `Test Suite`
   - CI now runs automatically, so checks will appear after first PR

4. ✅ **Do not allow bypassing the above settings**
   - Ensures even admins must follow the rules

5. ⚠️ **Restrict who can push to matching branches** (Optional but recommended)
   - Only allow merges via pull requests

### How It Works Together

**Branch Protection + Automatic CI = Quality Assurance:**

- ✅ PRs require approval to merge
- ✅ **CI runs automatically** when PR is opened or updated
- ✅ Status checks must pass before merge button enables
- ✅ After merge, CI runs automatically for verification
- ✅ New commits trigger CI automatically and may dismiss approval
- ✅ All contributors get automatic CI feedback

### Troubleshooting

**Issue:** CI doesn't run automatically on PR
- **Solution:** Check that the PR targets `main` or a `release/*` branch. PRs to other branches won't trigger CI automatically.

**Issue:** Workflow fails with permission errors
- **Solution:** Ensure the repository has GitHub Actions enabled in Settings → Actions → General.

**Issue:** Tests fail in CI but pass locally
- **Solution:** 
  - Check that dependencies are correctly specified in `package.json`
  - Ensure tests don't depend on local environment variables
  - Review the CI logs for specific error messages
