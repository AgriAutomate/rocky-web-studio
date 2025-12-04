# GitHub Actions CI/CD Setup Guide

This guide explains the GitHub Actions CI/CD pipeline configuration for Rocky Web Studio.

## Overview

The CI/CD pipeline consists of three workflows:

1. **CI** (`ci.yml`) - Runs on every push and PR
2. **Deploy** (`deploy.yml`) - Deploys to production after successful CI on main
3. **PR Checks** (`pr-checks.yml`) - Validates pull requests

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**
1. **Lint & Type Check**
   - Runs `npm ci` to install dependencies
   - Runs `npm run type-check` (TypeScript validation)
   - Runs `npm run lint` (ESLint validation)

2. **Test Suite** (optional, continues on error)
   - Runs `npm run test:ci` if available
   - Uploads coverage to Codecov
   - Currently skipped if tests not implemented

3. **Build**
   - Runs `npm run build` to verify build succeeds
   - Uses dummy environment variables for build

**Status:** CI must pass for PRs to be merged (enforced by branch protection)

### 2. Deploy Workflow (`.github/workflows/deploy.yml`)

**Triggers:**
- Only after successful CI workflow completion
- Only on `main` branch

**Jobs:**
1. **Deploy to Vercel**
   - Installs Vercel CLI
   - Pulls environment variables from Vercel
   - Builds project artifacts
   - Deploys to production

2. **Smoke Tests**
   - Waits 30 seconds for deployment to complete
   - Tests landing page (expects 200 OK)
   - Tests API endpoint (expects 200 or 400)
   - Creates deployment summary

**Status:** Only runs if CI passes on main branch

### 3. PR Checks Workflow (`.github/workflows/pr-checks.yml`)

**Triggers:**
- Pull request opened, updated, or reopened

**Jobs:**
1. **PR Validation**
   - Type check
   - Lint check
   - Build check
   - Creates PR summary comment

**Status:** Provides immediate feedback on PRs

## Required GitHub Secrets

Configure these secrets in GitHub repository settings:

### Vercel Secrets (for deploy.yml)

1. **VERCEL_TOKEN**
   - Get from: Vercel Dashboard → Settings → Tokens
   - Create a new token with "Full Account" scope
   - Add to GitHub: Settings → Secrets → Actions → New repository secret

2. **VERCEL_ORG_ID**
   - Get from: Vercel Dashboard → Settings → General → Team ID
   - Add to GitHub secrets

3. **VERCEL_PROJECT_ID**
   - Get from: Vercel Dashboard → Project → Settings → General → Project ID
   - Add to GitHub secrets

### Codecov Secret (optional, for test coverage)

