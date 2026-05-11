---
schema_version: 2
title: SOP — generate prompt from user instruction
type: sop
domain: project
tier: procedural
confidence: 0.7
created: 2026-05-08
updated: 2026-05-11
verified: 2026-05-11
sources: [projects/prompter/README.md, patterns/reusable-prompt-library.md]
supersedes: []
superseded-by:
tags: [prompter, sop, prompt-generation, retrieval]
---

# SOP — generate prompt from user instruction

The canonical agent playbook for PROMPTER. Use this any time a user asks for a prompt.

## Trigger

User says any of: "write a prompt for X", "give me a prompt that does Y", "I need to ask an LLM to Z", or pastes a draft prompt and asks to improve it.

For executive-assistant use cases such as executive briefing prompts, weekly planning prompts, or chief-of-staff prompts, also retrieve [[projects/executive-assistant/README]] and route through [[patterns/assistant-task-routing]] when useful.

## Steps

### 1. Parse intent

Extract from the instruction:
- **Task** (what the prompt should make the model do)
- **Inputs** the prompt will receive (text, code, data, none)
- **Output shape** (prose, JSON, list, code, table)
- **Target model** (Claude, GPT, Gemini, local, unknown)
- **Constraints** (length, tone, must-include, must-avoid)
- **Reusable context** (known company/product facts, stable style, safety boundaries, or snippets)

Anything ambiguous → ask one batched clarifying question before retrieval. Do not invent.

### 2. Retrieve

```bash
./te wiki context "<task keyword + output shape>"
```

If the context packet is thin, expand:

```bash
./te wiki search "<task type>"
./te wiki search "<output shape>"
./te wiki fetch concepts/user-preferences   # if present
```

Always check `L2_facts/` for target-model quirks if a specific model was named.

### 3. Compose

Pick exactly the building blocks the task needs:

- **One pattern** from `patterns/` matching the task type. If none matches, use [[concepts/prompt-anatomy]] directly and note the gap.
- **Concepts** from `concepts/` for techniques the pattern calls for (role priming, few-shot, CoT, output-format control, etc.).
- **A template** from `templates/` if a fillable skeleton exists for this task type.
- **User preferences** from `concepts/user-preferences` if present.

Apply the [[concepts/prompt-anatomy]] structure. Cite wiki paths in your rationale to the user (e.g. `concepts/prompt-anatomy`), not inside the generated prompt itself.

If the request can reuse stable sections or templates, use the prompt kit:

```bash
./te prompt list
./te prompt draft "<user requirement>" --format json
./te prompt draft "<user requirement>" --template <slug> --section <slug> --var key=value
```

Use [[patterns/reusable-prompt-library]] to decide when to use explicit snippets versus freeform composition.
For requests involving deliberate reasoning, agent planning, alternatives, tool use, or self-checking, also retrieve [[patterns/reasoning-and-planning-prompt-snippets]].

### 4. Return

Output to the user:

```
PROMPT
------
<the prompt, ready to copy-paste>

RATIONALE
---------
- pattern: <patterns/...>
- concepts: <concepts/...>, <concepts/...>
- assumed inputs: <list>
- caveats: <if any>
```

Keep rationale ≤5 lines. The prompt itself follows the user's preferred tone/format, not Caveman Ultra (Caveman Ultra governs *your* surfaced output to the user, not the prompts you produce *for* the user).

### 5. Document if durable

After the user confirms the prompt worked (or pushed back with a fix):
- New reusable recipe → add a `patterns/` entry.
- New technique observed → add a `concepts/` entry.
- Model quirk surfaced → add an `L2_facts/` entry.
- User preference revealed → update `concepts/user-preferences`.
- Append `log.md` with date + 1-line summary + page IDs touched.
- Refresh `L1_index.md` if pointers changed: `./te wiki index`.

No verified outcome → no durable write. Failed drafts can stay in session.

## Anti-patterns

- Generating a prompt without any wiki retrieval. The wiki is the source of truth — if you skipped it, you skipped the project.
- Citing wiki pages inside the generated prompt. Citations belong in the rationale to the user.
- Inventing a "best practice" not backed by a `concepts/` or `raw/` entry. If you used something not in the wiki, write it up after the user confirms it worked.
- Overloading the prompt with every technique. Smallest effective prompt; add complexity only if the task requires it.

## Related

- [[projects/prompter/README]]
- [[concepts/prompt-anatomy]]
- [[patterns/prompt-from-instruction]]
- [[patterns/reusable-prompt-library]]
- [[patterns/reasoning-and-planning-prompt-snippets]]
- [[templates/prompt-snippet.template]]
