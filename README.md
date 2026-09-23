# StudyAI Pro - MERN Stack

AI-powered study assistant: Upload documents, chat with them, generate notes, take quizzes, and more!

## 🌟 Features

- 📄 **Upload** PDF/TXT documents
- 💬 **Chat** with your documents (RAG-powered)
- 📝 **Generate Notes** (basic/detailed/bullet)
- ❓ **MCQ Quizzes** with auto-scoring
- 🔍 **Explanations** (ELI5/Student/Expert)
- 📊 **Visualizations** (flowcharts, concept graphs)
- 📧 **Export** (PDF, email, WhatsApp)

## 🚀 Quick Start

### 1. Get API Keys

**MongoDB Atlas** (free): https://cloud.mongodb.com  
**Groq API** (free): https://console.groq.com

### 2. Configure

Edit `backend-node/.env`:
```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/studyai_pro?retryWrites=true&w=majority
JWT_SECRET=any_long_random_string_min_32_chars
GROQ_API_KEY=gsk_your_groq_key_here
RAG_SERVICE_URL=http://localhost:8001
```

### 3. Start (VS Code)

Press: **`Cmd+Shift+B`** (or `Ctrl+Shift+B`)

This starts all services automatically!

### 4. Open

Go to: **http://localhost:5173**

---

## 🏗️ Architecture

- **Frontend**: React + Vite + Tailwind
- **Backend**: Node.js + Express + MongoDB
- **RAG Service**: Python + FastAPI + FAISS
- **LLM**: Groq API (Llama 3.3)

---

## 📖 Documentation

- **SETUP.md** - Detailed setup instructions
- **MONGODB_ATLAS_SETUP.md** - MongoDB Atlas guide
- **backend-node/README.md** - Backend API docs
- **rag-service/README.md** - RAG service docs

---

## 🐛 Troubleshooting

**MongoDB error:** Check connection string in `.env`  
**Groq error:** Add API key to `.env`  
**Port in use:** Stop services with `Ctrl+C` first

---

Built with ❤️ using the MERN stack
