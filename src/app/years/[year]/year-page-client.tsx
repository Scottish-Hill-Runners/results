'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import RaceResultsDataTable from '@/components/RaceResultsDataTable';
import type { YearRaceResult } from '@/types/datatable';

interface YearPageClientProps {
  year: string;
}

export default function YearPageClient({ year }: YearPageClientProps) {
  const [results, setResults] = useState<YearRaceResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadYearData() {
      setIsLoading(true);
      setErrorMessage(null);
      setIsNotFound(false);

      try {
        const response = await fetch(`/api/years/${encodeURIComponent(year)}`, {
          cache: 'force-cache',
        });

        if (response.status === 404) {
          if (!isCancelled) {
            setIsNotFound(true);
            setResults(null);
          }
          return;
        }

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const nextResults = (await response.json()) as YearRaceResult[];
        if (!isCancelled) {
          setResults(nextResults);
        }
      } catch (error) {
        console.error('Failed to fetch year data on client:', error);
        if (!isCancelled) {
          setErrorMessage('Failed to load year results. Please try again later.');
          setResults(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadYearData();
    return () => {
      isCancelled = true;
    };
  }, [year]);

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
              {year} Results
            </li>
          </ol>
        </nav>

        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-slate-50">{year} Results</h1>

        {isLoading ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-slate-900">
            <p className="text-gray-600 dark:text-slate-300">Loading year results...</p>
          </div>
        ) : isNotFound ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-slate-900">
            <p className="mb-4 text-gray-600 dark:text-slate-300">No results found for {year}.</p>
            <Link
              href="/races"
              className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Races
            </Link>
          </div>
        ) : errorMessage ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-slate-900">
            <p className="mb-2 font-semibold text-red-600">{errorMessage}</p>
            <p className="mb-4 text-gray-600 dark:text-slate-300">Try again in a few minutes.</p>
          </div>
        ) : results ? (
          <RaceResultsDataTable data={results} showRaceColumn />
        ) : (
          <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-slate-900">
            <p className="text-gray-600 dark:text-slate-300">No year data available.</p>
          </div>
        )}
      </div>
    </main>
  );
}
