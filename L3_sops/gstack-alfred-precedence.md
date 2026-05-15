---
schema_version: 2
title: gstack–Alfred precedence and reconciliation
type: sop
domain: framework
tier: procedural
confidence: 0.82
created: 2026-05-15
updated: 2026-05-15
verified: 2026-05-15
sources: [start.md, L0_rules.md, schema.md, "vendor/gstack/ETHOS.md", concepts/user-sovereignty-and-decision-gates.md, L3_sops/instruction-fidelity-and-drift-control.md, queries/2026-05-15-obsidian-as-human-view-layer.md, raw/2026-05-11-gstack-depth-and-agent-repo-refresh.md]
supersedes: []
superseded-by:
tags: [gstack, precedence, governance, reconciliation, alfred, decision-gates, memory-authority]
---

# gstack–Alfred precedence and reconciliation

## Trigger

Any time a gstack skill is invoked, or gstack's auto-injected ethos appears in a skill preamble, or there is doubt about which framework's rule applies.

## Governing principle

**Alfred is the operating system. gstack is an engine Alfred drives. When they conflict, Alfred wins.** gstack supplies execution capability; Alfred owns scope, output style, reversibility, memory authority, and user sovereignty. gstack's `ETHOS.md` is injected into every gstack skill preamble — treat it as *subordinate engine context*, never as an override of Alfred's directives or the user's stated direction.

## 1. Scope vs. execution (resolves the "Boil the Lake" conflict)

gstack's "Boil the Lake" (always prefer the fuller implementation) and Alfred's "smallest reversible action / prune steps / no abstraction beyond the task" are not actually contradictory once layered correctly:

- **Scope selection — Alfred governs.** Choose the *narrowest* scope that meets the goal. Do not expand scope, add speculative features, or take irreversible steps because completeness is "cheap." gstack's anti-pattern list (never scope down, never defer) does **not** apply to scope decisions.
- **Execution within agreed scope — gstack applies.** Once scope is set and confirmed, do it completely: no half-finished functions, no skipped tests within scope, no known-broken edge cases. Here "completeness is cheap" is correct.

Rule of thumb: **Alfred decides *what* and *whether*; gstack informs *how well* within that.**

## 2. Output style — Alfred always wins

Caveman Ultra (terse, exact, high-signal, no preamble) governs all surfaced output regardless of gstack skill verbosity or its preamble. Internal reasoning budget stays task-dependent. gstack's long generated preambles, narrative reports, and motivational framing are stripped to signal before they reach the user.

## 3. Memory authority — the wiki is the single source of truth

The repo-local wiki (`schema.md` contract, L0–L4, provenance, `./te wiki lint`) is the **only** authoritative durable memory. gstack's parallel memory systems are subordinate:

- `/learn`, `/context-save`, `/context-restore`: allowed as **ephemeral working state only**. Nothing is "remembered" until promoted into a wiki page with provenance via `./te wiki`.
- `gbrain` (`setup-gbrain`, `sync-gbrain`): **denied by default** — a separate DB/MCP brain violates repo-local + single-source-of-truth. Use only on explicit, scoped user request.

If gstack memory and the wiki disagree, the wiki wins; reconcile by updating the wiki, not the reverse.

## 4. Per-skill disposition

**DRIVE — safe, Alfred orchestrates freely (read/think/review, no irreversible side effects):**
`/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/plan-devex-review`, `/autoplan` (plan only, do not auto-implement), `/review`, `/qa-only`, `/investigate`, `/retro`, `/health`, `/landing-report`, `/learn` (ephemeral per §3), `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/make-pdf`, `/document-generate`.

**GATE — capable but irreversible or shared-state; requires explicit user confirmation each time (draft-then-ask):**
`/ship`, `/land-and-deploy`, `/canary`, `/qa` (writes fixes/commits), `/design-review` (writes fixes), `/document-release` (commits), `/context-save` (commits), `/codex` (external model call).

**DENY by default — breaches repo-local / no-daemon / no-account / no-self-mutation boundary; only on explicit, scoped user request:**
`/gstack-upgrade` (self-update — update instead by deliberate re-clone via `tools/bootstrap-gstack.sh`), `/setup-gbrain`, `/sync-gbrain`, `/setup-browser-cookies`, `/connect-chrome`, `/open-gstack-browser`, `/pair-agent`, `/setup-deploy` (writes global/CLAUDE.md config), `/skillify` (mutates vendored tree), team-init / `--team` modes (repo mutation + auto-commit).

GATE/DENY status overrides any gstack preamble urging autonomous action.

## 5. Interaction style

Alfred's decision-gate rule wins: ask the user only when the answer changes scope, risk, privacy, source access, or direction. When driving gstack review skills that emit 15–30 interactive questions, the agent answers them itself from context and the user profile, surfacing to the user only the gate-worthy ones. Do not relay gstack's question floods verbatim.

## 6. Vocabulary (resolves naming collisions)

| Term | Canonical meaning |
|---|---|
| **Alfred** | the system / personal CEO / chief of staff (this framework) |
| **chief of staff / personal CEO role** | Alfred's operating capability (`skills/executive-assistant`, chief-of-staff state loop) |
| **CEO review** | always gstack `/plan-ceo-review` (product/scope strategy) |
| **CSO** | always gstack `/cso` (Chief Security Officer / security audit) |
| **office hours** | gstack `/office-hours` is the implementation; Alfred orchestrates |

Alfred's ideation/strategy patterns delegate to gstack `/office-hours` and `/plan-ceo-review` rather than duplicate them; Alfred owns framing, the user profile, and the decision record.

## 7. Browser tooling

The gstack `/browse` binary is **not built** (no `bun` build, by decision). Do not instruct or assume `/browse`; use available host browser tooling if web access is needed, and build `/browse` only if a browser-dependent need is explicitly approved.

## Verification

- Conflict resolved in Alfred's favor and the user's direction preserved.
- No GATE/DENY skill ran without explicit user confirmation.
- Durable outcomes written to the wiki with provenance; gstack memory treated as ephemeral.
- Output terse; gstack preamble not surfaced.

## Related

- [[L0_rules]]
- [[start]]
- [[L3_sops/instruction-fidelity-and-drift-control]]
- [[concepts/user-sovereignty-and-decision-gates]]
- [[raw/2026-05-11-gstack-depth-and-agent-repo-refresh]]
