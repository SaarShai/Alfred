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
├─ Alicia's work
├─ Chinese manufacturer / distributor partnership
└─ Other
    ├─ Joff (Stir / Hilton)
    └─ EquipHotel
```

### Screenery

| Node | What it is | Status |
|---|---|---|
| Alicia's ownership | Alicia owns Screenery materials/supply: foam padding, glue, sheets stock. | active; detail TBD |
| AI designer | An AI folder/project for editing Illustrator (.ai) files. | active; see below |
| AI designer → finalize file checklist | Checklist to finalize a design file. | needs detail |
| AI designer → file ledger | Per-design ledger: final set list, artboards/sheets breakdown, production notes. | needs detail |
| AI designer → assembly manual | Assembly manual/instructions, one per design. | needs detail |
| Orders | Existing and incoming client orders. | active; detail TBD |

(Inference, unconfirmed: Screenery is a physical product built from glued foam padding + sheet stock — implied by the materials list.)

**Access** (granted 2026-06-02): permitted to read these folders **when relevant** — do not pre-load or let them inform work until a task calls for it. `~/Documents` is Drive-synced — read-only, no folder moves/renames.

- `~/Documents/screenery-lean` — current working folder.
- `~/Documents/Master Screenery 3.5` — previous project; reference only.

### Wanderland — other

| Node | What it is | Status |
|---|---|---|
| Alicia's work | Wanderland-level work stream owned by Alicia — distinct from her Screenery-materials ownership above. Domain TBD. | needs detail |
| Chinese manufacturer / distributor partnership | Manufacturing / distribution partnership in China. | needs detail |
| Other → Joff (Stir / Hilton) | Joff, associated with Stir / Hilton. | needs detail |
| Other → EquipHotel | EquipHotel. (Likely the Paris hospitality trade fair — low confidence, unconfirmed.) | needs detail |

## Dashboard

Pursuits dashboard — **a forest**: all 4 main pursuits as separate trees on one screen (Wanderland is one of them; the others: Animayte, Improving my use of AI, Collecting & documenting wisdom). D3 collapsible trees, offline. Navigable nodes only; no access info.
Click a node to collapse/expand · scroll to zoom · drag to pan · `#` badge = hidden children · non-root labels truncate (full text on hover).

- **Open**: `dashboard/index.html` (double-click, or `open dashboard/index.html`).
- **Edit the trees** (single source of truth, one `#` heading per tree): [dashboard/pursuits.md](../../dashboard/pursuits.md)
- **Regenerate** after editing the source:
  ```bash
  node dashboard/build.js   # pursuits.md -> dashboard/data.js
  ```
- Files: `index.html` + `app.js` (D3 viewer) · `data.js` (generated) · `vendor/d3.min.js` (vendored, offline) · `build.js` (md→data) · `serve.js` (local static server for previews).

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
