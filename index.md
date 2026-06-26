# Alfred Usage Index

Catalog for a target project that uses Alfred locally. Load only matched pages.

## Startup
- [[start]] — universal agent entrypoint: operating rules, retrieval, context refresh, delegation
- [[L0_rules]] + [[L1_index]] — lean startup memory tiers
- [[schema]] — repo-local markdown wiki contract
- `token-economy.yaml` — local framework config

## Commands
- `./te doctor` — verify local framework health
- `./te wiki search "topic"` — find relevant wiki pointers
- `./te wiki timeline "<id>"` — inspect nearby context
- `./te wiki fetch "<id>"` — load a relevant page
- `./te wiki context "task"` — build an audited bounded context packet
- `./te code map "symbol or path"` — inspect compact code structure before file reads
- `./te wiki lint --strict` — validate wiki pages
- `./te context status` — inspect context budget
- `./te context checkpoint --handoff-template` — create a lean continuation packet
- `./te delegate classify "task"` — classify work for delegation
- `./te delegate document --verified ...` — route verified durable evidence to wiki-documenter
- `./te pa --directive "/pa <prompt>"` — route context-light personal-assistant prompts
- `./te chief readiness` — inspect chief-of-staff pages, retrieval, `gog`, and next checks
- `./te chief onboarding` — print the onboarding packet, profile, and source queue
- `./te chief briefing --horizon daily|weekly|attention` — produce a local manual briefing packet
- `./te prompt list` — inspect reusable prompt templates and snippets
- `./te prompt draft "requirement"` — render a prompt from local templates/snippets

## Wiki Layout
- `raw/` — source summaries and imported evidence
- `projects/` — active target-project state
- `L2_facts/` — verified durable facts
- `L3_sops/` — reusable workflows and runbooks
- `queries/` — durable Q&A
- `L4_archive/` — cold history kept only when useful

## Pursuits tree + dashboard
- [[pursuits/index]] - forest root: 4 pursuit trees as wiki node docs (Wanderland, Animayte, Improving my use of AI, Collecting & documenting wisdom); one doc per node, parent lists children
- `dashboard/index.html` - visual D3 view generated from `pursuits/`; nodes open their doc. System docs: `dashboard/README.md`. Regenerate: `node dashboard/build.js`

## Active Project - Wanderland (pursuit #1)
- [[projects/wanderland/README]] - company + Screenery; node tree at [[pursuits/wanderland]] (work streams: Screenery → Alicia's ownership/AI designer/Orders; Alicia's work; China mfg/distributor partnership; Other → Joff/Stir/Hilton, EquipHotel)

## Active Project - Executive Assistant
- [[projects/executive-assistant/README]] - repo-local chief-of-staff workspace: role, scope, boundaries, operating model
- [[concepts/executive-assistant-operating-model]] - intake, decision, execution, and memory loops
- [[concepts/user-sovereignty-and-decision-gates]] - when the assistant must ask before changing direction or risk
- [[concepts/memory-scoping-and-context-hierarchy]] - scoped, auditable memory layers mapped onto repo-local wiki pages
- [[L2_facts/user-operating-profile]] - confirmed work preferences, communication style, decision preferences, and recurring constraints
- [[L2_facts/user-lists]] - personal-taste lists: comedians, reading, watching (subscriptions split out)
- [[L2_facts/subscriptions-tracker]] - recurring paid services across personal/Wanderland/Screenery; cost/renewal tracking
- [[Principles/README]] - the user's life-principles archive, distributed: one interlinked page per principle + network/top-bunch/decodings/consolidation/sections (supersedes the old user-principles-* pages)
- [[L2_facts/approved-information-sources]] - registry for external folders/docs the assistant may inspect
- [[L2_facts/source-intake-queue]] - candidate folders/docs/accounts waiting for intake and verification
- [[patterns/executive-office-hours]] - idea shaping, prioritization, weekly planning, and forcing questions
- [[patterns/strategic-plan-review]] - premise challenge, alternatives, scope modes, risk review, decision-complete plan
- [[patterns/incisive-expert-communication]] - truth-first style, strongest counterargument, no flattery, confidence, and verification
- [[patterns/proactive-idea-generation]] - when Alfred should proactively surface useful ideas
- [[patterns/assistant-task-routing]] - route requests to `/pa`, PROMPTER, office hours, plan review, wiki-memory, or external coordination
- [[patterns/agent-tool-guardrails]] - source, command, dry-run, approval, verification, and audit guardrails for tools
- [[patterns/agentic-system-best-practices]] - how to evaluate popular agent repos and adopt only reversible, provenance-backed practices
- [[patterns/chief-of-staff-state-loop]] - explicit intake, retrieve, plan, decide, execute, verify, log, and learn loop
- [[patterns/structured-check-ins]] - explicit priority, preference, decision, and follow-up check-ins
- [[patterns/daily-weekly-briefing]] - manual daily/weekly briefing flow and source order
- [[patterns/first-briefing-dry-run]] - dry-run daily briefing, weekly planning, and attention scan before broad source access
- [[L3_sops/chief-of-staff-workflow]] - canonical chief-of-staff workflow and output contracts
- [[L3_sops/instruction-fidelity-and-drift-control]] - trust, drift, reversibility, source-permission, verification, and action-ledger protocol
- [[L3_sops/chief-of-staff-onboarding]] - first-run onboarding, preference capture, and source queue setup
- [[L3_sops/chief-of-staff-evaluation]] - retrieval, delegation, source, tool, regression, and wiki gates before promotion
- [[L3_sops/approved-source-intake]] - safe workflow for adding named external folders/docs to the source registry
- [[L3_sops/gogcli-workspace-access]] - installed gog CLI status, safe defaults, and Google Workspace auth procedure
- [[L3_sops/subagent-dispatch-for-chief-of-staff]] - bounded subagent prompt packets and result contract
- [[L3_sops/gstack-alfred-precedence]] - Alfred-over-gstack precedence, scope-vs-execution, memory authority, and per-skill DRIVE/GATE/DENY table
- `tools/gog-agent-readonly` - repo-local wrapper for guarded Google Workspace read commands after auth
- [[templates/daily-weekly-briefing.template]] - briefing output template
- [[templates/structured-check-in.template]] - check-in output template
- [[templates/chief-of-staff-onboarding.template]] - first-run onboarding capture template
- [[templates/action-ledger.template]] - audit trail for meaningful or higher-risk actions
- [[templates/what-needs-attention.template]] - attention-scan output template
- `skills/executive-assistant/SKILL.md` - local skill entrypoint for chief-of-staff work

