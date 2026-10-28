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

import os

def sync_key_to_env(clean_key: str):
    """Sync updated API key back to .env files so both SQLite and .env stay consistent."""
    if not clean_key or clean_key.startswith("sk_live_"):
        return
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    env_paths = [
        os.path.join(backend_dir, ".env"),
        os.path.join(os.path.dirname(backend_dir), ".env"),
    ]
    for p in env_paths:
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    file_text = f.read()
                if re.search(r"^NEBIUS_API_KEY=.*$", file_text, flags=re.MULTILINE):
                    new_file_text = re.sub(r"^NEBIUS_API_KEY=.*$", f"NEBIUS_API_KEY={clean_key}", file_text, flags=re.MULTILINE)
                else:
                    new_file_text = file_text + f"\nNEBIUS_API_KEY={clean_key}\n"
                with open(p, "w", encoding="utf-8") as f:
                    f.write(new_file_text)
                logger.info(f"Auto-synced Nebius API key to {p}")
            except Exception as e:
                logger.warning(f"Could not auto-sync key to {p}: {e}")

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
        if not val or val.lower() == "clear":
            app_settings.nebius_api_key = ""
            val = ""
            logger.info("Cleared runtime Nebius API key from Settings.")
            sync_key_to_env("")
        else:
            cleaned = clean_nebius_key(val)
            if cleaned and not cleaned.startswith("••") and not cleaned.startswith("sk_live_"):
                app_settings.nebius_api_key = cleaned
                val = cleaned
                logger.info("Updated runtime Nebius API key from Settings.")
                sync_key_to_env(cleaned)

    async with aiosqlite.connect(app_settings.db_path) as db:
        if key == "nebius_api_key" and not val:
            await db.execute("DELETE FROM app_settings WHERE key = 'nebius_api_key'")
        else:
            await db.execute(
                "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
                (key, val)
            )
        await db.commit()
    return {"updated": key, "status": "ok"}

@router.delete("/api-key")
async def clear_api_key():
    """Completely remove stored Nebius API key from memory, SQLite, and .env."""
    app_settings.nebius_api_key = ""
    sync_key_to_env("")
    async with aiosqlite.connect(app_settings.db_path) as db:
        await db.execute("DELETE FROM app_settings WHERE key = 'nebius_api_key'")
        await db.commit()
    logger.info("Successfully purged Nebius API key via DELETE /api-key")
    return {"status": "cleared", "nebius_configured": False}

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
