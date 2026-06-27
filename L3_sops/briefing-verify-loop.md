---
schema_version: 2
title: Briefing generate→verify loop
type: sop
domain: project
tier: procedural
confidence: 0.7
created: 2026-06-27
updated: 2026-06-27
verified: 2026-06-27
sources: [skills/executive-assistant/SKILL.md, patterns/daily-weekly-briefing.md, skills/eval-gate/SKILL.md, skills/eval-gate/tools/eval_gate.py]
supersedes: []
superseded-by:
tags: [briefing, eval-gate, verifier, loop, quality-gate, executive-assistant]
---

# Briefing generate→verify loop

Wires **eval-gate** as a SEPARATE, BLIND verifier on every executive-assistant
briefing. The drafter (executive-assistant) generates; eval-gate judges the
artifact against a per-criterion rubric in a fresh context that sees only the
task and the draft — never the drafter's reasoning. A briefing ships only after
it passes; a failing draft is reworked (max 2 revisions) using the verifier's
`blocking_criteria` as the rework list.

This is the eval-gate doctrine applied to chief-of-staff output: "no layer
measuring the output before it leaves the building." Here that layer is a
different actor from the one that wrote the briefing, so it does not grade its
own homework.

## When to run

Run this loop **before delivering ANY briefing** — daily briefing, weekly
planning, "what needs my attention," a strategic-review status pass, or any
output that uses the briefing format (Situation / Decision needed /
Recommendation / Next actions / Risks / Follow-ups, per
[`skills/executive-assistant/SKILL.md`](../skills/executive-assistant/SKILL.md)
Outputs → Briefing and [`patterns/daily-weekly-briefing.md`](../patterns/daily-weekly-briefing.md)).

Synthesize the briefing locally as usual, then gate it here. Nothing below the
line reaches the user. Do **not** skip the gate because the briefing "looks
fine" — looks-fine is exactly the holistic judgement the per-criterion rubric
replaces with named pass/fail coordinates.

