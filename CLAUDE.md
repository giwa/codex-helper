# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Claude Code plugin that provides GPT (via Codex CLI) as specialized expert subagents. Five domain experts that can advise OR implement: Architect, Plan Reviewer, Scope Analyst, Code Reviewer, and Security Analyst.

## Development Commands

```bash
# Test plugin locally (loads from working directory)
claude --plugin-dir /path/to/claude-delegator

# Test skills directly (namespaced)
/claude-delegator:architect
/claude-delegator:code-reviewer
/claude-delegator:plan-reviewer
/claude-delegator:scope-analyst
/claude-delegator:security-analyst
```

No build step, no dependencies. Uses Codex CLI directly via skills.

## Prerequisites

Codex CLI must be installed and authenticated:

```bash
npm install -g @openai/codex
codex auth
```

## Architecture

### Orchestration Flow (Skill-based)

Claude acts as orchestrator—delegates to specialized GPT experts based on task type. Each skill invokes `codex exec` directly.

```
User Request → Claude Code → [Match trigger → Select skill]
                                    ↓
              ┌─────────────────────┼─────────────────────┐
              ↓                     ↓                     ↓
    :architect            :code-reviewer        :security-analyst
              ↓                     ↓                     ↓
    codex exec --sandbox [read-only | workspace-write]
              ↓                     ↓                     ↓
    Claude synthesizes response ←──┴──────────────────────┘
```

### How Delegation Works (Skill-based)

1. **Match trigger** - Check `rules/triggers.md` for semantic patterns
2. **Invoke skill** - Use `/claude-delegator:architect`, `/claude-delegator:code-reviewer`, etc.
3. **Skill builds prompt** - 7-section format with expert personality
4. **Execute `codex exec`** - Run via Bash with appropriate sandbox
5. **Synthesize response** - Never show raw output; interpret and verify

### Codex CLI Commands

```bash
# Advisory mode (read-only analysis)
codex exec --full-auto --sandbox read-only --cd <dir> "<prompt>"

# Implementation mode (can modify files)
codex exec --full-auto --sandbox workspace-write --cd <dir> "<prompt>"
```

### The 7-Section Delegation Format

Every delegation prompt must include: TASK, EXPECTED OUTCOME, CONTEXT, CONSTRAINTS, MUST DO, MUST NOT DO, OUTPUT FORMAT. See `rules/delegation-format.md` for templates.

### Retry Handling

Since each call is stateless, retries must include full history:
- Attempt 1 fails → new call with original task + error details
- Up to 3 attempts → then escalate to user

### Component Relationships

| Component | Purpose | Notes |
|-----------|---------|-------|
| `skills/*/SKILL.md` | Skill definitions | Namespaced as `/claude-delegator:*` |
| `rules/*.md` | When/how to delegate | Reference for orchestration |
| `prompts/*.md` | Expert personalities | Embedded in skills |
| `config/providers.json` | Provider metadata | Reference only |

> Expert prompts adapted from [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)

## Five GPT Expert Skills

| Skill | File | Specialty | Triggers |
|-------|------|-----------|----------|
| `/claude-delegator:architect` | `skills/architect/SKILL.md` | System design, tradeoffs | "how should I structure", "tradeoffs of", design questions |
| `/claude-delegator:plan-reviewer` | `skills/plan-reviewer/SKILL.md` | Plan validation | "review this plan", before significant work |
| `/claude-delegator:scope-analyst` | `skills/scope-analyst/SKILL.md` | Requirements analysis | "clarify the scope", vague requirements |
| `/claude-delegator:code-reviewer` | `skills/code-reviewer/SKILL.md` | Code quality, bugs | "review this code", "find issues" |
| `/claude-delegator:security-analyst` | `skills/security-analyst/SKILL.md` | Vulnerabilities | "is this secure", "harden this" |

Every expert can operate in **advisory** (`--sandbox read-only`) or **implementation** (`--sandbox workspace-write`) mode based on the task.

## Key Design Decisions

1. **Namespaced skills** - All skills prefixed with `claude-delegator:` to avoid conflicts
2. **Direct CLI execution** - Skills invoke `codex exec` directly via Bash
3. **Stateless calls** - Each delegation includes full context
4. **Dual mode** - Any expert can advise or implement based on task
5. **Synthesize, don't passthrough** - Claude interprets GPT output, applies judgment
6. **Proactive triggers** - Claude checks for delegation triggers on every message

## When NOT to Delegate

- Simple syntax questions (answer directly)
- First attempt at any fix (try yourself first)
- Trivial file operations
- Research/documentation tasks
