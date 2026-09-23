# 🔧 Groq Model Fix

## Problem
The model `llama-3.3-70b-versatile` is not available or you don't have access to it.

## Quick Fix

### Option 1: Update .env (Recommended)

Edit `backend-node/.env` and add/update this line:

```env
GROQ_MODEL=llama-3.1-70b-versatile
```

Then restart the backend (save any file or press `Ctrl+C` and restart).

### Option 2: Check Available Models

Run this to see which models work with your API key:

```bash
cd backend-node
node check-groq-models.js
```

It will test all models and show which ones work.

### Option 3: Let Auto-Fallback Handle It

The backend now automatically tries alternative models if the default fails. Just restart and it should work!

---

## Available Groq Models

Common working models:
- `llama-3.1-70b-versatile` ← **Recommended** (Best quality)
- `llama-3.1-8b-instant` (Fastest)
- `llama3-70b-8192` (Good balance)
- `mixtral-8x7b-32768` (Long context)
- `gemma-7b-it` (Lightweight)

---

## After Fixing

Restart backend and try:
1. Chat with a document
2. Generate notes
3. Create MCQ quiz

Everything should work now! ✅
