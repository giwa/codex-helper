# Delegation Prompt Templates

When delegating to external models, use these structured templates.

## The 7-Section Format (MANDATORY)

Every delegation prompt MUST include these sections:

```
1. TASK: [One sentence - atomic, specific goal]

2. EXPECTED OUTCOME: [What success looks like]

3. CONTEXT:
   - Current approach: [what's been tried]
   - Relevant code: [paths or snippets]
   - Background: [why this is needed]

4. CONSTRAINTS:
   - Technical: [versions, dependencies]
   - Patterns: [existing conventions to follow]
   - Limitations: [what cannot change]

5. MUST DO:
   - [Requirement 1]
   - [Requirement 2]
   - [Be exhaustive]

6. MUST NOT DO:
   - [Forbidden action 1]
   - [Forbidden action 2]
   - [Anticipate rogue behavior]

7. OUTPUT FORMAT:
   - [How to structure response]
   - [What sections to include]
```

---

## Oracle (GPT) Template

For architecture, debugging, code review, security analysis.

```markdown
TASK: [Analyze/Review/Debug] [specific thing] to [achieve outcome].

EXPECTED OUTCOME: Clear recommendation with rationale, concerns identified, actionable next steps.

CONTEXT:
- Current approach: We're using [pattern/architecture] because [reason].
- Relevant code:
  ```[language]
  [code snippet or file:line reference]
  ```
- Problem: [What's not working or what decision needs to be made]
- Prior attempts: [What's been tried, if applicable]

CONSTRAINTS:
- Must work with [framework/library] version [X]
- Must maintain backward compatibility with [existing feature]
- Cannot change [protected component/API]
- Performance budget: [if applicable]

MUST DO:
- Analyze step by step, showing reasoning
- Consider edge cases and failure modes
- Identify potential issues before they become problems
- Provide concrete, implementable recommendations
- Cite specific code locations when relevant

MUST NOT DO:
- Make assumptions about code you haven't seen
- Suggest solutions that violate stated constraints
- Provide vague or generic advice
- Ignore error handling or edge cases

OUTPUT FORMAT:
1. Summary (2-3 sentences)
2. Analysis (step-by-step reasoning)
3. Concerns (if any)
4. Recommendation (specific, actionable)
5. Implementation notes (if code changes needed)
```

---

## Librarian (Gemini) Template

For research, documentation, best practices lookup.

```markdown
TASK: Research [specific topic/library/pattern] for [use case].

EXPECTED OUTCOME: Best practices, working code examples, common pitfalls to avoid.

CONTEXT:
- Stack: [framework], [language], [relevant libraries]
- Version: [specific versions that matter]
- Goal: [What I'm trying to achieve]
- Current understanding: [What I already know]

CONSTRAINTS:
- Must be compatible with [version]
- Needs to work with [existing pattern]
- Should follow [convention] used in this codebase

MUST DO:
- Cite official documentation when possible
- Include working code examples
- Note version-specific behavior
- Highlight common mistakes and how to avoid them
- Mention any gotchas or edge cases

MUST NOT DO:
- Hallucinate APIs that don't exist
- Mix patterns from different versions
- Provide deprecated solutions
- Ignore error handling in examples

OUTPUT FORMAT:
1. Summary of best approach (2-3 sentences)
2. Code example (working, copy-paste ready)
3. Explanation of key concepts
4. Common pitfalls and how to avoid them
5. Additional resources (if relevant)
```

---

## Frontend Engineer (Gemini) Template

For UI/UX code, components, styling.

```markdown
TASK: [Create/Improve/Style] [component/element] that [does what].

EXPECTED OUTCOME: Production-ready component code with proper styling and accessibility.

CONTEXT:
- Framework: [React/Vue/Svelte/etc.]
- Styling: [Tailwind/CSS-in-JS/SCSS/etc.]
- Design system: [If applicable]
- Existing components: [Related components to match]

CONSTRAINTS:
- Must match existing design patterns in codebase
- Must be accessible (WCAG 2.1 AA)
- Must be responsive (mobile-first)
- Must work with [state management solution]

MUST DO:
- Follow component patterns used elsewhere in codebase
- Include proper TypeScript types
- Handle loading/error/empty states
- Ensure keyboard navigation works
- Use semantic HTML elements

MUST NOT DO:
- Use inline styles (unless Tailwind)
- Ignore accessibility requirements
- Create components that don't match existing design
- Use deprecated APIs or patterns

OUTPUT FORMAT:
1. Component code (complete, working)
2. Usage example
3. Props documentation
4. Styling notes
5. Accessibility considerations
```

---

## Explore (Gemini) Template

For codebase search, pattern finding, understanding structure.

```markdown
TASK: Find [pattern/implementation/usage] of [thing] in this codebase.

EXPECTED OUTCOME: List of relevant files/locations with explanation of how they relate.

CONTEXT:
- Looking for: [What specifically to find]
- Why: [What I need to understand or do]
- Already checked: [Places I've already looked]

CONSTRAINTS:
- Focus on [specific directory/module] if possible
- Prioritize [most relevant type of result]

MUST DO:
- Search thoroughly across the codebase
- Group findings by relevance
- Explain how each finding relates to the search goal
- Note any patterns or conventions discovered

MUST NOT DO:
- Return irrelevant matches
- Miss obvious locations
- Provide findings without context

OUTPUT FORMAT:
1. Summary of what was found
2. Key locations (file:line with explanation)
3. Patterns observed
4. Recommendations (if applicable)
```

---

## Quick Reference

| Role | Model | Template Focus |
|------|-------|----------------|
| Oracle | GPT | Deep analysis, tradeoffs, recommendations |
| Librarian | Gemini | Research, examples, documentation |
| Frontend Engineer | Gemini | UI code, styling, accessibility |
| Explore | Gemini | Codebase search, pattern finding |

---

## Anti-Patterns

### Don't Do This

```
"Can you help me with this code?"
```

### Do This Instead

```
TASK: Review this authentication middleware for security vulnerabilities.

EXPECTED OUTCOME: List of vulnerabilities with severity ratings and fixes.

CONTEXT:
- Current code:
  [code snippet]
- This handles: JWT validation for API routes
- Deployed to: Production, ~10k requests/day

...
```

The structured format ensures:
- External model has full context
- No ambiguity in what's expected
- Consistent, actionable responses
- Easier to verify the output meets requirements