This is a runtime / pre-ship gate on ONE output (eval-gate's `score` verb), not
a regression suite.

## Prerequisites — the rubric (author once, at task start)

The verifier reads a per-criterion rubric file. Author it **once, up front** (not
reverse-engineered after the draft) at `skills/eval-gate/briefing-rubric.json` as
a JSON list of `{id, description, weight, required}` criteria — the shape in
[`skills/eval-gate/tools/criteria.example.json`](../skills/eval-gate/tools/criteria.example.json).
Encode the standard a reader bookmarks the briefing for, and make each `required`
criterion a hard block. Cover at least:

- **grounded** (`required`) — every claim traces to an approved source (workspace,
  wiki, `L2_facts/*`, obligations, or notes in the prompt); no invented facts,
  dates, or numbers. This is the grounding-sensitive criterion that needs a strong
  judge (see below).
- **complete** (`required`) — all briefing sections present and populated; no
  dropped decision, blocker, follow-up, or risk that the sources imply.
- **decision-ready** (`required`) — "Decision needed" and "Recommendation" each
  state a concrete, actionable call with upside / risk / reversibility, not a
  restatement of the situation.
- **scoped** (`required`) — no unapproved external source read, no account
  connected, no destructive/irreversible action taken or implied without a gate
  (mirrors the executive-assistant operating rules).
- **concise** (not required) — no filler, no restated prompt; a reader can act
  without skimming.

If `skills/eval-gate/briefing-rubric.json` does not yet exist, create it before
the first run.

## The loop

1. **Generate.** Executive-assistant drafts the briefing locally from approved
   sources and writes it to a file (e.g. `<draft.md>`).
2. **Verify (separate, blind actor).** Run eval-gate as the verifier. It is a
   DIFFERENT actor from the drafter and is **blind to the drafter's reasoning** —
   it is given only the briefing request (`--task`) and the draft artifact
   (`--file`), never the chain-of-thought or self-justification that produced it.

   The exact command (note the **≥32B** judge — the grounded criterion is
   grounding-sensitive, and an 8B judge false-fails good drafts and false-passes
   weak ones; pin a ≥32B model, never the small default):

   ```bash
   python3 skills/eval-gate/tools/eval_gate.py score --criteria-file skills/eval-gate/briefing-rubric.json --backend ollama --model qwen3.6:35b-a3b-q4km --task "<briefing request>" --file <draft.md>
   ```

   - `--task "<briefing request>"` — the user's actual briefing ask, verbatim.
   - `--file <draft.md>` — the drafted briefing artifact, alone. The verifier sees
     the task and this artifact and nothing else (this is what `verifier_blind`
     and `verifier_inputs: task, outputs` declare).

3. **Gate.** The gate FAILS when eval-gate exits `1` — the weighted score is below
   the threshold (default `0.7`) **OR** any `blocking_criteria` is non-empty (a
   failed `required` criterion blocks even if the weighted mean clears the line).
   Exit `2` means the judge was unreachable or unparseable — treat that as a FAIL
   (the gate fails safe; never ship on a verdict you could not compute). Only exit
   `0` is a pass.

4. **Revise on fail (max 2).** On a FAIL, surface the verifier's
   `blocking_criteria` to the user as the **rework list** — each failed criterion
   with its reason is a concrete failure coordinate (e.g. *"grounded: Q3 revenue
   figure not in any approved source"*, *"decision-ready: Recommendation restates
   the situation"*). Revise the briefing to clear exactly those, then re-run the
   same command. Allow **at most 2 revisions**.

5. **Stop.** Stop when the verdict is `pass` (exit 0) OR 2 revisions have been
   reached. If still failing after 2 revisions, do **not** ship the briefing
   silently — hand the user the briefing together with the outstanding
   `blocking_criteria` and the residual risk, and ask how to proceed (the
   draft-then-ask rule). Never lower the threshold mid-run to turn a FAIL into a
   PASS.

## Loop spec

```loop
name: briefing-verify-loop
topology: closed
generator: executive-assistant briefing draft
verifier: eval-gate per-criterion rubric (a DIFFERENT actor from the drafter)
verifier_blind: true
verifier_inputs: task, outputs
gate: eval_gate.py exit 1 (below threshold) OR any blocking_criteria
stop: verdict == pass OR 2 revisions reached
budget: 2 attempts (revisions)
```

Lint this spec with Brainer's loop linter (R1–R13); it must be clean, with the
separate-verifier rule (R3) and the verifier-blindness rule (R13) satisfied:

```bash
python3 /Users/za/Documents/Brainer/skills/loop-engineering/tools/loop_lint.py --json L3_sops/briefing-verify-loop.md
```

Notes on the spec fields:

- **topology: closed** — the loop ships on its gate (eval-gate's verdict), so it
  must name a separate verifier; it does.
- **generator vs verifier** — the drafter (executive-assistant) and the judge
  (eval-gate's rubric) are different actors. R3 (self-grading) is satisfied: an
  agent never grades its own briefing.
- **verifier_blind: true / verifier_inputs: task, outputs** — the declare-to-audit
  surface for R13. The verifier sees only the task and the draft, not the
  drafter's reasoning, so a separate actor cannot inherit the drafter's bias.
- **gate** — `eval_gate.py exit 1` is the machine signal (below-threshold OR any
  blocking_criteria); exit 0 is the only pass.
- **stop / budget** — pass-or-2-revisions, capped at 2. (The cap unit reads
  "attempts" so the linter recognizes a bounded budget; it is the same 2-revision
  cap described in the prose.)

## Related

- [`skills/eval-gate/SKILL.md`](../skills/eval-gate/SKILL.md) — the verb
  (`score`), per-criterion mode, `blocking_criteria`, and the ≥32B-judge caveat.
- [`skills/executive-assistant/SKILL.md`](../skills/executive-assistant/SKILL.md)
  — the briefing format this loop gates (Outputs → Briefing).
- [`patterns/daily-weekly-briefing.md`](../patterns/daily-weekly-briefing.md) —
  when a briefing is produced (the loop's entry point).
