# Model Selection Guidelines

Choose the right model for each task type.

## GPT (Codex) — Strategic Advisor

**Tool:** `mcp__codex__codex`

### Use GPT For

- **Architecture decisions** - System design, database schemas, API design
- **Complex debugging** - After 2+ failed attempts, fresh perspective
- **Security analysis** - Threat modeling, vulnerability assessment
- **Performance analysis** - Bottleneck identification, optimization strategies
- **Code review** - Multi-system thinking, edge case identification
- **Design patterns** - Choosing patterns, understanding tradeoffs
- **Refactoring decisions** - When and how to refactor
- **Technical debt assessment** - Priority and approach

### GPT Characteristics

| Trait | Description |
|-------|-------------|
| Deep reasoning | Step-by-step logical analysis |
| Edge case awareness | Good at "what if" scenarios |
| Tradeoff analysis | Balances multiple concerns |
| Cost | More expensive per call |
| Speed | Slower but thorough |

### GPT Parameters

```typescript
mcp__codex__codex({
  prompt: "...",
  model: "gpt-5.2",              // or "o3" for complex reasoning
  "approval-policy": "on-request", // ask before tool use
  "developer-instructions": "..."  // role prompt injection
})
```

---

## Gemini — Research & Implementation

**Tool:** `mcp__gemini__gemini`

### Use Gemini For

- **Library research** - How to use APIs, best practices
- **Documentation** - Writing and improving docs
- **Frontend/UI code** - Components, styling, responsive design
- **Multimodal analysis** - Images, PDFs, diagrams
- **Codebase exploration** - Finding patterns, understanding structure
- **Best practices lookup** - Framework-specific guidance
- **Quick answers** - When you need fast research

### Gemini Characteristics

| Trait | Description |
|-------|-------------|
| Large context | Can process extensive docs |
| Synthesis | Good at combining multiple sources |
| Speed | Faster responses |
| Cost | Cheaper per call |
| Creativity | Good for UI/UX suggestions |

### Gemini Parameters

```typescript
mcp__gemini__gemini({
  prompt: "...",
  model: "gemini-2.5-pro",     // or "gemini-2.5-flash" for speed
  role: "librarian",           // auto-inject role prompt
  "approval-mode": "yolo",     // auto-approve tool use
  timeout: 300000              // 5 min for research tasks
})
```

---

## Decision Matrix

| Task Type | Primary | Fallback | Notes |
|-----------|---------|----------|-------|
| Architecture review | GPT | - | Always GPT for architecture |
| Library research | Gemini | - | Gemini's strength |
| Code review | GPT | - | GPT for logical analysis |
| Documentation | Gemini | - | Gemini writes well |
| Complex debugging | GPT | - | After you've tried |
| UI/UX code | Gemini | - | Gemini for creativity |
| Performance analysis | GPT | - | GPT for deep analysis |
| API integration | Gemini | GPT | Start with Gemini research |
| Security audit | GPT | - | Always GPT for security |
| Quick lookup | Gemini | - | Fast and cheap |

---

## Cost-Benefit Analysis

### When GPT is Worth the Cost

- Architectural decisions with long-term impact
- Security concerns that could cause vulnerabilities
- After multiple failed attempts (fresh perspective)
- Complex multi-system interactions
- Decisions affecting system scalability

### When to Use Cheaper Gemini

- Research that doesn't require deep reasoning
- Frontend work (Gemini is creative)
- Documentation tasks
- Quick best-practice lookups
- Exploratory questions

---

## Parallel Consultation

For critical decisions, consult both:

```typescript
// Launch in parallel for important decisions
const gptPromise = mcp__codex__codex({
  prompt: "Analyze tradeoffs of [approach]..."
});
const geminiPromise = mcp__gemini__gemini({
  prompt: "Research implementation patterns for [approach]...",
  role: "librarian"
});

// Synthesize both perspectives
```

### When to Use Parallel

| Situation | Reason |
|-----------|--------|
| Major architecture decision | Get both reasoning AND research |
| Unfamiliar domain | GPT for tradeoffs, Gemini for patterns |
| High-stakes refactor | Verify approach from multiple angles |
| User explicitly asks | "Get both opinions" |

---

## Model Parameters Reference

### Codex (GPT) Parameters

| Parameter | Values | Default | Notes |
|-----------|--------|---------|-------|
| `model` | `gpt-5.2`, `o3`, etc. | - | Choose based on task complexity |
| `approval-policy` | `untrusted`, `on-failure`, `on-request`, `never` | `on-request` | Controls tool approval |
| `sandbox` | `read-only`, `workspace-write`, `danger-full-access` | `read-only` | File access level |
| `cwd` | path | current | Working directory |
| `developer-instructions` | string | - | System prompt injection |

### Gemini Parameters

| Parameter | Values | Default | Notes |
|-----------|--------|---------|-------|
| `model` | `gemini-2.5-pro`, `gemini-2.5-flash` | `gemini-2.5-pro` | Pro for quality, Flash for speed |
| `role` | `oracle`, `librarian`, `frontend-engineer`, `explore` | - | Auto-inject role prompt |
| `approval-mode` | `default`, `auto_edit`, `yolo` | `yolo` | Tool approval mode |
| `sandbox` | boolean | false | Sandbox mode |
| `cwd` | path | current | Working directory |
| `timeout` | number (ms) | 600000 | 10 min default |
