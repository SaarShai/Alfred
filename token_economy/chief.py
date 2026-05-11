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
    "L3_sops/chief-of-staff-workflow.md",
    "L3_sops/chief-of-staff-onboarding.md",
    "L3_sops/chief-of-staff-evaluation.md",
    "L3_sops/gogcli-workspace-access.md",
]


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
            "Capture onboarding preferences with `./te chief onboarding`.",
            "Provide Google OAuth Desktop Client JSON before promoting Workspace access.",
            "Use `tools/gog-agent-readonly` for agent-side Workspace reads after auth.",
            "Run `./te chief briefing --horizon daily` before the first real source-backed briefing.",
        ],
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
