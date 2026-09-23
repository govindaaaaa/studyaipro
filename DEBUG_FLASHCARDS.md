# 🔍 Debug Flashcards - No Documents Showing

## Step-by-Step Debugging

### Step 1: Check Browser Console
1. Open http://localhost:3002/flashcards
2. Press **F12** to open DevTools
3. Click **Console** tab
4. Look for messages starting with `[Flashcards]`

**You should see:**
```
[Flashcards] Fetching sessions...
[Flashcards] Sessions received: {sessions: Array(X)}
[Flashcards] Sessions state updated: X sessions
```

### Step 2: Check If You're Logged In
**In Console, type:**
```javascript
localStorage.getItem('token')
```

**If it returns `null`:**
- ❌ You're not logged in
- ✅ Go to http://localhost:3002/login and login

**If it returns a long string:**
- ✅ You're logged in

### Step 3: Check If You Have Uploaded Documents
**In Console, type:**
```javascript
fetch('http://localhost:8000/upload/sessions', {
  headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
}).then(r => r.json()).then(console.log)
```

**Expected response:**
```json
{
  "sessions": [
    {
      "session_id": "abc-123",
      "filename": "RUHS-Jaipurokk.pdf",
      "created_at": "2025-01-16T..."
    }
  ]
}
```

**If sessions array is empty `[]`:**
- ❌ No documents uploaded
- ✅ Go to Dashboard and upload a PDF

### Step 4: Test API Function Directly
**In Console, type:**
```javascript
// Import the api
import('../src/api.js').then(module => {
  const api = module.api;
  api.getSessions().then(console.log).catch(console.error);
});
```

### Step 5: Check Network Tab
1. Open DevTools → **Network** tab
2. Refresh the Flashcards page
3. Look for request to `upload/sessions`
4. Click on it

**Check:**
- Status: Should be **200 OK**
- Response: Should show JSON with sessions
- Headers: Should have `Authorization: Bearer ...`

**If Status is 401 Unauthorized:**
- Your token expired
- Logout and login again

**If Status is 404:**
- Backend route issue
- Check backend is running on port 8000

### Step 6: Manual Test Backend
**In terminal:**
```bash
# Test if backend is running
curl http://localhost:8000/health

# Should return: {"status":"healthy"}
```

**Test with token (replace YOUR_TOKEN):**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/upload/sessions
```

## Common Issues & Fixes

### Issue 1: Not Logged In
**Symptoms:** 
- No error in console
- Dropdown shows only "Select a document..."

**Fix:**
1. Go to http://localhost:3002/login
2. Login with your credentials
3. Go back to Flashcards page

### Issue 2: No Documents Uploaded
**Symptoms:**
- Debug info shows: "Sessions loaded: 0"
- API returns empty array

**Fix:**
1. Go to http://localhost:3002/dashboard
2. Click upload area
3. Upload a PDF or TXT file
4. Wait for "Upload successful"
5. Go back to Flashcards page

### Issue 3: Token Expired
**Symptoms:**
- Network tab shows 401 error
- Console shows "Unauthorized"

**Fix:**
1. Logout (sidebar → Logout button)
2. Login again
3. Try Flashcards again

### Issue 4: Backend Not Running
**Symptoms:**
- Network error in console
- "Failed to fetch"

**Fix:**
```bash
cd /Users/govindchoudhary/Desktop/MYPROJOK/backend-node
npm run dev
```

## Quick Verification Checklist

Run these in browser console:

```javascript
// 1. Check if logged in
console.log('Token:', localStorage.getItem('token') ? 'YES' : 'NO');

// 2. Check API accessibility
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(d => console.log('Backend:', d.status))
  .catch(() => console.log('Backend: NOT RUNNING'));

// 3. Check sessions
fetch('http://localhost:8000/upload/sessions', {
  headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
})
.then(r => r.json())
.then(d => console.log('Documents:', d.sessions?.length || 0))
.catch(e => console.log('Error:', e.message));
```

## Expected Results

After running the checklist:
```
Token: YES
Backend: healthy
Documents: 1  (or more)
```

**If Documents: 0**, you need to upload a PDF from Dashboard!

## Still Not Working?

Open browser console and paste this full diagnostic:

```javascript
console.clear();
console.log('=== DIAGNOSTICS ===');

// Check token
const token = localStorage.getItem('token');
console.log('1. Token exists:', !!token);

// Check backend
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(d => {
    console.log('2. Backend status:', d.status);
    
    // Check sessions
    return fetch('http://localhost:8000/upload/sessions', {
      headers: {'Authorization': 'Bearer ' + token}
    });
  })
  .then(r => {
    console.log('3. Sessions API status:', r.status);
    return r.json();
  })
  .then(d => {
    console.log('4. Documents found:', d.sessions?.length || 0);
    console.log('5. Document list:', d.sessions);
  })
  .catch(e => console.error('ERROR:', e));
```

**Copy the console output and share it for help!**

---

## Most Likely Solution

**90% of the time, the issue is:**

### You Haven't Uploaded Any Documents Yet!

**To fix:**
1. Go to http://localhost:3002/dashboard
2. Click the upload area
3. Select a PDF file (any PDF)
4. Wait for processing (10-30 seconds)
5. You'll see the document appear in the list
6. Now go to Flashcards page
7. The dropdown will show your document!

---

**Try this first before anything else!** 🚀
