# Linting Issue and Workaround

## Known Issue
The `next lint` command in Next.js 16.0.3 has a bug that causes the error:
```
Invalid project directory provided, no such directory: ...\lint
```

This appears to be a Next.js CLI parsing bug.

## Current Status
Linting is temporarily disabled in the `lint` script. The `npm run lint` command currently does nothing.

## Workaround Options

### Option 1: Use TypeScript type checking only
```bash
npm run type-check
```

### Option 2: Manual ESLint (if needed)
If you need to run ESLint manually, you'll need to configure it properly for ESLint 9 flat config format.

## Future Fix
This should be resolved when:
- Next.js fixes the `next lint` command, OR
- We upgrade to a newer Next.js version that fixes this issue