1. **CODECOV_TOKEN**
   - Sign up at [codecov.io](https://codecov.io)
   - Get token from Codecov dashboard
   - Add to GitHub secrets (optional, workflow continues without it)

## Branch Protection Setup

### Configure Branch Protection Rules

1. **Go to GitHub Repository:**
   - Settings → Branches → Add rule

2. **Branch Name Pattern:**
   - `main`

3. **Protection Settings:**
   - ✅ **Require a pull request before merging**
     - Require approvals: 1 (or 2 if you want stricter review)
     - Dismiss stale pull request approvals when new commits are pushed
   
   - ✅ **Require status checks to pass before merging**
     - Required checks:
       - `lint-and-type-check`
       - `build`
       - `ci-success`
   
   - ✅ **Require branches to be up to date before merging**
   
   - ✅ **Do not allow bypassing the above settings**

4. **Save Rule**

### Optional: Protect Develop Branch

Repeat the same process for `develop` branch if you use it.

## Testing the Pipeline

### Test 1: Type Check Failure

1. **Create feature branch:**
   ```bash
   git checkout -b test/ci-type-check-failure
   ```

2. **Introduce type error:**
   ```typescript
   // In any .ts file, add:
   const x: string = 123; // Type error
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "test: introduce type error"
   git push origin test/ci-type-check-failure
   ```

4. **Create PR:**
   - Go to GitHub → Pull Requests → New PR
   - Select your branch
   - Create PR

5. **Verify CI fails:**
   - Check Actions tab → CI workflow
   - Should show ❌ failure on "Run type check" step

6. **Fix error and push again:**
   ```bash
   # Remove the type error
   git commit -m "fix: remove type error"
   git push
   ```

7. **Verify CI passes:**
   - Check Actions tab → CI workflow should show ✅

### Test 2: Successful Deploy

1. **Merge PR to main:**
   - After CI passes, merge PR
   - Or push directly to main (if allowed)

2. **Verify CI runs:**
   - Check Actions tab → CI workflow runs

3. **Verify Deploy runs:**
   - After CI completes successfully
   - Check Actions tab → Deploy workflow runs
   - Should deploy to Vercel production

4. **Verify smoke tests:**
   - Check Deploy workflow → Smoke Tests job
   - Should show ✅ for landing page and API tests

## Workflow Status Badges

Add these badges to your README.md:

```markdown
![CI](https://github.com/your-org/rocky-web-studio/workflows/CI/badge.svg)
![Deploy](https://github.com/your-org/rocky-web-studio/workflows/Deploy%20to%20Production/badge.svg)
```

## Troubleshooting

### CI Fails on Type Check

**Symptoms:** Type check step fails

**Solutions:**
1. Run `npm run type-check` locally
2. Fix TypeScript errors
3. Commit and push again

### CI Fails on Lint

**Symptoms:** Lint step fails

**Solutions:**
1. Run `npm run lint` locally
2. Fix linting errors
3. Commit and push again

### Deploy Doesn't Run

**Symptoms:** CI passes but deploy doesn't trigger

**Solutions:**
1. **Check workflow trigger:**
   - Verify CI workflow completed successfully
   - Verify branch is `main`
   - Check workflow_run condition in deploy.yml

2. **Check Vercel secrets:**
   - Verify `VERCEL_TOKEN` is set
   - Verify `VERCEL_ORG_ID` is set
   - Verify `VERCEL_PROJECT_ID` is set

3. **Check Vercel CLI:**
   - Verify Vercel CLI is installed correctly
   - Check Vercel token permissions

### Smoke Tests Fail

**Symptoms:** Deployment succeeds but smoke tests fail

**Solutions:**
1. **Check deployment URL:**
   - Verify deployment actually completed
   - Check Vercel dashboard for deployment status

2. **Check wait time:**
   - Increase sleep time in smoke-tests job if needed
   - Vercel deployments can take 1-2 minutes

3. **Check endpoint availability:**
   - Verify endpoints exist and are accessible
   - Check Vercel logs for errors

### Codecov Upload Fails

**Symptoms:** Codecov upload step fails

**Solutions:**
1. **Skip if not needed:**
   - Workflow continues on error
   - Tests not yet implemented anyway

2. **Add Codecov token:**
   - Sign up at codecov.io
   - Get token and add to GitHub secrets

3. **Check coverage file:**
   - Verify `coverage/lcov.info` exists after tests run
   - May not exist if tests aren't implemented

## Best Practices

### 1. Always Run CI Locally First

Before pushing, run:
```bash
npm run type-check
npm run lint
npm run build
```

### 2. Keep PRs Small

Small PRs are easier to review and less likely to have CI failures.

### 3. Fix CI Failures Immediately

Don't merge PRs with failing CI. Fix issues before requesting review.

### 4. Monitor CI Duration

- Keep CI runs under 5 minutes
- Optimize slow steps if needed

### 5. Use PR Checks for Feedback

The PR Checks workflow provides immediate feedback without waiting for full CI.

## Future Enhancements

### When Tests Are Implemented

1. **Update ci.yml:**
   - Remove `continue-on-error: true` from test job
   - Make test job required for CI success

2. **Add test coverage threshold:**
   - Require minimum coverage percentage
   - Fail CI if coverage drops

3. **Add test matrix:**
   - Test on multiple Node.js versions
   - Test on multiple operating systems

### Additional Workflows

1. **Security scanning:**
   - Add `npm audit` to CI
   - Add Dependabot for dependency updates

2. **Performance testing:**
   - Add Lighthouse CI
   - Track Core Web Vitals

3. **E2E testing:**
   - Add Playwright or Cypress tests
   - Run on staging before production deploy

---

**Last Updated:** December 2025  
**Maintained By:** Rocky Web Studio Development Team

