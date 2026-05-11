---
schema_version: 2
title: Pattern — prompt-from-instruction
type: pattern
domain: patterns
tier: procedural
confidence: 0.5
created: 2026-05-08
updated: 2026-05-08
verified: 2026-05-08
sources: [concepts/prompt-anatomy.md, L3_sops/generate-prompt-from-instruction.md]
supersedes: []
superseded-by:
tags: [prompter, pattern, default, generic]
---

# Pattern — prompt-from-instruction

The default composition pattern when no task-specific pattern fits. Acts as the fallback recipe inside [[L3_sops/generate-prompt-from-instruction]].

## When to use

- User instruction does not match any specialized `patterns/` entry.
- Task is general-purpose: explanation, transformation, generation, classification on free-form input.

If a more specific pattern exists (e.g. a future `patterns/code-review`, `patterns/extraction-json`), prefer it.

## Recipe

Compose using slots from [[concepts/prompt-anatomy]]:

```
[Role]            ← only if task implies persona or expertise
[Task]            ← imperative single sentence
[Inputs]          ← delimited (XML tags or fenced blocks); use {{placeholder}} for runtime substitution
[Constraints]    ← positive form preferred; bullets
[Output format]   ← exact shape; place near the end
[Examples]        ← 1-3 only if format-sensitive
[Reasoning hint]  ← only if multi-step task
```

## Skeleton

```
You are {{role}}.

Task: {{one-sentence imperative}}

Input:
<input>
{{user-supplied content}}
</input>

Constraints:
- {{constraint 1}}
- {{constraint 2}}

Output format: {{exact shape — JSON schema, markdown sections, list, etc.}}
```

Fields wrapped in `{{...}}` are placeholders the user fills in at runtime. Drop any block whose contents would be empty.

## Selection knobs

| User signal | Adjustment |
|---|---|
| "Be concise" / terse | Drop role, drop examples; tighten constraint phrasing. |
| "Be thorough" / careful reasoning | Add reasoning hint ("think step by step before answering"); allow longer output. |
| Output must be machine-readable | Specify JSON schema explicitly; add 1 example; forbid prose preamble. |
| Multiple inputs | Use distinct delimiters per input (`<context>`, `<question>`, `<examples>`). |
| Domain expertise | Add role; reference relevant `L2_facts/` for model-specific phrasing. |

## Worked example

User instruction: *"Give me a prompt that summarizes a news article into 3 bullet points for a busy executive."*

Generated prompt:

```
You are an executive briefing assistant.

Task: Summarize the article below into exactly 3 bullets capturing what happened, why it matters, and what to watch next.

Input:
<article>
{{article text}}
</article>

Constraints:
- One sentence per bullet, ≤25 words.
- No hedging language ("might", "could", "perhaps") unless the article itself is uncertain.
- Use plain English; no jargon without a 3-word gloss.

Output format: 3 markdown bullets, no preamble, no closing.
```

Rationale to user (cite, don't include in prompt):
- pattern: `patterns/prompt-from-instruction`
- concepts: `concepts/prompt-anatomy` (role, task, input, constraints, output format)
- assumed inputs: `{{article text}}` placeholder
- caveats: hedging rule may need relaxing for genuinely uncertain reports.

## Related

- [[concepts/prompt-anatomy]]
- [[L3_sops/generate-prompt-from-instruction]]
- [[templates/prompt-snippet.template]]
