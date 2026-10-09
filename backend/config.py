"""
Beaverly - App Configuration (loads from .env)
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Nebius Token Factory
    nebius_api_key: str = ""
    nebius_base_url: str = "https://api.studio.nebius.ai/v1/"

    # Models
    model_nano: str = "nvidia/llama-3.1-nemotron-70b-instruct"
    model_super: str = "nvidia/llama-3.1-nemotron-70b-instruct"
    model_embed: str = "BAAI/bge-en-icl"

    # App
    app_env: str = "development"
    app_port: int = 8000
    frontend_url: str = "http://localhost:5173"

    # Storage
    db_path: str = "./db/beaverly.db"
    lancedb_path: str = "./db/lancedb"
    uploads_path: str = "./uploads"

    # Security
    secret_key: str = "dev-secret-change-in-production"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

