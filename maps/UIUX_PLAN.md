# Maps dashboard — UI/UX build plan (51 items)

GOAL: Implement all 51 curated UI/UX improvements (from the research sweep) into the
process-maps dashboard, correctly, in dependency order, each verified in the live preview,
with ZERO new runtime dependencies, without breaking existing behaviour or corrupting node
positions/data.

Method: foundation built centrally in the main loop; leaf clusters authored in parallel by a
fleet (read-only against live files) and deconflicted into one ordered change-set; integrated
batch-by-batch in the main loop with preview verification after each batch.

Hard constraints (inline into every agent brief — hooks don't fire in subagents):
- Zero new deps. Vanilla JS + D3 v7 + CSS only. d3 already vendored.
- `prompt()` THROWS in the sandboxed preview iframe; `confirm()` auto-true; `alert()` no-op.
  Use the inline `showNameInput` overlay for text entry.
- NEVER reset deliberate node x/y. No synthetic drags that write positions.
- `render()` CLEARS gNode/gEdge/gLane/gFrame every frame and rebuilds via .data().enter().
  So: animations must be CSS-driven, enter-once (guarded by `seen` Set), or live in the
  never-cleared `gWire` layer. Persistent per-node state (selected, grabbing) is re-applied
  each render from a module-level Set/var.
- build.js is the SOLE producer of maps/data.js from maps-data/*.md. Any data-shape change
  goes in build.js; serve.js mutates the .md, shells out to build.js, re-reads data.js.
- Respect reduced-motion: gate every new animation behind reduceMotion()/calm-mode.

Foundation API (built first, in main loop; leaves target this):
- `selection` : Set<nodeId>. Helpers: `selectClick(evt,id)` (shift/meta toggles, else replace),
  `clearSelection()`. Selected nodes render a `.selring` (offset accent ring), distinct from
  hover (transform lift) and `.hl` (semantic glow).
- Design tokens in :root: `--e1/--e2/--e3` (elevation), `--dur-1/--dur-2`, `--s1..--s4`
  (spacing), `--fs-1..--fs-5` (type scale). New code uses these.

## Sequence (4 phases)

### Phase 0 — Foundation (main loop) — DONE + preview-verified
- [x] F1 Design tokens (elevation/easing/spacing/type-scale CSS vars)
- [x] F2 Selection model (Set + selectClick/clearSelection + Esc/empty-canvas clear)
- [x] F3 Distinct selected-state ring (.selring) — verified: single-click rings 1, shift-click extends, per-node accent

### Phase 1 — Trust + foundation leaves
- [ ] 1 Persistent clickable breadcrumb
- [ ] 2 Live / read-only connection banner
- [ ] 3 Undo snackbar + redo
- [ ] 4 Drag port to empty canvas → create+connect
- [ ] 5 Branch labels (Yes/No) on decision edges

### Phase 2 — Editing spine
- [ ] 6 Marquee multi-select
- [ ] 7 Keyboard ops (delete/duplicate/select-all/nudge/esc)
- [ ] 8 Contextual floating mini-toolbar
- [ ] 9 Align & distribute on selection
- [ ] 10 Alignment helper lines + snap-on-drag
- [ ] 11 Copy / paste across maps
- [ ] 12 Node resize handle (drag corner)
- [ ] 13 First-run empty-state affordance

### Phase 3 — Process legibility + knowledge
- [ ] 14 BPMN terminal rings (start/end)
- [ ] 15 Color-redundant semantics (glyph not hue)
- [ ] 16 Context-menu sectioning + Archive-last
- [ ] 17 Validation lint panel
- [ ] 18 Hover-preview a SoT ghost
- [ ] 19 Reverse backlinks ("cited by N")
- [ ] 20 Inline [[ citation autocomplete
- [ ] 21 Broken-citation repair panel
- [ ] 22 Hover-revealed ports + valid/invalid coloring
- [ ] 23 Magnetic connect (target arms + snaps)
- [ ] 24 Smoothstep orthogonal edge routing
- [ ] 25 Self-loop arcs + draggable waypoints

### Phase 4 — Polish, command, navigation, reach
- [ ] 26 Quantized type scale + secondary de-emphasis (adopts F1)
- [ ] 27 Tonal-fill grouping (drop redundant dashed)
- [ ] 28 Cmd+K command palette
- [ ] 29 Fuzzy matcher (rank + highlight)
- [ ] 30 Shortcut cheat-sheet on ?
- [ ] 31 Coachmark on drag-from-port
- [ ] 32 Cmd+F find-and-fly to any node
- [ ] 33 Zoom HUD (% + fit/100%/zoom-to-selection)
- [ ] 34 Minimap + draggable viewport rect
- [ ] 35 Multi-map Home overview
- [ ] 36 Immersive drill (double-click zoom-in vs PiP)
- [ ] 37 Zoom-aware level-of-detail
- [ ] 38 State-change pulse-once on edits
- [ ] 39 Hover-intent debounce
- [ ] 40 Spring easing via CSS linear() for one-shot reveals
- [ ] 41 True spring physics (drag-release / connect-snap)
- [ ] 42 Container-transform PiP open/close
- [ ] 43 FLIP-animated auto-tidy
- [ ] 44 Radial / marking menu (long-press)
- [ ] 45 Reduced-motion / calm-mode audit
- [ ] 46 A11y pass (ARIA roles, focusable nodes, live region, focus-trapped dialogs)
- [ ] 47 Touch / pointer parity (long-press menu, tap ports, pinch-zoom)
- [ ] 48 Viewport culling + SSE/render throttle
- [ ] 49 Save-conflict guard for the open notes drawer

(51 = 3 foundation + 5 + 8 + 12 + 23. Items renumbered here by build order.)

## Integration log (main-loop, preview-verified per batch)

Master plan = 9 deconflicted batches (fleet output w6a3wlw6j). Status:
- [x] Foundation F1–F3 — tokens, selection model, selection ring. VERIFIED.
- [x] **Batch 1** (shared foundations): 1 breadcrumb · 26 type-scale (light pass) · 27 tonal fills ·
      29 fuzzy matcher · 45 calm-mode/motionAllowed · 46 a11y (svg role, live region, focusable
      nodes, dialog roles, focus-trap). VERIFIED: no console errors; breadcrumb "⌂ Home › Layers";
      calm halts body drift (drift→none→drift); nodes tabindex+aria; dialogs role=dialog.
- [x] **Batch 2** (conn-status chip + SSE throttle + viewport culling) — 2, 48. VERIFIED: "● Live"
      chip renders; SSE coalesced (80ms debounce); cull predicate proven (visible@origin, culled@+5000,
      restored); zoom handler now re-renders so culling re-applies on pan. No errors.
- [x] **Batch 3** (zoom HUD + minimap + LOD) — 33, 34, 37. VERIFIED: HUD live % (wheel→152%/29%),
      LOD toggles `lod-far` at k<0.55, minimap renders node rects + draggable viewport rect.
      TWO BUGS CAUGHT + FIXED: (a) the new minimap `<svg>` became the FIRST svg so `d3.select('svg')`
      grabbed it (main canvas blank) — fixed by id-ing the main svg `#map-svg` + scoping its CSS/selection;
      (b) per-tick `scheduleRender()` in the zoom handler stormed render and fought programmatic zoom
      transitions (fit/zoomTo) → moved reculling to the zoom `'end'` event. NOTE: rAF transitions don't
      tick in headless preview eval (harness limit), so Fit/preset buttons verified by code, not eval.
- [x] **Batch 4** (editing spine) — 6 marquee · 8 contextual toolbar · 9 align/distribute · 12 resize
      grip · 10 snap-on-drag + group-drag · 13 empty-state. VERIFIED: click→ring+grip+toolbar; shift-
      marquee→multi-select (2 nodes)→toolbar `.multi` + align cluster visible; Esc clears; N opens add
      input (cancellable). Rewrote 8/9 (author bugs: Math.avg, random type-change, non-batching
      nodeStyle). Added group-drag (drag a member moves all selected) + zoom-filter shift-guard
      (shift-drag = marquee, not pan) + marquee trailing-click guard. align/distribute/resize NOT run
      live (they persist x/y/scale — won't mutate real positions in a test); logic reviewed.
- [ ] Batch 5 (connections + server changes) — 4,22,23,25,24,5,14,15  ← only batch touching serve.js/build.js
- [ ] Batch 6 (motion on node chain) — 39,38,41,43,42,44
- [ ] Batch 7 (keyboard/command surfaces) — 28,32,7,11,3,30,47
- [ ] Batch 8 (knowledge/SoT + home + drill + save-guard) — 18,19,20,21,35,36,49
- [ ] Batch 9 (validation lint panel) — 17
