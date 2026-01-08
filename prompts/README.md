# Role Prompts

These system prompts are auto-injected when using the `role` parameter with `mcp__gemini__gemini`.

## How It Works

When you call the Gemini tool with a `role` parameter:

```typescript
mcp__gemini__gemini({
  prompt: "Research TanStack Query v5 optimistic updates",
  role: "librarian"  // ← This triggers prompt injection
})
```

The MCP server:
1. Reads `prompts/librarian.md`
2. Prepends it to your prompt
3. Sends the combined prompt to Gemini

## Available Roles

| Role | File | Purpose | Best For |
|------|------|---------|----------|
| `oracle` | `oracle.md` | Strategic advisor | Architecture, debugging, review |
| `librarian` | `librarian.md` | Research specialist | Docs, best practices, examples |
| `frontend-engineer` | `frontend-engineer.md` | UI specialist | Components, styling, a11y |
| `explore` | `explore.md` | Codebase navigator | Finding code, patterns |

## Customization

These are just markdown files. You can:

- **Edit directly**: Modify prompts to fit your needs
- **Add new roles**: Create `prompts/your-role.md` and use `role: "your-role"`
- **Delete roles**: Remove files you don't use

## Prompt Structure

Each prompt typically includes:

1. **Identity**: Who the model should be
2. **Characteristics**: Behavioral traits
3. **Response Format**: How to structure output
4. **Guidelines**: Do's and don'ts
5. **Examples**: Sample responses

## Tips

### Match Model to Role

| Role | Best Model |
|------|------------|
| oracle | GPT (via Codex) - deep reasoning |
| librarian | Gemini - large context |
| frontend-engineer | Gemini - creative |
| explore | Gemini - fast |

### Effective Prompt Pairing

Good:
```typescript
mcp__gemini__gemini({
  prompt: "How does React Query handle cache invalidation?",
  role: "librarian"  // ✓ Research role for research task
})
```

Less effective:
```typescript
mcp__gemini__gemini({
  prompt: "How does React Query handle cache invalidation?",
  role: "frontend-engineer"  // ✗ Wrong role for research
})
```

## For GPT (Codex)

GPT/Codex uses `developer-instructions` instead:

```typescript
mcp__codex__codex({
  prompt: "Review this architecture...",
  "developer-instructions": "You are a strategic technical advisor..."
})
```

The `oracle.md` prompt can be copied to `developer-instructions` when using GPT.
