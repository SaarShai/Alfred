---
name: write-gate
description: Decide whether a candidate fact deserves persistent wiki memory. Use before `./te wiki new`, before editing L0_rules/L1_index/L2_facts/L3_sops, or any cross-session store. Scores content on signal (decisions / errors / architecture / code / numbers) and rejects reasonless decisions (must embed because… / so that… / to avoid…). Prevents memory pollution at source.
effort: low
tools: [Bash, Read, Grep]
pulse_reminder: before writing durable memory, run write-gate. Reasonless decisions and trivial recaps don't earn a page.
---

# write-gate

Content-quality gate for Alfred's wiki. Sits between "this should be remembered" and the actual write. Companion to [`wiki-memory`](../wiki-memory/SKILL.md) (entrance) and [`memory-decay`](../memory-decay/SKILL.md) (aging).

Two-layer policy:

1. **Execution gate** — fact came from an action that *executed* and *succeeded*. Plans don't earn pages. Already enforced by `token_economy/wiki.py` + `verification-before-completion`.
2. **Content gate** (this skill) — fact has signal AND, if it's a decision/convention, gives a reason.

## When to call

Before any persistent write:

- `./te wiki new …` — the wiki write path
- direct edits to `L0_rules.md`, `L1_index.md`, `L2_facts/`, `L3_sops/`, `schema.md`, `CLAUDE.md`
- pursuit-tree node edits under `pursuits/`

Trigger phrases: "remember that…", "log this…", "add to memory", "record…", "write a note about…", "this should go in the wiki".

## How it scores

Signal score = sum of weighted features. Threshold defaults to **3.0** (override in `L0_rules.md` or `write_gate_config.yaml`). Decisions/conventions additionally **must** embed a why-clause (`because` / `so that` / `to avoid` / `in order to` / `due to` / `in favor of` / `rather than` / `the reason`). `since` is rejected (temporal). Decisions without a why-clause are rejected outright regardless of score.

Full feature/weight table and lineage (ogham-mcp signal-score; codenamev/claude_memory why-clause) live in the source: `tools/write_gate.py` header.

## CLI

```bash
# native passthrough (preferred — matches Alfred's ./te idiom)
./te wiki gate --kind decision --text "We chose pgvector over Qdrant because dev parity"

# direct tool
python3 skills/write-gate/tools/write_gate.py score   --kind fact     < candidate.md
python3 skills/write-gate/tools/write_gate.py explain  --kind decision --text "…"
python3 skills/write-gate/tools/write_gate.py gate      --kind decision --file ./candidate.md && echo write || echo reject
```

Exit: `0` pass · `1` rejected · `2` usage error.

## Protocol

1. Run `./te wiki gate --kind <kind> --file <candidate>` (or `--text`).
2. Exit 0 → proceed with `./te wiki new …`.
3. Exit 1 → read the explanation. Revise (add the reason, cite evidence, drop filler) or drop the write. Do not bypass.
4. Bypass only on explicit user override ("save it anyway"); record the override in `log.md`.

## What it prevents

Reasonless decisions, transcript recaps, speculation-as-fact, trivia inflated into procedures → noisy memory → wrong context injected → worse answers.

## Related

- [`wiki-memory`](../wiki-memory/SKILL.md) — owns the write path; this is its precheck.
- [`verification-before-completion`](../verification-before-completion/SKILL.md) — execution-gate sibling.
- [`memory-decay`](../memory-decay/SKILL.md) — what happens to memories after they pass.
