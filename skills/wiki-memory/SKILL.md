---
name: wiki-memory
description: Alfred's repo-local markdown wiki — progressive retrieval (search → timeline → fetch) and gated writes (verified, reasoned facts only). Use when the task references past work, decisions, memory, "have we done X", project/pursuit facts, or when recording a durable finding. Drives the native `./te wiki` CLI. Sections map to the pursuit forest. Supersedes the old wiki-retrieve + wiki-write skills.
effort: low
tools: [Bash, Read, Write, Glob, Grep]
---

# wiki-memory

Alfred's long-term memory. One skill, two modes: **retrieve** (read) and **write** (gated). The wiki is rooted at the repo root; `./te wiki` (token_economy) is the engine — there is no separate `wiki/` subdir and no second index.

## Sections = the pursuit forest

The wiki's organizing sections correspond to the **trees of pursuits** (`pursuits/`): `wanderland`, `animayte`, `improving-my-use-of-ai`, `collecting-documenting-wisdom`, and their sub-nodes. Every durable page declares which pursuit it serves via a `pursuit:` frontmatter field; each pursuit index page is the landing page for its section and carries an auto-generated rollup of member pages.

- Cross-cutting type-folders (`concepts/`, `patterns/`, `projects/`, `people/`, `queries/`, `L2_facts/`, `L3_sops/`, `raw/`) still hold the pages — `pursuit:` is the section axis layered on top.
- `pursuit:` value = a pursuit slug (`wanderland`, `animayte`, …) or a sub-node slug (`screenery`, `virtual-pet-project`, …). Use `none` for framework/tooling pages that serve no single pursuit.

## Retrieve

Use when the task references past work, decisions, docs, memory, project/pursuit facts, or "have we done X".

1. Read `L1_index.md` first (never the whole wiki).
2. `./te wiki search "<query>"` — inspect compact hits.
3. For relevant hits, `./te wiki timeline "<id>"`.
4. `./te wiki fetch "<id>"` — ≤3 pages first; ≤2 more only if insufficient.
5. For a bounded audited packet: `./te wiki context "<task>"`.
6. Cite page paths/IDs. Never cite a superseded page without noting the newer one.

For a whole pursuit: read `pursuits/<slug>/index.md` (its rollup lists member pages), then fetch the cited pages.

## Write (gated)

Trigger: verified finding · user-confirmed decision · source ingested · reusable procedure · non-trivial failure lesson.

1. Search existing pages first — prefer updating a rich page over creating a thin one.
2. **Content gate:** `./te wiki gate --kind <kind> --file <candidate>` ([`write-gate`](../write-gate/SKILL.md)). Reject → revise or drop; do not bypass.
3. Create: `./te wiki new --template page --title "<title>" --domain "<domain>" --pursuit "<slug>"`.
4. Name pages at domain/category level, not task-specific bug names.
5. Fill v2 frontmatter completely, including `pursuit:`.
6. **Why-clause** (decisions/conventions): body must contain `because…` / `so that…` / `to avoid…` / `in order to…`. Reasonless decisions are rejected by the gate.
7. For procedures/failures: state when it applies + the exact prevention rule.
8. Add ≥2 useful `[[wikilinks]]` (link the page to its `[[pursuits/<slug>]]` node).
9. `./te wiki index` to refresh pointers; `./te wiki rollup` to refresh pursuit rollups.
10. Append `log.md` (most `./te wiki` writes do this automatically).

## Lint

```bash
./te wiki lint --strict --fail-on-error
```

Broken `[[wikilinks]]`, orphans, duplicate titles, stale `verified:`, v2-frontmatter enforcement. Pursuit nodes use the node-schema (`nid`/`children`/`parent`) and are exempt from v2 page enforcement.

## Aging

[`memory-decay`](../memory-decay/SKILL.md) ages `confidence` over time (weekly / `./te wiki decay`). Errors/lessons/SOPs and high-`evidence_count` pages are protected.

## Boundaries

- `raw/` is immutable — append new source notes only, never rewrite.
- No external note apps, home-directory/global agent config, or external wikis (start.md rule).
- Document only after verified execution; claims need provenance.

## Related

- [`write-gate`](../write-gate/SKILL.md) — write precheck.
- [`memory-decay`](../memory-decay/SKILL.md) — confidence aging.
- [`handoff`](../../.claude/skills/handoff/SKILL.md) — session continuity; `/handoff --full` routes durable facts here.
- `schema.md` — page-type + frontmatter contract.
