# n8n Mobile Message SMS Setup Guide

## 🔄 Replacing Twilio Nodes with Mobile Message HTTP Requests

This guide shows how to replace Twilio SMS nodes in n8n workflows with Mobile Message HTTP Request nodes.

---

## 📋 Prerequisites

1. **Mobile Message API Credentials:**
   - Username: From Mobile Message dashboard
   - Password: From Mobile Message dashboard
   - Sender ID: "Rocky Web" (ACMA-approved)

2. **n8n Environment Variables:**
   - `MOBILE_MESSAGE_API_URL` = `https://api.mobilemessage.com.au/v1`
   - `MOBILE_MESSAGE_API_USERNAME` = Your username
   - `MOBILE_MESSAGE_API_PASSWORD` = Your password
   - `MOBILE_MESSAGE_SENDER_ID` = `Rocky Web`

---

## 🔧 Step-by-Step: Replace Twilio Node

### Step 1: Delete Twilio Node

1. Open your n8n workflow
2. Find the Twilio node (usually named "Send SMS - ...")
3. Right-click → Delete
4. Note the connections (which nodes connect to/from it)

### Step 2: Add HTTP Request Node

1. Click "+" to add new node
2. Search for "HTTP Request"
3. Select "HTTP Request" node
4. Position it where the Twilio node was

### Step 3: Configure HTTP Request Node

**Basic Settings:**
- **Name:** `Send SMS - [Description]` (e.g., "Send SMS - Assigned")
- **Method:** `POST`
- **URL:** `https://api.mobilemessage.com.au/v1/messages`

**Authentication:**
- **Authentication:** `Generic Credential Type`
- **Credential Type:** `Header Auth`
- **Name:** `Authorization`
- **Value:** `Basic {{ $env.MOBILE_MESSAGE_AUTH_HEADER }}`

**Headers:**
- **Header Name:** `Content-Type`
- **Header Value:** `application/json`

**Body:**
- **Body Content Type:** `JSON`
- **JSON Body:**
```json
{
  "enable_unicode": true,
  "messages": [
    {
      "to": "{{ $json.phone }}",
      "message": "{{ $json.message }}",
      "sender": "Rocky Web",
      "custom_ref": "{{ $json.booking_id || $json.id }}"
    }
  ]
}
```

### Step 4: Set Up Environment Variable

**In n8n Settings → Environment Variables:**

1. Add new variable: `MOBILE_MESSAGE_AUTH_HEADER`
2. Calculate Base64 value:
   ```bash
   # In terminal:
   echo -n "username:password" | base64
   # Example output: dXNlcm5hbWU6cGFzc3dvcmQ=
   ```
3. Full value: `Basic dXNlcm5hbWU6cGFzc3dvcmQ=`
4. Save environment variable

### Step 5: Reconnect Nodes

1. Connect input node → HTTP Request node
2. Connect HTTP Request node → Output node(s)
3. Verify connections match original workflow

---

## 📝 Example Configurations

### Example 1: Status Notification - Assigned

**Node Name:** `Send SMS - Assigned`

**JSON Body:**
```json
{
  "enable_unicode": true,
  "messages": [
    {
      "to": "{{ $json.phone }}",
      "message": "Your tech is {{ $json.technician_name }}, arriving {{ $json.scheduled_date }} {{ $json.time_window }}",
      "sender": "Rocky Web",
      "custom_ref": "assigned-{{ $json.booking_id }}"
    }
  ]
}
```

### Example 2: Status Notification - En Route

**Node Name:** `Send SMS - En Route`

**JSON Body:**
```json
{
  "enable_unicode": true,
  "messages": [
    {
      "to": "{{ $json.phone }}",
      "message": "We're {{ $json.eta_minutes }} minutes away! Vehicle is {{ $json.vehicle_id }}",
      "sender": "Rocky Web",
      "custom_ref": "en-route-{{ $json.booking_id }}"
    }
  ]
}
```

