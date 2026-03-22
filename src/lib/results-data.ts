import { promises as fs } from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import type { DataRow, RaceInfo } from '@/types/datatable';

function resultsPath(fileName: string): string {
  return path.join(process.cwd(), 'public', 'results', fileName);
}

async function readJsonGzip<T>(fileName: string): Promise<T> {
  const buffer = await fs.readFile(resultsPath(fileName));
  const decompressed = gunzipSync(buffer).toString('utf8');
  return JSON.parse(decompressed) as T;
}

export async function loadRaceInfos(): Promise<RaceInfo[]> {
  const races = await readJsonGzip<RaceInfo[]>('races.json.gz');
  return races.sort((a, b) => a.title.localeCompare(b.title));
}

export async function loadRaceResults(raceId: string): Promise<DataRow[]> {
  const safeRaceId = raceId.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!safeRaceId) {
    throw new Error('Invalid race id');
  }

  return readJsonGzip<DataRow[]>(`${safeRaceId}-results.json.gz`);
}
