# Skill Design Patterns

Reference knowledge for generating production-grade SKILL.md files.

---

## What Is a Skill?

A skill is a **self-contained, invocable unit of domain knowledge** packaged into a folder. It extends what an agent can do when explicitly invoked, without loading that context globally. Skills are loaded on demand — they don't consume context unless used.

**Skill vs Instruction**:
- Instruction: always-on rule applied by file pattern (`applyTo`)
- Skill: on-demand deep expertise invoked by the user

**Skill vs Agent**:
- Agent: a specialized persona with tools and persistent behavior
- Skill: domain knowledge + instructions, invoked within the default agent context

---

## When to Create a Folder-Based Skill vs a Single File

| Use single SKILL.md file | Use folder with supporting files |
|---|---|
| Simple behavior, no external material | Needs bundled templates, checklists, or domain docs |
| Self-contained instructions (< 500 lines) | References external specs or standards |
| No files to bundle | Has assets: code templates, schemas, config examples |
| Quick triggered prompts | Multi-step workflow with file lookup |

**Default**: start with a folder. Add supporting subfolders when the SKILL.md body exceeds 400 lines, bundles reusable assets, or references external documents.

---

## SKILL.md Frontmatter

```yaml
---
name: <skill-name-kebab-case>
description: '<50-150 chars: what this skill does — start with a verb>'
version: '1.0'
author: '<name or team, optional>'
tags: [<comma-separated domain tags, optional>]
---
```

### Rules
- `name` must match folder name exactly (for discoverability)
- `description` is what appears in skill pickers and plugin manifests
- `version` enables tracking; increment on breaking changes

---

## SKILL.md Body Structure

```markdown
# <Skill Display Name>

## Purpose
[1-2 sentences. What problem does this solve? Why does this skill exist?]

## Trigger Phrases
[How a user naturally invokes this skill]
- "<first natural language trigger>"
- "<second trigger>"
- "/command-shortcut" (if applicable, keep short and memorable)

## Prerequisites
[Optional: what must exist before this skill runs]
- [Dependency 1]
- [Dependency 2]

## Behavior
[Step-by-step: what the skill does when invoked]
1. [First action — specific and observable]
2. [Second action]
...

## Output
[What the skill produces. Be specific about format, location, naming.]

## Supporting Files
[List all bundled folders and their contents. Include any that apply:]
- `references/<file>.md` — [domain knowledge, standards, curated docs]
- `templates/<file>.md` — [reusable document/code templates to fill in]
- `scripts/<file>.sh` — [scripts for the user to run as part of the workflow]
- `assets/<file>` — [static files: schemas, configs, sample data]
- `examples/<file>` — [worked examples, before/after demonstrations]

## Examples
### Example 1: <Simple Case>
**Input**: [what the user provides]
**Output**: [what gets produced]

### Example 2: <Advanced Case>
**Input**: [what the user provides]
**Output**: [what gets produced]

## Notes & Limitations
[Edge cases, what it can't do, known issues]
```

---

## Supporting Files & Folders Design

A skill folder can contain **any combination** of supporting subfolders. Choose the folder type that best describes the content — don't force everything into a single `references/` folder.

### Folder Types

| Folder | Purpose | Typical contents |
|---|---|---|
| `references/` | Domain knowledge the skill consults | Standards docs, curated guides, decision trees, scoring rubrics |
| `templates/` | Reusable scaffolds the skill fills in | Document templates, code scaffolds, config skeletons |
| `scripts/` | Scripts the user runs as part of the workflow | Shell scripts, automation scripts, CLI wrappers (not executed by Copilot directly) |
| `assets/` | Static files the skill copies or adapts | JSON schemas, sample configs, seed data, text-based diagrams |
| `examples/` | Worked demonstrations the skill learns from | Before/after code, end-to-end walkthroughs, sample outputs |

**Choose the right folder**: if a file is a template to fill in → `templates/`. If it's knowledge to read → `references/`. If it's a script for the user to run → `scripts/`. If it's a static resource to copy → `assets/`. If it's a worked example → `examples/`.

### What belongs in supporting folders
- Document templates (e.g., ADR template, spec template) → `templates/`
- Domain standards (e.g., OpenAPI best practices, OWASP checklist) → `references/`
- Code patterns / reference implementations → `references/` or `examples/`
- Decision trees or scoring rubrics → `references/`
- Checklists the skill systematically applies → `references/`
- Executable automation or CLI scripts (provided for users to run) → `scripts/`
- JSON/YAML schemas, sample config files → `assets/`
- Before/after code demonstrations → `examples/`

