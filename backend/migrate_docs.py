import sqlite3
import hashlib
import os

DB_PATH = 'backend/db/beaverly.db'
if not os.path.exists(DB_PATH):
    DB_PATH = 'db/beaverly.db'

con = sqlite3.connect(DB_PATH)
cur = con.cursor()

# 1. Create case_documents table in SQLite
cur.execute('''
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
''')

# 2. Check existing cases
cases = cur.execute("SELECT id, matter_id, short_name, files_count, privilege_level FROM cases").fetchall()
print("Found cases:", cases)

SEED_DOCS = {
    'case-8b0bb87e': [
        ('Law_Insider_synergy-resources-corp_exhibit-101-employment-agreement-agreement-effective-as-of-june-1-2013-between-synergy-resources_Filed_07-06-2013_Contract.pdf', 'pdf', '1.2 MB', 8, 44, 'EXHIBIT 10.1 EMPLOYMENT AGREEMENT between Synergy Resources Corporation and Executive. Scope includes salary, benefits, non-compete terms.'),
        ('Synergy_Resources_Employment_Agreement.pdf', 'pdf', '1.2 MB', 8, 44, 'EXHIBIT 10.1 EMPLOYMENT AGREEMENT between Synergy Resources Corporation and Executive. Full non-disclosure and severance protection clauses.'),
        ('Executive_Employment_Agreement_Final.pdf', 'pdf', '1.4 MB', 7, 32, 'Executive employment terms, compensation covenants, base salary schedule, and termination notice requirements.'),
        ('Board_Resolution_Minutes_Signed.docx', 'docx', '0.6 MB', 4, 18, 'Unanimous written consent of the Board of Directors approving executive employment agreement.'),
        ('Non_Disclosure_and_Proprietary_Rights.pdf', 'pdf', '0.9 MB', 5, 22, 'Comprehensive proprietary information, assignment of inventions, and restrictive covenant agreement.'),
        ('Executive_Severance_and_Change_in_Control_Plan.pdf', 'pdf', '1.8 MB', 12, 48, 'Tier-1 executive severance policy and change-of-control golden parachute acceleration provisions.'),
        ('Stock_Option_Grant_and_Vesting_Schedule.pdf', 'pdf', '0.8 MB', 4, 16, 'Incentive stock option award agreement with standard 4-year graded vesting schedule.')
    ],
    'case-chen-001': [
        ('Executive_Employment_Agreement_David_Chen.docx', 'docx', '1.1 MB', 6, 24, 'Executive employment agreement of David Chen with MegaTech Asia Corp.'),
        ('Non_Compete_and_Restrictive_Covenants.pdf', 'pdf', '0.8 MB', 4, 16, '24-month post-employment restrictive covenant and non-solicitation scope.'),
        ('Severance_and_Notice_Period_Addendum.pdf', 'pdf', '0.5 MB', 3, 12, 'Notice period compliance terms and severance payment computation schedule.'),
        ('MegaTech_Dispute_Correspondence.pdf', 'pdf', '0.7 MB', 5, 20, 'Formal letters of demand and dispute correspondence regarding unpaid severance.'),
        ('Arbitration_Notice_SIAC.pdf', 'pdf', '0.4 MB', 3, 10, 'Notice of Arbitration filed with Singapore International Arbitration Centre.')
    ],
    'case-ee9379bf': [
        ('Employment_Agreement_Master.pdf', 'pdf', '1.3 MB', 7, 28, 'Master employment agreement governing duties, equity awards, and severance obligations.'),
        ('Compensation_and_Equity_Incentive.docx', 'docx', '0.7 MB', 4, 16, 'Performance bonus formula, incentive milestones, and stock options.'),
        ('Separation_Release_Draft.pdf', 'pdf', '0.5 MB', 3, 12, 'Mutual release and confidential separation terms.')
    ],
    'case-abc-mock': [
        ('Master_Restructuring_Agreement.pdf', 'pdf', '2.1 MB', 14, 52, 'Archived corporate reorganization and commercial merger contract.'),
        ('Creditor_Consent_and_Waivers.pdf', 'pdf', '1.2 MB', 8, 30, 'Secured creditor waivers and consent to corporate restructuring.'),
        ('Asset_Purchase_Schedule.xlsx', 'xlsx', '0.8 MB', 4, 15, 'Schedule of transferred assets, liabilities, and assumed contracts.')
    ]
}

inserted_count = 0
for cid, docs in SEED_DOCS.items():
    for name, ftype, fsize, fpages, fchunks, fsnippet in docs:
        doc_id = hashlib.md5(f"{cid}_{name}".encode()).hexdigest()[:12]
        sandbox_path = f"/sandboxes/{cid}/{name}"
        cur.execute('''
            INSERT OR REPLACE INTO case_documents 
            (id, case_id, name, file_type, size_human, pages_count, chunks_count, sandbox_path, privilege, status, sample_snippet)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Confidential - Attorney-Client Protected', 'Indexed in LanceDB', ?)
        ''', (doc_id, cid, name, ftype, fsize, fpages, fchunks, sandbox_path, fsnippet))
        inserted_count += 1

con.commit()
print(f"Migration completed! Seeded {inserted_count} documents into case_documents table in SQLite.")

# Check count
total = cur.execute("SELECT COUNT(*) FROM case_documents").fetchone()[0]
print(f"Total rows in case_documents: {total}")
for row in cur.execute("SELECT case_id, name, file_type, size_human, chunks_count FROM case_documents").fetchall():
    print(" -", row)

con.close()
