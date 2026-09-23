# ⚡ QUICK DEPLOY - 5 MINUTES

## 🎯 Before You Start

**You Need:**
1. ✅ GitHub account
2. ✅ Render account (https://render.com)
3. ✅ Vercel account (https://vercel.com)
4. ✅ Groq API key (https://console.groq.com)
5. ✅ MongoDB Atlas URL (you already have this)

---

## 🚀 Deploy in 5 Steps

### STEP 1: Push to GitHub (2 mins)

```bash
cd /Users/govindchoudhary/Desktop/MYPROJOK

git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/studyai-pro.git
git push -u origin main
```

---

### STEP 2: Deploy RAG Service (Render) (2 mins)

1. **Go to:** https://render.com/dashboard
2. **Click:** New + → Web Service
3. **Connect:** Your GitHub repo
4. **Settings:**
   - Root: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables:**
   ```
   MONGODB_URL = [your MongoDB URL]
   FAISS_DIR = /tmp/faiss
   ```
6. **Deploy!** Copy URL when done.

---

### STEP 3: Deploy Backend (Render) (2 mins)

1. **Click:** New + → Web Service (again)
2. **Connect:** Same repo
3. **Settings:**
   - Root: `backend-node`
   - Build: `npm install`
   - Start: `node server.js`
4. **Environment Variables:**
   ```
   MONGODB_URL = [your MongoDB URL]
   JWT_SECRET = [run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"]
   GROQ_API_KEY = [your Groq key]
   RAG_SERVICE_URL = [URL from Step 2]
   ALLOWED_ORIGINS = https://studyai-pro.vercel.app
   ```
5. **Deploy!** Copy URL when done.

---

### STEP 4: Deploy Frontend (Vercel) (1 min)

```bash
cd /Users/govindchoudhary/Desktop/MYPROJOK/frontend

npm install -g vercel
vercel login
vercel --prod
```

When asked for environment variable:
```
VITE_API_URL = [URL from Step 3]
```

**Done!** Copy Vercel URL.

---

### STEP 5: Update CORS (30 seconds)

Go to Render → Your Backend → Environment

Change `ALLOWED_ORIGINS` to:
```
ALLOWED_ORIGINS = [your Vercel URL from Step 4]
```

Save and redeploy.

---

## ✅ Test Your Deployment

```bash
# Test services
curl https://your-rag-service.onrender.com/health
curl https://your-backend.onrender.com/health

# Open browser
open https://your-frontend.vercel.app
```

**Register → Upload → Generate Flashcards!** 🎉

---

## 📋 Your URLs

Save these:
```
Frontend: https://______________.vercel.app
Backend:  https://______________.onrender.com
RAG:      https://______________.onrender.com
```

---

## 🆘 Quick Fixes

**Backend won't start?**
- Check environment variables in Render
- Look at logs in dashboard

**Frontend can't reach backend?**
- Update CORS in backend settings
- Check VITE_API_URL in Vercel

**Cold start slow?**
- Normal on free tier (first request after 15 mins)
- Set up cron-job.org to ping every 10 mins

---

## 💰 Cost

**Everything is FREE!** ✨
- Render Free: 750 hours/month
- Vercel Free: Unlimited
- MongoDB Atlas Free: 512MB

---

## 🎉 DONE!

**Your app is live!**

Share it, test it, enjoy it! 🚀

For detailed guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
For full checklist: [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)
