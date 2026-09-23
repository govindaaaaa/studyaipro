from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from vector_store import VectorStore
from llm_engine import generate_notes, generate_mcq
from routers.auth import get_current_user

router = APIRouter(prefix="/process", tags=["process"])
store = VectorStore()


class ProcessRequest(BaseModel):
    session_id: str
    generate_notes: bool = True
    notes_mode: str = "detailed"
    generate_mcq: bool = True
    mcq_difficulty: str = "medium"
    mcq_count: int = 10


@router.post("/")
async def process_session(body: ProcessRequest, current_user: dict = Depends(get_current_user)):
    chunks = await store.get_all(body.session_id)
    if not chunks:
        raise HTTPException(status_code=404, detail="No content found for this session")

    result = {"session_id": body.session_id, "notes": None, "mcq": None}

    if body.generate_notes:
        notes_content = await generate_notes(chunks, mode=body.notes_mode)
        result["notes"] = {"content": notes_content, "mode": body.notes_mode}

    if body.generate_mcq:
        questions = await generate_mcq(chunks, difficulty=body.mcq_difficulty, n=body.mcq_count)
        result["mcq"] = {"questions": questions, "difficulty": body.mcq_difficulty}

    return result
