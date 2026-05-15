---
schema_version: 2
title: Obsidian as the human view layer
type: query
domain: framework
tier: semantic
confidence: 0.8
created: 2026-05-15
updated: 2026-05-15
verified: 2026-05-15
sources: [schema.md, start.md, "https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f", "https://github.com/breferrari/obsidian-mind", "https://gist.github.com/rohitg00/2067ab416f7bbe447c1977edaaa681e2", "https://github.com/forrestchang/andrej-karpathy-skills", "https://github.com/rarce/git-wiki", "https://academy.dair.ai/blog/llm-knowledge-bases-karpathy"]
supersedes: []
superseded-by:
tags: [obsidian, wiki, human-layer, view-layer, governance, alfred]
---

# Obsidian as the human view layer

## Question

The wiki framework is based on the Karpathy / git-wiki / dair.ai knowledge-base approach, several of which recommend Obsidian. Is Obsidian better than the current `./te wiki` + schema system?

## Answer

Not better — a different layer. They are not competitors and not either/or. Both operate on the same substrate: plain markdown + git + wikilink syntax (this vault already uses Obsidian-flavored double-bracket wikilinks). Decision: **keep `./te wiki` + schema as the agent/governance layer; add Obsidian as the human read/light-edit cockpit on the same folder. Strictly additive, zero migration.**

| Layer | Owner | Provides |
|---|---|---|
| `./te wiki` + `schema.md` + lint | the agent (Alfred) | bounded/progressive retrieval, token budgeting, frontmatter contract, provenance, tiered L0–L4 startup, delegation |
| Obsidian | the human | graph view, backlinks, fuzzy search, navigation, light edits |

Obsidian has no concept of bounded context packets, lint-enforced schema, immutable `raw/`, or retrieve-before-reasoning. Replacing the CLI/schema system with Obsidian would be a regression for the agent and cannot drive Alfred. The only case for Obsidian-only is "I don't actually use agent retrieval" — a different question than tool choice.

## Setup

- Open this repo folder directly as an Obsidian vault. No conversion: path-style links (`projects/prompter/README`) and filename links (`L0_rules`) in double brackets resolve as-is.
- `.obsidian/` is gitignored — per-user UI state, not shared.

## Governance (human-edit discipline)

- `./te wiki lint --strict` — not Obsidian — is the schema authority. Run it after human editing sessions.
- Edit through the schema: keep v2 frontmatter intact; do not let Obsidian templates/daily-notes/auto-format strip or mutate it.
- `raw/` is immutable. Browsing is fine; never rewrite a source note in Obsidian.
- New cross-links should use path form (`folder/note` in double brackets); a bare `README` link is ambiguous because many `projects/*/README.md` exist.

## Related

- [[schema]]
- [[start]]
