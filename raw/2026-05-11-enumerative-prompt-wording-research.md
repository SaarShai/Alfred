---
schema_version: 2
title: enumerative prompt wording research source summary
type: source-summary
domain: project
tier: episodic
confidence: 0.75
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: []
supersedes: []
superseded-by:
tags: [source-summary, prompt-engineering, research-prompts, enumeration, specificity]
---

# enumerative prompt wording research source summary

Primary and official sources checked on 2026-05-11.

## Sources

- OpenAI prompt generation guide: https://developers.openai.com/api/docs/guides/prompt-generation
- Anthropic prompt engineering overview: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview
- Microsoft prompt engineering techniques: https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/prompt-engineering
- OpenAI practical guide to building agents: https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf
- The Prompt Report: A Systematic Survey of Prompt Engineering Techniques: https://arxiv.org/abs/2406.06608
- Lost in the Middle: How Language Models Use Long Contexts: https://arxiv.org/abs/2307.03172

## Findings

- Enumerating categories can help when the task is recall-oriented or research-oriented, because it makes implicit source types, artifact types, and output expectations explicit.
- OpenAI's prompt-generation guide favors clear, specific language; keeping user-provided details; preserving constants such as rubrics and examples; and avoiding unnecessary or bland instructions.
- Anthropic frames prompt engineering around controllable success criteria, clear prompting, examples, structure, role, thinking, and chaining.
- Microsoft examples show task decomposition, explicit output structure, search-query generation, few-shot examples, and citation requirements as practical ways to reduce ambiguity.
- OpenAI's agent guide says high-quality agent instructions reduce ambiguity, should break down dense resources, define clear actions, and capture common edge cases.
- The Prompt Report supports treating prompt engineering as a taxonomy of techniques rather than magic phrasing; structured categories and technique selection matter.
- Lost-in-the-Middle evidence means longer context can degrade use of information in the middle, especially when prompts become long and unstructured.

## Answer

Saar's phrases are directionally useful for a weekly research/adoption agent, but the raw form is too flat. The better form is grouped enumerations:

- `source spectrum`: publications, posts, papers, guides, release notes, repos, tools, plugins, frameworks, platforms, skills, examples.
- `improvement axes`: speed, productivity, quality, reliability, safety, cost, leverage, output quality, workflow fit.
- `adoption actions`: adopt, implement, install, test, learn from, sign up for, defer, reject.

Do not use huge synonym lists as a single sentence unless recall matters more than precision. Avoid "any other piece of information" without boundaries, because it weakens stopping criteria and can invite low-signal browsing.

## Adoption

- Add a reusable prompt pattern for bounded enumerative research wording.
- Add source-spectrum, improvement-axis, and adoption-decision snippets.
- Update weekly automation wording to use grouped scope and decision gates rather than flat synonym sprawl.

## Related

- [[patterns/enumerative-research-prompting]]
- [[prompts/library/snippets/research-source-spectrum]]
- [[prompts/library/snippets/improvement-axes]]
- [[prompts/library/snippets/adoption-decision-actions]]
