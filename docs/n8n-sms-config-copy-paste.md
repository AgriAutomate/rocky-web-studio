# n8n HTTP Request Node Configuration - Copy & Paste Ready

## Quick Setup Instructions

### 1. Method & URL
- **Method**: `POST`
- **URL**: `https://api.mobilemessage.com.au/v1/messages`

### 2. Authentication (Basic Auth)
1. In the HTTP Request node, go to **Authentication** section
2. Select **Generic Credential Type**
3. Choose **Basic Auth**
4. **User**: `{{ $env.MOBILE_MESSAGE_API_USERNAME }}`
5. **Password**: `{{ $env.MOBILE_MESSAGE_API_PASSWORD }}`

### 3. Headers
Add one header:
- **Name**: `Content-Type`
- **Value**: `application/json`

### 4. Body Parameters (JSON)
**Select "JSON" format** and paste this exact JSON:

```json
{
  "enable_unicode": true,
  "messages": [
    {
      "to": "{{ $json.data.object.metadata.phone }}",
      "message": "💰 New Payment: ${{ ($json.data.object.amount / 100).toFixed(2) }} {{ $json.data.object.currency.toUpperCase() }} from {{ $json.data.object.metadata.customerEmail }}. Order ID: {{ $json.data.object.metadata.orderId }}",
      "sender": "{{ $env.MOBILE_MESSAGE_SENDER_ID }}",
      "custom_ref": "{{ $json.data.object.metadata.orderId }}"
    }
  ]
}
```

---

## What This Does

- **Converts cents to dollars**: `($json.data.object.amount / 100).toFixed(2)` converts Stripe's amount (e.g., 14900 cents) to dollars (149.00)
- **Extracts phone number**: From `$json.data.object.metadata.phone`
- **Extracts email**: From `$json.data.object.metadata.customerEmail`
- **Extracts order ID**: From `$json.data.object.metadata.orderId`
- **Uses Sender ID**: From environment variable `MOBILE_MESSAGE_SENDER_ID`

## Example Output

If Stripe sends:
- Amount: `14900` cents
- Currency: `aud`
- Email: `customer@example.com`
- Order ID: `CS-ABC123-XYZ`

The SMS will be:
```
💰 New Payment: $149.00 AUD from customer@example.com. Order ID: CS-ABC123-XYZ
```

## Environment Variables Required in n8n

Make sure these are set in n8n (Settings → Environment Variables):
- `MOBILE_MESSAGE_API_USERNAME`
- `MOBILE_MESSAGE_API_PASSWORD`
- `MOBILE_MESSAGE_SENDER_ID` (e.g., "RockyWeb")

## Phone Number Format

The phone number from Stripe metadata should be in E.164 format:
- ✅ `+61400000000`
- ❌ `0400 000 000`
- ❌ `61400000000` (missing +)

If your Stripe metadata doesn't include the `+`, you may need to add it in a Function node before the HTTP Request node.


