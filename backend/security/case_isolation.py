"""
Beaverly - Case Isolation Layer
Simulates OpenShell eBPF kernel-level enforcement.
In production: OpenShell enforces at OS level.
In demo: policy rules enforced in application layer + logged.
"""
import aiosqlite
import uuid
from datetime import datetime
from loguru import logger
from config import settings


async def log_access(
    case_id: str,
    action: str,        # "ALLOW" or "DENY"
    resource: str,      # What was accessed / attempted
    reason: str = "",
    agent: str = "Hermes Agent",
):
    """Log every access decision to protection_logs table."""
    async with aiosqlite.connect(settings.db_path) as db:
        await db.execute(
            """INSERT INTO protection_logs (case_id, action, resource, reason, agent, timestamp)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (case_id, action, resource, reason, agent, datetime.utcnow().isoformat()),
        )
        await db.commit()
    logger.info(f"[OpenShell] {action} | Case:{case_id} | Resource:{resource} | {reason}")


async def check_access(requesting_case_id: str, target_case_id: str, resource: str) -> bool:
    """
    Enforce: an agent operating under case_A CANNOT access case_B resources.
    Returns True if access is allowed, False if denied.
    """
    if requesting_case_id == target_case_id:
        await log_access(requesting_case_id, "ALLOW", resource, "Same-case access permitted")
        return True

    reason = f"OpenShell policy: cross-case access forbidden. [{requesting_case_id}] attempted to access [{target_case_id}]"
    await log_access(requesting_case_id, "DENY", resource, reason)
    return False
