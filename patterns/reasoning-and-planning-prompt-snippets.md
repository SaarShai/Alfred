---
schema_version: 2
title: Reasoning and planning prompt snippets
type: pattern
domain: project
tier: procedural
confidence: 0.8
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [raw/2026-05-11-reasoning-prompting-research.md, queries/2026-05-11-onboarding-pass-1.md]
supersedes: []
superseded-by:
tags: [prompter, reasoning, planning, chain-of-thought, agents]
---

# Reasoning and planning prompt snippets

## Principle

Use reasoning snippets only when the task benefits from deliberation: multi-step planning, ambiguous strategy, math/logic, tool use, code changes, policy-heavy work, or high-cost decisions.

Do not attach "think step by step" to every prompt. For simple tasks it adds latency and clutter. For modern reasoning models, direct success criteria and verification are usually better than forced visible chain-of-thought.

## Snippet Choices

- `think-carefully-step-by-step`: Saar's proven phrase for prompting deliberate planning.
- `plan-then-solve`: ask for a concise plan first, then execution.
- `self-check-before-final`: verify against explicit criteria before final answer.
- `compare-alternatives-before-recommendation`: generate and compare plausible approaches before choosing.
- `tool-use-reflect-act`: after tool output, assess quality and decide next action.
- `reasoning-model-direct-success-criteria`: for reasoning models, avoid manual chain-of-thought and specify target quality.

## Recommended Forms

- General agent prompt: "Think carefully, step by step, and make a brief plan before acting."
- Output-clean prompt: "Reason privately. Return only the answer, concise rationale, and checks performed."
- Planning prompt: "First produce a short plan. Then execute the plan. If new evidence contradicts the plan, update it."
- Review prompt: "Before finalizing, verify the answer against these criteria: {{criteria}}."
- Strategy prompt: "Generate 2-3 viable approaches, compare tradeoffs, then recommend one."
- Tool-use prompt: "After each tool result, check whether it changes the plan before taking the next action."

## Avoid

- Asking for full hidden reasoning transcripts when a concise rationale is enough.
- Emotional pressure as a default prompt tactic.
- "Think step by step" on trivial formatting, extraction, or rewrite tasks.
- Forcing step lists on models that already have dedicated reasoning/thinking controls.

## Related

- [[raw/2026-05-11-reasoning-prompting-research]]
- [[patterns/reusable-prompt-library]]
- [[concepts/prompt-anatomy]]
