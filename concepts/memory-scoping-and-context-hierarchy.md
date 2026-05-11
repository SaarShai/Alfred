---
schema_version: 2
title: Memory scoping and context hierarchy
type: concept
domain: project
tier: semantic
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [raw/2026-05-11-additional-chief-of-staff-research.md, L2_facts/user-operating-profile.md, L2_facts/approved-information-sources.md]
supersedes: []
superseded-by:
tags: [memory, context, chief-of-staff, executive-assistant]
---

# Memory scoping and context hierarchy

## Summary

Chief-of-staff memory should be scoped, editable, and auditable. The system should know which memories are always relevant, which are source-specific, which are temporary, and which are only retrievable evidence.

## Local Scopes

Map external memory-system ideas into local wiki scopes:

| Scope | Local home | Use |
|---|---|---|
| User scope | [[L2_facts/user-operating-profile]] | Confirmed work preferences and decision style |
| Agent scope | [[skills/executive-assistant/SKILL]] and [[projects/executive-assistant/README]] | Chief-of-staff operating mode |
| App/source scope | [[L2_facts/approved-information-sources]] | What external sources may be used and how |
| Run scope | `queries/` or handoff packets | Temporary briefing or project run facts |
| Archival evidence | `raw/` | Immutable source summaries and provenance |
| Procedures | `L3_sops/` | Reusable execution paths |

## Hierarchy

1. Always-load only the smallest stable instructions: `start.md`, `L1_index.md`, and matching skill entrypoints.
2. Use L2 facts for verified durable memory.
3. Use patterns/SOPs for repeatable workflows.
4. Use source registry before external context.
5. Use raw notes only when provenance or external research is explicitly relevant.
6. Use broad RAG/graph systems only after local wiki retrieval is no longer enough.

## Memory Write Rules

- Every memory write needs scope, provenance, and confirmation level.
- Temporary run facts should expire into `queries/` or disappear from active context.
- Changing facts should supersede older facts instead of silently overwriting them.
- External-source facts are not user preferences.
- Account-backed facts are not approved sources until source intake succeeds.

## Related

- [[patterns/structured-check-ins]]
- [[L2_facts/user-operating-profile]]
- [[L2_facts/approved-information-sources]]
- [[raw/2026-05-11-additional-chief-of-staff-research]]
