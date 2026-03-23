import Link from 'next/link';
import { loadRaceInfos } from '@/lib/results-data';
import RaceListFilter from '@/app/races/race-list-filter';

export default async function RaceListPage() {
  const races = await loadRaceInfos().catch((error) => {
    console.error('Failed to load races list:', error);
    return [];
  });

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
          <RaceListFilter races={races} />
        )}
      </div>
    </main>
  );
}
