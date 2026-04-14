import { promises as fs } from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

export interface ImageCollectionItem {
  path: string;
  sourcePath: string;
  imageUrl: string;
  tier?: string;
  tags?: string[];
}

export interface ImageCollection {
  id: string;
  label: string;
  status?: string;
  usage?: string[];
  doNotUseFor?: string[];
  items: ImageCollectionItem[];
}

export interface RaceImageItem {
  path: string;
  sourcePath: string;
  imageUrl: string;
  confidence?: string;
  source?: string;
}

export interface RaceImagesBySlugEntry {
  hero: RaceImageItem[];
  gallery: RaceImageItem[];
}

interface ImageCollectionsPayload {
  version: number;
  generatedAt?: string;
  source?: {
    repo?: string;
    sha?: string;
    baseUrl?: string;
    missing?: boolean;
  };
  collections: ImageCollection[];
  raceImagesBySlug?: Record<string, RaceImagesBySlugEntry>;
}

let cachedPayload: ImageCollectionsPayload | null = null;

async function readImageCollectionsFromFile(): Promise<ImageCollectionsPayload> {
  const filePath = path.join(process.cwd(), 'public', 'image-collections.json.gz');
  const compressed = await fs.readFile(filePath);
  const file = gunzipSync(compressed).toString('utf8');
  const payload = JSON.parse(file) as ImageCollectionsPayload;

  if (!payload || !Array.isArray(payload.collections)) {
    throw new Error('image-collections.json.gz format is invalid');
  }

  return payload;
}

export async function getImageCollectionsPayload(): Promise<ImageCollectionsPayload> {
  try {
    if (cachedPayload !== null) {
      return cachedPayload;
    }

    const payload = await readImageCollectionsFromFile();
    cachedPayload = payload;
    return payload;
  } catch (error) {
    console.warn('Could not load image collections:', error);
    return { version: 1, collections: [] };
  }
}

export async function getImageCollectionById(id: string): Promise<ImageCollection | null> {
  const payload = await getImageCollectionsPayload();
  return payload.collections.find((collection) => collection.id === id) ?? null;
}

export async function getRaceImagesBySlug(slug: string): Promise<RaceImagesBySlugEntry | null> {
  const payload = await getImageCollectionsPayload();
  const raceImagesBySlug = payload.raceImagesBySlug;

  if (!raceImagesBySlug) {
    return null;
  }

  if (raceImagesBySlug[slug]) {
    return raceImagesBySlug[slug];
  }

  const lowerSlug = slug.toLowerCase();
  const matchedKey = Object.keys(raceImagesBySlug).find((key) => key.toLowerCase() === lowerSlug);

  return matchedKey ? raceImagesBySlug[matchedKey] : null;
}