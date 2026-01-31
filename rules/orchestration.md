# Model Orchestration (Skill-based)

You have access to GPT experts via Claude Code skills. Use them strategically based on these guidelines.

## Available Skills

| Skill | Provider | Use For |
|-------|----------|---------|
| `/codex-helper:architect` | GPT | System design, architecture decisions |
| `/codex-helper:code-reviewer` | GPT | Code quality, bugs, security review |
| `/codex-helper:plan-reviewer` | GPT | Plan validation before execution |
| `/codex-helper:scope-analyst` | GPT | Pre-planning, catching ambiguities |
| `/codex-helper:security-analyst` | GPT | Vulnerabilities, threat modeling |

## How Skills Execute Codex

Each skill runs `codex exec` via Bash:

```bash
# Advisory mode (read-only)
codex exec --full-auto --sandbox read-only --cd <project_dir> "<prompt>"

# Implementation mode (can modify files)
codex exec --full-auto --sandbox workspace-write --cd <project_dir> "<prompt>"
```

---

## Stateless Design

**Each delegation is independent.** The expert has no memory of previous calls.

**Implications:**
- Include ALL relevant context in every delegation prompt
- For retries, include what was attempted and what failed
- Don't assume the expert remembers previous interactions

---

## PROACTIVE Delegation (Check on EVERY message)

Before handling any request, check if an expert would help:

| Signal | Skill |
|--------|-------|
| Architecture/design decision | `/codex-helper:architect` |
| 2+ failed fix attempts on same issue | `/codex-helper:architect` (fresh perspective) |
| "Review this plan", "validate approach" | `/codex-helper:plan-reviewer` |
| Vague/ambiguous requirements | `/codex-helper:scope-analyst` |
| "Review this code", "find issues" | `/codex-helper:code-reviewer` |
| Security concerns, "is this secure" | `/codex-helper:security-analyst` |

**If a signal matches → invoke the appropriate skill.**

---

## REACTIVE Delegation (Explicit User Request)

When user explicitly requests GPT/Codex:

| User Says | Action |
|-----------|--------|
| "ask GPT", "consult GPT", "ask codex" | Identify task type → route to appropriate skill |
| "ask GPT to review the architecture" | Invoke `/codex-helper:architect` |
| "have GPT review this code" | Invoke `/codex-helper:code-reviewer` |
| "GPT security review" | Invoke `/codex-helper:security-analyst` |

**Always honor explicit requests.**

---

## Delegation Flow (Step-by-Step)

When delegation is triggered:

### Step 1: Identify Expert
Match the task to the appropriate skill based on triggers.

### Step 2: Determine Mode
| Task Type | Mode | Sandbox Flag |
|-----------|------|--------------|
| Analysis, review, recommendations | Advisory | `--sandbox read-only` |
| Make changes, fix issues, implement | Implementation | `--sandbox workspace-write` |

### Step 3: Notify User
Always inform the user before delegating:
```
Delegating to [Expert Name]: [brief task summary]
```

### Step 4: Build Delegation Prompt
Use the 7-section format from `rules/delegation-format.md`.

**IMPORTANT:** Since each call is stateless, include FULL context:
- What the user asked for
- Relevant code/files
- Any previous attempts and their results (for retries)

### Step 5: Execute Codex
```bash
codex exec --full-auto --sandbox [read-only|workspace-write] --cd "<project_dir>" "<delegation_prompt>"
```

### Step 6: Handle Response
1. **Synthesize** - Never show raw output directly
2. **Extract insights** - Key recommendations, issues, changes
3. **Apply judgment** - Experts can be wrong; evaluate critically
4. **Verify implementation** - For implementation mode, confirm changes work

---

## Retry Flow (Implementation Mode)

When implementation fails verification, retry with a NEW call including error context:

```
Attempt 1 → Verify → [Fail]
     ↓
Attempt 2 (new call with: original task + what was tried + error details) → Verify → [Fail]
     ↓
Attempt 3 (new call with: full history of attempts) → Verify → [Fail]
     ↓
Escalate to user
```

### Retry Prompt Template

```markdown
TASK: [Original task]

PREVIOUS ATTEMPT:
- What was done: [summary of changes made]
- Error encountered: [exact error message]
- Files modified: [list]

CONTEXT:
- [Full original context]

REQUIREMENTS:
- Fix the error from the previous attempt
- [Original requirements]
```

**Key:** Each retry is a fresh call. The expert doesn't know what happened before unless you tell them.

---

## Example: Architecture Question

User: "What are the tradeoffs of Redis vs in-memory caching?"

**Step 1**: Signal matches "Architecture decision" → `/codex-helper:architect`

**Step 2**: Advisory mode (question, not implementation) → `--sandbox read-only`

**Step 3**: "Delegating to Architect: Analyze caching tradeoffs"

**Step 4-5**:
```bash
codex exec --full-auto --sandbox read-only --cd "/path/to/project" "
EXPERT: Architect

TASK: Analyze tradeoffs between Redis and in-memory caching for [context].

EXPECTED OUTCOME: Clear recommendation with rationale.

MODE: Advisory

CONTEXT: [user's situation, full details]

CONSTRAINTS: [technical requirements]

MUST DO:
- Compare both approaches for our scale
- Provide effort estimate

MUST NOT DO:
- Over-engineer for hypothetical needs

OUTPUT FORMAT:
Bottom line → Action plan → Effort estimate
"
```

**Step 6**: Synthesize response, add your assessment.

---

## Example: Retry After Failed Implementation

First attempt failed with "TypeError: Cannot read property 'x' of undefined"

**Retry call:**
```bash
codex exec --full-auto --sandbox workspace-write --cd "/path/to/project" "
EXPERT: Code Reviewer

TASK: Add input validation to the user registration endpoint.

PREVIOUS ATTEMPT:
- Added validation middleware to routes/auth.ts
- Error: TypeError: Cannot read property 'x' of undefined at line 45
- The middleware was added but req.body was undefined

CONTEXT:
- Express 4.x application
- Body parser middleware exists in app.ts
- [relevant code snippets]

REQUIREMENTS:
- Fix the undefined req.body issue
- Ensure validation runs after body parser
- Report all files modified

OUTPUT FORMAT:
Summary → Issues fixed → Files modified → Verification
"
```

---

## Cost Awareness

- **Don't spam** - One well-structured delegation beats multiple vague ones
- **Include full context** - Saves retry costs from missing information
- **Reserve for high-value tasks** - Architecture, security, complex analysis

---

## Anti-Patterns

| Don't Do This | Do This Instead |
|---------------|-----------------|
| Delegate trivial questions | Answer directly |
| Show raw expert output | Synthesize and interpret |
| Skip user notification | ALWAYS notify before delegating |
| Retry without including error context | Include FULL history of what was tried |
| Assume expert remembers previous calls | Include all context in every call |
