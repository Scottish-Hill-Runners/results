import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';

const repo = process.env.CONTENT_REPO || 'Scottish-Hill-Runners/contents';
const ref = process.env.CONTENT_REF || 'main';
const targetDir = process.env.CONTENT_DIR || path.join('content');

const destination = path.resolve(process.cwd(), targetDir);

if (existsSync(destination)) {
  rmSync(destination, { recursive: true, force: true });
}

const repoUrl = repo.startsWith('http') || repo.startsWith('/') || repo.startsWith('.') 
  ? repo 
  : `https://github.com/${repo}.git`;
  
console.log(`Cloning ${repoUrl}#${ref} into ${destination}`);
execSync(`git clone --depth 1 --filter=blob:none --sparse --branch ${ref} ${repoUrl} "${destination}"`, {
  stdio: 'inherit',
});

execSync('git sparse-checkout set --no-cone "/*" "!/blobs/" "!/blobs/**"', {
  cwd: destination,
  stdio: 'inherit',
});

console.log('Content sync complete.');
