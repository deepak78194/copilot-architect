# Multi-Agent Team Design Patterns

Reference knowledge for designing multi-agent teams with persistent coordination, clear role separation, and scenario-appropriate structure.

---

## Core Concept

A multi-agent team is a **coordinated system** where specialized agents collaborate on complex tasks that exceed what a single agent can do well. Each agent:
- Has one narrow responsibility
- Has its own minimal tool set
- Communicates through structured handoffs or shared state files
- Persists knowledge between sessions

The team metaphor (culinary, music, military, etc.) gives agents memorable, consistent personas that make routing intuitive without obfuscating their actual role.

---

## When to Design a Team vs a Single Agent

| Situation | Use |
|---|---|
| Task fits in one context window | Single agent |
| Task requires 2 clearly different expertise domains | Single agent + handoffs |
| Task requires 3+ specializations working in parallel | Multi-agent team |
| Output of one step feeds another iteratively | Multi-agent team with coordinator |
| Team needs to accumulate knowledge over sessions | Multi-agent team with Scribe |
| Simple CRUD / lookup tasks | Single agent or skill |

**Warning**: do not over-engineer. A 6-agent team for a task one agent can do adds coordination overhead with no benefit. Ask: "Would a single senior developer do this alone?" If yes, use one agent.

---

## Team Anatomy

Every team has these roles (regardless of metaphor):

| Role | Metaphor Examples | Responsibility | Tools |
|---|---|---|---|
| **Coordinator** | Maestro, Director, Conductor, Commander | Routes requests, delegates, synthesizes | `read`, `search`, `agent` |
| **Builder** | Craftsman, Composer, Engineer | Implements, creates, transforms | `read`, `edit`, `search`, `execute` |
| **Analyst** | Scout, Critic, Auditor | Reads, evaluates, reports — never edits | `read`, `search` |
| **Planner** | Architect, Strategist, Choreographer | Creates specs and plans — scoped write | `read`, `edit`, `search` |
| **Scribe** | Chronicler, Historian, Logger | Logs decisions, generates docs | `read`, `edit` |
| **Tester** | Quality Lead, Inspector | Generates and runs tests | `read`, `edit`, `search`, `execute` |

Not all teams need all roles. Start with: **Coordinator + 2-3 Specialists**.

---

## Metaphor Selection Guide

The metaphor gives the team identity. Choose based on domain:

| Domain | Suggested Metaphors |
|---|---|
| Software engineering team | **Architecture firm**: Architect, Engineer, Inspector, Documenter |
| Data / analytics | **Research lab**: Director, Analyst, Modeler, Publisher |
| DevOps / platform | **Control tower**: Controller, Operator, Monitor, Navigator |
| Content / documentation | **Publishing house**: Editor, Writer, Researcher, Printer |
| Security | **Special forces**: Commander, Scout, Specialist, Analyst |
| API / integration | **Embassy**: Ambassador, Diplomat, Translator, Observer |
| Game development | **Game studio**: Director, Designer, Developer, QA Lead |
| Finance / risk | **Trading floor**: Strategist, Analyst, Risk Officer, Recorder |

**How to pick**: ask the user if they have a preference. If not, propose 3 options that match their domain. The metaphor should feel natural and memorable, not forced.

---

## File Structure

```
.github/agents/<team-name>/
├── coordinator.agent.md        ← routes all requests
├── builder.agent.md            ← (or whatever role applies)
├── analyst.agent.md
├── planner.agent.md
└── scribe.agent.md

<state-dir>/<team-name>/        ← location depends on repo conventions (see note below)
├── team.md                     ← Who's on the team, how they work, collaboration model
├── routing.md                  ← Decision guide: which agent for what
└── decisions.md                ← Append-only log of team decisions (starts empty)
```

**Choosing `<state-dir>`**: inspect the repo first. If `.copilot/` is established, use `.copilot/teams/`. If `.github/` is the pattern, use `.github/teams/`. Propose the location and explain the reasoning — do not hardcode a path.

### team.md Template

```markdown
# <Team Name>

## Our Identity

**Metaphor**: <metaphor name and brief description of why it fits>

We are a team of specialized agents designed to [mission statement in 1-2 sentences].

## Team Roster

| Metaphor Name | Role | Primary Responsibility | Model | Agent File |
|---|---|---|---|---|
| <MetName> | Coordinator | Routes requests and delegates to specialists | claude-sonnet-4-5 | coordinator.agent.md |
| <MetName> | Builder | [specific responsibility] | claude-sonnet-4-5 | builder.agent.md |
| <MetName> | Analyst | [specific responsibility] | claude-sonnet-4-5 | analyst.agent.md |
| <MetName> | Scribe | Logs decisions, generates documentation | gpt-4o | scribe.agent.md |

## Collaboration Model

**How we work**: [Sequential pipeline / Parallel specialists / Hierarchical]

**Typical workflow**:
1. User talks to <CoordinatorName>
2. Coordinator delegates to the right specialist
3. Specialist completes work and reports back
4. Coordinator synthesizes and responds to user
5. Scribe logs the decision

## What We Remember

All significant decisions are logged in the team's `decisions.md` (location determined during team setup).
Each specialist maintains context within the session; cross-session memory lives in decisions.md.

## Contact Us

Talk to <CoordinatorName> first. They'll route your request to the right team member.
For specific domains, you can also address specialists directly.
```

