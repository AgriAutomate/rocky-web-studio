# n8n Mobile Message API SMS Configuration Guide

This guide explains how to configure an n8n HTTP Request node to send SMS messages via the Mobile Message API when a Stripe payment succeeds.

## API Details

### Endpoint
```
POST {MOBILE_MESSAGE_API_URL}/messages
```
Default: `https://api.mobilemessage.com.au/v1/messages`

### Authentication
- **Type**: Basic Authentication
- **Format**: Base64 encoded `username:password`
- **Header**: `Authorization: Basic {base64_encoded_credentials}`

### Request Format
```json
{
  "enable_unicode": true,
  "messages": [
    {
      "to": "+61400000000",
      "message": "Your SMS message text here",
      "sender": "RockyWeb",
      "custom_ref": "optional-reference-id"
    }
  ]
}
```

## n8n HTTP Request Node Configuration

### Step 1: Basic Settings

1. **Method**: `POST`
2. **URL**: 
   ```
   {{ $env.MOBILE_MESSAGE_API_URL }}/messages
   ```
   Or hardcode if preferred:
   ```
   https://api.mobilemessage.com.au/v1/messages
   ```

### Step 2: Authentication

1. Go to **Authentication** section
2. Select **Generic Credential Type**
3. Choose **Basic Auth**
4. **User**: `{{ $env.MOBILE_MESSAGE_API_USERNAME }}`
5. **Password**: `{{ $env.MOBILE_MESSAGE_API_PASSWORD }}`

   **OR** manually create Basic Auth header:
   - Go to **Headers** section
   - Add header:
     - **Name**: `Authorization`
     - **Value**: `Basic {{ $json.basicAuth }}`
   - Then use a **Function** node before this to create the Base64 encoded value:
     ```javascript
     const username = $env.MOBILE_MESSAGE_API_USERNAME;
     const password = $env.MOBILE_MESSAGE_API_PASSWORD;
     const credentials = Buffer.from(`${username}:${password}`).toString('base64');
     return { basicAuth: credentials };
     ```

### Step 3: Headers

Add the following headers:

