from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import mcq_scores
from vector_store import VectorStore
from llm_engine import generate_mcq

router = APIRouter(prefix="/mcq", tags=["mcq"])
store = VectorStore()


class MCQRequest(BaseModel):
    session_id: str
    difficulty: str = "medium"  # easy | medium | hard
    n: int = 10


class SubmitRequest(BaseModel):
    session_id: str
    questions: list[dict]
    answers: dict[str, str]  # {question_id: chosen_option}


@router.post("/generate")
async def create_mcq(body: MCQRequest):
    if not 1 <= body.n <= 20:
        raise HTTPException(status_code=400, detail="n must be between 1 and 20")

    chunks = await store.get_all(body.session_id)
    if not chunks:
        raise HTTPException(status_code=404, detail="No content found for this session")

    questions = await generate_mcq(chunks, difficulty=body.difficulty, n=body.n)
    return {"questions": questions, "difficulty": body.difficulty}


@router.post("/submit")
async def submit_mcq(body: SubmitRequest):
    correct = 0
    results = []
    for q in body.questions:
        qid = q.get("id", "")
        chosen = body.answers.get(qid, "")
        is_correct = chosen.upper().startswith(q.get("answer", "").upper())
        if is_correct:
            correct += 1
        results.append({
            "id": qid,
            "question": q.get("question"),
            "chosen": chosen,
            "correct_answer": q.get("answer"),
            "is_correct": is_correct,
            "explanation": q.get("explanation", ""),
        })

    score_pct = round((correct / len(body.questions)) * 100, 1) if body.questions else 0

    await mcq_scores().insert_one({
        "session_id": body.session_id,
        "user_id": "placeholder_user_id",
        "score": correct,
        "total": len(body.questions),
        "score_pct": score_pct,
        "results": results,
        "created_at": datetime.utcnow(),
    })

    return {
        "score": correct,
        "total": len(body.questions),
        "score_pct": score_pct,
        "results": results,
    }


@router.get("/history/{session_id}")
async def mcq_history(session_id: str):
    cursor = mcq_scores().find(
        {"session_id": session_id, "user_id": "placeholder_user_id"},
        {"_id": 0, "score": 1, "total": 1, "score_pct": 1, "created_at": 1},
    ).sort("created_at", -1).limit(10)
    result = []
    async for doc in cursor:
        doc["created_at"] = doc["created_at"].isoformat()
        result.append(doc)
    return result
