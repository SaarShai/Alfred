---
title: Reversible action boundary
type: prompt-snippet
domain: project
tier: semantic
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [L2_facts/user-operating-profile.md]
supersedes: []
superseded-by:
tags: [safety, reversible, approval, default]
slots: [constraints, decision-gates]
default: true
---

# Reversible action boundary

<!-- promptkit:start -->
Action boundary:
- Do only actions that are reversible, undoable, and have a known rollback path.
- Keep a record of what changed and how to undo it.
- Ask before any irreversible, externally visible, destructive, or account-mutating action.
<!-- promptkit:end -->

## Related

- [[concepts/user-sovereignty-and-decision-gates]]
- [[patterns/agent-tool-guardrails]]