### What does NOT belong in supporting folders
- Generated outputs (outputs go into the user's repo, not the skill)
- Hardcoded project data (keep skills project-agnostic)
- Binary files or images (these don't load into context; use text-based diagrams like Mermaid or ASCII art instead)

### File naming rules (apply to all folders)
- Descriptive, kebab-case: `owasp-top10.md`, `adr-template.md`, `review-checklist.md`
- Max one concern per file — split if a file covers two distinct topics
- Keep each file under 300 lines — large files slow context loading

---

## Skill Categories and Patterns

### Pattern 1: Blueprint Generator
**Purpose**: Input = intent → Output = structured document  
**Examples**: `create-specification`, `readme-blueprint-generator`, `create-adr`  
**Structure**:
- SKILL.md: describes what to ask the user, what section structure to follow
- `templates/document-template.md`: the document template with required sections to fill in
- `references/style-guide.md` (optional): writing standards or section definitions
- The skill fills the template from context + user input

### Pattern 2: Code Transformer
**Purpose**: Input = code → Output = refactored/generated code  
**Examples**: `refactor`, `csharp-async`, `containerize-aspnetcore`  
**Structure**:
- SKILL.md: the transformation rules and criteria
- `examples/patterns.md`: before/after code pattern demonstrations
- `references/standards.md` (optional): coding standards or framework migration guides
- The skill reads target code, applies transformation, writes result

### Pattern 3: Domain Expert Consultation
**Purpose**: User asks domain question → Expert-level guidance  
**Examples**: `postgresql-optimization`, `azure-role-selector`, `cloud-design-patterns`  
**Structure**:
- SKILL.md: scope of expertise, how to approach the consultation
- `references/domain-knowledge.md`: curated domain reference (standards, options, trade-offs)
- `references/decision-tree.md` (optional): structured decision framework
- The skill synthesizes guidance from reference + codebase context

### Pattern 4: Workflow Execution
**Purpose**: Executes a multi-step workflow on behalf of the user  
**Examples**: `conventional-commit`, `gh-cli`, `playwright-generate-test`  
**Structure**:
- SKILL.md: step-by-step workflow, what inputs are needed
- `scripts/setup.sh` (optional): automation scripts for the user to run during workflow steps
- `templates/output-template.md` (optional): template for workflow output
- `examples/walkthrough.md`: worked examples of the workflow end-to-end
- May invoke external tools or CLI; document prerequisites

### Pattern 5: Analyzer / Auditor
**Purpose**: Input = code/config → Output = structured findings report  
**Examples**: `code-review`, `security-scan`, `doublecheck`  
**Structure**:
- SKILL.md: what to check, scoring/severity definitions
- `references/checklist.md`: systematic checklist the skill walks through
- `templates/report-template.md` (optional): structured report format
- `assets/severity-matrix.md` (optional): scoring criteria and thresholds
- Output: always a structured report with findings and recommendations

---

## Composability Rules

Skills should be composable — usable independently and as part of workflows.

1. **No hidden dependencies**: If a skill assumes another skill was already run, document it in Prerequisites.
2. **Output format consistency**: If two skills in a workflow chain, the output of skill A should be directly consumable by skill B.
3. **Parameterization**: Use `${input:variableName}` for any user-provided value. Never hardcode project names, paths, or identifiers.
4. **Idempotency**: Running the skill twice should produce the same result (or gracefully handle "already exists" cases).

---

## Trigger Phrase Design

Good trigger phrases are:
- Natural language the user would actually type
- Specific enough to not collide with other skills
- Short enough to remember

```
✅ "create a specification for"
✅ "/spec"
✅ "write an ADR for"
✅ "optimize this SQL query"

❌ "do the thing"
❌ "help me"
❌ "start" (too ambiguous)
❌ "run skill X" (users shouldn't need to know skill names)
```

Provide 3-5 trigger phrases: mix of full natural language + short command shortcut.

---

## Anti-Patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| Skill that does everything | No clear trigger; context too heavy | Split into focused skills |
| Hardcoded project paths in SKILL.md | Breaks for any other project | Use `${input:}` or derive from context |
| Reference files that are just link lists | Links die; no value without the content | Summarize the content, cite sources |
| No output section | Users don't know what to expect | Always document output format and location |
| Skill duplicates an agent's capability | Redundancy, confusion | Decide: is this behavior always-on (→ instruction) or on-demand (→ skill)? |
| SKILL.md > 600 lines | Context bloat; hard to maintain | Extract to supporting folders, keep SKILL.md as index |
| All files crammed into references/ | Templates mixed with knowledge; unclear purpose | Use distinct folders: `templates/`, `scripts/`, `assets/`, `examples/` |
| Supporting files over 300 lines | Slow context loading; hard to maintain | Split by concern into smaller files |
