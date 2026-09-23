# 🚀 COMPLETE DEPLOYMENT GUIDE - StudyAI Pro

## 📋 Overview

Your app has **3 services**:
1. **Backend (Node.js)** - Main API server
2. **RAG Service (Python)** - Vector search & embeddings
3. **Frontend (React)** - User interface

**Best Deployment Strategy:**
- **Backend + RAG:** Render (free tier, supports both Node & Python)
- **Frontend:** Vercel (free, best for React/Vite)
- **Database:** MongoDB Atlas (already cloud-hosted ✅)

---

## 🎯 OPTION 1: RENDER (Recommended for Backend + RAG)

### Why Render?
- ✅ Free tier for both services
- ✅ Easy deployment from GitHub
- ✅ Auto-deploy on git push
- ✅ Environment variables support
- ✅ Custom domains

---

## 📦 STEP 1: PREPARE YOUR CODE

### 1.1 Create Production Environment Files

#### Backend (.env.production)
```bash
cd /Users/govindchoudhary/Desktop/MYPROJOK/backend-node
cat > .env.production << 'EOF'
# Server
NODE_ENV=production
PORT=8000

# MongoDB Atlas (your existing connection)
MONGODB_URL=mongodb+srv://legacyearnisunique_db_user:0BZ51A8I6ysRViWz@cluster09.3cifymg.mongodb.net/studyai_pro?retryWrites=true&w=majority&appName=Cluster09

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRE_MINUTES=10080

# Groq API
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

# RAG Service URL (will be render URL after deploying RAG)
RAG_SERVICE_URL=https://your-rag-service.onrender.com

# CORS Origins (will be vercel URL after deploying frontend)
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://studyai-pro.vercel.app
EOF
```

#### RAG Service (.env.production)
```bash
cd /Users/govindchoudhary/Desktop/MYPROJOK/backend
cat > .env.production << 'EOF'
# Server
PORT=8001

# MongoDB Atlas
MONGODB_URL=mongodb+srv://legacyearnisunique_db_user:0BZ51A8I6ysRViWz@cluster09.3cifymg.mongodb.net/studyai_pro?retryWrites=true&w=majority&appName=Cluster09

# Vector Store
FAISS_DIR=/tmp/faiss
EMBEDDING_MODEL=all-MiniLM-L6-v2
EOF
```

### 1.2 Add Deployment Scripts

#### Backend package.json - Add these scripts:
```bash
cd /Users/govindchoudhary/Desktop/MYPROJOK/backend-node
```

Add to `package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step needed for Node.js'",
    "render-build": "npm install"
  }
}
```

#### RAG Service - Create start script:
```bash
cd /Users/govindchoudhary/Desktop/MYPROJOK/backend
cat > start.sh << 'EOF'
#!/bin/bash
# Install dependencies
pip install -r requirements.txt

# Start uvicorn
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8001}
EOF

chmod +x start.sh
```

---

## 🚀 STEP 2: DEPLOY RAG SERVICE TO RENDER

### 2.1 Push Code to GitHub

```bash
cd /Users/govindchoudhary/Desktop/MYPROJOK

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - StudyAI Pro"

# Create GitHub repo and push
# Go to github.com and create a new repo "studyai-pro"
git remote add origin https://github.com/YOUR_USERNAME/studyai-pro.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy on Render

1. Go to **https://render.com** and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo: **studyai-pro**
4. Configure RAG Service:

**Settings:**
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

**Environment Variables:** (Add in Render dashboard)
```
MONGODB_URL = mongodb+srv://legacyearnisunique_db_user:0BZ51A8I6ysRViWz@cluster09.3cifymg.mongodb.net/studyai_pro?retryWrites=true&w=majority&appName=Cluster09
FAISS_DIR = /tmp/faiss
EMBEDDING_MODEL = all-MiniLM-L6-v2
PORT = 8001
```

5. Click **"Create Web Service"**
6. Wait 5-10 minutes for deployment
7. Copy the service URL: `https://studyai-rag-service.onrender.com`

---

## 🚀 STEP 3: DEPLOY BACKEND TO RENDER

1. Click **"New +"** → **"Web Service"** again
2. Select same repo: **studyai-pro**
3. Configure Backend:

**Settings:**
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

