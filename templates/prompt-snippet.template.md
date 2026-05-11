---
schema_version: 2
title: "{{title}}"
type: pattern
domain: patterns
tier: procedural
confidence: 0.3
created: "{{date}}"
updated: "{{date}}"
verified: "{{date}}"
sources: []
supersedes: []
superseded-by:
tags: [prompter, snippet]
---

# {{title}}

A reusable prompt snippet for {{task type}}. Drop into a generated prompt verbatim or with light substitution.

## When to use

- Trigger: {{user signal that selects this snippet}}.
- Skip if: {{condition under which a different snippet fits better}}.

## Snippet

```
{{prompt text — placeholders in {{double-braces}} for runtime substitution}}
```

## Slots filled

Maps to [[concepts/prompt-anatomy]] slots:
- {{role / task / inputs / constraints / output format / examples / reasoning hint}}

## Notes

- {{any model-specific behavior, measured outcome, or caveat — cite L2_facts/ when relevant}}

## Related

- [[concepts/prompt-anatomy]]
- [[patterns/prompt-from-instruction]]
- {{linked concepts or other snippets}}
