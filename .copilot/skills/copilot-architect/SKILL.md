---
name: copilot-architect
description: 'Design, generate, review, and maintain production-grade Copilot agents, multi-agent teams, skills, and instructions on demand'
---

# Copilot Architect Skill

## Purpose

The Copilot Architect manages your GitHub Copilot customization ecosystem — creating, reviewing, improving, and rewriting agents, skills, instructions, and multi-agent teams directly in your repository. Its job is maintaining the health of the whole ecosystem, not just generating new files.

## How to Use

Select **Copilot Architect** from the agent picker in Copilot Chat, then describe what you need in plain language:

- "Create an agent that reviews database migrations"
- "I need a team of agents to handle my data pipeline"
- "Make a skill for generating OpenAPI specs"
- "Write instructions for all Python files about type hints"
- "Review this agent" — with the file open or a path given
- "Improve this skill" / "Fix the issues in this agent"
- "Rewrite this agent — it has too many responsibilities"
- "Analyze my Copilot setup" / "What's missing from my agents?"
- "What would you build for X?" — to explore before committing

Natural language also works:
- "Create an agent that reviews database migrations"
- "I need a team of agents to handle my data pipeline"
- "Write instructions for all Python files about type hints"
- "Make a skill for generating OpenAPI specs"

## What the Architect Does

| Request | Outcome |
|---|---|
| Single agent | `.github/agents/<name>.agent.md` created |
| Multi-agent team | `.github/agents/<team>/` agent files + state directory (location chosen during design) |
| Skill | `.copilot/skills/<name>/SKILL.md` + `references/` as needed |
| Instructions | `.github/instructions/<name>.instructions.md` |
| Review existing | Assessment report — no files written |
| Improve existing | Targeted edits to the existing file |
| Rewrite existing | Existing file replaced with rebuilt artifact |

## Reference Files

The architect uses these internally when generating:
- `references/agent-patterns.md` — production agent design patterns
- `references/skill-patterns.md` — skill structure and composition patterns
- `references/instruction-patterns.md` — instruction scoping and rule quality
- `references/team-design.md` — multi-agent team orchestration patterns
- `references/quality-checklist.md` — pre-publish quality gates

## Notes

- The architect **shows a design before writing** for multi-agent teams
- All generated artifacts are immediately usable — no placeholder gaps
- The architect logs what it builds in the architect log (location: team state directory if a team was created, otherwise `.copilot/architect-log.md`) for traceability
