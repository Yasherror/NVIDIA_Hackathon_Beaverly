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

        # Seed Golden CUAD Benchmark cases if empty
        async with db.execute("SELECT COUNT(*) FROM cases") as cur:
            cases_count = (await cur.fetchone())[0]
            if cases_count == 0:
                await db.execute("""
                    INSERT OR REPLACE INTO cases (id, matter_id, client_name, opponent, short_name, jurisdiction, practice_area, lead_counsel, files_count, description, status, created_at, closed_at)
                    VALUES
                    ('case-6598b8c0', 'MATTER-2026-2CA3BD', 'Accuray Incorporated', 'Siemens Aktiengesellschaft', 'Accuray v. Siemens - CyberKnife Distributor Agreement', 'California, USA / Germany', 'Medical Technology & Distribution', 'Elena Vance, Esq.', 1, 'Global Multiple LINAC and CyberKnife robotic radiosurgery distributor agreement (CUAD Benchmark).', 'active', '2026-10-28 13:02:58', NULL),
                    ('case-f1c8b3f2', 'MATTER-2026-5AA880', 'Bellicum Pharmaceuticals, Inc.', 'Miltenyi Biotec GmbH', 'Bellicum Pharma - Master Cell Therapy Supply Agreement', 'Texas, USA / Bergisch Gladbach, Germany', 'Biotechnology & Clinical Supply', 'Marcus Sterling, Senior Partner', 1, 'Master commercial clinical supply agreement for cell separation and viral vectors (CUAD Benchmark).', 'active', '2026-10-28 13:02:58', NULL),
                    ('case-95bb4f0b', 'MATTER-2026-1298ED', 'BorrowMoney.com, Inc.', 'JVLS, LLC dba Vaccines 2Go', 'BorrowMoney.com - BM&V2GO Joint Venture', 'Florida, USA', 'FinTech & Corporate Structuring', 'Sarah Jenkins, Esq.', 1, 'Joint venture agreement establishing BM&V2GO commercial partnership under Florida law (CUAD Benchmark).', 'active', '2026-10-28 13:02:58', NULL),
                    ('case-930d9c2b', 'MATTER-2026-0B2736', 'Acme Law Corp', 'Beta Industries', 'Acme v. Beta Dispute', 'Delaware Chancery Court', 'Commercial Litigation', 'Arthur Pendelton, Lead Counsel', 0, 'Closed matter demonstrating OpenShell zero-leak data destruction and digital certificate.', 'closed', '2026-10-27 14:40:01', '2026-10-27T14:40:11.267416')
                """)
                await db.execute("""
                    INSERT OR REPLACE INTO case_documents (id, case_id, name, file_type, size_human, pages_count, chunks_count, sandbox_path, privilege, status, sample_snippet, created_at)
                    VALUES
                    ('doc-case-659', 'case-6598b8c0', 'Accuray_Siemens_Distributor_Agreement.txt', 'txt', '1.2 MB', 7, 28, '/sandboxes/case-6598b8c0/Accuray_Siemens_Distributor_Agreement.txt', 'Confidential - Attorney-Client Protected', 'Indexed in LanceDB', 'Exhibit 10.31    PURSUANT TO 17 C.F.R. § 240.24B-2, CONFIDENTIAL INFORMATION HAS BEEN OMITTED AND FILED SEPARATELY WITH THE SEC', '2026-10-28 13:03:02'),
                    ('doc-case-f1c', 'case-f1c8b3f2', 'Miltenyi_Bellicum_Supply_Agreement.txt', 'txt', '1.2 MB', 7, 28, '/sandboxes/case-f1c8b3f2/Miltenyi_Bellicum_Supply_Agreement.txt', 'Confidential - Attorney-Client Protected', 'Indexed in LanceDB', 'Exhibit 10.1 Certain confidential information contained in this document has been omitted because it is not material and competitively harmful', '2026-10-28 13:03:06'),
                    ('doc-case-95b', 'case-95bb4f0b', 'BorrowMoney_Vaccines2Go_JV_Agreement.txt', 'txt', '1.2 MB', 7, 28, '/sandboxes/case-95bb4f0b/BorrowMoney_Vaccines2Go_JV_Agreement.txt', 'Confidential - Attorney-Client Protected', 'Indexed in LanceDB', 'Exhibit 10.1 JOINT VENTURE AGREEMENT made and entered into this 20th day of Friday, March 2020 BETWEEN: BorrowMoney.com, inc of Florida', '2026-10-28 13:03:10')
                """)
                await db.execute("""
                    INSERT OR REPLACE INTO skills (id, scope, case_id, name, trigger_pattern, replacement, category, learned_from, active, occurrences, confidence, description, created_at)
                    VALUES
                    ('skill-05f35695', 'case-specific', 'case-f1c8b3f2', 'Party A -> Miltenyi Biotec Binding', 'Party A', 'Miltenyi Biotec GmbH', 'Named Entity Binding', 'CUAD Benchmark Evidence', 1, 1, 0.99, 'Binds confidential generic designation Party A to Miltenyi Biotec GmbH strictly within case-f1c8b3f2.', '2026-10-28 13:03:40')
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

        # Auto-restore Nebius API key from database if config is empty or placeholder
        async with db.execute("SELECT value FROM app_settings WHERE key='nebius_api_key'") as cur:
            row = await cur.fetchone()
            if row and row[0]:
                raw_key = str(row[0]).strip()
                import re
                m = re.search(r'(v1\.[A-Za-z0-9_\-\.]+)', raw_key)
                cleaned_key = m.group(1).rstrip('.') if m else raw_key
                if cleaned_key != raw_key:
                    await db.execute("UPDATE app_settings SET value=? WHERE key='nebius_api_key'", (cleaned_key,))
                if cleaned_key and not cleaned_key.startswith("••") and not cleaned_key.startswith("sk_live_") and cleaned_key != "your_nebius_api_key_here":
                    from config import settings
                    if not settings.nebius_api_key or settings.nebius_api_key in ("your_nebius_api_key_here", ""):
                        settings.nebius_api_key = cleaned_key
                        logger.info("Restored persisted Nebius API key from SQLite.")

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
