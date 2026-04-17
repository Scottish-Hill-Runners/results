import type { RaceResult } from '@/types/datatable';

const RESULTS_EDIT_BASE_URL = 'https://admin.scottishhillrunners.uk/results/edit';

export function normalizeResultYear(rawYear: string): string | null {
  const match = rawYear.match(/\d{4}/);
  return match ? match[0] : null;
}

export function buildResultsEditUrl(raceId: string, year: string): string {
  const params = new URLSearchParams({ raceId, year });
  return `${RESULTS_EDIT_BASE_URL}?${params.toString()}`;
}

export function getLatestResultYear(results: RaceResult[]): string | null {
  const years = results
    .map((row) => normalizeResultYear(row.year))
    .filter((year): year is string => year !== null)
    .map((year) => Number.parseInt(year, 10))
    .filter((year) => Number.isFinite(year));

  if (years.length === 0) return null;

  return String(Math.max(...years));
}
