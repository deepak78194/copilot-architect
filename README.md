# copilot-architect

> An AI ecosystem engineer for GitHub Copilot. Install once — design agents, skills, and multi-agent teams on demand.

## Install

```bash
npm install -g @deepak78194/copilot-architect
```

## Usage

```bash
# Install into your current repo
copilot-architect init

# Install into a specific path
copilot-architect init ./my-project

# Update all files to the latest version
copilot-architect upgrade
```

## What Gets Installed

```
.github/agents/
  copilot-architect.agent.md       ← the agent (select it in Copilot Chat)

.copilot/skills/copilot-architect/
  SKILL.md                         ← skill definition
  references/
    agent-patterns.md              ← production agent design patterns
    skill-patterns.md              ← skill structure and composition
    instruction-patterns.md        ← instruction scoping and quality
    team-design.md                 ← multi-agent team orchestration
    quality-checklist.md           ← pre-publish quality gates
```

## After Install

1. Open **GitHub Copilot Chat** in VS Code
2. Select **Copilot Architect** from the agent picker
3. Describe what you need in plain language:

```
"Create an agent that reviews database migrations for breaking changes"
"I need a team of agents to handle my data pipeline"
"Review my existing agents for quality issues"
"Analyze my Copilot setup and suggest what's missing"
"Improve this skill" (with the file open)
```

## What the Architect Can Do

| Request | Result |
|---|---|
| Create an agent | `.github/agents/<name>.agent.md` |
| Create a team | Coordinator + specialists + optional state files |
| Create a skill | `.copilot/skills/<name>/SKILL.md` + references |
| Create instructions | `.github/instructions/<name>.instructions.md` |
| Review existing artifact | Assessment report, no file writes |
| Improve existing artifact | Targeted edits, preserves structure |
| Rewrite existing artifact | Ground-up rebuild from correct pattern |
| Analyze ecosystem | Full audit with prioritized recommendations |

The architect reasons about the right pattern before generating anything, shows a design before writing files for teams, and logs everything it builds.

## Upgrade

To get the latest version of the agent and all knowledge files:

```bash
npm install -g @deepak78194/copilot-architect@latest
copilot-architect upgrade
```

## License

MIT
