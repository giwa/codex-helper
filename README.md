# claude-delegator

Multi-model orchestration via MCP. External AI models (GPT, Gemini) as native Claude Code tool providers.

![MCP Tools](https://img.shields.io/badge/Integration-MCP%20Tools-blue)
![Providers](https://img.shields.io/badge/Providers-Codex%20%7C%20Gemini-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Overview

**claude-delegator** makes external AI models feel native in Claude Code:

- **GPT** (via Codex) - Strategic reasoning, architecture, complex debugging
- **Gemini** - Research, documentation, frontend, multimodal analysis

No wrapper agents. No background task hacks. Just native MCP tools that Claude can call directly.

```
User: "Get GPT's opinion on this architecture"

Claude: I'll consult GPT for analysis.
        [Calls mcp__codex__codex({ prompt: "Analyze...", model: "gpt-5.2" })]

GPT: The architecture has these concerns...

Claude: Based on GPT's analysis, I recommend...
```

## Installation

### Prerequisites

```bash
# Install CLIs
npm install -g @openai/codex
npm install -g @google/gemini-cli

# Install Bun (for Gemini MCP server)
curl -fsSL https://bun.sh/install | bash

# Authenticate
codex login
# For Gemini: set GOOGLE_API_KEY or use gcloud auth
```

### Plugin Installation

```bash
# Clone the repo
cd ~/.claude/plugins
git clone https://github.com/jarrodwatts/claude-delegator
cd claude-delegator

# Install Gemini MCP server dependencies
cd servers/gemini-mcp
bun install
cd ../..

# Run setup (configures MCP servers and installs rules)
# In Claude Code:
/claude-delegator:setup
```

## Quick Start

Once installed, Claude automatically knows when to delegate:

```
# Research (→ Gemini)
"How do I implement optimistic updates in React Query v5?"

# Architecture review (→ GPT)
"Review this database schema for potential issues"

# Explicit delegation
"Ask GPT about the security implications of this auth flow"
```

## Available Tools

| Tool | Provider | Use For |
|------|----------|---------|
| `mcp__codex__codex` | GPT | Architecture, debugging, code review |
| `mcp__codex__codex-reply` | GPT | Continue GPT conversation |
| `mcp__gemini__gemini` | Gemini | Research, docs, frontend, multimodal |
| `mcp__gemini__gemini-reply` | Gemini | Continue Gemini conversation |

## When to Use Each Model

### GPT (Codex)
- Complex architecture decisions
- After 2+ failed debugging attempts
- Security/performance analysis
- Code review requiring deep reasoning

### Gemini
- Library/framework research
- Documentation writing
- Frontend/UI code generation
- Multimodal analysis (images, PDFs)
- Quick best practices lookup

## Commands

| Command | Description |
|---------|-------------|
| `/claude-delegator:setup` | Configure MCP servers and install rules |
| `/claude-delegator:configure` | Add/remove/customize providers |

## How It Works

### Architecture

```
claude-delegator/
├── servers/
│   └── gemini-mcp/           # MCP server for Gemini CLI
├── rules/                    # Installs to ~/.claude/rules/delegator/
│   ├── orchestration.md      # Main delegation logic
│   ├── triggers.md           # When to delegate
│   ├── model-selection.md    # Which model for what
│   └── delegation-format.md  # Prompt templates
├── prompts/                  # Auto-injected system prompts
│   ├── oracle.md             # GPT: strategic advisor
│   ├── librarian.md          # Gemini: research
│   ├── frontend-engineer.md  # Gemini: UI/UX
│   └── explore.md            # Gemini: codebase search
├── config/
│   └── providers.json        # Provider registry
├── commands/
│   ├── setup.md              # Initial configuration
│   └── configure.md          # Provider management
└── CLAUDE.md                 # Plugin overview
```

### MCP Integration

Codex already has `codex mcp-server` built-in. For Gemini, we provide a thin MCP wrapper (~200 lines) that:

1. Spawns `gemini` CLI as a child process
2. Captures output with smart error handling
3. Supports conversation continuation via `--resume`
4. Auto-injects role prompts based on task type

### Orchestration Rules

The plugin installs comprehensive rules to `~/.claude/rules/delegator/`:

- **Autonomous delegation** - Claude decides when to delegate based on semantic intent
- **Both explicit + semantic triggers** - "Ask GPT" works, so does asking about libraries
- **7-section prompt format** - Structured delegation for consistent results
- **Response synthesis** - Claude always interprets external model responses

## Examples

### Research with Gemini

```typescript
mcp__gemini__gemini({
  prompt: "Best practices for React Query v5 optimistic updates",
  role: "librarian",
  model: "gemini-2.5-pro"
})
```

### Architecture Review with GPT

```typescript
mcp__codex__codex({
  prompt: "Review this caching architecture for potential issues",
  model: "gpt-5.2",
  "approval-policy": "on-request"
})
```

### Parallel Consultation

For critical decisions, Claude can consult both models:

```typescript
// Claude calls both in parallel for important decisions
mcp__codex__codex({ prompt: "Analyze tradeoffs..." })
mcp__gemini__gemini({ prompt: "Research implementation patterns...", role: "librarian" })

// Then synthesizes both perspectives
```

### Conversation Continuation

```typescript
// First call
mcp__codex__codex({ prompt: "Design a caching strategy..." })
// Returns conversationId

// Follow-up
mcp__codex__codex-reply({
  conversationId: "abc123",
  prompt: "What about cache invalidation?"
})
```

## Configuration

### Manual MCP Setup

If `/setup` doesn't work, manually add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "codex": {
      "type": "stdio",
      "command": "codex",
      "args": ["mcp-server"]
    },
    "gemini": {
      "type": "stdio",
      "command": "bun",
      "args": ["run", "/path/to/claude-delegator/servers/gemini-mcp/src/index.ts"]
    }
  }
}
```

### Role Prompts

Customize behavior by editing files in `prompts/`:

| Role | File | Behavior |
|------|------|----------|
| oracle | `prompts/oracle.md` | Strategic advisor for GPT |
| librarian | `prompts/librarian.md` | Research specialist for Gemini |
| frontend-engineer | `prompts/frontend-engineer.md` | UI/UX code generator |
| explore | `prompts/explore.md` | Codebase navigator |

## Adding Custom Providers

Use `/claude-delegator:configure add custom` for interactive setup, or manually:

1. Check if CLI has native MCP server (like Codex)
2. If not, create a wrapper in `servers/your-provider-mcp/`
3. Add to `~/.claude/settings.json`
4. Optionally add role prompts to `prompts/`

## Troubleshooting

### "MCP server not found"

Restart Claude Code after modifying `~/.claude/settings.json`.

### "Codex not authenticated"

Run `codex login` and try again.

### "Gemini timeout"

Default timeout is 10 minutes. For longer tasks, use the `timeout` parameter:

```typescript
mcp__gemini__gemini({
  prompt: "...",
  timeout: 900000  // 15 minutes
})
```

### "Command not found: bun"

Install Bun: `curl -fsSL https://bun.sh/install | bash`

## Contributing

Contributions welcome! Areas of interest:

- New provider integrations (Ollama, Mistral, etc.)
- Improved role prompts
- Better error handling
- Documentation improvements

## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

- Inspired by [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) orchestration patterns
- Built for [Claude Code](https://claude.com/claude-code)
- Uses [Model Context Protocol](https://github.com/modelcontextprotocol) for native integration
