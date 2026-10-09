"""
Beaverly - FastAPI Backend Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger

from api.routes import cases, skills, chat, verification, logs, settings
from memory.sqlite_store import init_db
from memory.lancedb_store import init_lancedb


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("Beaverly backend starting up...")
    await init_db()
    init_lancedb()
    logger.info("Databases initialized. Ready.")
    yield
    logger.info("Beaverly backend shutting down.")


app = FastAPI(
    title="Beaverly API",
    description="Local private AI assistant for lawyers. Learn → Scope → Remember → Apply → Verify",
    version="1.0.0",
    lifespan=lifespan,
)

# --- CORS: allow frontend dev server ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Register routes ---
app.include_router(cases.router,        prefix="/api/cases",        tags=["Cases"])
app.include_router(skills.router,       prefix="/api/skills",       tags=["Skills"])
app.include_router(chat.router,         prefix="/api/chat",         tags=["Chat"])
app.include_router(verification.router, prefix="/api/verification", tags=["Verification"])
app.include_router(logs.router,         prefix="/api/logs",         tags=["Protection Logs"])
app.include_router(settings.router,     prefix="/api/settings",     tags=["Settings"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "Beaverly API", "version": "1.0.0"}

