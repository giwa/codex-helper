---
description: Review and validate work plans before execution. Named after Momus, the Greek god of satire who found fault in everything. Use before starting implementation of multi-step plans to catch gaps, ambiguities, and missing context.
---

# Momus Plan Review

Invoke Momus (GPT via Codex) to ruthlessly review work plans before execution.

## When to Use

- After creating a work plan, before starting implementation
- To validate plan quality before delegating to executors
- When a plan needs rigorous review for omissions
- Before committing to significant development effort

## How to Invoke

Use the `mcp__codex__codex` tool with the momus role prompt:

```
Read the momus role prompt from: ${CLAUDE_PLUGIN_ROOT}/prompts/momus.md

Then invoke:
mcp__codex__codex({
  prompt: "[Include momus prompt] + [Your plan to review]",
  developer-instructions: "You are Momus. Follow the momus.md system prompt."
})
```

## What Momus Evaluates

### Criterion 1: Clarity of Work Content
- Does each task specify WHERE to find implementation details?
- Can a developer reach 90%+ confidence from referenced sources?

### Criterion 2: Verification & Acceptance Criteria
- Is there a concrete way to verify completion?
- Are acceptance criteria measurable/observable?

### Criterion 3: Context Completeness
- What information causes ≥10% uncertainty?
- Are implicit assumptions stated explicitly?

### Criterion 4: Big Picture & Workflow
- Clear purpose statement (why is this work being done?)
- Background context (current state)
- Task dependencies (how tasks connect)
- Success vision (what does "done" look like?)

## Response Format from Momus

Momus will respond with:
- **OKAY** or **REJECT**
- Justification
- Summary of all four criteria
- Top 3-5 critical improvements (if rejected)

## When NOT to Use

- Simple, single-task requests
- Trivial plans that don't need formal review
- When user explicitly wants to skip review

## Response Handling

When Momus responds:
1. If **OKAY** - Proceed with implementation
2. If **REJECT** - Address the critical improvements before proceeding
3. Re-submit revised plan if significant changes were needed