### routing.md Template

```markdown
# <Team Name> — Routing Guide

## Start Here
For any new request: **talk to <CoordinatorName>** (coordinator).

## Direct Specialist Access

| I want to... | Talk to | Agent |
|---|---|---|
| Plan or design [X] | <PlannerName> | planner.agent.md |
| Build or implement [X] | <BuilderName> | builder.agent.md |
| Review or analyze [X] | <AnalystName> | analyst.agent.md |
| Document or log [X] | <ScribeName> | scribe.agent.md |

## When to Escalate to a Human

The team will pause and request human input when:
- A decision affects production systems or shared infrastructure
- A step requires credentials or secrets
- The team reaches a contradiction they cannot resolve
- A task exceeds the planned scope
```

### decisions.md Template (starts empty)

```markdown
# <Team Name> — Decision Log

> This file is maintained by <ScribeName>. Append new entries; never edit past decisions.

---

<!-- Decisions will be appended here as the team works -->
```

---

## Coordinator Agent Design

The coordinator is the most critical agent in the team. Its design determines team coherence.

```yaml
---
description: 'Coordinates the <team-name> team — routes requests to the right specialist and synthesizes their outputs'
name: '<MetaphorName> (Coordinator)'
model: 'claude-sonnet-4-5'
tools: ['read', 'search', 'agent']
user-invocable: true
# handoffs: (optional) add only if the workflow has explicit user-facing pivot points
# where the user should consciously choose to move to the next stage.
# Internal routing between agents lives in the instructions body (routing table), not here.
---

# <MetaphorName>

## Identity
I am <MetaphorName>, coordinator of the <Team Name>. I route, delegate, and synthesize — 
I do not implement, review, or build directly.

## My Team

| Who | Their specialty | When I delegate to them |
|---|---|---|
| <BuilderName> | [responsibility] | [when to use] |
| <AnalystName> | [responsibility] | [when to use] |
| <ScribeName> | Memory and documentation | After every significant decision |

## Routing Rules

[Clear routing table — specific conditions mapped to specific agents]

## How I Delegate

I use the agent tool with this context pattern:
- Agent: <name>
- Spec: .github/agents/<team-name>/<role>.agent.md
- Context: [what I pass]
- Expected output: [what I get back]

## I Always
- Confirm my understanding before delegating
- Check if a similar task was done (read decisions.md)
- Report back a synthesis, not raw agent output
- Ask <ScribeName> to log significant decisions

## I Never
- Implement code myself
- Make architectural decisions without consulting the Planner
- Proceed past a human-confirmation point without explicit approval
```

---

## How Agents Share Context

In a multi-agent team, agents share context through:

1. **Handoff prompts** — coordinator passes context in the delegation prompt
2. **decisions.md** — all agents can read this; Scribe writes to it
3. **Output files** — specialists write their outputs to agreed paths; others read from those paths
4. **team.md** — describes the team; any agent reads it to understand collaboration model

**Avoid** passing raw file contents between agents. Pass **paths** and **identifiers**. Let each agent read what it needs.

---

## Session Persistence Pattern

Each specialist agent optionally maintains a `history.md` alongside the team's state files — typically at `<state-dir>/<team-name>/<role>/history.md`. This is the agent's learning log — append-only notes about:
- Patterns discovered in this codebase
- Decisions made in this team for this project
- Preferences the user has expressed
- Anti-patterns found and why they were avoided

When invoked in a new session, the agent reads its own history.md first — this is how knowledge compounds.

**Scribe agent responsibility**: after each significant work session, Scribe:
1. Reads the session's key outputs
2. Extracts learnings
3. Appends to each specialist's history.md
4. Appends the final decision to decisions.md

---

## Complexity Scaling Guide

| Team size | Agent count | Good for |
|---|---|---|
| Minimal | 2 (coordinator + 1 specialist) | Focused, single-domain tasks |
| Standard | 3-4 (coordinator + 2-3 specialists) | Most engineering workflows |
| Full | 5-6 (coordinator + 4 specialists + scribe) | Complex multi-domain products |
| Extended | 7+ | Very rare; usually better to split into sub-teams |

**Rule**: prefer fewer, more capable agents over many narrow ones. Coordination overhead grows with team size.

---

## Anti-Patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| All agents have the same tools | No specialization; might as well use one agent | Give each agent only what its role needs |
| Coordinator also implements | Violates single responsibility; impossible to reuse | Split implementation to a builder agent |
| No Scribe / no persistent log | Context lost between sessions | Always add a memory mechanism for teams |
| Metaphor names that obscure the role | "Cipher" does what exactly? — if the name alone doesn't tell you, it's too opaque | Use both metaphor and role: `name: 'Cipher (Security Analyst)'`; file: `security-analyst.agent.md` |
| Agents that handoff to 8+ others | Routing complexity; decision fatigue | Max 3 handoffs per agent; use routing.md |
| Fresh decisions.md every session | No institutional memory | decisions.md is append-only, committed to git |
