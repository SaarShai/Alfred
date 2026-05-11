---
schema_version: 2
title: gstack source summary
type: source-summary
domain: tools
tier: episodic
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [https://github.com/garrytan/gstack, https://raw.githubusercontent.com/garrytan/gstack/main/README.md]
supersedes: []
superseded-by:
tags: [source-summary, gstack, executive-assistant, agent-workflows]
---

# gstack source summary

## Source

- Repository: https://github.com/garrytan/gstack
- Verification: GitHub API metadata and README inspected on 2026-05-11.
- Snapshot: 93,583 stars, 13,831 forks, TypeScript, MIT license, default branch `main`, pushed 2026-05-10T13:57:25Z.

## Claims

- gstack presents itself as a Claude Code workflow layer with 23 role-oriented skills and 8 power tools.
- Its useful operating frame is a sprint chain: think, plan, build, review, test, ship, reflect.
- High-fit methods for this repo: `/office-hours` forcing questions, CEO plan review scope modes, implementation alternatives before mode selection, user challenge gates, context save/restore, project learnings, and "search before building."
- Low-fit methods for this repo: global install into home-directory skill paths, Bun/Chromium browser daemon, telemetry prompts, auto-updaters, team-mode commits, and continuous WIP auto-commits.

## Takeaways

- Adopt the methodology, not the runtime.
- Convert gstack-style role skills into repo-local Token Economy patterns and SOPs.
- Keep durable memory inside this wiki instead of `~/.gstack`.
- Keep the user as the decision maker when recommendations would change stated direction.

## Adoption

- Added as evidence for [[projects/executive-assistant/README]], [[patterns/executive-office-hours]], [[patterns/strategic-plan-review]], and [[concepts/user-sovereignty-and-decision-gates]].
- Do not install or vendor gstack unless the user explicitly asks in a future task.

## Related

- [[raw/2026-05-11-executive-assistant-landscape]]
- [[L3_sops/external-source-adoption]]
- [[index]]
