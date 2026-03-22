import RaceResultsDataTable from '@/components/RaceResultsDataTable';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadRaceInfos, loadRaceResults } from '@/lib/results-data';
import type { DataRow, RaceInfo } from '@/types/datatable';

export async function generateStaticParams() {
  const raceInfos = await loadRaceInfos().catch(() => [] as RaceInfo[]);
  return raceInfos.map((race) => ({ raceId: race.raceId }));
}

export default async function RacePage({ params }: { params: Promise<{ raceId: string }> }) {
  const { raceId } = await params;

  let raceInfos: RaceInfo[] = [];
  let listError: string | null = null;

  try {
    raceInfos = await loadRaceInfos();
  } catch (error) {
    console.error('Error fetching race list:', error);
    listError = 'Unable to load race list at the moment. Please try again later.';
  }

  if (listError) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-red-600 font-semibold mb-2">{listError}</p>
            <p className="text-gray-600 mb-4">You can still try again or go back to the races list.</p>
            <a
              href="/races"
              className="inline-block px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Back to Races
            </a>
          </div>
        </div>
      </main>
    );
  }

  const race = raceInfos.find((r) => r.raceId === raceId);
  if (!race) {
    notFound();
  }

  let data: DataRow[];
  let resultsError: string | null = null;

  try {
    data = await loadRaceResults(raceId);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      notFound();
    }
    console.error('Error loading race results for', raceId, error);
    resultsError = 'Failed to load results. Please try again later.';
    data = [];
  }

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500">
          <ol role="list" className="flex flex-wrap gap-2">
            <li>
              <Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/races" className="text-blue-600 hover:text-blue-800">Races</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-slate-900" aria-current="page">
              {race!.title}
            </li>
          </ol>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">{race!.title} Results</h1>

        {resultsError ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-red-600 font-semibold mb-2">{resultsError}</p>
            <p className="text-gray-600 mb-4">Try again in a few minutes or choose another race.</p>
            <a
              href="/races"
              className="inline-block px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Back to Races
            </a>
          </div>
        ) : data.length > 0 ? (
          <RaceResultsDataTable key={raceId} data={data} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No results available for {race!.title}.</p>
          </div>
        )}
      </div>
    </main>
  );
}

