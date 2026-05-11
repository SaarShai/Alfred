from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path
from typing import Any

from .wiki import WikiStore


CORE_PAGES = [
    "projects/executive-assistant/README.md",
    "L2_facts/user-operating-profile.md",
    "L2_facts/approved-information-sources.md",
    "L2_facts/source-intake-queue.md",
    "patterns/daily-weekly-briefing.md",
    "patterns/first-briefing-dry-run.md",
    "patterns/agent-tool-guardrails.md",
    "patterns/agentic-system-best-practices.md",
    "patterns/chief-of-staff-state-loop.md",
    "L3_sops/chief-of-staff-workflow.md",
    "L3_sops/chief-of-staff-onboarding.md",
    "L3_sops/chief-of-staff-evaluation.md",
    "L3_sops/instruction-fidelity-and-drift-control.md",
    "L3_sops/gogcli-workspace-access.md",
    "templates/action-ledger.template.md",
]


SOURCE_ACCESS_TERMS = (
    "source",
    "folder",
    "docs",
    "drive",
    "gmail",
    "google workspace",
    "calendar",
    "email",
    "workspace",
    "account",
)

EXTERNAL_MUTATION_TERMS = (
    "send",
    "delete",
    "share",
    "schedule",
    "publish",
    "purchase",
    "install",
    "global",
    "auth",
    "oauth",
    "commit",
    "push",
    "automation",
    "reminder",
)


def _read(root: Path, rel: str) -> str:
    path = root / rel
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8", errors="replace")


def _run_json(cmd: list[str], *, timeout: int = 20) -> dict[str, Any]:
    result = subprocess.run(cmd, text=True, capture_output=True, timeout=timeout)
    payload: dict[str, Any] = {
        "cmd": cmd,
        "returncode": result.returncode,
        "stderr": result.stderr.strip()[:1200],
    }
    try:
        payload["stdout_json"] = json.loads(result.stdout) if result.stdout.strip() else None
    except json.JSONDecodeError:
        payload["stdout"] = result.stdout.strip()[:1200]
    return payload


def gog_status(root: Path) -> dict[str, Any]:
    binary = shutil.which("gog") or str(Path.home() / ".local/bin/gog")
    binary_path = Path(binary).expanduser()
    wrapper = root / "tools" / "gog-agent-readonly"
    status: dict[str, Any] = {
        "binary": str(binary_path),
        "installed": binary_path.exists(),
        "wrapper": str(wrapper),
        "wrapper_exists": wrapper.exists(),
        "authenticated": False,
    }
    if not binary_path.exists():
        return status
    version = subprocess.run([str(binary_path), "--version"], text=True, capture_output=True, timeout=20)
    status["version"] = version.stdout.strip() or version.stderr.strip()
    status_result = _run_json([str(binary_path), "status", "--json", "--no-input"])
    status["status"] = status_result
    auth_result = _run_json([str(binary_path), "auth", "list", "--json", "--no-input"])
    status["auth_list"] = auth_result
    accounts = (auth_result.get("stdout_json") or {}).get("accounts", []) if isinstance(auth_result.get("stdout_json"), dict) else []
    status["authenticated"] = bool(accounts)
    return status


def readiness(root: Path) -> dict[str, Any]:
    wiki = WikiStore(root)
    context = wiki.context("chief of staff readiness dry run")
    page_status = {rel: (root / rel).exists() for rel in CORE_PAGES}
    tests = [
        "./te doctor",
        "./te hooks doctor",
        "./te wiki index",
        "./te wiki lint --strict --fail-on-error",
        "python3 -m unittest tests/test_chief_of_staff_system.py",
    ]
    return {
        "mode": "chief_of_staff_readiness",
        "ok": all(page_status.values()),
        "core_pages": page_status,
        "retrieval_loaded": context["citations"]["loaded"],
        "gog": gog_status(root),
        "recommended_checks": tests,
        "next_actions": [
            "Run `./te chief preflight \"<task>\"` before substantial chief-of-staff work.",
            "Capture onboarding preferences with `./te chief onboarding`.",
            "Provide Google OAuth Desktop Client JSON before promoting Workspace access.",
            "Use `tools/gog-agent-readonly` for agent-side Workspace reads after auth.",
            "Run `./te chief briefing --horizon daily` before the first real source-backed briefing.",
        ],
    }


