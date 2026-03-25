import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import { resolve } from 'path';

const scriptsDir = resolve(new URL('.', import.meta.url).pathname);

// Find all build-*.ts files
const buildFiles = readdirSync(scriptsDir)
  .filter(file => file.match(/^build-.*\.ts$/))
  .sort();

if (buildFiles.length === 0) {
  console.warn('No build-*.ts scripts found in scripts/ directory');
  process.exit(0);
}

console.log(`Found ${buildFiles.length} build script(s): ${buildFiles.join(', ')}\n`);

// Run each build script sequentially
for (const file of buildFiles) {
  const filePath = resolve(scriptsDir, file);
  console.log(`Running ${file}...`);
  try {
    execSync(`tsx "${filePath}"`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\n❌ Failed to run ${file}: ${error.message}`);
    process.exit(1);
  }
}

console.log('\n✅ All build scripts completed successfully');
