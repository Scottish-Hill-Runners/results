import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { writeGz, progress } from './write-gz-util';

interface InfoItem {
  slug: string;
  title: string;
  content: string;
}

function buildInfo() {
  const infoDir = path.join(process.cwd(), 'info');
  const outputDir = path.join(process.cwd(), 'public');

  try {
    // Check if info directory exists
    if (!fs.existsSync(infoDir)) {
      console.warn('Info directory not found, creating empty info.json.gz');
      writeGz(outputDir, 'info.json', JSON.stringify([]));
      return;
    }

    progress(`Reading info from ${infoDir}...`);

    // Get all markdown files
    const files = fs.readdirSync(infoDir).filter((file) => file.endsWith('.md'));
    progress(`Found ${files.length} info files`);

    // Parse files
    const infoItems: InfoItem[] = files.map((file) => {
      const filePath = path.join(infoDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      return {
        slug: file.replace('.md', ''),
        title: (data.title as string) || 'Untitled',
        content: content.replace(/\u00a0/g, ' '),
      };
    });

    // Write to compressed JSON file
    writeGz(outputDir, 'info.json', JSON.stringify(infoItems));
    progress(`✓ Built ${infoItems.length} info items`);
  } catch (error) {
    console.error('Error building info:', error);
    process.exit(1);
  }
}

buildInfo();