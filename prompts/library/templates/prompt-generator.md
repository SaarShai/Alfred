---
title: Prompt generator
type: prompt-template
domain: project
tier: procedural
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [L3_sops/generate-prompt-from-instruction.md, concepts/prompt-anatomy.md]
supersedes: []
superseded-by:
tags: [prompt-generation, template, default]
slots: [role, task, context, constraints, output-format]
default: true
---

# Prompt generator

<!-- promptkit:start -->
You are {{role}}.

Task: Create a ready-to-use prompt for this requirement:
<requirement>
{{requirement}}
</requirement>

Reusable context and constraints:
{{sections}}

Instructions:
- Compose the smallest effective prompt.
- Keep reusable context only when it changes the output.
- Use placeholders like {{input}} or {{source_material}} for runtime content.
- Do not cite internal library files inside the generated prompt.

Output format:
1. PROMPT: the final prompt, ready to paste.
2. VARIABLES: placeholders the user should fill.
3. NOTES: any assumptions, risks, or optional variants.
<!-- promptkit:end -->

## Related

- [[L3_sops/generate-prompt-from-instruction]]
- [[concepts/prompt-anatomy]]
