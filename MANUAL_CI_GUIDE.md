# Manual CI Trigger Guide

## 🎯 Purpose

The CI workflow has been converted to **manual-only triggers** to reduce unnecessary GitHub Actions costs. The workflow will only run when you explicitly trigger it.

## 🚀 How to Run CI Checks

### Option 1: Via GitHub Actions UI (Recommended)

1. **Navigate to Actions Tab**
   - Go to: https://github.com/jEnbuska/yielded/actions

2. **Select CI Workflow**
   - Click on "CI" in the left sidebar under "All workflows"

3. **Run Workflow**
   - Click the **"Run workflow"** button (appears on the right side)
   - Select the branch you want to test from the dropdown
   - (Optional) Enter a reason for running the checks
   - Click **"Run workflow"** to start

4. **Monitor Progress**
   - The workflow will appear in the list below
   - Click on it to see detailed progress
   - All 4 checks run in parallel (TypeScript, ESLint, Prettier, Tests)

### Option 2: Run Locally (Free & Faster)

```bash
# Run all checks locally before pushing
npm run validate && npm run lint && npm run prettier && npm run test
```

## 📅 When to Trigger CI

Trigger the CI workflow:

✅ **Before creating a pull request**
- Ensures all checks pass before opening the PR

✅ **After significant code changes**
- Run after completing a feature or bug fix

✅ **Before merging a PR**
- Always verify checks pass before merging

✅ **After resolving merge conflicts**
- Ensure the merged code still passes all checks

✅ **When explicitly requested**
- If someone asks for CI results in a PR review

## ⚠️ Important Notes

### No Automatic Blocking
- Unlike automatic CI, status checks won't block PRs by default
- **You are responsible** for running CI and verifying it passes before merging
- This is a trade-off for cost savings

### Permission Required
- Only repository collaborators with **write access** can trigger workflows
- If you can't see the "Run workflow" button, check your permissions

### Cost Savings
- Manual triggers eliminate costs from:
  - Every push to feature branches
  - Draft PR updates
  - Work-in-progress commits
  - Experimental changes
- You only pay for CI runs you explicitly need

## 🔧 Best Practices

### 1. Run Locally First
Always run checks locally before triggering CI:
```bash
npm run validate && npm run lint && npm run prettier && npm run test
```

### 2. Fix Issues Before CI
- Fix any failures locally first
- Only trigger CI when you expect it to pass
- Saves time and CI minutes

### 3. Document CI Runs
- Use the "reason" field when triggering
- Examples: "Pre-merge validation", "Testing hotfix", "Final check"

### 4. Check Before Merging
- Always look for the green checkmarks
- Don't merge if any checks failed
- Re-run if you made changes after the last CI run

## 🆘 Troubleshooting

### Can't Find "Run Workflow" Button
**Problem:** The button doesn't appear in the Actions tab.

**Solution:**
- Ensure you're logged into GitHub
- Verify you have write access to the repository
- Try refreshing the page
- Check that you selected the "CI" workflow in the left sidebar

### Workflow Doesn't Start
**Problem:** Clicked "Run workflow" but nothing happens.

**Solution:**
- Check if there are any browser console errors
- Try a different browser
- Ensure GitHub Actions are enabled in repository settings
- Wait a few seconds and refresh the page

### All Checks Failing
**Problem:** All 4 checks fail when triggered.

**Solution:**
- Run checks locally first: `npm run validate && npm run lint && npm run prettier && npm run test`
- Fix any issues locally
- Commit and push the fixes
- Trigger CI again

### Can't See Workflow Results
**Problem:** Can't find the workflow run after triggering.

**Solution:**
- Go to Actions tab
- Look under "All workflows"
- Sort by "Most recent" at the top
- The latest run should appear at the top

## 💡 Tips

1. **Use Local Checks During Development**
   - Set up a git pre-commit hook to run checks automatically
   - Catches issues before you even push

2. **Trigger CI Strategically**
   - Before opening a PR
   - After major changes
   - Before final merge
   - Not after every small commit

3. **Monitor Your Usage**
   - Check GitHub Actions usage in repository Settings → Billing
   - Track how much you're saving with manual triggers

4. **Consider Automation for Important Branches**
   - If needed, you can re-enable automatic triggers for specific branches
   - Edit `.github/workflows/ci.yml` and add back `push:` or `pull_request:` triggers

## 📚 Related Documentation

- `.github/workflows/README.md` - Detailed workflow documentation
- `.github/workflows/ci.yml` - The workflow configuration file
- `CI_SETUP_COMPLETE.md` - Setup and configuration guide
- `BRANCH_PROTECTION_SETUP.md` - Branch protection details

---

**Remember:** Manual CI puts you in control of costs while maintaining code quality! 🎉
