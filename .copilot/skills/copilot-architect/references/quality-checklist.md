# Quality Checklist

Pre-publish quality gates for all Copilot customization artifacts.
Run this checklist before finalizing any generated agent, skill, or instructions file.

---

## Agent Quality Checklist

### Frontmatter
- [ ] `description` present, 50-150 characters, single-quoted
- [ ] `description` starts with action verb or role ("Analyzes", "Generates", "Coordinates")
- [ ] `name` specified and reflects the agent's persona or role
- [ ] `model` specified — not left to default
- [ ] `tools` list is the **minimum** required (not `['*']`, not over-granted)
- [ ] `execute` tool is absent unless the agent genuinely needs shell execution
- [ ] `agent` tool is absent unless this is an orchestrator
- [ ] `user-invocable` explicitly set (not left to default)
- [ ] If sub-agent only: `user-invocable: false` is set
- [ ] Handoffs (if any): labels are action-oriented verbs, prompts are context-specific

### Body
- [ ] Agent has a single, clearly stated core responsibility
- [ ] "Out of Scope" or scope limits are explicitly defined
- [ ] Process section: step-by-step, not vague ("analyze → report" is not enough)
- [ ] Output section: describes format, location, and structure of what the agent produces
- [ ] Hard constraints: 3-7 specific, enforceable rules (not vague guidance)
- [ ] Security: agent behavior inherits the team's security baseline (no hardcoded credentials, validated inputs)
- [ ] No instruction contradicts another active instruction file

### Cross-Check
- [ ] No other agent in the repo has the same responsibility (no duplicates)
- [ ] If this hands off to another agent: that agent exists and its filename matches
- [ ] Description would let a new user correctly decide to use this agent vs another

---

## Skill Quality Checklist

### Frontmatter
- [ ] `name` matches folder name exactly (kebab-case)
- [ ] `description` present, 50-150 characters, action-oriented
- [ ] `version` specified

### Body
- [ ] Purpose: 1-2 sentences answering "what problem does this solve?"
- [ ] Trigger phrases: 3-5, mix of natural language + short command
- [ ] Trigger phrases are specific (won't accidentally trigger on unrelated requests)
- [ ] Behavior: numbered steps that describe what the skill actually does
- [ ] Output: specific about format, naming convention, and location
- [ ] Examples: at least 1 concrete example with input and output
- [ ] Notes/Limitations: any caveats are documented

### References (if present)
- [ ] Each reference file is listed in SKILL.md with its purpose
- [ ] Reference files are under 300 lines each
- [ ] Reference files contain curated knowledge, not just link lists
- [ ] No reference file hardcodes project-specific data

### Cross-Check
- [ ] Skill solves a problem not already covered by an existing skill
- [ ] Skill is not better served as an instruction (always-on) or agent (tool-using)
- [ ] SKILL.md total length under 600 lines (if longer, extract to references/)

---

## Instructions Quality Checklist

### Frontmatter
- [ ] `name` present and descriptive
- [ ] `description` present, 50-150 characters
- [ ] `applyTo` present and uses the narrowest correct glob
- [ ] `applyTo: '**'` is used only for genuinely global rules

### Body
- [ ] Rules are specific and verifiable (not "write clean code")
- [ ] Rules use imperative mood ("Prefer X", "Never use Y", "Always validate Z")
- [ ] Each rule would produce identical interpretation by two different developers
- [ ] Rules grouped by logical category with `##` headings
- [ ] Total rule count under 50 (if more, split the file)

### Cross-Check
- [ ] No rule contradicts another active instructions file
- [ ] Rules apply to the file types matched by `applyTo`
- [ ] This file + existing instructions doesn't exceed ~3000 tokens of context for any single file

---

## Multi-Agent Team Quality Checklist

### Design
- [ ] Team has exactly one Coordinator
- [ ] Every specialist has a single, clearly differentiated responsibility
- [ ] No two specialists have overlapping responsibilities
- [ ] Team size is appropriate: 3-6 agents total (justify if larger)
- [ ] Metaphor names make sense in context; role labels clarify

### File structure
- [ ] .github/agents/<team-name>/ folder created with all agent files
- [ ] State directory chosen and documented in team.md (location based on repo conventions)
- [ ] `<state-dir>/<team-name>/team.md` created
- [ ] `<state-dir>/<team-name>/routing.md` created
- [ ] `<state-dir>/<team-name>/decisions.md` created (empty, ready for appends)

### Coordinator agent
- [ ] Tools: `['read', 'search', 'agent']` only
- [ ] Contains routing table — clear mapping of request types to specialists
- [ ] Handoffs (if any): present only where there are real user-facing UI transition points; internal agent routing lives in the instructions body
- [ ] Does NOT do work itself — only routes and synthesizes

### Specialist agents
- [ ] Each has `user-invocable: true` OR `false` — set intentionally
- [ ] Handoffs (if any): present only if a specialist-to-coordinator return is a designed user experience feature, not assumed by default
- [ ] Tools: minimal for their role
- [ ] Scope limits in body: clearly states what it doesn't do

### team.md
- [ ] Lists all team members with metaphor name, role, specialty, and file
- [ ] Describes collaboration model
- [ ] Explains how decisions are logged

### routing.md
- [ ] Covers every specialist with routing conditions
- [ ] Includes escalation-to-human criteria

---

## Architect Log Entry

After generating and validating artifacts, append to the architect log. Location: if a team state directory was created, write to `<state-dir>/architect-log.md`; otherwise use `.copilot/architect-log.md`:

```markdown
## <YYYY-MM-DD> — <What was generated>

**Type**: agent | skill | instructions | team
**Artifacts created**:
- `<path/to/file>` — [purpose]

**User intent**: [brief description of what the user asked for]

**Design decisions**:
- [Why this structure was chosen]
- [Alternatives considered and why they were rejected]

**Suggested next steps**:
- [What to build next that would complement this]
```

---

## Red Flags (Stop and Fix Before Delivering)

These issues require correction before generating files:

| Red Flag | Action |
|---|---|
| Agent description is vague (< 30 chars or no domain specificity) | Rewrite description |
| Agent has `execute` with no justification | Remove `execute` |
| Skill trigger phrases overlap with an existing skill | Disambiguate or merge |
| Instructions contradict an existing instructions file | Resolve conflict first |
| Team coordinator can also implement | Split into coordinator + builder |
| Hardcoded project name in any template | Replace with `${input:}` placeholder |
| Skill SKILL.md references a file in references/ that doesn't exist | Create the reference file |
| Agent handoffs reference an agent file that doesn't exist | Create that agent or fix the reference |
