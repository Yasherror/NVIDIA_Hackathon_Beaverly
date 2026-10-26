"""
Beaverly - App Configuration (loads from the backend-local .env)
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Nebius Token Factory
    nebius_api_key: str = ""
    nebius_base_url: str = "https://api.tokenfactory.nebius.com/v1/"

    # Models (PRD Section 10: Hermes Agent, Nemotron Nano, Nemotron Super, Nemotron Ultra)
    model_nano: str = "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B"
    model_super: str = "nvidia/nemotron-3-super-120b-a12b"
    model_ultra: str = "nvidia/Nemotron-3-Ultra-550b-a55b"
    model_hermes: str = "NousResearch/Hermes-4-405B"
    model_embed: str = "Qwen/Qwen3-Embedding-8B"

    # App
    app_env: str = "development"
    app_port: int = 8000
    frontend_url: str = "http://localhost:5173"

    # Storage
    db_path: str = "./db/beaverly.db"
    lancedb_path: str = "./db/lancedb"
    uploads_path: str = "./uploads"
    sandboxes_path: str = "./sandboxes"


    # Security
    secret_key: str = "dev-secret-change-in-production"

    model_config = {
        "protected_namespaces": (),
        "env_file": os.path.join(os.path.dirname(__file__), ".env"),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
