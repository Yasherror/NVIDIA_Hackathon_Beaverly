"""API routes: App settings"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import aiosqlite
import re
from config import settings as app_settings
from models.nebius_client import get_nebius_client
from loguru import logger

router = APIRouter()

def clean_nebius_key(raw: str) -> str:
    """Extract pure Nebius API token from raw user input or .env string."""
    if not raw:
        return ""
    m = re.search(r'(v1\.[A-Za-z0-9_\-\.]+)', raw)
    if m:
        return m.group(1).rstrip('.')
    cleaned = raw.strip().strip('"').strip("'")
    if cleaned.startswith("NEBIUS_API_KEY="):
        cleaned = cleaned.split("=", 1)[1].strip().strip('"').strip("'")
    return cleaned.split()[0] if cleaned else ""

class SettingUpdate(BaseModel):
    key: str
    value: str

@router.get("/")
async def get_settings():
    async with aiosqlite.connect(app_settings.db_path) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM app_settings") as cur:
            rows = await cur.fetchall()
    res = {r["key"]: r["value"] for r in rows}
    # Return masked active Nebius key
    current_key = clean_nebius_key(app_settings.nebius_api_key or res.get("nebius_api_key", ""))
    if current_key and not current_key.startswith("sk_live_"):
        masked = current_key[:12] + "••••••••" + current_key[-4:] if len(current_key) > 20 else "••••••••"
    else:
        masked = ""
    res["nebius_api_key_masked"] = masked
    res["nebius_configured"] = bool(current_key and not current_key.startswith("sk_live_"))
    return res

@router.put("/")
async def update_setting(data: SettingUpdate):
    key = data.key.strip()
    val = data.value.strip()

    if key == "nebius_api_key":
        cleaned = clean_nebius_key(val)
        if cleaned and not cleaned.startswith("••") and not cleaned.startswith("sk_live_"):
            app_settings.nebius_api_key = cleaned
            val = cleaned
            logger.info("Updated runtime Nebius API key from Settings.")

    async with aiosqlite.connect(app_settings.db_path) as db:
        await db.execute(
            "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
            (key, val)
        )
        await db.commit()
    return {"updated": key, "status": "ok"}

@router.get("/status")
async def api_status():
    """Verify active connection to Nebius Token Factory."""
    api_key = clean_nebius_key(app_settings.nebius_api_key or "")
    if not api_key or api_key in ("your_nebius_api_key_here", "") or api_key.startswith("sk_live_"):
        return {
            "api_configured": False,
            "connected": False,
            "error": "No valid Nebius API key configured. Please paste your key in the box above.",
            "detail": "No Nebius API key configured in .env or Settings",
            "model_nano": app_settings.model_nano,
            "model_super": app_settings.model_super,
        }

    if len(api_key) < 180 and api_key.startswith("v1."):
        return {
            "api_configured": False,
            "connected": False,
            "error": "Incomplete Nebius API key (truncated). Please ensure you copied the entire 220+ character key from .env.",
            "detail": "Truncated API key",
            "model_nano": app_settings.model_nano,
            "model_super": app_settings.model_super,
        }

    try:
        client = get_nebius_client()
        # Ping Nebius Token Factory
        models = await client.models.list()
        model_count = len(models.data) if hasattr(models, "data") else 0
        return {
            "api_configured": True,
            "connected": True,
            "model_count": model_count,
            "model_nano": app_settings.model_nano,
            "model_super": app_settings.model_super,
            "storage": "local (SQLite + LanceDB)",
        }
    except Exception as e:
        logger.warning(f"Nebius status ping failed: {e}")
        err_str = str(e)
        if "401" in err_str or "unauthorized" in err_str.lower():
            err_str = "Invalid Nebius API key (401 Unauthorized). Please check your key."
        return {
            "api_configured": True,
            "connected": False,
            "error": err_str,
            "model_nano": app_settings.model_nano,
            "model_super": app_settings.model_super,
            "storage": "local (SQLite + LanceDB)",
        }
