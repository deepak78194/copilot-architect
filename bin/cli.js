#!/usr/bin/env node
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { install, upgrade } from '../lib/installer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

async function main() {
  const [,, cmd, arg] = process.argv;
  const target = arg || process.cwd();

  switch (cmd) {
    case 'init':
      install(target);
      break;

    case 'upgrade':
      upgrade(target);
      break;

    case '--version':
    case '-v':
      console.log(pkg.version);
      break;

    default:
      console.log(`
copilot-architect v${pkg.version}

An AI ecosystem engineer for GitHub Copilot.
Install once — design agents, skills, and multi-agent teams on demand.

Usage:
  copilot-architect init [path]      Install into current directory (or given path)
  copilot-architect upgrade [path]   Update existing installation to latest version
  copilot-architect --version        Print version

What gets installed:
  .github/agents/copilot-architect.agent.md
  .copilot/skills/copilot-architect/SKILL.md
  .copilot/skills/copilot-architect/references/ (5 knowledge files)

After install:
  Open GitHub Copilot Chat in VS Code
  Select "Copilot Architect" from the agent picker
  Say: "Create an agent that..." or "Review my agents" or "Analyze my Copilot setup"
`);
  }
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
