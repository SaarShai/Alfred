---
name: wiki-write
description: DEPRECATED — merged into wiki-memory (+ write-gate). Do not use.
deprecated: true
---

# wiki-write (retired)

Superseded by **[`wiki-memory`](../wiki-memory/SKILL.md)** (write path) gated by **[`write-gate`](../write-gate/SKILL.md)** (content gate) and aged by **[`memory-decay`](../memory-decay/SKILL.md)**.

New write protocol: `./te wiki gate …` → `./te wiki new --pursuit <slug> …` → `./te wiki index && ./te wiki rollup`.

Folder kept only to preserve history; no longer loaded by `start.md`.
