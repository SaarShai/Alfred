---
schema_version: 2
title: Chief-of-staff readiness dry run
type: query
domain: project
tier: episodic
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [patterns/first-briefing-dry-run.md, L2_facts/user-operating-profile.md, L2_facts/source-intake-queue.md, raw/2026-05-11-gogcli-install-source.md]
supersedes: []
superseded-by:
tags: [briefing, dry-run, chief-of-staff, readiness]
---

# Chief-of-staff readiness dry run

## Situation

The local chief-of-staff workspace is ready for manual-command V1 use. It has work-preference memory, approved-source registry, source-intake queue, onboarding workflow, daily/weekly briefing templates, subagent prompt packets, and regression tests.

Google Workspace access is partially prepared: `gog` is installed and verified, but account auth is blocked until a Google OAuth Desktop Client JSON is provided and stored.

## Top Priorities

- Finish Google Workspace auth only after OAuth credentials and service scopes are explicit.
- Capture the user's first-run onboarding preferences into [[L2_facts/user-operating-profile]].
- Promote sources from [[L2_facts/source-intake-queue]] into [[L2_facts/approved-information-sources]] only after non-mutating verification.
- Keep briefings manual-first until the user requests a concrete automation.

## Decisions Needed

- Which Google Workspace services should be authorized first: read-only Gmail, Calendar, Drive, Docs, Sheets, Tasks, People, or a narrower subset.
- Whether Workspace access should be read-only for V1, with sends/edits still blocked.
- Which onboarding answers should be persisted as durable work preferences.

## Blockers And Risks

- Missing OAuth Desktop Client JSON prevents `gog` account authorization.
- Google Workspace commands include mutating capabilities, so every auth/use should keep `--gmail-no-send`, `--readonly`, and narrow services where possible.
- The repo is largely untracked, so git save-points need careful staging if commits are requested later.

## Follow-Ups

- User provides OAuth Desktop Client JSON or asks to use another connector.
- Run `/Users/za/.local/bin/gog auth credentials set <credentials.json>`.
- Run `/Users/za/.local/bin/gog login saar.shai@gmail.com --services gmail,calendar,drive,docs,sheets,tasks,people --readonly --gmail-no-send`.
- Verify with `gog status`, `gog auth list`, and a non-mutating profile command.

## Recommended Next Actions

1. Answer the onboarding template in [[templates/chief-of-staff-onboarding.template]].
2. Provide the OAuth client JSON for `gog`, or decide to keep Google Workspace queued.
3. Run the first real daily briefing after at least one external source is approved.

## Sources Checked

- [[patterns/first-briefing-dry-run]]
- [[L2_facts/user-operating-profile]]
- [[L2_facts/source-intake-queue]]
- [[raw/2026-05-11-gogcli-install-source]]
