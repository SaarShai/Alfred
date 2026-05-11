---
schema_version: 2
title: First briefing dry run
type: pattern
domain: project
tier: procedural
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [patterns/daily-weekly-briefing.md, templates/daily-weekly-briefing.template.md, templates/what-needs-attention.template.md]
supersedes: []
superseded-by:
tags: [briefing, dry-run, chief-of-staff, executive-assistant]
---

# First briefing dry run

## Trigger

Use when validating the chief-of-staff experience before connecting broad sources or automations.

## Flow

1. Retrieve [[L2_facts/user-operating-profile]] and [[L2_facts/approved-information-sources]].
2. Use only the current repo and approved sources.
3. Produce three short drafts:
   - daily briefing
   - weekly planning
   - what needs attention
4. Mark every missing data point as `needs source` instead of guessing.
5. Ask which format should become the user's default.

## Output

- Daily briefing draft: use [[templates/daily-weekly-briefing.template]].
- Weekly planning draft: same template with one-week horizon.
- Attention scan: use [[templates/what-needs-attention.template]].
- Missing sources and recommended source-intake queue updates.

## Related

- [[patterns/daily-weekly-briefing]]
- [[L3_sops/chief-of-staff-onboarding]]
- [[L2_facts/source-intake-queue]]
