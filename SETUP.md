# StudyAI Pro - Quick Setup Guide

## 🚀 Setup (5 Minutes)

### 1. Get API Keys

**MongoDB Atlas:**
1. Go to: https://cloud.mongodb.com/
2. Create free account → Create cluster
3. Network Access → Add IP → "Allow from Anywhere"
4. Connect → Get connection string
5. Format: `mongodb+srv://username:password@cluster.mongodb.net/studyai_pro?retryWrites=true&w=majority`

**Groq API:**
1. Go to: https://console.groq.com
2. Sign up → API Keys → Create new key
3. Copy the key (starts with `gsk_`)

### 2. Configure Backend

Edit `backend-node/.env`:

```env
MONGODB_URL=mongodb+srv://your_username:your_password@cluster.mongodb.net/studyai_pro?retryWrites=true&w=majority
JWT_SECRET=any_random_long_string_at_least_32_characters
GROQ_API_KEY=gsk_your_groq_key_here
RAG_SERVICE_URL=http://localhost:8001
```

### 3. Start in VS Code

Press: **`Cmd+Shift+B`** (Mac) or **`Ctrl+Shift+B`** (Windows)

This starts all 3 services automatically!

Wait for:
- ✅ Backend (port 8000)
- ✅ RAG Service (port 8001)  
- ✅ Frontend (port 5173)

### 4. Open App

Go to: **http://localhost:5173**

---

## 🎮 Daily Use

**Start:** `Cmd+Shift+B`  
**Stop:** `Ctrl+C` in each terminal

---

## 🐛 Troubleshooting

**"MongoDB connection failed"**
- Check your connection string in `backend-node/.env`
- Verify IP is whitelisted in MongoDB Atlas

**"GROQ_API_KEY not set"**
- Add your Groq API key to `backend-node/.env`

**Check status:**
- Press `Cmd+Shift+P` → "Tasks: Run Task" → "Check Services Status"

---

## 📚 Features

- Upload PDF/TXT documents
- Chat with your documents (RAG-powered)
- Generate notes (basic/detailed/bullet)
- Take MCQ quizzes
- Get explanations (ELI5/Student/Expert)
- Generate flowcharts and concept graphs
- Export as PDF, email, or WhatsApp

---

That's it! Press `Cmd+Shift+B` and start using StudyAI Pro! 🎉
