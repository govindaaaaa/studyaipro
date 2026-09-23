from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_db, close_db
from routers import auth, upload, chat, notes, mcq, explain, process, output


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="StudyAI Pro API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(chat.router)
app.include_router(notes.router)
app.include_router(mcq.router)
app.include_router(explain.router)
app.include_router(process.router)
app.include_router(output.router)


@app.get("/")
async def root():
    return {"status": "ok", "app": "StudyAI Pro API v1.0"}


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "RAG Service",
        "version": "1.0.0",
        "model": "all-MiniLM-L6-v2"
    }