## PROMPTER Capability
- [[projects/prompter/README]] - wiki-driven prompt generation, now a capability inside the executive-assistant workspace
- [[L3_sops/generate-prompt-from-instruction]] - canonical playbook agents follow when the user asks for a prompt
- [[concepts/prompt-anatomy]] - structural slots of a well-formed prompt
- [[patterns/prompt-from-instruction]] - default composition pattern (fallback when no specialized pattern fits)
- [[patterns/reusable-prompt-library]] - executable local prompt templates/snippets and `./te prompt` composition workflow
- [[patterns/reasoning-and-planning-prompt-snippets]] - researched snippets for step-by-step reasoning, planning, alternatives, self-checking, and tool reflection
- [[patterns/enumerative-research-prompting]] - grouped source-spectrum, improvement-axis, and adoption-decision wording for broad research prompts
- `prompts/library/templates/` - prompt skeletons rendered by `./te prompt`
- `prompts/library/snippets/` - reusable prompt sections for stable context, style, and constraints
- [[templates/prompt-snippet.template]] - fillable template for new reusable prompt snippets

## Prompt Workflows
- [[prompts/complete-migrate-export]] — export an old project into `complete_migrate_export dot md`
- [[prompts/complete-migrate-import]] — import `complete_migrate_export dot md` into a new Alfred-enabled target folder
- [[prompts/summ]] — context refresh workflow
- [[prompts/summarize-for-handoff]] — handoff packet template

## Recent Answers
- [[queries/2026-05-11-chief-of-staff-readiness-dry-run]] - first readiness briefing for the chief-of-staff system and pending Google Workspace auth
- [[queries/2026-05-11-onboarding-pass-1]] - first onboarding answers: Wanderland/Screenery priority, clear pushback, reversible-only boundary, and prompt system priority
- [[queries/2026-05-11-incisive-expert-style-prompt]] - directness, counterargument-first, verification, confidence, no flattery, and proactive idea preference
- [[queries/2026-05-15-obsidian-as-human-view-layer]] - Obsidian adopted as additive human cockpit; CLI+schema+lint stays the agent/governance authority

## Extension Points
- [[adapters/README]] — project-local agent adapters
- `token_economy/code_map.py` — compact structural code-map provider
- [[raw/2026-05-11-gstack-source-summary]] - gstack methodology source note and local adoption rationale
- [[raw/2026-05-11-gstack-depth-and-agent-repo-refresh]] - deeper gstack inspection plus refreshed popular agent repo best-practices watchlist
- [[raw/2026-05-11-executive-assistant-landscape]] - related repo landscape and adoption matrix
- [[raw/2026-05-11-gogcli-install-source]] - gog CLI install source, checksum, installed path, and auth status
- [[raw/2026-05-11-additional-chief-of-staff-research]] - additional memory, guardrail, MCP, and evaluation research
- [[raw/2026-05-11-reasoning-prompting-research]] - primary-source summary for step-by-step, plan-then-solve, self-consistency, ReAct, and reasoning-model prompting
- [[raw/2026-05-11-enumerative-prompt-wording-research]] - source summary on when broad synonym/category lists help or hurt prompts
- [[raw/2026-05-12-gemini-spark-google-doc]] - source summary and local exports for the Gemini Spark Google Doc principles archive
- [[L3_sops/external-source-adoption]] - safe workflow for reviewing and adapting external sources
- `prompts/subagents/chief-of-staff-*.prompt.md` - prompt packets for briefing extraction, source inventory, research, review, and wiki documentation
- [[templates/page.template]] — wiki page template
- [[templates/source-summary.template]] — source summary template
- [[templates/decision.template]] — decision template
