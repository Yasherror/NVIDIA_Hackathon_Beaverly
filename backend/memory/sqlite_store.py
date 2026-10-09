"""
Beaverly - SQLite Store (via SQLAlchemy async)
Stores: cases, skills, audit logs, settings
"""
import aiosqlite
import json
from datetime import datetime
from config import settings
from loguru import logger
import os

DB_PATH = settings.db_path


async def init_db():
    """Create all tables if they do not exist."""
    os.makedirs(os.path.dirname(DB_PATH) if os.path.dirname(DB_PATH) else ".", exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS cases (
                id TEXT PRIMARY KEY,
                matter_id TEXT UNIQUE NOT NULL,
                client_name TEXT NOT NULL,
                opponent TEXT,
                short_name TEXT,
                jurisdiction TEXT,
                practice_area TEXT,
                lead_counsel TEXT,
                files_count INTEGER DEFAULT 0,
                privilege_level TEXT,
                description TEXT,
                status TEXT DEFAULT 'active',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                closed_at TEXT
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS skills (
                id TEXT PRIMARY KEY,
                scope TEXT NOT NULL CHECK(scope IN ('global', 'case-specific')),
                case_id TEXT,
                name TEXT NOT NULL,
                trigger_pattern TEXT,
                replacement TEXT,
                category TEXT,
                learned_from TEXT,
                active INTEGER DEFAULT 1,
                occurrences INTEGER DEFAULT 1,
                confidence REAL DEFAULT 0.9,
                description TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS protection_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                case_id TEXT,
                action TEXT NOT NULL CHECK(action IN ('ALLOW', 'DENY')),
                resource TEXT NOT NULL,
                reason TEXT,
                agent TEXT DEFAULT 'Hermes Agent',
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Seed sample closed case if empty
        async with db.execute("SELECT COUNT(*) FROM cases") as cur:
            count = (await cur.fetchone())[0]
            if count == 0:
                await db.execute("""
                    INSERT INTO cases (id, matter_id, client_name, opponent, short_name, files_count, status, created_at, closed_at)
                    VALUES ('case-abc-mock', 'MATTER-2026-ABCHLD', 'ABC Holdings', 'XYZ Corp', 'ABC Holdings Contract', 11, 'closed', '2026-09-10 10:00:00', '2026-09-24 14:30:00')
                """)

        await db.commit()
    logger.info(f"SQLite DB initialized at {DB_PATH}")
