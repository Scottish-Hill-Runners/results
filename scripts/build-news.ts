import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { writeGz, progress } from './write-gz-util';
import { contentPath, contentRoot } from './content-paths';

interface NewsItem {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function collectMarkdownFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return collectMarkdownFiles(entryPath);
    }

    return entry.name.endsWith('.md') ? [entryPath] : [];
  });
}

async function buildNews() {
  const newsDir = contentPath('news');
  const outputDir = path.join(process.cwd(), 'public');

  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Check if news directory exists
    if (!fs.existsSync(newsDir)) {
      console.warn('News directory not found, creating empty news.json.gz');
      writeGz(outputDir, 'news.json', JSON.stringify([]));
      return;
    }

    progress(`Reading news from ${newsDir} (CONTENT_ROOT=${contentRoot()})...`);

    // Get all markdown files, including year-based subdirectories.
    const files = collectMarkdownFiles(newsDir);
    progress(`Found ${files.length} news files`);

    // Parse and sort by date
    const newsItems: NewsItem[] = files
      .map((filePath) => {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        // Clean excerpt from any HTML tags
        const excerpt = stripHtml((data.excerpt as string) || '');

        return {
          slug: path.basename(filePath, '.md'),
          title: (data.title as string) || 'Untitled',
          date: (data.date as string) || new Date().toISOString().split('T')[0],
          excerpt: excerpt,
          content: content.replace(/\u00a0/g, ' '),
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Write to compressed JSON file
    writeGz(outputDir, 'news.json', JSON.stringify(newsItems));
    progress(`✓ Built ${newsItems.length} news items`);
  } catch (error) {
    console.error('Error building news:', error);
    process.exit(1);
  }
}

buildNews();