| Name | Value |
|------|-------|
| `Content-Type` | `application/json` |
| `Authorization` | `Basic {{ $json.basicAuth }}` (if not using n8n's Basic Auth) |

### Step 4: Request Body

1. **Body Content Type**: `JSON`
2. **Body**: Use the following JSON structure:

```json
{
  "enable_unicode": true,
  "messages": [
    {
      "to": "{{ $json.phone }}",
      "message": "{{ $json.message }}",
      "sender": "{{ $env.MOBILE_MESSAGE_SENDER_ID }}",
      "custom_ref": "{{ $json.orderId }}"
    }
  ]
}
```

**Example with Stripe webhook data:**
```json
{
  "enable_unicode": true,
  "messages": [
    {
      "to": "{{ $json.data.object.metadata.phone }}",
      "message": "Payment successful! Order {{ $json.data.object.metadata.orderId }} has been confirmed.",
      "sender": "{{ $env.MOBILE_MESSAGE_SENDER_ID }}",
      "custom_ref": "{{ $json.data.object.metadata.orderId }}"
    }
  ]
}
```

## Environment Variables in n8n

To use environment variables in n8n, you need to set them in your n8n instance:

1. **Access n8n Settings** (gear icon in top right)
2. Go to **Environment Variables**
3. Add the following variables:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `MOBILE_MESSAGE_API_URL` | `https://api.mobilemessage.com.au/v1` | API base URL (no trailing slash) |
| `MOBILE_MESSAGE_API_USERNAME` | Your username | From your `.env.local` |
| `MOBILE_MESSAGE_API_PASSWORD` | Your password | From your `.env.local` |
| `MOBILE_MESSAGE_SENDER_ID` | `RockyWeb` | Registered sender ID |

## Complete n8n Workflow Example

### Trigger: Stripe Webhook

1. **Webhook Node** (Stripe)
   - Configure to receive `payment_intent.succeeded` events
   - Method: POST
   - Path: `/webhook/stripe`

### Process Payment Data

2. **Function Node** (Extract Data)
   ```javascript
   const webhookData = $input.item.json;
   const paymentIntent = webhookData.data.object;
   const metadata = paymentIntent.metadata;
   
   return {
     json: {
       orderId: metadata.orderId,
       customerName: metadata.customerName,
       phone: metadata.phone,
       amount: paymentIntent.amount / 100, // Convert cents to dollars
       currency: paymentIntent.currency.toUpperCase(),
       message: `Hi ${metadata.customerName}! Your payment of $${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()} for order ${metadata.orderId} has been confirmed. Thank you!`
     }
   };
   ```

### Send SMS

3. **HTTP Request Node** (Mobile Message API)
   - **Method**: POST
   - **URL**: `https://api.mobilemessage.com.au/v1/messages`
   - **Authentication**: Basic Auth
     - User: `{{ $env.MOBILE_MESSAGE_API_USERNAME }}`
     - Password: `{{ $env.MOBILE_MESSAGE_API_PASSWORD }}`
   - **Headers**:
     - `Content-Type`: `application/json`
   - **Body** (JSON):
     ```json
     {
       "enable_unicode": true,
       "messages": [
         {
           "to": "{{ $json.phone }}",
           "message": "{{ $json.message }}",
           "sender": "{{ $env.MOBILE_MESSAGE_SENDER_ID }}",
           "custom_ref": "{{ $json.orderId }}"
         }
       ]
     }
     ```

### Handle Response

4. **IF Node** (Check Success)
   - Condition: `{{ $json.success }} === true`
   - **True Branch**: Log success
   - **False Branch**: Log error and send notification

## Testing the Configuration

### Test Request Body
```json
{
  "enable_unicode": true,
  "messages": [
    {
      "to": "+61400000000",
      "message": "Test SMS from n8n workflow",
      "sender": "RockyWeb",
      "custom_ref": "test-123"
    }
  ]
}
```

### Expected Success Response
```json
{
  "success": true,
  "messages": [
    {
      "message_id": "msg_123456789",
      "recipient": "+61400000000",
      "status": "queued"
    }
  ]
}
```

### Common Error Responses

**401 Unauthorized**
```json
{
  "error": "Authentication failed"
}
```
**Fix**: Verify `MOBILE_MESSAGE_API_USERNAME` and `MOBILE_MESSAGE_API_PASSWORD`

**400 Bad Request**
```json
{
  "error": "Invalid phone number format"
}
```
**Fix**: Ensure phone numbers are in E.164 format (e.g., `+61400000000`)

**404 Not Found**
```json
{
  "error": "Endpoint not found"
}
```
**Fix**: Verify `MOBILE_MESSAGE_API_URL` has no trailing slash

## Phone Number Format

- **Required Format**: E.164 international format
- **Example**: `+61400000000` (Australia)
- **Must include**: Country code with `+` prefix
- **No spaces or dashes**: `+61 400 000 000` ❌ → `+61400000000` ✅

## Notes

1. **Rate Limiting**: Mobile Message API allows max 5 concurrent requests
2. **Sender ID**: Must be registered in your Mobile Message account dashboard
3. **Unicode**: Set `enable_unicode: true` to support emojis and special characters
4. **Custom Ref**: Optional field for tracking messages in your system
5. **Environment Variables**: n8n Docker container needs these set via `-e` flags or `.env` file

## Docker Environment Variables

If running n8n in Docker, you can pass environment variables:

```bash
docker run -d \
  --name rocky-n8n \
  -p 5678:5678 \
  -v $(pwd)/.n8n-data:/home/node/.n8n \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=27ParkAvenue \
  -e MOBILE_MESSAGE_API_URL=https://api.mobilemessage.com.au/v1 \
  -e MOBILE_MESSAGE_API_USERNAME=your_username \
  -e MOBILE_MESSAGE_API_PASSWORD=your_password \
  -e MOBILE_MESSAGE_SENDER_ID=RockyWeb \
  n8nio/n8n
```

Or create a `.env` file in your n8n data directory and n8n will load it automatically.


