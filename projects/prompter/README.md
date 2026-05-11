---
schema_version: 2
title: PROMPTER — wiki-driven prompt generation
type: project
domain: project
tier: semantic
confidence: 0.7
created: 2026-05-08
updated: 2026-05-11
verified: 2026-05-11
sources: [start.md, schema.md, patterns/reusable-prompt-library.md, queries/2026-05-11-onboarding-pass-1.md]
supersedes: []
superseded-by:
tags: [prompter, prompt-engineering, knowledge-base, wiki-driven]
---

# PROMPTER — wiki-driven prompt generation

A repo-local wiki and prompt library that teach agents how to translate user instructions into optimal prompts the user will run elsewhere. The deliverable is the wiki, reusable snippets/templates, and the agent workflow that consumes them.

## Goal

Given a user instruction like "write a prompt that does X", an agent retrieves from this wiki — references, preferences, snippets, templates, rules, guidelines, tips — and emits a concrete prompt the user can copy-paste into any LLM.

The wiki is the single source of truth. Agents do not invent prompt-craft from training data; they retrieve, compose, and cite.

## Non-goals

- Not a runtime that executes prompts against models. PROMPTER produces text, the user runs it.
- Not a runtime that calls models. The local `./te prompt` command only assembles text from repo-local templates and snippets.
- Not a prompt repository per topic. It is a knowledge base of *how* to construct prompts, plus reusable building blocks.

## Wiki shape

| folder | purpose |
|---|---|
| `concepts/` | atomic prompt-engineering ideas (one technique per page): role-priming, output-format control, few-shot, decomposition, etc. |
| `patterns/` | reusable composite recipes: extraction pattern, code-review pattern, summarization pattern. |
| `templates/` | fillable prompt skeletons (distinct from Token Economy's wiki-page templates). |
| `prompts/library/templates/` | executable prompt skeletons rendered by `./te prompt`. |
| `prompts/library/snippets/` | reusable prompt sections for stable context, style, constraints, and known facts. |
| `L2_facts/` | durable model-specific facts: token limits, pricing, behavior quirks, refusal triggers. |
| `L3_sops/` | playbooks: the meta-SOP `generate-prompt-from-instruction`, plus task-specific SOPs as they crystallize. |
| `queries/` | answered design questions — "should I use XML tags or markdown?", "when is CoT worth it?". |
| `raw/` | immutable references: papers, vendor docs, blog posts. Filename: `YYYY-MM-DD-slug.md`. |
| `people/` | authors of techniques worth crediting. |

User work preferences live in [[L2_facts/user-operating-profile]]. Prompt-craft ideas live in `concepts/` and reusable prompt blocks live under `prompts/library/`.

## Local prompt kit

Use:

```bash
./te prompt list
./te prompt draft "create a prompt to review Screenery positioning"
./te prompt draft "write an executive briefing prompt" --template executive-briefing --var audience=team
```

The draft command chooses a template, includes default snippets, adds matched snippets such as Wanderland/Screenery context, and leaves runtime material as placeholders.

## Agent workflow (the "use" of this wiki)

See [[L3_sops/generate-prompt-from-instruction]] for the canonical playbook. Summary:

1. Receive instruction.
2. `./te wiki context "<instruction>"` to get audited bounded context.
3. Identify task type → load matching `patterns/` and `concepts/`.
4. Use [[patterns/reusable-prompt-library]] and `./te prompt draft` when reusable sections or templates fit.
5. Apply work preferences from [[L2_facts/user-operating-profile]].
6. Compose prompt; cite wiki paths used.
7. Return prompt + 1-line rationale of which patterns/concepts/templates were applied.

## Status

- 2026-05-08: project scaffolded. Seed pages: this README, [[L3_sops/generate-prompt-from-instruction]], [[concepts/prompt-anatomy]], [[patterns/prompt-from-instruction]], [[templates/prompt-snippet.template]]. Content grows as the user adds references, snippets, and preferences.
- 2026-05-11: added `./te prompt` and a starter reusable prompt library for chief-of-staff style, reversible action boundaries, Wanderland/Screenery context, prompt generation, product review, and executive briefing.
- 2026-05-11: added research-backed reasoning/planning snippets, including Saar's "think carefully, step by step, and..." phrase, plan-then-solve, self-check, alternatives, tool reflection, and reasoning-model success criteria.
- 2026-05-11: added enumerative research/adoption prompting rules and snippets for source spectrum, improvement axes, and adoption decisions.

## Open questions

- Which prompt templates should become default daily-use templates after the first successful Screenery workflows?
- Versioning: when a pattern improves, supersede or update in place? Default per schema: supersede with `superseded-by` link.
