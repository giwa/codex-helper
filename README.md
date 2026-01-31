# Claude Delegator

GPT expert subagents for Claude Code. Five specialists that can analyze AND implement—architecture, security, code review, and more.

> **Fork Note**: This is an improved fork of [jarrodwatts/claude-delegator](https://github.com/jarrodwatts/claude-delegator). Key changes:
> - Replaced MCP-based delegation with native Claude Code skills
> - Skills invoke `codex exec` directly via Bash (no MCP server required)
> - Simplified setup and configuration

[![License](https://img.shields.io/github/license/jarrodwatts/claude-delegator?v=2)](LICENSE)

![Claude Delegator in action](claude-delegator.png)

## Install

Inside a Claude Code instance, run the following commands:

**Step 1: Add the marketplace**
```
/plugin marketplace add jarrodwatts/claude-delegator
```

**Step 2: Install the plugin**
```
/plugin install claude-delegator
```

**Step 3: Run setup**
```
/claude-delegator:setup
```

Done! Claude now routes complex tasks to GPT experts automatically.

> **Note**: Requires [Codex CLI](https://github.com/openai/codex). Setup guides you through installation.

---

## What is Claude Delegator?

Claude gains a team of GPT specialists via Claude Code skills. Each expert has a distinct specialty and can advise OR implement.

| What You Get | Why It Matters |
|--------------|----------------|
| **5 domain experts** | Right specialist for each problem type |
| **Dual mode** | Experts can analyze (read-only) or implement (write) |
| **Auto-routing** | Claude detects when to delegate based on your request |
| **Synthesized responses** | Claude interprets GPT output, never raw passthrough |

### The Experts

| Expert | What They Do | Example Triggers |
|--------|--------------|------------------|
| **Architect** | System design, tradeoffs, complex debugging | "How should I structure this?" / "What are the tradeoffs?" |
| **Plan Reviewer** | Validate plans before you start | "Review this migration plan" / "Is this approach sound?" |
| **Scope Analyst** | Catch ambiguities early | "What am I missing?" / "Clarify the scope" |
| **Code Reviewer** | Find bugs, improve quality | "Review this PR" / "What's wrong with this?" |
| **Security Analyst** | Vulnerabilities, threat modeling | "Is this secure?" / "Harden this endpoint" |

### When Experts Help Most

- **Architecture decisions** — "Should I use Redis or in-memory caching?"
- **Stuck debugging** — After 2+ failed attempts, get a fresh perspective
- **Pre-implementation** — Validate your plan before writing code
- **Security concerns** — "Is this auth flow safe?"
- **Code quality** — Get a second opinion on your implementation

### When NOT to Use Experts

- Simple file operations (Claude handles these directly)
- First attempt at any fix (try yourself first)
- Trivial questions (no need to delegate)

---

## How It Works

```
You: "Is this authentication flow secure?"
                    ↓
Claude: [Detects security question → invokes /claude-delegator:security-analyst]
                    ↓
        ┌─────────────────────────────────────────┐
        │  Skill executes:                        │
        │  codex exec --sandbox read-only ...     │
        │  → Security Analyst prompt              │
        │  → GPT analyzes your code               │
        └─────────────────────────────────────────┘
                    ↓
Claude: "Based on the analysis, I found 3 issues..."
        [Synthesizes response, applies judgment]
```

**Key details:**
- Each expert has a specialized system prompt (in `prompts/`)
- Claude reads your request → picks the right expert → invokes skill → executes `codex exec`
- Responses are synthesized, not passed through raw
- Experts can retry up to 3 times before escalating

---

## Configuration

### Operating Modes

Every expert supports two modes based on the task:

| Mode | Sandbox | Use When |
|------|---------|----------|
| **Advisory** | `read-only` | Analysis, recommendations, reviews |
| **Implementation** | `workspace-write` | Making changes, fixing issues |

Claude automatically selects the mode based on your request.

### Customizing Expert Prompts

Expert prompts live in `prompts/`. Each follows the same structure:
- Role definition and context
- Advisory vs Implementation modes
- Response format guidelines
- When to invoke / when NOT to invoke

Edit these to customize expert behavior for your workflow.

---

## Requirements

- **Codex CLI**: `npm install -g @openai/codex`
- **Authentication**: Run `codex login` after installation

---

## Available Skills

| Skill | Description |
|-------|-------------|
| `/claude-delegator:setup` | Configure plugin and install rules |
| `/claude-delegator:uninstall` | Remove plugin configuration |
| `/claude-delegator:architect` | Delegate to GPT Architect expert |
| `/claude-delegator:code-reviewer` | Delegate to GPT Code Reviewer expert |
| `/claude-delegator:plan-reviewer` | Delegate to GPT Plan Reviewer expert |
| `/claude-delegator:scope-analyst` | Delegate to GPT Scope Analyst expert |
| `/claude-delegator:security-analyst` | Delegate to GPT Security Analyst expert |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Codex not authenticated | Run `codex login` |
| Skill not found | Reinstall plugin: `/plugin install claude-delegator` |
| Expert not triggered | Try explicit: "Ask GPT to review this architecture" |

---

## Development

```bash
git clone https://github.com/jarrodwatts/claude-delegator
cd claude-delegator

# Test locally without reinstalling
claude --plugin-dir /path/to/claude-delegator
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Acknowledgments

- Original plugin by [@jarrodwatts](https://github.com/jarrodwatts): [claude-delegator](https://github.com/jarrodwatts/claude-delegator)
- Expert prompts adapted from [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) by [@code-yeongyu](https://github.com/code-yeongyu)

---

## License

MIT — see [LICENSE](LICENSE)

---

