# Delegation Triggers

This file defines when to automatically delegate to external models.

## Explicit Triggers (Highest Priority)

These phrases trigger immediate delegation. User intent is clear.

| Phrase Pattern | Action |
|----------------|--------|
| "ask GPT", "consult GPT", "GPT's opinion" | `mcp__codex__codex` |
| "ask Gemini", "research with Gemini" | `mcp__gemini__gemini` |
| "get a second opinion" | `mcp__codex__codex` (default to GPT) |
| "oracle" | `mcp__codex__codex` with oracle role |
| "what does GPT think" | `mcp__codex__codex` |
| "have Gemini look at this" | `mcp__gemini__gemini` |

## Semantic Triggers (Intent Matching)

When user intent matches these patterns, delegate autonomously.

### Research & Documentation (→ Gemini)

| Intent Pattern | Role | Example |
|----------------|------|---------|
| "how does [library] work" | librarian | "How does TanStack Query work?" |
| "best practices for [X]" | librarian | "Best practices for React state" |
| "what's the recommended way to" | librarian | "Recommended way to handle auth" |
| "find examples of [pattern]" | librarian | "Find examples of error boundaries" |
| "research [topic]" | librarian | "Research WebSocket best practices" |
| "document [feature]" | librarian | "Document the API endpoints" |

### Architecture & Review (→ GPT)

| Intent Pattern | Role | Example |
|----------------|------|---------|
| "review this architecture" | oracle | "Review this database schema" |
| "is this design sound" | oracle | "Is this API design sound?" |
| "what are the tradeoffs" | oracle | "Tradeoffs of this caching approach" |
| "security implications of" | oracle | "Security implications of this auth flow" |
| "performance concerns with" | oracle | "Performance concerns with this query" |
| "code review [code]" | oracle | "Code review this function" |

### Frontend & UI (→ Gemini)

| Intent Pattern | Role | Example |
|----------------|------|---------|
| "build me a [component]" | frontend-engineer | "Build me a dropdown menu" |
| "create a [UI element]" | frontend-engineer | "Create a modal dialog" |
| "style this [element]" | frontend-engineer | "Style this button component" |
| "make this responsive" | frontend-engineer | "Make this layout responsive" |
| "improve the UX of" | frontend-engineer | "Improve the UX of this form" |

### Debugging (→ GPT after failures)

| Condition | Action |
|-----------|--------|
| 2+ failed fix attempts | Suggest GPT escalation |
| "why is this failing" (after attempts) | GPT with full failure context |
| "I've tried everything" | GPT with documented attempts |

## Trigger Priority

1. **Explicit user request** - Always honor direct requests
2. **Semantic intent match** - When pattern clearly matches
3. **Failure escalation** - After documented failures
4. **Don't delegate** - When you can answer directly

## When NOT to Delegate

| Situation | Reason |
|-----------|--------|
| Simple syntax questions | You know the answer |
| Direct file operations | No external insight needed |
| Trivial bug fixes | Obvious solution |
| User just wants info | Answer directly |
| Already have context | Don't repeat work |

## Context-Dependent Triggers

Some triggers depend on prior context:

```
IF user asked about [library] recently
AND follow-up question is ambiguous
THEN use same model as before (consistency)

IF previous delegation failed
AND user is frustrated
THEN suggest switching models

IF task involves both research AND architecture
THEN consider parallel consultation
```

## Role Selection Guide

When delegating, choose the appropriate role:

| Role | When to Use | Model |
|------|-------------|-------|
| `oracle` | Architecture, security, complex reasoning | GPT |
| `librarian` | Research, documentation, best practices | Gemini |
| `frontend-engineer` | UI/UX code, components, styling | Gemini |
| `explore` | Codebase search, pattern finding | Gemini |

Roles auto-inject system prompts that guide the external model's behavior.
