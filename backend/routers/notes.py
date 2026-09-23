from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from pydantic import BaseModel
from fpdf import FPDF
from database import notes
from vector_store import VectorStore
from llm_engine import generate_notes
from routers.auth import get_current_user

router = APIRouter(prefix="/notes", tags=["notes"])
store = VectorStore()


class NotesRequest(BaseModel):
    session_id: str
    mode: str = "detailed"  # basic | detailed | bullet


@router.post("/generate")
async def create_notes(body: NotesRequest, current_user: dict = Depends(get_current_user)):
    chunks = await store.get_all(body.session_id)
    if not chunks:
        raise HTTPException(status_code=404, detail="No content found for this session")

    content = await generate_notes(chunks, mode=body.mode)

    doc = {
        "session_id": body.session_id,
        "user_id": current_user["_id"],
        "mode": body.mode,
        "content": content,
        "created_at": datetime.utcnow(),
    }
    result = await notes().insert_one(doc)

    return {"note_id": str(result.inserted_id), "content": content, "mode": body.mode}


@router.get("/session/{session_id}")
async def get_notes(session_id: str, current_user: dict = Depends(get_current_user)):
    cursor = notes().find(
        {"session_id": session_id, "user_id": current_user["_id"]},
        {"_id": 1, "mode": 1, "content": 1, "created_at": 1},
    ).sort("created_at", -1)
    result = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc["created_at"] = doc["created_at"].isoformat()
        result.append(doc)
    return result


@router.get("/export/{session_id}/pdf")
async def export_notes_pdf(session_id: str, current_user: dict = Depends(get_current_user)):
    note = await notes().find_one(
        {"session_id": session_id, "user_id": current_user["_id"]},
        sort=[("created_at", -1)],
    )
    if not note:
        raise HTTPException(status_code=404, detail="Notes not found")

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "StudyAI Pro — Notes", ln=True)
    pdf.set_font("Helvetica", size=11)
    pdf.ln(4)
    for line in note["content"].splitlines():
        pdf.multi_cell(0, 7, line)
    pdf.ln(2)

    pdf_bytes = bytes(pdf.output())
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=notes_{session_id[:8]}.pdf"},
    )
