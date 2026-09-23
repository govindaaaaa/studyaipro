# 🚀 DEPLOYMENT CHECKLIST

## ✅ Pre-Deployment

### 1. Get Your Credentials Ready
- [ ] MongoDB Atlas connection string
- [ ] Groq API key
- [ ] GitHub account
- [ ] Render account (for backend)
- [ ] Vercel account (for frontend)

### 2. Test Locally First
```bash
# Start all services
cd backend && uvicorn main:app --reload --port 8001 &
cd backend-node && npm run dev &
cd frontend && npm run dev &

# Test in browser: http://localhost:3002
# Upload a document and test all features
```

- [ ] All 3 services start without errors
- [ ] Can register and login
- [ ] Can upload document
- [ ] Documents appear in dashboard
- [ ] Flashcards generate correctly
- [ ] Summary works
- [ ] AI Tutor works
- [ ] No console errors

---

## 📦 Deployment Steps

### STEP 1: Push to GitHub

```bash
cd /Users/govindchoudhary/Desktop/MYPROJOK

# Initialize git (if not done)
git init
git add .
git commit -m "StudyAI Pro - Ready for deployment"

# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/studyai-pro.git
git branch -M main
git push -u origin main
```

- [ ] Code pushed to GitHub
- [ ] Repository is public (or connected to Render/Vercel)
- [ ] .gitignore working (no .env files committed)

---

### STEP 2: Deploy RAG Service (Render)

1. Go to: https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repo
4. Settings:
   - **Name:** `studyai-rag-service`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Free`

5. Environment Variables (click "Add Environment Variable"):
```
MONGODB_URL = [paste your MongoDB Atlas URL]
FAISS_DIR = /tmp/faiss
EMBEDDING_MODEL = all-MiniLM-L6-v2
PORT = 8001
```

6. Click **"Create Web Service"**
7. Wait 5-10 minutes for build
8. Copy your RAG service URL: `https://studyai-rag-service.onrender.com`

- [ ] RAG service deployed
- [ ] Service shows "Live" status
- [ ] Health check works: `curl https://studyai-rag-service.onrender.com/health`
- [ ] URL copied for next step

---

### STEP 3: Deploy Backend (Render)

1. Click **"New +"** → **"Web Service"**
2. Select same GitHub repo
3. Settings:
   - **Name:** `studyai-backend`
   - **Root Directory:** `backend-node`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`

4. Environment Variables:
```
NODE_ENV = production
PORT = 8000
MONGODB_URL = [paste your MongoDB Atlas URL]
JWT_SECRET = [generate random string - see below]
JWT_EXPIRE_MINUTES = 10080
GROQ_API_KEY = [paste your Groq API key]
GROQ_MODEL = openai/gpt-oss-120b
RAG_SERVICE_URL = [paste your RAG service URL from Step 2]
ALLOWED_ORIGINS = https://studyai-pro.vercel.app
```

**Generate JWT Secret:**
```bash
# Run this command to generate a secure secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

5. Click **"Create Web Service"**
6. Wait 5-10 minutes
7. Copy backend URL: `https://studyai-backend.onrender.com`

- [ ] Backend deployed
- [ ] Service shows "Live" status
- [ ] Health check works: `curl https://studyai-backend.onrender.com/health`
- [ ] URL copied for frontend

---

### STEP 4: Deploy Frontend (Vercel)

**Option A: Vercel CLI (Recommended)**
```bash
cd /Users/govindchoudhary/Desktop/MYPROJOK/frontend

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

When prompted:
- Set up and deploy? **Y**
- Which scope? **[Your account]**
- Link to existing project? **N**
- Project name? **studyai-pro** (or any name)
- Directory? **./​** (current directory)
- Override settings? **N**

**Option B: Vercel Dashboard**
1. Go to: https://vercel.com/new
2. Import from GitHub: **studyai-pro**
3. Settings:
   - **Framework:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. Environment Variable:
```
VITE_API_URL = [paste your backend URL from Step 3]
```

5. Click **"Deploy"**
6. Wait 2-3 minutes
7. Get URL: `https://studyai-pro.vercel.app`

- [ ] Frontend deployed
- [ ] Site loads correctly
- [ ] Can see login page
- [ ] URL copied

---

### STEP 5: Update CORS

Go back to **Render** → **studyai-backend** → **Environment**

Update `ALLOWED_ORIGINS` variable:
```
ALLOWED_ORIGINS = https://studyai-pro.vercel.app,https://studyai-pro-*.vercel.app
```

Click **"Save Changes"** (service will auto-redeploy)

- [ ] CORS updated with Vercel URL
- [ ] Service redeployed

---

## ✅ Post-Deployment Testing

