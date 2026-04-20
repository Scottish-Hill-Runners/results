import { promises as fs } from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { type AccordionItem } from '@/app/info/info-accordion';

export type SafetyItem = AccordionItem;

interface RawInfoItem {
  slug: string;
  title: string;
  content: string;
}

let cachedSafetyItems: SafetyItem[] | null = null;

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

export async function getSafetyItems(): Promise<SafetyItem[]> {
  try {
    if (cachedSafetyItems !== null) {
      return cachedSafetyItems;
    }

    const allItems = await readInfoItemsFromFile();
    // Filter items that start with "safety/" and strip the prefix
    const safetyItems = allItems
      .filter((item) => item.slug.startsWith('safety/'))
      .map((item) => ({
        slug: item.slug.replace(/^safety\//, ''),
        title: item.title,
        content: item.content,
      }));

    cachedSafetyItems = safetyItems;
    return safetyItems;
  } catch (error) {
    console.error('Error fetching safety:', error);
    return [];
  }
}
