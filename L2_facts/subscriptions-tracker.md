---
schema_version: 2
title: Subscriptions tracker
type: fact
domain: project
tier: semantic
confidence: 0.72
created: 2026-05-11
updated: 2026-05-15
verified: 2026-05-15
sources: [user prompt 2026-05-11, L2_facts/user-lists.md]
supersedes: []
superseded-by:
tags: [subscriptions, cost-tracking, operations, executive-assistant]
---

# Subscriptions tracker

## Purpose

Recurring paid services the user runs across personal and business use (Wanderland, Screenery). This is an operational/cost concern, not a taste list — kept separate from [[L2_facts/user-lists]] so Alfred can reason about spend, renewals, and consolidation. Enrich rows with amount/cadence/renewal/owner as the user confirms them.

## Subscriptions

- Cloudflare + Anthropic API
- Adobe
- Figma
- OpenAI
- VPN
- Claude Max
- Freepik — web + API
- Audible
- Google Workspace (wanderland.london and screenery.design)
- Google Cloud
- iCloud (Alicia)
- Google One
- Amazon Photos
- Telegraph

## Provenance

- Captured from direct user instruction in the 2026-05-11 session; split out of `L2_facts/user-lists` on 2026-05-15 because subscription tracking is an operational/cost concern, not a personal-taste list.

## Related

- [[L2_facts/user-lists]]
- [[L2_facts/user-operating-profile]]
- [[projects/executive-assistant/README]]
