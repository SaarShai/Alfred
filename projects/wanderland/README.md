---
schema_version: 2
title: Wanderland — company and work streams
type: project
domain: project
tier: semantic
confidence: 0.6
created: 2026-06-02
updated: 2026-06-02
verified: 2026-06-02
sources: [L2_facts/user-operating-profile.md, user prompt 2026-06-02]
supersedes: []
superseded-by:
tags: [wanderland, screenery, hospitality, partnerships, alfred, pursuit-1]
---

# Wanderland

Pursuit #1 (top priority). The company that makes the **Screenery** product. Living scaffold — nodes get added and changed as work proceeds. Fill detail on demand; do not invent.

## Work streams

```
Wanderland
├─ Screenery — the product
│   ├─ Alicia's ownership — materials / supply
│   │   ├─ foam padding
│   │   ├─ glue
│   │   └─ sheets stock
│   ├─ AI designer — AI folder/project for editing Illustrator files
│   │   ├─ finalize file checklist
│   │   ├─ file ledger — final set list · artboards/sheets breakdown · production notes
│   │   └─ assembly manual/instructions (per design)
│   └─ Orders — existing + incoming client orders
├─ Chinese manufacturer / distributor partnership
└─ Other
    ├─ Joff (Stir / Hilton)
    └─ EquipHotel
```

### Screenery

| Node | What it is | Status |
|---|---|---|
| Alicia's ownership | Alicia owns Screenery materials/supply: foam padding, glue, sheets stock. | active; detail TBD |
| AI designer | The `screenery-lean` workspace: model-agnostic plan→execute→verify→learn loop for editing Screenery Illustrator `.ai` files. Claude plans, Gemini (Antigravity) executes via the `screenery-design` CLI. | active; see below |
| AI designer → finalize file checklist | Checklist to finalize a design file. **Exists:** `runbooks/file-review-checklist.md`. | confirm = this |
| AI designer → file ledger | Per-design ledger: final set list, artboards/sheets breakdown, production notes. **Partial:** `designs/birthday/ledger.md` exists; not yet rolled to all designs. | extend to all designs |
| AI designer → assembly manual | Assembly manual/instructions, one per design. **Gap:** no per-design manual found; closest is `runbooks/pdf-instruction-extraction.md`. | likely to build |
| Orders | Existing and incoming client orders. | active; detail TBD |

(Inference, unconfirmed: Screenery is a physical product built from glued foam padding + sheet stock — implied by the materials list.)

**Location & access** (user granted read access 2026-06-02; `~/Documents` is Drive-synced — read-only, no folder moves/renames):

- Current working folder: `~/Documents/screenery-lean` — the AI designer. Orientation: `README.md`, `INDEX.md`, `AGENTS.md` (rules), `DESIGN.md`. Tool: `cli/bin/screenery-design`. Designs: birthday, cafe, castle, festive, novotel-marine, san-francisco-tram, space.
- Previous project (reference only): `~/Documents/Master Screenery 3.5` — may hold still-relevant info. Drive conflict artifacts present (`* (1).md`, zero-byte) — not authoritative.

### Wanderland — other

| Node | What it is | Status |
|---|---|---|
| Chinese manufacturer / distributor partnership | Manufacturing / distribution partnership in China. | needs detail |
| Other → Joff (Stir / Hilton) | Joff, associated with Stir / Hilton. | needs detail |
| Other → EquipHotel | EquipHotel. (Likely the Paris hospitality trade fair — low confidence, unconfirmed.) | needs detail |

## Open questions

- Confirm Screenery one-line definition (physical product from foam + sheets?).
- AI designer — where does it live (folder/repo path), what does the workflow do?
- Orders — where tracked (file, sheet, system)?
- Scope of the Chinese manufacturer/distributor partnership (stage, counterpart, deliverable)?
- Who is Joff; what is the Stir / Hilton angle?
- EquipHotel — confirm what it is and Wanderland's involvement.

## Related

- [[L2_facts/user-operating-profile]]
- [[projects/executive-assistant/README]]
- [[index]]
