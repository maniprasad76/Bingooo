# BINGOOO — Agent Operating Manual (GSD Core v1.9)

> **Read this file first. Follow it exactly. Every feature lives inside one phase-loop milestone.**
> Based on [Open GSD Core](https://github.com/open-gsd/gsd-core) — Git. Ship. Done.

---

## 0. What GSD Core Does

GSD Core is a **context-engineering and spec-driven development loop** for AI coding agents.
It solves **context rot** — quality degradation as an AI fills its context window — by keeping the main session lean and running heavy work in targeted, scoped prompts.

**The core rule:** No coding until you have a written plan. No merging until you have verified the build works.

---

## 1. Project Identity (Load Once, Stay Lean)

| Key | Value |
|---|---|
| **Brand** | `BINGOOO.` (uppercase, red period dot) |
| **Tagline** | *"Wear what defines you."* |
| **Stack** | React 19 + Vite (frontend) · NestJS 10 (backend) · React 19 + Vite (admin) · Capacitor 8 (native) |
| **Monorepo** | `apps/frontend` · `apps/backend` · `apps/admin` · `packages/types` · `packages/config` |
| **Design Tokens** | Warm cream `#F7EEDB` · Charcoal `#171717` · Signal red `#E6321C` · Manrope font · Lucide React icons |
| **Backend Port** | `3000` · Frontend `5173` · Admin `5174` |
| **Payments** | Razorpay + UPI (HMAC SHA-256 webhook verification) |
| **Auth** | Bearer JWT · `AuthGuard` + `RolesGuard` + `@Permissions(...)` decorator |

**Do NOT re-read full docs on every task. Use the graph memory instead:**
```bash
python -m graphify query "<your question>"     # BFS broad search
python -m graphify path "<NodeA>" "<NodeB>"    # relationship path
python -m graphify explain "<SymbolName>"      # deep symbol detail
```

---

## 2. The 5-Phase GSD Loop

Every feature, bugfix, or refactor follows this exact loop. **Complete each phase before moving to the next.**

```
DISCUSS -> PLAN -> EXECUTE -> VERIFY -> SHIP
```

### Phase 1 - DISCUSS
> Capture what we're building and why, before any planning.

- Restate the request in your own words
- Surface any ambiguities or missing requirements
- Confirm scope: what is IN and what is OUT
- Agree on the acceptance criteria
- **Output:** A short bullet list of confirmed decisions written directly in the conversation

### Phase 2 - PLAN
> Research, decompose, and write a concrete plan that fits a fresh context window.

- Query graphify for relevant code paths: `python -m graphify query "<feature>"`
- Identify all files that will change (be specific: file paths + what changes)
- Write the plan as a `plan.md` file at the root or in `.project/` (for large milestones)
- Verify the plan is self-contained: a fresh agent reading only `AGENTS.md` + `plan.md` could execute it
- Flag any risks or unknowns
- **Output:** `plan.md` (or `.project/PLAN.md` for milestones) reviewed and approved before execution

### Phase 3 - EXECUTE
> Implement exactly what the plan says. No scope creep.

- Follow the plan file line by line
- Touch only files listed in the plan
- Adhere to all invariants in Section 4 below
- After completing, update graphify: `python -m graphify update .`
- **Output:** Working code committed to a feature branch

### Phase 4 - VERIFY
> Walk through what was built. Fix issues before declaring done.

- Build passes: `npm run typecheck` (root)
- Dev server starts without errors: `npm run dev:all`
- Feature works end-to-end as per acceptance criteria from Phase 1
- No regressions in adjacent flows
- Security checklist passed (see Section 5)
- **Output:** Explicit sign-off - "Verified: [list of checks passed]"

### Phase 5 - SHIP
> Commit, document, and close the loop.

- Clean commit message: `feat(scope): concise description`
- Update `BRAIN.md` changelog section with a 1-line entry
- Run `python -m graphify update .` to keep graph current
- Archive `plan.md` -> `.project/archive/` (for milestone plans)
- **Output:** Committed, documented, ready for review

---

## 3. Context-Hygiene Rules (Token Budget)

These rules prevent context rot and keep AI prompts sharp:

| Rule | Action |
|---|---|
| **Graphify first** | Before reading any source file, query the graph. Only open files the graph points you to. |
| **One task per context** | Do not ask an AI to plan AND execute in the same session. Split them. |
| **Lean context files** | `AGENTS.md` (this file) replaces reading `BRAIN.md` + `memory.md` + `architecture.md` + `design.md` together. Those files exist for humans; agents use this file. |
| **No grep-then-read-all** | Do not list directory contents and read every file. Query the graph instead. |
| **Plan before code** | If you haven't written a plan, you are not in Phase 3. Stop and go to Phase 2. |
| **Scope the read** | When you must read a source file, read only the relevant function/section, not the entire file. |

---

## 4. Architectural Invariants (Never Break These)

### Database & Indexing
- `store.ts` must **NEVER** directly import `db-index.service.ts`
- The only coupling is via `registerSaveHook(rebuildIndexes)` observer pattern
- All writes go through `store.ts`; all reads use hash-index lookups via `db-index.service.ts`

### Security
- **Server-side pricing only**: Cart prices, GST, discounts, shipping calculated exclusively in `apps/backend`
- **No client-side price trust**: Never accept a price from the frontend payload
- **Razorpay webhooks**: Always verify HMAC SHA-256 with the raw request body (no JSON parse before verify)
- **JWT tokens**: Validated by `AuthGuard` on every protected route; never skip the guard
- **RBAC**: Use `@Permissions(...)` decorator; never implement ad-hoc role checks inline

### Frontend Design
- **Color palette**: Only `#F7EEDB`, `#171717`, `#E6321C`, and their tints. No off-palette colors.
- **Icons**: Lucide React SVG icons only. No unicode emojis in any UI element.
- **Font**: Manrope (all weights). Never substitute a different typeface.
- **Mobile haptics**: Use `triggerHaptic()` from `capacitorBridge.ts` - never call `navigator.vibrate` directly.

### TypeScript
- Shared types live in `packages/types`. Never duplicate type definitions across apps.
- `npm run typecheck` must pass at zero errors before any ship.

---

## 5. Security Pre-Flight Checklist

Run mentally before every SHIP:

- [ ] No secrets or API keys in source code (use `.env`, never commit `.env`)
- [ ] All user input sanitized before DB write
- [ ] Authorization checked on every API endpoint (`@Roles`, `@Permissions`)
- [ ] Razorpay webhook signature verified before processing payment events
- [ ] No SQL injection risk (parameterized queries / ORM usage)
- [ ] No XSS surface - no `dangerouslySetInnerHTML` without explicit sanitization
- [ ] CORS configured to specific origins, not wildcard `*` in production

---

## 6. Common Commands Cheatsheet

```bash
# Development
npm run dev:all           # Start API (3000) + Frontend (5173) + Admin (5174)
npm run dev:api           # Backend only
npm run dev:web           # Frontend only
npm run dev:admin         # Admin only

# Quality
npm run typecheck         # TypeScript check across all workspaces
npm run build             # Full production build

# Mobile
npm run android:sync      # Sync Capacitor Android shell
npm run android:open      # Open in Android Studio

# Testing
npm run test:security     # Security test suite (apps/backend)
npm run test:checkout     # Checkout E2E test suite (apps/backend)

# Graph Memory (always run after code changes)
python -m graphify update .              # Re-index codebase (AST only, no API cost)
python -m graphify query "<question>"   # Query the knowledge graph
python -m graphify path "<A>" "<B>"     # Find relationship between two nodes
python -m graphify explain "<Symbol>"  # Deep explain a symbol
```

---

## 7. File Map for Quick Navigation

```
AGENTS.md          <- YOU ARE HERE - agent operating manual (read this first)
BRAIN.md           <- human-readable architecture summary (read for broad orientation)
prd.md             <- product requirements (read for feature acceptance criteria)
design.md          <- full design system tokens (read when implementing UI)
architecture.md    <- technical architecture details (read for deep system questions)
memory.md          <- extended persistent memory (read for historical decisions)
rules.md           <- coding style rules (read before implementing any feature)
task.md            <- active task list (update as you make progress)
plan.md            <- current milestone plan (create in Phase 2, execute in Phase 3)
.project/          <- milestone planning artifacts (PLAN.md, archive/)
graphify-out/      <- knowledge graph artifacts (graph.json, GRAPH_REPORT.md)
```

---

## 8. How to Start a New Feature (Quick Reference)

1. **Read this file** (you're doing it now)
2. **DISCUSS**: Restate the requirement, confirm scope
3. **Query the graph**: `python -m graphify query "<feature name>"`
4. **PLAN**: Write `plan.md` - list every file to change, every function to create/modify
5. **Get approval** on the plan before writing code
6. **EXECUTE**: Implement exactly what `plan.md` says
7. **VERIFY**: Typecheck, dev server, feature works, security checklist
8. **SHIP**: Commit, update `BRAIN.md` changelog, run `graphify update .`

**If you skip Phase 2 (PLAN), you are doing it wrong. Go back.**
