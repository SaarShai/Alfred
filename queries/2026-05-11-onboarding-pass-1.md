---
schema_version: 2
title: Onboarding pass 1 - prompt system priority
type: query
domain: project
tier: episodic
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [L3_sops/chief-of-staff-onboarding.md, L2_facts/user-operating-profile.md]
supersedes: []
superseded-by:
tags: [onboarding, prompt-system, wanderland, screenery, chief-of-staff]
---

# Onboarding pass 1 - prompt system priority

## User Answers

- Top work priority: Wanderland, the user's company, and Screenery, its product.
- Pushback style: clear.
- Action boundary: for now, do not do anything that cannot be reversed or undone; only do things that can be undone, where the assistant knows the undo path and has a record.
- Source question: user asked how to do `gog` auth.
- Daily briefing: build it up as the system goes.
- First workflow to build: a prompt-generation system that reuses known snippets, sections, and templates rather than requiring the user to retype repeated prompt material.

## Follow-up

- Implement repo-local prompt library under `prompts/library/`.
- Add `./te prompt` helpers for listing and drafting prompts from templates/snippets.
- Keep Google Workspace auth human-supervised until OAuth credentials are provided and non-mutating verification passes.

## Related

- [[L2_facts/user-operating-profile]]
- [[projects/prompter/README]]
- [[L3_sops/gogcli-workspace-access]]
