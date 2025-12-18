# How to Run Test Script While Dev Server is Running

## Option 1: Separate Terminal Window (Recommended)

1. **Keep dev server running** in Terminal 1:
   ```bash
   npm run dev
   ```

2. **Open a new terminal** (Terminal 2) and run:
   ```bash
   npm run test:workflow
   ```

## Option 2: PowerShell Split Pane

If using PowerShell Terminal in VS Code/Cursor:

1. Right-click on the terminal tab
2. Select "Split Terminal" or press `Ctrl+\`
3. In the new pane, run:
   ```bash
   npm run test:workflow
   ```

## Option 3: Background Process (Windows PowerShell)

Run test in background while dev server runs:

```powershell
# Start test in background
Start-Job -ScriptBlock { cd C:\Users\marti\.cursor\projects\c-Users-marti-rocky-web-studio; npm run test:workflow }

# Check job status
Get-Job

# See output
Receive-Job -Id 1
```

## Option 4: Run Test Directly with Node

If you want to run it directly without npm script:

```bash
node scripts/test-questionnaire-workflow.js
```

## Quick Test Command

**In a new terminal window/tab:**
```bash
cd C:\Users\marti\.cursor\projects\c-Users-marti-rocky-web-studio
npm run test:workflow
```

## What Happens

- Test script makes HTTP request to `http://localhost:3000/api/questionnaire/submit`
- Dev server (running in Terminal 1) handles the request
- Test script receives response and validates it
- Both processes run independently

## Troubleshooting

### "ECONNREFUSED" error
- **Cause**: Dev server not running or wrong port
- **Fix**: Start dev server first: `npm run dev`

### Port already in use
- **Cause**: Another process using port 3000
- **Fix**: Kill existing process or change port in `package.json`

### Test hangs
- **Cause**: Dev server crashed or not responding
- **Fix**: Check Terminal 1 for errors, restart dev server
