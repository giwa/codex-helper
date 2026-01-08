# claude-delegator

Multi-model orchestration via MCP. External AI models (GPT, Gemini) as native tools.

## Quick Reference

| Model | Tool | Use For |
|-------|------|---------|
| GPT | `mcp__codex__codex` | Architecture, debugging, code review |
| Gemini | `mcp__gemini__gemini` | Research, docs, frontend, multimodal |

## Model Selection

Use **GPT** for:
- Complex architecture decisions
- After 2+ failed debugging attempts
- Security/performance analysis
- Code review requiring deep reasoning

Use **Gemini** for:
- Library/framework research
- Documentation writing
- Frontend/UI code generation
- Quick best practices lookup

## Delegation Rules

Full orchestration logic is in `~/.claude/rules/delegator/`:

- **orchestration.md** - Main delegation logic, response handling
- **triggers.md** - When to delegate (explicit + semantic)
- **model-selection.md** - Which model for what task
- **delegation-format.md** - 7-section prompt templates

## Commands

| Command | Description |
|---------|-------------|
| `/claude-delegator:setup` | Initial configuration |
| `/claude-delegator:configure` | Add/remove/customize providers |

## Example Usage

```typescript
// Research with Gemini
mcp__gemini__gemini({
  prompt: "Best practices for React Query v5 optimistic updates",
  role: "librarian"
})

// Architecture review with GPT
mcp__codex__codex({
  prompt: "Review this caching architecture for potential issues",
  model: "gpt-5.2"
})
```

## Prerequisites

```bash
npm install -g @openai/codex       # GPT access
npm install -g @google/gemini-cli  # Gemini access
```

Run `/claude-delegator:setup` to configure MCP servers.
