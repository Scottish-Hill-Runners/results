import { promises as fs } from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { type AccordionItem } from '@/app/info/info-accordion';

export type InfoItem = AccordionItem;

let cachedInfoItems: InfoItem[] | null = null;

async function readInfoItemsFromFile(): Promise<InfoItem[]> {
  const filePath = path.join(process.cwd(), 'public', 'info.json.gz');
  const compressed = await fs.readFile(filePath);
  const file = gunzipSync(compressed).toString('utf8');
  const infoItems = JSON.parse(file) as InfoItem[];

  if (!Array.isArray(infoItems)) {
    throw new Error('info.json.gz format is invalid');
  }

  return infoItems;
}

export async function getInfoItems(): Promise<InfoItem[]> {
  try {
    if (cachedInfoItems !== null) {
      return cachedInfoItems;
    }

    const infoItems = await readInfoItemsFromFile();
    cachedInfoItems = infoItems;

    return infoItems;
  } catch (error) {
    console.error('Error fetching info:', error);
    return [];
  }
}
