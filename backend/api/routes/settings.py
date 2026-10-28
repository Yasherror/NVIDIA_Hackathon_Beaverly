"""API routes: App settings"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import aiosqlite
from config import settings as app_settings
from models.nebius_client import get_nebius_client
from loguru import logger

router = APIRouter()

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
    current_key = app_settings.nebius_api_key or res.get("nebius_api_key", "")
    if current_key:
        masked = current_key[:12] + "••••••••" + current_key[-4:] if len(current_key) > 20 else "••••••••"
    else:
        masked = ""
    res["nebius_api_key_masked"] = masked
    res["nebius_configured"] = bool(current_key)
    return res

@router.put("/")
async def update_setting(data: SettingUpdate):
    key = data.key.strip()
    val = data.value.strip()

    if key == "nebius_api_key":
        if val and not val.startswith("••"):
            app_settings.nebius_api_key = val
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
    api_key = app_settings.nebius_api_key
    if not api_key:
        return {
            "api_configured": False,
            "connected": False,
            "detail": "No Nebius API key configured in .env or Settings",
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
        return {
            "api_configured": True,
            "connected": False,
            "error": str(e),
            "model_nano": app_settings.model_nano,
            "model_super": app_settings.model_super,
            "storage": "local (SQLite + LanceDB)",
        }
