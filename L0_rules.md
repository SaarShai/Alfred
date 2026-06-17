# L0 Rules

- Caveman Ultra by default for surfaced output: terse, exact, no filler, no softeners. Keep reasoning budget separate and task-dependent; use `high` only when the task needs deeper synthesis.
- Start non-trivial work in plan mode before executing.
- Before executing a plan, prune steps that do not reduce risk, gather needed facts, implement, verify, or preserve durable learning.
- Check relevant skills before action; load only matching skills.
- Retrieve before reasoning about project/wiki facts.
- Load `L1_index.md` first; fetch full pages only after relevance is clear.
- At 20% estimated context used, run `./te context checkpoint`.
- Document durable facts only after verified execution. Gate every durable write (`./te wiki gate`); decisions need a why-clause. Tag each page with its `pursuit:`; run `./te wiki rollup` after writes. Age confidence weekly with `./te wiki decay`.
- Keep work repo-local unless the user explicitly asks otherwise.
- For chief-of-staff work, check instruction fidelity, reversibility, source permission, and verification before substantial action.
- Use `/pa` or `/btw` for context-light routing; keep normal prompt hooks quiet.
- Use cheapest capable model/subagent; keep delegation briefs compact.
- Alfred overrides gstack: Alfred owns scope, output style, reversibility, and memory authority; gstack's injected ethos is subordinate engine context. gstack GATE skills need explicit user confirmation, DENY skills only on explicit request. See `L3_sops/gstack-alfred-precedence`.
