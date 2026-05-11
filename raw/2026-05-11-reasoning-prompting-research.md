---
schema_version: 2
title: reasoning prompting research source summary
type: source-summary
domain: project
tier: episodic
confidence: 0.8
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: []
supersedes: []
superseded-by:
tags: [source-summary, prompt-engineering, reasoning, chain-of-thought, agents]
---

# reasoning prompting research source summary

Primary sources checked on 2026-05-11.

## Sources

- Chain-of-Thought Prompting Elicits Reasoning in Large Language Models: https://arxiv.org/abs/2201.11903
- Large Language Models are Zero-Shot Reasoners: https://arxiv.org/abs/2205.11916
- Self-Consistency Improves Chain of Thought Reasoning in Language Models: https://arxiv.org/abs/2203.11171
- ReAct: Synergizing Reasoning and Acting in Language Models: https://arxiv.org/abs/2210.03629
- Plan-and-Solve Prompting: Improving Zero-Shot Chain-of-Thought Reasoning by Large Language Models: https://arxiv.org/abs/2305.04091
- Tree of Thoughts: Deliberate Problem Solving with Large Language Models: https://arxiv.org/abs/2305.10601
- Large Language Models Understand and Can be Enhanced by Emotional Stimuli: https://arxiv.org/abs/2307.11760
- OpenAI reasoning best practices: https://developers.openai.com/api/docs/guides/reasoning-best-practices
- Anthropic Claude prompting best practices: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- Anthropic think tool engineering note: https://www.anthropic.com/engineering/claude-think-tool

## Findings

- "Let's think step by step" has direct empirical support as a zero-shot chain-of-thought trigger for older large models and reasoning benchmarks.
- Few-shot chain-of-thought demonstrations improve arithmetic, commonsense, and symbolic reasoning in sufficiently large models.
- Plan-and-solve prompting improves on plain zero-shot chain-of-thought by asking for a plan before execution.
- Self-consistency improves chain-of-thought results by sampling multiple reasoning paths and choosing the most consistent answer.
- ReAct-style prompting is useful for agents that alternate reasoning with tool use and observations.
- Tree-of-thought prompting is useful for search-like problems where multiple candidate approaches need exploration and evaluation.
- Modern reasoning models often reason internally; OpenAI recommends direct prompts, clear success criteria, delimiters, and avoiding forced chain-of-thought prompts for reasoning models.
- Anthropic recommends general thinking instructions over overly prescriptive step lists for current Claude thinking models, and recommends self-checking against criteria.
- Anthropic's "think" tool evidence is specific to complex sequential tool-use, policy-heavy, or costly-decision environments; it is not a universal add-on.
- Emotional prompts can improve some benchmarks, but they are less operationally clean than task/success/verification prompts and should be treated as experimental.

## Adoption

- Keep Saar's proven phrase "think carefully, step by step, and..." as a reusable snippet for non-trivial planning/reasoning prompts.
- Prefer variants that ask for private/internal reasoning plus a concise plan or rationale, not long visible chain-of-thought.
- Add plan-then-solve, self-check, alternatives, tool-reflection, and direct-success-criteria snippets.
- Do not make chain-of-thought snippets default for every prompt.
- For reasoning models, prefer success criteria and verification over "think step by step."

## Related

- [[patterns/reasoning-and-planning-prompt-snippets]]
- [[patterns/reusable-prompt-library]]
- [[prompts/library/snippets/think-carefully-step-by-step]]
