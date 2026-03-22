import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface InfoItem {
  slug: string;
  title: string;
  content: string;
}

let cachedInfoItems: InfoItem[] | null = null;

async function readInfoItemsFromFile(): Promise<InfoItem[]> {
  const filePath = path.join(process.cwd(), 'public', 'info.json');
  const file = await fs.readFile(filePath, 'utf8');
  const infoItems = JSON.parse(file) as InfoItem[];

  if (!Array.isArray(infoItems)) {
    throw new Error('info.json format is invalid');
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
