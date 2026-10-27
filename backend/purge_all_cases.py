"""
Utility script: Purge ALL cases, documents, sandboxes, and LanceDB tables.
Provides a 100% clean slate for production deployment or real CUAD testing.
"""
import os
import shutil
import sqlite3
from config import settings

def purge_all():
    print("--- PURGING ALL BEAVERLY CASES & DATA ---")
    
    # 1. SQLite Cleanup
    if os.path.exists(settings.db_path):
        conn = sqlite3.connect(settings.db_path)
        cur = conn.cursor()
        
        cur.execute("DELETE FROM cases")
        cases_deleted = cur.rowcount
        print(f"Deleted {cases_deleted} cases from SQLite.")
        
        cur.execute("DELETE FROM case_documents")
        docs_deleted = cur.rowcount
        print(f"Deleted {docs_deleted} case_documents from SQLite.")
        
        cur.execute("DELETE FROM protection_logs")
        logs_deleted = cur.rowcount
        print(f"Deleted {logs_deleted} protection_logs from SQLite.")
        
        cur.execute("DELETE FROM correction_events")
        events_deleted = cur.rowcount
        print(f"Deleted {events_deleted} correction_events from SQLite.")
        
        cur.execute("DELETE FROM skills WHERE scope='case-specific'")
        skills_deleted = cur.rowcount
        print(f"Deleted {skills_deleted} case-specific skills from SQLite.")
        
        cur.execute("DELETE FROM skill_versions WHERE skill_id NOT IN (SELECT id FROM skills)")
        versions_deleted = cur.rowcount
        print(f"Deleted {versions_deleted} orphaned skill_versions from SQLite.")
        
        conn.commit()
        conn.close()
    else:
        print("SQLite DB does not exist yet.")

    # 2. LanceDB Cleanup
    if os.path.exists(settings.lancedb_path):
        import lancedb
        try:
            db = lancedb.connect(settings.lancedb_path)
            # Support both LanceDB 0.40+ (ListTablesResponse) and older versions
            tables_res = db.list_tables()
            table_names = tables_res.tables if hasattr(tables_res, 'tables') else list(tables_res)
            for table_name in table_names:
                if table_name.startswith("case_"):
                    db.drop_table(table_name)
                    print(f"Dropped LanceDB table: {table_name}")
        except Exception as e:
            print(f"LanceDB cleanup warning: {e}")
            
        # Also clean up any remnant .lance folders inside lancedb dir
        for item in os.listdir(settings.lancedb_path):
            if item.startswith("case_"):
                item_path = os.path.join(settings.lancedb_path, item)
                try:
                    if os.path.isdir(item_path):
                        shutil.rmtree(item_path, ignore_errors=True)
                    else:
                        os.remove(item_path)
                    print(f"Removed LanceDB directory: {item}")
                except Exception as e:
                    print(f"Could not remove {item_path}: {e}")

    # 3. Physical Sandboxes Cleanup
    if os.path.exists(settings.sandboxes_path):
        for item in os.listdir(settings.sandboxes_path):
            item_path = os.path.join(settings.sandboxes_path, item)
            if os.path.isdir(item_path):
                shutil.rmtree(item_path, ignore_errors=True)
                print(f"Removed physical sandbox directory: {item}")

    # 4. Uploads Cleanup
    if os.path.exists(settings.uploads_path):
        for item in os.listdir(settings.uploads_path):
            item_path = os.path.join(settings.uploads_path, item)
            try:
                if os.path.isdir(item_path):
                    shutil.rmtree(item_path, ignore_errors=True)
                else:
                    os.remove(item_path)
                print(f"Removed temp upload file: {item}")
            except Exception as e:
                print(f"Could not remove {item_path}: {e}")

    print("--- PURGE COMPLETE: 100% CLEAN SLATE ---")

if __name__ == "__main__":
    purge_all()
