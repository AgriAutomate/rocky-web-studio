# Branch Protection Setup Guide

This guide explains how to configure branch protection rules in GitHub to enforce CI/CD requirements.

## Overview

Branch protection rules ensure that:
- ✅ All CI checks must pass before merging
- ✅ Code reviews are required
- ✅ Branches must be up to date
- ✅ No force pushes to protected branches

## Setup Instructions

### Step 1: Access Branch Protection Settings

1. Go to your GitHub repository
2. Click **Settings** (top navigation)
3. Click **Branches** (left sidebar)
4. Scroll to **Branch protection rules**
5. Click **Add rule**

### Step 2: Configure Main Branch Protection

#### Branch Name Pattern

- **Pattern:** `main`
- **Description:** Production branch protection

#### Protection Settings

**1. Require a pull request before merging**
- ✅ **Required number of approvals:** `1` (or `2` for stricter review)
- ✅ **Dismiss stale pull request approvals when new commits are pushed**
- ✅ **Require review from Code Owners** (optional, if CODEOWNERS file exists)
- ✅ **Restrict who can dismiss pull request reviews:** Only repository admins

**2. Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**
- ✅ **Required status checks:**
  - `lint-and-type-check` (from CI workflow)
  - `build` (from CI workflow)
  - `ci-success` (from CI workflow)

**3. Require conversation resolution before merging**
- ✅ **Require all conversations on code to be resolved before merging**

**4. Do not allow bypassing the above settings**
- ✅ **Do not allow bypassing the above settings**
- ✅ **Restrict pushes that create files larger than 100 MB**

**5. Allow force pushes**
- ❌ **Do not allow force pushes** (unchecked)

**6. Allow deletions**
- ❌ **Do not allow branch deletion** (unchecked)

#### Click "Create" to save the rule

### Step 3: Configure Develop Branch Protection (Optional)

If you use a `develop` branch:

1. Click **Add rule** again
2. **Pattern:** `develop`
3. Use same settings as main, but:
   - Can require fewer approvals (1 instead of 2)
   - Can allow force pushes if needed for hotfixes

### Step 4: Verify Protection

1. **Create a test PR:**
   ```bash
   git checkout -b test/branch-protection
   # Make a change
   git commit -m "test: verify branch protection"
   git push origin test/branch-protection
   ```

2. **Create PR on GitHub:**
   - Go to Pull Requests → New PR
   - Select your branch → main
   - Create PR

3. **Verify protection:**
   - PR should show "Required: X of Y checks passing"
   - Should show required status checks
   - Merge button should be disabled until checks pass

4. **Test merge restriction:**
   - Try to merge without approvals (should be blocked)
   - Try to merge with failing CI (should be blocked)
   - Merge should only be allowed when all checks pass

## Required Status Checks

The following status checks are required by branch protection:

| Check Name | Workflow | Job | Description |
|------------|----------|-----|-------------|
| `lint-and-type-check` | CI | lint-and-type-check | TypeScript and lint validation |
| `build` | CI | build | Build verification |
| `ci-success` | CI | ci-success | Overall CI success check |

## Troubleshooting

### Status Checks Not Appearing

**Symptoms:** Required status checks list is empty

**Solutions:**
1. **Run CI workflow:**
   - Push a commit or create a PR
   - CI workflow must run at least once
   - Status checks appear after first run

2. **Check workflow file:**
   - Verify `.github/workflows/ci.yml` exists
   - Verify job names match required checks

3. **Wait for workflow completion:**
   - Status checks appear after workflow completes
   - May take a few minutes

### Cannot Merge Even After Checks Pass

**Symptoms:** All checks pass but merge button is disabled

**Solutions:**
1. **Check branch is up to date:**
   - Click "Update branch" button
   - Merge main into your branch
   - Re-run CI checks

2. **Check approvals:**
   - Verify required number of approvals received
   - Check if reviews were dismissed

3. **Check conversation resolution:**
   - Resolve all PR review comments
   - Close all open discussions

### Force Push Blocked

**Symptoms:** Cannot force push to protected branch

**Solutions:**
1. **This is expected behavior:**
   - Force pushes are blocked for security
   - Create a new branch instead
   - Or temporarily disable protection (not recommended)

2. **If force push is needed:**
   - Temporarily disable branch protection
   - Make force push
   - Re-enable protection immediately

## Best Practices

### 1. Require at Least One Approval

- Prevents accidental merges
- Ensures code review
- Catches issues before production

### 2. Require Status Checks

- Prevents broken code from merging
- Ensures type safety
- Ensures build succeeds

### 3. Keep Branches Up to Date

- Prevents merge conflicts
- Ensures latest changes are included
- Reduces deployment issues

### 4. Don't Allow Bypassing

- Prevents accidental merges
- Ensures all rules are followed
- Maintains code quality

### 5. Use CODEOWNERS File

Create `.github/CODEOWNERS`:

```
# Default owners
* @your-username

# Specific paths
/app/api/ @backend-team
/app/admin/ @admin-team
/docs/ @docs-team
```

This automatically requests reviews from code owners.

---

**Last Updated:** December 2025  
**Maintained By:** Rocky Web Studio Development Team

