from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from llm_engine import generate_explanation, generate_flowchart
from graph_builder import build_concept_graph
from routers.auth import get_current_user

router = APIRouter(prefix="/explain", tags=["explain"])


class ExplainRequest(BaseModel):
    text: str
    mode: str = "Student"  # ELI5 | Student | Expert


class FlowchartRequest(BaseModel):
    text: str


class ConceptGraphRequest(BaseModel):
    text: str


@router.post("/")
async def explain(body: ExplainRequest, current_user: dict = Depends(get_current_user)):
    if len(body.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Text too short")
    if len(body.text) > 5000:
        raise HTTPException(status_code=400, detail="Text too long (max 5000 chars)")

    result = await generate_explanation(body.text, mode=body.mode)
    return {"explanation": result, "mode": body.mode}


@router.post("/flowchart")
async def flowchart(body: FlowchartRequest, current_user: dict = Depends(get_current_user)):
    if len(body.text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Text too short")

    mermaid = await generate_flowchart(body.text)
    return {"mermaid": mermaid}


@router.post("/concept-graph")
async def concept_graph(body: ConceptGraphRequest, current_user: dict = Depends(get_current_user)):
    if len(body.text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Text too short")

    mermaid = await build_concept_graph(body.text)
    return {"mermaid": mermaid}
