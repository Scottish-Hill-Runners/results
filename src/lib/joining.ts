import { promises as fs } from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

export interface JoiningItem {
  slug: string;
  title: string;
  content: string;
}

interface RawInfoItem {
  slug: string;
  title: string;
  content: string;
}

let cachedJoiningItems: JoiningItem[] | null = null;

async function readInfoItemsFromFile(): Promise<RawInfoItem[]> {
  const filePath = path.join(process.cwd(), 'public', 'info.json.gz');
  const compressed = await fs.readFile(filePath);
  const file = gunzipSync(compressed).toString('utf8');
  const items = JSON.parse(file) as RawInfoItem[];

  if (!Array.isArray(items)) {
    throw new Error('info.json.gz format is invalid');
  }

  return items;
}

export async function getJoiningItems(): Promise<JoiningItem[]> {
  try {
    if (cachedJoiningItems !== null) {
      return cachedJoiningItems;
    }

    const allItems = await readInfoItemsFromFile();
    // Filter items that start with "joining/" and strip the prefix
    const joiningItems = allItems
      .filter((item) => item.slug.startsWith('joining/'))
      .map((item) => ({
        slug: item.slug.replace(/^joining\//, ''),
        title: item.title,
        content: item.content,
      }));

    cachedJoiningItems = joiningItems;
    return joiningItems;
  } catch (error) {
    console.error('Error fetching joining:', error);
    return [];
  }
}