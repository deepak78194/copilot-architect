# Instruction Design Patterns

Reference knowledge for generating production-grade `.instructions.md` files.

---

## What Are Instructions?

Instructions are **always-on behavioral rules** automatically loaded by Copilot based on file pattern (`applyTo`). They shape how Copilot generates code within matched file contexts — without the user needing to invoke anything.

**Do NOT use instructions for:**
- One-time task execution → use a skill or prompt instead
- Heavy reference material → use a skill with references/ folder
- Persona definition → use an agent

**DO use instructions for:**
- Coding standards that must apply to every file of a type
- Security rules that should never be bypassed
- Project-specific conventions that differ from defaults
- Anything that should be enforced silently and always

---

## Frontmatter Specification

```yaml
---
name: '<Display Name: what these instructions enforce>'
description: '<50-150 chars: what these instructions cover and when they apply>'
applyTo: '<glob pattern>'
---
```

### `applyTo` Pattern Reference

| Pattern | When to use |
|---|---|
| `'**'` | True global rules: security baseline, team-wide conventions |
| `'**/*.{ts,tsx}'` | TypeScript-specific rules |
| `'**/*.{spec,test}.{ts,js}'` | Test file conventions |
| `'**/*.py'` | Python files |
| `'**/*.{cs,vb}'` | C# / VB.NET |
| `'**/*.agent.md'` | Only when working on agent files |
| `'src/**'` | Scoped to source directory |
| `'**/*.{ts,js,py,java,cs,go,rb,php,rs}'` | All major source languages |

**Rule**: The narrower the `applyTo`, the better. Avoid `'**'` unless the rule truly applies universally. Context bloat from overloaded global instructions degrades output.

---

## File Naming Convention

```
<domain>-<aspect>.instructions.md
```

Examples:
- `typescript.instructions.md` — TypeScript language conventions
- `security-owasp.instructions.md` — OWASP security rules
- `testing-vitest.instructions.md` — Vitest-specific test patterns
- `api-design-rest.instructions.md` — REST API design rules

**One concern per file**. If a file covers 3+ unrelated topics, split it.

---

## Instruction Body Structure

```markdown
---
[frontmatter]
---

# <Title: What Domain This Covers>

## <Category 1>
[Rules for category 1]
- Rule: [specific, verifiable statement]
- Rule: [...]

## <Category 2>
[Rules for category 2]
```

### Rule Quality Bar

Every rule must be:

1. **Specific** — not "write clean code" but "prefer `const` assertions over type widening when the value is a fixed object"
2. **Actionable** — the agent can check compliance during generation
3. **Verifiable** — a reviewer could pass/fail the rule objectively
4. **Scoped** — relevant to the files matched by `applyTo`

```
❌ "Write good, maintainable code"           — too vague
❌ "Consider performance"                    — not actionable
✅ "Avoid O(n²) loops over collections > 1000 items; prefer indexed structures"
✅ "Never use MD5 or SHA-1 for password hashing; use bcrypt or Argon2"
✅ "Prefer named exports over default exports"
```

---

## Layering Strategy

Instructions load additionally — all matching files are active simultaneously. Design for layering:

```
Layer 1: .github/copilot-instructions.md (applyTo: '**')
         → Global team-wide baseline. Keep MINIMAL. Max 30 rules.

Layer 2: .github/instructions/security.instructions.md (applyTo: source files)
         → Security rules across all source code.

Layer 3: .github/instructions/typescript.instructions.md (applyTo: '**/*.{ts,tsx}')
         → TypeScript-specific idioms and patterns.

Layer 4: .github/instructions/testing.instructions.md (applyTo: '**/*.{spec,test}.*')
         → Test file conventions.
```

**No conflicts**: rules in narrower-scoped files should not contradict broader ones. When designing a new instructions file, read the existing ones to check for conflicts.

**Token budget**: every active instruction file consumes context. Budget accordingly:
- Global (Layer 1): < 500 tokens
- Domain-specific (Layer 2-3): < 800 tokens each
- Keep total active instructions under 3000 tokens in any given file context

---

## Common Instruction Categories

### Language / Framework Instructions
```yaml
applyTo: '**/*.{ts,tsx}'    # or .py, .cs, .java, .go, etc.
```
Content: type system usage, idioms, naming, import conventions, async patterns

### Security Instructions
```yaml
applyTo: '**/*.{ts,js,py,java,cs,go,rb,php,rs}'
```
Content: OWASP rules, input validation, cryptography, injection prevention

### Testing Instructions
```yaml
applyTo: '**/*.{spec,test}.{ts,js,py,java,cs}'
```
Content: test structure (AAA), naming, mock discipline, coverage expectations, flakiness prevention

### API Design Instructions
```yaml
applyTo: 'src/api/**'   # or wherever APIs live
```
Content: REST conventions, versioning, error response format, authentication patterns

### Architecture Instructions
```yaml
applyTo: '**/*.{ts,js}'
```
Content: module boundaries, dependency direction, what goes where

### CI/CD Instructions
```yaml
applyTo: '.github/workflows/**/*.yml'
```
Content: job structure, security (pinned actions), secret handling, caching

---

## How to Write Good Instructions: Decision Tree

```
Is this rule always true for every file of this type?
  YES → Put in instructions (applyTo)
  NO  → Put in a skill (on-demand) or agent behavior

Is this rule verifiable without running code?
  YES → Instruction is appropriate
  NO  → May be better as a test or linting rule

Would this rule generate noise if applying to every file?
  YES → Narrow the applyTo glob
  NO  → Global or broad scope is fine

Is this rule longer than 3 sentences?
  YES → Extract to a skill with references/ for depth
  NO  → Keep in instructions
```

---

## What Makes a Great Instructions File

### The 5-Rule Test
Take any 5 rules from the file. For each:
- Can a junior developer implement code that passes this rule without asking questions?
- Would two developers independently apply this rule the same way?

If yes to both: the rule is well-formed. If not: rewrite it.

### Completeness Check
After writing, ask: "Does this instructions file, combined with the global baseline, give Copilot everything it needs to generate idiomatic, safe code for this file type?"

### Conflict Check
Search for any rule that might contradict another active instructions file. If found: decide which takes precedence and document it.

---

## Anti-Patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| `applyTo: '**'` for domain-specific rules | Loads for unrelated files, wastes context | Narrow the pattern |
| Instructions that tell the agent what to think, not what to do | Vague, doesn't change behavior | Rewrite as specific, verifiable rules |
| Duplicating the same rule in 3 files | Maintenance burden, inconsistency risk | Centralize in narrowest-scope file where it belongs |
| Rules that contradict each other across files | Unpredictable behavior | Resolve conflicts, document precedence |
| 50+ rules in one file | Too much context; important rules get lost | Split by category into separate files |
| Missing `applyTo` field | Defaults vary by editor; behavior is unpredictable | Always specify `applyTo` |
