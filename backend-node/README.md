# StudyAI Pro - Node.js Backend

MERN Stack backend for StudyAI Pro - AI-powered study assistant.

## Architecture

- **Node.js + Express**: Main API server
- **MongoDB + Mongoose**: Database and ODM
- **Groq API**: LLM for AI features
- **Python RAG Microservice**: FAISS vector store for document retrieval

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
# Edit .env and add your credentials
```

Required environment variables:
- `MONGODB_URL`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `GROQ_API_KEY`: Groq API key for LLM

### 3. Start RAG Microservice

The Python RAG service must be running first:

```bash
cd ../rag-service
pip install -r requirements.txt
uvicorn main:app --port 8001
```

### 4. Start Node.js Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server runs at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Document Upload
- `POST /upload` - Upload PDF/TXT file
- `GET /upload/sessions` - List user sessions

### Chat
- `POST /chat` - Chat with document

### Notes
- `POST /notes/generate` - Generate notes
- `GET /notes/:session_id` - Get saved notes
- `GET /notes` - List all notes

### MCQ
- `POST /mcq/generate` - Generate quiz
- `POST /mcq/submit` - Submit quiz answers
- `GET /mcq/scores` - Get quiz history

### Explain
- `POST /explain` - Get explanations (ELI5/Student/Expert)

### Process
- `POST /process/flowchart` - Generate Mermaid flowchart
- `POST /process/graph` - Generate concept graph

### Output
- `POST /output/pdf` - Generate PDF
- `POST /output/email` - Send email
- `POST /output/whatsapp` - Send WhatsApp message

## Project Structure

```
backend-node/
├── config/          # Configuration files
├── models/          # Mongoose models
├── routes/          # Express routes
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── server.js        # Entry point
└── .env            # Environment variables
```

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **multer**: File upload handling
- **pdf-parse**: PDF text extraction
- **groq-sdk**: Groq AI API client
- **axios**: HTTP client for RAG service
- **nodemailer**: Email sending
- **twilio**: WhatsApp integration
- **pdfkit**: PDF generation

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```
