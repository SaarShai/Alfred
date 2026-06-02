---
name: memory-decay
description: Apply time-based confidence decay to wiki pages weekly/monthly or before a wiki audit. Triggers on "/decay", "audit the wiki", "are these facts stale?". Old unverified facts should not retrieve with the same weight as fresh ones. Errors / lessons / SOPs / high-evidence pages bypass decay (protection class). Dry-run by default; apply only with --apply.
effort: low
tools: [Bash, Read, Glob]
pulse_reminder: stale facts retrieved as fresh are worse than missing facts. Decay weekly; protect error notes.
---

# memory-decay

Time-based confidence decay for Alfred's wiki pages. Companion to [`write-gate`](../write-gate/SKILL.md) (controls what enters) — this controls how confidence ages.

Default model: **exponential, half-life ≈ 405 days (5% per 30 idle days)**.

```
λ = ln(2) / halflife_days
confidence_new = confidence_old * exp(-λ * days_idle)
days_idle      = today - max(verified, updated, created)
```

## Scope (PROMPTER-adapted)

Scans the wiki rooted at repo root, **skipping** `.git`, `.token-economy`, `vendor`, `.claude` (incl. git worktrees), `__pycache__`, `node_modules` — same exclusion set as `token_economy/wiki.py`, so decay touches exactly what `./te wiki` indexes.

## Protection class

A page never has its confidence rewritten when ANY of:

- frontmatter `type:` ∈ {`error`, `lesson`, `sop`, `procedure`}
- frontmatter `protected: true`
- `evidence_count` ≥ 3
- lives under `L0_rules.md`, `L3_sops/`, or `raw/` (immutable)

Pursuit-tree nodes (`pursuits/`) carry no `confidence` field → silently skipped.

## When to run

- Weekly for active pursuits; before a wiki audit; after importing a batch.
- Never per-prompt — decay is amortized, not a per-turn computation.
- **First run after import will flag many pages** (most predate their last verify). Expected; review the dry-run before `--apply`.

## CLI

```bash
# native passthrough (preferred)
./te wiki decay                 # dry-run on repo root
./te wiki decay --apply         # rewrite confidence

# direct tool
python3 skills/memory-decay/tools/decay.py --root . --json
python3 skills/memory-decay/tools/decay.py --root . --halflife-days 365
python3 skills/memory-decay/tools/decay.py --root . --archive-candidates 0.3
```

## What it changes

Only the `confidence:` field of v2 pages. Never body, other fields, file mtime (preserved via `os.utime`), or protected pages. Does **not** auto-archive — flags candidates with `--archive-candidates`; moving to `L4_archive/` is human-supervised.

## Anti-patterns

- Don't decay per prompt. Don't decay below 0.05 (archive instead). Don't combine decay with deletion. If you never bump `evidence_count` on retrieval, lengthen the half-life so the wiki doesn't self-erase.

## Related

- [`write-gate`](../write-gate/SKILL.md) — entrance bouncer.
- [`wiki-memory`](../wiki-memory/SKILL.md) — what this ages.
- `/consolidate-memory` (Anthropic) — merge/dedup companion.
