# Contributing to claude-delegator

Contributions welcome. This document covers how to contribute effectively.

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/jarrodwatts/claude-delegator
cd claude-delegator

# Install dependencies
cd servers/gemini-mcp && bun install && cd ../..

# Test your changes
bun run servers/gemini-mcp/src/index.ts
```

---

## What to Contribute

| Area | Examples |
|------|----------|
| **New Providers** | Ollama, Mistral, local model integrations |
| **Role Prompts** | New roles for `prompts/`, improved existing prompts |
| **Rules** | Better delegation triggers, model selection logic |
| **Bug Fixes** | MCP server issues, timeout handling, error messages |
| **Documentation** | README improvements, examples, troubleshooting |

---

## Project Structure

```
claude-delegator/
├── servers/gemini-mcp/     # MCP server (edit this for server changes)
├── rules/                  # Orchestration logic (installed to ~/.claude/rules/)
├── prompts/                # Role prompts (auto-injected by server)
├── commands/               # Slash commands (/setup, /configure)
├── config/                 # Provider registry
├── CLAUDE.md               # Development guidance for Claude Code
└── README.md               # User-facing docs
```

---

## Pull Request Process

### Before Submitting

1. **Test your changes** - Run the MCP server locally
2. **Check TypeScript** - No `any` types, no `@ts-ignore`
3. **Update docs** - If you change behavior, update relevant docs
4. **Keep commits atomic** - One logical change per commit

### PR Guidelines

| Do | Don't |
|----|-------|
| Focus on one change | Bundle unrelated changes |
| Write clear commit messages | Leave vague descriptions |
| Test with actual MCP calls | Assume it works |
| Update CLAUDE.md if needed | Ignore developer docs |

### Commit Message Format

```
type: short description

Longer explanation if needed.
```

Types: `feat`, `fix`, `docs`, `refactor`, `chore`

Examples:
- `feat: add Ollama provider support`
- `fix: handle Gemini CLI timeout correctly`
- `docs: add troubleshooting for auth issues`

---

## Adding a New Provider

1. **Check native MCP support** - If the CLI has `mcp-server` like Codex, no wrapper needed

2. **Create MCP wrapper** (if needed):
   ```
   servers/your-provider-mcp/
   ├── src/
   │   └── index.ts
   ├── package.json
   └── tsconfig.json
   ```

3. **Add to providers.json**:
   ```json
   {
     "your-provider": {
       "cli": "your-cli",
       "mcp": { ... },
       "roles": ["oracle", "librarian"],
       "strengths": ["what it's good at"]
     }
   }
   ```

4. **Add role prompts** (optional):
   ```
   prompts/your-role.md
   ```

5. **Update setup command** - Add checks for the new CLI

6. **Document in README** - Add to provider tables

---

## Code Style

### TypeScript

- No `any` without explicit justification
- No `@ts-ignore` or `@ts-expect-error`
- Use explicit return types on exported functions
- Prefer `unknown` over `any` for truly unknown types

### Markdown (Rules/Prompts)

- Use tables for structured data
- Keep prompts concise and actionable
- Test with actual Claude Code usage

### General

- No build step required - Bun runs TypeScript directly
- Keep dependencies minimal
- Prefer Bun APIs over Node.js equivalents

---

## Testing

No automated test suite. Manual testing:

1. Install the plugin in Claude Code
2. Run `/claude-delegator:setup`
3. Test MCP tool calls:
   ```typescript
   mcp__gemini__gemini({ prompt: "test", role: "librarian" })
   ```
4. Verify responses are properly formatted
5. Test error cases (timeout, auth failure, missing CLI)

---

## Questions?

Open an issue for:
- Feature requests
- Bug reports
- Documentation gaps
- Architecture discussions
