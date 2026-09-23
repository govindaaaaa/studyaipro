# RAG Microservice

Python FastAPI microservice for FAISS-based vector storage and semantic search.

## Features

- **Vector Storage**: Store document chunks with FAISS indexing
- **Semantic Search**: Retrieve relevant chunks using sentence transformers
- **Session Management**: Isolate document chunks by session
- **REST API**: Simple HTTP interface for integration

## Tech Stack

- **FastAPI**: Modern Python web framework
- **FAISS**: Facebook AI Similarity Search
- **Sentence Transformers**: Text embeddings (all-MiniLM-L6-v2)

## Setup

### 1. Install Dependencies

```bash
cd rag-service
pip install -r requirements.txt
```

Or use a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configuration

```bash
cp .env.example .env
# Edit .env if needed (optional, defaults work fine)
```

### 3. Run the Service

```bash
uvicorn main:app --port 8001 --reload
```

The service will be available at `http://localhost:8001`

## API Endpoints

### Health Check
```bash
GET /health
```

### Add Chunks
```bash
POST /add-chunks
Content-Type: application/json

{
  "session_id": "unique-session-id",
  "chunks": ["text chunk 1", "text chunk 2", ...]
}
```

### Retrieve Chunks
```bash
POST /retrieve
Content-Type: application/json

{
  "session_id": "unique-session-id",
  "query": "your search query",
  "k": 5
}
```

### Get All Chunks
```bash
GET /chunks/{session_id}
```

### Delete Session
```bash
DELETE /chunks/{session_id}
```

### List Sessions
```bash
GET /sessions
```

## Architecture

1. **Text Embedding**: Uses `sentence-transformers/all-MiniLM-L6-v2` model
2. **Vector Index**: FAISS IndexFlatL2 for similarity search
3. **Storage**: Files stored in `/tmp/faiss/{session_id}/`
   - `index.faiss`: FAISS vector index
   - `chunks.pkl`: Pickled text chunks

## Performance

- **Model Size**: ~90MB (downloaded on first run)
- **Embedding Speed**: ~500 chunks/second
- **Search Speed**: Sub-millisecond for thousands of vectors

## Integration

This service is designed to work with the Node.js backend:

```javascript
// In Node.js backend
import axios from 'axios';

const ragClient = axios.create({
  baseURL: 'http://localhost:8001'
});

// Add chunks
await ragClient.post('/add-chunks', {
  session_id: sessionId,
  chunks: textChunks
});

// Retrieve
const response = await ragClient.post('/retrieve', {
  session_id: sessionId,
  query: userQuery,
  k: 5
});
```

## Development

```bash
# Run with auto-reload
uvicorn main:app --port 8001 --reload

# Run with custom host
uvicorn main:app --host 0.0.0.0 --port 8001

# View API docs
open http://localhost:8001/docs
```

## Production Deployment

For production, consider:

1. **Persistent Storage**: Change `FAISS_DIR` to a persistent volume
2. **Model Caching**: Pre-download the sentence transformer model
3. **Scaling**: Run multiple instances behind a load balancer
4. **Monitoring**: Add health checks and metrics

Example with Gunicorn:

```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

## Troubleshooting

### Model Download Issues
If the model fails to download, manually download it:

```bash
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
```

### Memory Issues
For large documents, consider:
- Reducing chunk size
- Using FAISS IVF index instead of Flat
- Increasing system memory

### Port Conflicts
If port 8001 is in use:

```bash
PORT=8002 uvicorn main:app --port 8002
```

## License

Part of StudyAI Pro - MERN Stack
