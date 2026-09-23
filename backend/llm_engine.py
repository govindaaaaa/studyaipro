import json
import re
from groq import AsyncGroq
from config import settings

_client = None


def get_client() -> AsyncGroq:
    global _client
    if _client is None:
        _client = AsyncGroq(api_key=settings.groq_api_key)
    return _client


MODEL = "llama-3.3-70b-versatile"


def _context(chunks: list[str]) -> str:
    return "\n\n---\n\n".join(chunks[:10])


async def _chat(messages: list[dict], max_tokens: int = 4096) -> str:
    response = await get_client().chat.completions.create(
        model=MODEL,
        max_tokens=max_tokens,
        messages=messages,
    )
    return response.choices[0].message.content


async def generate_notes(chunks: list[str], mode: str = "detailed") -> str:
    instructions = {
        "basic": "Write concise bullet-point notes covering only the key facts.",
        "detailed": "Write comprehensive structured notes with headings, subheadings, and clear explanations.",
        "bullet": "Write very short bullet points only. No prose. Maximum clarity.",
    }
    return await _chat([{
        "role": "user",
        "content": (
            f"{instructions.get(mode, instructions['detailed'])}\n\n"
            f"Content:\n{_context(chunks)}\n\n"
            "Return only the notes in Markdown format."
        ),
    }])


async def generate_mcq(chunks: list[str], difficulty: str = "medium", n: int = 10) -> list[dict]:
    difficulty_desc = {
        "easy": "straightforward factual recall",
        "medium": "understanding and application",
        "hard": "analysis, inference, and critical thinking",
    }
    raw = await _chat([{
        "role": "user",
        "content": (
            f"Generate exactly {n} multiple-choice questions requiring {difficulty_desc.get(difficulty, 'medium')} "
            f"based on this content.\n\nContent:\n{_context(chunks)}\n\n"
            "Return ONLY a valid JSON array, no markdown fences, no explanation:\n"
            '[{"id":"q1","question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"answer":"A","explanation":"..."}]'
        ),
    }])
    raw = raw.strip()
    raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.MULTILINE).strip()
    return json.loads(raw)


async def generate_explanation(text: str, mode: str = "Student") -> str:
    prompts = {
        "ELI5": "Explain this like I am 5 years old. Use simple words, fun analogies, very short sentences.",
        "Student": "Explain this clearly for a university student. Use proper terminology with definitions.",
        "Expert": "Explain this at an expert/researcher level. Be precise, technical, and comprehensive.",
    }
    return await _chat([{
        "role": "user",
        "content": f"{prompts.get(mode, prompts['Student'])}\n\nTopic/Text:\n{text}",
    }], max_tokens=2048)


async def generate_flowchart(text: str) -> str:
    raw = await _chat([{
        "role": "user",
        "content": (
            "Extract the main process or sequence from this text and produce a Mermaid flowchart.\n"
            "Return ONLY valid Mermaid code starting with 'flowchart TD'. No markdown fences.\n\n"
            f"Text:\n{text}"
        ),
    }], max_tokens=2048)
    return re.sub(r"^```mermaid|^```|```$", "", raw.strip(), flags=re.MULTILINE).strip()


async def chat_with_context(messages: list[dict], context_chunks: list[str]) -> str:
    system = (
        "You are a helpful study assistant. Answer questions using the provided document context. "
        "If the answer is not in the context, say so honestly.\n\n"
        f"Document context:\n{_context(context_chunks)}"
    )
    return await _chat([{"role": "system", "content": system}] + messages, max_tokens=2048)
