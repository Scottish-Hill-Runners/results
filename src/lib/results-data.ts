import { promises as fs } from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import type { AllRaceData, RaceData } from '@/types/datatable';

function resultsPath(fileName: string): string {
  return path.join(process.cwd(), 'public', 'results', fileName);
}

async function readJsonGzip<T>(fileName: string): Promise<T> {
  const buffer = await fs.readFile(resultsPath(fileName));
  const decompressed = gunzipSync(buffer).toString('utf8');
  return JSON.parse(decompressed) as T;
}

export async function loadAllRaces(): Promise<AllRaceData> {
  return await readJsonGzip<AllRaceData>('races.json.gz');
}

export async function loadRaceResults(raceId: string): Promise<RaceData> {
  const safeRaceId = raceId.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!safeRaceId) {
    throw new Error('Invalid race id');
  }

  return readJsonGzip<RaceData>(`${safeRaceId}.json.gz`);
}
