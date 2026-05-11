---
schema_version: 2
title: Chief-of-staff evaluation
type: sop
domain: project
tier: procedural
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [raw/2026-05-11-additional-chief-of-staff-research.md, tests/test_chief_of_staff_system.py]
supersedes: []
superseded-by:
tags: [evaluation, tests, chief-of-staff, executive-assistant]
---

# Chief-of-staff evaluation

## Trigger

Use before promoting a new chief-of-staff capability, source, connector, memory rule, or subagent packet into regular use.

## Evaluation Gates

1. Retrieval gate:
   - `./te wiki context "<trigger>"`
   - Confirm the intended pages load and raw sources are gated unless requested.
2. Delegation gate:
   - `./te delegate classify "<task>"`
   - Confirm the worker, parallelization flag, context policy, and result contract.
3. Source gate:
   - Confirm source exists in [[L2_facts/approved-information-sources]] or remains in [[L2_facts/source-intake-queue]].
4. Tool guardrail gate:
   - Confirm read-only/dry-run/no-send flags or an equivalent local guard.
5. Regression gate:
   - `python3 -m unittest tests/test_chief_of_staff_system.py`
6. Wiki gate:
   - `./te wiki index`
   - `./te wiki lint --strict --fail-on-error`
7. Chief CLI gate:
   - `./te chief readiness`
   - `./te chief briefing --horizon daily`

## Promotion Criteria

- No broken links.
- No unapproved source access.
- No hidden broad scans.
- No account mutations without explicit user approval.
- New capability has at least one retrieval or classifier test when practical.
- Durable memory changes cite source, date, and verification command.

## Related

- [[patterns/agent-tool-guardrails]]
- [[concepts/memory-scoping-and-context-hierarchy]]
- `tests/test_chief_of_staff_system.py`
- [[raw/2026-05-11-additional-chief-of-staff-research]]