**Environment Variables:**
```
NODE_ENV = production
PORT = 8000
MONGODB_URL = mongodb+srv://legacyearnisunique_db_user:0BZ51A8I6ysRViWz@cluster09.3cifymg.mongodb.net/studyai_pro?retryWrites=true&w=majority&appName=Cluster09
JWT_SECRET = your-super-secret-jwt-key-CHANGE-THIS-12345
JWT_EXPIRE_MINUTES = 10080
GROQ_API_KEY = [YOUR_GROQ_API_KEY]
GROQ_MODEL = openai/gpt-oss-120b
RAG_SERVICE_URL = https://studyai-rag-service.onrender.com
ALLOWED_ORIGINS = https://your-frontend.vercel.app
```

4. Click **"Create Web Service"**
5. Wait 5-10 minutes
6. Copy backend URL: `https://studyai-backend.onrender.com`

---

## 🚀 STEP 4: DEPLOY FRONTEND TO VERCEL

### 4.1 Update Frontend API URL

```bash
cd /Users/govindchoudhary/Desktop/MYPROJOK/frontend
```

Create `.env.production`:
```env
VITE_API_URL=https://studyai-backend.onrender.com
```

Update `src/api.js` to use environment variable:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

### 4.2 Deploy to Vercel

**Option A: Vercel CLI**
```bash
cd /Users/govindchoudhary/Desktop/MYPROJOK/frontend

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to **https://vercel.com** and sign up/login
2. Click **"Add New Project"**
3. Import from GitHub: **studyai-pro**
4. Configure:
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

5. Add Environment Variable:
```
VITE_API_URL = https://studyai-backend.onrender.com
```

6. Click **"Deploy"**
7. Wait 2-3 minutes
8. Get URL: `https://studyai-pro.vercel.app`

### 4.3 Update CORS in Backend

Go back to Render → **studyai-backend** → **Environment**

Update `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS = https://studyai-pro.vercel.app,https://studyai-pro-*.vercel.app
```

---

## ✅ STEP 5: VERIFY DEPLOYMENT

### Test RAG Service:
```bash
curl https://studyai-rag-service.onrender.com/health
```
Should return: `{"status":"healthy",...}`

### Test Backend:
```bash
curl https://studyai-backend.onrender.com/health
```
Should return: `{"status":"healthy"}`

### Test Frontend:
Open: `https://studyai-pro.vercel.app`
- Should load login page
- Login with your credentials
- Upload a document
- Test all features!

---

## 🎯 OPTION 2: ALL ON RENDER (Alternative)

If you want everything on Render:

### Frontend as Static Site:
1. Build frontend locally:
```bash
cd frontend
npm run build
```

2. Deploy `dist/` folder:
- Render → **New Static Site**
- Connect repo
- Build: `npm run build`
- Publish: `dist`

**Note:** Vercel is better for React/Vite frontends (better performance, CDN, etc.)

---

## 🎯 OPTION 3: RAILWAY (Alternative to Render)

Railway is similar to Render but with better free tier:

1. Go to **https://railway.app**
2. Create project from GitHub
3. Add 3 services:
   - Backend (Node.js)
   - RAG Service (Python)
   - Frontend (Static)

4. Set environment variables per service
5. Railway auto-assigns URLs

---

## 📝 IMPORTANT NOTES

### Free Tier Limitations:

**Render Free Tier:**
- ✅ 750 hours/month
- ⚠️ Services sleep after 15 mins inactivity
- ⚠️ Cold start: 30-60 seconds
- ✅ Auto-wake on request

**Vercel Free Tier:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ No cold starts (CDN)
- ✅ Automatic HTTPS

**MongoDB Atlas Free Tier:**
- ✅ 512MB storage
- ✅ Shared cluster
- ✅ Good for ~1000 users

### Performance Tips:

1. **Keep Services Awake:**
   - Use cron-job.org to ping every 10 mins
   - Ping URL: `https://studyai-backend.onrender.com/health`

2. **Optimize Images:**
   - Frontend: Use lazy loading
   - Compress assets before deploying

3. **Database Indexing:**
   - Already done in your models ✅

4. **Caching:**
   - Frontend builds are cached by Vercel
   - Backend responses can be cached (optional)

---

## 🔐 SECURITY CHECKLIST

Before deploying:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Never commit `.env` files to git
- [ ] Add `.env` to `.gitignore`
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS only (done automatically on Render/Vercel)
- [ ] Set proper CORS origins
- [ ] Limit file upload size (already set to 20MB)
- [ ] Rate limiting (optional, add middleware)

