# n8n Configuration Guide

## 📋 Overview

This guide helps configure n8n to resolve deprecation warnings and optimize performance.

---

## ⚠️ Current Deprecation Warnings

Based on your n8n startup output, you need to configure these environment variables:

1. `DB_SQLITE_POOL_SIZE` - SQLite connection pool
2. `N8N_RUNNERS_ENABLED` - Task runners
3. `N8N_BLOCK_ENV_ACCESS_IN_NODE` - Environment variable access
4. `N8N_GIT_NODE_DISABLE_BARE_REPOS` - Git node security

---

## 🔧 Configuration Options

### Option 1: Environment Variables (Recommended)

Create or update `.env` file in your n8n directory (`C:\Users\marti\.n8n\`):

```bash
# Database Configuration
DB_SQLITE_POOL_SIZE=10

# Task Runners (Required for future versions)
N8N_RUNNERS_ENABLED=true

# Environment Variable Access (Set to false if using $env in Code nodes)
N8N_BLOCK_ENV_ACCESS_IN_NODE=false

# Git Node Security (Set to true if not using bare repos)
N8N_GIT_NODE_DISABLE_BARE_REPOS=true
```

### Option 2: PowerShell Environment Variables

Set environment variables in PowerShell session:

```powershell
# Set for current session
$env:DB_SQLITE_POOL_SIZE = "10"
$env:N8N_RUNNERS_ENABLED = "true"
$env:N8N_BLOCK_ENV_ACCESS_IN_NODE = "false"
$env:N8N_GIT_NODE_DISABLE_BARE_REPOS = "true"

# Then start n8n
n8n
```

### Option 3: System Environment Variables (Persistent)

Set system-wide environment variables:

1. **Open System Properties:**
   - Press `Win + R`
   - Type `sysdm.cpl` and press Enter
   - Go to "Advanced" tab
   - Click "Environment Variables"

2. **Add User Variables:**
   - Click "New" under "User variables"
   - Add each variable:
     - `DB_SQLITE_POOL_SIZE` = `10`
     - `N8N_RUNNERS_ENABLED` = `true`
     - `N8N_BLOCK_ENV_ACCESS_IN_NODE` = `false`
     - `N8N_GIT_NODE_DISABLE_BARE_REPOS` = `true`

3. **Restart PowerShell** and run `n8n` again

---

## 📝 Configuration Details

### DB_SQLITE_POOL_SIZE

**Purpose:** SQLite connection pool size for read connections

**Recommended Value:** `10` (or higher for high-traffic workflows)

**Why:** SQLite without a pool is deprecated. A pool improves performance.

```bash
DB_SQLITE_POOL_SIZE=10
```

---

### N8N_RUNNERS_ENABLED

**Purpose:** Enable task runners for better performance and scalability

**Recommended Value:** `true`

**Why:** Task runners will be enabled by default in future versions. Enable now to avoid issues.

```bash
N8N_RUNNERS_ENABLED=true
```

**Note:** Task runners improve workflow execution performance, especially for long-running workflows.

---

### N8N_BLOCK_ENV_ACCESS_IN_NODE

**Purpose:** Control access to environment variables in Code nodes and expressions

**Recommended Value:** `false` (if you use `$env` in Code nodes or expressions)

**Why:** Default will change to `true` in future. Set explicitly to avoid breaking changes.

```bash
N8N_BLOCK_ENV_ACCESS_IN_NODE=false
```

**When to set `true`:**
- If you don't need environment variable access in Code nodes
- For enhanced security (prevents accidental exposure)

**When to set `false`:**
- If you use `$env.VARIABLE_NAME` in Code nodes
- If you use `{{ $env.VARIABLE_NAME }}` in expressions
- **This is likely needed for your workflows** (Mobile Message API, OpenAI, etc.)

---

### N8N_GIT_NODE_DISABLE_BARE_REPOS

**Purpose:** Disable bare Git repositories for security

**Recommended Value:** `true` (unless you use bare repos)

**Why:** Bare repositories pose security risks and will be removed in future versions.

```bash
N8N_GIT_NODE_DISABLE_BARE_REPOS=true
```

**When to set `false`:**
- Only if you specifically use bare Git repositories in Git nodes

---

## 🚀 Quick Setup Script

Create a PowerShell script to set these variables:

**File:** `start-n8n.ps1`

```powershell
# n8n Configuration Script
# Sets required environment variables and starts n8n

Write-Host "Configuring n8n environment variables..." -ForegroundColor Green

# Set environment variables
$env:DB_SQLITE_POOL_SIZE = "10"
$env:N8N_RUNNERS_ENABLED = "true"
$env:N8N_BLOCK_ENV_ACCESS_IN_NODE = "false"
$env:N8N_GIT_NODE_DISABLE_BARE_REPOS = "true"

Write-Host "Environment variables set:" -ForegroundColor Green
Write-Host "  DB_SQLITE_POOL_SIZE = $env:DB_SQLITE_POOL_SIZE"
Write-Host "  N8N_RUNNERS_ENABLED = $env:N8N_RUNNERS_ENABLED"
Write-Host "  N8N_BLOCK_ENV_ACCESS_IN_NODE = $env:N8N_BLOCK_ENV_ACCESS_IN_NODE"
Write-Host "  N8N_GIT_NODE_DISABLE_BARE_REPOS = $env:N8N_GIT_NODE_DISABLE_BARE_REPOS"
Write-Host ""

Write-Host "Starting n8n..." -ForegroundColor Green
n8n
```

**Usage:**
```powershell
.\start-n8n.ps1
```

---

## ✅ Verification

After setting environment variables, restart n8n and verify:

1. **Start n8n:**
   ```powershell
   n8n
   ```

2. **Check startup output:**
   - Should NOT see deprecation warnings
   - Should see "n8n ready on ::, port 5678"
   - No warnings about environment variables

3. **Test workflow execution:**
   - Create a test workflow
   - Use `$env.VARIABLE_NAME` in Code node
   - Verify it works correctly

---

## 🔍 Troubleshooting

### Environment Variables Not Applied

**Problem:** Variables set but n8n still shows warnings

**Solution:**
1. Close all PowerShell windows
2. Open new PowerShell window
3. Set variables again
4. Start n8n

### Code Node Can't Access Environment Variables

**Problem:** `$env.VARIABLE_NAME` returns undefined

**Solution:**
- Ensure `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`
- Restart n8n after changing
- Check variable name spelling

### Task Runners Causing Issues

**Problem:** Workflows fail with task runners enabled

**Solution:**
- Check n8n version compatibility
- Update n8n: `npm install -g n8n@latest`
- Review workflow execution logs

---

## 📚 Related Documentation

- **n8n Environment Variables:** https://docs.n8n.io/hosting/configuration/environment-variables/
- **Task Runners:** https://docs.n8n.io/hosting/configuration/task-runners/
- **Security:** https://docs.n8n.io/hosting/configuration/environment-variables/security/

---

## 🎯 Recommended Configuration

**For Rocky Web Studio workflows:**

```bash
# Database
DB_SQLITE_POOL_SIZE=10

# Performance
N8N_RUNNERS_ENABLED=true

# Environment Access (needed for API keys)
N8N_BLOCK_ENV_ACCESS_IN_NODE=false

# Security
N8N_GIT_NODE_DISABLE_BARE_REPOS=true

# Additional recommended settings
N8N_PORT=5678
N8N_HOST=localhost
N8N_PROTOCOL=http
```

---

**Last Updated:** December 2024  
**Status:** Ready for configuration
