# n8n Quick Start Guide

## 🚀 Starting n8n

### Option 1: Direct Installation (Current Setup)

**You're running n8n directly** (not Docker), so use:

```powershell
.\start-n8n-direct.ps1
```

This script will:
- ✅ Set all required environment variables
- ✅ Resolve deprecation warnings
- ✅ Start n8n on http://localhost:5678

---

### Option 2: Docker Installation

If you prefer Docker:

```powershell
.\start-n8n.ps1
```

This will:
- ✅ Start n8n in Docker container
- ✅ Configure environment variables
- ✅ Set up basic auth (admin/27ParkAvenue)

---

## ⚙️ Environment Variables Fixed

The startup scripts automatically configure:

| Variable | Value | Purpose |
|----------|-------|---------|
| `DB_SQLITE_POOL_SIZE` | `10` | SQLite connection pool |
| `N8N_RUNNERS_ENABLED` | `true` | Enable task runners |
| `N8N_BLOCK_ENV_ACCESS_IN_NODE` | `false` | Allow `$env` in Code nodes |
| `N8N_GIT_NODE_DISABLE_BARE_REPOS` | `true` | Git security |

---

## ✅ Verification

After starting n8n, check the output:

**✅ Good (No warnings):**
```
n8n ready on ::, port 5678
Editor is now accessible via: http://localhost:5678
```

**❌ Bad (Has warnings):**
```
There are deprecations related to your environment variables...
```

If you see warnings, the environment variables weren't set. Use the startup script instead.

---

## 🔧 Manual Configuration

If you prefer to set variables manually:

**PowerShell (Current Session):**
```powershell
$env:DB_SQLITE_POOL_SIZE = "10"
$env:N8N_RUNNERS_ENABLED = "true"
$env:N8N_BLOCK_ENV_ACCESS_IN_NODE = "false"
$env:N8N_GIT_NODE_DISABLE_BARE_REPOS = "true"
n8n
```

**System Environment Variables (Persistent):**
1. Win + R → `sysdm.cpl` → Environment Variables
2. Add each variable under "User variables"
3. Restart PowerShell
4. Run `n8n`

---

## 📚 Related Documentation

- **Full Configuration Guide:** `docs/N8N_CONFIGURATION.md`
- **Workflow Setup:** See workflow-specific docs in `docs/`

---

**Last Updated:** December 2024
