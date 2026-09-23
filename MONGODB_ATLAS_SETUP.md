# 🌐 MongoDB Atlas Setup Guide

## Step-by-Step Instructions

### Step 1: Create MongoDB Atlas Account

1. Go to: **https://www.mongodb.com/cloud/atlas/register**
2. Sign up with Google/Email
3. Choose **FREE** tier (M0)
4. Click **Create**

---

### Step 2: Create a Cluster

1. Choose **AWS** as provider (or any)
2. Choose region closest to you
3. Cluster Name: `studyai-cluster` (or any name)
4. Click **Create Deployment**
5. **Save your username and password** (you'll need this!)

Example:
- Username: `studyai_user`
- Password: `YourSecurePassword123`

---

### Step 3: Whitelist Your IP Address

1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (for development)
   - This adds `0.0.0.0/0`
4. Click **Confirm**

**Important:** For production, use specific IPs only!

---

### Step 4: Get Your Connection String

1. Go to **Database** (left sidebar)
2. Click **Connect** button on your cluster
3. Choose **Connect your application**
4. Select:
   - Driver: **Node.js**
   - Version: **5.5 or later**
5. Copy the connection string

It looks like:
```
mongodb+srv://studyai_user:<password>@studyai-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

### Step 5: Update Your Connection String

Replace `<password>` with your actual password:

```
mongodb+srv://studyai_user:YourSecurePassword123@studyai-cluster.xxxxx.mongodb.net/studyai_pro?retryWrites=true&w=majority
```

**Add `/studyai_pro` before the `?`** - this is your database name!

---

## ✅ Your Connection String Format

```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.xxxxx.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
```

Example:
```
mongodb+srv://john:MyPass123@cluster0.ab1cd.mongodb.net/studyai_pro?retryWrites=true&w=majority
```

---

## 🔧 Update Your .env File

Open: `backend-node/.env`

```env
# MongoDB Atlas Connection
MONGODB_URL=mongodb+srv://your_username:your_password@your_cluster.xxxxx.mongodb.net/studyai_pro?retryWrites=true&w=majority

# Rest stays the same
DB_NAME=studyai_pro
JWT_SECRET=your_long_random_secret
GROQ_API_KEY=your_groq_key
RAG_SERVICE_URL=http://localhost:8001
```

---

## 🧪 Test Your Connection

```bash
cd backend-node
node test-db.js
```

You should see:
```
✅ MongoDB connection successful!
Connected to: studyai_pro
Host: cluster0-shard-00-00.xxxxx.mongodb.net
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "IP not whitelisted"
**Fix:** Go to Network Access → Add IP → Allow Access from Anywhere

### Issue 2: "Authentication failed"
**Fix:** 
- Check username/password are correct
- Password should NOT be URL-encoded
- If password has special characters, use: https://www.urlencoder.org/

Example:
- Password: `My@Pass123`
- Encoded: `My%40Pass123`
- Use: `mongodb+srv://user:My%40Pass123@...`

### Issue 3: "Database name not found"
**Fix:** Add `/studyai_pro` before the `?` in connection string

### Issue 4: "Timeout error"
**Fix:**
- Check internet connection
- Verify cluster is active (green in Atlas dashboard)
- Try different region

---

## 🎯 Complete .env Example with Atlas

```env
# Server
PORT=8000
NODE_ENV=development

# MongoDB Atlas (REPLACE WITH YOUR VALUES)
MONGODB_URL=mongodb+srv://studyai_user:SecurePass123@cluster0.ab1cd.mongodb.net/studyai_pro?retryWrites=true&w=majority
DB_NAME=studyai_pro

# JWT Secret (generate with: openssl rand -hex 32)
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# Groq API (get from console.groq.com)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# RAG Service
RAG_SERVICE_URL=http://localhost:8001

# Text Processing
CHUNK_SIZE=800
CHUNK_OVERLAP=100
```

---

## ✅ Verification Checklist

- [ ] MongoDB Atlas account created
- [ ] Cluster is running (green status)
- [ ] Database user created (username + password)
- [ ] Network Access: 0.0.0.0/0 whitelisted
- [ ] Connection string copied
- [ ] Password replaced in connection string
- [ ] `/studyai_pro` added to connection string
- [ ] Connection string pasted in `backend-node/.env`
- [ ] `node test-db.js` shows success

---

## 🎉 You're Done!

Now start your application:

**VS Code:** Press `Cmd+Shift+B`

**Terminal:**
```bash
cd backend-node
npm run dev
```

Your app now uses MongoDB Atlas (cloud) instead of local! 🌐

---

## 📊 View Your Data

Go to: **https://cloud.mongodb.com**
1. Click **Database** → **Browse Collections**
2. Select database: `studyai_pro`
3. See your collections: users, sessions, notes, etc.

---

## 💰 Free Tier Limits

- Storage: 512 MB
- RAM: Shared
- Connections: 500 concurrent
- Perfect for development and small projects!

---

## 🔒 Security Tips

1. **Never commit** `.env` file to git
2. **Use strong passwords** (letters, numbers, symbols)
3. **For production**: Whitelist specific IPs only
4. **Rotate passwords** regularly

---

## 🆘 Need Help?

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Connection String Guide: https://www.mongodb.com/docs/manual/reference/connection-string/
- Atlas Support: https://support.mongodb.com/

---

**Your app is now cloud-ready!** ☁️
