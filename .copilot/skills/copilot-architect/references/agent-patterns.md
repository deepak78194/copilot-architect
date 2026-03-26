# Agent Design Patterns

Reference knowledge for generating production-grade `.agent.md` files.

---

## Frontmatter Specification

```yaml
---
description: '<string: 50-150 chars, single-quoted, action-oriented>'
name: '<Display Name in Title Case>'
model: '<model-name>'
tools: [<array: minimal set>]
user-invocable: <boolean>
disable-model-invocation: <boolean, optional>
handoffs:
  - label: '<action verb + noun>'
    agent: <agent-id-without-extension>
    prompt: '<context-aware prompt>'
    send: <boolean>
---
```

### Field Rules

**description** (REQUIRED)
- Start with a verb or role: "Analyzes", "Generates", "Reviews", "Coordinates"
- Be domain-specific: "Analyzes database migrations for breaking changes" not "Helps with databases"
- 50-150 characters. Test: would a new user know exactly what to use this for?

**name** (REQUIRED for user-facing agents)
- Title Case display name
- May differ from filename: filename is the ID, name is what users see

**model** (STRONGLY RECOMMENDED)
- Simple tasks (search, read, report): `'gpt-4o'` or `'claude-haiku-4-5'`
- Complex reasoning (architecture, security, planning): `'claude-sonnet-4-5'`
- Maximum capability (multi-step orchestration): `'claude-sonnet-4-5'`

**tools** (REQUIRED, apply least privilege)
See tool selection guide below.

**user-invocable**
- `true` — appears in the agent picker; user can invoke directly
- `false` — sub-agent only; invoked by orchestrators, not in picker

---

## Tool Selection Guide

| Tool | When to grant | When NOT to grant |
|---|---|---|
| `read` | Any agent that reads files | Never withhold — nearly universal |
| `edit` | Agent must create or modify files | Read-only agents (reviewer, auditor) |
| `search` | Agent needs to find code or patterns | Rarely withheld — usually grant |
| `execute` | Must run shell commands (tests, CLI) | Default: do not grant. Only when essential |
| `web` | Needs external docs, CVE lookups, APIs | If agent is purely local-codebase |
| `agent` | Orchestrator that delegates to sub-agents | Any non-orchestrator agent |
| `todo` | Task tracking during sessions | Only agents managing multi-step work |

**Principle of Least Privilege**: Start with `['read', 'search']`. Add `edit` if it writes files. Add others only if the agent spec explicitly requires them.

---

## Agent Body Structure

An agent body communicates identity and operating rules. The sections below are **building blocks** — choose what the agent actually needs to express, in the order that makes sense for its purpose. A deep domain expert needs different structure than a routed sub-agent. A reviewer needs different structure than a builder.

If a section doesn’t add information, leave it out.

```markdown
# <Agent Name>

## Identity
[Who this agent is. Domain expertise. How it approaches problems. 2-3 sentences.]
[Use first or second person consistently — do not mix.]

## Responsibilities
[Bullet list: specific, bounded, testable tasks this agent performs]
- Analyze [specific thing] and produce [specific output]
- Generate [artifact type] in [format/location]

## Out of Scope
[Explicit list of what this agent does NOT do — helps users route correctly]
- This agent does not write production code (route to Implementer)
- This agent does not review security (route to Security Auditor)

## Character and Standards
[Optional but powerful — what this agent pushes back on, what it refuses to compromise on]
[Example: “I will not write tests that trivially pass without covering behavior.”]
[Example: “If the design is clearly wrong, I say so before implementing it.”]
[This is where the agent gets opinions, not just instructions.]

## Skills
[Optional: list skills this agent can leverage for on-demand domain knowledge]
- `<skill-name>` — [when and why this agent invokes it]

## Process
[Step-by-step — how the agent approaches its task]
1. Read [what] to understand [context]
2. Analyze [what] using [criteria]
3. Produce [output] in [format]

## Output
[What the agent produces: format, file location if applicable, structure]

## Hard Constraints
[Non-negotiable rules. 3-7 specific and enforceable.]
- Never modify files outside [scope]
- Stop and ask if [ambiguous condition] is detected
- Do not proceed if [safety condition] is not met
```

---

## Single Responsibility Principle

Every agent must have exactly **one core responsibility**. Signs a design violates this:
- The description uses "and" to join two unrelated activities
- The agent's output section lists 4+ different artifact types
- You would route different user requests to the same agent for different reasons

