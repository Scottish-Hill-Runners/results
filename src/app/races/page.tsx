import Link from 'next/link';
import { RaceInfo } from '@/types/datatable';

async function fetchRaceInfos(): Promise<RaceInfo[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/races`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch races list: ${response.statusText}`);
    }

    const races = (await response.json()) as RaceInfo[];
    return races;
  } catch (error) {
    console.error('Failed to load races list:', error);
    return [];
  }
}

export default async function RaceListPage() {
  const races = await fetchRaceInfos();

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500">
          <ol role="list" className="flex flex-wrap gap-2">
            <li>
              <Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-slate-900">Races</li>
          </ol>
        </nav>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Races</h1>
        {races.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No races available right now.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {races.map((race) => (
              <li key={race.raceId}>
                <Link
                  href={`/races/${encodeURIComponent(race.raceId)}`}
                  className="block px-4 py-3 bg-white border border-gray-200 rounded-lg text-blue-600 hover:bg-gray-50"
                >
                  <div className="font-semibold">{race.title}</div>
                  <div className="text-sm text-gray-600">{race.venue} • {race.distance}km</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
