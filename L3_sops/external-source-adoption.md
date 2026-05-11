---
schema_version: 2
title: External source adoption
type: sop
domain: tools
tier: procedural
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [schema.md, raw/2026-05-11-gstack-source-summary.md, raw/2026-05-11-executive-assistant-landscape.md]
supersedes: []
superseded-by:
tags: [source-adoption, research, wiki-write]
---

# External source adoption

## Trigger

Use when the user asks to review an external repo, tool, paper, article, or prompt library and adapt useful ideas into this workspace.

## Procedure

1. Verify current source facts:
   - URL.
   - License.
   - Star/fork counts if GitHub popularity matters.
   - Last updated or pushed date.
2. Read only relevant source sections.
3. Write an immutable source note in `raw/YYYY-MM-DD-slug.md`.
4. Separate decisions:
   - Adopt: methods that fit Token Economy and the active project.
   - Adapt: methods useful after translation into local wiki/SOP form.
   - Reject: runtime dependencies, global installs, risky permissions, or scope creep.
5. Synthesize into local pages:
   - Concepts for stable ideas.
   - Patterns for reusable workflows.
   - SOPs for repeated procedures.
   - Project pages for active state.
6. Update `index.md`, `L1_index.md`, and `log.md`.
7. Verify:
   - `./te wiki index`
   - `./te wiki lint --strict --fail-on-error`
   - Retrieval smoke tests for the intended use cases.

## Rules

- Raw notes are append-only after creation.
- External popularity is evidence, not authority.
- Do not install, vendor, or depend on an external stack unless the user explicitly chooses that path.
- Preserve source URLs and command/date provenance.

## Related

- [[raw/2026-05-11-gstack-source-summary]]
- [[raw/2026-05-11-executive-assistant-landscape]]
- [[skills/wiki-write/SKILL]]
