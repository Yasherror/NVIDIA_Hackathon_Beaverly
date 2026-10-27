"""
Beaverly - SQLite Store
Stores: cases, skills, correction events, protection logs, and settings.
Enforces local-first data retention and case isolation boundaries.
"""
import aiosqlite
import json
from datetime import datetime
from config import settings
from loguru import logger
import os

DB_PATH = settings.db_path


async def init_db():
    """Create all tables and seed standard demo data if needed."""
    os.makedirs(os.path.dirname(DB_PATH) if os.path.dirname(DB_PATH) else ".", exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("PRAGMA journal_mode=WAL;")
        await db.execute("PRAGMA synchronous=NORMAL;")
        await db.execute("PRAGMA busy_timeout=5000;")
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

        # Skill version history & rollback snapshots (PRD v7.0 P1-1)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS skill_versions (
                id TEXT PRIMARY KEY,
                skill_id TEXT NOT NULL,
                version_number INTEGER NOT NULL,
                name TEXT NOT NULL,
                trigger_pattern TEXT,
                replacement TEXT,
                category TEXT,
                learned_from TEXT,
                change_reason TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Stream of user corrections used by Hermes Agent to compute occurrence counts
        await db.execute("""
            CREATE TABLE IF NOT EXISTS correction_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                case_id TEXT,
                original_text TEXT NOT NULL,
                corrected_text TEXT NOT NULL,
                trigger_pattern TEXT,
                replacement TEXT,
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

        # Matter documents catalog: records all sandboxed files, chunk counts and isolation status in SQLite
        await db.execute("""
            CREATE TABLE IF NOT EXISTS case_documents (
                id TEXT PRIMARY KEY,
                case_id TEXT NOT NULL,
                name TEXT NOT NULL,
                file_type TEXT DEFAULT 'pdf',
                size_human TEXT DEFAULT '1.2 MB',
                pages_count INTEGER DEFAULT 1,
                chunks_count INTEGER DEFAULT 1,
                sandbox_path TEXT,
                privilege TEXT DEFAULT 'Confidential - Attorney-Client Protected',
                status TEXT DEFAULT 'Indexed in LanceDB',
                sample_snippet TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (case_id) REFERENCES cases(id)
            )
        """)

        # Seed default firm-wide drafting habits if empty
        async with db.execute("SELECT COUNT(*) FROM skills WHERE scope='global'") as cur:
            skills_count = (await cur.fetchone())[0]
            if skills_count == 0:
                await db.execute("""
                    INSERT OR REPLACE INTO skills (id, scope, case_id, name, trigger_pattern, replacement, category, learned_from, active, occurrences, confidence, description, created_at)
                    VALUES
                    ('skill-1', 'global', NULL, 'Clause Simplification (Plain English)', 'party of the first part', 'client', 'Plain Language Drafting', 'Correction pattern (3x detected by Nemotron Nano)', 1, 3, 0.98, 'Replaces archaic legalese party of the first part with modern legal standard client across all contract drafting.', '2026-09-18 10:00:00'),
                    ('skill-2', 'global', NULL, 'Modern Dispute Resolution Standard', 'shall be submitted to the courts of general jurisdiction', 'shall be resolved by binding expedited AAA commercial arbitration in Wilmington, DE', 'Forum Selection', 'Senior Counsel firm drafting standard', 1, 8, 0.99, 'Automatically standardizes all dispute resolution clauses to binding AAA Delaware arbitration.', '2026-09-19 14:00:00'),
                    ('skill-3', 'global', NULL, 'Formal Notice Period Requirement', 'within reasonable time', 'within ten (10) business days via confirmed electronic mail', 'Procedural Drafting', 'Partner drafting requirement', 1, 5, 0.96, 'Replaces vague reasonable time terminology with unambiguous 10-day notice requirement.', '2026-09-21 09:30:00')
                """)

        # Seed default app_settings if empty
        async with db.execute("SELECT COUNT(*) FROM app_settings") as cur:
            settings_count = (await cur.fetchone())[0]
            if settings_count == 0:
                await db.execute("""
                    INSERT INTO app_settings (key, value)
                    VALUES
                    ('read_isolation', 'true'),
                    ('network_isolation', 'true'),
                    ('pii_redaction', 'true'),
                    ('default_model_nano', 'nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B'),
                    ('default_model_super', 'nvidia/nemotron-3-super-120b-a12b'),
                    ('default_model_ultra', 'nvidia/Nemotron-3-Ultra-550b-a55b')
                """)

        # Seed initial v1 snapshots for any skills lacking versions
        await db.execute("""
            INSERT OR IGNORE INTO skill_versions (id, skill_id, version_number, name, trigger_pattern, replacement, category, learned_from, change_reason, created_at)
            SELECT 
                s.id || '-v1', s.id, 1, s.name, s.trigger_pattern, s.replacement, s.category, s.learned_from, 'Initial habit established & confirmed', s.created_at
            FROM skills s
            WHERE NOT EXISTS (SELECT 1 FROM skill_versions sv WHERE sv.skill_id = s.id)
        """)

        await db.commit()
    logger.info(f"SQLite DB initialized and primed at {DB_PATH}")


async def record_correction(case_id: str, original_text: str, corrected_text: str,
                            trigger_pattern: str, replacement: str) -> int:
    """Record a correction and return its occurrence count for this pattern."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO correction_events
               (case_id, original_text, corrected_text, trigger_pattern, replacement)
               VALUES (?, ?, ?, ?, ?)""",
            (case_id, original_text, corrected_text, trigger_pattern, replacement),
        )
        async with db.execute(
            """SELECT COUNT(*) FROM correction_events
               WHERE lower(trim(trigger_pattern)) = lower(trim(?))
                 AND lower(trim(replacement)) = lower(trim(?))""",
            (trigger_pattern, replacement),
        ) as cur:
            count = (await cur.fetchone())[0]
        await db.commit()
    return count
