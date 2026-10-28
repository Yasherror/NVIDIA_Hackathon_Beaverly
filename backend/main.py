"""
Beaverly - FastAPI Backend Entry Point
Private AI assistant for solo lawyers and small firms.
Core Formula: Learn → Scope → Remember → Apply → Verify
"""
import os
import sys
import warnings

warnings.filterwarnings("ignore", category=UserWarning)

# Ensure backend directory is always on sys.path regardless of execution root (e.g. Docker, root launch)
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

from fastapi import Request

@app.middleware("http")
async def extract_client_api_key(request: Request, call_next):
    header_key = request.headers.get("x-nebius-api-key")
    if header_key and header_key.startswith("v1."):
        from api.routes.settings import clean_nebius_key
        cleaned = clean_nebius_key(header_key)
        if cleaned and not cleaned.startswith("sk_live_"):
            app_config.nebius_api_key = cleaned
    response = await call_next(request)
    return response

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
    """Healthcheck endpoint for Docker container orchestrators."""
    return {
        "status": "ok",
        "service": "Beaverly Legal AI Platform",
        "version": "1.0.0",
        "nebius_connected": bool(app_config.nebius_api_key),
        "models": {
            "nano": app_config.model_nano,
            "super": app_config.model_super,
        }
    }


# --- Unified Single-Port SPA Serving (Production) ---
dist_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dist")
if os.path.exists(dist_dir) and os.path.isdir(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path == "api" or full_path in ("docs", "redoc", "openapi.json"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not Found")

        target = os.path.join(dist_dir, full_path)
        if full_path and os.path.isfile(target):
            return FileResponse(target)

        index_file = os.path.join(dist_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Frontend index.html not found")
