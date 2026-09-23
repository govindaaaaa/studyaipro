from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import os
import pickle
import faiss
from sentence_transformers import SentenceTransformer
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
FAISS_DIR = os.getenv("FAISS_DIR", "/tmp/faiss")
MODEL_NAME = os.getenv("MODEL_NAME", "all-MiniLM-L6-v2")

# Global model instance
_model: Optional[SentenceTransformer] = None


def get_model() -> SentenceTransformer:
    """Get or initialize the sentence transformer model"""
    global _model
    if _model is None:
        logger.info(f"Loading model: {MODEL_NAME}")
        _model = SentenceTransformer(MODEL_NAME)
        logger.info("Model loaded successfully")
    return _model


# Pydantic models
class AddChunksRequest(BaseModel):
    session_id: str = Field(..., description="Unique session identifier")
    chunks: List[str] = Field(..., description="List of text chunks to index")


class RetrieveRequest(BaseModel):
    session_id: str = Field(..., description="Session identifier")
    query: str = Field(..., description="Search query")
    k: int = Field(5, description="Number of chunks to retrieve", ge=1, le=20)


class ChunksResponse(BaseModel):
    chunks: List[str]
    count: int


class HealthResponse(BaseModel):
    status: str
    model: str
    faiss_dir: str


class MessageResponse(BaseModel):
    message: str
    session_id: str


