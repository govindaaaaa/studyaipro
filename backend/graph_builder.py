import json
import re
from llm_engine import get_client


async def extract_concepts(text: str) -> list[dict]:
    msg = await get_client().messages.create(
        model="claude-opus-4-5",
        max_tokens=2048,
        messages=[{
            "role": "user",
            "content": (
                "Extract key concepts and relationships from this text.\n"
                "Return ONLY a JSON array, no markdown:\n"
                '[{"concept":"A","related_to":"B","relationship":"causes"}]\n\n'
                f"Text:\n{text[:3000]}"
            ),
        }],
    )
    raw = msg.content[0].text.strip()
    raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.MULTILINE).strip()
    return json.loads(raw)


def build_mermaid(concepts: list[dict]) -> str:
    lines = ["flowchart TD"]
    seen = set()
    for c in concepts:
        src = c.get("concept", "").replace(" ", "_").replace("-", "_")
        tgt = c.get("related_to", "").replace(" ", "_").replace("-", "_")
        rel = c.get("relationship", "relates to")
        if src and tgt:
            edge = f'    {src}["{c["concept"]}"] -->|"{rel}"| {tgt}["{c["related_to"]}"]'
            if edge not in seen:
                lines.append(edge)
                seen.add(edge)
    return "\n".join(lines)


async def build_concept_graph(text: str) -> str:
    concepts = await extract_concepts(text)
    return build_mermaid(concepts)
