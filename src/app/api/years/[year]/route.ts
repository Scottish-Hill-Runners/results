import { NextResponse } from 'next/server';
import { loadAllRaces, loadAvailableYears, loadYearResults } from '@/lib/results-data';
import type { YearRaceResult } from '@/types/datatable';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const years = await loadAvailableYears().catch(() => [] as string[]);
  return years.map((year) => ({ year }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ year: string }> }
) {
  const { year } = await params;

  try {
    const allRaces = await loadAllRaces();
    const results = await loadYearResults(year);
    const enriched: YearRaceResult[] = results.map((result) => ({
      ...result,
      raceTitle: allRaces[result.raceId]?.title ?? result.raceId,
    }));
    return NextResponse.json(enriched);
  } catch (error) {
    if ((error as Error).message === 'Invalid year') {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
    }

    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json({ error: 'Year not found' }, { status: 404 });
    }

    console.error('Failed to load year results for API route', year, error);
    return NextResponse.json({ error: 'Failed to load year results' }, { status: 500 });
  }
}
