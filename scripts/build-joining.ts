import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { writeGz, progress } from './write-gz-util';
import { contentPath, contentRoot } from './content-paths';

interface JoiningItem {
  slug: string;
  title: string;
  content: string;
}

function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Untitled';
}

function buildJoining() {
  const joiningDir = contentPath('joining');
  const outputDir = path.join(process.cwd(), 'public');

  try {
    if (!fs.existsSync(joiningDir)) {
      console.warn('Joining directory not found, creating empty joining.json.gz');
      writeGz(outputDir, 'joining.json', JSON.stringify([]));
      return;
    }

    progress(`Reading joining pages from ${joiningDir} (CONTENT_ROOT=${contentRoot()})...`);

    const files = fs
      .readdirSync(joiningDir)
      .filter((file) => file.endsWith('.md'))
      .sort((a, b) => {
        if (a === 'index.md') return -1;
        if (b === 'index.md') return 1;
        return a.localeCompare(b);
      });
    progress(`Found ${files.length} joining files`);

    const joiningItems: JoiningItem[] = files.map((file) => {
      const filePath = path.join(joiningDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      return {
        slug: file.replace('.md', ''),
        title: (data.title as string | undefined)?.trim() || extractTitle(content),
        content: content.replace(/\u00a0/g, ' '),
      };
    });

    writeGz(outputDir, 'joining.json', JSON.stringify(joiningItems));
    progress(`✓ Built ${joiningItems.length} joining pages`);
  } catch (error) {
    console.error('Error building joining:', error);
    process.exit(1);
  }
}

buildJoining();