import { promises as fs } from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { type AccordionItem } from '@/app/info/info-accordion';

export type SafetyItem = AccordionItem;

let cachedSafetyItems: SafetyItem[] | null = null;

async function readSafetyItemsFromFile(): Promise<SafetyItem[]> {
  const filePath = path.join(process.cwd(), 'public', 'safety.json.gz');
  const compressed = await fs.readFile(filePath);
  const file = gunzipSync(compressed).toString('utf8');
  const safetyItems = JSON.parse(file) as SafetyItem[];

  if (!Array.isArray(safetyItems)) {
    throw new Error('safety.json.gz format is invalid');
  }

  return safetyItems;
}

export async function getSafetyItems(): Promise<SafetyItem[]> {
  try {
    if (cachedSafetyItems !== null) {
      return cachedSafetyItems;
    }

    const safetyItems = await readSafetyItemsFromFile();
    cachedSafetyItems = safetyItems;

    return safetyItems;
  } catch (error) {
    console.error('Error fetching safety:', error);
    return [];
  }
}
