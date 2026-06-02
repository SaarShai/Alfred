from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from token_economy.delegate import classify, delegation_plan
from token_economy.wiki import WikiStore


ROOT = Path(__file__).resolve().parents[1]


# Curated subset of the live wiki copied into a sealed fixture so retrieval
# assertions stay deterministic. The live wiki keeps growing unbounded personal
# content (the Principles/ aphorism archive, the pursuits/ forest), which injects
# spurious common-word/substring matches (e.g. "network" matching "work") and
# pushes the core operational pages out of the top-k window. These tests exercise
# the ranking *algorithm* against a fixed corpus of substantive pages plus
# representative distractors, not against ever-changing content.
FIXTURE_PAGES = (
    "patterns/daily-weekly-briefing.md",
    "patterns/first-briefing-dry-run.md",
    "patterns/structured-check-ins.md",
    "patterns/chief-of-staff-state-loop.md",
    "L2_facts/user-operating-profile.md",
    "L2_facts/approved-information-sources.md",
    "L2_facts/obligations.md",
    "L3_sops/chief-of-staff-workflow.md",
    "L3_sops/gogcli-workspace-access.md",
    "L3_sops/instruction-fidelity-and-drift-control.md",
    "L3_sops/external-source-adoption.md",
    "L3_sops/approved-source-intake.md",
)


class ChiefOfStaffRetrievalTests(unittest.TestCase):
    """Ranking behavior against a sealed fixture wiki (deterministic)."""

    @classmethod
    def setUpClass(cls) -> None:
        cls._tmp = tempfile.mkdtemp(prefix="cos-wiki-")
        root = Path(cls._tmp)
        for rel in FIXTURE_PAGES:
            dst = root / rel
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(ROOT / rel, dst)
        # A raw/ page that matches the approved-source query, proving raw is
        # excluded from loaded context unless explicitly requested.
        raw_dir = root / "raw"
        raw_dir.mkdir(parents=True, exist_ok=True)
        (raw_dir / "2026-05-01-approved-source-folder-note.md").write_text(
            "# Approved source folder note\n\nNotes about adding this folder as an approved source.\n",
            encoding="utf-8",
        )
        cls.wiki = WikiStore(root)
        cls.wiki.index()

    @classmethod
    def tearDownClass(cls) -> None:
        shutil.rmtree(cls._tmp, ignore_errors=True)

    def loaded_paths(self, task: str) -> set[str]:
        packet = self.wiki.context(task)
        return set(packet["citations"]["loaded"])

    def test_daily_briefing_retrieves_core_pages(self) -> None:
        loaded = self.loaded_paths("give me my daily briefing")
        self.assertIn("patterns/daily-weekly-briefing.md", loaded)
        self.assertIn("L2_facts/user-operating-profile.md", loaded)
        self.assertIn("L2_facts/approved-information-sources.md", loaded)

    def test_preference_memory_retrieves_profile_and_check_ins(self) -> None:
        loaded = self.loaded_paths("remember this work preference")
        self.assertIn("L2_facts/user-operating-profile.md", loaded)
        self.assertIn("patterns/structured-check-ins.md", loaded)

    def test_approved_source_intake_retrieves_registry(self) -> None:
        packet = self.wiki.context("add this folder as an approved source")
        loaded = set(packet["citations"]["loaded"])
        self.assertIn("L3_sops/approved-source-intake.md", loaded)
        self.assertIn("L2_facts/approved-information-sources.md", loaded)
        self.assertFalse(any(path.startswith("raw/") for path in loaded))

    def test_instruction_fidelity_retrieves_drift_controls(self) -> None:
        loaded = self.loaded_paths("make sure you follow my instructions and do not drift")
        self.assertIn("L3_sops/instruction-fidelity-and-drift-control.md", loaded)
        self.assertIn("patterns/chief-of-staff-state-loop.md", loaded)


