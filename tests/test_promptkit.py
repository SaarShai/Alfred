from __future__ import annotations

import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class PromptKitTest(unittest.TestCase):
    def test_prompt_library_lists_templates_and_snippets(self) -> None:
        result = subprocess.run(
            [str(ROOT / "te"), "prompt", "list", "--kind", "templates"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=True,
        )
        packet = json.loads(result.stdout)
        slugs = {entry["slug"] for entry in packet["entries"]}
        self.assertIn("prompt-generator", slugs)
        self.assertIn("screenery-product-review", slugs)

    def test_prompt_draft_uses_screenery_context(self) -> None:
        result = subprocess.run(
            [
                str(ROOT / "te"),
                "prompt",
                "draft",
                "create a prompt to review Screenery positioning",
                "--format",
                "json",
            ],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=True,
        )
        packet = json.loads(result.stdout)
        self.assertEqual(packet["mode"], "prompt_draft")
        self.assertEqual(packet["template"]["slug"], "screenery-product-review")
        self.assertIn("Wanderland", packet["rendered_prompt"])
        self.assertIn("Screenery", packet["rendered_prompt"])

    def test_prompt_draft_can_force_template_and_vars(self) -> None:
        result = subprocess.run(
            [
                str(ROOT / "te"),
                "prompt",
                "draft",
                "make an executive briefing prompt",
                "--template",
                "executive-briefing",
                "--var",
                "audience=team",
                "--format",
                "json",
            ],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=True,
        )
        packet = json.loads(result.stdout)
        self.assertEqual(packet["template"]["slug"], "executive-briefing")
        self.assertIn("briefing for team", packet["rendered_prompt"])

    def test_prompt_draft_selects_reasoning_snippets(self) -> None:
        result = subprocess.run(
            [
                str(ROOT / "te"),
                "prompt",
                "draft",
                "create a prompt for an agent to think carefully step by step and plan before implementing",
                "--format",
                "json",
            ],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=True,
        )
        packet = json.loads(result.stdout)
        slugs = {entry["slug"] for entry in packet["snippets"]}
        self.assertIn("think-carefully-step-by-step", slugs)
        self.assertIn("plan-then-solve", slugs)
        self.assertIn("Think carefully, step by step", packet["rendered_prompt"])


if __name__ == "__main__":
    unittest.main()
