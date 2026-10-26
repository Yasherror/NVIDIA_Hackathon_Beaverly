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

        # Seed sample cases if active cases are missing
        async with db.execute("SELECT COUNT(*) FROM cases WHERE status='active'") as cur:
            active_count = (await cur.fetchone())[0]
            if active_count == 0:
                await db.execute("""
                    INSERT OR REPLACE INTO cases (id, matter_id, client_name, opponent, short_name, jurisdiction, practice_area, lead_counsel, files_count, privilege_level, description, status, created_at)
                    VALUES 
                    ('case-a', 'MATTER-2025-089A', 'Apex Global Solutions LLC', 'ABC Holdings Corp', 'Apex v. ABC Holdings', 'Delaware Court of Chancery', 'Commercial M&A Litigation', 'Eleanor Vance, Partner', 14, 'Confidential - Attorney-Client Protected', 'Post-closing indemnification and earn-out dispute involving merger covenants and working capital adjustments.', 'active', '2026-09-15 09:30:00'),
                    ('case-b', 'MATTER-2025-104B', 'Zenith Logistics Int.', 'Horizon Maritime LLC', 'Zenith v. Horizon Maritime', 'Southern District of New York (SDNY)', 'Maritime & Supply Chain Arbitration', 'Marcus Thorne, Of Counsel', 9, 'Strictly Confidential - Restricted Container', 'Breach of charterparty agreement regarding bunker fuel price escalation and force majeure declaration.', 'active', '2026-09-20 14:15:00'),
                    ('case-c', 'MATTER-2026-CHEN01', 'David Chen', 'MegaTech Asia Corp', 'Chen Employment Dispute', 'High Court of Singapore', 'Employment & Restrictive Covenants', 'Eleanor Vance, Partner', 7, 'Privileged - Litigation Work Product', 'Executive non-compete enforceability, notice period compliance, and unpaid severance.', 'active', '2026-09-22 11:00:00'),
                    ('case-abc-mock', 'MATTER-2026-ABCHLD', 'ABC Holdings', 'XYZ Corp', 'ABC Holdings Contract', 'State Court of California', 'Corporate Restructuring', 'Eleanor Vance, Partner', 11, 'Confidential', 'Archived commercial transaction matter.', 'closed', '2026-09-10 10:00:00')
                """)

        # Seed initial skills if empty
        async with db.execute("SELECT COUNT(*) FROM skills") as cur:
            skills_count = (await cur.fetchone())[0]
            if skills_count == 0:
                await db.execute("""
                    INSERT OR REPLACE INTO skills (id, scope, case_id, name, trigger_pattern, replacement, category, learned_from, active, occurrences, confidence, description, created_at)
                    VALUES
                    ('skill-1', 'global', NULL, 'Clause Simplification (Plain English)', 'party of the first part', 'client', 'Plain Language Drafting', 'Correction pattern (3x detected by Nemotron Nano)', 1, 3, 0.98, 'Replaces archaic legalese party of the first part with modern legal standard client across all contract drafting.', '2026-09-18 10:00:00'),
                    ('skill-2', 'global', NULL, 'Modern Dispute Resolution Standard', 'shall be submitted to the courts of general jurisdiction', 'shall be resolved by binding expedited AAA commercial arbitration in Wilmington, DE', 'Forum Selection', 'Senior Counsel firm drafting standard', 1, 8, 0.99, 'Automatically standardizes all dispute resolution clauses to binding AAA Delaware arbitration.', '2026-09-19 14:00:00'),
                    ('skill-3', 'global', NULL, 'Formal Notice Period Requirement', 'within reasonable time', 'within ten (10) business days via confirmed electronic mail', 'Procedural Drafting', 'Partner drafting requirement', 1, 5, 0.96, 'Replaces vague reasonable time terminology with unambiguous 10-day notice requirement.', '2026-09-21 09:30:00'),
                    ('skill-4', 'case-specific', 'case-a', 'Party A Designation', 'Party A', 'ABC Holdings Corp', 'Named Entity Binding', 'NER detected proper noun ABC Holdings in Case A', 1, 1, 0.97, 'Binds Party A to ABC Holdings Corp strictly within Case A (Apex v. ABC Holdings). Invisible to Case B.', '2026-09-22 16:45:00')
                """)

        # Seed protection logs if empty
        async with db.execute("SELECT COUNT(*) FROM protection_logs") as cur:
            logs_count = (await cur.fetchone())[0]
            if logs_count == 0:
                await db.execute("""
                    INSERT INTO protection_logs (case_id, action, resource, reason, agent, timestamp)
                    VALUES
                    ('case-a', 'ALLOW', '/sandboxes/matter-89a/Employment_Agreement_Exec.pdf', 'Same-case sandbox access authorized by OpenShell policy', 'Hermes Agent', '2026-09-24 10:42:00'),
                    ('case-a', 'ALLOW', '/sandboxes/matter-89a/Merger_and_Separation_Agreement.pdf', 'Same-case sandbox access authorized by OpenShell policy', 'Hermes Agent', '2026-09-24 10:15:00'),
                    ('case-b', 'DENY', '/sandboxes/matter-89a/confidential_settlement_notes.txt', 'OpenShell eBPF security_file_open blocked: Cross-tenant sandbox violation from [/openshell/case-104b] to [/sandboxes/matter-89a/]', 'OpenShell Kernel Policy', '2026-09-24 09:32:00'),
                    ('case-b', 'ALLOW', '/sandboxes/matter-104b/Charterparty_Master_Contract.pdf', 'Same-case sandbox access authorized by OpenShell policy', 'Hermes Agent', '2026-09-24 09:10:00'),
                    ('case-b', 'DENY', '/sandboxes/matter-89a/witness_deposition_sealed.pdf', 'OpenShell syscall openat(AT_FDCWD, matter-89a) blocked: EPERM unauthorized cross-case directory traversal', 'OpenShell Kernel Policy', '2026-09-23 16:45:00'),
                    ('case-c', 'ALLOW', '/sandboxes/matter-chen/employment_agreement.docx', 'Same-case sandbox access authorized by OpenShell policy', 'Hermes Agent', '2026-09-23 11:20:00')
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

        # Seed initial v1 snapshots for any skills lacking versions (PRD P1-1)
        await db.execute("""
            INSERT OR IGNORE INTO skill_versions (id, skill_id, version_number, name, trigger_pattern, replacement, category, learned_from, change_reason, created_at)
            SELECT 
                s.id || '-v1', s.id, 1, s.name, s.trigger_pattern, s.replacement, s.category, s.learned_from, 'Initial habit established & confirmed', s.created_at
            FROM skills s
            WHERE NOT EXISTS (SELECT 1 FROM skill_versions sv WHERE sv.skill_id = s.id)
        """)

        # Seed case_documents if empty
        async with db.execute("SELECT COUNT(*) FROM case_documents") as cur:
            docs_count = (await cur.fetchone())[0]
            if docs_count == 0:
                await db.execute("""
                    INSERT OR REPLACE INTO case_documents (id, case_id, name, file_type, size_human, pages_count, chunks_count, sandbox_path, privilege, status, sample_snippet)
                    VALUES 
                    ('doc-8b0-1', 'case-8b0bb87e', 'Synergy_Resources_Employment_Agreement.pdf', 'pdf', '1.2 MB', 8, 44, '/sandboxes/case-8b0bb87e/Synergy_Resources_Employment_Agreement.pdf', 'Confidential - Attorney-Client Protected', 'Indexed in LanceDB', 'EXHIBIT 10.1 EMPLOYMENT AGREEMENT between Synergy Resources Corporation and Executive. Full non-disclosure and severance protection clauses.'),
                    ('doc-8b0-2', 'case-8b0bb87e', 'Law_Insider_synergy-resources-corp_exhibit-101-employment-agreement-agreement-effective-as-of-june-1-2013-between-synergy-resources_Filed_07-06-2013_Contract.pdf', 'pdf', '1.2 MB', 8, 44, '/sandboxes/case-8b0bb87e/Law_Insider_Contract.pdf', 'Confidential - Attorney-Client Protected', 'Indexed in LanceDB', 'EXHIBIT 10.1 EMPLOYMENT AGREEMENT effective as of June 1, 2013 between Synergy Resources and Executive.'),
                    ('doc-8b0-3', 'case-8b0bb87e', 'Executive_Employment_Agreement_Final.pdf', 'pdf', '1.4 MB', 7, 32, '/sandboxes/case-8b0bb87e/Executive_Employment_Agreement_Final.pdf', 'Confidential - Attorney-Client Protected', 'Indexed in LanceDB', 'Executive employment terms, compensation covenants, base salary schedule, and termination notice requirements.'),
                    ('doc-8b0-4', 'case-8b0bb87e', 'Board_Resolution_Minutes_Signed.docx', 'docx', '0.6 MB', 4, 18, '/sandboxes/case-8b0bb87e/Board_Resolution_Minutes_Signed.docx', 'Privileged - Litigation Work Product', 'Indexed in LanceDB', 'Unanimous written consent of the Board of Directors approving executive employment agreement.'),
                    ('doc-8b0-5', 'case-8b0bb87e', 'Non_Disclosure_and_Proprietary_Rights.pdf', 'pdf', '0.9 MB', 5, 22, '/sandboxes/case-8b0bb87e/Non_Disclosure_and_Proprietary_Rights.pdf', 'Confidential - Attorney-Client Protected', 'Indexed in LanceDB', 'Comprehensive proprietary information, assignment of inventions, and restrictive covenant agreement.'),
                    ('doc-8b0-6', 'case-8b0bb87e', 'Executive_Severance_and_Change_in_Control_Plan.pdf', 'pdf', '1.8 MB', 12, 48, '/sandboxes/case-8b0bb87e/Executive_Severance_Plan.pdf', 'Confidential - Attorney-Client Protected', 'Indexed in LanceDB', 'Tier-1 executive severance policy and change-of-control golden parachute acceleration provisions.'),
                    ('doc-8b0-7', 'case-8b0bb87e', 'Stock_Option_Grant_and_Vesting_Schedule.pdf', 'pdf', '0.8 MB', 4, 16, '/sandboxes/case-8b0bb87e/Stock_Option_Grant.pdf', 'Confidential - Attorney-Client Protected', 'Indexed in LanceDB', 'Incentive stock option award agreement with standard 4-year graded vesting schedule.'),
                    ('doc-chen-1', 'case-chen-001', 'Executive_Employment_Agreement_David_Chen.docx', 'docx', '1.1 MB', 6, 24, '/sandboxes/case-chen-001/Executive_Employment_Agreement.docx', 'Confidential - Attorney-Client Protected', 'Indexed in LanceDB', 'Executive employment agreement of David Chen with MegaTech Asia Corp.'),
                    ('doc-chen-2', 'case-chen-001', 'Non_Compete_and_Restrictive_Covenants.pdf', 'pdf', '0.8 MB', 4, 16, '/sandboxes/case-chen-001/Non_Compete.pdf', 'Confidential - Attorney-Client Protected', 'Indexed in LanceDB', '24-month post-employment restrictive covenant and non-solicitation scope.'),
                    ('doc-chen-3', 'case-chen-001', 'Severance_and_Notice_Period_Addendum.pdf', 'pdf', '0.5 MB', 3, 12, '/sandboxes/case-chen-001/Severance_Addendum.pdf', 'Confidential - Attorney-Client Protected', 'Indexed in LanceDB', 'Notice period compliance terms and severance payment computation schedule.'),
                    ('doc-chen-4', 'case-chen-001', 'MegaTech_Dispute_Correspondence.pdf', 'pdf', '0.7 MB', 5, 20, '/sandboxes/case-chen-001/MegaTech_Dispute.pdf', 'Privileged - Litigation Work Product', 'Indexed in LanceDB', 'Formal letters of demand and dispute correspondence regarding unpaid severance.'),
                    ('doc-chen-5', 'case-chen-001', 'Arbitration_Notice_SIAC.pdf', 'pdf', '0.4 MB', 3, 10, '/sandboxes/case-chen-001/SIAC_Notice.pdf', 'Confidential - Attorney-Client Protected', 'Indexed in LanceDB', 'Notice of Arbitration filed with Singapore International Arbitration Centre.')
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
