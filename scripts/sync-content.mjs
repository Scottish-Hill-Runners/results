import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';

const repo = process.env.CONTENT_REPO;
const ref = process.env.CONTENT_REF || 'main';
const targetDir = process.env.CONTENT_DIR || path.join('content');

if (!repo) {
  console.error('CONTENT_REPO is required, e.g. Scottish-Hill-Runners/contents');
  process.exit(1);
}

const destination = path.resolve(process.cwd(), targetDir);

if (existsSync(destination)) {
  rmSync(destination, { recursive: true, force: true });
}

const repoUrl = repo.startsWith('http') ? repo : `https://github.com/${repo}.git`;

console.log(`Cloning ${repoUrl}#${ref} into ${destination}`);
execSync(`git clone --depth 1 --branch ${ref} ${repoUrl} "${destination}"`, {
  stdio: 'inherit',
});

console.log('Content sync complete.');
