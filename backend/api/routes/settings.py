"""API routes: App settings"""
from fastapi import APIRouter
from pydantic import BaseModel
import aiosqlite
from config import settings as app_settings

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
    return {r["key"]: r["value"] for r in rows}

@router.put("/")
async def update_setting(data: SettingUpdate):
    async with aiosqlite.connect(app_settings.db_path) as db:
        await db.execute(
            "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
            (data.key, data.value)
        )
        await db.commit()
    return {"updated": data.key}

@router.get("/status")
async def api_status():
    """Check if Nebius API key is configured."""
    return {
        "api_configured": bool(app_settings.nebius_api_key),
        "model_nano": app_settings.model_nano,
        "model_super": app_settings.model_super,
        "storage": "local",
    }
