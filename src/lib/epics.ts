import { promises as fs } from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { type ContentItem } from '@/lib/info';

export type EpicItem = ContentItem;

let cachedEpicItems: EpicItem[] | null = null;

async function readEpicItemsFromFile(): Promise<EpicItem[]> {
  const filePath = path.join(process.cwd(), 'public', 'epics.json.gz');
  const compressed = await fs.readFile(filePath);
  const file = gunzipSync(compressed).toString('utf8');
  const epicItems = JSON.parse(file) as EpicItem[];

  if (!Array.isArray(epicItems)) {
    throw new Error('epics.json.gz format is invalid');
  }

  return epicItems;
}

export async function getEpicItems(): Promise<EpicItem[]> {
  try {
    if (cachedEpicItems !== null) {
      return cachedEpicItems;
    }

    const epicItems = await readEpicItemsFromFile();
    cachedEpicItems = epicItems;

    return epicItems;
  } catch (error) {
    console.error('Error fetching epics:', error);
    return [];
  }
}
