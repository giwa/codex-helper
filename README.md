# claude-delegator

![MCP Tools](https://img.shields.io/badge/Integration-MCP%20Tools-blue)
![Providers](https://img.shields.io/badge/Providers-Codex%20%7C%20Gemini-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

External AI models as native Claude Code tools. GPT and Gemini become first-class MCP providers.

---

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

Done! Claude now has access to GPT and Gemini as native tools.

> **Note**: You'll need the CLI tools installed. The setup command will check and guide you.

---

## What is claude-delegator?

Claude Code gains autonomous access to external AI models via MCP. No wrapper agents, no background task hacks—just native tool calls.

| Feature | What It Does |
|---------|-------------|
| **Native MCP Tools** | `mcp__codex__codex` and `mcp__gemini__gemini` appear as regular tools |
| **Autonomous Delegation** | Claude decides when to consult GPT or Gemini based on task type |
| **Role Prompts** | Auto-injected system prompts shape model behavior (oracle, librarian, etc.) |
| **Conversation Memory** | Continue multi-turn conversations with `-reply` tools |
| **Response Synthesis** | Claude interprets and evaluates external responses, never raw passthrough |

### When Each Model Gets Used

| Model | Triggered By | Example Tasks |
|-------|--------------|---------------|
| **GPT (Codex)** | Architecture, security, debugging failures | "Review this auth flow", "Why does this keep failing?" |
| **Gemini** | Research, docs, frontend, multimodal | "How do I use React Query v5?", "Generate a dashboard component" |

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        Claude Code                               │
│                                                                  │
│   User: "How should I structure this caching layer?"            │
│                                                                  │
│   Claude: [Detects architecture question]                        │
│           [Calls mcp__codex__codex with oracle role]            │
│                                                                  │
│           ┌──────────────────────────────────────┐              │
│           │  MCP Server: codex                   │              │
│           │  → codex mcp-server (native)         │              │
│           │  → Returns GPT analysis              │              │
│           └──────────────────────────────────────┘              │
│                                                                  │
│   Claude: "Based on GPT's analysis, I recommend..."             │
└─────────────────────────────────────────────────────────────────┘
```

### Plugin Structure

```
claude-delegator/
├── servers/
│   └── gemini-mcp/           # MCP wrapper for Gemini CLI
│       └── src/index.ts      # Spawns gemini CLI, handles I/O
├── rules/                    # Installed to ~/.claude/rules/delegator/
│   ├── orchestration.md      # When to delegate
│   ├── triggers.md           # Explicit + semantic triggers
│   ├── model-selection.md    # GPT vs Gemini decision matrix
│   └── delegation-format.md  # 7-section prompt structure
├── prompts/                  # Auto-injected based on role parameter
│   ├── oracle.md             # Strategic advisor (GPT)
│   ├── librarian.md          # Research specialist (Gemini)
│   ├── frontend-engineer.md  # UI/UX code generation (Gemini)
│   └── explore.md            # Codebase navigation (Gemini)
├── commands/
│   ├── setup.md              # /claude-delegator:setup
│   └── configure.md          # /claude-delegator:configure
└── config/
    └── providers.json        # Provider registry
```

### MCP Integration

**Codex (GPT)**: Uses the native `codex mcp-server` command—no wrapper needed.

**Gemini**: Requires our wrapper (`servers/gemini-mcp/`) because the Gemini CLI lacks native MCP support. The wrapper:
- Spawns `gemini` CLI as child process via `Bun.spawn()`
- Auto-injects role prompts based on `role` parameter
- Tracks active processes for cleanup on shutdown
- Uses `didTimeout` flag for accurate timeout detection

---

## Configuration

### Available Tools

| Tool | Provider | Description |
|------|----------|-------------|
| `mcp__codex__codex` | GPT | Start a new conversation with GPT |
| `mcp__codex__codex-reply` | GPT | Continue an existing GPT conversation |
| `mcp__gemini__gemini` | Gemini | Start a new conversation with Gemini |
| `mcp__gemini__gemini-reply` | Gemini | Continue an existing Gemini conversation |

### Role Prompts

Pass `role` to shape model behavior:

| Role | Model | Behavior |
|------|-------|----------|
| `oracle` | GPT | Strategic advisor—architecture, security, complex debugging |
| `librarian` | Gemini | Research specialist—docs, best practices, library usage |
| `frontend-engineer` | Gemini | UI/UX code generation—components, styling, interactions |
| `explore` | Gemini | Codebase navigation—finding patterns, understanding structure |

### Example Calls

```typescript
// Research with Gemini
mcp__gemini__gemini({
  prompt: "Best practices for React Query v5 optimistic updates",
  role: "librarian"
})

// Architecture review with GPT
mcp__codex__codex({
  prompt: "Review this caching architecture for race conditions",
  model: "gpt-5.2"
})

// Continue a conversation
mcp__codex__codex-reply({
  conversationId: "abc123",
  prompt: "What about cache invalidation strategies?"
})
```

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

Replace `/path/to/claude-delegator` with the actual plugin location.

---

## Requirements

| Dependency | Version | Installation |
|------------|---------|--------------|
| Bun | >= 1.0 | `curl -fsSL https://bun.sh/install \| bash` |
| Codex CLI | Latest | `npm install -g @openai/codex` |
| Gemini CLI | Latest | `npm install -g @google/gemini-cli` |

### Authentication

```bash
# Codex (GPT)
codex login

# Gemini
# Option 1: API key
export GOOGLE_API_KEY=your-key

# Option 2: gcloud auth
gcloud auth application-default login
```

---

## Commands

| Command | Description |
|---------|-------------|
| `/claude-delegator:setup` | Configure MCP servers, install rules, verify prerequisites |
| `/claude-delegator:configure` | Add, remove, or customize providers |

---

## Development

### Setup

```bash
# Clone (if not using plugin marketplace)
cd ~/.claude/plugins
git clone https://github.com/jarrodwatts/claude-delegator
cd claude-delegator

# Install Gemini MCP server dependencies
cd servers/gemini-mcp && bun install
```

### Running the MCP Server Locally

```bash
cd servers/gemini-mcp
bun run src/index.ts
```

No build step—Bun runs TypeScript directly.

### Testing

Manual testing only (no automated test suite):

1. Ensure `gemini` CLI is installed and authenticated
2. Run the MCP server
3. Send MCP tool calls via stdio

### Adding a New Provider

1. Check if the CLI has native MCP support (like Codex)
2. If not, create a wrapper in `servers/your-provider-mcp/`
3. Add configuration to `config/providers.json`
4. Optionally add role prompts to `prompts/`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MCP server not found | Restart Claude Code after modifying `~/.claude/settings.json` |
| Codex not authenticated | Run `codex login` |
| Gemini timeout | Increase timeout: `mcp__gemini__gemini({ timeout: 900000 })` (15 min) |
| Command not found: bun | Install Bun: `curl -fsSL https://bun.sh/install \| bash` |
| Gemini auth failed | Set `GOOGLE_API_KEY` or run `gcloud auth application-default login` |

---

## License

MIT License - see [LICENSE](LICENSE) for details.
