# GitHub Actions Workflows

## CI Workflow (`ci.yml`)

This workflow runs automated quality checks using a **hybrid trigger model**:
- **Automatic** after merging to protected branches
- **Manual** for PR verification before merge

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

#### Automatic Runs (Post-Merge Verification)
CI runs **automatically** when code is pushed to:
- `main` branch
- `release-*` branches

This happens after PRs are merged to verify the integrated code.

#### Manual Runs (Pre-Merge Verification)
For **Pull Requests**, CI must be **manually triggered** by the repository owner:

**To run CI from a Pull Request:**
1. Open the Pull Request on GitHub
2. Go to the **Checks** tab in the PR
3. Find the **CI** workflow
4. Click **"Run workflow"** or **"Re-run jobs"**
5. Wait for all 4 checks to complete

**To run CI from the Actions tab:**
1. Go to **Actions** tab: https://github.com/jEnbuska/yielded/actions
2. Click **CI** workflow in the left sidebar
3. Click **"Run workflow"** button (top right)
4. Select the branch you want to test
5. Optionally add a reason
6. Click **"Run workflow"**

**Only the repository owner can trigger the workflow manually.**

### Required PR Workflow

For pull requests to `main` or `release-*` branches:

1. ✅ **Create PR** to protected branch
2. ✅ **Manually trigger CI** from the PR Checks tab
3. ✅ **Wait for all checks** to pass (green checkmarks)
4. ✅ **Repository owner approves** the PR
5. ✅ **Merge** the PR
6. ✅ **CI runs automatically** after merge to verify integration

If changes are made to the PR after approval:
- ⚠️ Approval is automatically dismissed
- ⚠️ CI checks must be manually triggered again
- ⚠️ All checks must pass again
- ⚠️ Repository owner must re-approve

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

For both `main` and `release-*` branch patterns:

1. ✅ **Require a pull request before merging**
   - Required number of approvals: **1**
   - Restrict who can approve: **Repository owner only**

2. ✅ **Dismiss stale pull request approvals when new commits are pushed**
   - This ensures re-approval after any changes

3. ✅ **Require status checks to pass before merging**
   - Select all 4 checks: `TypeScript Validation`, `ESLint`, `Prettier Format Check`, `Test Suite`
   - Enable after manually triggering CI at least once

4. ✅ **Do not allow bypassing the above settings**
   - Ensures even admins must follow the rules

5. ⚠️ **Restrict who can push to matching branches** (Optional but recommended)
   - Only allow merges via pull requests

### How It Works Together

**Branch Protection + Hybrid CI = Secure Workflow:**

- ✅ PRs require your approval to merge
- ✅ You manually trigger CI to verify PR changes
- ✅ Status checks must pass before merge button enables
- ✅ After merge, CI runs automatically for verification
- ✅ New commits dismiss approval and require re-check
- ✅ Only you can approve and trigger CI for PRs
- Only merge PRs after confirming all checks have passed

If you want automatic blocking, you would need to revert to automatic triggers, but this will incur CI costs on every push.

### Troubleshooting

**Issue:** Can't find the "Run workflow" button
- **Solution:** Only repository collaborators with write access can manually trigger workflows. Ensure you're logged in and have the necessary permissions.

**Issue:** Workflow fails with permission errors
- **Solution:** Ensure the repository has GitHub Actions enabled in Settings → Actions → General.

**Issue:** Tests fail in CI but pass locally
- **Solution:** 
  - Check that dependencies are correctly specified in `package.json`
  - Ensure tests don't depend on local environment variables
  - Review the CI logs for specific error messages
