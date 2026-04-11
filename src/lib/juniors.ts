import { promises as fs } from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

export interface JuniorsPageData {
  slug: string;
  title: string;
  content: string;
}

let cachedJuniorsPage: JuniorsPageData | null = null;

async function readJuniorsPageFromFile(): Promise<JuniorsPageData | null> {
  const filePath = path.join(process.cwd(), 'public', 'juniors.json.gz');
  const compressed = await fs.readFile(filePath);
  const file = gunzipSync(compressed).toString('utf8');
  const juniorsPage = JSON.parse(file) as JuniorsPageData | null;

  if (juniorsPage === null)
    return null;

  if (
    typeof juniorsPage.slug !== 'string'
    || typeof juniorsPage.title !== 'string'
    || typeof juniorsPage.content !== 'string'
  ) {
    throw new Error('juniors.json.gz format is invalid');
  }

  return juniorsPage;
}

export async function getJuniorsPage(): Promise<JuniorsPageData | null> {
  try {
    if (cachedJuniorsPage !== null)
      return cachedJuniorsPage;

    const juniorsPage = await readJuniorsPageFromFile();
    if (juniorsPage !== null)
      cachedJuniorsPage = juniorsPage;

    return juniorsPage;
  } catch (error) {
    console.error('Error fetching juniors:', error);
    return null;
  }
}