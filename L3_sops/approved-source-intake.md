---
schema_version: 2
title: Approved source intake
type: sop
domain: project
tier: procedural
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [L2_facts/approved-information-sources.md, projects/executive-assistant/README.md]
supersedes: []
superseded-by:
tags: [approved-sources, source-intake, access-control, executive-assistant]
---

# Approved source intake

## Trigger

Use when the user says "add this folder," "approve this source," "tap into these docs," or asks the chief-of-staff system to use an external folder or local document source.

## Procedure

1. Ask for or confirm:
   - Absolute path or source identifier.
   - Source label.
   - Access level: `read-only`, `task-specific edits`, or `admin edits`.
   - Off-limits files, folders, secrets, branches, or topics.
   - Whether active agents or humans are working there.
2. Inspect only the named source root:
   - Confirm it exists.
   - Identify local instruction files such as `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursor/rules`, `README.md`, or `start.md`.
   - If it is a git repo, run `git status --short --branch` in that folder.
   - List only shallow root shape needed to identify the source.
3. Record the source in [[L2_facts/approved-information-sources]].
4. Do not read secrets or broad content during intake.
5. For future tasks, read local instructions before using that source.
6. If the source is not ready yet, keep it in [[L2_facts/source-intake-queue]] with the next required step.

## Output

Return:

- Source label and path.
- Access level.
- Off-limits notes.
- Local instructions found.
- Git state, if applicable.
- Remaining risk.

## Related

- [[L2_facts/approved-information-sources]]
- [[L2_facts/source-intake-queue]]
- [[patterns/assistant-task-routing]]
- [[concepts/user-sovereignty-and-decision-gates]]