### 1. Test Services

```bash
# Test RAG
curl https://studyai-rag-service.onrender.com/health

# Test Backend
curl https://studyai-backend.onrender.com/health

# Expected: Both return {"status":"healthy"}
```

- [ ] RAG health check passes
- [ ] Backend health check passes

### 2. Test Frontend

Open: `https://studyai-pro.vercel.app`

- [ ] Login page loads
- [ ] No console errors (F12)
- [ ] Can register new account
- [ ] Can login
- [ ] Dashboard loads

### 3. Test Full Flow

1. **Upload Document**
   - [ ] Upload works (may take 30-60s first time due to cold start)
   - [ ] Document appears in dashboard
   - [ ] Shows in all dropdowns

2. **Test Features**
   - [ ] Flashcards generate
   - [ ] Summary generates
   - [ ] AI Tutor works
   - [ ] Chat works
   - [ ] MCQ generates

3. **Check Analytics**
   - [ ] Can view analytics page
   - [ ] Study timer works
   - [ ] Search works

### 4. Performance Check

- [ ] First load: <5 seconds
- [ ] Subsequent loads: <2 seconds
- [ ] API calls: <3 seconds (after warm-up)
- [ ] No 500 errors

**Note:** First request after 15 mins will be slow (30-60s) due to free tier sleep. This is normal!

---

## 🎯 Optional: Keep Services Awake

Free tier services sleep after 15 mins. Keep them awake:

### Option 1: Cron Job Service
1. Go to: https://cron-job.org
2. Create free account
3. Add cron job:
   - **URL:** `https://studyai-backend.onrender.com/health`
   - **Interval:** Every 10 minutes
4. Add another for RAG:
   - **URL:** `https://studyai-rag-service.onrender.com/health`
   - **Interval:** Every 10 minutes

- [ ] Cron jobs set up
- [ ] Services stay awake

### Option 2: UptimeRobot
1. Go to: https://uptimerobot.com
2. Add monitor for backend
3. Add monitor for RAG service
4. Set check interval: 5 minutes

---

## 🔐 Security Check

Before going live:

- [ ] No `.env` files in GitHub
- [ ] Strong JWT secret used (64+ chars)
- [ ] Groq API key is valid
- [ ] MongoDB credentials secure
- [ ] CORS only allows your frontend URL
- [ ] No sensitive data in logs

---

## 📊 Monitor Your App

### Render Dashboard:
- Check logs for errors
- Monitor CPU/memory usage
- See request counts
- Check uptime

### Vercel Dashboard:
- View deployment logs
- Check analytics
- Monitor bandwidth
- See visitor stats

- [ ] Set up monitoring
- [ ] Check logs regularly

---

## 🎉 YOU'RE LIVE!

### Share Your App:
```
🚀 StudyAI Pro is now live!

Frontend: https://studyai-pro.vercel.app
Backend: https://studyai-backend.onrender.com

✨ Features:
- Upload PDFs and study smarter
- Generate flashcards with AI
- Create practice quizzes
- Get AI explanations
- Track your progress
- And 12+ premium features!

#AI #StudyApp #EdTech
```

---

## 📝 Save These URLs

**Production URLs:**
```
Frontend: https://studyai-pro.vercel.app
Backend: https://studyai-backend.onrender.com
RAG Service: https://studyai-rag-service.onrender.com
Database: [your MongoDB Atlas cluster]

GitHub: https://github.com/YOUR_USERNAME/studyai-pro
```

**Admin URLs:**
```
Render Dashboard: https://dashboard.render.com
Vercel Dashboard: https://vercel.com/dashboard
MongoDB Atlas: https://cloud.mongodb.com
Groq Console: https://console.groq.com
```

---

## 🆘 Troubleshooting

### Service won't start:
- Check logs in Render dashboard
- Verify all environment variables
- Test with smaller timeout
- Check if build succeeded

### Frontend can't reach backend:
- Verify VITE_API_URL is correct
- Check CORS settings
- Look at browser console
- Test backend URL directly

### Cold start too slow:
- Set up cron job to keep awake
- Or upgrade to paid tier ($7/month)
- Tell users to expect 30s first load

### Features not working:
- Check Groq API quota
- Verify MongoDB connection
- Look at backend logs
- Test RAG service health

---

## 🚀 NEXT STEPS

After successful deployment:

1. **Share with friends!** Get feedback
2. **Add custom domain** (optional)
3. **Set up analytics** (Google Analytics)
4. **Monitor errors** (Sentry)
5. **Plan updates** (new features)
6. **Collect feedback** (surveys)

---

**Congratulations! Your app is live! 🎉**

**Need help?** Check logs, test health endpoints, or review the deployment guide.
