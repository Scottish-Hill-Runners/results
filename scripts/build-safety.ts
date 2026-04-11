import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { writeGz, progress } from './write-gz-util';
import { contentPath, contentRoot } from './content-paths';

interface SafetyItem {
  slug: string;
  title: string;
  content: string;
}

function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Untitled';
}

function buildSafety() {
  const safetyDir = contentPath('safety');
  const outputDir = path.join(process.cwd(), 'public');

  try {
    if (!fs.existsSync(safetyDir)) {
      console.warn('Safety directory not found, creating empty safety.json.gz');
      writeGz(outputDir, 'safety.json', JSON.stringify([]));
      return;
    }

    progress(`Reading safety pages from ${safetyDir} (CONTENT_ROOT=${contentRoot()})...`);

    const files = fs
      .readdirSync(safetyDir)
      .filter((file) => file.endsWith('.md'))
      .sort((a, b) => a.localeCompare(b));
    progress(`Found ${files.length} safety files`);

    const safetyItems: SafetyItem[] = files.map((file) => {
      const filePath = path.join(safetyDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);
      const title = (data.title as string | undefined)?.trim() || extractTitle(content);

      return {
        slug: file.replace('.md', ''),
        title,
        content: content.replace(/\u00a0/g, ' '),
      };
    });

    writeGz(outputDir, 'safety.json', JSON.stringify(safetyItems));
    progress(`✓ Built ${safetyItems.length} safety items`);
  } catch (error) {
    console.error('Error building safety:', error);
    process.exit(1);
  }
}

buildSafety();