class ChiefOfStaffSystemTests(unittest.TestCase):
    """End-to-end / CLI behavior against the live repo."""

    @classmethod
    def setUpClass(cls) -> None:
        WikiStore(ROOT).index()

    def test_delegate_routes_chief_of_staff_work(self) -> None:
        route = classify("prepare my weekly briefing from approved sources")
        self.assertEqual(route.worker, "chief-of-staff-worker")
        self.assertTrue(route.parallelizable)

        drift_route = classify("check instruction fidelity and drift control before action")
        self.assertEqual(drift_route.worker, "chief-of-staff-worker")

        plan = delegation_plan("extract follow-ups from these notes for my chief of staff")
        self.assertEqual(plan["route"]["worker"], "chief-of-staff-worker")
        self.assertIn("follow_ups", plan["result_contract"])
        self.assertIn("sources", plan["result_contract"])

    def test_chief_cli_readiness_and_briefing(self) -> None:
        readiness = subprocess.run(
            [str(ROOT / "te"), "chief", "readiness"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            timeout=30,
        )
        self.assertEqual(readiness.returncode, 0, readiness.stderr)
        readiness_packet = json.loads(readiness.stdout)
        self.assertEqual(readiness_packet["mode"], "chief_of_staff_readiness")
        self.assertTrue(readiness_packet["core_pages"]["L2_facts/user-operating-profile.md"])

        briefing = subprocess.run(
            [str(ROOT / "te"), "chief", "briefing", "--horizon", "daily"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            timeout=30,
        )
        self.assertEqual(briefing.returncode, 0, briefing.stderr)
        briefing_packet = json.loads(briefing.stdout)
        self.assertEqual(briefing_packet["mode"], "chief_of_staff_briefing")
        self.assertIn("patterns/daily-weekly-briefing.md", briefing_packet["sources_checked"])

        preflight = subprocess.run(
            [str(ROOT / "te"), "chief", "preflight", "install a global tool and connect Google Workspace"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            timeout=30,
        )
        self.assertEqual(preflight.returncode, 0, preflight.stderr)
        preflight_packet = json.loads(preflight.stdout)
        self.assertEqual(preflight_packet["mode"], "chief_of_staff_preflight")
        self.assertFalse(preflight_packet["ok_to_continue_without_question"])
        self.assertTrue(preflight_packet["decision_gates"]["source_permission"])
        self.assertTrue(preflight_packet["decision_gates"]["external_mutation"])
        self.assertEqual(preflight_packet["ledger"]["template"], "templates/action-ledger.template.md")

    def test_gog_readonly_wrapper_blocks_mutations(self) -> None:
        wrapper = ROOT / "tools" / "gog-agent-readonly"
        self.assertTrue(wrapper.exists())

        version = subprocess.run(
            [str(wrapper), "--version"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            timeout=30,
        )
        self.assertEqual(version.returncode, 0, version.stderr)

        blocked = subprocess.run(
            [str(wrapper), "gmail", "send", "--to", "nobody@example.com", "--subject", "x", "--body", "x"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            timeout=30,
        )
        self.assertEqual(blocked.returncode, 2)
        self.assertIn("blocked command", blocked.stderr)

    def test_parallel_context_lookup_after_missing_index(self) -> None:
        db_path = ROOT / ".token-economy" / "wiki.sqlite3"
        if db_path.exists():
            db_path.unlink()

        queries = [
            "give me my daily briefing",
            "plan my week as my chief of staff",
            "remember this work preference",
            "add this folder as an approved source",
        ]

        def run_context(query: str) -> list[str]:
            result = subprocess.run(
                [str(ROOT / "te"), "wiki", "context", query],
                cwd=ROOT,
                text=True,
                capture_output=True,
                timeout=30,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            return json.loads(result.stdout)["citations"]["loaded"]

        try:
            with ThreadPoolExecutor(max_workers=4) as pool:
                loaded_sets = list(pool.map(run_context, queries))
        finally:
            WikiStore(ROOT).index()

        self.assertEqual(len(loaded_sets), len(queries))
        self.assertTrue(any("patterns/daily-weekly-briefing.md" in paths for paths in loaded_sets))


if __name__ == "__main__":
    unittest.main()
