'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import RaceResultsDataTable from '@/components/RaceResultsDataTable';
import { fetchGzipJson } from '@/lib/client-results-fetch';
import type { RaceResult } from '@/types/datatable';

interface ChampionshipYearPageClientProps {
  series: string;
  year: string;
}

export default function ChampionshipYearPageClient({
  series,
  year,
}: ChampionshipYearPageClientProps) {
  const [results, setResults] = useState<RaceResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadChampionshipYearData() {
      setIsLoading(true);
      setErrorMessage(null);
      setIsNotFound(false);

      try {
        const result = await fetchGzipJson<RaceResult[]>(
          `/results/${encodeURIComponent(series)}-${encodeURIComponent(year)}.json.gz`
        );

        if (!isCancelled) {
          if (result.status === 'ok') {
            setResults(result.data);
          } else if (result.status === 'not-found') {
            setIsNotFound(true);
            setResults(null);
          } else {
            throw result.error;
          }
        }
      } catch (error) {
        console.error('Failed to fetch championship year data on client:', error);
        if (!isCancelled) {
          setErrorMessage('Failed to load championship results. Please try again later.');
          setResults(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadChampionshipYearData();
    return () => {
      isCancelled = true;
    };
  }, [series, year]);

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12 dark:from-slate-950 dark:to-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          <ol role="list" className="flex flex-wrap gap-2">
            <li>
              <Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/championships" className="text-blue-600 hover:text-blue-800">Championships</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/championships/${encodeURIComponent(series)}`} className="text-blue-600 hover:text-blue-800">{series}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-slate-900 dark:text-slate-100" aria-current="page">
              {year}
            </li>
          </ol>
        </nav>

        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-slate-50">{series} {year}</h1>

        {isLoading ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-slate-900">
            <p className="text-gray-600 dark:text-slate-300">Loading championship results...</p>
          </div>
        ) : isNotFound ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-slate-900">
            <p className="mb-4 text-gray-600 dark:text-slate-300">No championship results found for {series} {year}.</p>
            <Link
              href={`/championships/${encodeURIComponent(series)}`}
              className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Championship
            </Link>
          </div>
        ) : errorMessage ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-slate-900">
            <p className="mb-2 font-semibold text-red-600">{errorMessage}</p>
            <p className="mb-4 text-gray-600 dark:text-slate-300">Try again in a few minutes.</p>
          </div>
        ) : results ? (
          <RaceResultsDataTable data={results} showRaceColumn showYearFilter={false} />
        ) : (
          <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-slate-900">
            <p className="text-gray-600 dark:text-slate-300">No championship data available.</p>
          </div>
        )}
      </div>
    </main>
  );
}
