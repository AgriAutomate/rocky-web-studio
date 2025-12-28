# localStorage Improvements for Questionnaire Form

**Problem:** Stale localStorage data from previous incomplete sessions can interfere with new submissions.

**Current Issues:**
1. Data persists indefinitely until manually cleared
2. No timestamp/expiration on saved data
3. No way to detect if data is stale or from a different session
4. Corrupted data can break the form

---

## 🎯 Recommended Solutions

### **Solution 1: Add Timestamp + Auto-Expiration** (RECOMMENDED)

Add a timestamp to saved data and automatically clear it after a certain period (e.g., 7 days).

**Benefits:**
- Automatically cleans up old data
- Prevents stale data from interfering
- No manual intervention needed
- Better user experience

**Implementation:**
```typescript
const STORAGE_KEY_FORM_DATA = 'questionnaire_form_data';
const STORAGE_KEY_FORM_STEP = 'questionnaire_form_step';
const STORAGE_KEY_TIMESTAMP = 'questionnaire_form_timestamp';
const STORAGE_EXPIRY_DAYS = 7; // Clear data after 7 days

// Save with timestamp
const saveFormData = (data: FormData, step: number) => {
  localStorage.setItem(STORAGE_KEY_FORM_DATA, JSON.stringify(data));
  localStorage.setItem(STORAGE_KEY_FORM_STEP, step.toString());
  localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());
};

// Load with expiry check
const loadFormData = (): { data: FormData; step: number } | null => {
  const timestamp = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
  
  if (timestamp) {
    const age = Date.now() - parseInt(timestamp, 10);
    const maxAge = STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 7 days in ms
    
    if (age > maxAge) {
      // Data is too old, clear it
      clearFormData();
      return null;
    }
  }
  
  const savedData = localStorage.getItem(STORAGE_KEY_FORM_DATA);
  const savedStep = localStorage.getItem(STORAGE_KEY_FORM_STEP);
  
  if (savedData && savedStep) {
    try {
      return {
        data: JSON.parse(savedData),
        step: parseInt(savedStep, 10),
      };
    } catch (e) {
      clearFormData();
      return null;
    }
  }
  
  return null;
};

const clearFormData = () => {
  localStorage.removeItem(STORAGE_KEY_FORM_DATA);
  localStorage.removeItem(STORAGE_KEY_FORM_STEP);
  localStorage.removeItem(STORAGE_KEY_TIMESTAMP);
};
```

---

### **Solution 2: Session Identifier**

Add a session ID to detect if data is from current session or a previous one.

**Benefits:**
- Can clear data from different sessions
- Better tracking of user sessions
- Can prompt user if session changed

**Implementation:**
```typescript
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('questionnaire_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('questionnaire_session_id', sessionId);
  }
  return sessionId;
};

// Save with session ID
const saveFormData = (data: FormData, step: number) => {
  localStorage.setItem(STORAGE_KEY_FORM_DATA, JSON.stringify(data));
  localStorage.setItem(STORAGE_KEY_FORM_STEP, step.toString());
  localStorage.setItem('questionnaire_session_id', getSessionId());
};

// Check if data is from current session
const isCurrentSession = (): boolean => {
  const savedSessionId = localStorage.getItem('questionnaire_session_id');
  const currentSessionId = getSessionId();
  return savedSessionId === currentSessionId;
};
```

---

### **Solution 3: Data Versioning**

Add a version number to saved data and clear if version doesn't match.

**Benefits:**
- Handles schema changes
- Prevents issues when form structure changes
- Automatic cleanup of incompatible data

**Implementation:**
```typescript
const STORAGE_VERSION = '1.0.0';

// Save with version
const saveFormData = (data: FormData, step: number) => {
  localStorage.setItem(STORAGE_KEY_FORM_DATA, JSON.stringify(data));
  localStorage.setItem(STORAGE_KEY_FORM_STEP, step.toString());
  localStorage.setItem('questionnaire_storage_version', STORAGE_VERSION);
};

// Check version on load
const loadFormData = (): { data: FormData; step: number } | null => {
  const savedVersion = localStorage.getItem('questionnaire_storage_version');
  
  if (savedVersion !== STORAGE_VERSION) {
    // Version mismatch, clear old data
    clearFormData();
    return null;
  }
  
  // ... rest of load logic
};
```

---

### **Solution 4: Prompt User Before Auto-Clear**

Show a prompt asking user if they want to continue with saved data or start fresh.

**Benefits:**
- User has control
- Prevents accidental data loss
- Better UX for returning users

**Implementation:**
```typescript
const loadFormData = (): { data: FormData; step: number; prompt: boolean } | null => {
  const savedData = localStorage.getItem(STORAGE_KEY_FORM_DATA);
  const savedStep = localStorage.getItem(STORAGE_KEY_FORM_STEP);
  const timestamp = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
  
  if (savedData && savedStep && timestamp) {
    const age = Date.now() - parseInt(timestamp, 10);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (age > maxAge) {
      // Data is old, prompt user
      return {
        data: JSON.parse(savedData),
        step: parseInt(savedStep, 10),
        prompt: true, // Show prompt to user
      };
    }
  }
  
  // ... normal load logic
};
```

---

## 🎯 Recommended Combined Approach

**Best Solution:** Combine Solution 1 (Timestamp + Auto-Expiration) with Solution 4 (User Prompt for recent data).

**Implementation Plan:**

1. **Auto-expire data older than 7 days** - No prompt, just clear
2. **Prompt user for data 24 hours - 7 days old** - Ask if they want to continue
3. **Auto-load data less than 24 hours old** - Seamless experience
4. **Add "Start Fresh" button** - Always available (already implemented)
5. **Add version check** - Handle schema changes

---

## 📋 Implementation Checklist

- [ ] Add timestamp to saved data
- [ ] Add expiry check (7 days)
- [ ] Add prompt for old data (24 hours - 7 days)
- [ ] Add version number to data
- [ ] Update load logic to check timestamp and version
- [ ] Update save logic to include timestamp and version
- [ ] Add clear function that removes all related keys
- [ ] Update error handling to clear corrupted data
- [ ] Test with old data
- [ ] Test with corrupted data
- [ ] Test with version mismatch

---

## 🔧 Quick Fix: Simple Expiration

For a quick fix, just add timestamp and 7-day expiry:

```typescript
// On save
localStorage.setItem('questionnaire_form_timestamp', Date.now().toString());

// On load
const timestamp = localStorage.getItem('questionnaire_form_timestamp');
if (timestamp) {
  const age = Date.now() - parseInt(timestamp, 10);
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  if (age > sevenDays) {
    // Clear old data
    localStorage.removeItem('questionnaire_form_data');
    localStorage.removeItem('questionnaire_form_step');
    localStorage.removeItem('questionnaire_form_timestamp');
    return null; // No saved data
  }
}
```

---

## 🎯 Recommended Settings

**Expiry Times:**
- **Auto-load:** < 24 hours (seamless)
- **Prompt user:** 24 hours - 7 days (ask if they want to continue)
- **Auto-clear:** > 7 days (clear automatically)

**Version:**
- Increment when form structure changes significantly
- Current version: `"1.0.0"`

---

**Next Step:** Implement Solution 1 (timestamp + auto-expiration) as it provides the best balance of automatic cleanup and user experience.

