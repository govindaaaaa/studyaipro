from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import chat_history
from vector_store import VectorStore
from llm_engine import chat_with_context
from routers.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])
store = VectorStore()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    session_id: str
    messages: list[ChatMessage]


@router.post("/")
async def chat(body: ChatRequest, current_user: dict = Depends(get_current_user)):
    if not body.messages:
        raise HTTPException(status_code=400, detail="No messages provided")

    last_user_msg = next(
        (m.content for m in reversed(body.messages) if m.role == "user"), None
    )
    if not last_user_msg:
        raise HTTPException(status_code=400, detail="No user message found")

    chunks = await store.retrieve(body.session_id, last_user_msg, k=5)
    if not chunks:
        chunks = await store.get_all(body.session_id)

    msgs = [{"role": m.role, "content": m.content} for m in body.messages]
    reply = await chat_with_context(msgs, chunks)

    await chat_history().insert_one({
        "session_id": body.session_id,
        "user_id": current_user["_id"],
        "user_message": last_user_msg,
        "assistant_reply": reply,
        "timestamp": datetime.utcnow(),
    })

    return {"reply": reply}


@router.get("/history/{session_id}")
async def get_history(session_id: str, current_user: dict = Depends(get_current_user)):
    cursor = chat_history().find(
        {"session_id": session_id, "user_id": current_user["_id"]},
        {"_id": 0, "user_message": 1, "assistant_reply": 1, "timestamp": 1},
    ).sort("timestamp", 1).limit(100)
    result = []
    async for doc in cursor:
        doc["timestamp"] = doc["timestamp"].isoformat()
        result.append(doc)
    return result
