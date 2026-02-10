# GitHub Actions Workflows

## CI Workflow (`ci.yml`)

This workflow runs automated quality checks **manually on-demand** to reduce unnecessary CI costs.

### Checks Performed

The workflow runs four parallel jobs when manually triggered:

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

### How to Trigger the Workflow

The CI workflow uses **manual trigger only** (`workflow_dispatch`) to avoid unnecessary costs.

**To run the workflow:**

1. Go to the **Actions** tab in the GitHub repository: https://github.com/jEnbuska/yielded/actions
2. Click on **CI** workflow in the left sidebar
3. Click the **Run workflow** button (top right)
4. Select the branch you want to test
5. Optionally add a reason for the run
6. Click **Run workflow**

**Only repository collaborators with write access can trigger the workflow.**

### When to Run

Run the CI workflow:
- ✅ Before creating a pull request
- ✅ After making significant changes
- ✅ Before merging a PR to ensure all checks pass
- ✅ After resolving merge conflicts
- ✅ When explicitly requested in PR reviews

### Local Testing (Recommended)

**Since the workflow is now manual, it's important to run checks locally before pushing.**

Run these checks locally:

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

### Branch Protection Note

**Important:** With manual workflow triggers, status checks will NOT automatically block PRs. 

- The workflow must be manually triggered for each branch you want to test
- After running, check the Actions tab to verify all jobs passed
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
