# 🚀 DEPLOY NOW - Follow These Steps

**Repository:** https://github.com/govindaaaaa/studyaipro ✅

---

## STEP 1: DEPLOY RAG SERVICE (Python)

### 1. Go to Render Dashboard
👉 **https://dashboard.render.com**

- Click **"Sign Up"** or **"Log In"**
- **TIP:** Sign up with GitHub for easy connection!

### 2. Create Web Service
- Click **"New +"** button (top right)
- Select **"Web Service"**

### 3. Connect GitHub
- Click **"Connect account"** if needed
- Search for: **studyaipro**
- Click **"Connect"** on your repository

### 4. Configure RAG Service
Fill in these EXACT values:

```
Name: studyai-rag-service
Region: Oregon (US West)  [or closest to you]
Branch: main
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
Instance Type: Free
```

### 5. Add Environment Variables
Scroll down to **"Environment Variables"**

Click **"Add Environment Variable"** 4 times and add these:

**Variable 1:**
```
Key: MONGODB_URL
Value: mongodb+srv://legacyearnisunique_db_user:0BZ51A8I6ysRViWz@cluster09.3cifymg.mongodb.net/studyai_pro?retryWrites=true&w=majority&appName=Cluster09
```

**Variable 2:**
```
Key: FAISS_DIR
Value: /tmp/faiss
```

**Variable 3:**
```
Key: EMBEDDING_MODEL
Value: all-MiniLM-L6-v2
```

**Variable 4:**
```
Key: PORT
Value: 8001
```

### 6. Deploy!
- Click **"Create Web Service"** button
- Wait 5-10 minutes (it will build and deploy)
- You'll see logs scrolling

### 7. Save Your URL
Once it says **"Live"**, copy the URL at the top:
```
https://studyai-rag-service.onrender.com
```

**SAVE THIS URL!** You need it for the next step.

---

## STEP 2: GENERATE JWT SECRET

Before deploying backend, generate a secure JWT secret.

### Open Terminal and run:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**COPY THE OUTPUT** - you'll need it in the next step!

Example output:
```
a8f5f167f44f4964e6c998dee827110c03b6d8e7b6e8f0e6c4a6b6a6c4a6b6a6c4a6b6a6c4a6b6a6c4a6b6a6c4a6b6a6
```

---

## STEP 3: DEPLOY BACKEND (Node.js)

### 1. Back to Render Dashboard
👉 **https://dashboard.render.com**

### 2. Create Another Web Service
- Click **"New +"** again
- Select **"Web Service"**
- Select repository: **studyaipro**

### 3. Configure Backend
Fill in these EXACT values:

```
Name: studyai-backend
Region: Oregon (US West)  [same as RAG service]
Branch: main
Root Directory: backend-node
Runtime: Node
Build Command: npm install
Start Command: node server.js
Instance Type: Free
```

### 4. Add Environment Variables
Click **"Add Environment Variable"** 8 times:

**Variable 1:**
```
Key: NODE_ENV
Value: production
```

**Variable 2:**
```
Key: PORT
Value: 8000
```

**Variable 3:**
```
Key: MONGODB_URL
Value: mongodb+srv://legacyearnisunique_db_user:0BZ51A8I6ysRViWz@cluster09.3cifymg.mongodb.net/studyai_pro?retryWrites=true&w=majority&appName=Cluster09
```

**Variable 4:**
```
Key: JWT_SECRET
Value: [PASTE THE SECRET YOU GENERATED IN STEP 2]
```

**Variable 5:**
```
Key: JWT_EXPIRE_MINUTES
Value: 10080
```

**Variable 6:**
```
Key: GROQ_API_KEY
Value: [YOUR GROQ API KEY - get from https://console.groq.com/keys]
```

**Variable 7:**
```
Key: GROQ_MODEL
Value: openai/gpt-oss-120b
```

**Variable 8:**
```
Key: RAG_SERVICE_URL
Value: [PASTE YOUR RAG SERVICE URL FROM STEP 1]
```

Example for Variable 8:
```
https://studyai-rag-service.onrender.com
```

**Variable 9:**
```
Key: ALLOWED_ORIGINS
Value: https://studyai-pro.vercel.app
```

### 5. Deploy!
- Click **"Create Web Service"**
- Wait 5-10 minutes
- Once it says **"Live"**, copy the URL

**SAVE THIS URL:**
```
https://studyai-backend.onrender.com
```

---

## STEP 4: DEPLOY FRONTEND (Vercel)

