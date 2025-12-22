# 📋 Supabase Storage Policy Creation - Dashboard Guide

**Error:** "Please allow at least one operation in your policy"

This error occurs when creating policies via Supabase Dashboard. Here's the correct way to create each policy.

---

## 🎯 Quick Fix

The Dashboard requires you to **explicitly check/enable the operation** (SELECT, INSERT, UPDATE, DELETE) in the UI, not just provide an expression.

---

## 📝 Step-by-Step Policy Creation

### Navigate to Policies
1. Go to: **Supabase Dashboard → Storage → rockywebstudio**
2. Click **"Policies"** tab
3. Click **"New Policy"**

---

### Policy 1: Public PDF Read Access

**In the Dashboard Form:**

1. **Policy Name:** `Public PDF Read Access`

2. **Allowed Operations:** 
   - ✅ **Check:** `SELECT` (this is critical - must be checked)

3. **Target roles:** 
   - Select: `public` (or leave blank if "public" isn't an option)

4. **USING expression:**
   ```sql
   bucket_id = 'rockywebstudio'
   ```
   
   **OR** if you want to restrict to questionnaire-reports folder:
   ```sql
   bucket_id = 'rockywebstudio' AND name LIKE 'questionnaire-reports/%'
   ```

5. **WITH CHECK expression:** (leave empty for SELECT)

6. Click **"Review"** then **"Save policy"**

**Note:** For public buckets, SELECT is usually automatic, but this ensures it works.

---

### Policy 2: Service Role PDF Upload

**In the Dashboard Form:**

1. **Policy Name:** `Service Role PDF Upload`

2. **Allowed Operations:** 
   - ✅ **Check:** `INSERT` (this is critical - must be checked)

3. **Target roles:** 
   - Select: `service_role` (from dropdown)

4. **USING expression:** (leave empty for INSERT)

5. **WITH CHECK expression:**
   ```sql
   bucket_id = 'rockywebstudio' AND name LIKE 'questionnaire-reports/%'
   ```

6. Click **"Review"** then **"Save policy"**

---

### Policy 3: Service Role PDF Update

**In the Dashboard Form:**

1. **Policy Name:** `Service Role PDF Update`

2. **Allowed Operations:** 
   - ✅ **Check:** `UPDATE` (this is critical - must be checked)

3. **Target roles:** 
   - Select: `service_role` (from dropdown)

4. **USING expression:**
   ```sql
   bucket_id = 'rockywebstudio' AND name LIKE 'questionnaire-reports/%'
   ```

5. **WITH CHECK expression:**
   ```sql
   bucket_id = 'rockywebstudio' AND name LIKE 'questionnaire-reports/%'
   ```

6. Click **"Review"** then **"Save policy"**

---

### Policy 4: Service Role PDF Delete

**In the Dashboard Form:**

1. **Policy Name:** `Service Role PDF Delete`

2. **Allowed Operations:** 
   - ✅ **Check:** `DELETE` (this is critical - must be checked)

3. **Target roles:** 
   - Select: `service_role` (from dropdown)

4. **USING expression:**
   ```sql
   bucket_id = 'rockywebstudio' AND name LIKE 'questionnaire-reports/%'
   ```

5. **WITH CHECK expression:** (leave empty for DELETE)

6. Click **"Review"** then **"Save policy"**

---

## 🔍 Common Issues & Solutions

### Error: "Please allow at least one operation in your policy"

**Cause:** The operation checkbox wasn't checked in the Dashboard UI.

**Solution:** 
- Make sure you **check the operation box** (SELECT, INSERT, UPDATE, or DELETE)
- The Dashboard requires explicit operation selection, not just an expression

### Error: "Invalid expression syntax"

**Cause:** The `storage.foldername()` function might not work in Dashboard UI.

**Solution:** 
- Use `name LIKE 'questionnaire-reports/%'` instead
- This is simpler and works reliably in Dashboard

### Policy created but uploads still fail

**Cause:** Service role might not be selected correctly.

**Solution:**
- Verify `service_role` is selected in "Target roles" dropdown
- Check that the policy shows `service_role` in the roles column

---

## ✅ Simplified Policy Expressions

If `storage.foldername()` doesn't work, use these simpler expressions:

### For Public Read (Policy 1):
```sql
bucket_id = 'rockywebstudio'
```
(Simpler - allows all files in bucket, which is fine for public bucket)

### For Service Role Operations (Policies 2-4):
```sql
bucket_id = 'rockywebstudio' AND name LIKE 'questionnaire-reports/%'
```
(Ensures files are in the questionnaire-reports folder)

---

## 🎯 Minimum Required Policies

**For basic functionality, you only need:**

1. ✅ **Policy 2: Service Role PDF Upload** (INSERT operation)
   - This is the most critical one for PDF uploads to work

2. ✅ **Policy 1: Public PDF Read Access** (SELECT operation)
   - This allows PDFs to be downloaded via public URLs

**Policies 3 and 4 (UPDATE/DELETE) are optional** - only needed if you want to update or delete PDFs later.

---

## 📋 Quick Checklist

When creating each policy, ensure:

- [ ] Policy name is entered
- [ ] **Operation checkbox is checked** (SELECT/INSERT/UPDATE/DELETE)
- [ ] Target role is selected (public or service_role)
- [ ] Expression is entered in correct field (USING or WITH CHECK)
- [ ] Policy is saved successfully

---

## 🚀 Test After Setup

After creating policies, test PDF upload:

1. Submit a questionnaire via `/api/questionnaire/submit`
2. Check logs for upload success
3. Verify `pdf_url` in database contains Supabase Storage URL
4. Try accessing the PDF URL directly in browser

---

**Key Takeaway:** Always check the operation checkbox in the Dashboard UI. The expression alone isn't enough - you must explicitly enable the operation.
