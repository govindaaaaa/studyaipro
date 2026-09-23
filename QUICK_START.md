# 🚀 StudyAI Pro - Quick Start

## ⚡ Start Everything (VS Code)

Press: **`Cmd+Shift+B`** (or `Ctrl+Shift+B`)

That's it! Wait for all 3 services to start, then open: **http://localhost:5173**

---

## 🛑 Common Issues & Fixes

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::8000`

**Fix:**
```bash
./kill-ports.sh
```

Then restart with `Cmd+Shift+B`

---

### Groq Model Error

**Error:** `model does not exist or has been decommissioned`

**Fix:** Add this to `backend-node/.env`:
```env
GROQ_MODEL=llama-3.3-70b-versatile
```

Or run: `node backend-node/check-groq-models.js` to see available models.

---

### MongoDB Connection Failed

**Error:** `Could not connect to MongoDB`

**Fix:** Check `backend-node/.env`:
```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/studyai_pro?retryWrites=true&w=majority
```

Make sure:
- ✅ Username/password are correct
- ✅ IP is whitelisted in MongoDB Atlas (0.0.0.0/0)

---

### RAG Service Not Running

**Fix:** Start it manually:
```bash
cd rag-service
source venv/bin/activate
uvicorn main:app --port 8001 --reload
```

---

## 🎯 Quick Commands

```bash
# Kill all ports if stuck
./kill-ports.sh

# Test Groq models
cd backend-node && node check-groq-models.js

# Test MongoDB connection
cd backend-node && node test-db.js

# Check service status
./status.sh

# View logs
tail -f logs/*.log
```

---

## ✅ Required .env Settings

**File:** `backend-node/.env`

```env
# MongoDB Atlas connection string
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/studyai_pro?retryWrites=true&w=majority

# Random 32+ character string
JWT_SECRET=your_long_random_secret_key

# From console.groq.com
GROQ_API_KEY=gsk_your_key_here

# Use current model (NOT 3.1)
GROQ_MODEL=llama-3.3-70b-versatile

# Don't change this
RAG_SERVICE_URL=http://localhost:8001
```

---

## 📋 Startup Checklist

Before starting:
- [ ] MongoDB Atlas connection string in `.env`
- [ ] Groq API key in `.env`
- [ ] JWT secret in `.env`
- [ ] `GROQ_MODEL=llama-3.3-70b-versatile` in `.env`
- [ ] All ports free (run `./kill-ports.sh` if needed)

---

## 🎉 You're Ready!

1. Make sure `.env` is configured
2. Run `./kill-ports.sh` (if needed)
3. Press `Cmd+Shift+B` in VS Code
4. Open http://localhost:5173
5. Register and start using!

---

## 🆘 Still Not Working?

1. **Check logs** in VS Code terminal panels
2. **Run:** `./status.sh` to see what's running
3. **Read:** `GROQ_FIX_NOW.md` for model issues
4. **Read:** `CHECKLIST.md` for setup verification

---

**Pro Tip:** Bookmark this file for quick reference! 📌
