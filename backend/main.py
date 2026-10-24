"""
Beaverly - FastAPI Backend Entry Point
Private AI assistant for solo lawyers and small firms.
Core Formula: Learn → Scope → Remember → Apply → Verify
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger

from api.routes import cases, skills, chat, verification, logs, settings, intelligence
from config import settings as app_config
from memory.sqlite_store import init_db
from memory.lancedb_store import init_lancedb


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("Beaverly backend starting up...")
    await init_db()
    try:
        init_lancedb()
    except Exception as e:
        logger.warning(f"LanceDB init note: {e}")
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
app.include_router(intelligence.router, prefix="/api/intelligence", tags=["Matter Intelligence"])


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Beaverly API",
        "mascot": "Barry the Beaver",
        "version": "1.0.0",
        "nebius_configured": bool(app_config.nebius_api_key),
        "nebius_api_v1": app_config.nebius_base_url.rstrip("/").endswith("/v1"),
        "models": {
            "nano": app_config.model_nano,
            "super": app_config.model_super,
        }
    }
