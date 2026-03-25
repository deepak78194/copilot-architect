import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG = join(__dirname, '..');

// Normalize path display — forward slashes on all platforms
function display(targetRoot, absPath) {
  return relative(targetRoot, absPath).replace(/\\/g, '/');
}

function copyTree(src, dest, targetRoot, overwrite) {
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      mkdirSync(destPath, { recursive: true });
      copyTree(srcPath, destPath, targetRoot, overwrite);
    } else {
      const exists = existsSync(destPath);
      if (!exists || overwrite) {
        mkdirSync(dirname(destPath), { recursive: true });
        copyFileSync(srcPath, destPath);
        console.log(`  ${exists ? '↑' : '+'} ${display(targetRoot, destPath)}`);
      } else {
        console.log(`  · ${display(targetRoot, destPath)} (skipped — run upgrade to overwrite)`);
      }
    }
  }
}

const SOURCES = [
  { src: join(PKG, '.github', 'agents'), destSub: join('.github', 'agents') },
  { src: join(PKG, '.copilot'),          destSub: '.copilot'                },
];

export function install(target) {
  console.log(`\nInstalling Copilot Architect → ${target}\n`);
  for (const { src, destSub } of SOURCES) {
    mkdirSync(join(target, destSub), { recursive: true });
    copyTree(src, join(target, destSub), target, false);
  }
  console.log(`
✓ Done.

Next: Open Copilot Chat in VS Code
      Select "Copilot Architect" from the agent picker
      Start building.
`);
}

export function upgrade(target) {
  console.log(`\nUpgrading Copilot Architect → ${target}\n`);
  for (const { src, destSub } of SOURCES) {
    mkdirSync(join(target, destSub), { recursive: true });
    copyTree(src, join(target, destSub), target, true);
  }
  console.log('\n✓ Done. Updated to latest version.\n');
}
