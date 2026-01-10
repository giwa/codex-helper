---
name: setup
description: Configure claude-delegator with Codex MCP server
allowed-tools: Bash, Read, Write, Edit, AskUserQuestion
timeout: 60000
---

# Setup

Configure Codex (GPT) as a strategic advisor via native MCP.

## Step 1: Check Codex CLI

```bash
which codex 2>/dev/null && codex --version 2>&1 | head -1 || echo "CODEX_MISSING"
```

### If Missing

Tell user:
```
Codex CLI not found.

Install with: npm install -g @openai/codex
Then authenticate: codex login

After installation, re-run /claude-delegator:setup
```

**STOP here if Codex is not installed.**

## Step 2: Read Current Settings

```bash
cat ~/.claude/settings.json 2>/dev/null || echo "{}"
```

## Step 3: Configure MCP Server

Merge into `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "codex": {
      "type": "stdio",
      "command": "codex",
      "args": ["-m", "gpt-5.2-codex", "mcp-server"]
    }
  }
}
```

Note: Uses `gpt-5.2-codex` explicitly for the latest model.

**CRITICAL**:
- Merge with existing settings, don't overwrite
- Preserve any existing `mcpServers` entries

## Step 4: Install Orchestration Rules

```bash
mkdir -p ~/.claude/rules/delegator && cp ${CLAUDE_PLUGIN_ROOT}/rules/*.md ~/.claude/rules/delegator/
```

## Step 5: Verify Installation

```bash
ls ~/.claude/rules/delegator/*.md 2>/dev/null | wc -l
```

Should return rule files.

## Step 6: Report Status

```
┌──────────────────────────────────────────────────┐
│            claude-delegator Setup                │
├──────────────────────────────────────────────────┤
│                                                  │
│  Codex CLI:    [✓ Installed / ✗ Missing]        │
│  MCP Config:   ~/.claude/settings.json          │
│  Rules:        ~/.claude/rules/delegator/       │
│                                                  │
│  Status: Ready                                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Step 7: Final Instructions

```
Setup complete!

Next steps:
1. Restart Claude Code to load MCP server
2. Authenticate: Run `codex login` in terminal (if not already done)

Test with: "Ask GPT to review this architecture"

Note: Codex is configured as a strategic advisor (oracle role).
Use for: architecture decisions, complex debugging, code review, security analysis
Avoid for: simple operations, trivial decisions, research, frontend generation
```
