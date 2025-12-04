# Development Workflow

## Before Every Commit

Run the pre-flight check:

```bash
npm run preflight
```

This runs:
- TypeScript type checking
- ESLint linting
- Next.js build verification

### Automatic Pre-commit Checks

Husky automatically runs checks before each commit:
- ✅ TypeScript type checking (`npm run type-check`)
- ✅ ESLint linting (`npm run lint`)

If any check fails, the commit will be blocked. Fix the errors and try committing again.

## Available Scripts

### Development

```bash
npm run dev          # Start development server (localhost:3000)
```

### Code Quality

```bash
npm run type-check   # Check TypeScript types without building
npm run lint         # Run ESLint to check code quality
npm run preflight    # Run all checks (type-check + lint + build)
```

### Build & Deploy

```bash
npm run build        # Build for production
npm run start        # Start production server
npm run deploy       # Run preflight checks + confirmation message
```

## Git Workflow

### Pre-commit Hooks

Husky is configured to run automatic checks before each commit. The pre-commit hook will:
1. Run TypeScript type checking
2. Run ESLint linting
3. Block the commit if any errors are found

### Commit Messages

Follow conventional commit format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks

Examples:
```
feat: add custom songs order portal
fix: remove apostrophes from portfolio titles
docs: update development workflow guidelines
```

### Before Pushing

Always run the preflight check before pushing:

```bash
npm run deploy
```

This ensures:
- ✅ All TypeScript types are valid
- ✅ Code passes linting
- ✅ Project builds successfully

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new files
- Define interfaces/types in appropriate type files
- Avoid `any` types - use proper typing or `unknown`

### ESLint Rules

The project enforces:
- **Double quotes** for strings
- **No irregular whitespace** characters
- **No misleading character classes** in regex
- **Unused variables** prefixed with `_` are ignored

### File Organization

```
/app                  # Next.js app router pages and API routes
/components           # React components
/lib                  # Utility functions and configurations
/public               # Static assets
```

## Environment Variables

### Required Variables

Create `.env.local` (not committed to git) with:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Development vs Production

- Development: Use test keys and `http://localhost:3000`
- Production: Use live keys and production URL

## Testing

### Manual Testing Checklist

Before deploying:
- [ ] All pages load without errors
- [ ] Forms submit correctly
- [ ] API routes respond correctly
- [ ] No console errors in browser
- [ ] Mobile responsiveness verified
- [ ] Stripe integration works (test mode)

## Troubleshooting

### Pre-commit Hook Failing

If Husky blocks your commit:

1. Check the error message
2. Run the failing check manually:
   ```bash
   npm run type-check  # For TypeScript errors
   npm run lint        # For ESLint errors
   ```
3. Fix the errors
4. Try committing again

### TypeScript Errors

Run type checking to see detailed errors:
```bash
npm run type-check
```

### ESLint Errors

Run ESLint to see linting issues:
```bash
npm run lint
```

Auto-fix what you can:
```bash
npm run lint -- --fix
```

## Getting Help

If you encounter issues:
1. Check this DEVELOPMENT.md file
2. Review error messages carefully
3. Run preflight checks to identify issues
4. Check Git commit history for similar fixes

## Deployment

### Pre-deployment Checklist

- [ ] All tests pass (`npm run preflight`)
- [ ] Environment variables configured
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors
- [ ] All features tested manually

### Deployment Command

```bash
npm run deploy
```

This runs all checks and confirms readiness for GitHub push.





