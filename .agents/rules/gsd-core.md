# GSD Core — Context Engineering Rule

## Rule: Apply the GSD 5-Phase Loop to All Tasks

This project uses **GSD Core** (Open GSD — Git. Ship. Done.) for context-engineered, spec-driven development.

### Mandatory Operating Procedure

**ALWAYS read `AGENTS.md` at the start of every session before any other file.**

`AGENTS.md` is the single source of truth for:
- Project identity & stack summary (replaces reading BRAIN.md, memory.md, design.md)
- The 5-phase loop: DISCUSS → PLAN → EXECUTE → VERIFY → SHIP
- Architectural invariants you must never violate
- Security pre-flight checklist
- Common commands

### Phase Gate Rules

1. **No coding without a plan** — Write `plan.md` in Phase 2 before touching any code.
2. **No shipping without verification** — Run `npm run typecheck` and validate the feature end-to-end.
3. **Graphify before grep** — Query the knowledge graph before reading source files:
   ```bash
   python -m graphify query "<question>"
   python -m graphify explain "<SymbolName>"
   ```
4. **After every code change** — Run `python -m graphify update .` to keep the graph current.

### Token Budget Rules

- Do NOT read `BRAIN.md` + `memory.md` + `architecture.md` + `design.md` together at session start. `AGENTS.md` covers all essential context.
- Do NOT list directories and read every file. Use graphify queries.
- Do NOT plan and execute in the same AI context. Split into separate sessions.
- Scope file reads to only the function/section you need, not the entire file.

### Plan File Format

When writing `plan.md` for a feature:

```markdown
# Plan: [Feature Name]

## Acceptance Criteria (from DISCUSS phase)
- [ ] Criterion 1
- [ ] Criterion 2

## Files to Change
- `apps/frontend/src/pages/XPage.tsx` — Add Y component
- `apps/backend/src/x/x.service.ts` — Add Z method

## Implementation Steps
1. Step 1
2. Step 2

## Risks & Unknowns
- Risk 1 (mitigation: ...)

## Verification Steps
- [ ] npm run typecheck passes
- [ ] Feature X works end-to-end
- [ ] Security checklist passed
```

### Commit Message Format

```
feat(scope): concise description under 72 chars

- Bullet point of key change
- Another key change
```

Scopes: `frontend`, `backend`, `admin`, `types`, `config`, `mobile`, `infra`
