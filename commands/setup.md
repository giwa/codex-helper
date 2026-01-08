---
description: Configure claude-delegator MCP servers and install rules
allowed-tools: Bash, Read, Write, Edit, AskUserQuestion
---

# Setup

This command configures MCP servers and installs orchestration rules.

## Step 1: Check Prerequisites

### Check Bun
```bash
which bun 2>/dev/null && bun --version
```

**If not found**: Tell user to install: `curl -fsSL https://bun.sh/install | bash`

### Check Codex CLI
```bash
which codex 2>/dev/null && codex --version 2>&1 | head -3
```

**If not found**: `npm install -g @openai/codex`

### Check Gemini CLI
```bash
which gemini 2>/dev/null && gemini --version 2>&1 | head -3
```

**If not found**: `npm install -g @google/gemini-cli`

## Step 2: Install Gemini MCP Server Dependencies

```bash
cd ${CLAUDE_PLUGIN_ROOT}/servers/gemini-mcp && bun install
```

## Step 3: Configure MCP Servers

Read the user's current settings:
```bash
cat ~/.claude/settings.json 2>/dev/null || echo "{}"
```

Add the MCP server configurations to `~/.claude/settings.json`:

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
      "args": ["run", "${CLAUDE_PLUGIN_ROOT}/servers/gemini-mcp/src/index.ts"]
    }
  }
}
```

Replace `${CLAUDE_PLUGIN_ROOT}` with the actual plugin path.

**IMPORTANT**: Merge with existing settings, don't overwrite.

## Step 4: Install Rules

Copy orchestration rules to `~/.claude/rules/delegator/`:

```bash
mkdir -p ~/.claude/rules/delegator
cp ${CLAUDE_PLUGIN_ROOT}/rules/*.md ~/.claude/rules/delegator/
```

## Step 5: Verify Installation

### Test Codex MCP
```bash
codex mcp-server --help 2>&1 | head -3
```

### Test Gemini MCP
```bash
bun run ${CLAUDE_PLUGIN_ROOT}/servers/gemini-mcp/src/index.ts --help 2>&1 | head -3
```

## Step 6: Report Status

Present a summary:

```
┌─────────────────────────────────────────────┐
│         claude-delegator Setup              │
├─────────────────────────────────────────────┤
│ Bun:          [✓ Installed / ✗ Missing]     │
│ Codex CLI:    [✓ Installed / ✗ Missing]     │
│ Gemini CLI:   [✓ Installed / ✗ Missing]     │
│ MCP Config:   [✓ Configured / ✗ Missing]    │
│ Rules:        [✓ Installed / ✗ Missing]     │
└─────────────────────────────────────────────┘
```

## Step 7: Interactive Customization

Ask user:

**Question**: "Would you like to customize which providers are enabled?"
**Options**:
- "Keep both Codex and Gemini (Recommended)"
- "Enable Codex (GPT) only"
- "Enable Gemini only"
- "Configure custom provider"

Based on selection, modify the MCP configuration accordingly.

## Step 8: Test Connection

**Question**: "Would you like to test the connections now?"
**Options**:
- "Yes, test both"
- "Test Codex only"
- "Test Gemini only"
- "Skip testing"

If testing:
- For Codex: Make a simple MCP call and verify response
- For Gemini: Make a simple MCP call and verify response

## Success Message

```
✓ claude-delegator configured successfully!

MCP servers added to ~/.claude/settings.json
Rules installed to ~/.claude/rules/delegator/

You may need to restart Claude Code for MCP changes to take effect.

Use `/claude-delegator:configure` to modify providers later.
```
