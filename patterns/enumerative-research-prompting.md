---
schema_version: 2
title: Enumerative research prompting
type: pattern
domain: project
tier: procedural
confidence: 0.75
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [raw/2026-05-11-enumerative-prompt-wording-research.md]
supersedes: []
superseded-by:
tags: [prompter, research-prompts, enumeration, adoption]
---

# Enumerative research prompting

## Principle

Use enumerations when the task is meant to maximize recall across a broad discovery space. Do not use flat synonym sprawl for ordinary tasks.

The best structure is not one long list. Use grouped axes:

- Source spectrum: where to look.
- Improvement axes: why something matters.
- Adoption actions: what to decide.
- Boundaries: what not to do without approval.
- Output contract: how to report decisions.

## Helpful

Use broad enumerations when:

- The task is research, discovery, landscape review, monitoring, or adoption planning.
- Missing one category would materially reduce recall.
- The categories are grouped under headings.
- The prompt includes stopping criteria and source-quality preferences.
- The action verbs include non-adoption outcomes such as `defer` and `reject`.

## Harmful

Avoid broad enumerations when:

- The task is narrow, operational, or already has a precise source set.
- The list repeats synonyms without adding coverage.
- The prompt says "anything" or "everything" without scope boundaries.
- Research scope and action authority are mixed together.
- The list is so long that important constraints land in the middle of a dense prompt.

## Recommended Form

```text
Research scope:
- Source types: {{source_spectrum}}
- Improvement axes: {{improvement_axes}}

Decision outputs:
- For each candidate, choose one: adopt, implement, install, test, learn from, sign up for, defer, reject.
- Explain rationale, risk, effort, reversibility, and next step.

Boundaries:
- Do not sign up, install globally, spend money, connect accounts, or mutate external systems without approval.
```

## Related

- [[raw/2026-05-11-enumerative-prompt-wording-research]]
- [[patterns/reusable-prompt-library]]
- [[patterns/agent-tool-guardrails]]