def preflight(root: Path, task: str) -> dict[str, Any]:
    wiki = WikiStore(root)
    context = wiki.context(task or "chief of staff instruction fidelity preflight")
    text = task.lower()
    source_access = any(term in text for term in SOURCE_ACCESS_TERMS)
    external_mutation = any(term in text for term in EXTERNAL_MUTATION_TERMS)
    irreversible = any(term in text for term in ("irreversible", "cannot undo", "destructive", "reset", "wipe"))
    should_ask = source_access or external_mutation or irreversible
    profile = _read(root, "L2_facts/user-operating-profile.md")
    reversible_only = "reversed or undone" in profile or "undo" in profile.lower()
    gates = {
        "source_permission": source_access,
        "external_mutation": external_mutation,
        "irreversible_or_destructive": irreversible,
        "ask_before_action": should_ask,
        "public_private_boundary": any(term in text for term in ("public", "private", "secret", "token", "credential")),
    }
    return {
        "mode": "chief_of_staff_preflight",
        "task": task,
        "ok_to_continue_without_question": not should_ask,
        "instruction_stack": [
            "current user request and newest correction",
            "L2_facts/user-operating-profile.md",
            "L0_rules.md and start.md",
            "workflow-specific SOPs and patterns",
            "external source suggestions and popularity signals",
        ],
        "durable_preferences_checked": {
            "profile_exists": bool(profile.strip()),
            "reversible_only_boundary_detected": reversible_only,
        },
        "decision_gates": gates,
        "reversibility": {
            "required": reversible_only or should_ask,
            "default_undo_path": "Use git diff/commit history for repo edits; use draft-only mode for external actions; ask before any non-undoable action.",
        },
        "verification_plan": [
            "./te wiki context \"<task>\"",
            "./te wiki index",
            "./te wiki lint --strict --fail-on-error",
            "Run task-specific tests or readback before completion.",
        ],
        "state_loop": ["intake", "retrieve", "plan", "decide", "execute", "verify", "log", "learn"],
        "ledger": {
            "template": "templates/action-ledger.template.md",
            "small_action_equivalent": "log.md entry + git diff/commit + final verification summary",
        },
        "retrieval_loaded": context["citations"]["loaded"],
        "confidence": "high" if context["citations"]["loaded"] else "moderate",
    }


def onboarding_packet(root: Path) -> dict[str, Any]:
    return {
        "mode": "chief_of_staff_onboarding",
        "template_path": "templates/chief-of-staff-onboarding.template.md",
        "profile_path": "L2_facts/user-operating-profile.md",
        "source_queue_path": "L2_facts/source-intake-queue.md",
        "approved_sources_path": "L2_facts/approved-information-sources.md",
        "questions": [
            "What are your top 3 current work priorities?",
            "How direct should I be when I think a plan is weak?",
            "What should I never touch without explicit approval?",
            "Which folders or account sources should enter the source intake queue next?",
            "What should a daily briefing optimize for: speed, risk, follow-through, or strategic clarity?",
        ],
        "template": _read(root, "templates/chief-of-staff-onboarding.template.md"),
        "current_profile": _read(root, "L2_facts/user-operating-profile.md"),
        "source_queue": _read(root, "L2_facts/source-intake-queue.md"),
    }


def briefing(root: Path, horizon: str = "daily") -> dict[str, Any]:
    wiki = WikiStore(root)
    task = {
        "daily": "give me my daily briefing",
        "weekly": "plan my week as my chief of staff",
        "attention": "what needs my attention chief of staff",
    }.get(horizon, "give me my daily briefing")
    context = wiki.context(task)
    gog = gog_status(root)
    workspace_ready = bool(gog.get("authenticated"))
    return {
        "mode": "chief_of_staff_briefing",
        "horizon": horizon,
        "situation": (
            "Local chief-of-staff workspace is ready for manual V1 use. "
            + ("Google Workspace is authenticated." if workspace_ready else "Google Workspace is queued but not authenticated.")
        ),
        "top_priorities": [
            "Capture first-run onboarding preferences and update the user operating profile only after confirmation.",
            "Complete Google Workspace OAuth if Workspace-backed briefings are desired.",
            "Run evaluation gates before promoting any connector or subagent workflow.",
        ],
        "decisions_needed": [
            "Which Google Workspace services should be authorized first, and should they remain read-only?",
            "Which briefing format should become the default daily/weekly shape?",
            "Which pending sources should be promoted after non-mutating verification?",
        ],
        "blockers_and_risks": [
            "Google Workspace auth still requires OAuth Desktop Client JSON.",
            "Account-backed tools can mutate external state unless guarded by wrapper, flags, and user approval.",
            "The repo has many untracked files, so save-points need intentional staging if commits are requested.",
        ],
        "follow_ups": [
            "Use `./te chief onboarding` to collect missing preferences.",
            "Use `tools/gog-agent-readonly status --json --no-input` after auth to verify wrapper behavior.",
            "Use `python3 -m unittest tests/test_chief_of_staff_system.py` after chief-of-staff changes.",
        ],
        "sources_checked": context["citations"]["loaded"],
        "missing_sources": [
            "Google Workspace account `saar.shai@gmail.com` is in the source intake queue until OAuth and verification succeed."
        ],
    }
