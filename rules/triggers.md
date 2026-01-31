# Delegation Triggers

This file defines when to delegate to GPT experts via Codex skills.

## IMPORTANT: Check These Triggers on EVERY Message

You MUST scan incoming messages for delegation triggers. This is NOT optional.

**Behavior:**
1. **PROACTIVE**: On every user message, check if semantic triggers match → delegate automatically
2. **REACTIVE**: If user explicitly mentions GPT/Codex → delegate immediately

When a trigger matches:
1. Identify the appropriate skill
2. Follow the delegation flow in `rules/orchestration.md`

---

## Available Expert Skills

| Skill | Specialty | Use For |
|-------|-----------|---------|
| `/claude-delegator:architect` | System design, tradeoffs | Architecture decisions, complex debugging |
| `/claude-delegator:plan-reviewer` | Plan validation | Reviewing work plans before execution |
| `/claude-delegator:scope-analyst` | Pre-planning analysis | Catching ambiguities before work starts |
| `/claude-delegator:code-reviewer` | Code quality, bugs | Reviewing code changes, finding issues |
| `/claude-delegator:security-analyst` | Vulnerabilities, threats | Security audits, hardening |

## Explicit Triggers (Highest Priority)

User explicitly requests delegation:

| Phrase Pattern | Skill |
|----------------|-------|
| "ask GPT", "consult GPT" | Route based on context |
| "review this architecture" | `/claude-delegator:architect` |
| "review this plan" | `/claude-delegator:plan-reviewer` |
| "analyze the scope" | `/claude-delegator:scope-analyst` |
| "review this code" | `/claude-delegator:code-reviewer` |
| "security review", "is this secure" | `/claude-delegator:security-analyst` |

## Semantic Triggers (Intent Matching)

### Architecture & Design (→ `/claude-delegator:architect`)

| Intent Pattern | Example |
|----------------|---------|
| "how should I structure" | "How should I structure this service?" |
| "what are the tradeoffs" | "Tradeoffs of this caching approach" |
| "should I use [A] or [B]" | "Should I use microservices or monolith?" |
| System design questions | "Design a notification system" |
| After 2+ failed fix attempts | Escalation for fresh perspective |

### Plan Validation (→ `/claude-delegator:plan-reviewer`)

| Intent Pattern | Example |
|----------------|---------|
| "review this plan" | "Review my migration plan" |
| "is this plan complete" | "Is this implementation plan complete?" |
| "validate before I start" | "Validate my approach before starting" |
| Before significant work | Pre-execution validation |

### Requirements Analysis (→ `/claude-delegator:scope-analyst`)

| Intent Pattern | Example |
|----------------|---------|
| "what am I missing" | "What am I missing in these requirements?" |
| "clarify the scope" | "Help clarify the scope of this feature" |
| Vague or ambiguous requests | Before planning unclear work |
| "before we start" | Pre-planning consultation |

### Code Review (→ `/claude-delegator:code-reviewer`)

| Intent Pattern | Example |
|----------------|---------|
| "review this code" | "Review this PR" |
| "find issues in" | "Find issues in this implementation" |
| "what's wrong with" | "What's wrong with this function?" |
| After implementing features | Self-review before merge |

### Security (→ `/claude-delegator:security-analyst`)

| Intent Pattern | Example |
|----------------|---------|
| "security implications" | "Security implications of this auth flow" |
| "is this secure" | "Is this token handling secure?" |
| "vulnerabilities in" | "Any vulnerabilities in this code?" |
| "threat model" | "Threat model for this API" |
| "harden this" | "Harden this endpoint" |

## Trigger Priority

1. **Explicit user request** - Always honor direct requests
2. **Security concerns** - When handling sensitive data/auth
3. **Architecture decisions** - System design with long-term impact
4. **Failure escalation** - After 2+ failed attempts
5. **Don't delegate** - Default: handle directly

## When NOT to Delegate

| Situation | Reason |
|-----------|--------|
| Simple syntax questions | Answer directly |
| Direct file operations | No external insight needed |
| Trivial bug fixes | Obvious solution |
| Research/documentation | Use other tools |
| First attempt at any fix | Try yourself first |

## Advisory vs Implementation Mode

Any expert can operate in two modes:

| Mode | Sandbox Flag | When to Use |
|------|--------------|-------------|
| **Advisory** | `--sandbox read-only` | Analysis, recommendations, review verdicts |
| **Implementation** | `--sandbox workspace-write` | Actually making changes, fixing issues |

Set the sandbox based on what the task requires, not the expert type.

**Examples:**

```bash
# Architect analyzing (advisory)
codex exec --full-auto --sandbox read-only --cd /path/to/project "
EXPERT: Architect
TASK: Analyze tradeoffs of Redis vs in-memory caching
..."

# Architect implementing (implementation)
codex exec --full-auto --sandbox workspace-write --cd /path/to/project "
EXPERT: Architect
TASK: Refactor the caching layer to use Redis
..."

# Security Analyst reviewing (advisory)
codex exec --full-auto --sandbox read-only --cd /path/to/project "
EXPERT: Security Analyst
TASK: Review this auth flow for vulnerabilities
..."

# Security Analyst hardening (implementation)
codex exec --full-auto --sandbox workspace-write --cd /path/to/project "
EXPERT: Security Analyst
TASK: Fix the SQL injection vulnerability in user.ts
..."
```
