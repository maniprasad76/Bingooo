# .project/ — GSD Milestone Planning Directory

This directory holds disk-backed planning artifacts for large Bingooo milestones.

## Structure

```
.project/
├── README.md          <- This file
├── PLAN.md            <- Active milestone plan (one at a time)
├── INTENT.md          <- Current milestone intent & goals
└── archive/           <- Completed milestone plans
    └── M01-*.md       <- Archived milestone plans
```

## When to Use .project/

Use `.project/PLAN.md` for **milestone-level work** (multiple features, cross-cutting changes, or multi-day efforts).

For a single self-contained feature, use `plan.md` at the root.

## Plan File Format

```markdown
# Milestone M0X: [Title]

## Intent
What this milestone achieves and why.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Waves (Parallel Execution)

### Wave 1 (Files: A, B, C)
- Task 1.1: ...
- Task 1.2: ...

### Wave 2 (Files: D, E, F — depends on Wave 1)
- Task 2.1: ...

## Risks
- Risk: ... | Mitigation: ...

## Verification
- [ ] npm run typecheck
- [ ] npm run dev:all (no errors)
- [ ] Security checklist
- [ ] E2E acceptance criteria verified
```

## Archiving

After a milestone ships, move its plan:
```bash
mv .project/PLAN.md .project/archive/M0X-feature-name.md
```
