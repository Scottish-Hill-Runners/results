import { promises as fs } from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

export interface JuniorsPageData {
  slug: string;
  title: string;
  content: string;
}

async function readJuniorsPageFromFile(): Promise<JuniorsPageData | null> {
  const filePath = path.join(process.cwd(), 'public', 'info.json.gz');
  const compressed = await fs.readFile(filePath);
  const file = gunzipSync(compressed).toString('utf8');
  const allItems = JSON.parse(file) as JuniorsPageData[];

  if (!Array.isArray(allItems)) {
    throw new Error('info.json.gz format is invalid');
  }

  // Find the juniors item which has slug "joining/juniors"
  const juniorsItem = allItems.find((item) => item.slug === 'joining/juniors');
  if (!juniorsItem) {
    return null;
  }

  // Return with slug stripped of prefix to match interface
  return {
    slug: 'juniors',
    title: juniorsItem.title,
    content: juniorsItem.content,
  };
}

let cachedJuniorsPage: JuniorsPageData | null | undefined;

export async function getJuniorsPage(): Promise<JuniorsPageData | null> {
  try {
    if (cachedJuniorsPage !== undefined) {
      return cachedJuniorsPage;
    }

    const juniorsPage = await readJuniorsPageFromFile();
    cachedJuniorsPage = juniorsPage;

    return juniorsPage;
  } catch (error) {
    console.error('Error fetching juniors:', error);
    return null;
  }
}