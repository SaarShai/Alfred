---
schema_version: 2
title: Prompt anatomy
type: concept
domain: patterns
tier: semantic
confidence: 0.5
created: 2026-05-08
updated: 2026-05-08
verified: 2026-05-08
sources: [projects/prompter/README.md]
supersedes: []
superseded-by:
tags: [prompter, prompt-engineering, structure, anatomy]
---

# Prompt anatomy

The minimum structural slots a well-formed prompt fills. Treat as a checklist, not a rigid order — omit slots the task doesn't need.

## Slots

1. **Role / system framing** — who the model is acting as. Optional but high-leverage when the task implies a persona or expertise level.
2. **Task** — single-sentence imperative of what to produce. The most important slot. Vague task = vague output.
3. **Inputs** — what the model will receive. Delimit clearly (XML tags, fenced blocks, or labeled sections). Distinguish prompt-time inputs from runtime placeholders.
4. **Constraints** — must-do, must-avoid, length, tone, audience, scope.
5. **Output format** — exact shape required: JSON schema, markdown sections, list, single line, etc. Specify at least one of: format, length, structure.
6. **Examples (few-shot)** — 1-3 input→output pairs when the task is non-obvious or format-sensitive. Skip if the task is trivial.
7. **Reasoning instruction** — "think step by step", scratchpad, or a structured plan-then-answer split. Use only when the task benefits; pure extraction or formatting tasks usually don't.
8. **Output trigger** — explicit kickoff phrase like "Begin." or a fenced block starter. Often unnecessary on modern models; useful when the model preambles too much.

## Composition rules

- **Smallest effective prompt.** Each slot included must earn its tokens. Drop role framing when the task is generic. Drop few-shot when one good instruction suffices.
- **Inputs delimited explicitly.** Untagged inputs blur with instructions. Use `<input>...</input>` or fenced blocks consistently.
- **Output format before output trigger.** The model decides shape from the last instruction it reads — keep format constraints close to the end.
- **Constraints are positive when possible.** "Respond in 3 bullets" beats "don't be verbose". Negative constraints work but cost more tokens and are easier to violate.
- **One task per prompt.** If two distinct outputs are needed, two prompts (or one prompt with a structured multi-part output schema) — not a vague combined ask.

## When to add what

| Signal | Add slot |
|---|---|
| Task implies expertise or persona | role |
| Output format ambiguous from task alone | output format spec |
| Format-sensitive (JSON, table, exact structure) | examples |
| Multi-step reasoning required | reasoning instruction |
| Domain-specific must-avoid (PII, refusals, scope creep) | constraints |
| Long input that could be confused with instructions | input delimiters |

## Anti-patterns

- Padding with politeness ("please", "if you don't mind"). No measured benefit on modern models; costs tokens.
- Re-stating the task three times. State once, clearly. Repetition signals uncertainty to the model and the user.
- Including format examples but not stating the format rule. Examples without an explicit rule produce drift.
- Mixing instructions and inputs without delimiters. Model treats input text as continued instructions.

## Related

- [[L3_sops/generate-prompt-from-instruction]]
- [[patterns/prompt-from-instruction]]
- [[projects/prompter/README]]

## Open questions

- Optimal slot ordering across model families (Claude vs GPT vs Gemini) — needs `L2_facts/` entries as evidence accumulates.
- When does an XML-tagged structure outperform markdown? Pending `queries/` entry.
