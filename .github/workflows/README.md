# GitHub Actions Workflows

## CI Workflow (`ci.yml`)

This workflow runs automated checks on every pull request and push to protected branches (`main` and `release-*`).

### Checks Performed

The workflow runs four parallel jobs that must all pass before a PR can be merged:

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

### When It Runs

The CI workflow is triggered on:
- Pull requests targeting `main` or `release-*` branches
- Direct pushes to `main` or `release-*` branches (after branch protection is enabled, this will only happen via merged PRs)

### Branch Protection

To enforce these checks as requirements for merging:

1. Go to **Settings → Branches** in the GitHub repository
2. Add or edit the branch protection rule for `main` and `release-*`
3. Enable **"Require status checks to pass before merging"**
4. Search for and select all four status checks:
   - `TypeScript Validation`
   - `ESLint`
   - `Prettier Format Check`
   - `Test Suite`

See `BRANCH_PROTECTION_SETUP.md` in the repository root for detailed instructions.

### Local Testing

Before pushing code, you can run these checks locally:

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

### Troubleshooting

**Issue:** Status checks don't appear in branch protection settings
- **Solution:** The checks will only appear after the workflow runs at least once. Create a test PR to trigger the workflow, then the checks will be available in the branch protection settings.

**Issue:** Workflow fails with permission errors
- **Solution:** Ensure the repository has GitHub Actions enabled in Settings → Actions → General.

**Issue:** Tests fail in CI but pass locally
- **Solution:** 
  - Check that dependencies are correctly specified in `package.json`
  - Ensure tests don't depend on local environment variables
  - Review the CI logs for specific error messages
