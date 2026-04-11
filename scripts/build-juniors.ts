import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { writeGz, progress } from './write-gz-util';
import { contentPath, contentRoot } from './content-paths';

interface JuniorsPage {
  slug: string;
  title: string;
  content: string;
}

function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Untitled';
}

function buildJuniors() {
  const inputFile = contentPath('juniors', 'index.md');
  const outputDir = path.join(process.cwd(), 'public');

  try {
    if (!fs.existsSync(inputFile)) {
      console.warn('Juniors content not found, creating empty juniors.json.gz');
      writeGz(outputDir, 'juniors.json', JSON.stringify(null));
      return;
    }

    progress(`Reading juniors page from ${inputFile} (CONTENT_ROOT=${contentRoot()})...`);

    const fileContent = fs.readFileSync(inputFile, 'utf-8');
    const { data, content } = matter(fileContent);
    const juniorsPage: JuniorsPage = {
      slug: 'juniors',
      title: (data.title as string | undefined)?.trim() || extractTitle(content),
      content: content.replace(/\u00a0/g, ' '),
    };

    writeGz(outputDir, 'juniors.json', JSON.stringify(juniorsPage));
    progress('✓ Built juniors page');
  } catch (error) {
    console.error('Error building juniors:', error);
    process.exit(1);
  }
}

buildJuniors();