**Fix**: Split into two agents. Add an orchestrator to coordinate if needed.

---

## Handoffs — A Specific Tool for Specific Scenarios

Handoffs are a frontmatter feature that adds clickable action buttons to the agent’s response in VS Code. They pre-fill the next user message and optionally auto-send it.

**When handoffs genuinely help**:
- The user should explicitly trigger the next stage rather than having it happen automatically
- There’s a point where the user wants to review what happened before continuing
- A sequential pipeline where each step’s result is a natural pause point
- Returning a user from a sub-agent back to an entry point they’d want to revisit

**When handoffs add no value (the majority of agents)**:
- The agent is a domain expert the user invokes directly (most agents in a library)
- The agent is a background sub-agent invoked by an orchestrator
- The "next step" is implicit from context (the user knows what to do next)
- You’d be adding a handoff just because another agent exists, not because the user needs a button

Guidelines when handoffs ARE appropriate:
1. **Label = action button text**: be specific about what will happen — "Review This Implementation" not "Next" or "Continue"
2. **Prompt = context-aware**: reference what just happened — not a generic re-statement
3. **`send: false` by default**: let the user review the pre-filled message before sending
4. **`send: true` only**: when the pipeline is automated and human-in-loop has already been satisfied at an earlier gate
5. **More than 3 handoffs**: signals the agent is doing too many things. Refactor the workflow or use an orchestrator.

```yaml
handoffs:
  - label: 'Review These Changes'       # action verb + object
    agent: code-reviewer                 # matches filename without .agent.md
    prompt: 'Review the changes I just implemented in <X>. Focus on <Y>.'
    send: false
```

**For multi-agent teams**: routing within a team lives in the coordinator’s instructions body (a routing table), not in handoffs frontmatter. Handoffs in teams are for user-facing pivot points — not internal delegation.

---

## Common Agent Archetypes

### Coordinator / Orchestrator
```yaml
tools: ['read', 'search', 'agent']
user-invocable: true
```
- Routes requests to specialist agents
- Contains a routing table in its body: user intent → target agent
- Synthesizes results from specialists into a coherent response
- Does NOT implement, review, or produce domain artifacts itself
- Handoffs: only if specific user-facing pivot points are designed into the workflow. Internal routing goes in the instructions body.

### Read-Only Analyst (Reviewer, Auditor, Advisor)
```yaml
tools: ['read', 'search']          # NO edit, NO execute
user-invocable: true
```
- Reads and reports. Never edits.
- Output is always a structured report
- Body contains: what to check, how to rate/score, report format

### Builder / Implementer
```yaml
tools: ['read', 'edit', 'search', 'execute']
user-invocable: true
```
- `execute` only if tests must be run
- Body: pre-implementation checklist, step pattern, output summary format

### Sub-Agent (invoked by orchestrators)
```yaml
user-invocable: false
disable-model-invocation: false     # allow orchestrator to invoke
tools: [<minimal set>]
```
- Narrow task, fast execution
- Returns a structured summary to the orchestrator

### Memory Keeper / Scribe
```yaml
tools: ['read', 'edit', 'search']
user-invocable: false               # background role
```
- Writes decisions, changelogs, ADRs, session logs
- Has read/write but never edits production code
- Part of multi-agent teams as the memory layer

---

## Anti-Patterns to Avoid

| Anti-pattern | Problem | Fix |
|---|---|---|
| Vague description ("Helps with coding") | Users don't know when to invoke it | Rewrite to be domain-specific and action-oriented |
| Granting all tools (`['*']`) | Security risk, unclear purpose | Start minimal, add only what's needed |
| Missing scope limits | Agent drifts into adjacent domains | Add explicit "Out of Scope" section |
| Generic handoff prompts | Next agent lacks context | Make prompt reference the specific work just done |
| 10+ instructions bullets | Too much to process, contradictions emerge | Limit to 5-7 hard constraints, rest goes in process |
| Super-agent doing everything | No clear responsibility, hard to debug | Split into specialized agents + coordinator |
| Missing `user-invocable` field | Defaults to true; sub-agents appear in picker | Always set explicitly |

---

## File Naming Conventions

- All lowercase, hyphens: `security-auditor.agent.md`
- Reflects role, not metaphor name: `planner.agent.md` not `keaton.agent.md`
- In multi-agent teams: `<team>/<role>.agent.md` (e.g., `platform-team/coordinator.agent.md`)
- Allowed chars: `.`, `-`, `_`, `a-z`, `A-Z`, `0-9`
