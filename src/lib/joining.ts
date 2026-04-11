import { promises as fs } from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

export interface JoiningItem {
  slug: string;
  title: string;
  content: string;
}

let cachedJoiningItems: JoiningItem[] | null = null;

async function readJoiningItemsFromFile(): Promise<JoiningItem[]> {
  const filePath = path.join(process.cwd(), 'public', 'joining.json.gz');
  const compressed = await fs.readFile(filePath);
  const file = gunzipSync(compressed).toString('utf8');
  const joiningItems = JSON.parse(file) as JoiningItem[];

  if (!Array.isArray(joiningItems)) {
    throw new Error('joining.json.gz format is invalid');
  }

  return joiningItems;
}

export async function getJoiningItems(): Promise<JoiningItem[]> {
  try {
    if (cachedJoiningItems !== null) {
      return cachedJoiningItems;
    }

    const joiningItems = await readJoiningItemsFromFile();
    cachedJoiningItems = joiningItems;

    return joiningItems;
  } catch (error) {
    console.error('Error fetching joining:', error);
    return [];
  }
}