### Example 3: Status Notification - Completed

**Node Name:** `Send SMS - Completed`

**JSON Body:**
```json
{
  "enable_unicode": true,
  "messages": [
    {
      "to": "{{ $json.phone }}",
      "message": "Service complete! View invoice and pay: {{ $json.payment_link }}",
      "sender": "Rocky Web",
      "custom_ref": "completed-{{ $json.booking_id }}"
    }
  ]
}
```

### Example 4: NPS Survey Invitation

**Node Name:** `Send SMS - NPS Survey`

**JSON Body:**
```json
{
  "enable_unicode": true,
  "messages": [
    {
      "to": "{{ $json.phone }}",
      "message": "Hi {{ $json.first_name }}, how was your service? Take our quick survey: {{ $json.survey_link }}",
      "sender": "Rocky Web",
      "custom_ref": "nps-{{ $json.booking_id }}"
    }
  ]
}
```

### Example 5: Recurring Billing Reminder

**Node Name:** `Send SMS - Renewal Reminder`

**JSON Body:**
```json
{
  "enable_unicode": true,
  "messages": [
    {
      "to": "{{ $json.phone }}",
      "message": "Your {{ $json.service_type }} renews on {{ $json.renewal_date }}. Update payment: {{ $json.payment_link }}",
      "sender": "Rocky Web",
      "custom_ref": "renewal-{{ $json.subscription_id }}"
    }
  ]
}
```

---

## 🔍 Response Handling

**Success Response:**
```json
{
  "success": true,
  "messages": [
    {
      "message_id": "mm_2024_1234567890",
      "recipient": "+61412345678",
      "status": "sent"
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "messages": [
    {
      "errors": ["Invalid phone number format"]
    }
  ]
}
```

**Add Error Handling Node (Optional):**
1. Add IF node after HTTP Request
2. Condition: `{{ $json.success }} === false`
3. Route errors to Slack/Email notification

---

## ✅ Verification Checklist

- [ ] Twilio node deleted
- [ ] HTTP Request node added
- [ ] URL set to `https://api.mobilemessage.com.au/v1/messages`
- [ ] Authentication header configured
- [ ] JSON body includes `sender: "Rocky Web"`
- [ ] Phone number field mapped correctly
- [ ] Message content mapped correctly
- [ ] Environment variable `MOBILE_MESSAGE_AUTH_HEADER` set
- [ ] Nodes reconnected
- [ ] Workflow tested
- [ ] SMS received with sender "Rocky Web"

---

## 🧪 Testing

1. **Activate workflow**
2. **Trigger test execution** (manual or via webhook)
3. **Check execution log:**
   - HTTP Request should return 200 OK
   - Response should include `message_id`
4. **Verify SMS received:**
   - Check test phone
   - Sender should show "Rocky Web"
   - Message content correct

---

## 🚨 Troubleshooting

### Authentication Error (401)

**Problem:** `MOBILE_MESSAGE_AUTH_HEADER` incorrect

**Solution:**
1. Verify username/password are correct
2. Recalculate Base64: `echo -n "username:password" | base64`
3. Ensure format: `Basic <base64_string>`
4. Update environment variable

### Invalid Phone Number (400)

**Problem:** Phone number format incorrect

**Solution:**
1. Ensure format: `+61412345678` (E.164)
2. Remove spaces/dashes
3. Add country code `+61` for Australian numbers

### Sender ID Error

**Problem:** Sender ID not recognized

**Solution:**
1. Verify sender ID is exactly "Rocky Web"
2. Check Sender ID is registered in Mobile Message dashboard
3. Ensure ACMA approval is active

---

## 📚 Related Documentation

- **Migration Guide:** `docs/TWILIO_TO_MOBILE_MESSAGE_MIGRATION.md`
- **Mobile Message API:** https://mobilemessage.com.au/api
- **Workflow Examples:** See workflow JSON files in `docs/`

---

**Last Updated:** December 2024  
**Status:** Ready for implementation