### 1. Install Vercel CLI
Open terminal and run:
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```
- Enter your email
- Check your email for verification link
- Click the link to verify

### 3. Navigate to Frontend
```bash
cd /Users/govindchoudhary/Desktop/MYPROJOK/frontend
```

### 4. Deploy!
```bash
vercel --prod
```

**Answer the prompts:**
```
? Set up and deploy? [Y/n] → Y
? Which scope? → [Select your account]
? Link to existing project? [y/N] → N
? What's your project's name? → studyai-pro
? In which directory is your code located? → ./
? Want to override the settings? [y/N] → N
```

### 5. Wait for Deployment
- It will build and deploy (2-3 minutes)
- You'll see: **"Production: https://studyai-pro.vercel.app"**

**SAVE THIS URL!**

### 6. Add Environment Variable
After first deployment, we need to add the backend URL:

Go to: **https://vercel.com/dashboard**
- Click on **"studyai-pro"** project
- Click **"Settings"** tab
- Click **"Environment Variables"**
- Add new variable:
  ```
  Key: VITE_API_URL
  Value: [YOUR BACKEND URL FROM STEP 3]
  ```
  Example: `https://studyai-backend.onrender.com`

- Click **"Save"**
- Go to **"Deployments"** tab
- Click **"⋯"** (three dots) on latest deployment
- Click **"Redeploy"**
- Wait 1-2 minutes

---

## STEP 5: UPDATE CORS

Go back to Render dashboard:
1. Click on **"studyai-backend"** service
2. Click **"Environment"** tab on left
3. Find **"ALLOWED_ORIGINS"** variable
4. Click **"Edit"**
5. Change value to:
   ```
   https://studyai-pro.vercel.app,https://studyai-pro-*.vercel.app
   ```
6. Click **"Save Changes"**
7. Service will auto-redeploy (wait 1-2 minutes)

---

## STEP 6: TEST YOUR APP! 🎉

### 1. Test Services
Open terminal and run:

```bash
# Test RAG service
curl https://studyai-rag-service.onrender.com/health

# Test Backend  
curl https://studyai-backend.onrender.com/health
```

Both should return: `{"status":"healthy"}`

**NOTE:** First request may take 30-60 seconds (cold start) - this is normal!

### 2. Open Your App
Go to: **https://studyai-pro.vercel.app**

### 3. Test Features
1. **Register** a new account
2. **Login**
3. **Upload** a PDF document (first upload may be slow - cold start)
4. Go to **Dashboard** - see your document
5. Go to **Flashcards** - generate flashcards
6. Try **Summary** feature
7. Try **AI Tutor**
8. Check **Analytics**

---

## 🎉 YOU'RE LIVE!

**Your URLs:**
```
Frontend: https://studyai-pro.vercel.app
Backend: https://studyai-backend.onrender.com
RAG Service: https://studyai-rag-service.onrender.com
GitHub: https://github.com/govindaaaaa/studyaipro
```

---

## 🆘 TROUBLESHOOTING

### RAG Service won't deploy:
- Check Render logs (click "Logs" tab)
- Verify environment variables are set
- Check Python version is 3.11+

### Backend won't deploy:
- Check if JWT_SECRET is set
- Verify GROQ_API_KEY is valid
- Check MongoDB URL
- Look at logs

### Frontend can't connect:
- Verify VITE_API_URL in Vercel settings
- Check CORS in backend environment variables
- Open browser console (F12) for errors

### First request is slow:
- **This is normal!** Free tier services sleep after 15 mins
- First request wakes them up (30-60 seconds)
- Subsequent requests are fast

---

## 💡 KEEP SERVICES AWAKE (Optional)

To avoid cold starts:

1. Go to: **https://cron-job.org**
2. Create free account
3. Add new cron job:
   - URL: `https://studyai-backend.onrender.com/health`
   - Interval: Every 10 minutes
4. Add another cron job:
   - URL: `https://studyai-rag-service.onrender.com/health`
   - Interval: Every 10 minutes

Now your services stay awake 24/7! ✨

---

## 📊 YOUR CHECKLIST

- [ ] Step 1: RAG Service deployed to Render
- [ ] Step 2: JWT Secret generated
- [ ] Step 3: Backend deployed to Render
- [ ] Step 4: Frontend deployed to Vercel
- [ ] Step 5: CORS updated
- [ ] Step 6: App tested and working

---

**START WITH STEP 1 NOW!** 🚀

**Need help?** Check the logs in Render/Vercel dashboards!
