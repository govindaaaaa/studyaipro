import os
import pickle
import faiss
from sentence_transformers import SentenceTransformer

FAISS_DIR = "/tmp/faiss"
MODEL_NAME = "all-MiniLM-L6-v2"

_model: SentenceTransformer = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    return _model


class VectorStore:
    def _dir(self, session_id: str) -> str:
        path = os.path.join(FAISS_DIR, session_id)
        os.makedirs(path, exist_ok=True)
        return path

    def _paths(self, session_id: str):
        d = self._dir(session_id)
        return os.path.join(d, "index.faiss"), os.path.join(d, "chunks.pkl")

    async def add_chunks(self, session_id: str, chunks: list[str]):
        embeddings = get_model().encode(chunks, convert_to_numpy=True).astype("float32")
        index = faiss.IndexFlatL2(embeddings.shape[1])
        index.add(embeddings)
        idx_path, chunks_path = self._paths(session_id)
        faiss.write_index(index, idx_path)
        with open(chunks_path, "wb") as f:
            pickle.dump(chunks, f)

    async def retrieve(self, session_id: str, query: str, k: int = 5) -> list[str]:
        idx_path, chunks_path = self._paths(session_id)
        if not os.path.exists(idx_path):
            return []
        index = faiss.read_index(idx_path)
        with open(chunks_path, "rb") as f:
            chunks = pickle.load(f)
        q_emb = get_model().encode([query], convert_to_numpy=True).astype("float32")
        k = min(k, len(chunks))
        _, indices = index.search(q_emb, k)
        return [chunks[i] for i in indices[0] if i < len(chunks)]

    async def get_all(self, session_id: str) -> list[str]:
        _, chunks_path = self._paths(session_id)
        if not os.path.exists(chunks_path):
            return []
        with open(chunks_path, "rb") as f:
            return pickle.load(f)
