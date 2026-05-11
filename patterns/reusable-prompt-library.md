---
schema_version: 2
title: Reusable prompt library
type: pattern
domain: project
tier: procedural
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [projects/prompter/README.md, L3_sops/generate-prompt-from-instruction.md, queries/2026-05-11-onboarding-pass-1.md]
supersedes: []
superseded-by:
tags: [prompter, prompt-library, templates, snippets]
---

# Reusable prompt library

## Use When

Use when the user needs prompts assembled from repeated sections, known company/product context, stable style rules, safety constraints, or reusable task templates.

## Library Shape

- `prompts/library/templates/`: complete prompt skeletons with `{{placeholder}}` variables.
- `prompts/library/snippets/`: reusable prompt sections selected by tags, task words, or explicit slug.
- `./te prompt list`: inspect available templates/snippets.
- `./te prompt draft "<requirement>"`: choose a template and snippets, then render a draft prompt.
- `./te prompt draft "<requirement>" --template <slug> --section <slug> --var key=value`: force exact building blocks.

## Composition Rule

1. Retrieve wiki context for the user's prompt request.
2. Choose the smallest fitting template.
3. Include default snippets for stable style and action boundaries.
4. Include matched snippets only when they change the output.
5. Leave runtime material as placeholders such as `{{source_material}}`.
6. Return a ready-to-use prompt plus any missing variables.

## Starter Snippets

- `clear-chief-of-staff-style`: clear, direct, high-signal output.
- `reversible-action-boundary`: reversible actions only unless approved.
- `wanderland-screenery-context`: company/product priority context.
- `prompt-anatomy-checklist`: prompt construction rules.
- `think-carefully-step-by-step`: Saar's proven deliberation phrase.
- `plan-then-solve`: concise plan before execution.
- `self-check-before-final`: verify against criteria before final answer.
- `compare-alternatives-before-recommendation`: compare plausible approaches before choosing.
- `tool-use-reflect-act`: ReAct-style planning and tool result reflection.

## Related

- [[projects/prompter/README]]
- [[L3_sops/generate-prompt-from-instruction]]
- [[concepts/prompt-anatomy]]
- [[patterns/reasoning-and-planning-prompt-snippets]]
