# 📚 StudyAI Pro - AI-Powered Study Platform

> Transform your documents into interactive study materials with AI! 🚀

## ✨ Features

### Core Features:
- 📄 **Document Upload** - PDF, TXT, MD support
- 💬 **AI Chat** - Chat with your documents
- 📝 **Smart Notes** - Generate notes in multiple formats
- ❓ **MCQ Generator** - Create practice quizzes
- 🧠 **AI Explanations** - ELI5, Student, Expert modes
- 📊 **Flowcharts** - Auto-generate Mermaid diagrams

### Premium Features (12+):
1. 🎴 **Flashcards** - Spaced repetition learning
2. 📊 **Analytics** - Track quiz scores & progress
3. ⭐ **Bookmarks** - Save important content
4. ⏰ **Study Timer** - Pomodoro technique tracker
5. 📋 **Summary Generator** - TL;DR, Key Points, Detailed, ELI5
6. 💾 **Export Tools** - Markdown, Text, CSV, Anki JSON
7. 🔍 **Global Search** - Search across all documents
8. 🧑‍🏫 **AI Tutor** - Interactive teaching modes
9. 🏷️ **Tags & Categories** - Organize documents
10. 👥 **Study Groups** - Share documents with others
11. 📈 **Progress Dashboard** - Visual analytics
12. 🎯 **Smart Navigation** - Quick access to all features

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│                 │      │                  │      │                 │
│  React Frontend │─────▶│  Node.js Backend │─────▶│  MongoDB Atlas  │
│   (Vite)        │      │   (Express)      │      │   (Database)    │
│                 │      │                  │      │                 │
└─────────────────┘      └──────────┬───────┘      └─────────────────┘
                                    │
                                    │
                         ┌──────────▼────────────┐
                         │                       │
                         │  Python RAG Service   │
                         │  (FastAPI + FAISS)    │
                         │                       │
                         └───────────────────────┘
```

### Tech Stack:

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Groq AI API
- Multer (file uploads)

**RAG Service:**
- Python 3.11+
- FastAPI
- FAISS (vector search)
- Sentence Transformers
- PyMongo

## 🚀 Quick Start (Local Development)

### Prerequisites:
- Node.js 18+
- Python 3.11+
- MongoDB Atlas account (or local MongoDB)
- Groq API key ([Get it here](https://console.groq.com))

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/studyai-pro.git
cd studyai-pro
```

### 2. Setup Backend (Node.js)
```bash
cd backend-node
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Start server
npm run dev
```

Backend runs on: http://localhost:8000

### 3. Setup RAG Service (Python)
```bash
cd ../backend
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URL

# Start service
uvicorn main:app --reload --port 8001
```

RAG service runs on: http://localhost:8001

### 4. Setup Frontend (React)
```bash
cd ../frontend
npm install

# Create .env file
cp .env.example .env
# No changes needed for local dev

# Start dev server
npm run dev
```

Frontend runs on: http://localhost:3002

### 5. Open Browser
Navigate to: http://localhost:3002

**Create account → Upload document → Start studying!** 🎉

## 📦 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions.

### Quick Deploy:

