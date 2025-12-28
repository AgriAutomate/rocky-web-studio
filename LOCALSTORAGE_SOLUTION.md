# localStorage Solution for Questionnaire Form

**Problem Solved:** Stale localStorage data from previous incomplete sessions interfering with new submissions.

---

## ✅ Solution Implemented: Auto-Expiration with Timestamp

### **How It Works:**

1. **On Save:** Every time form data is saved, we store a timestamp
2. **On Load:** Check if saved data is older than 7 days
3. **Auto-Clear:** If data is older than 7 days, automatically clear it
4. **Clean State:** Form starts fresh with no stale data

---

## 📋 Changes Made

### **1. Add Timestamp on Save**

```typescript
localStorage.setItem('questionnaire_form_timestamp', Date.now().toString());
```

**When:** Every time form data is saved

### **2. Check Expiry on Load**

```typescript
const savedTimestamp = localStorage.getItem('questionnaire_form_timestamp');
if (savedTimestamp) {
  const age = Date.now() - parseInt(savedTimestamp, 10);
  const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  if (age > sevenDays) {
    // Clear expired data automatically
    localStorage.removeItem('questionnaire_form_data');
    localStorage.removeItem('questionnaire_form_step');
    localStorage.removeItem('questionnaire_form_timestamp');
    return; // Don't load expired data
  }
}
```

**When:** On component mount (page load)

### **3. Clear Timestamp on Submit/Reset**

```typescript
localStorage.removeItem('questionnaire_form_timestamp');
```

**When:** 
- After successful form submission
- When user clicks "Start Fresh" button

---

## 🎯 Benefits

✅ **Automatic Cleanup:** Data older than 7 days is automatically cleared  
✅ **No Manual Intervention:** Customers don't need to clear browser data  
✅ **Better UX:** Returning users (within 7 days) can still resume  
✅ **Prevents Stale Data:** Old incomplete sessions won't interfere  
✅ **Works for All Customers:** No special setup needed  

---

## ⏱️ Expiry Settings

**Current Setting:** 7 days

This means:
- ✅ Data less than 7 days old: Auto-loaded (resume functionality)
- ❌ Data older than 7 days: Auto-cleared (fresh start)

**Can be adjusted** if needed:
- **24 hours:** More aggressive cleanup (recommended for testing)
- **30 days:** Less aggressive (for users who return infrequently)
- **7 days:** Balanced approach (current - recommended)

---

## 🔄 User Experience Flow

### **Scenario 1: User Returns Within 7 Days**
1. User starts questionnaire
2. Leaves page (data saved with timestamp)
3. Returns within 7 days
4. **Result:** Data auto-loaded, user can resume from where they left off

### **Scenario 2: User Returns After 7 Days**
1. User starts questionnaire
2. Leaves page (data saved with timestamp)
3. Returns after 7+ days
4. **Result:** Data automatically cleared, form starts fresh

### **Scenario 3: User Wants Fresh Start**
1. User sees "Start Fresh" button (if saved data exists)
2. Clicks "Start Fresh"
3. **Result:** All saved data cleared, form starts from Step 1

---

## 🧪 Testing

### **Test Auto-Expiration:**
```javascript
// In browser console, simulate old data:
localStorage.setItem('questionnaire_form_data', '{"test":"data"}');
localStorage.setItem('questionnaire_form_step', '5');
localStorage.setItem('questionnaire_form_timestamp', (Date.now() - 8 * 24 * 60 * 60 * 1000).toString()); // 8 days ago

// Reload page - data should be automatically cleared
```

### **Test Recent Data:**
```javascript
// Set recent data:
localStorage.setItem('questionnaire_form_data', '{"test":"data"}');
localStorage.setItem('questionnaire_form_step', '5');
localStorage.setItem('questionnaire_form_timestamp', Date.now().toString()); // Now

// Reload page - data should be loaded
```

---

## 📊 Impact

**Before:**
- ❌ Data persisted indefinitely
- ❌ Stale data could interfere with new submissions
- ❌ Required manual clearing (incognito mode or browser settings)
- ❌ Poor customer experience

**After:**
- ✅ Data auto-expires after 7 days
- ✅ Stale data automatically cleared
- ✅ No manual intervention needed
- ✅ Better customer experience
- ✅ Still allows resume for recent sessions (within 7 days)

---

## 🎯 Additional Options (Future Enhancements)

### **Option 1: Shorter Expiry for Testing**
Change to 24 hours for more aggressive cleanup:
```typescript
const oneDay = 24 * 60 * 60 * 1000; // 1 day
if (age > oneDay) { ... }
```

### **Option 2: User Prompt for Old Data**
Prompt user if data is 24 hours - 7 days old:
```typescript
if (age > oneDay && age < sevenDays) {
  // Show prompt: "Continue with saved progress or start fresh?"
}
```

### **Option 3: Version Check**
Add version number to handle form structure changes:
```typescript
localStorage.setItem('questionnaire_storage_version', '1.0.0');
// Check version on load, clear if mismatch
```

---

**Status:** ✅ Implemented and ready for production

The 7-day auto-expiration provides a good balance between allowing users to resume recent sessions while automatically cleaning up stale data.

