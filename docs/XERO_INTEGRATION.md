# Xero Integration Setup Guide

This guide provides comprehensive instructions for setting up and using the Xero accounting integration in Rocky Web Studio.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Setup Instructions](#setup-instructions)
3. [Token Management](#token-management)
4. [Lazy Initialization](#lazy-initialization)
5. [Structured Logging](#structured-logging)
6. [Usage Guide](#usage-guide)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)

---

## Environment Variables

The following environment variables are required for the Xero integration:

### Required Variables

#### `XERO_CLIENT_ID`
- **Description:** Your Xero application's Client ID
- **Where to get it:** Xero Developer Portal → Your App → OAuth 2.0 credentials
- **Example:** `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

#### `XERO_CLIENT_SECRET`
- **Description:** Your Xero application's Client Secret
- **Where to get it:** Xero Developer Portal → Your App → OAuth 2.0 credentials
- **Example:** `xYz123AbC456DeF789GhI012JkL345MnO678PqR`
- **⚠️ Security:** Keep this secret! Never commit it to version control.

#### `XERO_REDIRECT_URI`
- **Description:** OAuth callback URL where Xero redirects after authorization
- **Default:** `https://rockywebstudio.com.au/api/xero/callback` (if not set)
- **Example (Production):** `https://rockywebstudio.com.au/api/xero/callback`
- **Example (Development):** `http://localhost:3000/api/xero/callback`
- **⚠️ Important:** Must match exactly what's configured in Xero Developer Portal

#### `XERO_SCOPES`
- **Description:** Space-separated list of OAuth scopes your app requires
- **Default:** `openid profile email accounting.transactions accounting.settings offline_access`
- **Example:** `openid profile email accounting.transactions accounting.settings offline_access accounting.contacts accounting.reports.read`
- **Common Scopes:**
  - `openid` - OpenID Connect authentication
  - `profile` - User profile information
  - `email` - User email address
  - `accounting.transactions` - Read/write access to invoices, payments, etc.
  - `accounting.settings` - Read organization settings
  - `accounting.contacts` - Read/write access to contacts
  - `accounting.reports.read` - Read financial reports
  - `offline_access` - Required for refresh tokens (recommended)

#### `XERO_WEBHOOK_KEY`
- **Description:** Webhook signing key for verifying Xero webhook requests
- **Where to get it:** Xero Developer Portal → Your App → Webhooks → Signing Key
- **Example:** `webhook-key-abc123def456ghi789`
- **⚠️ Note:** Only required if you're using webhooks for real-time updates

### Optional Variables

#### `ENABLE_AUTO_INVOICING`
- **Description:** Enable automatic invoice creation when orders are completed
- **Type:** Boolean (string: `"true"` or `"false"`)
- **Default:** `false` (if not set)
- **Example:** `true` or `"true"`
- **⚠️ Note:** When enabled, invoices will be automatically created in Xero when payment is confirmed

---

## Setup Instructions

### Step 1: Create a Xero Developer App

1. **Navigate to Xero Developer Portal**
   - Go to [https://developer.xero.com](https://developer.xero.com)
   - Sign in with your Xero account (or create one if needed)

2. **Create a New App**
   - Click **"My Apps"** in the top navigation
   - Click **"New app"** button
   - Fill in the app details:
     - **App name:** Rocky Web Studio (or your preferred name)
     - **Integration type:** Select **"Web app"**
     - **Company URL:** Your website URL (e.g., `https://rockywebstudio.com.au`)
     - **Redirect URI:** Your callback URL (see below)
     - **OAuth 2.0 scopes:** Select the scopes you need (see [Environment Variables](#environment-variables))

3. **Important: Lazy Initialization**
   - The Xero client uses lazy initialization to prevent build-time failures
   - Client is only created when first accessed via `getXeroClient()` function
   - This prevents errors when environment variables aren't available during `next build`
   - See [Lazy Initialization](#lazy-initialization) section for details

3. **Configure Redirect URI**
   - **Production:** `https://rockywebstudio.com.au/api/xero/callback`
   - **Development:** `http://localhost:3000/api/xero/callback` (for local testing)
   - **⚠️ Important:** You can add multiple redirect URIs, but they must match exactly (including protocol, domain, and path)

4. **Save Your Credentials**
   - After creating the app, you'll see:
     - **Client ID** (copy this to `XERO_CLIENT_ID`)
     - **Client Secret** (copy this to `XERO_CLIENT_SECRET`)
     - **⚠️ Security:** The Client Secret is only shown once! Save it immediately.

### Step 2: Configure Environment Variables

Add the environment variables to your deployment platform:

#### For Vercel:
1. Go to your project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   ```
   XERO_CLIENT_ID=your-client-id-here
   XERO_CLIENT_SECRET=your-client-secret-here
   XERO_REDIRECT_URI=https://rockywebstudio.com.au/api/xero/callback
   XERO_SCOPES=openid profile email accounting.transactions accounting.settings offline_access
   XERO_WEBHOOK_KEY=your-webhook-key-here
   ENABLE_AUTO_INVOICING=false
   ```

#### For Local Development:
Create a `.env.local` file in your project root:
```bash
XERO_CLIENT_ID=your-client-id-here
XERO_CLIENT_SECRET=your-client-secret-here
XERO_REDIRECT_URI=http://localhost:3000/api/xero/callback
XERO_SCOPES=openid profile email accounting.transactions accounting.settings offline_access
XERO_WEBHOOK_KEY=your-webhook-key-here
ENABLE_AUTO_INVOICING=false
```

### Step 3: Configure Webhooks (Optional)

If you want to receive real-time updates from Xero (e.g., when invoices are paid):

1. **Get Your Webhook Signing Key**
   - In Xero Developer Portal → Your App → **Webhooks**
   - Click **"Generate signing key"**
   - Copy the signing key to `XERO_WEBHOOK_KEY` environment variable

2. **Set Up Webhook Endpoint**
   - **Production URL:** `https://rockywebstudio.com.au/api/xero/webhook`
   - **Development:** Use ngrok (see [Testing in Development](#testing-in-development))

3. **Configure Events**
   - In Xero Developer Portal → Your App → **Webhooks**
   - Select which events to subscribe to:
     - `INVOICE.CREATED`
     - `INVOICE.UPDATED`
     - `INVOICE.DELETED`
     - `PAYMENT.CREATED`
     - `CONTACT.CREATED`
     - `CONTACT.UPDATED`

### Step 4: Testing in Development

For local development, you'll need to use a tunneling service to receive webhooks:

#### Using ngrok:

1. **Install ngrok**
   ```bash
   # macOS
   brew install ngrok
   
   # Windows (using Chocolatey)
   choco install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start your local server**
   ```bash
   npm run dev
   ```

3. **Start ngrok tunnel**
   ```bash
   ngrok http 3000
   ```

4. **Update Redirect URI in Xero**
   - Copy the ngrok HTTPS URL (e.g., `https://abc123.ngrok.io`)
   - In Xero Developer Portal → Your App → **Redirect URIs**
   - Add: `https://abc123.ngrok.io/api/xero/callback`
   - Update `XERO_REDIRECT_URI` in `.env.local`:
     ```bash
     XERO_REDIRECT_URI=https://abc123.ngrok.io/api/xero/callback
     ```

5. **Update Webhook URL (if using webhooks)**
   - In Xero Developer Portal → Your App → **Webhooks**
   - Set webhook URL to: `https://abc123.ngrok.io/api/xero/webhook`

6. **⚠️ Note:** ngrok URLs change each time you restart ngrok (unless you have a paid plan). Update your Xero app configuration accordingly.

---

## Token Management

### Automatic Token Refresh

The Xero integration automatically refreshes access tokens when they expire or are about to expire. This ensures seamless API operations without manual intervention.

#### Proactive Refresh

- **Timing:** Tokens are refreshed **5 minutes before expiry** to prevent failed API calls
- **Method:** Uses `obtained_at` timestamp + `expires_in` duration for accurate timing
- **Fallback:** If timing metadata isn't available, uses `tokenSet.expired()` method

#### Retry Logic with Exponential Backoff

If a token refresh fails, the system automatically retries:

- **Max Attempts:** 3 attempts
- **Backoff Delays:** 
  - Attempt 1: 200ms delay
  - Attempt 2: 400ms delay  
  - Attempt 3: 800ms delay
- **Logging:** Each attempt is logged with structured logging for debugging

#### Concurrency Guard

To prevent multiple concurrent refresh attempts:

- **Lock Mechanism:** Uses Vercel KV with `SET NX` (set if not exists)
- **Lock Duration:** 30 seconds
- **Wait Behavior:** If another request is refreshing, waits up to 1.5 seconds (5 × 300ms)
- **Lock Release:** Always released after refresh completes or fails

**How it works:**
1. Request checks if token needs refresh
2. Attempts to acquire lock in KV (`xero:token:refresh-lock:{userId}`)
3. If lock acquired → proceeds with refresh
4. If lock exists → waits for other request to complete, then re-reads token from KV
5. Lock is always released in `finally` block

#### Error Handling

- **Success:** Token refreshed and stored in KV, client updated
- **All Attempts Fail:** Throws `AuthenticationError` with message "Xero connection expired. Please reconnect Xero from settings."
- **User Action Required:** User must reconnect Xero from admin panel to get new tokens

#### Implementation Details

**Location:** `lib/xero/helpers.ts` - `ensureAuthenticated()` function

**Key Functions:**
- `ensureAuthenticated(userId)` - Main function that handles refresh logic
- `getTokenSet(userId)` - Retrieves stored tokens from KV
- `storeTokenSet(userId, tokenSet)` - Stores refreshed tokens in KV

**Example Flow:**
```typescript
// In any API route that needs Xero:
import { ensureAuthenticated, getAuthenticatedTenantId } from '@/lib/xero/helpers';

// This automatically refreshes if needed
await ensureAuthenticated();
const tenantId = await getAuthenticatedTenantId();
```

---

## Lazy Initialization

### Why Lazy Initialization?

The Xero client uses **lazy initialization** to prevent build-time failures when environment variables aren't available during Next.js build process.

**Problem:** If `XeroClient` is initialized at module load time, it throws errors during `next build` when environment variables aren't set.

**Solution:** Client is only created when first accessed via `getXeroClient()` function.

### Usage Pattern

**Correct:**
```typescript
import { getXeroClient } from '@/lib/xero/client';

// Client is created here (not at import time)
const xeroClient = getXeroClient();
const consentUrl = await xeroClient.buildConsentUrl();
```

**Incorrect:**
```typescript
// Don't do this - causes build failures
import { xeroClient } from '@/lib/xero/client';
// Client tries to initialize immediately
```

**Implementation:** `lib/xero/client.ts` - `getXeroClient()` function

---

## Structured Logging

All Xero operations use structured logging for better debugging and monitoring.

### Logger Names

- **`xero.helpers`** - Token management and authentication
- **`xero.invoices.create`** - Invoice creation operations
- **`xero.invoices.list`** - Invoice listing operations
- **`xero.invoices.detail`** - Invoice detail retrieval

### Log Levels

- **`info`** - Normal operations (token refresh success, invoice created)
- **`warn`** - Retryable issues (token refresh attempt failed, will retry)
- **`error`** - Failures (API errors, authentication failures, token refresh failed after retries)

### Log Context

All logs include relevant context:
- `userId` - User identifier (default: "default")
- `attempt` - Retry attempt number (for token refresh)
- `contactId`, `invoiceId` - Operation-specific IDs
- `lineItemsCount` - Number of line items in invoice

### Viewing Logs

**Vercel CLI:**
```bash
# View all logs
vercel logs --follow

# Filter for Xero operations
vercel logs --follow | grep xero

# Filter for specific operation
vercel logs --follow | grep "xero.invoices.create"
```

**Vercel Dashboard:**
1. Go to your project → **Deployments**
2. Click on a deployment → **Functions** tab
3. View function logs for Xero API routes

### Example Log Output

**Token Refresh Success:**
```json
{
  "level": "info",
  "msg": "Xero token refreshed successfully",
  "timestamp": "2025-12-04T10:30:00.000Z",
  "component": "xero.helpers",
  "userId": "default",
  "attempt": 1
}
```

**Token Refresh Retry:**
```json
{
  "level": "warn",
  "msg": "Xero token refresh attempt failed",
  "timestamp": "2025-12-04T10:30:00.000Z",
  "component": "xero.helpers",
  "userId": "default",
  "attempt": 1
}
```

**Invoice Created:**
```json
{
  "level": "info",
  "msg": "Xero invoice created successfully",
  "timestamp": "2025-12-04T10:30:00.000Z",
  "component": "xero.invoices.create",
  "invoiceId": "12345678-1234-1234-1234-123456789012",
  "invoiceNumber": "INV-001"
}
```

---

## Usage Guide

### Connecting Xero from Admin Panel

1. **Navigate to Admin Settings**
   - Go to `/admin/settings` in your application
   - Look for the **"Xero Integration"** section

2. **Connect Xero**
   - Click the **"Connect Xero"** button
   - You'll be redirected to Xero's authorization page
   - Sign in with your Xero account
   - Review and approve the requested permissions
   - You'll be redirected back to your application

3. **Verify Connection**
   - The admin panel will show:
     - ✅ **Connected** status
     - Organization name
     - Tenant ID
     - Last sync time

4. **Disconnect Xero**
   - Click **"Disconnect"** button to remove the connection
   - This will revoke tokens and clear stored credentials

### Creating Invoices Manually

#### Using the Admin Panel:

1. **Open Create Invoice Dialog**
   - Navigate to `/admin/settings` or wherever the invoice creation UI is located
   - Click **"Create Invoice"** button

2. **Fill in Invoice Details**
   - **Contact Information:**
     - Contact Name (required)
     - Email Address (required)
   - **Line Items:**
     - Description (required)
     - Quantity (required, minimum 0.01)
     - Unit Amount (required, minimum 0.01)
     - Account Code (optional, defaults to "200" for Sales)
   - **Invoice Details:**
     - Due Date (required, ISO date format)
     - Reference (optional)

3. **Create Invoice**
   - Click **"Create as Draft"** to create a draft invoice
   - Click **"Create & Submit"** to create and submit the invoice immediately
   - The system will:
     - Check if contact exists (by email), create if not
     - Create the invoice with line items
     - Return invoice ID and number

#### Using the API:

See [API Reference - Create Invoice](#post-apixerocreate-invoice) for API usage.

### Automatic Invoice Creation

When `ENABLE_AUTO_INVOICING=true`, invoices are automatically created when:

- A payment is successfully processed (Stripe webhook confirms payment)
- An order is completed

**How it works:**
1. Payment webhook is received
2. System checks if Xero is connected
3. If connected, creates invoice automatically:
   - Contact is created/found by email
   - Invoice is created with order line items
   - Invoice status: `DRAFT` (can be changed to `SUBMITTED` if needed)
4. Invoice ID is stored with the order record

**Configuration:**
- Set `ENABLE_AUTO_INVOICING=true` in environment variables
- Ensure Xero is connected via admin panel
- Automatic invoice creation happens in the background

### Viewing Invoice Status

#### In Admin Panel:
- Navigate to the invoices section (if available)
- View list of invoices with status, amounts, and dates
- Click on an invoice to view details

#### Using the API:
- `GET /api/xero/invoices` - List all invoices
- `GET /api/xero/invoices/[id]` - Get invoice details
- `GET /api/xero/invoices/[id]?pdf=true` - Download invoice PDF

### Troubleshooting Common Issues

#### "Xero not connected" Error
- **Cause:** No valid token set stored
- **Solution:** 
  1. Go to `/admin/settings`
  2. Click **"Connect Xero"** to re-authenticate
  3. Ensure environment variables are set correctly

#### "Authorization code not found" Error
- **Cause:** OAuth callback didn't receive the authorization code
- **Solution:**
  1. Check that `XERO_REDIRECT_URI` matches exactly in Xero Developer Portal
  2. Ensure you're using HTTPS in production (or ngrok in development)
  3. Try disconnecting and reconnecting

#### "Failed to refresh Xero token" Error
- **Cause:** Refresh token expired or invalid, or all retry attempts failed
- **Solution:**
  1. Disconnect Xero from admin panel
  2. Reconnect Xero (this will get new tokens)
  3. Ensure `offline_access` scope is included in `XERO_SCOPES`
  4. Check Vercel logs for detailed error messages:
     ```bash
     vercel logs --follow | grep "xero.helpers"
     ```
- **What Happens:**
  - System attempts refresh up to 3 times with exponential backoff
  - If all attempts fail, throws `AuthenticationError`
  - Previous tokens are cleared from storage
  - User must reconnect to get fresh tokens

#### "No Xero tenant found" Error
- **Cause:** Tenant ID not stored after OAuth callback
- **Solution:**
  1. Disconnect and reconnect Xero
  2. Ensure you have at least one organization in your Xero account

#### Invoice Creation Fails
- **Check:**
  1. Xero is connected (status shows "Connected")
  2. Required fields are provided (contact name, email, line items)
  3. Account codes exist in your Xero chart of accounts
  4. Contact email is valid format
  5. Due date is in the future (or allowed by Xero settings)
  6. Check structured logs for detailed error:
     ```bash
     vercel logs --follow | grep "xero.invoices.create"
     ```

#### Check Structured Logs

All Xero operations are logged with structured logging:

- **Logger Names:**
  - `xero.helpers` - Token management and authentication
  - `xero.invoices.create` - Invoice creation
  - `xero.invoices.list` - Invoice listing
  - `xero.invoices.detail` - Invoice details

- **Log Levels:**
  - `info` - Normal operations (token refresh, invoice creation)
  - `warn` - Retryable issues (token refresh attempts)
  - `error` - Failures (API errors, authentication failures)

- **View Logs:**
  ```bash
  # All Xero logs
  vercel logs --follow | grep xero
  
  # Specific operation
  vercel logs --follow | grep "xero.invoices.create"
  
  # Token refresh issues
  vercel logs --follow | grep "xero.helpers"
  ```

- **Log Context:** All logs include relevant context like `userId`, `attempt`, `invoiceId`, etc.

#### Webhooks Not Receiving Events
- **Check:**
  1. Webhook URL is correct in Xero Developer Portal
  2. `XERO_WEBHOOK_KEY` is set correctly
  3. Webhook endpoint is publicly accessible (use ngrok for local testing)
  4. Webhook events are subscribed in Xero Developer Portal
  5. Check server logs for webhook requests

---

## API Reference

### Authentication Endpoints

#### `GET /api/xero/connect`
Initiates the Xero OAuth 2.0 flow.

**Description:** Redirects user to Xero authorization page.

**Response:**
- **Success:** Redirects to Xero authorization URL
- **Error:** Redirects to `/admin/settings?xero=error&message=...`

**Example:**
```bash
# User clicks "Connect Xero" button which navigates to:
GET /api/xero/connect

# User is redirected to Xero authorization page
```

---

#### `GET /api/xero/callback`
Handles OAuth callback from Xero.

**Query Parameters:**
- `code` (string, required) - Authorization code from Xero
- `state` (string, optional) - State parameter for CSRF protection
- `error` (string, optional) - Error code if authorization failed
- `error_description` (string, optional) - Error description

**Response:**
- **Success:** Redirects to `/admin/settings?xero=connected`
- **Error:** Redirects to `/admin/settings?xero=error&message=...`

**Example:**
```
GET /api/xero/callback?code=abc123def456&state=xyz789
```

---

#### `GET /api/xero/status`
Returns the current Xero connection status.

**Response:**
```json
{
  "connected": true,
  "organizationName": "My Company Pty Ltd",
  "tenantId": "12345678-1234-1234-1234-123456789012",
  "lastSync": "2024-01-15T10:30:00.000Z"
}
```

**Status Codes:**
- `200` - Success (returns status object)

**Example:**
```bash
curl https://rockywebstudio.com.au/api/xero/status
```

---

#### `POST /api/xero/disconnect`
Disconnects Xero and removes stored credentials.

**Response:**
```json
{
  "success": true,
  "message": "Xero disconnected successfully"
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

**Example:**
```bash
curl -X POST https://rockywebstudio.com.au/api/xero/disconnect
```

---

### Invoice Endpoints

#### `GET /api/xero/invoices`
Retrieves a list of invoices from Xero.

**Query Parameters:**
- `where` (string, optional) - Xero where clause for filtering
  - Example: `Status="AUTHORISED"`
- `order` (string, optional) - Sort order
  - Example: `Date DESC`
- `page` (number, optional) - Page number (if pagination is implemented)

**Response:**
```json
{
  "success": true,
  "invoices": [
    {
      "invoiceID": "12345678-1234-1234-1234-123456789012",
      "invoiceNumber": "INV-001",
      "type": "ACCREC",
      "status": "AUTHORISED",
      "date": "2024-01-15T00:00:00.000Z",
      "dueDate": "2024-02-15T00:00:00.000Z",
      "reference": "Order #12345",
      "total": 149.00,
      "totalTax": 14.90,
      "amountDue": 149.00,
      "amountPaid": 0.00,
      "contact": {
        "contactID": "87654321-4321-4321-4321-210987654321",
        "name": "John Doe",
        "emailAddress": "john@example.com"
      }
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

**Example:**
```bash
# Get all invoices
curl https://rockywebstudio.com.au/api/xero/invoices

# Get authorized invoices
curl "https://rockywebstudio.com.au/api/xero/invoices?where=Status%3D%22AUTHORISED%22"

# Get invoices ordered by date
curl "https://rockywebstudio.com.au/api/xero/invoices?order=Date%20DESC"
```

---

#### `GET /api/xero/invoices/[id]`
Retrieves invoice details from Xero.

**Path Parameters:**
- `id` (string, required) - Invoice ID

**Query Parameters:**
- `pdf` (boolean, optional) - If `true`, returns PDF instead of JSON
  - Example: `?pdf=true`

**Response (JSON):**
```json
{
  "success": true,
  "invoice": {
    "invoiceID": "12345678-1234-1234-1234-123456789012",
    "invoiceNumber": "INV-001",
    "type": "ACCREC",
    "status": "AUTHORISED",
    "date": "2024-01-15T00:00:00.000Z",
    "dueDate": "2024-02-15T00:00:00.000Z",
    "reference": "Order #12345",
    "total": 149.00,
    "totalTax": 14.90,
    "amountDue": 149.00,
    "amountPaid": 0.00,
    "contact": {
      "contactID": "87654321-4321-4321-4321-210987654321",
      "name": "John Doe",
      "emailAddress": "john@example.com"
    },
    "lineItems": [
      {
        "lineItemID": "11111111-1111-1111-1111-111111111111",
        "description": "Wedding Trio Package",
        "quantity": 1,
        "unitAmount": 149.00,
        "lineAmount": 149.00,
        "accountCode": "200"
      }
    ]
  }
}
```

**Response (PDF):**
- Returns PDF file with `Content-Type: application/pdf`
- Filename: `invoice-{invoiceID}.pdf`

**Status Codes:**
- `200` - Success
- `400` - Missing invoice ID
- `404` - Invoice not found
- `500` - Server error

**Example:**
```bash
# Get invoice details
curl https://rockywebstudio.com.au/api/xero/invoices/12345678-1234-1234-1234-123456789012

# Download invoice PDF
curl -o invoice.pdf "https://rockywebstudio.com.au/api/xero/invoices/12345678-1234-1234-1234-123456789012?pdf=true"
```

---

#### `POST /api/xero/create-invoice`
Creates a new invoice in Xero.

**Request Body:**
```json
{
  "contactName": "John Doe",
  "contactEmail": "john@example.com",
  "lineItems": [
    {
      "description": "Wedding Trio Package",
      "quantity": 1,
      "unitAmount": 149.00,
      "accountCode": "200"
    },
    {
      "description": "Additional Service",
      "quantity": 2,
      "unitAmount": 25.00,
      "accountCode": "200"
    }
  ],
  "dueDate": "2024-02-15",
  "reference": "Order #12345",
  "status": "DRAFT"
}
```

**Request Fields:**
- `contactName` (string, required) - Contact name
- `contactEmail` (string, required) - Contact email address
- `lineItems` (array, required) - Array of line items
  - `description` (string, required) - Line item description
  - `quantity` (number, required, min: 0.01) - Quantity
  - `unitAmount` (number, required, min: 0.01) - Unit price
  - `accountCode` (string, optional) - Account code (default: "200")
- `dueDate` (string, required) - Due date in ISO format (YYYY-MM-DD)
- `reference` (string, optional) - Invoice reference
- `status` (string, optional) - Invoice status: `"DRAFT"` or `"SUBMITTED"` (default: `"DRAFT"`)

**Response:**
```json
{
  "success": true,
  "invoiceId": "12345678-1234-1234-1234-123456789012",
  "invoiceNumber": "INV-001",
  "contactId": "87654321-4321-4321-4321-210987654321"
}
```

**Status Codes:**
- `201` - Invoice created successfully
- `400` - Validation error (missing required fields)
- `500` - Server error

**Example:**
```bash
curl -X POST https://rockywebstudio.com.au/api/xero/create-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "contactName": "John Doe",
    "contactEmail": "john@example.com",
    "lineItems": [
      {
        "description": "Wedding Trio Package",
        "quantity": 1,
        "unitAmount": 149.00,
        "accountCode": "200"
      }
    ],
    "dueDate": "2024-02-15",
    "reference": "Order #12345",
    "status": "DRAFT"
  }'
```

**Behavior:**
- If contact exists (by email), uses existing contact
- If contact doesn't exist, creates new contact
- Creates invoice with specified line items
- Returns invoice ID and number

**Error Handling:**
- Uses structured logging (`xero.invoices.create` logger)
- Returns appropriate HTTP status codes (400, 500)
- Error messages are user-friendly and actionable

**Note:** This route currently uses manual error handling. Future updates will migrate to `withApiHandler` for consistency with other API routes (like Stripe webhooks).

---

### Error Codes and Handling

#### Error Types

The Xero integration uses a custom error hierarchy:

**AuthenticationError:**
- **Status Code:** 401
- **When Used:** 
  - Xero not connected
  - Tokens expired and refresh failed
  - No tenant ID found
- **User Action:** Reconnect Xero from admin panel
- **Example:**
  ```json
  {
    "success": false,
    "error": "Xero not connected. Please connect Xero first.",
    "code": "AUTHENTICATION_ERROR"
  }
  ```

**ExternalServiceError:**
- **Status Code:** 502 or 503
- **When Used:**
  - Xero API call failed
  - Network errors
  - Xero service unavailable
- **Retryable:** Usually yes (transient errors)
- **Example:**
  ```json
  {
    "success": false,
    "error": "Failed to create invoice in Xero",
    "code": "EXTERNAL_SERVICE_ERROR",
    "retryable": true
  }
  ```

**ValidationError:**
- **Status Code:** 400
- **When Used:**
  - Missing required fields
  - Invalid data format
  - Invalid email addresses
- **Example:**
  ```json
  {
    "success": false,
    "error": "contactName and contactEmail are required",
    "code": "VALIDATION_ERROR"
  }
  ```

#### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "contactName and contactEmail are required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Invoice not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Failed to create invoice"
}
```

**Note:** Xero API routes currently use manual error handling. Future updates will migrate to `withApiHandler` for consistency with other API routes (like Stripe webhooks).

#### Error Handling Best Practices

1. **Check Response Status:**
   ```javascript
   const response = await fetch('/api/xero/create-invoice', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(invoiceData)
   });
   
   if (!response.ok) {
     const error = await response.json();
     console.error('Invoice creation failed:', error.error);
     // Handle error
   }
   ```

2. **Validate Before Sending:**
   - Ensure all required fields are present
   - Validate email format
   - Check numeric values are positive
   - Verify date format (ISO: YYYY-MM-DD)

3. **Handle Token Expiration:**
   - If you get authentication errors, check connection status
   - Reconnect Xero if tokens have expired
   - Ensure `offline_access` scope is included

4. **Retry Logic:**
   - For transient errors (network issues), implement retry logic
   - Use exponential backoff
   - Log errors for debugging

---

## Additional Resources

- [Xero API Documentation](https://developer.xero.com/documentation)
- [Xero OAuth 2.0 Guide](https://developer.xero.com/documentation/guides/oauth2/overview)
- [Xero Node SDK](https://github.com/XeroAPI/xero-node)
- [Xero Developer Portal](https://developer.xero.com)

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting-common-issues) section
2. Review Xero API documentation
3. Check server logs for detailed error messages
4. Verify environment variables are set correctly

