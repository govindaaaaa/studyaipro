# 🚀 YOUR SPECIFIC DEPLOYMENT STEPS

**GitHub Username:** govindaaaaa
**Repository:** https://github.com/govindaaaaa/studyai-pro

---

## ✅ STEP 1: CREATE GITHUB REPO (DO THIS NOW)

1. Go to: https://github.com/new
2. Fill in:
   - **Repository name:** `studyai-pro`
   - **Description:** `AI-Powered Study Platform with 18+ Features - MERN Stack`
   - **Visibility:** Public ✅
   - **DO NOT** check "Add a README file"
   - **DO NOT** add .gitignore or license
3. Click **"Create repository"**

---

## ✅ STEP 2: PUSH CODE (I'LL DO THIS)

Once you create the repo, I'll run:
```bash
cd /Users/govindchoudhary/Desktop/MYPROJOK
git remote add origin https://github.com/govindaaaaa/studyai-pro.git
git push -u origin main
```

---

## ✅ STEP 3: DEPLOY RAG SERVICE (RENDER)

### 3.1 Go to Render
- URL: https://dashboard.render.com
- Sign up/Login (use GitHub for easy connection)

### 3.2 Create New Web Service
- Click **"New +"** → **"Web Service"**
- Connect your GitHub account
- Select repository: **govindaaaaa/studyai-pro**

### 3.3 Configure RAG Service
```
Name: studyai-rag-service
Region: Oregon (US West) or closest to you
Branch: main
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
Instance Type: Free
```

### 3.4 Add Environment Variables
Click **"Add Environment Variable"** for each:

```
MONGODB_URL = mongodb+srv://legacyearnisunique_db_user:0BZ51A8I6ysRViWz@cluster09.3cifymg.mongodb.net/studyai_pro?retryWrites=true&w=majority&appName=Cluster09

FAISS_DIR = /tmp/faiss

EMBEDDING_MODEL = all-MiniLM-L6-v2

PORT = 8001
```

### 3.5 Deploy
- Click **"Create Web Service"**
- Wait 5-10 minutes for deployment
- **SAVE THE URL:** `https://studyai-rag-service.onrender.com`

---

## ✅ STEP 4: DEPLOY BACKEND (RENDER)

### 4.1 Create Another Web Service
- Click **"New +"** → **"Web Service"**
- Select repository: **govindaaaaa/studyai-pro**

### 4.2 Configure Backend
```
Name: studyai-backend
Region: Oregon (US West)
Branch: main
Root Directory: backend-node
Runtime: Node
Build Command: npm install
Start Command: node server.js
Instance Type: Free
```

### 4.3 Generate JWT Secret
Run this in terminal to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4.4 Add Environment Variables
Use the output from above command for JWT_SECRET:

```
NODE_ENV = production

PORT = 8000

MONGODB_URL = mongodb+srv://legacyearnisunique_db_user:0BZ51A8I6ysRViWz@cluster09.3cifymg.mongodb.net/studyai_pro?retryWrites=true&w=majority&appName=Cluster09

JWT_SECRET = [paste the generated secret from above command]

JWT_EXPIRE_MINUTES = 10080

GROQ_API_KEY = [your Groq API key - get from https://console.groq.com]

GROQ_MODEL = openai/gpt-oss-120b

RAG_SERVICE_URL = [paste your RAG service URL from Step 3]

ALLOWED_ORIGINS = https://studyai-pro.vercel.app
```

### 4.5 Deploy
- Click **"Create Web Service"**
- Wait 5-10 minutes
- **SAVE THE URL:** `https://studyai-backend.onrender.com`

---

## ✅ STEP 5: DEPLOY FRONTEND (VERCEL)

### 5.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 5.2 Login to Vercel
```bash
vercel login
```
(Follow the prompts - it will open browser)

### 5.3 Deploy
```bash
cd /Users/govindchoudhary/Desktop/MYPROJOK/frontend
vercel --prod
```

When prompted:
- **Set up and deploy?** Y
- **Which scope?** [Your account]
- **Link to existing project?** N
- **Project name?** studyai-pro
- **Directory?** ./
- **Override settings?** N

### 5.4 Add Environment Variable
After deployment, go to Vercel dashboard:
- Project: studyai-pro
- Settings → Environment Variables
- Add:
```
VITE_API_URL = [paste your backend URL from Step 4]
```
- Click "Save"
- Go to Deployments tab
- Click "⋯" on latest deployment
- Click "Redeploy"

**SAVE THE URL:** `https://studyai-pro.vercel.app`

---

## ✅ STEP 6: UPDATE CORS

Go back to Render → studyai-backend → Environment

Update the `ALLOWED_ORIGINS` variable:
```
ALLOWED_ORIGINS = https://studyai-pro.vercel.app,https://studyai-pro-*.vercel.app
```

Click "Save Changes" (backend will auto-redeploy)

---

## ✅ STEP 7: TEST YOUR DEPLOYMENT

### Test Services
```bash
# Test RAG
curl https://studyai-rag-service.onrender.com/health

# Test Backend
curl https://studyai-backend.onrender.com/health

# Both should return: {"status":"healthy"}
```

### Test Frontend
1. Open: `https://studyai-pro.vercel.app`
2. Register a new account
3. Login
4. Upload a document (first request may take 30-60s - cold start)
5. Try generating flashcards
6. Try summary feature
7. Test AI tutor

---

## 📋 CHECKLIST

- [ ] Step 1: Created GitHub repo
- [ ] Step 2: Pushed code to GitHub
- [ ] Step 3: Deployed RAG service to Render
- [ ] Step 4: Deployed Backend to Render
- [ ] Step 5: Deployed Frontend to Vercel
- [ ] Step 6: Updated CORS settings
- [ ] Step 7: Tested all features

---

## 🎉 YOUR LIVE URLS

After deployment, save these:

```
Frontend: https://studyai-pro.vercel.app
Backend: https://studyai-backend.onrender.com
RAG Service: https://studyai-rag-service.onrender.com
GitHub: https://github.com/govindaaaaa/studyai-pro
```

---

## 🆘 NEED HELP?

### If RAG service fails:
- Check Render logs
- Verify Python version is 3.11+
- Check environment variables are set correctly

### If Backend fails:
- Check if JWT_SECRET is set
- Verify MongoDB URL is correct
- Check Groq API key
- Look at Render logs

### If Frontend can't connect:
- Verify VITE_API_URL in Vercel environment variables
- Check CORS settings in backend
- Look at browser console (F12)

---

## 💡 IMPORTANT NOTES

### Free Tier Limitations:
- Services sleep after 15 mins of inactivity
- First request after sleep: 30-60 seconds (cold start)
- This is normal on free tier!

### Keep Services Awake (Optional):
1. Go to: https://cron-job.org
2. Create account
3. Add cron job:
   - URL: `https://studyai-backend.onrender.com/health`
   - Interval: Every 10 minutes

---

## 🎯 READY TO START!

**First, go create your GitHub repo:**
👉 https://github.com/new

**Then tell me when it's created, and I'll push the code!** 🚀
