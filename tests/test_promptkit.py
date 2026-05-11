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

    def test_prompt_draft_selects_research_adoption_template(self) -> None:
        result = subprocess.run(
            [
                str(ROOT / "te"),
                "prompt",
                "draft",
                "research publications tools github repos and decide what to adopt or test",
                "--format",
                "json",
            ],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=True,
        )
        packet = json.loads(result.stdout)
        self.assertEqual(packet["template"]["slug"], "research-adoption-review")
        slugs = {entry["slug"] for entry in packet["snippets"]}
        self.assertIn("research-source-spectrum", slugs)
        self.assertIn("improvement-axes", slugs)
        self.assertIn("adoption-decision-actions", slugs)

    def test_prompt_draft_selects_incisive_critique_snippets(self) -> None:
        result = subprocess.run(
            [
                str(ROOT / "te"),
                "prompt",
                "draft",
                "create a prompt to critique my plan, lead with the strongest counterargument, verify facts, and give confidence levels",
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
        self.assertIn("strongest-counterargument-first", slugs)
        self.assertIn("verify-facts-and-confidence", slugs)
        self.assertIn("truth-first-pushback", slugs)


if __name__ == "__main__":
    unittest.main()
