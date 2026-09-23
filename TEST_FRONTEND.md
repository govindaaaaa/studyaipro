# Frontend White Screen Debugging

## Issue
White screen when accessing http://localhost:3002

## What to Check

### 1. Open Browser Console
Press **F12** or **Right Click → Inspect → Console**

Look for errors like:
- Import errors
- Component rendering errors  
- API connection errors
- Router errors

### 2. Check Network Tab
In DevTools → Network tab, look for failed requests (red)

### 3. Common Fixes

**If you see "api is not defined" or "api.getSessions is not a function":**
The issue is in `frontend/src/pages/DashboardPage.jsx` line 8

Change:
```javascript
import { api } from "../api";
```

To:
```javascript
import { api } from "../api.js";
```

**If you see routing errors:**
Clear browser cache: Ctrl+Shift+Delete → Clear cache

**If you see blank page with no errors:**
1. Open http://localhost:3002
2. Open Console (F12)
3. Type: `window.location.reload(true)`
4. Check for any error messages

### 4. Manual Test

Try accessing login directly:
- http://localhost:3002/login

If login page shows, the app is working!

### 5. Check What's Actually Happening

Run this in browser console:
```javascript
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(console.log)
```

This tests backend connectivity.

## Most Likely Issue

The api import in DashboardPage needs `.js` extension:

```javascript
// Line 3 in frontend/src/pages/DashboardPage.jsx
import { api } from "../api.js";  // Add .js
```

## Quick Fix Command

Run this to fix the import:
```bash
cd /Users/govindchoudhary/Desktop/MYPROJOK/frontend/src/pages
sed -i '' 's/from "..\/api"/from "..\/api.js"/g' DashboardPage.jsx
```

Then refresh the browser!
