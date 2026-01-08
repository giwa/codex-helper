---
description: Configure claude-delegator MCP servers and install orchestration rules
allowed-tools: Bash, Read, Write, Edit, AskUserQuestion
---

# Setup

Configure MCP servers and install orchestration rules for claude-delegator.

## Step 1: Detect Prerequisites

Run these checks in parallel:

```bash
# Check Bun
which bun 2>/dev/null && echo "BUN_VERSION=$(bun --version)" || echo "BUN_MISSING"
```

```bash
# Check Codex CLI
which codex 2>/dev/null && echo "CODEX_VERSION=$(codex --version 2>&1 | head -1)" || echo "CODEX_MISSING"
```

```bash
# Check Gemini CLI
which gemini 2>/dev/null && echo "GEMINI_VERSION=$(gemini --version 2>&1 | head -1)" || echo "GEMINI_MISSING"
```

### If Missing

| Missing | Action |
|---------|--------|
| Bun | Tell user: `curl -fsSL https://bun.sh/install \| bash` then restart terminal |
| Codex | Tell user: `npm install -g @openai/codex` |
| Gemini | Tell user: `npm install -g @google/gemini-cli` |

**If Bun is missing, STOP here.** The MCP server requires Bun.

## Step 2: Install Gemini MCP Dependencies

```bash
cd ${CLAUDE_PLUGIN_ROOT}/servers/gemini-mcp && bun install 2>&1
```

If this fails, report the error and stop.

## Step 3: Read Current Settings

```bash
cat ~/.claude/settings.json 2>/dev/null || echo "{}"
```

## Step 4: Configure MCP Servers

Merge the following into `~/.claude/settings.json`:

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

**CRITICAL**:
- Replace `${CLAUDE_PLUGIN_ROOT}` with the actual absolute path
- Merge with existing settings, don't overwrite
- Preserve any existing `mcpServers` entries

## Step 5: Install Orchestration Rules

```bash
mkdir -p ~/.claude/rules/delegator && cp ${CLAUDE_PLUGIN_ROOT}/rules/*.md ~/.claude/rules/delegator/
```

## Step 6: Verify Installation

```bash
# Count installed rules
ls ~/.claude/rules/delegator/*.md 2>/dev/null | wc -l
```

Should return 4 (orchestration.md, triggers.md, model-selection.md, delegation-format.md).

## Step 7: Report Status

Display this summary:

```
┌──────────────────────────────────────────────────┐
│            claude-delegator Setup                 │
├──────────────────────────────────────────────────┤
│                                                   │
│  Prerequisites                                    │
│  ├─ Bun:        [✓ v1.x.x / ✗ Missing]           │
│  ├─ Codex CLI:  [✓ Installed / ✗ Missing]        │
│  └─ Gemini CLI: [✓ Installed / ✗ Missing]        │
│                                                   │
│  Installation                                     │
│  ├─ MCP Config:   ~/.claude/settings.json        │
│  └─ Rules:        ~/.claude/rules/delegator/     │
│                                                   │
│  Status: [Ready / Partial - see issues above]    │
│                                                   │
└──────────────────────────────────────────────────┘
```

## Step 8: Provider Selection (Optional)

Ask user:

**Question**: "Which providers would you like enabled?"
**Options**:
- "Both Codex (GPT) and Gemini (Recommended)" - Keeps both
- "Codex (GPT) only" - Remove Gemini from mcpServers
- "Gemini only" - Remove Codex from mcpServers

Modify `~/.claude/settings.json` based on selection.

## Step 9: Final Instructions

```
Setup complete!

Next steps:
1. Restart Claude Code to load MCP servers
2. Authenticate providers:
   - Codex: Run `codex login` in terminal
   - Gemini: Set GOOGLE_API_KEY or run `gcloud auth application-default login`

Test with: "Ask GPT about best practices for error handling"

Use `/claude-delegator:configure` to modify providers later.
```
