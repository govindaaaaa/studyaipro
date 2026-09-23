import uuid
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException
import fitz  # PyMuPDF
from database import sessions
from vector_store import VectorStore

router = APIRouter(prefix="/upload", tags=["upload"])
store = VectorStore()

CHUNK_SIZE = 800
CHUNK_OVERLAP = 100


def _chunk_text(text: str) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + CHUNK_SIZE, len(text))
        chunks.append(text[start:end].strip())
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return [c for c in chunks if len(c) > 50]


def _extract_text(data: bytes, filename: str) -> str:
    if filename.lower().endswith(".pdf"):
        doc = fitz.open(stream=data, filetype="pdf")
        return "\n".join(page.get_text() for page in doc)
    return data.decode("utf-8", errors="ignore")


@router.post("/")
async def upload_file(
    file: UploadFile = File(...)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    allowed = {".pdf", ".txt", ".md"}
    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {allowed}")

    data = await file.read()
    if len(data) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 20MB)")

    text = _extract_text(data, file.filename)
    if len(text.strip()) < 100:
        raise HTTPException(status_code=400, detail="Could not extract meaningful text from file")

    chunks = _chunk_text(text)
    session_id = str(uuid.uuid4())

    await store.add_chunks(session_id, chunks)

    doc = {
        "session_id": session_id,
        "user_id": "placeholder_user_id",
        "filename": file.filename,
        "chunk_count": len(chunks),
        "char_count": len(text),
        "created_at": datetime.utcnow(),
    }
    await sessions().insert_one(doc)

    return {
        "session_id": session_id,
        "filename": file.filename,
        "chunks": len(chunks),
        "chars": len(text),
    }


@router.get("/sessions")
async def list_sessions():
    cursor = sessions().find(
        {"user_id": "placeholder_user_id"},
        {"_id": 0, "session_id": 1, "filename": 1, "chunk_count": 1, "created_at": 1},
    ).sort("created_at", -1).limit(20)
    result = []
    async for doc in cursor:
        doc["created_at"] = doc["created_at"].isoformat()
        result.append(doc)
    return result
