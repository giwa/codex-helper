---
description: Configure claude-delegator MCP servers and install orchestration rules
allowed-tools: Bash, Read, Write, Edit, AskUserQuestion
---

# Setup

Configure MCP servers and install orchestration rules for claude-delegator.

## Step 1: Detect Prerequisites

Run these checks in parallel:

```bash
# Check package managers (in order of preference)
which bun 2>/dev/null && echo "PKG_MANAGER=bun" || \
which npm 2>/dev/null && echo "PKG_MANAGER=npm" || \
which yarn 2>/dev/null && echo "PKG_MANAGER=yarn" || \
echo "PKG_MANAGER=NONE"
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
| No package manager | Tell user to install Node.js from https://nodejs.org (includes npm). **STOP here.** |
| Both Codex and Gemini | Tell user to install at least one. **STOP here.** |
| Only Codex missing | Inform user, continue with Gemini only |
| Only Gemini missing | Inform user, continue with Codex only |

**Graceful degradation**: If only one provider CLI is installed, configure that one and skip the other. The plugin works with either or both providers.

## Step 2: Install Gemini MCP Dependencies (if Gemini CLI available)

**Skip this step if Gemini CLI is not installed.**

Use the detected package manager:

```bash
# If bun
cd ${CLAUDE_PLUGIN_ROOT}/servers/gemini-mcp && bun install 2>&1

# If npm
cd ${CLAUDE_PLUGIN_ROOT}/servers/gemini-mcp && npm install 2>&1

# If yarn
cd ${CLAUDE_PLUGIN_ROOT}/servers/gemini-mcp && yarn install 2>&1
```

If this fails, warn user but continue (Codex will still work).

## Step 3: Read Current Settings

```bash
cat ~/.claude/settings.json 2>/dev/null || echo "{}"
```

## Step 4: Configure MCP Servers

Merge into `~/.claude/settings.json`. **Only include providers whose CLIs are installed.**

### Codex config (if Codex CLI installed):
```json
{
  "mcpServers": {
    "codex": {
      "type": "stdio",
      "command": "codex",
      "args": ["mcp-server"]
    }
  }
}
```

### Gemini config (if Gemini CLI installed):

**If bun:**
```json
{
  "mcpServers": {
    "gemini": {
      "type": "stdio",
      "command": "bun",
      "args": ["run", "${CLAUDE_PLUGIN_ROOT}/servers/gemini-mcp/src/index.ts"]
    }
  }
}
```

**If npm or yarn:**
```json
{
  "mcpServers": {
    "gemini": {
      "type": "stdio",
      "command": "npx",
      "args": ["tsx", "${CLAUDE_PLUGIN_ROOT}/servers/gemini-mcp/src/index.ts"]
    }
  }
}
```

**CRITICAL**:
- Replace `${CLAUDE_PLUGIN_ROOT}` with the actual absolute path
- Merge with existing settings, don't overwrite
- Preserve any existing `mcpServers` entries
- Only add providers whose CLIs are available

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
│  ├─ Package Manager: [✓ bun/npm/yarn / ✗ None]   │
│  ├─ Codex CLI:       [✓ Installed / ✗ Missing]   │
│  └─ Gemini CLI:      [✓ Installed / ✗ Missing]   │
│                                                   │
│  Configured Providers                             │
│  ├─ Codex (GPT):     [✓ Configured / ⊘ Skipped]  │
│  └─ Gemini:          [✓ Configured / ⊘ Skipped]  │
│                                                   │
│  Installation                                     │
│  ├─ MCP Config:   ~/.claude/settings.json        │
│  └─ Rules:        ~/.claude/rules/delegator/     │
│                                                   │
│  Status: [Ready / Partial]                        │
│                                                   │
└──────────────────────────────────────────────────┘
```

**Status meanings:**
- **Ready**: At least one provider configured successfully
- **Partial**: Some providers skipped (missing CLI), but plugin is functional

## Step 8: Provider Selection (Optional)

**Only ask if both providers are configured.** Skip if only one provider is available.

**Question**: "Which providers would you like enabled?"
**Options**:
- "Both Codex (GPT) and Gemini (Recommended)" - Keeps both
- "Codex (GPT) only" - Remove Gemini from mcpServers
- "Gemini only" - Remove Codex from mcpServers

Modify `~/.claude/settings.json` based on selection.

## Step 9: Final Instructions

Customize based on configured providers:

**If both providers configured:**
```
Setup complete!

Next steps:
1. Restart Claude Code to load MCP servers
2. Authenticate providers:
   - Codex: Run `codex login` in terminal
   - Gemini: Set GOOGLE_API_KEY or run `gcloud auth application-default login`

Test with: "Ask GPT about best practices for error handling"
```

**If only Codex configured:**
```
Setup complete! (Codex only)

Next steps:
1. Restart Claude Code to load MCP servers
2. Authenticate: Run `codex login` in terminal

Test with: "Ask GPT about best practices for error handling"

To add Gemini later: Install `npm install -g @google/gemini-cli` then re-run /claude-delegator:setup
```

**If only Gemini configured:**
```
Setup complete! (Gemini only)

Next steps:
1. Restart Claude Code to load MCP servers
2. Authenticate: Set GOOGLE_API_KEY or run `gcloud auth application-default login`

Test with: "Ask Gemini about React best practices"

To add Codex later: Install `npm install -g @openai/codex` then re-run /claude-delegator:setup
```

Use `/claude-delegator:configure` to modify providers later.