---

## 📂 FOLDER STRUCTURE FOR DEPLOYMENT

```
studyai-pro/
├── backend/                  # RAG Service (Python)
│   ├── main.py
│   ├── requirements.txt
│   ├── start.sh
│   └── .env.production
│
├── backend-node/            # Main Backend (Node.js)
│   ├── server.js
│   ├── package.json
│   ├── models/
│   ├── routers/
│   └── .env.production
│
├── frontend/                # Frontend (React)
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.production
│
├── .gitignore
└── README.md
```

### Update .gitignore:
```bash
cd /Users/govindchoudhary/Desktop/MYPROJOK

cat > .gitignore << 'EOF'
# Environment variables
.env
.env.local
.env.production
.env.development

# Node modules
node_modules/
backend-node/node_modules/
frontend/node_modules/

# Build outputs
frontend/dist/
frontend/build/

# Python
backend/__pycache__/
backend/*.pyc
backend/venv/

# Logs
*.log
logs/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# FAISS index (will be regenerated)
/tmp/faiss/

# Temp files
*.tmp
*.swp
EOF
```

---

## 🚀 QUICK DEPLOYMENT COMMANDS

### Full Deployment from Scratch:

```bash
# 1. Prepare repo
cd /Users/govindchoudhary/Desktop/MYPROJOK
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Deploy RAG to Render
# (Do this in Render dashboard - see Step 2)

# 3. Deploy Backend to Render  
# (Do this in Render dashboard - see Step 3)

# 4. Deploy Frontend to Vercel
cd frontend
vercel --prod

# Done! 🎉
```

---

## 🆘 TROUBLESHOOTING

### Backend won't start on Render:
- Check logs in Render dashboard
- Verify environment variables are set
- Check `package.json` has `"start"` script
- Ensure MongoDB URL is correct

### RAG Service fails:
- Check Python version (3.11+)
- Verify `requirements.txt` is correct
- Check FAISS directory permissions
- Look at Render logs for errors

### Frontend can't reach Backend:
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Look at browser console for errors
- Test backend URL directly: `curl https://your-backend.onrender.com/health`

### Cold Start Issues:
- First request after 15 mins will be slow (30-60s)
- Use cron job to keep services awake
- Or upgrade to paid tier ($7/month per service)

---

## 💰 COST SUMMARY

### Free Tier (Current):
- **Render:** $0 (2 services)
- **Vercel:** $0 (frontend)
- **MongoDB Atlas:** $0 (512MB)
- **Total:** $0/month ✅

### Paid Tier (When you scale):
- **Render:** $7/month per service ($14 for 2)
- **Vercel Pro:** $20/month (optional)
- **MongoDB Atlas M10:** $10/month
- **Total:** $24-54/month

---

## 🎉 DEPLOYMENT COMPLETE!

After following these steps, your app will be live at:

- **Frontend:** `https://studyai-pro.vercel.app`
- **Backend:** `https://studyai-backend.onrender.com`
- **RAG Service:** `https://studyai-rag-service.onrender.com`

**Share your app with anyone in the world!** 🌍

---

## 📚 NEXT STEPS

After deployment:

1. **Custom Domain** (optional):
   - Buy domain on Namecheap/GoDaddy
   - Point to Vercel (frontend)
   - Add CNAME records

2. **Analytics** (optional):
   - Add Google Analytics
   - Track user behavior
   - Monitor performance

3. **Monitoring** (optional):
   - Use Render metrics
   - Set up error alerts
   - Monitor uptime

4. **Improvements:**
   - Add user feedback form
   - Implement user analytics
   - Add more AI features
   - Optimize performance

---

## ✅ CHECKLIST

Before deploying:
- [ ] Git repo created and pushed
- [ ] `.gitignore` updated
- [ ] Environment variables prepared
- [ ] Groq API key ready
- [ ] MongoDB Atlas accessible

Deployment:
- [ ] RAG service deployed to Render
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] CORS configured
- [ ] Environment variables set

Testing:
- [ ] Health endpoints working
- [ ] Login/Register works
- [ ] Document upload works
- [ ] All features generate content
- [ ] No console errors

---

**Ready to deploy? Start with Step 1!** 🚀
