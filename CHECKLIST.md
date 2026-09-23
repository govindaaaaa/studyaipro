# ✅ Pre-Flight Checklist

Before starting the app, make sure:

## 1. MongoDB Atlas Setup

- [ ] Account created at https://cloud.mongodb.com
- [ ] Free cluster created
- [ ] Database user created (username + password)
- [ ] Network Access: "Allow from Anywhere" (0.0.0.0/0)
- [ ] Connection string copied

## 2. Groq API Key

- [ ] Account created at https://console.groq.com
- [ ] API key generated
- [ ] Key copied (starts with `gsk_`)

## 3. Backend Configuration

File: `backend-node/.env`

- [ ] File exists (copy from `.env.example` if not)
- [ ] `MONGODB_URL` is set (your MongoDB Atlas connection string)
- [ ] `JWT_SECRET` is set (any long random string, 32+ characters)
- [ ] `GROQ_API_KEY` is set (your Groq API key)
- [ ] `RAG_SERVICE_URL=http://localhost:8001` (default is fine)

Example:
```env
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/studyai_pro?retryWrites=true&w=majority
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
RAG_SERVICE_URL=http://localhost:8001
```

## 4. Dependencies Installed

- [ ] Backend: `cd backend-node && npm install`
- [ ] RAG Service: `cd rag-service && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt`
- [ ] Frontend: `cd frontend && npm install`

## 5. Test Connection

```bash
cd backend-node
node test-db.js
```

Should show: ✅ MongoDB connection successful!

---

## 🚀 Start the App

In VS Code, press: **`Cmd+Shift+B`**

Wait for all services to start, then open: **http://localhost:5173**

---

## 🎯 Quick Test

1. Register account
2. Upload a PDF file
3. Chat with it
4. Generate notes

If all works → You're good to go! 🎉
