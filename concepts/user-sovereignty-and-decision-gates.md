---
schema_version: 2
title: User sovereignty and decision gates
type: concept
domain: project
tier: semantic
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [raw/2026-05-11-gstack-source-summary.md, raw/2026-05-11-executive-assistant-landscape.md]
supersedes: []
superseded-by:
tags: [decision-gates, user-sovereignty, executive-assistant]
---

# User sovereignty and decision gates

## Summary

The assistant recommends; the user decides. Model confidence and external-source popularity are signals, not authority.

## Gate Types

- Premise gate: the problem framing is unclear or likely wrong.
- Scope gate: the assistant wants to add, remove, merge, or split scope from the user's stated direction.
- Access gate: the task touches an external folder, account, channel, or private data source.
- Risk gate: the task involves destructive commands, security, privacy, finance, legal, or broad irreversible changes.
- Taste gate: multiple good options differ by preference rather than correctness.
- User-challenge gate: multiple sources or models agree the user's direction may be wrong, but the user may have hidden context.

## Defaults

- Ask only when the answer materially changes the plan or risk.
- Present the recommended choice with the reason.
- Preserve the user's stated direction as the default when evidence is ambiguous.
- Never treat popularity as proof; record source metrics as time-stamped evidence.

## Related

- [[patterns/strategic-plan-review]]
- [[patterns/executive-office-hours]]
- [[projects/executive-assistant/README]]