# FastAPI app
app = FastAPI(
    title="RAG Microservice",
    description="FAISS-based vector store for document retrieval",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Utility functions
def get_session_dir(session_id: str) -> str:
    """Get directory path for a session"""
    path = os.path.join(FAISS_DIR, session_id)
    os.makedirs(path, exist_ok=True)
    return path


def get_session_paths(session_id: str) -> tuple:
    """Get file paths for FAISS index and chunks"""
    session_dir = get_session_dir(session_id)
    index_path = os.path.join(session_dir, "index.faiss")
    chunks_path = os.path.join(session_dir, "chunks.pkl")
    return index_path, chunks_path


def session_exists(session_id: str) -> bool:
    """Check if a session exists"""
    index_path, chunks_path = get_session_paths(session_id)
    return os.path.exists(index_path) and os.path.exists(chunks_path)


# API Routes
@app.get("/", response_model=dict)
async def root():
    """Root endpoint"""
    return {
        "service": "RAG Microservice",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        model = get_model()
        return HealthResponse(
            status="healthy",
            model=MODEL_NAME,
            faiss_dir=FAISS_DIR
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unhealthy")


@app.post("/add-chunks", response_model=MessageResponse)
async def add_chunks(request: AddChunksRequest):
    """
    Add text chunks to FAISS index for a session
    
    This endpoint creates a new FAISS index for the given session and stores
    the text chunks along with their embeddings.
    """
    try:
        if not request.chunks or len(request.chunks) == 0:
            raise HTTPException(status_code=400, detail="No chunks provided")
        
        logger.info(f"Adding {len(request.chunks)} chunks for session: {request.session_id}")
        
        # Get model
        model = get_model()
        
        # Generate embeddings
        embeddings = model.encode(
            request.chunks,
            convert_to_numpy=True,
            show_progress_bar=False
        ).astype('float32')
        
        # Create FAISS index
        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings)
        
        # Get paths
        index_path, chunks_path = get_session_paths(request.session_id)
        
        # Save index
        faiss.write_index(index, index_path)
        
        # Save chunks
        with open(chunks_path, 'wb') as f:
            pickle.dump(request.chunks, f)
        
        logger.info(f"Successfully stored {len(request.chunks)} chunks for session: {request.session_id}")
        
        return MessageResponse(
            message=f"Successfully added {len(request.chunks)} chunks",
            session_id=request.session_id
        )
    
    except Exception as e:
        logger.error(f"Error adding chunks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add chunks: {str(e)}")


@app.post("/retrieve", response_model=ChunksResponse)
async def retrieve_chunks(request: RetrieveRequest):
    """
    Retrieve relevant chunks for a query using semantic search
    
    This endpoint performs similarity search in the FAISS index and returns
    the k most relevant text chunks.
    """
    try:
        if not request.query or not request.query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        # Check if session exists
        if not session_exists(request.session_id):
            logger.warning(f"Session not found: {request.session_id}")
            return ChunksResponse(chunks=[], count=0)
        
        logger.info(f"Retrieving chunks for session: {request.session_id}, query: {request.query[:50]}...")
        
        # Get paths
        index_path, chunks_path = get_session_paths(request.session_id)
        
        # Load index
        index = faiss.read_index(index_path)
        
        # Load chunks
        with open(chunks_path, 'rb') as f:
            chunks = pickle.load(f)
        
        # Get model
        model = get_model()
        
        # Generate query embedding
        query_embedding = model.encode(
            [request.query],
            convert_to_numpy=True,
            show_progress_bar=False
        ).astype('float32')
        
        # Search
        k = min(request.k, len(chunks))
        distances, indices = index.search(query_embedding, k)
        
        # Get relevant chunks
        relevant_chunks = [chunks[i] for i in indices[0] if i < len(chunks)]
        
        logger.info(f"Retrieved {len(relevant_chunks)} chunks for session: {request.session_id}")
        
        return ChunksResponse(
            chunks=relevant_chunks,
            count=len(relevant_chunks)
        )
    
    except Exception as e:
        logger.error(f"Error retrieving chunks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve chunks: {str(e)}")


@app.get("/chunks/{session_id}", response_model=ChunksResponse)
async def get_all_chunks(session_id: str):
    """
    Get all chunks for a session
    
    This endpoint returns all stored chunks for a given session without
    performing any similarity search.
    """
    try:
        # Check if session exists
        if not session_exists(session_id):
            logger.warning(f"Session not found: {session_id}")
            return ChunksResponse(chunks=[], count=0)
        
        logger.info(f"Getting all chunks for session: {session_id}")
        
        # Get paths
        _, chunks_path = get_session_paths(session_id)
        
        # Load chunks
        with open(chunks_path, 'rb') as f:
            chunks = pickle.load(f)
        
        return ChunksResponse(
            chunks=chunks,
            count=len(chunks)
        )
    
    except Exception as e:
        logger.error(f"Error getting chunks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get chunks: {str(e)}")


@app.delete("/chunks/{session_id}", response_model=MessageResponse)
async def delete_session(session_id: str):
    """
    Delete all data for a session
    
    This endpoint removes the FAISS index and chunks for a given session.
    """
    try:
        if not session_exists(session_id):
            raise HTTPException(status_code=404, detail="Session not found")
        
        logger.info(f"Deleting session: {session_id}")
        
        # Get paths
        index_path, chunks_path = get_session_paths(session_id)
        
        # Delete files
        if os.path.exists(index_path):
            os.remove(index_path)
        if os.path.exists(chunks_path):
            os.remove(chunks_path)
        
        # Remove directory if empty
        session_dir = get_session_dir(session_id)
        if os.path.exists(session_dir) and not os.listdir(session_dir):
            os.rmdir(session_dir)
        
        logger.info(f"Successfully deleted session: {session_id}")
        
        return MessageResponse(
            message="Session deleted successfully",
            session_id=session_id
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {str(e)}")


@app.get("/sessions", response_model=dict)
async def list_sessions():
    """
    List all active sessions
    
    Returns a list of session IDs that have data stored.
    """
    try:
        if not os.path.exists(FAISS_DIR):
            return {"sessions": [], "count": 0}
        
        sessions = [
            d for d in os.listdir(FAISS_DIR)
            if os.path.isdir(os.path.join(FAISS_DIR, d))
        ]
        
        return {
            "sessions": sessions,
            "count": len(sessions)
        }
    
    except Exception as e:
        logger.error(f"Error listing sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list sessions: {str(e)}")


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize the service on startup"""
    logger.info("Starting RAG Microservice...")
    logger.info(f"FAISS directory: {FAISS_DIR}")
    logger.info(f"Model: {MODEL_NAME}")
    
    # Ensure FAISS directory exists
    os.makedirs(FAISS_DIR, exist_ok=True)
    
    # Preload model
    get_model()
    
    logger.info("RAG Microservice started successfully")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down RAG Microservice...")


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
