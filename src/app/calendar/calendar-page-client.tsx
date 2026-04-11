'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchGzipJson } from '@/lib/client-results-fetch';

type CalendarEntry = {
  Date: string;
  raceName: string;
  raceId?: string;
  distance?: number;
  climb?: number;
};

function isPastRace(dateString: string): boolean {
  const raceDate = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(raceDate.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return raceDate < today;
}

export default function CalendarPageClient() {
  const [entries, setEntries] = useState<CalendarEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadCalendarData() {
      setIsLoading(true);
      setErrorMessage(null);
      setIsNotFound(false);

      try {
        const result = await fetchGzipJson<CalendarEntry[]>('/calendar.json.gz');

        if (!isCancelled) {
          if (result.status === 'ok') {
            setEntries(result.data);
          } else if (result.status === 'not-found') {
            setIsNotFound(true);
            setEntries(null);
          } else {
            throw result.error;
          }
        }
      } catch (error) {
        console.error('Failed to fetch calendar data on client:', error);
        if (!isCancelled) {
          setErrorMessage('Failed to load calendar data. Please try again later.');
          setEntries(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadCalendarData();
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12 dark:from-slate-950 dark:to-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          <ol role="list" className="flex flex-wrap gap-2">
            <li>
              <Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-slate-900 dark:text-slate-100" aria-current="page">
              Calendar
            </li>
          </ol>
        </nav>

        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-slate-50">Race Calendar</h1>

        {isLoading ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-slate-900">
            <p className="text-gray-600 dark:text-slate-300">Loading calendar...</p>
          </div>
        ) : isNotFound ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-slate-900">
            <p className="mb-4 text-gray-600 dark:text-slate-300">Calendar data not found.</p>
          </div>
        ) : errorMessage ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-slate-900">
            <p className="mb-2 font-semibold text-red-600">{errorMessage}</p>
            <p className="mb-4 text-gray-600 dark:text-slate-300">Try again in a few minutes.</p>
          </div>
        ) : entries && entries.length > 0 ? (
          <div className="overflow-x-auto rounded-lg bg-white shadow-md dark:bg-slate-900">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Race</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Distance</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Climb</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {entries.map((entry, index) => {
                  const pastRace = isPastRace(entry.Date);

                  return (
                  <tr
                    key={`${entry.Date}-${entry.raceId ?? entry.raceName}-${index}`}
                    className={pastRace
                      ? 'bg-stone-100 hover:bg-stone-200 dark:bg-slate-800/80 dark:hover:bg-slate-800'
                      : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60'}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{entry.Date}</td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                      {entry.raceId ? (
                        <Link href={`/races/${encodeURIComponent(entry.raceId)}`} className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
                          {entry.raceName}
                        </Link>
                      ) : (
                        entry.raceName
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-200">
                      {entry.distance !== undefined ? `${entry.distance.toFixed(1)} km` : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-200">
                      {entry.climb !== undefined ? `${entry.climb} m` : '—'}
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-slate-900">
            <p className="text-gray-600 dark:text-slate-300">No calendar entries available.</p>
          </div>
        )}
      </div>
    </main>
  );
}