**Backend + RAG:** [Render](https://render.com) (Free tier)
**Frontend:** [Vercel](https://vercel.com) (Free tier)
**Database:** MongoDB Atlas (Free tier)

Total cost: **$0/month** 💰

## 🔐 Environment Variables

### Backend (.env)
```env
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
RAG_SERVICE_URL=http://localhost:8001
```

### RAG Service (.env)
```env
MONGODB_URL=your_mongodb_connection_string
FAISS_DIR=/tmp/faiss
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 📚 API Documentation

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user

### Documents
- `POST /upload` - Upload document
- `GET /upload/sessions` - List all documents
- `DELETE /upload/session/:id` - Delete document

### AI Features
- `POST /chat` - Chat with document
- `POST /notes/generate` - Generate notes
- `POST /mcq/generate` - Generate MCQ quiz
- `POST /mcq/grade` - Grade quiz submission
- `POST /explain` - Get AI explanation

### Premium Features
- `POST /flashcards/generate` - Generate flashcards
- `GET /analytics/scores` - Get quiz analytics
- `POST /bookmarks` - Save bookmark
- `POST /study-sessions` - Track study time
- `POST /summary/generate` - Generate summary
- `GET /search` - Global search
- `POST /tutor/start` - Start AI tutor session

Full API docs: [API.md](./API.md)

## 🧪 Testing

### Test Backend:
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

### Test RAG Service:
```bash
curl http://localhost:8001/health
# Should return: {"status":"healthy",...}
```

### Test Full Flow:
1. Register account
2. Login
3. Upload PDF
4. Generate flashcards
5. Take quiz
6. Check analytics

## 📊 Database Schema

### Collections:
- **users** - User accounts
- **sessions** - Uploaded documents
- **chunks** - Document text chunks
- **notes** - Generated notes
- **mcqscores** - Quiz scores
- **chats** - Chat history
- **flashcards** - Flashcard decks
- **bookmarks** - Saved items
- **studysessions** - Study time logs

## 🔧 Configuration

### Groq Models:
Current: `openai/gpt-oss-120b` (120B params, best quality)

Alternatives:
- `qwen/qwen3.8-27b` (fast, supports images)
- `openai/gpt-oss-20b` (lightweight)
- `allam-2-7b` (small, fast)

### Vector Embeddings:
Model: `all-MiniLM-L6-v2` (384 dimensions)
- Fast inference
- Good accuracy
- Small size (~80MB)

### Text Chunking:
- Chunk size: 800 characters
- Overlap: 100 characters
- Ensures context continuity

## 🐛 Troubleshooting

### Backend won't start:
```bash
# Check MongoDB connection
node -e "const mongoose = require('mongoose'); mongoose.connect('YOUR_URL').then(() => console.log('✅ Connected')).catch(e => console.log('❌', e));"

# Check environment variables
cat .env

# Check logs
npm run dev
```

### RAG service fails:
```bash
# Test Python dependencies
pip list | grep -E "fastapi|faiss|sentence-transformers"

# Check FAISS directory
ls -la /tmp/faiss

# Run with verbose logging
uvicorn main:app --reload --log-level debug
```

### Frontend can't reach backend:
- Check CORS settings in backend
- Verify API URL in frontend/.env
- Open browser console (F12) for errors
- Test backend health endpoint

### Documents not showing:
- Check MongoDB has data
- Verify authentication token
- Check browser local storage
- Look at network tab in DevTools

## 📈 Performance

### Metrics (Local):
- Document upload: ~2-5 seconds
- Flashcard generation: ~3-8 seconds
- Chat response: ~1-3 seconds
- Search query: <500ms

### Optimization Tips:
- Use MongoDB indexes (already implemented)
- Cache frequent queries
- Lazy load components
- Compress images
- Use CDN for frontend

## 🛡️ Security

### Implemented:
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ CORS protection
- ✅ Input validation
- ✅ File size limits
- ✅ SQL injection protection (Mongoose)

### Recommendations:
- Use HTTPS in production
- Rotate JWT secrets regularly
- Implement rate limiting
- Add request logging
- Monitor for abuse

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📝 License

MIT License - feel free to use for your projects!

## 🎓 Credits

**Built with:**
- [Groq](https://groq.com) - Lightning-fast AI inference
- [MongoDB Atlas](https://mongodb.com) - Cloud database
- [FAISS](https://github.com/facebookresearch/faiss) - Vector search
- [Sentence Transformers](https://www.sbert.net) - Embeddings

## 📞 Support

**Issues?** Open a GitHub issue
**Questions?** Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
**Updates?** Watch the repository

---

**Made with ❤️ for students everywhere** 🎓

**Star ⭐ this repo if you find it helpful!**
